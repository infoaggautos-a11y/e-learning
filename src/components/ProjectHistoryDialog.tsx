import { Clock3, History, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuestionnaire } from "@/lib/questionnaire-store";

export function ProjectHistoryDialog() {
  const { activeProject, createSnapshot, restoreSnapshot, deleteSnapshot } = useQuestionnaire();
  const [label, setLabel] = useState("");
  const [open, setOpen] = useState(false);

  function saveSnapshot() {
    createSnapshot(label);
    setLabel("");
    toast.success("Snapshot created");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <History /> History
          {activeProject.snapshots.length > 0 && (
            <span className="rounded bg-secondary px-1.5 py-0.5 text-xs tabular-nums">
              {activeProject.snapshots.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project history</DialogTitle>
          <DialogDescription>
            Save named checkpoints before major edits and restore an earlier version when needed.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex gap-2 border-y py-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveSnapshot();
          }}
        >
          <Input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Snapshot label (optional)"
            aria-label="Snapshot label"
          />
          <Button type="submit">
            <Plus /> Save snapshot
          </Button>
        </form>

        {activeProject.snapshots.length === 0 ? (
          <div className="py-10 text-center">
            <Clock3 className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 font-medium">No snapshots yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The app also creates one automatically before responses are reset.
            </p>
          </div>
        ) : (
          <ol className="divide-y">
            {activeProject.snapshots.map((snapshot) => {
              const answered = Object.values(snapshot.data.answers).filter((answer) =>
                answer.text.trim(),
              ).length;
              return (
                <li key={snapshot.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{snapshot.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(snapshot.createdAt).toLocaleString()} | {answered} answers
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Restore ${snapshot.label}`}
                    title="Restore snapshot"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Restore "${snapshot.label}"? The current version will be saved first.`,
                        )
                      ) {
                        restoreSnapshot(snapshot.id);
                        toast.success("Snapshot restored");
                      }
                    }}
                  >
                    <RotateCcw />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${snapshot.label}`}
                    title="Delete snapshot"
                    onClick={() => {
                      if (window.confirm(`Delete the snapshot "${snapshot.label}"?`)) {
                        deleteSnapshot(snapshot.id);
                        toast.success("Snapshot deleted");
                      }
                    }}
                  >
                    <Trash2 />
                  </Button>
                </li>
              );
            })}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
