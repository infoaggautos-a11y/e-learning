import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquareText, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SECTIONS } from "@/lib/questionnaire-data";
import { useQuestionnaire } from "@/lib/questionnaire-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jetech Discovery — Requirements Questionnaire" },
      { name: "description", content: "Interactive, AI-assisted discovery questionnaire for the security operative training and permit platform." },
      { property: "og:title", content: "Jetech Discovery — Requirements Questionnaire" },
      { property: "og:description", content: "Answer 15 structured sections, get AI follow-ups, gap analysis and a draft requirements summary." },
    ],
  }),
  component: Index,
});

function Index() {
  const { state, setMeta, sectionProgress, overall, reset, hydrated } = useQuestionnaire();
  const firstIncomplete = SECTIONS.find((s) => {
    const p = sectionProgress(s.id);
    return p.answered < p.total;
  });

  return (
    <AppShell>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Discovery session</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Tell us exactly what you need — not what sounds impressive.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Fifteen short sections covering objectives, tenants, enrollment, learning, examinations, biometrics, the
          UPN, certificates, scale, reporting, payments, integrations, compliance and delivery. Mark each answer as
          Confirmed, To Be Confirmed, Client to Provide or Jetech to Propose. Everything is saved on this device.
        </p>

        <div className="card-elevated mt-6 grid gap-4 p-5 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="client">Client / organisation</Label>
            <Input id="client" value={state.meta.clientName} onChange={(e) => setMeta({ clientName: e.target.value })} placeholder="e.g. National Security Training Board" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project">Project name</Label>
            <Input id="project" value={state.meta.projectName} onChange={(e) => setMeta({ projectName: e.target.value })} placeholder="e.g. Operative Permit Platform" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Meeting date</Label>
            <Input id="date" type="date" value={state.meta.date} onChange={(e) => setMeta({ date: e.target.value })} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link to="/section/$id" params={{ id: firstIncomplete?.id ?? SECTIONS[0].id }}>
              {overall.answered > 0 ? "Continue questionnaire" : "Start questionnaire"} <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/interview">
              <MessageSquareText /> Talk to the AI interviewer instead
            </Link>
          </Button>
          {hydrated && overall.answered > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                if (window.confirm("Clear all answers on this device?")) reset();
              }}
            >
              <RotateCcw /> Reset
            </Button>
          )}
        </div>

        <h2 className="mt-10 text-lg font-semibold">Sections</h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {SECTIONS.map((s) => {
            const p = sectionProgress(s.id);
            const pct = p.total ? Math.round((p.answered / p.total) * 100) : 0;
            return (
              <li key={s.id}>
                <Link
                  to="/section/$id"
                  params={{ id: s.id }}
                  className="card-elevated flex items-start gap-3 p-4 transition-colors hover:border-accent"
                >
                  <span className="mt-0.5 font-serif text-lg font-semibold text-muted-foreground tabular-nums">
                    {String(s.number).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{s.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {hydrated ? `${p.answered} of ${p.total} answered` : `${p.total} questions`}
                    </span>
                    <span className="mt-2 block h-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className={cn("block h-full transition-all", pct === 100 ? "bg-success" : "bg-accent")}
                        style={{ width: `${hydrated ? pct : 0}%` }}
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
