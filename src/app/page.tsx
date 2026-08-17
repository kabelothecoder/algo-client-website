import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Bug,
  FileCheck2,
  LineChart,
  MessageSquare,
  ReceiptText,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/reveal";
import { Logo, LogoMark } from "@/components/logo";
import { SectionTitle } from "@/components/ui";
import { SERVICES, SITE } from "@/lib/constants";
import type { Special, Testimonial } from "@/lib/types";

export const dynamic = "force-dynamic";

const SERVICE_ICON = {
  ea_build: Bot,
  indicator: LineChart,
  mobile_bot: Smartphone,
  code_review: Bug,
  other: Sparkles,
} as const;

const TRUST = [
  {
    icon: FileCheck2,
    title: "Scope agreed before you pay",
    body: "Every project starts with a written scope, a price and a delivery date, visible in your portal from day one. If it isn't written down, it isn't in the build.",
  },
  {
    icon: ReceiptText,
    title: "You see the price before you pay",
    body: "Scope, fixed price and delivery date land in your portal first. Payment is upfront and confirmed by hand — but if I miss the date by 14 days, the refund policy gives you everything back.",
  },
  {
    icon: MessageSquare,
    title: "One thread, nothing deleted",
    body: "Questions and complaints live on the project itself. The thread is append-only — neither of us can quietly edit history.",
  },
];

/**
 * The marketing page must render even if Supabase is unreachable or not yet
 * configured — a database blip should cost the specials banner, not the whole
 * shopfront.
 */
async function getMarketingData() {
  try {
    const supabase = await createClient();
    const [{ data: specials }, { data: testimonials }] = await Promise.all([
      supabase
        .from("specials")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .returns<Special[]>(),
      supabase
        .from("testimonials")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .limit(6)
        .returns<Testimonial[]>(),
    ]);

    return {
      special: specials?.[0] ?? null,
      results: testimonials ?? [],
      publicUrl: (path: string) =>
        supabase.storage.from("results").getPublicUrl(path).data.publicUrl,
    };
  } catch (err) {
    console.error("Landing page data unavailable", err);
    return { special: null, results: [] as Testimonial[], publicUrl: () => "" };
  }
}

