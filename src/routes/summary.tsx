import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { generateSummary } from "@/lib/ai.functions";
import { renderMarkdown } from "@/lib/markdown";
import { buildTranscript, useQuestionnaire } from "@/lib/questionnaire-store";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Discovery Summary — Jetech Discovery" },
      { name: "description", content: "AI-drafted requirements summary grouped by Confirmed, To Be Confirmed, Client to Provide and Jetech to Propose." },
      { property: "og:title", content: "Discovery Summary — Jetech Discovery" },
      { property: "og:description", content: "Turn the meeting into a structured requirements draft." },
    ],
  }),
  component: SummaryPage,
});

function SummaryPage() {
  const { state, setSummary, overall } = useQuestionnaire();
  const run = useServerFn(generateSummary);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (overall.answered === 0 && state.interview.length === 0) return toast.error("Answer some questions first.");
    setLoading(true);
    const res = await run({ data: { transcript: buildTranscript(state) } });
    setLoading(false);
    if (!res.ok) return toast.error(res.error);
    setSummary(res.summary);
  }

  function download() {
    if (!state.summary) return;
    const blob = new Blob([state.summary], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `discovery-summary-${state.meta.date || "draft"}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <AppShell>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold">Discovery summary</h1>
        <p className="mt-2 text-muted-foreground">
          A draft requirements summary built strictly from what was answered — grouped into Confirmed, To Be
          Confirmed, Client to Provide and Jetech to Propose, plus scope risks and a proposed first release.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button onClick={generate} disabled={loading} size="lg">
            {loading ? <Loader2 className="animate-spin" /> : <FileText />}
            {state.summary ? "Regenerate" : "Generate summary"}
          </Button>
          {state.summary && (
            <>
              <Button variant="outline" onClick={() => { void navigator.clipboard.writeText(state.summary!); toast.success("Copied"); }}>
                <Copy /> Copy
              </Button>
              <Button variant="outline" onClick={download}>
                <Download /> Download .md
              </Button>
            </>
          )}
        </div>
        {loading && (
          <p className="mt-4 text-sm text-muted-foreground">Writing the summary — this can take a minute…</p>
        )}
        {state.summary && (
          <article
            className="card-elevated prose-summary mt-6 p-6 sm:p-8"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(state.summary) }}
          />
        )}
      </div>
    </AppShell>
  );
}
