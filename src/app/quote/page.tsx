import Link from "next/link";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { QuoteFlow } from "@/components/quote-flow";
import { createClient } from "@/lib/supabase/server";
import { ANNOUNCEMENT, SITE } from "@/lib/constants";
import type { Special } from "@/lib/types";

export const metadata = {
  title: "Get a quote",
  description:
    "Tell me your budget or describe your system, and get a written scope, price and delivery date back.",
};

export const dynamic = "force-dynamic";

/** A live special belongs here as much as on the landing page — this is where
 *  someone decides whether they can afford it. */
async function getSpecial() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("specials")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .returns<Special[]>();
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

export default async function QuotePage() {
  const special = await getSpecial();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to site
      </Link>

      <h1 className="text-3xl tracking-tight">Get a quote</h1>
      <p className="mt-3 mb-8 leading-relaxed text-muted">
        Two ways to do this: tell me your budget and I&rsquo;ll show you what it
        buys, or describe your system and I&rsquo;ll price it. Either way you get
        a written scope and a delivery date before any money changes hands — and
        if it&rsquo;s out of reach, say so and that&rsquo;s the end of it.
      </p>

      {special && (
        <div className="mb-10 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/[0.07] p-5">
          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div>
            <p className="font-medium text-gold">
              {special.title}
              {special.discount_label && (
                <span className="font-normal"> — {special.discount_label}</span>
              )}
            </p>
            {special.description && (
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {special.description}
              </p>
            )}
            <p className="mt-2 text-sm text-muted">
              The bands below are the normal prices. Your quote comes back with
              the discount already applied.
            </p>
          </div>
        </div>
      )}

      {ANNOUNCEMENT.active && (
        <div className="mb-10 flex items-start gap-3 rounded-2xl border border-border bg-surface/60 p-5">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
          <div>
            <p className="font-medium">{ANNOUNCEMENT.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {ANNOUNCEMENT.footnote}
            </p>
          </div>
        </div>
      )}

      <QuoteFlow />

      <p className="mt-12 text-center text-sm text-muted">
        Want to see my wider engineering work first?{" "}
        <a
          href={SITE.devSite}
          target="_blank"
          rel="noreferrer"
          className="text-gold hover:underline"
        >
          algokabs.com
        </a>
      </p>
    </main>
  );
}
