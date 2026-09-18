import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquareText, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProjectHistoryDialog } from "@/components/ProjectHistoryDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SECTIONS } from "@/lib/questionnaire-data";
import { useQuestionnaire } from "@/lib/questionnaire-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workspace")({
  head: () => ({ meta: [{ title: "Project overview - Jetech Discovery" }] }),
  component: Workspace,
});

function Workspace() {
  const { state, setMeta, sectionProgress, overall, reset, hydrated } = useQuestionnaire();
  const firstIncomplete = SECTIONS.find((section) => {
    const progress = sectionProgress(section.id);
    return progress.answered < progress.total;
  });

  return (
    <AppShell>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase text-accent">Active discovery</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          {state.meta.projectName || "Untitled discovery"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Capture the client's decisions, identify unresolved scope, and turn the meeting into an
          actionable brief. Changes are saved automatically on this device.
        </p>

        <div className="card-elevated mt-6 grid gap-4 p-5 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="client">Client / organisation</Label>
            <Input
              id="client"
              value={state.meta.clientName}
              onChange={(event) => setMeta({ clientName: event.target.value })}
              placeholder="e.g. National Security Training Board"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project">Project name</Label>
            <Input
              id="project"
              value={state.meta.projectName}
              onChange={(event) => setMeta({ projectName: event.target.value })}
              placeholder="e.g. Operative Permit Platform"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Meeting date</Label>
            <Input
              id="date"
              type="date"
              value={state.meta.date}
              onChange={(event) => setMeta({ date: event.target.value })}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link to="/section/$id" params={{ id: firstIncomplete?.id ?? SECTIONS[0]!.id }}>
              {overall.answered > 0 ? "Continue questionnaire" : "Start questionnaire"}{" "}
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/interview">
              <MessageSquareText /> AI interview
            </Link>
          </Button>
          <ProjectHistoryDialog />
          {hydrated && overall.answered > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                if (
                  window.confirm("Clear this project's answers, interview, analysis and summary?")
                )
                  reset();
              }}
            >
              <RotateCcw /> Reset responses
            </Button>
          )}
        </div>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Questionnaire</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {overall.answered} of {overall.total} questions answered
            </p>
          </div>
          <span className="text-sm font-medium tabular-nums text-accent">
            {overall.total ? Math.round((overall.answered / overall.total) * 100) : 0}%
          </span>
        </div>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {SECTIONS.map((section) => {
            const progress = sectionProgress(section.id);
            const percentage = progress.total
              ? Math.round((progress.answered / progress.total) * 100)
              : 0;
            return (
              <li key={section.id}>
                <Link
                  to="/section/$id"
                  params={{ id: section.id }}
                  className="card-elevated flex items-start gap-3 p-4 transition-colors hover:border-accent"
                >
                  <span className="mt-0.5 font-serif text-lg font-semibold text-muted-foreground tabular-nums">
                    {String(section.number).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{section.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {hydrated
                        ? `${progress.answered} of ${progress.total} answered`
                        : `${progress.total} questions`}
                    </span>
                    <span className="mt-2 block h-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className={cn(
                          "block h-full transition-all",
                          percentage === 100 ? "bg-success" : "bg-accent",
                        )}
                        style={{ width: `${hydrated ? percentage : 0}%` }}
                      />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </AppShell>
  );
}
