import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SECTIONS } from "@/lib/questionnaire-data";
import { useQuestionnaire } from "@/lib/questionnaire-store";

export const Route = createFileRoute("/client")({
  head: () => ({
    meta: [
      { title: "Requirements discovery - Jetech" },
      { name: "description", content: "Operative platform requirements questionnaire." },
    ],
  }),
  component: ClientStart,
});

function ClientStart() {
  const navigate = useNavigate();
  const { createProject } = useQuestionnaire();
  const [organisation, setOrganisation] = useState("");
  const [contactName, setContactName] = useState("");

  function begin() {
    createProject({
      name: "Operative Pathway Discovery",
      clientName: `${organisation.trim()} - ${contactName.trim()}`,
      date: new Date().toISOString().slice(0, 10),
    });
    void navigate({ to: "/section/$id", params: { id: SECTIONS[0]!.id } });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary font-serif text-xl font-semibold text-primary-foreground">
            J
          </span>
          <div>
            <p className="font-semibold">Jetech Discovery</p>
            <p className="text-sm text-muted-foreground">Operative Pathway</p>
          </div>
        </div>
        <div className="mt-12">
          <p className="text-xs font-semibold uppercase text-accent">Requirements discovery</p>
          <h1 className="mt-2 text-4xl font-semibold">Help us prepare for our meeting.</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Your responses will help the team distinguish confirmed requirements from open decisions
            and focus the meeting on the areas that affect scope, delivery, and cost.
          </p>
        </div>
        <form
          className="card-elevated mt-8 space-y-5 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            begin();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="organisation">Organisation</Label>
            <Input
              id="organisation"
              value={organisation}
              onChange={(event) => setOrganisation(event.target.value)}
              placeholder="Organisation name"
              autoFocus
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-name">Your name</Label>
            <Input
              id="contact-name"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!organisation.trim() || !contactName.trim()}
          >
            Begin questionnaire <ArrowRight />
          </Button>
        </form>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Responses are saved in this browser until the response package is downloaded.
        </p>
      </div>
    </main>
  );
}
