"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary, inputClass, Label } from "@/components/ui";

/** Step 1 — ask for the reset email. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Always report success, even for unknown addresses — otherwise this page
    // becomes a way to find out which emails have accounts here.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-surface/60 p-7 text-center">
        <CheckCircle2 className="mx-auto h-6 w-6 text-live" />
        <h2 className="mt-4 text-xl">Check your email</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          If an account exists for <strong className="text-foreground">{email}</strong>,
          a reset link is on its way. It expires in one hour.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Nothing arrived? Check spam, then try again — the address has to match
          the one you signed up with exactly.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm text-gold hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label>Your email</Label>
        <input
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
        />
      </div>

      {error && (
        <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger ring-1 ring-inset ring-danger/25">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Send reset link
      </button>

      <p className="text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

/** Step 2 — set the new password, after the emailed link created a session. */
export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label>New password</Label>
        <input
          type="password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          autoFocus
        />
        <p className="mt-1.5 text-xs text-muted">At least 8 characters.</p>
      </div>

      <div>
        <Label>Confirm new password</Label>
        <input
          type="password"
          className={inputClass}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger ring-1 ring-inset ring-danger/25">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Save new password
      </button>
    </form>
  );
}
