"use client";

import { useActionState } from "react";
import { Check, Loader2, Save, Send, Upload, X } from "lucide-react";
import {
  addStatusUpdate,
  deleteSpecial,
  markQuoteHandled,
  setSessionStatus,
  deleteTestimonial,
  reviewPayment,
  saveSpecial,
  saveTestimonial,
  toggleDeliverable,
  toggleSpecial,
  toggleTestimonial,
  updateAgreement,
  uploadDeliverable,
  type ActionState,
} from "@/app/admin/actions";
import { STATUS_LABEL } from "@/lib/constants";
import type { ProjectStatus, Special } from "@/lib/types";
import { btnGhost, btnPrimary, inputClass, Label } from "@/components/ui";

function Feedback({ state }: { state: ActionState }) {
  if (state.error)
    return (
      <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger ring-1 ring-inset ring-danger/20">
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p className="rounded-xl bg-live/10 px-3.5 py-2.5 text-sm text-live ring-1 ring-inset ring-live/20">
        {state.ok}
      </p>
    );
  return null;
}

const fileInputClass =
  "w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm file:mr-3 " +
  "file:rounded-lg file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs " +
  "file:font-semibold file:text-gold-ink";

// ── Project detail ─────────────────────────────────────────────────────────

export function AgreementForm({
  projectId,
  quotedAmount,
  agreedScope,
  dueDate,
}: {
  projectId: string;
  quotedAmount: number | null;
  agreedScope: string | null;
  dueDate: string | null;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateAgreement,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="project_id" value={projectId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Quoted amount (ZAR)</Label>
          <input
            name="quoted_amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={quotedAmount ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <Label>Delivery date</Label>
          <input
            name="due_date"
            type="date"
            defaultValue={dueDate ?? ""}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <Label>Agreed scope</Label>
        <textarea
          name="agreed_scope"
          rows={6}
          defaultValue={agreedScope ?? ""}
          className={inputClass}
          placeholder="Exactly what is included, and what is not. This is what the client sees and what you get held to."
        />
      </div>
      <Feedback state={state} />
      <button disabled={pending} className={btnPrimary}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save agreement
      </button>
    </form>
  );
}

export function StatusUpdateForm({
  projectId,
  current,
}: {
  projectId: string;
  current: ProjectStatus;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    addStatusUpdate,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="project_id" value={projectId} />
      <div>
        <Label>Status</Label>
        <select name="status" defaultValue={current} className={inputClass}>
          {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Note to the client (optional)</Label>
        <textarea
          name="note"
          rows={3}
          className={inputClass}
          placeholder="What changed, and what happens next."
        />
      </div>
      <Feedback state={state} />
      <button disabled={pending} className={btnPrimary}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Post update
      </button>
    </form>
  );
}

export function PaymentReviewForm({
  paymentId,
  projectId,
}: {
  paymentId: string;
  projectId: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    reviewPayment,
    {},
  );

  return (
    <form action={action} className="mt-3 space-y-3 border-t border-border pt-3">
      <input type="hidden" name="payment_id" value={paymentId} />
      <input type="hidden" name="project_id" value={projectId} />
      <input
        name="admin_note"
        className={inputClass}
        placeholder="Note (optional) — e.g. received, 50% deposit"
      />
      <div className="flex gap-2">
        <button
          name="decision"
          value="confirmed"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-xl bg-live/15 px-4 py-2 text-sm font-medium text-live ring-1 ring-inset ring-live/30 transition hover:bg-live/25 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Confirm
        </button>
        <button
          name="decision"
          value="rejected"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-xl bg-danger/15 px-4 py-2 text-sm font-medium text-danger ring-1 ring-inset ring-danger/30 transition hover:bg-danger/25 disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" /> Reject
        </button>
      </div>
      <Feedback state={state} />
    </form>
  );
}

export function DeliverableUploadForm({
  projectId,
  clientId,
}: {
  projectId: string;
  clientId: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    uploadDeliverable,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="client_id" value={clientId} />
      <div>
        <Label>File</Label>
        <input name="file" type="file" required className={fileInputClass} />
      </div>
      <div>
        <Label>Notes</Label>
        <input
          name="notes"
          className={inputClass}
          placeholder="v1.2 — adds session filter"
        />
      </div>
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="released"
          className="h-4 w-4 rounded border-border bg-surface-2 accent-[var(--gold)]"
        />
        Release to the client immediately
      </label>
      <Feedback state={state} />
      <button disabled={pending} className={btnPrimary}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Upload
      </button>
    </form>
  );
}

export function DeliverableToggle({
  deliverableId,
  projectId,
  released,
}: {
  deliverableId: string;
  projectId: string;
  released: boolean;
}) {
  const [, action, pending] = useActionState<ActionState, FormData>(
    toggleDeliverable,
    {},
  );

  return (
    <form action={action}>
      <input type="hidden" name="deliverable_id" value={deliverableId} />
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="released" value={String(!released)} />
      <button
        disabled={pending}
        className={`rounded-lg px-3 py-1.5 text-xs ring-1 ring-inset transition disabled:opacity-50 ${
          released
            ? "bg-live/15 text-live ring-live/30"
            : "bg-surface-2 text-muted ring-border hover:text-foreground"
        }`}
      >
        {released ? "Released" : "Hidden — release"}
      </button>
    </form>
  );
}

// ── Specials ───────────────────────────────────────────────────────────────

export function SpecialForm({ special }: { special?: Special }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveSpecial,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      {special && <input type="hidden" name="id" value={special.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Title</Label>
          <input
            name="title"
            required
            defaultValue={special?.title}
            className={inputClass}
            placeholder="October EA special"
          />
        </div>
        <div>
          <Label>Badge text</Label>
          <input
            name="discount_label"
            defaultValue={special?.discount_label ?? ""}
            className={inputClass}
            placeholder="25% off custom builds"
          />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <input
          name="description"
          defaultValue={special?.description ?? ""}
          className={inputClass}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Starts</Label>
          <input
            name="starts_at"
            type="datetime-local"
            defaultValue={special?.starts_at?.slice(0, 16) ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <Label>Ends</Label>
          <input
            name="ends_at"
            type="datetime-local"
            defaultValue={special?.ends_at?.slice(0, 16) ?? ""}
            className={inputClass}
          />
        </div>
      </div>
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={special?.active}
          className="h-4 w-4 rounded border-border bg-surface-2 accent-[var(--gold)]"
        />
        Show on the landing page
      </label>
      <Feedback state={state} />
      <button disabled={pending} className={btnPrimary}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {special ? "Update special" : "Create special"}
      </button>
    </form>
  );
}

export function SpecialToggle({ id, active }: { id: string; active: boolean }) {
  const [, action, pending] = useActionState<ActionState, FormData>(
    toggleSpecial,
    {},
  );
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={String(!active)} />
      <button
        disabled={pending}
        className={`rounded-lg px-3 py-1.5 text-xs ring-1 ring-inset transition disabled:opacity-50 ${
          active
            ? "bg-live/15 text-live ring-live/30"
            : "bg-surface-2 text-muted ring-border hover:text-foreground"
        }`}
      >
        {active ? "Live" : "Hidden"}
      </button>
    </form>
  );
}

export function DeleteButton({
  id,
  kind,
}: {
  id: string;
  kind: "special" | "testimonial";
}) {
  const [, action, pending] = useActionState<ActionState, FormData>(
    kind === "special" ? deleteSpecial : deleteTestimonial,
    {},
  );
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        disabled={pending}
        className="rounded-lg px-3 py-1.5 text-xs text-muted transition hover:text-danger disabled:opacity-50"
      >
        Delete
      </button>
    </form>
  );
}

// ── Testimonials ───────────────────────────────────────────────────────────

export function TestimonialForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveTestimonial,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label>Client name or handle</Label>
        <input name="client_name" required className={inputClass} />
      </div>
      <div>
        <Label>Quote</Label>
        <textarea name="quote" rows={3} className={inputClass} />
      </div>
      <div>
        <Label>Result screenshot</Label>
        <input
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className={fileInputClass}
        />
        <p className="mt-1.5 text-xs text-muted">
          Only post results you have permission to share and can back up if
          challenged. This image is public.
        </p>
      </div>
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="is_published"
          className="h-4 w-4 rounded border-border bg-surface-2 accent-[var(--gold)]"
        />
        Publish on the landing page
      </label>
      <Feedback state={state} />
      <button disabled={pending} className={btnPrimary}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Add result
      </button>
    </form>
  );
}

