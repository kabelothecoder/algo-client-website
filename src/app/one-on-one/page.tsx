import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SessionBooking } from "@/components/session-booking";
import { BASE_LOCATION } from "@/lib/constants";

export const metadata = {
  title: "One-on-one sessions",
  description:
    "Sit down with the developer — setup, debugging, or turning your strategy into a spec. In person around Johannesburg or online.",
};

export default function OneOnOnePage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to site
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">One-on-one</h1>
      <p className="mt-3 mb-10 leading-relaxed text-muted">
        Sometimes it&rsquo;s faster to sit together than to trade messages. I work
        from <strong className="text-foreground/90">{BASE_LOCATION.label}</strong>{" "}
        and travel across Gauteng — pick your area below and you&rsquo;ll see the
        distance and the exact travel fee before you commit. Anywhere else in the
        country, we do it online for the same session fee and no travel.
      </p>

      <SessionBooking />
    </main>
  );
}
