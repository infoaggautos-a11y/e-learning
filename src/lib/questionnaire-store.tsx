import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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

export interface ProjectSnapshot {
  id: string;
  label: string;
  createdAt: string;
  data: QuestionnaireState;
}

export interface DiscoveryProject {
  id: string;
  name: string;
  clientName: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  snapshots: ProjectSnapshot[];
  data: QuestionnaireState;
}

export interface ProjectBackup {
  format: "jetech-discovery-project";
  version: 1;
  exportedAt: string;
  project: Pick<DiscoveryProject, "name" | "clientName" | "snapshots" | "data">;
}

interface PortfolioState {
  activeProjectId: string;
  projects: DiscoveryProject[];
}

const STORAGE_KEY = "jetech-discovery-projects-v2";
const LEGACY_STORAGE_KEY = "jetech-discovery-v1";

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
  projects: DiscoveryProject[];
  activeProject: DiscoveryProject;
  hydrated: boolean;
  createProject: (input: { name: string; clientName?: string; date?: string }) => string;
  selectProject: (id: string) => void;
  duplicateProject: (id: string) => string | null;
  archiveProject: (id: string, archived: boolean) => void;
  deleteProject: (id: string) => void;
  importProject: (input: unknown) => string;
  createSnapshot: (label?: string) => string;
  restoreSnapshot: (snapshotId: string) => void;
  deleteSnapshot: (snapshotId: string) => void;
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

function createProjectRecord(
  input: { name?: string; clientName?: string; date?: string } = {},
  data?: QuestionnaireState,
): DiscoveryProject {
  const now = new Date().toISOString();
  const projectData = data ?? emptyState();
  projectData.meta = {
    ...projectData.meta,
    projectName: input.name ?? projectData.meta.projectName,
    clientName: input.clientName ?? projectData.meta.clientName,
    date: input.date ?? projectData.meta.date,
  };
  return {
    id: crypto.randomUUID(),
    name: input.name?.trim() || projectData.meta.projectName.trim() || "Untitled discovery",
    clientName: input.clientName?.trim() || projectData.meta.clientName.trim(),
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
    snapshots: [],
    data: projectData,
  };
}

function initialPortfolio(): PortfolioState {
  const project = createProjectRecord();
  return { activeProjectId: project.id, projects: [project] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAnswer(value: unknown): value is Answer {
  return (
    isRecord(value) &&
    typeof value.text === "string" &&
    ["confirmed", "tbc", "client", "jetech"].includes(String(value.status))
  );
}

function isFollowUp(value: unknown): value is FollowUp {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.question === "string" &&
    typeof value.why === "string" &&
    typeof value.answer === "string"
  );
}

function isChatMessage(value: unknown): value is ChatMessage {
  return (
    isRecord(value) &&
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string"
  );
}

function isGap(value: unknown): value is Gap {
  return (
    isRecord(value) &&
    typeof value.sectionId === "string" &&
    ["high", "medium", "low"].includes(String(value.severity)) &&
    typeof value.title === "string" &&
    typeof value.detail === "string" &&
    typeof value.costDriver === "boolean"
  );
}

function isQuestionnaireState(value: unknown): value is QuestionnaireState {
  if (!isRecord(value)) return false;
  if (
    !isRecord(value.meta) ||
    typeof value.meta.clientName !== "string" ||
    typeof value.meta.projectName !== "string" ||
    typeof value.meta.date !== "string" ||
    !isRecord(value.answers) ||
    !isRecord(value.followUps) ||
    !Array.isArray(value.interview) ||
    !(value.gaps === null || Array.isArray(value.gaps)) ||
    !(value.summary === null || typeof value.summary === "string")
  ) {
    return false;
  }
  return (
    Object.values(value.answers).every(isAnswer) &&
    Object.values(value.followUps).every(
      (items) => Array.isArray(items) && items.every(isFollowUp),
    ) &&
    value.interview.every(isChatMessage) &&
    (value.gaps === null || value.gaps.every(isGap))
  );
}

function isProjectSnapshot(value: unknown): value is ProjectSnapshot {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.createdAt === "string" &&
    isQuestionnaireState(value.data)
  );
}

