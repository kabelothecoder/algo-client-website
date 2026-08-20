import { STATUS_FLOW, STATUS_LABEL, formatDateTime } from "@/lib/constants";
import type { ProjectStatus, ProjectUpdate } from "@/lib/types";
import { StatusBadge } from "@/components/ui";

export function ProgressRail({ status }: { status: ProjectStatus }) {
  // revision/cancelled sit outside the happy path, so anchor the rail sensibly
  const index =
    status === "delivered"
      ? STATUS_FLOW.length - 1
      : status === "revision"
        ? STATUS_FLOW.indexOf("testing")
        : status === "cancelled"
          ? -1
          : STATUS_FLOW.indexOf(status);

  return (
    <ol className="flex items-center gap-1.5">
      {STATUS_FLOW.map((s, i) => {
        const done = index >= i;
        return (
          <li key={s} className="flex-1">
            <div
              className={`h-1.5 rounded-full ${done ? "bg-gold" : "bg-border"}`}
            />
            <p
              className={`mt-2 text-[11px] ${done ? "text-foreground" : "text-muted"}`}
            >
              {STATUS_LABEL[s]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export function Timeline({ updates }: { updates: ProjectUpdate[] }) {
  if (updates.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
        No updates logged yet.
      </p>
    );
  }

  return (
    <ol className="relative space-y-5 border-l border-border pl-6">
      {updates.map((u) => (
        <li key={u.id} className="relative">
          <span className="absolute -left-[1.9rem] top-1.5 h-2.5 w-2.5 rounded-full bg-gold ring-4 ring-background" />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={u.status} />
            <time className="text-xs text-muted">
              {formatDateTime(u.created_at)}
            </time>
          </div>
          {u.note && (
            <p className="mt-2 text-sm leading-relaxed text-muted">{u.note}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
