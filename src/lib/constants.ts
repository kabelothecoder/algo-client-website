import type { ProjectStatus, ServiceType } from "./types";

export const SITE = {
  name: "AlgoKabs",
  position: "Systems Engineering & Trading Automation",
  tagline: "Custom trading bots, built to spec and tracked in the open.",
  devSite: "https://algokabs.com",
  whatsapp: "https://wa.me/27816349103",
  email: "kabelongcwatywa@icloud.com",
};

/**
 * Budget bands shown on /quote. Edit the prices here — they are the single
 * source of truth for the site and should match what you actually charge.
 */
export const BUDGET_BANDS: {
  id: string;
  label: string;
  tier: string;
  includes: string[];
  lead: string;
}[] = [
  {
    id: "under_1500",
    label: "Under R1,500",
    tier: "Starter",
    lead: "3–5 working days",
    includes: [
      "One strategy, one instrument, one timeframe",
      "Fixed lot or simple percentage risk",
      "Basic stop loss and take profit",
      "Compiled EA plus setup instructions",
    ],
  },
  {
    id: "1500_3000",
    label: "R1,500 – R3,000",
    tier: "Standard",
    lead: "5–7 working days",
    includes: [
      "Everything in Starter",
      "Proper risk management and smart lot sizing",
      "Multi-take-profit, break-even and trailing logic",
      "Session and spread filters",
      "Backtest report on delivery",
    ],
  },
  {
    id: "3000_6000",
    label: "R3,000 – R6,000",
    tier: "Advanced",
    lead: "7–10 working days",
    includes: [
      "Everything in Standard",
      "Optimisation pass across your date range",
      "Prop-firm rules — daily loss caps, max drawdown",
      "News and volatility filters",
      "Multi-pair support",
      "Source code released with the build",
    ],
  },
  {
    id: "over_6000",
    label: "R6,000+",
    tier: "Bespoke",
    lead: "Quoted per project",
    includes: [
      "Multi-strategy or portfolio systems",
      "Custom dashboards and reporting",
      "VPS deployment and monitoring setup",
      "Ongoing revisions by arrangement",
    ],
  },
];

// ── One-on-one sessions ─────────────────────────────────────────────────────

/** Where you travel from. Update if you move. */
export const BASE_LOCATION = {
  label: "Fourways / Sandton, Johannesburg",
  lat: -26.0167,
  lng: 28.0083,
};

export const SESSION_TYPES = [
  {
    id: "setup",
    name: "Setup & installation",
    duration: "90 minutes",
    fee: 650,
    blurb:
      "I install your EA on your terminal or VPS, configure the inputs with you, and make sure it runs before I leave.",
  },
  {
    id: "spec",
    name: "Strategy to spec",
    duration: "60 minutes",
    fee: 450,
    blurb:
      "We turn your idea into a written build specification you can hand to any developer — including me.",
  },
  {
    id: "training",
    name: "Full onboarding",
    duration: "Half day",
    fee: 1200,
    blurb:
      "Setup, backtesting, optimisation and risk settings walked through end to end until you can run it yourself.",
  },
  {
    id: "debug",
    name: "Live debugging",
    duration: "60 minutes",
    fee: 550,
    blurb:
      "Screen-share or in person — we find why your EA misfires and fix it while you watch.",
  },
];

/**
 * Travel is charged by straight-line distance from the base, in bands.
 * Bands avoid arguing about routes, and the number is shown before booking.
 */
export const TRAVEL_BANDS: { maxKm: number; fee: number; label: string }[] = [
  { maxKm: 15, fee: 0, label: "No travel fee" },
  { maxKm: 30, fee: 150, label: "R150 travel" },
  { maxKm: 60, fee: 300, label: "R300 travel" },
  { maxKm: 120, fee: 550, label: "R550 travel" },
];

/** Gauteng suburbs with approximate centres, for the distance estimate. */
export const SUBURBS: { name: string; lat: number; lng: number }[] = [
  { name: "Fourways", lat: -26.0167, lng: 28.0083 },
  { name: "Lonehill", lat: -26.0167, lng: 28.0167 },
  { name: "Douglasdale", lat: -26.0333, lng: 28.0 },
  { name: "Bryanston", lat: -26.06, lng: 28.02 },
  { name: "Sunninghill", lat: -26.03, lng: 28.07 },
  { name: "Woodmead", lat: -26.05, lng: 28.0833 },
  { name: "Rivonia", lat: -26.055, lng: 28.06 },
  { name: "Kyalami", lat: -25.9833, lng: 28.0667 },
  { name: "Sandton", lat: -26.107, lng: 28.0567 },
  { name: "Randburg", lat: -26.0936, lng: 27.9994 },
  { name: "Ferndale", lat: -26.09, lng: 28.0 },
  { name: "Northgate", lat: -26.0667, lng: 27.9667 },
  { name: "Honeydew", lat: -26.05, lng: 27.9333 },
  { name: "Cosmo City", lat: -26.0167, lng: 27.9333 },
  { name: "Diepsloot", lat: -25.9333, lng: 28.0167 },
  { name: "Midrand", lat: -25.9992, lng: 28.1263 },
  { name: "Rosebank", lat: -26.142, lng: 28.0424 },
  { name: "Alexandra", lat: -26.103, lng: 28.098 },
  { name: "Northcliff", lat: -26.15, lng: 27.9667 },
  { name: "Melville", lat: -26.175, lng: 28.0 },
  { name: "Johannesburg CBD", lat: -26.2041, lng: 28.0473 },
  { name: "Roodepoort", lat: -26.1625, lng: 27.8725 },
  { name: "Krugersdorp", lat: -26.1, lng: 27.77 },
  { name: "Soweto", lat: -26.2678, lng: 27.8585 },
  { name: "Edenvale", lat: -26.14, lng: 28.15 },
  { name: "Kempton Park", lat: -26.1, lng: 28.23 },
  { name: "Tembisa", lat: -25.9964, lng: 28.2264 },
  { name: "Germiston", lat: -26.2178, lng: 28.1672 },
  { name: "Boksburg", lat: -26.2125, lng: 28.2625 },
  { name: "Alberton", lat: -26.2672, lng: 28.122 },
  { name: "Katlehong", lat: -26.33, lng: 28.15 },
  { name: "Vosloorus", lat: -26.35, lng: 28.2 },
  { name: "Benoni", lat: -26.1885, lng: 28.3208 },
  { name: "Springs", lat: -26.25, lng: 28.44 },
  { name: "Centurion", lat: -25.8603, lng: 28.1894 },
  { name: "Pretoria CBD", lat: -25.7479, lng: 28.2293 },
  { name: "Mamelodi", lat: -25.7167, lng: 28.3833 },
  { name: "Soshanguve", lat: -25.5167, lng: 28.1 },
  { name: "Vereeniging", lat: -26.6731, lng: 27.9319 },
  { name: "Vanderbijlpark", lat: -26.71, lng: 27.84 },
];

