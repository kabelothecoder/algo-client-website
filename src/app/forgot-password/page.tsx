import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/components/password-forms";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <main className="flex-1 grid place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
        <h1 className="text-2xl">Reset your password</h1>
        <p className="mt-2 mb-8 text-sm leading-relaxed text-muted">
          Enter the email you signed up with and I&rsquo;ll send you a link to
          set a new password.
        </p>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
