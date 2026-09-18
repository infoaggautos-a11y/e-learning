import { createOpenAI } from "@ai-sdk/openai";

const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

/** Captures the gateway-minted run id and resends it on follow-up calls within one request. */
export function createLovableAiGatewayRunIdFetch(initialRunId?: string | null) {
  let runId = initialRunId ?? null;
  const wrapped: typeof fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(RUN_ID_HEADER)) headers.set(RUN_ID_HEADER, runId);
    const res = await fetch(input, { ...init, headers });
    const minted = res.headers.get(RUN_ID_HEADER);
    if (minted) runId = minted;
    return res;
  };
  return { fetch: wrapped, getRunId: () => runId };
}

export function createResponsesProvider() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return { model: provider.responses("openai/gpt-6-astra"), runIdFetch };
}

export const responsesOptions = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;

/** Map gateway failures to a short, safe user-facing message. */
export function safeAiError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const status = (err as { statusCode?: number; status?: number })?.statusCode ?? (err as { status?: number })?.status;
  if (status === 402 || /402/.test(msg)) return "AI credits are exhausted. Top up your Lovable AI credits to continue.";
  if (status === 429 || /429/.test(msg)) return "The AI is rate-limited right now. Please wait a moment and try again.";
  if (status === 401 || /401/.test(msg)) return "AI is not configured correctly (missing key).";
  if (status === 403 || /403/.test(msg)) return "AI access is blocked for this workspace.";
  console.error("AI gateway error:", err);
  return "The AI request failed. Please try again.";
}
