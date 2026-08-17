import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuoteFlow } from "@/components/quote-flow";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Get a quote",
  description:
    "Tell me your budget or describe your system, and get a written scope, price and delivery date back.",
};

export default function QuotePage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to site
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">Get a quote</h1>
      <p className="mt-3 mb-10 leading-relaxed text-muted">
        Two ways to do this: tell me your budget and I&rsquo;ll show you what
        it buys, or describe your system and I&rsquo;ll price it. Either way you
        get a written scope and a delivery date before any money changes hands —
        and if it&rsquo;s out of reach, say so and that&rsquo;s the end of it.
      </p>

      <QuoteFlow />

      <p className="mt-12 text-center text-sm text-muted">
        Want to see my wider engineering work first?{" "}
        <a
          href={SITE.devSite}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          algokabs.com
        </a>
      </p>
    </main>
  );
}
