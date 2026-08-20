import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Lock,
} from "lucide-react";
import { isAdmin, requireUser } from "@/lib/auth";
import { Card, Empty, Pill, StatusBadge } from "@/components/ui";
import { ProgressRail, Timeline } from "@/components/timeline";
import { MessageThread } from "@/components/message-thread";
import { PaymentUpload } from "@/components/payment-upload";
import { IntakeChat } from "@/components/intake-chat";
import { ComplaintForm, ComplaintList } from "@/components/complaints";
import {
  PAYMENT_TONE,
  SERVICE_LABEL,
  STATUS_LABEL,
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

export default async function ProjectPage({
  params,
  searchParams,
}: PageProps<"/dashboard/projects/[id]">) {
  const { id } = await params;
  const { claimed } = await searchParams;
  const { supabase } = await requireUser();
  const admin = await isAdmin();

  // RLS already scopes this to the caller's own projects.
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle<Project>();

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

  const confirmedPayment = (payments ?? []).find((p) => p.status === "confirmed");

  const files = deliverables ?? [];
  const signed = await Promise.all(
    files.map(async (d) => {
      const { data } = await supabase.storage
        .from("deliverables")
        .createSignedUrl(d.file_path, 60 * 60);
      return { ...d, url: data?.signedUrl ?? null };
    }),
  );

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      {claimed && (
        <div className="rounded-2xl border border-sage/30 bg-sage/10 p-5">
          <p className="font-medium">Order logged. One more step.</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Attach your proof of payment in the Payments section below. Once
            it&rsquo;s confirmed, your build stage goes live here and you can
            follow it without having to chase anyone.
          </p>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl">{project.title}</h1>
            <p className="mt-1 text-sm text-muted">
              {SERVICE_LABEL[project.service]} · opened{" "}
              {formatDate(project.created_at)}
            </p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <div className="mt-8">
          <ProgressRail status={project.status} />
        </div>

        {/* Where the project actually stands, in one line. */}
        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface/50 px-5 py-4 text-sm">
          {confirmedPayment ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-live" />
              <span>
                Payment confirmed{" "}
                {confirmedPayment.reviewed_at &&
                  `on ${formatDate(confirmedPayment.reviewed_at)}`}
                .
              </span>
              <span className="text-muted">
                Current stage: {STATUS_LABEL[project.status]}
                {project.due_date && ` · due ${formatDate(project.due_date)}`}
              </span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-warn" />
              <span className="text-muted">
                No payment confirmed yet. Work starts once it is — upload your
                proof below and it will be reviewed by hand.
              </span>
            </>
          )}
        </div>
      </div>

      {/* Complaints */}
      <Card>
        <h2 className="mb-1 font-semibold">Problems with this project</h2>
        <p className="mb-5 text-sm text-muted">
          If something has gone wrong — a missed date, work that isn&rsquo;t what
          was agreed, or silence — log it formally here. It gets a timestamp, a
          status you can watch, and a written response. Neither of us can delete
          it.
        </p>
        <div className="space-y-5">
          <ComplaintList complaints={complaints ?? []} />
          <ComplaintForm projectId={project.id} />
        </div>
      </Card>

      {/* The agreement */}
      <Card>
        <h2 className="mb-4 font-semibold">The agreement</h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Price</dt>
            <dd className="mt-1 text-lg font-semibold">
              {formatMoney(project.quoted_amount, project.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">
              Delivery date
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {formatDate(project.due_date)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={project.status} />
            </dd>
          </div>
        </dl>
        <div className="mt-5 border-t border-border pt-5">
          <p className="text-xs uppercase tracking-wide text-muted">Agreed scope</p>
          {project.agreed_scope ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
              {project.agreed_scope}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Not set yet — you will get a written scope and price before any
              payment is due.
            </p>
          )}
        </div>
      </Card>

      {/* Brief + AI intake */}
      <Card>
        <h2 className="font-semibold">Your brief</h2>
        <p className="mt-1 mb-5 text-sm text-muted">
          Talk to the assistant to turn rough ideas into a spec I can quote from.
        </p>
        {project.brief && (
          <div className="mb-5 rounded-xl border border-border bg-surface-2 p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {project.brief}
            </pre>
          </div>
        )}
        <IntakeChat
          projectId={project.id}
          initialTranscript={intake?.transcript ?? []}
          initialSummary={intake?.summary ?? null}
        />
      </Card>

      {/* Messages */}
      <Card>
        <h2 className="mb-1 font-semibold">Messages</h2>
        <p className="mb-5 text-sm text-muted">
          Questions and complaints go here so they are on the record with a date.
        </p>
        <MessageThread
          projectId={project.id}
          messages={messages ?? []}
          viewerIsAdmin={admin}
        />
      </Card>

      {/* Payments */}
      <Card>
        <h2 className="mb-1 font-semibold">Payments</h2>
        <p className="mb-5 text-sm text-muted">
          Uploads stay <em>pending</em> until they are checked by hand. Nothing is
          auto-approved.
        </p>

        {payments && payments.length > 0 && (
          <ul className="mb-6 space-y-2">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {formatMoney(p.amount, p.currency)}
                    {p.reference && (
                      <span className="text-muted"> · {p.reference}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    Submitted {formatDateTime(p.created_at)}
                    {p.reviewed_at && ` · reviewed ${formatDateTime(p.reviewed_at)}`}
                  </p>
                  {p.admin_note && (
                    <p className="mt-1 text-xs text-muted">{p.admin_note}</p>
                  )}
                </div>
                <Pill tone={PAYMENT_TONE[p.status]}>{p.status}</Pill>
              </li>
            ))}
          </ul>
        )}

        <PaymentUpload projectId={project.id} />
      </Card>

      {/* Deliverables */}
      <Card>
        <h2 className="mb-1 font-semibold">Your files</h2>
        <p className="mb-5 text-sm text-muted">
          Download links are private to you and expire after an hour.
        </p>
        {signed.length === 0 ? (
          <Empty>
            <Lock className="mx-auto mb-3 h-5 w-5 opacity-50" />
            Nothing released yet. Files appear here once the build is delivered.
          </Empty>
        ) : (
          <ul className="space-y-2">
            {signed.map((d) => (
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
                {d.url && (
                  <a
                    href={d.url}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-surface"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Timeline */}
      <Card>
        <h2 className="mb-5 font-semibold">Build history</h2>
        <Timeline updates={updates ?? []} />
      </Card>
    </div>
  );
}
