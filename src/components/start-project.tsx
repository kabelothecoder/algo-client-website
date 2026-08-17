"use client";

import { useActionState, useState } from "react";
import { History, Loader2, Plus, Sparkles } from "lucide-react";
import {
  claimExistingProject,
  createProject,
  type ActionState,
} from "@/app/dashboard/actions";
import { SERVICES } from "@/lib/constants";
import { btnPrimary, inputClass, Label } from "@/components/ui";

function Err({ state }: { state: ActionState }) {
  if (!state.error) return null;
  return (
    <p className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300 ring-1 ring-inset ring-red-500/20">
      {state.error}
    </p>
  );
}

function ServiceSelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <select
      name="service"
      className={inputClass}
      defaultValue={defaultValue ?? "ea_build"}
    >
      {SERVICES.map((s) => (
        <option key={s.slug} value={s.slug}>
          {s.name}
        </option>
      ))}
      <option value="other">Something else</option>
    </select>
  );
}

export function StartProject({ defaultService }: { defaultService?: string }) {
  const [tab, setTab] = useState<"new" | "existing">("new");

  const [newState, newAction, newPending] = useActionState<ActionState, FormData>(
    createProject,
    {},
  );
  const [claimState, claimAction, claimPending] = useActionState<
    ActionState,
    FormData
  >(claimExistingProject, {});

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setTab("new")}
          className={`rounded-2xl border p-5 text-left transition ${
            tab === "new"
              ? "border-primary/60 bg-primary/5"
              : "border-border bg-surface-2 hover:border-primary/30"
          }`}
        >
          <Sparkles className="h-5 w-5 text-primary" />
          <p className="mt-3 font-medium">Start a new project</p>
          <p className="mt-1 text-sm text-muted">
            Get a written scope and price before paying anything.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setTab("existing")}
          className={`rounded-2xl border p-5 text-left transition-colors ${
            tab === "existing"
              ? "border-sage/60 bg-sage/10"
              : "border-border bg-surface-2 hover:border-sage/40"
          }`}
        >
          <History className="h-5 w-5 text-sage" />
          <p className="mt-3 font-medium">Report an order I already paid for</p>
          <p className="mt-1 text-sm text-muted">
            Paid before this portal existed? Log it here and attach your proof.
          </p>
        </button>
      </div>

      {tab === "new" ? (
        <form action={newAction} className="space-y-4">
          <div>
            <Label>Project title</Label>
            <input
              name="title"
              className={inputClass}
              placeholder="London breakout EA for XAUUSD"
              required
            />
          </div>
          <div>
            <Label>Service</Label>
            <ServiceSelect defaultValue={defaultService} />
          </div>
          <div>
            <Label>What do you want built?</Label>
            <textarea
              name="brief"
              rows={5}
              className={inputClass}
              placeholder="Rough notes are fine — you can refine this with the AI assistant once the project exists."
            />
          </div>
          <Err state={newState} />
          <button type="submit" disabled={newPending} className={btnPrimary}>
            {newPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create project
          </button>
        </form>
      ) : (
        <form action={claimAction} className="space-y-4">
          <p className="rounded-xl border border-sage/30 bg-sage/10 p-4 text-sm leading-relaxed text-muted">
            Every outstanding order will be built and delivered. Log it here and
            it goes straight to the top of the queue with a timestamped record —
            then attach your proof of payment on the next screen.
          </p>

          <div>
            <Label>What did you order?</Label>
            <input
              name="title"
              className={inputClass}
              placeholder="Mega bot V2 sniper"
              required
            />
          </div>
          <div>
            <Label>Service</Label>
            <ServiceSelect />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>When did you pay?</Label>
              <input name="ordered_on" type="date" className={inputClass} />
            </div>
            <div>
              <Label>How much did you pay?</Label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                placeholder="1000.00"
              />
            </div>
          </div>
          <div>
            <Label>Anything else I should know?</Label>
            <textarea
              name="brief"
              rows={4}
              className={inputClass}
              placeholder="What was agreed, what you're still waiting for, how you paid."
            />
          </div>
          <Err state={claimState} />
          <button type="submit" disabled={claimPending} className={btnPrimary}>
            {claimPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <History className="h-4 w-4" />
            )}
            Log my order
          </button>
        </form>
      )}
    </div>
  );
}
