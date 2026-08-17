import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ResetPasswordForm } from "@/components/password-forms";

export const metadata = { title: "Set a new password" };
export const dynamic = "force-dynamic";

/**
 * Reached from the emailed reset link. /auth/callback exchanges the code for a
 * session first, so by the time we get here the visitor is signed in — which is
 * what lets Supabase accept the password change.
 */
export default async function ResetPasswordPage() {
  const { user } = await requireUser();

  return (
    <main className="flex-1 grid place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl">Set a new password</h1>
        <p className="mt-2 mb-8 text-sm leading-relaxed text-muted">
          Signed in as <strong className="text-foreground">{user.email}</strong>.
          Choose something you haven&rsquo;t used elsewhere.
        </p>
        <ResetPasswordForm />
        <p className="mt-6 text-center text-sm text-muted">
          Changed your mind?{" "}
          <Link href="/dashboard" className="text-gold hover:underline">
            Go to your projects
          </Link>
        </p>
      </div>
    </main>
  );
}
