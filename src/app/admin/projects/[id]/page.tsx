import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { Card, Empty, Pill, StatusBadge } from "@/components/ui";
import { Timeline } from "@/components/timeline";
import { MessageThread } from "@/components/message-thread";
import { ComplaintList } from "@/components/complaints";
import {
  AgreementForm,
  DeliverableToggle,
  DeliverableUploadForm,
  PaymentReviewForm,
  StatusUpdateForm,
} from "@/components/admin-forms";
import {
  PAYMENT_TONE,
  SERVICE_LABEL,
  formatDate,
  formatDateTime,
  formatMoney,
} from "@/lib/constants";
import type {
  ChatMessage,
  Complaint,
  Deliverable,
  Payment,
  Project,
  ProjectMessage,
  ProjectUpdate,
} from "@/lib/types";

type Row = Project & {
  profiles: { full_name: string | null; whatsapp: string | null } | null;
};

export default async function AdminProjectPage({
  params,
}: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: project } = await supabase
    .from("projects")
    .select("*, profiles!projects_client_id_fkey(full_name, whatsapp)")
    .eq("id", id)
    .maybeSingle<Row>();

  if (!project) notFound();

  const [
    { data: updates },
    { data: messages },
    { data: payments },
    { data: deliverables },
    { data: intake },
  ] = await Promise.all([
    supabase
      .from("project_updates")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .returns<ProjectUpdate[]>(),
    supabase
      .from("project_messages")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true })
      .returns<ProjectMessage[]>(),
    supabase
      .from("payments")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .returns<Payment[]>(),
    supabase
      .from("deliverables")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .returns<Deliverable[]>(),
    supabase
      .from("ai_intake_chats")
      .select("transcript, summary")
      .eq("project_id", id)
      .maybeSingle<{ transcript: ChatMessage[]; summary: string | null }>(),
  ]);

  const { data: complaints } = await supabase
    .from("complaints")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .returns<Complaint[]>();

  const openComplaints = (complaints ?? []).filter((c) => c.status !== "resolved");

  const proofs = await Promise.all(
    (payments ?? []).map(async (p) => {
      const { data } = await supabase.storage
        .from("payment-proofs")
        .createSignedUrl(p.proof_path, 60 * 60);
      return { ...p, url: data?.signedUrl ?? null };
    }),
  );

  return (
    <div className="space-y-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl">{project.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {project.profiles?.full_name ?? "Unknown client"}
            {project.profiles?.whatsapp && ` · ${project.profiles.whatsapp}`} ·{" "}
            {SERVICE_LABEL[project.service]} · opened{" "}
            {formatDate(project.created_at)}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {complaints && complaints.length > 0 && (
        <Card
          className={openComplaints.length > 0 ? "border-danger/40" : undefined}
        >
          <h2 className="mb-1 font-semibold">
            Complaints
            {openComplaints.length > 0 && (
              <span className="ml-2 text-danger">
                {openComplaints.length} open
              </span>
            )}
          </h2>
          <p className="mb-5 text-sm text-muted">
            Answer these before anything else on this page. A dated written reply
            is what stops a complaint becoming a public one.
          </p>
          <ComplaintList complaints={complaints} isAdmin />
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-1 font-semibold">Agreement</h2>
          <p className="mb-5 text-sm text-muted">
            Fill this in before asking for money. The client sees it immediately.
          </p>
          <AgreementForm
            projectId={project.id}
            quotedAmount={project.quoted_amount}
            agreedScope={project.agreed_scope}
            dueDate={project.due_date}
          />
        </Card>

        <Card>
          <h2 className="mb-1 font-semibold">Post an update</h2>
          <p className="mb-5 text-sm text-muted">
            Every status change is logged automatically; add a note to explain it.
          </p>
          <StatusUpdateForm projectId={project.id} current={project.status} />
        </Card>
      </div>

      <Card>
        <h2 className="mb-1 font-semibold">Brief</h2>
        <p className="mb-4 text-sm text-muted">What the client asked for.</p>
        {project.brief ? (
          <pre className="whitespace-pre-wrap rounded-xl border border-border bg-surface-2 p-4 font-sans text-sm leading-relaxed">
            {project.brief}
          </pre>
        ) : (
          <Empty>No brief captured yet.</Empty>
        )}

        {intake?.transcript && intake.transcript.length > 0 && (
          <details className="mt-4 rounded-xl border border-border bg-surface-2 p-4">
            <summary className="cursor-pointer text-sm font-medium">
              AI intake transcript ({intake.transcript.length} messages)
            </summary>
            <div className="mt-4 space-y-3">
              {intake.transcript.map((m, i) => (
                <div key={i} className="text-sm">
                  <span className="text-xs uppercase tracking-wide text-muted">
                    {m.role === "user" ? "Client" : "Assistant"}
                  </span>
                  <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
          </details>
        )}
      </Card>

      <Card>
        <h2 className="mb-1 font-semibold">Payments</h2>
        <p className="mb-5 text-sm text-muted">
          Open the proof and check it against your bank before confirming.
        </p>
        {proofs.length === 0 ? (
          <Empty>No proof of payment submitted yet.</Empty>
        ) : (
          <ul className="space-y-3">
            {proofs.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-border bg-surface-2 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {formatMoney(p.amount, p.currency)}
                      {p.reference && (
                        <span className="text-muted"> · {p.reference}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      Submitted {formatDateTime(p.created_at)}
                      {p.reviewed_at &&
                        ` · reviewed ${formatDateTime(p.reviewed_at)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-surface"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View proof
                      </a>
                    )}
                    <Pill tone={PAYMENT_TONE[p.status]}>{p.status}</Pill>
                  </div>
                </div>
                {p.admin_note && (
                  <p className="mt-2 text-xs text-muted">{p.admin_note}</p>
                )}
                {p.status === "pending" && (
                  <PaymentReviewForm paymentId={p.id} projectId={project.id} />
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-1 font-semibold">Deliverables</h2>
          <p className="mb-5 text-sm text-muted">
            Uploads stay hidden until you release them.
          </p>
          <DeliverableUploadForm
            projectId={project.id}
            clientId={project.client_id}
          />
          {deliverables && deliverables.length > 0 && (
            <ul className="mt-6 space-y-2">
              {deliverables.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-4 w-4 shrink-0 text-gold" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{d.file_name}</p>
                      {d.notes && (
                        <p className="truncate text-xs text-muted">{d.notes}</p>
                      )}
                    </div>
                  </div>
                  <DeliverableToggle
                    deliverableId={d.id}
                    projectId={project.id}
                    released={d.released}
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-5 font-semibold">Build history</h2>
          <Timeline updates={updates ?? []} />
        </Card>
      </div>

      <Card>
        <h2 className="mb-1 font-semibold">Messages</h2>
        <p className="mb-5 text-sm text-muted">
          Replying here is the single highest-value thing you can do for a
          disputed project.
        </p>
        <MessageThread
          projectId={project.id}
          messages={messages ?? []}
          viewerIsAdmin
        />
      </Card>
    </div>
  );
}