export function TestimonialToggle({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const [, action, pending] = useActionState<ActionState, FormData>(
    toggleTestimonial,
    {},
  );
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="is_published" value={String(!published)} />
      <button disabled={pending} className={btnGhost + " !px-3 !py-1.5 !text-xs"}>
        {published ? "Unpublish" : "Publish"}
      </button>
    </form>
  );
}

export function QuoteHandledToggle({
  id,
  handled,
}: {
  id: string;
  handled: boolean;
}) {
  const [, action, pending] = useActionState<ActionState, FormData>(
    markQuoteHandled,
    {},
  );
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="handled" value={String(!handled)} />
      <button
        disabled={pending}
        className={`rounded-lg px-3 py-1.5 text-xs ring-1 ring-inset transition-colors disabled:opacity-50 ${
          handled
            ? "bg-live/15 text-live ring-live/30"
            : "bg-surface-2 text-muted ring-border hover:text-foreground"
        }`}
      >
        {handled ? "Handled" : "Mark handled"}
      </button>
    </form>
  );
}

export function SessionStatusButtons({ id }: { id: string }) {
  const [, action, pending] = useActionState<ActionState, FormData>(
    setSessionStatus,
    {},
  );
  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="id" value={id} />
      <button
        name="status"
        value="confirmed"
        disabled={pending}
        className="rounded-lg bg-live/15 px-3 py-1.5 text-xs text-live ring-1 ring-inset ring-live/30 transition-colors hover:bg-live/25 disabled:opacity-50"
      >
        Confirm
      </button>
      <button
        name="status"
        value="cancelled"
        disabled={pending}
        className="rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:text-danger disabled:opacity-50"
      >
        Cancel
      </button>
    </form>
  );
}
