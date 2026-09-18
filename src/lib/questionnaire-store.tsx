import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SECTIONS, keyQuestionId, questionId, type AnswerStatus } from "./questionnaire-data";

export interface Answer {
  text: string;
  status: AnswerStatus;
}

export interface FollowUp {
  id: string;
  question: string;
  why: string;
  answer: string;
}

export interface Gap {
  sectionId: string;
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  costDriver: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface QuestionnaireState {
  meta: { clientName: string; projectName: string; date: string };
  answers: Record<string, Answer>;
  followUps: Record<string, FollowUp[]>;
  gaps: Gap[] | null;
  summary: string | null;
  interview: ChatMessage[];
}

const STORAGE_KEY = "jetech-discovery-v1";

const emptyState = (): QuestionnaireState => ({
  meta: { clientName: "", projectName: "", date: new Date().toISOString().slice(0, 10) },
  answers: {},
  followUps: {},
  gaps: null,
  summary: null,
  interview: [],
});

interface Ctx {
  state: QuestionnaireState;
  hydrated: boolean;
  setAnswer: (id: string, patch: Partial<Answer>) => void;
  setMeta: (patch: Partial<QuestionnaireState["meta"]>) => void;
  setFollowUps: (sectionId: string, items: FollowUp[]) => void;
  answerFollowUp: (sectionId: string, id: string, answer: string) => void;
  setGaps: (gaps: Gap[] | null) => void;
  setSummary: (s: string | null) => void;
  setInterview: (m: ChatMessage[]) => void;
  reset: () => void;
  sectionProgress: (sectionId: string) => { answered: number; total: number };
  overall: { answered: number; total: number };
}

const QuestionnaireContext = createContext<Ctx | null>(null);

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuestionnaireState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...emptyState(), ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const setAnswer = useCallback((id: string, patch: Partial<Answer>) => {
    setState((s) => ({
      ...s,
      answers: {
        ...s.answers,
        [id]: { text: "", status: "tbc", ...s.answers[id], ...patch },
      },
    }));
  }, []);

  const setMeta = useCallback((patch: Partial<QuestionnaireState["meta"]>) => {
    setState((s) => ({ ...s, meta: { ...s.meta, ...patch } }));
  }, []);

  const setFollowUps = useCallback((sectionId: string, items: FollowUp[]) => {
    setState((s) => ({ ...s, followUps: { ...s.followUps, [sectionId]: items } }));
  }, []);

  const answerFollowUp = useCallback((sectionId: string, id: string, answer: string) => {
    setState((s) => ({
      ...s,
      followUps: {
        ...s.followUps,
        [sectionId]: (s.followUps[sectionId] ?? []).map((f) => (f.id === id ? { ...f, answer } : f)),
      },
    }));
  }, []);

  const setGaps = useCallback((gaps: Gap[] | null) => setState((s) => ({ ...s, gaps })), []);
  const setSummary = useCallback((summary: string | null) => setState((s) => ({ ...s, summary })), []);
  const setInterview = useCallback((interview: ChatMessage[]) => setState((s) => ({ ...s, interview })), []);
  const reset = useCallback(() => setState(emptyState()), []);

  const sectionProgress = useCallback(
    (sectionId: string) => {
      const sec = SECTIONS.find((s) => s.id === sectionId);
      if (!sec) return { answered: 0, total: 0 };
      const ids = sec.questions.map((_, i) => questionId(sec.id, i));
      if (sec.keyQuestion) ids.unshift(keyQuestionId(sec.id));
      const answered = ids.filter((id) => state.answers[id]?.text.trim()).length;
      return { answered, total: ids.length };
    },
    [state.answers],
  );

  const overall = useMemo(() => {
    let answered = 0;
    let total = 0;
    for (const sec of SECTIONS) {
      const p = sectionProgress(sec.id);
      answered += p.answered;
      total += p.total;
    }
    return { answered, total };
  }, [sectionProgress]);

  const value: Ctx = {
    state,
    hydrated,
    setAnswer,
    setMeta,
    setFollowUps,
    answerFollowUp,
    setGaps,
    setSummary,
    setInterview,
    reset,
    sectionProgress,
    overall,
  };

  return <QuestionnaireContext.Provider value={value}>{children}</QuestionnaireContext.Provider>;
}

export function useQuestionnaire() {
  const ctx = useContext(QuestionnaireContext);
  if (!ctx) throw new Error("useQuestionnaire must be used within QuestionnaireProvider");
  return ctx;
}

/** Serialises everything the client has said into a plain-text transcript for the AI. */
export function buildTranscript(state: QuestionnaireState): string {
  const lines: string[] = [];
  lines.push(`Client: ${state.meta.clientName || "(not given)"}`);
  lines.push(`Project: ${state.meta.projectName || "(not given)"}`);
  for (const sec of SECTIONS) {
    lines.push(`\n## ${sec.number}. ${sec.title}`);
    const push = (q: string, id: string) => {
      const a = state.answers[id];
      lines.push(`Q: ${q}`);
      lines.push(a?.text.trim() ? `A [${a.status}]: ${a.text.trim()}` : `A: (unanswered)`);
    };
    if (sec.keyQuestion) push(`(KEY) ${sec.keyQuestion}`, keyQuestionId(sec.id));
    sec.questions.forEach((q, i) => push(q, questionId(sec.id, i)));
    for (const f of state.followUps[sec.id] ?? []) {
      lines.push(`Follow-up: ${f.question}`);
      lines.push(f.answer.trim() ? `A: ${f.answer.trim()}` : `A: (unanswered)`);
    }
  }
  if (state.interview.length) {
    lines.push(`\n## Interview transcript`);
    for (const m of state.interview) lines.push(`${m.role === "user" ? "Client" : "Interviewer"}: ${m.content}`);
  }
  return lines.join("\n");
}
