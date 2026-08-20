import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SITE } from "@/lib/constants";

export const metadata = { title: "Refund Policy" };

const UPDATED = "17 August 2026";

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 mb-3 text-lg font-semibold">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 leading-relaxed text-muted">{children}</p>;
}

export default function RefundsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to site
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
      <p className="mt-2 text-sm text-muted">Effective {UPDATED}</p>

      <p className="mt-8 rounded-2xl border border-gold/25 bg-gold/[0.06] p-5 leading-relaxed">
        Custom software is built for one client and cannot be resold, so it is
        not returnable the way a physical product is. What you are protected
        against is <strong>not receiving what you paid for</strong>. This policy
        sets out exactly when money is kept and when it comes back.
      </p>

      {/* Existing clients — a commitment, dated, in public. */}
      <div className="mt-6 rounded-2xl border border-sage/30 bg-sage/10 p-5">
        <p className="font-medium">Projects ordered before {UPDATED}</p>
        <p className="mt-2 leading-relaxed text-muted">
          This policy applies to projects ordered on or after {UPDATED}. Anything
          ordered before that date is governed by the terms that applied when you
          ordered it, and nothing here changes those.
        </p>
        <p className="mt-3 leading-relaxed text-muted">
          To be explicit about the backlog:{" "}
          <strong className="text-foreground/90">
            every outstanding project will be built and delivered.
          </strong>{" "}
          If you are waiting, sign in to your portal — your build stage, a
          delivery date and a message thread are all there, and you will get a
          straight answer rather than silence. If you would rather discuss a
          refund, say so in that thread and you will get a decision in writing
          within 5 business days.
        </p>
      </div>

      <H>1. Before work starts — 12-hour window</H>
      <P>
        Payment is taken upfront. You may cancel and receive a{" "}
        <strong>100% refund</strong> if you tell the Developer{" "}
        <strong>within 12 hours of your payment being confirmed</strong> and
        before your project has been marked <em>In development</em>, whichever
        comes first.
      </P>
      <P>
        No explanation is needed. Refunds under this section are paid within 7
        business days.
      </P>

      <H>2. After work starts — not refundable</H>
      <P>
        Once your project is marked <em>In development</em>, or once the 12-hour
        window has passed, the fee covers development time committed to your
        build and is not refundable on a change of mind.
      </P>
      <P>
        The scope, the price and the start date are written into your portal
        before you pay, and the moment work starts is timestamped there. This
        cannot be applied retroactively or backdated.
      </P>

      <H>3. If delivery is late — you can cancel</H>
      <P>
        If the Developer misses the agreed delivery date by more than{" "}
        <strong>14 days</strong> without your written agreement to a new date,
        you may cancel and receive a <strong>full refund of everything you have
        paid</strong> within 7 business days.
      </P>
      <P>
        This applies regardless of how much work was done. Late delivery is the
        Developer&rsquo;s risk, not yours — and it is what makes paying upfront
        reasonable.
      </P>

      <H>4. If the build does not match the agreed scope</H>
      <P>
        Report it in your project thread within 14 days of delivery and the
        Developer will correct it at no charge, for as many rounds as it takes to
        match the written scope.
      </P>
      <P>
        Corrections are the remedy here rather than a refund. Delivered work is
        not refundable once it is in your hands.
      </P>

      <H>5. What is not a refund reason</H>
      <P>
        The software works to specification but the strategy loses money.
        Profitability is never guaranteed and cannot be — the Developer builds
        the rules you supply, and markets do what they do. A losing strategy
        correctly implemented is a delivered product.
      </P>
      <P>
        Also not refundable: your broker changing conditions, a VPS you control
        going down, MetaTrader updates breaking third-party tools, or you
        deciding to trade the system differently to how it was specified.
      </P>

      <H>6. Why payment is upfront</H>
      <P>
        Custom builds are written for one client and cannot be resold, so the
        Developer carries the whole cost if a client walks away mid-build.
        Payment upfront is what keeps prices where they are.
      </P>
      <P>
        The trade for that is section 3: a missed deadline gets you{" "}
        <strong>all of your money back</strong>, not a credit and not a partial.
        That clause exists precisely because you paid first.
      </P>

      <H>7. How to request a refund</H>
      <P>
        Post it in your project message thread, or email{" "}
        <a href={`mailto:${SITE.email}`} className="text-gold hover:underline">
          {SITE.email}
        </a>
        . You will get a decision within 5 business days and the reason in
        writing. Approved refunds are paid to the account the payment came from
        within 7 business days.
      </P>

      <H>8. Your statutory rights</H>
      <P>
        This policy does not limit your rights under the Consumer Protection Act
        68 of 2008. Where it conflicts with that Act, the Act applies. You may
        refer an unresolved dispute to the National Consumer Commission.
      </P>

      <p className="mt-12 rounded-2xl border border-border bg-surface/40 p-5 text-xs leading-relaxed text-muted">
        This is a plain-language template, not legal advice. Have it reviewed by
        a South African attorney before you rely on it commercially.
      </p>
    </main>
  );
}
