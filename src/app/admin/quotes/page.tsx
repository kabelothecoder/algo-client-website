import { requireAdmin } from "@/lib/auth";
import { Card, Empty, Pill } from "@/components/ui";
import { QuoteHandledToggle } from "@/components/admin-forms";
import { SERVICE_LABEL, formatDateTime, BUDGET_BANDS } from "@/lib/constants";
import type { ServiceType } from "@/lib/types";

export const metadata = { title: "Quote requests" };
export const dynamic = "force-dynamic";

type QuoteRequest = {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  service: ServiceType;
  path: "budget" | "enquiry";
  budget_band: string | null;
  system_notes: string | null;
  questions: string | null;
  outcome: "proceeding" | "declined";
  handled: boolean;
  created_at: string;
};

const bandLabel = (id: string | null) =>
  BUDGET_BANDS.find((b) => b.id === id)?.label ?? id ?? "—";

export default async function QuotesPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<QuoteRequest[]>();

  const rows = data ?? [];
  const proceeding = rows.filter((r) => r.outcome === "proceeding");
  const declined = rows.filter((r) => r.outcome === "declined");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl">Quote requests</h1>
        <p className="mt-1 text-sm text-muted">
          The declines are worth reading. If most people tick off at the same
          band, your entry price is wrong — not your pitch.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="font-[family-name:var(--font-geist-mono)] text-3xl tabular-nums">{rows.length}</p>
          <p className="mt-1 text-sm text-muted">Total requests</p>
        </Card>
        <Card>
          <p className="font-[family-name:var(--font-geist-mono)] text-3xl tabular-nums text-live">
            {proceeding.length}
          </p>
          <p className="mt-1 text-sm text-muted">Want a quote</p>
        </Card>
        <Card>
          <p className="font-[family-name:var(--font-geist-mono)] text-3xl tabular-nums text-warn">
            {declined.length}
          </p>
          <p className="mt-1 text-sm text-muted">Out of budget</p>
        </Card>
      </div>

      {rows.length === 0 ? (
        <Empty>No quote requests yet.</Empty>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl border p-5 ${
                r.outcome === "declined"
                  ? "border-border bg-surface/30"
                  : "border-gold/25 bg-surface/60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-muted">
                    <a
                      href={`mailto:${r.email}`}
                      className="hover:text-foreground"
                    >
                      {r.email}
                    </a>
                    {r.whatsapp && ` · ${r.whatsapp}`}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {SERVICE_LABEL[r.service]} ·{" "}
                    {r.path === "budget"
                      ? `budget ${bandLabel(r.budget_band)}`
                      : "asked for a quote"}{" "}
                    · {formatDateTime(r.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                <Pill
                  tone={
                    r.outcome === "declined"
                      ? "bg-warn/15 text-warn ring-warn/30"
                      : "bg-live/15 text-live ring-live/30"
                  }
                >
                  {r.outcome === "declined" ? "Ticked off" : "Wants a quote"}
                </Pill>
                <QuoteHandledToggle id={r.id} handled={r.handled} />
                </div>
              </div>

              {r.system_notes && (
                <div className="mt-4 rounded-xl border border-border bg-surface-2 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    Their system
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
                    {r.system_notes}
                  </p>
                </div>
              )}

              {r.questions && (
                <div className="mt-3 rounded-xl border border-border bg-surface-2 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    Their questions
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
                    {r.questions}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
