"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Loader2, MapPin, Monitor, Route } from "lucide-react";
import { bookSession, type BookingState } from "@/app/one-on-one/actions";
import {
  BASE_LOCATION,
  SESSION_TYPES,
  SUBURBS,
  distanceKm,
  formatMoney,
  travelFor,
} from "@/lib/constants";
import { btnGhost, btnPrimary, inputClass, Label } from "@/components/ui";

export function SessionBooking() {
  const [sessionId, setSessionId] = useState(SESSION_TYPES[0].id);
  const [mode, setMode] = useState<"in_person" | "online">("in_person");
  const [suburb, setSuburb] = useState("");

  const [state, action, pending] = useActionState<BookingState, FormData>(
    bookSession,
    {},
  );

  const session = SESSION_TYPES.find((s) => s.id === sessionId)!;

  const trip = useMemo(() => {
    if (mode === "online" || !suburb) return null;
    const match = SUBURBS.find((s) => s.name === suburb);
    if (!match) return null;
    const km = distanceKm(
      BASE_LOCATION.lat,
      BASE_LOCATION.lng,
      match.lat,
      match.lng,
    );
    return { km, ...travelFor(km) };
  }, [mode, suburb]);

  const total = session.fee + (trip?.fee ?? 0);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-border bg-surface/50 p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/15">
          <Check className="h-5 w-5 text-primary" />
        </div>
        <h2 className="mt-5 text-xl font-semibold">Session requested</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">
          {state.summary}
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          I&rsquo;ll confirm the time by WhatsApp or email. Nothing is payable
          until we&rsquo;ve agreed a slot.
        </p>
        <Link href="/" className={`${btnGhost} mt-8`}>
          Back to site
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="session_type" value={sessionId} />
      <input type="hidden" name="mode" value={mode} />

      {/* Session type */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">What do you need?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SESSION_TYPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSessionId(s.id)}
              className={`rounded-2xl border p-5 text-left transition ${
                sessionId === s.id
                  ? "border-primary/60 bg-primary/5"
                  : "border-border bg-surface/50 hover:border-primary/30"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-medium">{s.name}</p>
                <span className="shrink-0 text-sm font-semibold text-primary">
                  {formatMoney(s.fee)}
                </span>
              </div>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">
                {s.duration}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.blurb}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">In person or online?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("in_person")}
            className={`rounded-2xl border p-5 text-left transition ${
              mode === "in_person"
                ? "border-primary/60 bg-primary/5"
                : "border-border bg-surface/50 hover:border-primary/30"
            }`}
          >
            <MapPin className="h-5 w-5 text-primary" />
            <p className="mt-3 font-medium">In person</p>
            <p className="mt-1 text-sm text-muted">
              I come to you. Travel is charged by distance.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setMode("online")}
            className={`rounded-2xl border p-5 text-left transition ${
              mode === "online"
                ? "border-primary/60 bg-primary/5"
                : "border-border bg-surface/50 hover:border-primary/30"
            }`}
          >
            <Monitor className="h-5 w-5 text-primary" />
            <p className="mt-3 font-medium">Online</p>
            <p className="mt-1 text-sm text-muted">
              Screen share. No travel fee, anywhere in the country.
            </p>
          </button>
        </div>
      </div>

      {/* Distance */}
      {mode === "in_person" && (
        <div className="space-y-3">
          <Label>Your area</Label>
          <select
            name="suburb"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select your suburb…</option>
            {SUBURBS.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted">
            Not listed? Pick the closest one and tell me your exact address in
            the notes — I&rsquo;ll confirm the travel fee before we book.
          </p>

          {trip && (
            <div className="rounded-2xl border border-border bg-surface-2 p-5">
              <div className="flex items-center gap-2 text-sm">
                <Route className="h-4 w-4 text-primary" />
                <span className="font-medium">{trip.km} km</span>
                <span className="text-muted">
                  from {BASE_LOCATION.label} (straight line)
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">
                {trip.quoted
                  ? "That's outside my usual range — I'll quote the travel individually before you commit."
                  : trip.fee === 0
                    ? "You're close enough that there's no travel fee."
                    : `Travel fee: ${formatMoney(trip.fee)}`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Total */}
      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">{session.name}</span>
          <span>{formatMoney(session.fee)}</span>
        </div>
        {mode === "in_person" && (
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted">
              Travel{trip ? ` · ${trip.km} km` : ""}
            </span>
            <span>
              {trip
                ? trip.quoted
                  ? "Quoted"
                  : formatMoney(trip.fee)
                : "Select area"}
            </span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-primary/20 pt-3">
          <span className="font-medium">Total</span>
          <span className="text-lg font-bold">
            {trip?.quoted ? "On quote" : formatMoney(total)}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Your name</Label>
            <input name="name" required className={inputClass} />
          </div>
          <div>
            <Label>Email</Label>
            <input name="email" type="email" required className={inputClass} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>WhatsApp</Label>
            <input name="whatsapp" className={inputClass} placeholder="+27…" />
          </div>
          <div>
            <Label>Preferred date</Label>
            <input name="preferred_date" type="date" className={inputClass} />
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <textarea
            name="notes"
            rows={3}
            className={inputClass}
            placeholder="Your exact area, what you're running, what you want to get out of the session."
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300 ring-1 ring-inset ring-red-500/20">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Request this session
      </button>
      <p className="text-center text-xs text-muted">
        Requesting costs nothing. I confirm the slot first, and you pay on the
        day.
      </p>
    </form>
  );
}
