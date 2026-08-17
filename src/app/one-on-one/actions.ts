"use server";

import { createClient } from "@/lib/supabase/server";
import {
  BASE_LOCATION,
  SESSION_TYPES,
  SUBURBS,
  distanceKm,
  travelFor,
} from "@/lib/constants";

export type BookingState = { error?: string; ok?: boolean; summary?: string };

/**
 * Public — no session required. Fees are recomputed here from the suburb and
 * session type; the numbers the browser showed are never trusted.
 */
export async function bookSession(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const sessionId = String(formData.get("session_type") ?? "");
  const mode = String(formData.get("mode") ?? "in_person");
  const suburb = String(formData.get("suburb") ?? "").trim();
  const preferredDate = String(formData.get("preferred_date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (name.length < 2) return { error: "Tell me your name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "That email address doesn't look right." };
  }
  if (!["in_person", "online"].includes(mode)) return { error: "Invalid mode." };

  const session = SESSION_TYPES.find((s) => s.id === sessionId);
  if (!session) return { error: "Pick a session type." };

  let distance: number | null = null;
  let travelFee = 0;

  if (mode === "in_person") {
    const match = SUBURBS.find((s) => s.name === suburb);
    if (!match) return { error: "Pick your area from the list." };
    distance = distanceKm(
      BASE_LOCATION.lat,
      BASE_LOCATION.lng,
      match.lat,
      match.lng,
    );
    travelFee = travelFor(distance).fee;
  }

  const { error } = await supabase.from("session_bookings").insert({
    name,
    email,
    whatsapp: whatsapp || null,
    session_type: session.name,
    mode,
    suburb: mode === "in_person" ? suburb : null,
    distance_km: distance,
    travel_fee: travelFee,
    session_fee: session.fee,
    preferred_date: preferredDate || null,
    notes: notes || null,
  });

  if (error) return { error: error.message };

  const total = session.fee + travelFee;
  return {
    ok: true,
    summary:
      mode === "online"
        ? `${session.name} online — R${session.fee.toLocaleString("en-ZA")}`
        : `${session.name} in ${suburb} — R${session.fee.toLocaleString("en-ZA")} + R${travelFee.toLocaleString("en-ZA")} travel = R${total.toLocaleString("en-ZA")}`,
  };
}
