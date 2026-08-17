import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <main className="flex-1 grid place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 mb-8 text-sm text-muted">
          Free to open. You only pay once a scope and price are agreed in writing.
        </p>
        <Suspense fallback={<div className="h-96" />}>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </main>
  );
}
