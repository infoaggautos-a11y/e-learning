import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { StatusPicker } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { suggestFollowUps } from "@/lib/ai.functions";
import { SECTIONS, getSection, keyQuestionId, questionId } from "@/lib/questionnaire-data";
import { useQuestionnaire, type FollowUp } from "@/lib/questionnaire-store";

export const Route = createFileRoute("/section/$id")({
  loader: ({ params }) => {
    const section = getSection(params.id);
    if (!section) throw notFound();
    return { section };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.section.number}. ${loaderData?.section.title} — Jetech Discovery` },
      { name: "description", content: loaderData?.section.intro ?? "Discovery questionnaire section" },
      { property: "og:title", content: `${loaderData?.section.title} — Jetech Discovery` },
      { property: "og:description", content: loaderData?.section.intro ?? "" },
    ],
  }),
  component: SectionPage,
});

function QuestionField({ id, question, emphasis }: { id: string; question: string; emphasis?: boolean }) {
  const { state, setAnswer } = useQuestionnaire();
  const a = state.answers[id] ?? { text: "", status: "tbc" as const };
  return (
    <div className={emphasis ? "card-elevated border-accent/50 bg-accent/5 p-4" : "border-b py-4 last:border-0"}>
      {emphasis && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-accent">Key question</p>}
      <label htmlFor={id} className={emphasis ? "font-serif text-lg font-medium" : "text-sm font-medium"}>
        {question}
      </label>
      <Textarea
        id={id}
        value={a.text}
        onChange={(e) => setAnswer(id, { text: e.target.value })}
        placeholder="Type the client's answer…"
        className="mt-2 min-h-[72px] bg-card"
      />
      <div className="mt-2">
        <StatusPicker value={a.status} onChange={(status) => setAnswer(id, { status })} />
      </div>
    </div>
  );
}

function SectionPage() {
  const { section } = Route.useLoaderData();
  const { state, setFollowUps, answerFollowUp } = useQuestionnaire();
  const suggest = useServerFn(suggestFollowUps);
  const [loading, setLoading] = useState(false);
  const followUps = state.followUps[section.id] ?? [];

  const idx = SECTIONS.findIndex((s) => s.id === section.id);
  const prev = SECTIONS[idx - 1];
  const next = SECTIONS[idx + 1];

  async function askAi() {
    const lines: string[] = [];
    const push = (q: string, id: string) => {
      const a = state.answers[id];
      lines.push(`Q: ${q}\nA: ${a?.text.trim() ? `[${a.status}] ${a.text.trim()}` : "(unanswered)"}`);
    };
    if (section.keyQuestion) push(section.keyQuestion, keyQuestionId(section.id));
    section.questions.forEach((q, i) => push(q, questionId(section.id, i)));
    followUps.forEach((f) => lines.push(`Follow-up: ${f.question}\nA: ${f.answer || "(unanswered)"}`));

    setLoading(true);
    const res = await suggest({ data: { sectionTitle: section.title, sectionIntro: section.intro, qa: lines.join("\n\n") } });
    setLoading(false);
    if (!res.ok) return toast.error(res.error);
    const items: FollowUp[] = res.followUps.map((f, i) => ({ id: `${Date.now()}-${i}`, question: f.question, why: f.why, answer: "" }));
    setFollowUps(section.id, [...followUps, ...items]);
    toast.success(`${items.length} follow-up questions added`);
  }

  return (
    <AppShell>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Section {section.number} of {SECTIONS.length}
        </p>
        <h1 className="mt-1 text-3xl font-semibold">{section.title}</h1>
        <p className="mt-2 text-muted-foreground">{section.intro}</p>
        {section.note && <p className="mt-2 text-sm italic text-accent">{section.note}</p>}

        <div className="mt-6 space-y-4">
          {section.keyQuestion && <QuestionField id={keyQuestionId(section.id)} question={section.keyQuestion} emphasis />}
          <div className="card-elevated px-4">
            {section.questions.map((q, i) => (
              <QuestionField key={i} id={questionId(section.id, i)} question={q} />
            ))}
          </div>
        </div>

        <div className="card-elevated mt-6 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="h-4 w-4 text-accent" /> AI follow-up questions
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The AI reads this section's answers and proposes probing questions to uncover hidden scope and cost.
              </p>
            </div>
            <Button onClick={askAi} disabled={loading} variant={followUps.length ? "outline" : "default"}>
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {followUps.length ? "Suggest more" : "Suggest follow-ups"}
            </Button>
          </div>
          {followUps.length > 0 && (
            <ol className="mt-4 space-y-4">
              {followUps.map((f, i) => (
                <li key={f.id} className="rounded-md border bg-paper p-4">
                  <p className="text-sm font-medium">
                    <span className="mr-2 text-muted-foreground tabular-nums">{i + 1}.</span>
                    {f.question}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Why it matters: {f.why}</p>
                  <Textarea
                    value={f.answer}
                    onChange={(e) => answerFollowUp(section.id, f.id, e.target.value)}
                    placeholder="Client's answer…"
                    className="mt-2 min-h-[60px] bg-card"
                  />
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          {prev ? (
            <Button asChild variant="ghost">
              <Link to="/section/$id" params={{ id: prev.id }}>
                <ArrowLeft /> {prev.title}
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button asChild>
              <Link to="/section/$id" params={{ id: next.id }}>
                {next.title} <ArrowRight />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/review">
                Review gaps & risks <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
