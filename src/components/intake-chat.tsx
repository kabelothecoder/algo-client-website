"use client";

import { useState } from "react";
import { Bot, Check, Loader2, Send, Sparkles } from "lucide-react";
import { saveIntake } from "@/app/dashboard/actions";
import { btnGhost, btnPrimary, inputClass } from "@/components/ui";
import type { ChatMessage } from "@/lib/types";

const OPENER =
  "Tell me what you want built. Plain language is fine — what pairs, what timeframe, when does it enter, when does it exit, and how do you want risk handled?";

export function IntakeChat({
  projectId,
  initialTranscript,
  initialSummary,
}: {
  projectId: string;
  initialTranscript: ChatMessage[];
  initialSummary: string | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialTranscript.length
      ? initialTranscript
      : [{ role: "assistant", content: OPENER }],
  );
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<string | null>(initialSummary);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "The assistant is unavailable.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMessages(next);
    } finally {
      setBusy(false);
    }
  }

  async function buildSpec() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, summarize: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not build the spec.");
      setSummary(data.reply);
      setSaved(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!summary) return;
    setBusy(true);
    const result = await saveIntake(projectId, messages, summary);
    setBusy(false);
    if (result?.error) setError(result.error);
    else setSaved(true);
  }

  return (
    <div className="space-y-4">
      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gold/12 ring-1 ring-inset ring-gold/25"
                  : "bg-surface-2 ring-1 ring-inset ring-border"
              }`}
            >
              {m.role === "assistant" && (
                <Bot className="mb-1.5 h-3.5 w-3.5 text-gold" />
              )}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
          </div>
        )}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          className={inputClass}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your strategy…"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="inline-flex shrink-0 items-center rounded-xl bg-gold px-4 text-sm font-semibold text-gold-ink transition hover:bg-gold-bright disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {error && (
        <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger ring-1 ring-inset ring-danger/20">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={buildSpec}
          disabled={busy || messages.length < 3}
          className={btnGhost}
          type="button"
        >
          <Sparkles className="h-4 w-4" /> Turn this into a spec
        </button>
        {summary && (
          <button onClick={save} disabled={busy || saved} className={btnPrimary} type="button">
            {saved ? <Check className="h-4 w-4" /> : null}
            {saved ? "Saved to project" : "Save spec to my project"}
          </button>
        )}
      </div>

      {summary && (
        <div className="rounded-2xl border border-gold/25 bg-gold/[0.06] p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gold">
            Draft specification
          </p>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {summary}
          </pre>
        </div>
      )}
    </div>
  );
}
