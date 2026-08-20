"use client";

import { useActionState, useState } from "react";
import { AlertTriangle, Loader2, Send } from "lucide-react";
import { raiseComplaint, type ActionState } from "@/app/dashboard/actions";
import { respondToComplaint } from "@/app/admin/actions";
import {
  COMPLAINT_CATEGORY,
  COMPLAINT_STATUS_LABEL,
  COMPLAINT_TONE,
  formatDate,
  formatDateTime,
} from "@/lib/constants";
import type { Complaint } from "@/lib/types";
import { btnGhost, btnPrimary, inputClass, Label, Pill } from "@/components/ui";

export function ComplaintList({
  complaints,
  isAdmin = false,
}: {
  complaints: Complaint[];
  isAdmin?: boolean;
}) {
  if (complaints.length === 0) return null;

  return (
    <ul className="space-y-3">
      {complaints.map((c) => (
        <li
          key={c.id}
          className={`rounded-2xl border p-5 ${
            c.status === "resolved"
              ? "border-border bg-surface-2"
              : "border-danger/25 bg-danger/[0.07]"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">{COMPLAINT_CATEGORY[c.category]}</p>
              <p className="mt-0.5 text-xs text-muted">
                Raised {formatDateTime(c.created_at)}
                {c.incident_date && ` · relates to ${formatDate(c.incident_date)}`}
              </p>
            </div>
            <Pill tone={COMPLAINT_TONE[c.status]}>
              {COMPLAINT_STATUS_LABEL[c.status]}
            </Pill>
          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
            {c.body}
          </p>

          {c.admin_response && (
            <div className="mt-4 rounded-xl border border-border bg-background/50 p-4">
              <p className="text-xs uppercase tracking-wide text-gold">
                Developer response
                {c.responded_at && ` · ${formatDateTime(c.responded_at)}`}
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
                {c.admin_response}
              </p>
            </div>
          )}

          {isAdmin && c.status !== "resolved" && <AdminReply complaint={c} />}
        </li>
      ))}
    </ul>
  );
}

function AdminReply({ complaint }: { complaint: Complaint }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    respondToComplaint,
    {},
  );

  return (
    <form action={action} className="mt-4 space-y-3 border-t border-border pt-4">
      <input type="hidden" name="complaint_id" value={complaint.id} />
      <input type="hidden" name="project_id" value={complaint.project_id} />
      <textarea
        name="admin_response"
        rows={3}
        required
        className={inputClass}
        placeholder="What you're doing about it, and by when. A real date beats a reassurance."
      />
      <div className="flex flex-wrap gap-2">
        <button
          name="status"
          value="acknowledged"
          disabled={pending}
          className={btnGhost}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Reply &amp; keep open
        </button>
        <button
          name="status"
          value="resolved"
          disabled={pending}
          className={btnPrimary}
        >
          Reply &amp; mark resolved
        </button>
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}

export function ComplaintForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(
    raiseComplaint,
    {},
  );

  // The submitted complaint is already rendered by ComplaintList above (the
  // action revalidates), so on success this collapses back to a confirmation.
  // Comparing against the acknowledged token — rather than a boolean — keeps
  // a second complaint working, and avoids setState-in-effect entirely.
  const [ackToken, setAckToken] = useState<string | undefined>(undefined);
  const showSuccess = Boolean(state.ok) && state.token !== ackToken;

  if (!open || showSuccess) {
    return (
      <div className="space-y-3">
        {showSuccess && (
          <p className="rounded-xl bg-live/10 px-3.5 py-2.5 text-sm text-live ring-1 ring-inset ring-live/20">
            {state.ok}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setAckToken(state.token);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/[0.07] px-5 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/15"
        >
          <AlertTriangle className="h-4 w-4" />
          {showSuccess ? "Raise another complaint" : "Raise a complaint"}
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="project_id" value={projectId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>What is the problem?</Label>
          <select name="category" className={inputClass} required>
            {Object.entries(COMPLAINT_CATEGORY).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Date it relates to</Label>
          <input name="incident_date" type="date" className={inputClass} />
          <p className="mt-1.5 text-xs text-muted">
            e.g. the delivery date you were promised.
          </p>
        </div>
      </div>

      <div>
        <Label>What happened?</Label>
        <textarea
          name="body"
          rows={5}
          required
          className={inputClass}
          placeholder="Be specific — what you were told, when, and what you want done about it."
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger ring-1 ring-inset ring-danger/20">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit complaint
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={btnGhost}
        >
          Cancel
        </button>
      </div>
      <p className="text-xs text-muted">
        This is recorded with a timestamp and cannot be deleted by either of us.
        You get a written response within 5 business days.
      </p>
    </form>
  );
}