export default async function LandingPage() {
  const { special, results, publicUrl } = await getMarketingData();

  return (
    <>
      {special && (
        <div className="relative z-20 border-b border-gold/25 bg-gold/10">
          <div className="mx-auto max-w-6xl px-6 py-2.5 text-center text-sm">
            <span className="font-medium text-gold">{special.title}</span>
            {special.discount_label && (
              <span className="text-gold"> — {special.discount_label}</span>
            )}
            {special.description && (
              <span className="hidden text-muted sm:inline">
                {" "}
                · {special.description}
              </span>
            )}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label={SITE.name}>
            <LogoMark textFrom="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={SITE.devSite}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-xl px-4 py-2 text-sm text-muted transition hover:text-foreground sm:inline-block"
            >
              algokabs.com
            </a>
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:text-foreground sm:px-4"
            >
              <span className="sm:hidden">Login</span>
              <span className="hidden sm:inline">Client login</span>
            </Link>
            <Link
              href="/quote"
              className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-gold-ink transition-colors hover:bg-gold-bright"
            >
              Get a quote
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-6 pt-28 pb-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            {/* one warm pool of light, not a neon wash */}
            <div className="absolute left-1/2 top-[-6rem] h-[34rem] w-[52rem] -translate-x-1/2 rounded-full bg-gold/[0.07] blur-[130px]" />
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="mb-14 flex justify-center">
              <Logo size="lg" />
            </div>

            <Reveal>
              <p className="eyebrow text-center">{SITE.position}</p>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="mt-7 text-center text-[2.75rem] leading-[1.08] md:text-6xl">
                Trading systems built to
                <span className="text-gold-gradient"> specification</span>,
                <br className="hidden sm:block" /> not to a sales pitch.
              </h1>
            </Reveal>

            <Reveal delay={0.18}>
              <p className="mx-auto mt-7 max-w-xl text-center text-lg leading-relaxed text-muted">
                I write Expert Advisors, indicators and trading tools in MQL4,
                MQL5 and Pine Script. Every client gets a portal with the agreed
                scope, the live build stage, a message thread and their files —
                so you never have to ask where your project is.
              </p>
            </Reveal>

            <Reveal delay={0.26}>
              <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/quote"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-sm font-semibold text-gold-ink transition-colors hover:bg-gold-bright"
                >
                  Get a quote
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/one-on-one"
                  className="rounded-xl border border-border bg-surface/60 px-7 py-3.5 text-sm font-medium transition-colors hover:border-border-strong hover:bg-surface"
                >
                  Book a one-on-one
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.34}>
              <p className="mt-8 text-center font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-muted-dim">
                MQL4 · MQL5 · Pine Script · MT4 / MT5 · TradingView
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Services ─────────────────────────────────────────────── */}
        <section id="services" className="scroll-mt-20 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionTitle
                eyebrow="Services"
                title="What I build"
                sub="Fixed scope, fixed price, agreed in writing before any money moves."
              />
            </Reveal>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {SERVICES.map((service, i) => {
                const Icon = SERVICE_ICON[service.slug];
                return (
                  <Reveal key={service.slug} delay={i * 0.07}>
                    <div className="group h-full rounded-2xl border border-border bg-surface/60 p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-surface lift">
                      <Icon className="h-5 w-5 text-sage transition-colors group-hover:text-gold" />
                      <h3 className="mt-5 text-xl">{service.name}</h3>
                      <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-gold">
                        {service.pitch}
                      </p>
                      <div className="rule my-5" />
                      <ul className="space-y-2.5">
                        {service.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex gap-3 text-sm leading-relaxed text-muted"
                          >
                            <span className="mt-2 h-px w-3 shrink-0 bg-sage" />
                            {b}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/quote?service=${service.slug}`}
                        className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-all hover:gap-2.5 hover:text-gold"
                      >
                        Get a quote <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How it works / trust ─────────────────────────────────── */}
        <section className="border-y border-border/60 bg-surface/30 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionTitle
                eyebrow="How it works"
                title="Built so you can check on me"
                sub="Most disputes in this industry are really about silence. This portal is my answer to that."
              />
            </Reveal>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {TRUST.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.09}>
                  <div className="h-full rounded-2xl border border-border bg-background/60 p-7">
                    <item.icon className="h-5 w-5 text-gold" />
                    <h3 className="mt-5 text-lg">{item.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  "Tell me your budget, or describe your system and I price it. Costs nothing.",
                  "You get a scope, a fixed price and a delivery date in writing. Nothing starts until you accept.",
                  "You pay upfront and I confirm it by hand. 12 hours to change your mind before work begins.",
                  "You watch it move through development and testing, then download your files.",
                ].map((step, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-border bg-background/60 p-6"
                  >
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs tracking-widest text-gold">
                      0{i + 1}
                    </span>
                    <div className="rule my-4" />
                    <p className="text-sm leading-relaxed text-muted">{step}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* ── Results ──────────────────────────────────────────────── */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionTitle
                eyebrow="Results"
                title="Client work"
                sub="Screenshots are shared with the client's permission and show past performance of a specific build. They are not a prediction of your results."
              />
            </Reveal>

            {results.length === 0 ? (
              <Reveal delay={0.1}>
                <div className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted">
                  No results published yet. Add them from the admin dashboard and
                  they appear here.
                </div>
              </Reveal>
            ) : (
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((t, i) => (
                  <Reveal key={t.id} delay={i * 0.06}>
                    <figure className="h-full overflow-hidden rounded-2xl border border-border bg-surface/50">
                      {t.image_path && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={publicUrl(t.image_path)}
                          alt={`Result shared by ${t.client_name}`}
                          className="aspect-4/3 w-full object-cover"
                          loading="lazy"
                        />
                      )}
                      <figcaption className="p-5">
                        {t.quote && (
                          <p className="text-sm leading-relaxed text-foreground/90">
                            &ldquo;{t.quote}&rdquo;
                          </p>
                        )}
                        <p className="mt-3 text-xs uppercase tracking-wide text-muted">
                          {t.client_name}
                        </p>
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            )}

            <Reveal delay={0.2}>
              <p className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border bg-surface/40 p-6 text-center text-xs leading-relaxed text-muted">
                <strong className="text-foreground/90">Risk notice.</strong>{" "}
                Trading foreign exchange and CFDs carries a high level of risk and
                can result in the loss of all your capital. I sell software
                development services, not financial advice, signals or managed
                accounts. No result shown here is a guarantee or forecast of future
                performance.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="px-6 pb-28">
          <Reveal>
            <div className="mx-auto max-w-4xl rounded-3xl border border-gold/20 bg-linear-to-b from-gold/[0.06] to-transparent p-12 text-center">
              <h2 className="text-3xl md:text-4xl">Tell me what you want built.</h2>
              <p className="mx-auto mt-4 max-w-lg leading-relaxed text-muted">
                Describe the strategy and get a written scope and price back.
                Costs nothing, and no payment until you accept it.
              </p>
              <Link
                href="/quote"
                className="mt-9 inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-sm font-semibold text-gold-ink transition-colors hover:bg-gold-bright"
              >
                Get a quote <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm text-muted sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <LogoMark />
            <p className="text-xs text-muted-dim">
              © {new Date().getFullYear()} {SITE.name} · {SITE.position}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/one-on-one" className="hover:text-foreground transition">
              One-on-one
            </Link>
            <Link href="/terms" className="hover:text-foreground transition">
              Terms
            </Link>
            <Link href="/refunds" className="hover:text-foreground transition">
              Refund policy
            </Link>
            <a href={SITE.whatsapp} className="hover:text-foreground transition">
              WhatsApp
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="hover:text-foreground transition"
            >
              Email
            </a>
            <a
              href={SITE.devSite}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition"
            >
              algokabs.com
            </a>
            <Link href="/login" className="hover:text-foreground transition">
              Client login
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
