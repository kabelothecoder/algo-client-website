import type { ReactNode } from "react";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/constants";
import type { ProjectStatus } from "@/lib/types";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface/70 p-6 lift ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  sub,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="text-3xl md:text-[2.75rem] leading-[1.1]">{title}</h2>
      {sub && <p className="mt-4 leading-relaxed text-muted">{sub}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wider ring-1 ring-inset ${STATUS_TONE[status]}`}
    >
      {status === "in_dev" && (
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Pill({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wider ring-1 ring-inset ${
        tone || "bg-surface-2 text-muted ring-border"
      }`}
    >
      {children}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted">
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm outline-none " +
  "placeholder:text-muted-dim focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm " +
  "font-semibold text-gold-ink hover:bg-gold-bright disabled:opacity-50 " +
  "disabled:cursor-not-allowed transition-colors";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 " +
  "px-5 py-2.5 text-sm font-medium text-foreground hover:border-border-strong hover:bg-surface " +
  "disabled:opacity-50 transition-colors";

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="eyebrow mb-1.5 block !tracking-[0.12em] text-muted">
      {children}
    </label>
  );
}
