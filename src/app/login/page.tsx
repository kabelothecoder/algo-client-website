import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { SITE } from "@/lib/constants";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex-1 grid place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <h1 className="text-2xl">Client sign in</h1>
        <p className="mt-2 mb-8 text-sm text-muted">
          Track your build, message {SITE.name} and download your files.
        </p>
        <Suspense fallback={<div className="h-64" />}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </main>
  );
}
