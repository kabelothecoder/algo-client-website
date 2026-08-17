import { requireAdmin } from "@/lib/auth";
import { Card, Empty, Pill } from "@/components/ui";
import { formatDate, formatDateTime, formatMoney } from "@/lib/constants";

export const metadata = { title: "Sessions" };
export const dynamic = "force-dynamic";

type Booking = {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  session_type: string;
  mode: "in_person" | "online";
  suburb: string | null;
  distance_km: number | null;
  travel_fee: number;
  session_fee: number;
  preferred_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export default async function SessionsPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("session_bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Booking[]>();

  const rows = data ?? [];
  const pending = rows.filter((r) => r.status === "requested");
  const revenue = pending.reduce(
    (sum, r) => sum + Number(r.session_fee) + Number(r.travel_fee),
    0,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">One-on-one sessions</h1>
        <p className="mt-1 text-sm text-muted">
          Fastest money on the site — no build backlog attached to any of these.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-3xl font-bold tabular-nums">{rows.length}</p>
          <p className="mt-1 text-sm text-muted">Total requests</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold tabular-nums text-amber-300">
            {pending.length}
          </p>
          <p className="mt-1 text-sm text-muted">Awaiting confirmation</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold tabular-nums text-emerald-300">
            {formatMoney(revenue)}
          </p>
          <p className="mt-1 text-sm text-muted">Value not yet booked</p>
        </Card>
      </div>

      {rows.length === 0 ? (
        <Empty>No session requests yet.</Empty>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-border bg-surface/50 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    {r.name}
                    <span className="ml-2 text-sm font-normal text-muted">
                      {r.session_type}
                    </span>
                  </p>
                  <p className="text-sm text-muted">
                    <a href={`mailto:${r.email}`} className="hover:text-foreground">
                      {r.email}
                    </a>
                    {r.whatsapp && ` · ${r.whatsapp}`}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {r.mode === "online"
                      ? "Online"
                      : `${r.suburb} · ${r.distance_km} km`}
                    {r.preferred_date && ` · wants ${formatDate(r.preferred_date)}`}
                    {" · requested "}
                    {formatDateTime(r.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold tabular-nums">
                    {formatMoney(Number(r.session_fee) + Number(r.travel_fee))}
                  </p>
                  {r.mode === "in_person" && Number(r.travel_fee) > 0 && (
                    <p className="text-xs text-muted">
                      incl. {formatMoney(Number(r.travel_fee))} travel
                    </p>
                  )}
                  <Pill
                    tone={
                      r.status === "requested"
                        ? "bg-amber-500/15 text-amber-300 ring-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                    }
                  >
                    {r.status}
                  </Pill>
                </div>
              </div>

              {r.notes && (
                <p className="mt-4 whitespace-pre-wrap rounded-xl border border-border bg-surface-2 p-4 text-sm leading-relaxed">
                  {r.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
