import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCopy, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { SECTIONS, keyQuestionId, questionId } from "@/lib/questionnaire-data";
import { buildTranscript, createProjectBackup, useQuestionnaire } from "@/lib/questionnaire-store";

export const Route = createFileRoute("/handoff")({
  head: () => ({ meta: [{ title: "Submit responses - Jetech Discovery" }] }),
  component: HandoffPage,
});

function HandoffPage() {
  const { activeProject, overall } = useQuestionnaire();
  const percentage = overall.total ? Math.round((overall.answered / overall.total) * 100) : 0;
  const firstIncomplete = SECTIONS.find((section) => {
    const ids = section.questions.map((_, index) => questionId(section.id, index));
    if (section.keyQuestion) ids.unshift(keyQuestionId(section.id));
    return ids.some((id) => !activeProject.data.answers[id]?.text.trim());
  });

  function downloadSubmission() {
    const blob = new Blob([JSON.stringify(createProjectBackup(activeProject), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "operative-pathway-responses.jetech.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Response package downloaded");
  }

  return (
    <AppShell>
      <div className="max-w-2xl">
        <CheckCircle2 className="h-9 w-9 text-success" />
        <h1 className="mt-4 text-3xl font-semibold">Prepare responses</h1>
        <p className="mt-2 text-muted-foreground">
          Download the response package and return it to the Jetech team through the channel used
          for the meeting.
        </p>
        <div className="mt-6 border-y py-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Questionnaire progress</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {overall.answered} of {overall.total} questions answered
              </p>
            </div>
            <span className="text-2xl font-semibold tabular-nums">{percentage}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-accent" style={{ width: `${percentage}%` }} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" onClick={downloadSubmission}>
            <Download /> Download response package
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(buildTranscript(activeProject.data));
              toast.success("Responses copied");
            }}
          >
            <ClipboardCopy /> Copy responses
          </Button>
          {firstIncomplete && (
            <Button asChild variant="ghost">
              <Link to="/section/$id" params={{ id: firstIncomplete.id }}>
                <RotateCcw /> Continue answering
              </Link>
            </Button>
          )}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          The response package contains the questionnaire, interview, follow-up answers, and any
          generated analysis.
        </p>
      </div>
    </AppShell>
  );
}
