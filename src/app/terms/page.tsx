import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SITE } from "@/lib/constants";

export const metadata = { title: "Terms of Service" };

const UPDATED = "17 August 2026";

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 mb-3 text-lg font-semibold">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 leading-relaxed text-muted">{children}</p>;
}

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to site
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted">Last updated {UPDATED}</p>

      <H>1. Who you are contracting with</H>
      <P>
        These terms govern custom software development services provided by{" "}
        {SITE.name} (&ldquo;the Developer&rdquo;) to you (&ldquo;the
        Client&rdquo;). By paying a deposit you accept these terms.
      </P>

      <H>2. What is being sold</H>
      <P>
        The Developer sells <strong>software development services</strong> —
        Expert Advisors, indicators, scripts, code review and related work. The
        Developer does not sell financial advice, trading signals, managed
        accounts, or any financial product, and is not a licensed financial
        services provider.
      </P>

      <H>3. No performance guarantee</H>
      <P>
        Software is delivered to the agreed specification. It is{" "}
        <strong>not</strong> warranted to be profitable. Trading foreign exchange
        and CFDs carries a high risk of loss, including total loss of capital.
        Backtest results describe past behaviour on historical data and do not
        predict future results. The Client accepts full responsibility for any
        trading decision and any capital deployed.
      </P>

      <H>4. Scope and quotation</H>
      <P>
        Before any payment is requested, the Developer will record a written
        scope, a fixed price and a delivery date in the Client&rsquo;s portal.
        Work is limited to that written scope. Anything not written down is not
        included, and either party may decline to proceed before payment at no
        cost.
      </P>

      <H>5. Payment</H>
      <P>
        Payment is <strong>due in full upfront</strong>. Work begins once your
        proof of payment has been reviewed and marked confirmed in your portal —
        not when it is uploaded. The confirmation is timestamped and visible to
        you.
      </P>
      <P>
        Because you pay before work starts, section 6 below is the protection
        that balances it: a missed deadline is the Developer&rsquo;s risk, and
        entitles you to your money back in full.
      </P>

      <H>6. Delivery and delay</H>
      <P>
        The Developer will deliver by the agreed date. If delivery will be late,
        the Developer will say so in the project thread{" "}
        <strong>before</strong> the date passes, with a revised date. If the
        Developer misses the revised date by more than 14 days without the
        Client&rsquo;s written agreement, the Client may cancel and claim a
        refund under the Refund Policy.
      </P>

      <H>7. Corrections and revisions</H>
      <P>
        Where the delivered build does not match the agreed scope, the Developer
        will correct it at no charge until it does. Report it in the project
        thread within 14 days of delivery.
      </P>
      <P>
        Changes to the strategy itself, new features, or rules not in the written
        scope are new work and are quoted separately.
      </P>

      <H>8. Client responsibilities</H>
      <P>
        The Client must supply the strategy rules, respond to questions within a
        reasonable time, and provide any account or platform access the build
        requires. A project stalled by the Client for more than 30 days may be
        placed on hold; the deposit remains allocated to that project.
      </P>

      <H>9. Intellectual property</H>
      <P>
        On delivery the Client receives the compiled build, and the source where
        the agreed scope includes it, for their own use. The Developer retains the right to reuse
        generic libraries, frameworks and techniques not unique to the
        Client&rsquo;s strategy. The Client&rsquo;s strategy rules remain the
        Client&rsquo;s. The Developer will not resell a build unique to a Client
        without written permission.
      </P>

      <H>10. Confidentiality</H>
      <P>
        The Developer will not disclose the Client&rsquo;s strategy to third
        parties. Nothing is published as a testimonial, screenshot or case study
        without the Client&rsquo;s written permission.
      </P>

      <H>11. Limitation of liability</H>
      <P>
        To the extent permitted by law, the Developer&rsquo;s total liability is
        limited to the amount actually paid for the affected project. The
        Developer is not liable for trading losses, missed trades, broker or VPS
        outages, slippage, or platform changes outside the Developer&rsquo;s
        control. Nothing here limits liability for fraud or for anything that
        cannot lawfully be limited.
      </P>

      <H>12. Consumer rights</H>
      <P>
        Nothing in these terms limits the Client&rsquo;s rights under the
        Consumer Protection Act 68 of 2008 or the Electronic Communications and
        Transactions Act 25 of 2002. Where these terms conflict with those Acts,
        those Acts apply.
      </P>

      <H>13. Disputes</H>
      <P>
        Raise a dispute in the project message thread first — it is timestamped
        and neither party can edit it. The Developer will respond within 5
        business days. Unresolved disputes may be referred to the National
        Consumer Commission. These terms are governed by South African law.
      </P>

      <H>14. Contact</H>
      <P>
        <a href={`mailto:${SITE.email}`} className="text-primary hover:underline">
          {SITE.email}
        </a>
      </P>

      <p className="mt-12 rounded-2xl border border-border bg-surface/40 p-5 text-xs leading-relaxed text-muted">
        This is a plain-language template, not legal advice. Have it reviewed by
        a South African attorney before you rely on it commercially.
      </p>
    </main>
  );
}