function parseProjectBackup(input: unknown): ProjectBackup {
  if (!isRecord(input) || input.format !== "jetech-discovery-project" || input.version !== 1) {
    throw new Error("This is not a supported Jetech Discovery backup.");
  }
  const project = input.project;
  if (!isRecord(project) || typeof project.name !== "string" || !project.name.trim()) {
    throw new Error("The backup does not contain a valid project name.");
  }
  if (typeof project.clientName !== "string" || !isQuestionnaireState(project.data)) {
    throw new Error("The backup contains invalid project details.");
  }
  if (
    project.snapshots !== undefined &&
    (!Array.isArray(project.snapshots) || !project.snapshots.every(isProjectSnapshot))
  ) {
    throw new Error("The backup contains invalid project history.");
  }
  return input as unknown as ProjectBackup;
}

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [portfolio, setPortfolio] = useState<PortfolioState>(initialPortfolio);
  const [hydrated, setHydrated] = useState(false);

  const activeProject =
    portfolio.projects.find((project) => project.id === portfolio.activeProjectId) ??
    portfolio.projects[0];
  if (!activeProject) throw new Error("A discovery project is required");
  const state = activeProject.data;

  const updateActiveProject = useCallback(
    (updater: (state: QuestionnaireState) => QuestionnaireState) => {
      setPortfolio((current) => ({
        ...current,
        projects: current.projects.map((project) => {
          if (project.id !== current.activeProjectId) return project;
          const data = updater(project.data);
          return {
            ...project,
            name: data.meta.projectName.trim() || project.name,
            clientName: data.meta.clientName.trim(),
            updatedAt: new Date().toISOString(),
            data,
          };
        }),
      }));
    },
    [],
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as PortfolioState;
        if (saved.projects?.length) {
          setPortfolio({
            ...saved,
            projects: saved.projects.map((project) => ({
              ...project,
              snapshots: Array.isArray(project.snapshots) ? project.snapshots : [],
            })),
          });
        }
      } else {
        const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyRaw) {
          const legacy = { ...emptyState(), ...JSON.parse(legacyRaw) } as QuestionnaireState;
          const project = createProjectRecord({}, legacy);
          setPortfolio({ activeProjectId: project.id, projects: [project] });
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  }, [portfolio, hydrated]);

  const createProject = useCallback(
    (input: { name: string; clientName?: string; date?: string }) => {
      const project = createProjectRecord(input);
      setPortfolio((current) => ({
        activeProjectId: project.id,
        projects: [project, ...current.projects],
      }));
      return project.id;
    },
    [],
  );

  const selectProject = useCallback((id: string) => {
    setPortfolio((current) =>
      current.projects.some((project) => project.id === id)
        ? { ...current, activeProjectId: id }
        : current,
    );
  }, []);

  const duplicateProject = useCallback((id: string) => {
    let duplicateId: string | null = null;
    setPortfolio((current) => {
      const source = current.projects.find((project) => project.id === id);
      if (!source) return current;
      const data = structuredClone(source.data);
      data.meta.projectName = `${source.name} copy`;
      const duplicate = createProjectRecord({}, data);
      duplicateId = duplicate.id;
      return { activeProjectId: duplicate.id, projects: [duplicate, ...current.projects] };
    });
    return duplicateId;
  }, []);

  const archiveProject = useCallback((id: string, archived: boolean) => {
    setPortfolio((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === id
          ? {
              ...project,
              archivedAt: archived ? new Date().toISOString() : null,
              updatedAt: new Date().toISOString(),
            }
          : project,
      ),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setPortfolio((current) => {
      if (current.projects.length === 1) return current;
      const projects = current.projects.filter((project) => project.id !== id);
      const activeProjectId =
        current.activeProjectId === id ? projects[0]!.id : current.activeProjectId;
      return { activeProjectId, projects };
    });
  }, []);

  const importProject = useCallback((input: unknown) => {
    const backup = parseProjectBackup(input);
    const data = structuredClone(backup.project.data);
    const project = createProjectRecord(
      { name: backup.project.name, clientName: backup.project.clientName },
      data,
    );
    project.snapshots = structuredClone(backup.project.snapshots ?? []);
    setPortfolio((current) => ({
      activeProjectId: project.id,
      projects: [project, ...current.projects],
    }));
    return project.id;
  }, []);

  const createSnapshot = useCallback((label?: string) => {
    const snapshot: ProjectSnapshot = {
      id: crypto.randomUUID(),
      label: label?.trim() || "Manual snapshot",
      createdAt: new Date().toISOString(),
      data: emptyState(),
    };
    setPortfolio((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== current.activeProjectId) return project;
        return {
          ...project,
          updatedAt: snapshot.createdAt,
          snapshots: [{ ...snapshot, data: structuredClone(project.data) }, ...project.snapshots],
        };
      }),
    }));
    return snapshot.id;
  }, []);

  const restoreSnapshot = useCallback((snapshotId: string) => {
    setPortfolio((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== current.activeProjectId) return project;
        const snapshot = project.snapshots.find((item) => item.id === snapshotId);
        if (!snapshot) return project;
        const now = new Date().toISOString();
        const currentVersion: ProjectSnapshot = {
          id: crypto.randomUUID(),
          label: "Before history restore",
          createdAt: now,
          data: structuredClone(project.data),
        };
        const data = structuredClone(snapshot.data);
        return {
          ...project,
          name: data.meta.projectName.trim() || project.name,
          clientName: data.meta.clientName.trim(),
          updatedAt: now,
          snapshots: [currentVersion, ...project.snapshots],
          data,
        };
      }),
    }));
  }, []);

  const deleteSnapshot = useCallback((snapshotId: string) => {
    setPortfolio((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === current.activeProjectId
          ? {
              ...project,
              snapshots: project.snapshots.filter((snapshot) => snapshot.id !== snapshotId),
            }
          : project,
      ),
    }));
  }, []);

  const setAnswer = useCallback(
    (id: string, patch: Partial<Answer>) => {
      updateActiveProject((s) => ({
        ...s,
        answers: {
          ...s.answers,
          [id]: { text: "", status: "tbc", ...s.answers[id], ...patch },
        },
      }));
    },
    [updateActiveProject],
  );

  const setMeta = useCallback(
    (patch: Partial<QuestionnaireState["meta"]>) => {
      updateActiveProject((s) => ({ ...s, meta: { ...s.meta, ...patch } }));
    },
    [updateActiveProject],
  );

  const setFollowUps = useCallback(
    (sectionId: string, items: FollowUp[]) => {
      updateActiveProject((s) => ({ ...s, followUps: { ...s.followUps, [sectionId]: items } }));
    },
    [updateActiveProject],
  );

  const answerFollowUp = useCallback(
    (sectionId: string, id: string, answer: string) => {
      updateActiveProject((s) => ({
        ...s,
        followUps: {
          ...s.followUps,
          [sectionId]: (s.followUps[sectionId] ?? []).map((f) =>
            f.id === id ? { ...f, answer } : f,
          ),
        },
      }));
    },
    [updateActiveProject],
  );

  const setGaps = useCallback(
    (gaps: Gap[] | null) => updateActiveProject((s) => ({ ...s, gaps })),
    [updateActiveProject],
  );
  const setSummary = useCallback(
    (summary: string | null) => updateActiveProject((s) => ({ ...s, summary })),
    [updateActiveProject],
  );
  const setInterview = useCallback(
    (interview: ChatMessage[]) => updateActiveProject((s) => ({ ...s, interview })),
    [updateActiveProject],
  );
  const reset = useCallback(() => {
    const now = new Date().toISOString();
    setPortfolio((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === current.activeProjectId
          ? {
              ...project,
              updatedAt: now,
              snapshots: [
                {
                  id: crypto.randomUUID(),
                  label: "Before response reset",
                  createdAt: now,
                  data: structuredClone(project.data),
                },
                ...project.snapshots,
              ],
              data: {
                ...emptyState(),
                meta: { ...emptyState().meta, ...project.data.meta },
              },
            }
          : project,
      ),
    }));
  }, []);

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
    projects: portfolio.projects,
    activeProject,
    hydrated,
    createProject,
    selectProject,
    duplicateProject,
    archiveProject,
    deleteProject,
    importProject,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
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

export function createProjectBackup(project: DiscoveryProject): ProjectBackup {
  return {
    format: "jetech-discovery-project",
    version: 1,
    exportedAt: new Date().toISOString(),
    project: {
      name: project.name,
      clientName: project.clientName,
      snapshots: structuredClone(project.snapshots),
      data: structuredClone(project.data),
    },
  };
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
    for (const m of state.interview)
      lines.push(`${m.role === "user" ? "Client" : "Interviewer"}: ${m.content}`);
  }
  return lines.join("\n");
}
