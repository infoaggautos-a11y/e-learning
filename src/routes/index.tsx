import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Archive,
  ArchiveRestore,
  Copy,
  Download,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SECTIONS } from "@/lib/questionnaire-data";
import {
  createProjectBackup,
  type DiscoveryProject,
  useQuestionnaire,
} from "@/lib/questionnaire-store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Discovery projects - Jetech" }] }),
  component: ProjectsDashboard,
});

function getProgress(project: DiscoveryProject) {
  const total = SECTIONS.reduce(
    (sum, section) => sum + section.questions.length + (section.keyQuestion ? 1 : 0),
    0,
  );
  const answered = Object.values(project.data.answers).filter((answer) =>
    answer.text.trim(),
  ).length;
  return { answered, total, percentage: total ? Math.round((answered / total) * 100) : 0 };
}

function ProjectsDashboard() {
  const navigate = useNavigate();
  const {
    projects,
    hydrated,
    createProject,
    selectProject,
    duplicateProject,
    archiveProject,
    deleteProject,
    importProject,
  } = useQuestionnaire();
  const [showCreate, setShowCreate] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);
  const visibleProjects = useMemo(
    () =>
      projects.filter((project) => {
        if (!showArchived && project.archivedAt) return false;
        const term = query.trim().toLocaleLowerCase();
        return (
          !term ||
          project.name.toLocaleLowerCase().includes(term) ||
          project.clientName.toLocaleLowerCase().includes(term)
        );
      }),
    [projects, query, showArchived],
  );
  const archivedCount = projects.filter((project) => project.archivedAt).length;

  function openProject(id: string) {
    selectProject(id);
    void navigate({ to: "/workspace" });
  }

  function submitProject() {
    if (!name.trim()) return;
    createProject({ name: name.trim(), clientName: clientName.trim() });
    setName("");
    setClientName("");
    setShowCreate(false);
    void navigate({ to: "/workspace" });
  }

  function exportProject(project: DiscoveryProject) {
    const backup = createProjectBackup(project);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      project.name
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "discovery-project"
    }.jetech.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Project backup downloaded");
  }

  async function restoreProject(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("That backup is larger than the 10 MB limit.");
      return;
    }
    try {
      const input = JSON.parse(await file.text()) as unknown;
      importProject(input);
      toast.success("Project restored");
      void navigate({ to: "/workspace" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The backup could not be restored.");
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-serif text-lg font-semibold text-primary-foreground">
              J
            </span>
            <div>
              <p className="text-sm font-semibold">Jetech Discovery</p>
              <p className="text-xs text-muted-foreground">Project workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => void restoreProject(event)}
            />
            <Button variant="outline" onClick={() => importInputRef.current?.click()}>
              <Upload /> Restore
            </Button>
            <Button onClick={() => setShowCreate(true)}>
              <Plus /> New project
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Discovery projects</h1>
            <p className="mt-2 text-muted-foreground">
              Open a client workspace or start a new requirements discovery.
            </p>
          </div>
          {archivedCount > 0 && (
            <Button variant="ghost" onClick={() => setShowArchived((value) => !value)}>
              <Archive /> {showArchived ? "Hide archived" : `Show archived (${archivedCount})`}
            </Button>
          )}
        </div>

        <div className="mt-6 flex max-w-md items-center gap-2 rounded-md border bg-card px-3 shadow-sm focus-within:ring-1 focus-within:ring-ring">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects or clients"
            aria-label="Search projects"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {!hydrated ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading projects...</p>
        ) : visibleProjects.length === 0 ? (
          <div className="mt-6 border-y py-12 text-center">
            <p className="font-medium">No projects match this view</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another search or include archived projects.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map((project) => {
              const progress = getProgress(project);
              return (
                <article key={project.id} className="card-elevated flex min-h-52 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-muted-foreground">
                        {project.clientName || "Client not set"}
                      </p>
                      <h2 className="mt-1 line-clamp-2 text-xl font-semibold">{project.name}</h2>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Project actions for ${project.name}`}
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openProject(project.id)}>
                          <FolderOpen /> Open
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            duplicateProject(project.id);
                            void navigate({ to: "/workspace" });
                          }}
                        >
                          <Copy /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => exportProject(project)}>
                          <Download /> Download backup
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => archiveProject(project.id, !project.archivedAt)}
                        >
                          {project.archivedAt ? <ArchiveRestore /> : <Archive />}
                          {project.archivedAt ? "Restore" : "Archive"}
                        </DropdownMenuItem>
                        {projects.length > 1 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => {
                                if (
                                  window.confirm(
                                    `Delete "${project.name}" permanently from this device?`,
                                  )
                                )
                                  deleteProject(project.id);
                              }}
                            >
                              <Trash2 /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {project.archivedAt && (
                    <span className="mt-3 w-fit rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                      Archived
                    </span>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.data.summary && (
                      <span className="rounded-md border border-success/30 bg-success/10 px-2 py-1 text-xs text-success">
                        Summary ready
                      </span>
                    )}
                    {project.data.gaps && project.data.gaps.length > 0 && (
                      <span className="rounded-md border border-warning/40 bg-warning/10 px-2 py-1 text-xs text-warning-foreground">
                        {project.data.gaps.length}{" "}
                        {project.data.gaps.length === 1 ? "risk" : "risks"}
                      </span>
                    )}
                    {project.data.interview.length > 0 && (
                      <span className="rounded-md border bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                        Interview started
                      </span>
                    )}
                    {project.snapshots.length > 0 && (
                      <span className="rounded-md border bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                        {project.snapshots.length} history{" "}
                        {project.snapshots.length === 1 ? "version" : "versions"}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto pt-6">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {progress.answered} of {progress.total} answered
                      </span>
                      <span>{progress.percentage}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => openProject(project.id)}>
                        Open <FolderOpen />
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New discovery project</DialogTitle>
            <DialogDescription>
              Create a separate workspace for this client engagement.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitProject();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="new-project-name">Project name</Label>
              <Input
                id="new-project-name"
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Operative Permit Platform"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-client-name">Client / organisation</Label>
              <Input
                id="new-client-name"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="National Security Training Board"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                Create project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
