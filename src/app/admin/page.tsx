import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  MessageSquare,
  Users,
  Wrench,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { Card, Empty, StatusBadge } from "@/components/ui";
import { CountUp } from "@/components/reveal";
import {
  SERVICE_LABEL,
  STATUS_LABEL,
  formatDate,
  formatMoney,
} from "@/lib/constants";
import type { AdminStats, Project, ProjectStatus } from "@/lib/types";

export const metadata = { title: "Admin overview" };
export const dynamic = "force-dynamic";

type Row = Project & { profiles: { full_name: string | null } | null };

const STAT_CARDS = [
  { key: "open_complaints", label: "Open complaints", icon: AlertTriangle },
  { key: "backlog_claims", label: "Backlog orders to deliver", icon: History },
  { key: "awaiting_payment", label: "Awaiting payment review", icon: Clock },
  { key: "unanswered_messages", label: "Unanswered threads", icon: MessageSquare },
  { key: "stale_projects", label: "No update in 7+ days", icon: AlertTriangle },
  { key: "active_projects", label: "Active projects", icon: Wrench },
  { key: "delivered_this_month", label: "Delivered this month", icon: CheckCircle2 },
  { key: "total_clients", label: "Clients", icon: Users },
] as const;

const URGENT_KEYS = new Set([
  "open_complaints",
  "backlog_claims",
  "awaiting_payment",
  "unanswered_messages",
  "stale_projects",
]);

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const { supabase } = await requireAdmin();
  const { status } = await searchParams;
  const filter = typeof status === "string" ? status : "";

  let query = supabase
    .from("projects")
    .select("*, profiles!projects_client_id_fkey(full_name)")
    .order("updated_at", { ascending: false });

  if (filter) query = query.eq("status", filter);

  const [{ data: projects }, { data: stats }] = await Promise.all([
    query.returns<Row[]>(),
    supabase.rpc("get_admin_stats"),
  ]);

  const s = (stats ?? {}) as Partial<AdminStats>;
  const rows = projects ?? [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted">
          The two numbers that matter for trust: payments waiting on you, and
          threads a client is still waiting to hear back on.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_CARDS.map((card) => {
          const value = s[card.key] ?? 0;
          const urgent = URGENT_KEYS.has(card.key) && value > 0;
          const critical = card.key === "open_complaints" && value > 0;
          return (
            <Card
              key={card.key}
              className={
                critical
                  ? "border-red-500/40 bg-red-500/5"
                  : urgent
                    ? "border-amber-500/40 bg-amber-500/5"
                    : ""
              }
            >
              <card.icon
                className={`h-5 w-5 ${
                  critical
                    ? "text-red-400"
                    : urgent
                      ? "text-amber-400"
                      : "text-primary"
                }`}
              />
              <CountUp
                value={value}
                className="mt-4 block font-[family-name:var(--font-geist-mono)] text-3xl tabular-nums"
              />
              <p className="mt-1 text-sm text-muted">{card.label}</p>
            </Card>
          );
        })}
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="mr-2 font-semibold">Projects</h2>
          <Link
            href="/admin"
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
              !filter
                ? "bg-gold text-gold-ink"
                : "bg-surface-2 text-muted hover:text-foreground"
            }`}
          >
            All
          </Link>
          {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((st) => (
            <Link
              key={st}
              href={`/admin?status=${st}`}
              className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                filter === st
                  ? "bg-gold text-gold-ink"
                  : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {STATUS_LABEL[st]}
            </Link>
          ))}
        </div>

        {rows.length === 0 ? (
          <Empty>No projects match this filter.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[46rem] text-sm">
              <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((p) => (
                  <tr key={p.id} className="transition hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {p.title}
                      </Link>
                      {p.origin === "claim" && (
                        <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent ring-1 ring-inset ring-accent/30">
                          backlog
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {p.profiles?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {SERVICE_LABEL[p.service]}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted">
                      {formatMoney(p.quoted_amount, p.currency)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(p.due_date)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
