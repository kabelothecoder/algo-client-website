"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDollarSign,
  Loader2,
  MessageCircleQuestion,
  Wrench,
} from "lucide-react";
import { submitQuote, type QuoteState } from "@/app/quote/actions";
import {
  BUDGET_BANDS,
  FALLBACK_SERVICE,
  SERVICES,
  SITE,
} from "@/lib/constants";
import { btnGhost, btnPrimary, inputClass, Label } from "@/components/ui";
import type { ServiceType } from "@/lib/types";

type Path = "budget" | "enquiry";

export function QuoteFlow() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState<ServiceType>("ea_build");
  const [path, setPath] = useState<Path>("budget");
  const [band, setBand] = useState(BUDGET_BANDS[1].id);
  // Held in state, not in the DOM: these fields live on different steps and
  // would be lost from the form the moment their step unmounts.
  const [systemNotes, setSystemNotes] = useState("");
  const [questions, setQuestions] = useState("");

  const [state, action, pending] = useActionState<QuoteState, FormData>(
    submitQuote,
    {},
  );

  const selectedBand = BUDGET_BANDS.find((b) => b.id === band)!;

  // ── Confirmation ─────────────────────────────────────────────────────────
  if (state.ok) {
    const declined = state.outcome === "declined";
    return (
      <div className="rounded-2xl border border-border bg-surface/50 p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/15">
          <Check className="h-5 w-5 text-gold" />
        </div>
        <h2 className="mt-5 text-xl font-semibold">
          {declined ? "No problem at all." : "Got it — I'll come back to you."}
        </h2>

        {declined ? (
          <>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">
              I&rsquo;ve noted what you were after. There&rsquo;s no follow-up
              spam and no pressure — if the budget changes, come back any time.
            </p>
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-sage/30 bg-sage/10 p-5 text-left">
              <p className="flex items-center gap-2 font-medium">
                <Wrench className="h-4 w-4 text-sage" />
                {FALLBACK_SERVICE.name}{" "}
                <span className="text-gold">{FALLBACK_SERVICE.from}</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {FALLBACK_SERVICE.blurb}
              </p>
            </div>
          </>
        ) : (
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">
            You&rsquo;ll get a written scope, a fixed price and a delivery date
            by email — usually within 24 hours. Nothing is payable until you
            accept it.
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={btnGhost}>
            Back to site
          </Link>
          <a
            href={SITE.devSite}
            target="_blank"
            rel="noreferrer"
            className={btnGhost}
          >
            See my dev work
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-8">
      {/* hidden state carried into the action */}
      <input type="hidden" name="service" value={service} />
      <input type="hidden" name="path" value={path} />
      <input type="hidden" name="budget_band" value={path === "budget" ? band : ""} />
      <input type="hidden" name="system_notes" value={systemNotes} />
      <input type="hidden" name="questions" value={path === "enquiry" ? questions : ""} />
      {/* `outcome` comes from whichever submit button was pressed — see step 3.
          A state-backed hidden input would lag a render behind the click and
          record the wrong answer. */}

      {/* Progress */}
      <ol className="flex items-center gap-2 text-xs">
        {["Service", "Your situation", "Details"].map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                step > i + 1
                  ? "bg-gold text-gold-ink"
                  : step === i + 1
                    ? "bg-gold/20 text-gold ring-1 ring-gold/40"
                    : "bg-surface-2 text-muted"
              }`}
            >
              {step > i + 1 ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className={step >= i + 1 ? "text-foreground" : "text-muted"}>
              {label}
            </span>
          </li>
        ))}
      </ol>

      {/* ── Step 1: service ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">What do you need built?</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => setService(s.slug)}
                className={`rounded-2xl border p-5 text-left transition ${
                  service === s.slug
                    ? "border-gold/60 bg-gold/[0.07]"
                    : "border-border bg-surface/50 hover:border-gold/30"
                }`}
              >
                <p className="font-medium">{s.name}</p>
                <p className="mt-1 text-sm text-muted">{s.pitch}</p>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={btnPrimary}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Step 2: budget or enquiry ───────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold">
            Do you have a budget in mind?
          </h2>
          <p className="text-sm text-muted">
            Either is fine. Knowing your budget lets me tell you straight away
            what&rsquo;s realistic; if you&rsquo;d rather explain the system
            first, I&rsquo;ll price it and send it back to you.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPath("budget")}
              className={`rounded-2xl border p-5 text-left transition ${
                path === "budget"
                  ? "border-gold/60 bg-gold/[0.07]"
                  : "border-border bg-surface/50 hover:border-gold/30"
              }`}
            >
              <CircleDollarSign className="h-5 w-5 text-gold" />
              <p className="mt-3 font-medium">I know my budget</p>
              <p className="mt-1 text-sm text-muted">
                Pick a range and see exactly what it buys.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPath("enquiry")}
              className={`rounded-2xl border p-5 text-left transition ${
                path === "enquiry"
                  ? "border-gold/60 bg-gold/[0.07]"
                  : "border-border bg-surface/50 hover:border-gold/30"
              }`}
            >
              <MessageCircleQuestion className="h-5 w-5 text-gold" />
              <p className="mt-3 font-medium">Quote my system</p>
              <p className="mt-1 text-sm text-muted">
                Describe it, ask questions, get a price back.
              </p>
            </button>
          </div>

          {path === "budget" && (
            <div className="space-y-3">
              <Label>Your budget</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {BUDGET_BANDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBand(b.id)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                      band === b.id
                        ? "border-gold/60 bg-gold/[0.07]"
                        : "border-border bg-surface-2 hover:border-gold/30"
                    }`}
                  >
                    <span className="font-medium">{b.label}</span>
                    <span className="ml-2 text-muted">{b.tier}</span>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-surface-2 p-5">
                <p className="text-xs uppercase tracking-wide text-gold">
                  {selectedBand.tier} · {selectedBand.lead}
                </p>
                <ul className="mt-3 space-y-2">
                  {selectedBand.includes.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-muted">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {path === "enquiry" && (
            <div className="space-y-4">
              <div>
                <Label>Describe your system</Label>
                <textarea
                  rows={5}
                  value={systemNotes}
                  onChange={(e) => setSystemNotes(e.target.value)}
                  className={inputClass}
                  placeholder="Pairs, timeframe, when it enters, when it exits, how risk is handled. Rough notes are fine."
                />
              </div>
              <div>
                <Label>Anything you want to ask me</Label>
                <textarea
                  rows={3}
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  className={inputClass}
                  placeholder="Can it run on a prop firm account? Will it work on MT4?"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={btnGhost}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className={btnPrimary}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: details + terms + decide ────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold">Where do I send the quote?</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Your name</Label>
              <input name="name" required className={inputClass} />
            </div>
            <div>
              <Label>Email</Label>
              <input
                name="email"
                type="email"
                required
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <Label>WhatsApp (optional)</Label>
            <input name="whatsapp" className={inputClass} placeholder="+27…" />
          </div>

          {path === "budget" && (
            <div>
              <Label>Anything I should know about the strategy?</Label>
              <textarea
                rows={4}
                value={systemNotes}
                onChange={(e) => setSystemNotes(e.target.value)}
                className={inputClass}
                placeholder="Optional — but the more you tell me, the tighter the quote."
              />
            </div>
          )}

          {/* Terms — stated before anyone commits */}
          <div className="rounded-2xl border border-border bg-surface-2 p-5">
            <p className="font-medium">How payment works</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                You get a written scope, a fixed price and a delivery date
                first. Nothing is payable until you accept it.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                <strong className="text-foreground/90">
                  Payment is upfront
                </strong>{" "}
                — the build starts once payment is confirmed in your portal. You
                have 12 hours to cancel for a full refund before work begins.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                If I miss the agreed date by more than 14 days without your
                agreement, you get a full refund. That&rsquo;s in the{" "}
                <Link href="/refunds" className="text-gold hover:underline">
                  refund policy
                </Link>
                , not just a promise.
              </li>
            </ul>
          </div>

          {state.error && (
            <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger ring-1 ring-inset ring-danger/20">
              {state.error}
            </p>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              name="outcome"
              value="proceeding"
              disabled={pending}
              className={`${btnPrimary} w-full`}
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Send me the quote
            </button>

            {/* The opt-out. Deliberately a real button, not fine print. */}
            <button
              type="submit"
              name="outcome"
              value="declined"
              disabled={pending}
              className="w-full rounded-xl border border-border px-5 py-2.5 text-sm text-muted transition hover:text-foreground disabled:opacity-50"
            >
              This is outside my budget right now
            </button>
            <p className="text-center text-xs text-muted">
              Choosing that costs you nothing and I won&rsquo;t chase you. I
              can point you at something cheaper instead.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" /> Back
          </button>
        </div>
      )}
    </form>
  );
}
