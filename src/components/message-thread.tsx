"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Send } from "lucide-react";
import { sendMessage, type ActionState } from "@/app/dashboard/actions";
import { formatDateTime } from "@/lib/constants";
import type { ProjectMessage } from "@/lib/types";
import { inputClass } from "@/components/ui";

export function MessageThread({
  projectId,
  messages,
  viewerIsAdmin,
}: {
  projectId: string;
  messages: ProjectMessage[];
  viewerIsAdmin: boolean;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    sendMessage,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <div className="space-y-4">
      <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
            No messages yet. Anything you ask here stays on the record — neither
            side can edit or delete it later.
          </p>
        )}

        {messages.map((m) => {
          const mine = viewerIsAdmin ? m.from_admin : !m.from_admin;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  mine
                    ? "bg-primary/15 ring-1 ring-inset ring-primary/25"
                    : "bg-surface-2 ring-1 ring-inset ring-border"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className="mt-1.5 text-[11px] text-muted">
                  {m.from_admin ? "Developer" : "Client"} ·{" "}
                  {formatDateTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form ref={formRef} action={action} className="flex gap-2">
        <input type="hidden" name="project_id" value={projectId} />
        <input
          name="body"
          className={inputClass}
          placeholder="Ask a question, raise a problem…"
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>

      {state.error && <p className="text-sm text-red-300">{state.error}</p>}
    </div>
  );
}
