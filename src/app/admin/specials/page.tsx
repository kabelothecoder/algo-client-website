import { requireAdmin } from "@/lib/auth";
import { Card, Empty } from "@/components/ui";
import { DeleteButton, SpecialForm, SpecialToggle } from "@/components/admin-forms";
import { formatDate } from "@/lib/constants";
import type { Special } from "@/lib/types";

export const metadata = { title: "Specials" };
export const dynamic = "force-dynamic";

export default async function SpecialsPage() {
  const { supabase } = await requireAdmin();

  const { data: specials } = await supabase
    .from("specials")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Special[]>();

  const list = specials ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Specials</h1>
        <p className="mt-1 text-sm text-muted">
          The newest active special shows as a banner at the top of the landing
          page.
        </p>
      </div>

      <Card>
        <h2 className="mb-5 font-semibold">New special</h2>
        <SpecialForm />
      </Card>

      {list.length === 0 ? (
        <Empty>No specials yet.</Empty>
      ) : (
        <div className="space-y-3">
          {list.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface/50 p-5"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {s.title}
                  {s.discount_label && (
                    <span className="text-accent"> — {s.discount_label}</span>
                  )}
                </p>
                {s.description && (
                  <p className="mt-1 text-sm text-muted">{s.description}</p>
                )}
                <p className="mt-1 text-xs text-muted">
                  {s.starts_at || s.ends_at
                    ? `${formatDate(s.starts_at)} → ${formatDate(s.ends_at)}`
                    : "No date limits"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SpecialToggle id={s.id} active={s.active} />
                <DeleteButton id={s.id} kind="special" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
