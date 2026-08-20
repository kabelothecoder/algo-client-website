"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Upload } from "lucide-react";
import {
  uploadPaymentProof,
  type ActionState,
} from "@/app/dashboard/actions";
import { btnPrimary, inputClass, Label } from "@/components/ui";

export function PaymentUpload({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    uploadPaymentProof,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <input type="hidden" name="project_id" value={projectId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Amount paid</Label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            className={inputClass}
            placeholder="2500.00"
          />
        </div>
        <div>
          <Label>Your reference</Label>
          <input name="reference" className={inputClass} placeholder="EFT ref" />
        </div>
      </div>

      <div>
        <Label>Proof of payment</Label>
        <input
          name="proof"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          required
          className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-gold-ink"
        />
        <p className="mt-1.5 text-xs text-muted">
          PNG, JPG, WEBP or PDF, under 10 MB. Only you and the developer can see it.
        </p>
      </div>

      {state.error && (
        <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger ring-1 ring-inset ring-danger/20">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-xl bg-live/10 px-3.5 py-2.5 text-sm text-live ring-1 ring-inset ring-live/20">
          {state.ok}
        </p>
      )}

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Submit proof of payment
      </button>
    </form>
  );
}
