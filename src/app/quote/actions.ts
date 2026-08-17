"use server";

import { createClient } from "@/lib/supabase/server";
import type { ServiceType } from "@/lib/types";

export type QuoteState = { error?: string; ok?: boolean; outcome?: string };

const SERVICES: ServiceType[] = [
  "ea_build",
  "indicator",
  "code_review",
  "mobile_bot",
  "other",
];

/**
 * Public — no session required. RLS allows anon insert but only an admin can
 * ever read these rows back.
 */
export async function submitQuote(
  _prev: QuoteState,
  formData: FormData,
): Promise<QuoteState> {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const service = String(formData.get("service") ?? "ea_build") as ServiceType;
  const path = String(formData.get("path") ?? "enquiry");
  const budgetBand = String(formData.get("budget_band") ?? "").trim();
  const systemNotes = String(formData.get("system_notes") ?? "").trim();
  const questions = String(formData.get("questions") ?? "").trim();
  const outcome = String(formData.get("outcome") ?? "proceeding");

  if (name.length < 2) return { error: "Tell me your name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "That email address doesn't look right." };
  }
  if (!SERVICES.includes(service)) return { error: "Pick a service." };
  if (!["budget", "enquiry"].includes(path)) return { error: "Invalid request." };
  if (!["proceeding", "declined"].includes(outcome)) {
    return { error: "Invalid request." };
  }

  const { error } = await supabase.from("quote_requests").insert({
    name,
    email,
    whatsapp: whatsapp || null,
    service,
    path,
    budget_band: budgetBand || null,
    system_notes: systemNotes || null,
    questions: questions || null,
    outcome,
  });

  if (error) return { error: error.message };

  return { ok: true, outcome };
}