/** Great-circle distance in km. Straight line, not driving distance. */
export function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

export function travelFor(km: number) {
  const band = TRAVEL_BANDS.find((b) => km <= b.maxKm);
  return band
    ? { fee: band.fee, label: band.label, quoted: false }
    : { fee: 0, label: "Quoted individually", quoted: true };
}

/** Fast, low-risk work — the honest answer for a tight budget. */
export const FALLBACK_SERVICE = {
  name: "Code Review & Bug Fixing",
  from: "from R450",
  blurb:
    "If a build is out of reach right now, I can diagnose and fix an EA you already have. Usually same or next day, and you get a written report of what was wrong.",
};

export const SERVICES: {
  slug: ServiceType;
  name: string;
  pitch: string;
  bullets: string[];
}[] = [
  {
    slug: "ea_build",
    name: "Custom MQL Bots",
    pitch: "Your strategy, automated.",
    bullets: [
      "MQL4 / MQL5 Expert Advisors written from your rules",
      "Risk controls, session filters, prop-firm limits baked in",
      "Backtest report and .ex4/.ex5 + source on delivery",
    ],
  },
  {
    slug: "indicator",
    name: "TradingView Indicators",
    pitch: "Pine Script. Clean charts.",
    bullets: [
      "Custom Pine Script v5 indicators and screeners",
      "Alerts wired to webhooks if you want automation",
      "Non-repainting logic, stated plainly up front",
    ],
  },
  {
    slug: "mobile_bot",
    name: "Mobile Bots",
    pitch: "Automated trading, wherever you are.",
    bullets: [
      "VPS-hosted execution you can monitor from your phone",
      "Pine Script or MQL5 signal source",
      "Setup walkthrough included",
    ],
  },
  {
    slug: "code_review",
    name: "Code Review & Bug Fixing",
    pitch: "Fix it. Debug. Upgrade.",
    bullets: [
      "Diagnosis of an EA that misfires, over-trades or won't compile",
      "Written report of what was wrong and what changed",
      "Fixed source returned to you — no black boxes",
    ],
  },
];

export const SERVICE_LABEL: Record<ServiceType, string> = {
  ea_build: "Custom MQL Bot",
  indicator: "TradingView Indicator",
  code_review: "Code Review & Bug Fixing",
  mobile_bot: "Mobile Bot",
  other: "Other",
};

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  received: "Received",
  scoping: "Scoping",
  in_dev: "In development",
  testing: "Testing",
  revision: "Revision",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Ordered pipeline shown as the client-facing progress bar. */
export const STATUS_FLOW: ProjectStatus[] = [
  "received",
  "scoping",
  "in_dev",
  "testing",
  "delivered",
];

export const STATUS_TONE: Record<ProjectStatus, string> = {
  received: "bg-muted-dim/15 text-muted ring-border-strong",
  scoping: "bg-sage/15 text-sage ring-sage/30",
  in_dev: "bg-gold/12 text-gold ring-gold/30",
  testing: "bg-warn/15 text-warn ring-warn/30",
  revision: "bg-warn/15 text-warn ring-warn/30",
  delivered: "bg-live/15 text-live ring-live/30",
  cancelled: "bg-danger/12 text-danger ring-danger/30",
};

export const COMPLAINT_CATEGORY: Record<string, string> = {
  late_delivery: "Delivery is late",
  not_as_described: "Not what was agreed",
  no_response: "I'm not getting a response",
  payment: "Payment problem",
  other: "Something else",
};

export const COMPLAINT_TONE: Record<string, string> = {
  open: "bg-danger/15 text-danger ring-danger/30",
  acknowledged: "bg-warn/15 text-warn ring-warn/30",
  resolved: "bg-live/15 text-live ring-live/30",
};

export const COMPLAINT_STATUS_LABEL: Record<string, string> = {
  open: "Open — awaiting response",
  acknowledged: "Seen — being worked on",
  resolved: "Resolved",
};

export const PAYMENT_TONE: Record<string, string> = {
  pending: "bg-warn/15 text-warn ring-warn/30",
  confirmed: "bg-live/15 text-live ring-live/30",
  rejected: "bg-danger/15 text-danger ring-danger/30",
};

export function formatMoney(amount: number | null, currency = "ZAR") {
  if (amount === null || amount === undefined) return "—";
  const symbol = currency === "ZAR" ? "R" : currency + " ";
  return `${symbol}${Number(amount).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
