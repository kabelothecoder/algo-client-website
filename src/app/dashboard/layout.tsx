import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { isAdmin, requireUser } from "@/lib/auth";
import { LogoMark } from "@/components/logo";
import { SITE } from "@/lib/constants";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const { user } = await requireUser();
  const admin = await isAdmin();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/dashboard" aria-label={SITE.name}>
            <LogoMark textFrom="sm" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/one-on-one"
              className="hidden rounded-xl px-3 py-1.5 text-xs text-muted transition hover:text-foreground sm:inline-block"
            >
              Book a session
            </Link>
            {admin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            <span className="hidden text-sm text-muted sm:inline">
              {user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs text-muted transition hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </>
  );
}
