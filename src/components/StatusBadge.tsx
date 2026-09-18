import { STATUS_LABELS, type AnswerStatus } from "@/lib/questionnaire-data";
import { cn } from "@/lib/utils";

const CLASS: Record<AnswerStatus, string> = {
  confirmed: "status-confirmed",
  tbc: "status-tbc",
  client: "status-client",
  jetech: "status-jetech",
};

export function StatusBadge({ status, className }: { status: AnswerStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", CLASS[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function StatusPicker({ value, onChange }: { value: AnswerStatus; onChange: (s: AnswerStatus) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(STATUS_LABELS) as AnswerStatus[]).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all cursor-pointer",
            value === s ? cn(CLASS[s], "ring-1 ring-current") : "border-border text-muted-foreground hover:bg-secondary",
          )}
        >
          {STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  );
}
