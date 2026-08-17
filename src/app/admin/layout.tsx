import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { LogoMark } from "@/components/logo";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/quotes", label: "Quotes" },
  { href: "/admin/sessions", label: "Sessions" },
  { href: "/admin/specials", label: "Specials" },
  { href: "/admin/testimonials", label: "Results" },
  { href: "/dashboard", label: "Client view" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <LogoMark textFrom="sm" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-gold">
              <ShieldCheck className="h-3 w-3" /> Admin
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-1.5 text-muted transition hover:bg-surface hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-muted transition hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </>
  );
}
