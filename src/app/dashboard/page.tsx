import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { StartProject } from "@/components/start-project";
import { Card, Empty, StatusBadge } from "@/components/ui";
import { SERVICE_LABEL, formatDate, formatMoney } from "@/lib/constants";
import type { Project } from "@/lib/types";

export const metadata = { title: "Your projects" };

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const { supabase } = await requireUser();
  const { service } = await searchParams;

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Project[]>();

  const list = projects ?? [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl">Your projects</h1>
        <p className="mt-1 text-sm text-muted">
          Every build, its agreed scope and where it stands right now.
        </p>
      </div>

      {list.length === 0 ? (
        <Empty>
          <FolderOpen className="mx-auto mb-3 h-6 w-6 opacity-50" />
          No projects yet. Create your first one below.
        </Empty>
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/projects/${p.id}`}
              className="group block rounded-2xl border border-border bg-surface/50 p-5 transition hover:border-gold/40 hover:bg-surface"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{p.title}</h2>
                  <p className="mt-1 text-xs text-muted">
                    {SERVICE_LABEL[p.service]} · opened {formatDate(p.created_at)}
                    {p.due_date && ` · due ${formatDate(p.due_date)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted">
                    {formatMoney(p.quoted_amount, p.currency)}
                  </span>
                  <StatusBadge status={p.status} />
                  <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Card>
        <h2 className="font-semibold">Add a project</h2>
        <p className="mt-1 mb-5 text-sm text-muted">
          Start something new, or log an order you already paid for so it can be
          tracked and delivered.
        </p>
        <StartProject
          defaultService={typeof service === "string" ? service : undefined}
        />
      </Card>
    </div>
  );
}
