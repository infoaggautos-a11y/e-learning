import { createServerFn } from "@tanstack/react-start";
import { streamText, Output } from "ai";
import { z } from "zod";

const CONTEXT = `You are a senior solutions consultant at Jetech, an IT company running a discovery session with a client who wants a multi-tenant training, examination, biometric proctoring and operative-permit (UPN) platform for security operatives in Nigeria.
The goal of discovery is NOT to impress with jargon. It is to find out exactly what the client wants, what they have not thought through, what is mandatory versus optional, and what determines cost.
Speak plainly to a non-technical client. Be concise and specific. Never quote prices.`;

const FollowUpInput = z.object({
  sectionTitle: z.string(),
  sectionIntro: z.string(),
  qa: z.string().min(1),
});

export const suggestFollowUps = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => FollowUpInput.parse(input))
  .handler(async ({ data }) => {
    const { createResponsesProvider, responsesOptions, safeAiError } = await import("./ai-gateway.server");
    try {
      const { model } = createResponsesProvider();
      const result = streamText({
        model,
        output: Output.object({
          schema: z.object({
            followUps: z
              .array(
                z.object({
                  question: z.string().describe("A probing follow-up question to ask the client, in plain language"),
                  why: z.string().describe("One sentence on why this matters for scope, risk or cost"),
                }),
              )
              .describe("3 to 5 follow-up questions"),
          }),
        }),
        system: CONTEXT,
        prompt: `Section: ${data.sectionTitle}\nPurpose: ${data.sectionIntro}\n\nAnswers so far:\n${data.qa}\n\nBased on what the client answered (and did not answer), propose 3–5 follow-up questions that uncover hidden requirements, contradictions, or cost drivers. Do not repeat questions already asked verbatim. Prioritise the vaguest or highest-impact answers.`,
        providerOptions: responsesOptions,
      });
      const out = await result.output;
      return { ok: true as const, followUps: out.followUps };
    } catch (err) {
      return { ok: false as const, error: safeAiError(err) };
    }
  });

const TranscriptInput = z.object({ transcript: z.string().min(1) });

export const flagGaps = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranscriptInput.parse(input))
  .handler(async ({ data }) => {
    const { createResponsesProvider, responsesOptions, safeAiError } = await import("./ai-gateway.server");
    try {
      const { model } = createResponsesProvider();
      const result = streamText({
        model,
        output: Output.object({
          schema: z.object({
            gaps: z.array(
              z.object({
                sectionId: z
                  .string()
                  .describe(
                    "One of: objective, multi-tenant, enrollment, learning, question-bank, exam-rules, biometrics, upn, certificate, scale, reporting, payments, integrations, compliance, delivery",
                  ),
                severity: z.enum(["high", "medium", "low"]),
                title: z.string().describe("Short headline of the gap or risk"),
                detail: z.string().describe("Two or three sentences: what is unclear, why it matters, what to ask next"),
                costDriver: z.boolean().describe("True if this materially changes engineering effort or cost"),
              }),
            ),
          }),
        }),
        system: CONTEXT,
        prompt: `Here is the full discovery transcript so far:\n\n${data.transcript}\n\nReview it as a scope reviewer. List the most important gaps, vague answers, contradictions, and scope risks (8 to 15 items). Pay particular attention to: content ownership vs platform build, the 1,500-questions-per-module claim, what "biometric" means, who has authority to issue a UPN, payments, and anything the client answered with "yes" without specifics. Order by severity.`,
        providerOptions: responsesOptions,
      });
      const out = await result.output;
      return { ok: true as const, gaps: out.gaps };
    } catch (err) {
      return { ok: false as const, error: safeAiError(err) };
    }
  });

export const generateSummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranscriptInput.parse(input))
  .handler(async ({ data }) => {
    const { createResponsesProvider, responsesOptions, safeAiError } = await import("./ai-gateway.server");
    try {
      const { model } = createResponsesProvider();
      const result = streamText({
        model,
        system: CONTEXT,
        prompt: `Here is the full discovery transcript:\n\n${data.transcript}\n\nWrite a structured Discovery Summary / draft Software Requirements Summary in Markdown for Jetech's internal use and to send back to the client for confirmation. Use these headings exactly:
# Discovery Summary
## 1. Business objective & context
## 2. Users, tenants & organisational model
## 3. Functional scope (grouped by area)
## 4. Confirmed requirements
## 5. To be confirmed
## 6. Client to provide
## 7. Jetech to propose
## 8. Key scope risks & cost drivers
## 9. Proposed MVP (first release)
## 10. Open questions for next meeting

Base every statement strictly on the transcript. Where nothing was said, write "Not discussed". Keep it under 1,200 words. Use bullet points. Do not include any pricing.`,
        providerOptions: responsesOptions,
      });
      const text = await result.text;
      return { ok: true as const, summary: text.trim() || "The AI returned no text. Please try again." };
    } catch (err) {
      return { ok: false as const, error: safeAiError(err) };
    }
  });

const InterviewInput = z.object({
  transcript: z.string(),
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).max(80),
});

export const interviewTurn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InterviewInput.parse(input))
  .handler(async ({ data }) => {
    const { createResponsesProvider, responsesOptions, safeAiError } = await import("./ai-gateway.server");
    try {
      const { model } = createResponsesProvider();
      const result = streamText({
        model,
        system: `${CONTEXT}

You are running the discovery as a friendly conversational interviewer. Rules:
- Ask ONE question at a time. Keep each message under 80 words.
- Work through these 15 areas roughly in order, but skip anything the client has already answered in the written questionnaire (provided below) and adapt to what they say: business objective; multi-tenancy; candidate enrollment & identity; learning structure & content ownership; the "1,500 questions per module" question bank; examination rules; biometrics; UPN authority & lifecycle; certificate & QR verification; scale & infrastructure; admin & reporting; payments; integrations; ownership, security & compliance; commercial & delivery.
- When an answer is vague ("yes", "lots", "the usual"), gently probe for specifics or numbers before moving on.
- When you learn something with big cost or scope impact, briefly say so in one sentence, then continue.
- Occasionally reflect back what you understood in one line to confirm.
- On the first turn, greet the client briefly and ask the opening question: to walk through what happens today from the moment someone wants to become an operative until they receive their permit.
- When all areas are covered, close by asking: if only five capabilities could ship in the first release, which five would make the project a success?

Written questionnaire answers so far:
${data.transcript || "(none yet)"}`,
        messages:
          data.messages.length > 0
            ? data.messages
            : [{ role: "user" as const, content: "Hello, we're ready to start the discovery conversation." }],
        providerOptions: responsesOptions,
      });
      const text = await result.text;
      return { ok: true as const, reply: text.trim() || "Could you tell me a little more about that?" };
    } catch (err) {
      return { ok: false as const, error: safeAiError(err) };
    }
  });
