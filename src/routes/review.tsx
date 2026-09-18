import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { flagGaps } from "@/lib/ai.functions";
import { getSection } from "@/lib/questionnaire-data";
import { buildTranscript, useQuestionnaire } from "@/lib/questionnaire-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Gaps & Risks — Jetech Discovery" },
      { name: "description", content: "AI review of the discovery answers: vague responses, contradictions, scope risks and cost drivers." },
      { property: "og:title", content: "Gaps & Risks — Jetech Discovery" },
      { property: "og:description", content: "Find what the client has not thought through before quoting." },
    ],
  }),
  component: ReviewPage,
});

const SEV: Record<string, string> = {
  high: "border-destructive/40 bg-destructive/5",
  medium: "border-warning/50 bg-warning/10",
  low: "border-border bg-card",
};
const SEV_DOT: Record<string, string> = { high: "bg-destructive", medium: "bg-warning", low: "bg-muted-foreground" };

function ReviewPage() {
  const { state, setGaps, overall } = useQuestionnaire();
  const run = useServerFn(flagGaps);
  const [loading, setLoading] = useState(false);

  async function analyse() {
    if (overall.answered === 0 && state.interview.length === 0) return toast.error("Answer some questions first.");
    setLoading(true);
    const res = await run({ data: { transcript: buildTranscript(state) } });
    setLoading(false);
    if (!res.ok) return toast.error(res.error);
    setGaps(res.gaps);
  }

  return (
    <AppShell>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold">Gaps & risks</h1>
        <p className="mt-2 text-muted-foreground">
          The AI reviews everything answered so far and flags vague answers, contradictions, and the items that
          decide whether this is an LMS with quizzes or a nationwide proctoring and permit infrastructure.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <Button onClick={analyse} disabled={loading} size="lg">
            {loading ? <Loader2 className="animate-spin" /> : <ShieldAlert />}
            {state.gaps ? "Re-run analysis" : "Analyse answers"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {overall.answered} of {overall.total} answered
          </span>
        </div>

        {state.gaps && state.gaps.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">No gaps flagged.</p>
        )}
        {state.gaps && state.gaps.length > 0 && (
          <ol className="mt-6 space-y-3">
            {state.gaps.map((g, i) => {
              const sec = getSection(g.sectionId);
              return (
                <li key={i} className={cn("rounded-lg border p-4", SEV[g.severity] ?? SEV.low)}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", SEV_DOT[g.severity])} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {g.severity}
                    </span>
                    {g.costDriver && (
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        Cost driver
                      </span>
                    )}
                    {sec && (
                      <Link
                        to="/section/$id"
                        params={{ id: sec.id }}
                        className="ml-auto text-xs text-accent underline-offset-2 hover:underline"
                      >
                        Go to §{sec.number} {sec.title}
                      </Link>
                    )}
                  </div>
                  <p className="mt-2 font-medium">{g.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{g.detail}</p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </AppShell>
  );
}
