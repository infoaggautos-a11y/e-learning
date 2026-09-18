import { Link, useRouterState } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FolderKanban,
  MessageSquareText,
  ShieldAlert,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SECTIONS } from "@/lib/questionnaire-data";
import { useQuestionnaire } from "@/lib/questionnaire-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/workspace", label: "Overview", icon: ClipboardList },
  { to: "/interview", label: "AI interview", icon: MessageSquareText },
  { to: "/review", label: "Gaps & risks", icon: ShieldAlert },
  { to: "/summary", label: "Summary", icon: FileText },
  { to: "/handoff", label: "Submit", icon: ClipboardCheck },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { overall, sectionProgress, hydrated, projects, activeProject, selectProject } =
    useQuestionnaire();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pct = overall.total ? Math.round((overall.answered / overall.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-serif text-lg font-semibold text-primary-foreground">
              J
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">Jetech Discovery</span>
              <span className="block text-xs text-muted-foreground">
                Requirements questionnaire
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active =
                to === "/"
                  ? pathname === "/" || pathname.startsWith("/section")
                  : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="max-w-52">
                  <FolderKanban /> <span className="truncate">{activeProject.name}</span>{" "}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Switch project</DropdownMenuLabel>
                {projects
                  .filter((project) => !project.archivedAt)
                  .map((project) => (
                    <DropdownMenuItem key={project.id} onSelect={() => selectProject(project.id)}>
                      <span className="min-w-0 flex-1 truncate">{project.name}</span>
                      {project.id === activeProject.id && <Check />}
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/">
                    <FolderKanban /> All projects
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${hydrated ? pct : 0}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              {hydrated ? `${overall.answered}/${overall.total}` : "…"}
            </span>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
          <Link
            to="/"
            className="whitespace-nowrap rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-secondary"
          >
            Projects
          </Link>
          {NAV.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="whitespace-nowrap rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-secondary [&.active]:bg-secondary [&.active]:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 sm:px-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sections
          </p>
          <ol className="space-y-0.5">
            {SECTIONS.map((s) => {
              const p = sectionProgress(s.id);
              const done = p.total > 0 && p.answered === p.total;
              return (
                <li key={s.id}>
                  <Link
                    to="/section/$id"
                    params={{ id: s.id }}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground [&.active]:bg-secondary [&.active]:text-foreground"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] tabular-nums",
                        done
                          ? "border-success bg-success text-success-foreground"
                          : p.answered > 0
                            ? "border-accent text-accent"
                            : "",
                      )}
                    >
                      {s.number}
                    </span>
                    <span className="truncate">{s.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
