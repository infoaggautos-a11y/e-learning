import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RotateCcw, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { interviewTurn } from "@/lib/ai.functions";
import { buildTranscript, useQuestionnaire, type ChatMessage } from "@/lib/questionnaire-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/interview")({
  head: () => ({
    meta: [
      { title: "AI Interviewer — Jetech Discovery" },
      { name: "description", content: "A conversational AI interviewer that walks the client through discovery one question at a time." },
      { property: "og:title", content: "AI Interviewer — Jetech Discovery" },
      { property: "og:description", content: "Adaptive discovery conversation for the operative training and permit platform." },
    ],
  }),
  component: InterviewPage,
});

function InterviewPage() {
  const { state, setInterview, hydrated } = useQuestionnaire();
  const turn = useServerFn(interviewTurn);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = state.interview;
  const started = useRef(false);

  async function send(next: ChatMessage[]) {
    setLoading(true);
    const res = await turn({ data: { transcript: buildTranscript(state), messages: next } });
    setLoading(false);
    if (!res.ok) return toast.error(res.error);
    setInterview([...next, { role: "assistant", content: res.reply }]);
  }

  useEffect(() => {
    if (hydrated && messages.length === 0 && !started.current) {
      started.current = true;
      void send([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  function submit() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setInterview(next);
    void send(next);
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">AI interviewer</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Answer in your own words. The interviewer asks one question at a time, probes vague answers, and skips
              anything you already wrote in the questionnaire.
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                if (window.confirm("Restart the interview? The conversation will be cleared.")) {
                  setInterview([]);
                  started.current = true;
                  void send([]);
                }
              }}
            >
              <RotateCcw /> Restart
            </Button>
          )}
        </div>

        <div className="card-elevated mt-4 flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-paper border",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="mt-3 flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type your answer… (Enter to send, Shift+Enter for a new line)"
            className="min-h-[52px] bg-card"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send">
            <Send />
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
