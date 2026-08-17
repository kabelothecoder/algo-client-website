import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Every protected page and server action calls one of these. The proxy already
 * redirects signed-out traffic, but per the Next.js data-security guidance a
 * matcher change must not be able to silently expose a route or a server action.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  return Boolean(data);
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) redirect("/dashboard");
  return { supabase, user };
}
