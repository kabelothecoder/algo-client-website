"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import type { ChatMessage, ServiceType } from "@/lib/types";

const SERVICES: ServiceType[] = [
  "ea_build",
  "indicator",
  "code_review",
  "mobile_bot",
  "other",
];

export type ActionState = {
  error?: string;
  ok?: string;
  /** Unique per successful submission, so a form can tell one from the next. */
  token?: string;
};

export async function createProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const service = String(formData.get("service") ?? "ea_build") as ServiceType;
  const brief = String(formData.get("brief") ?? "").trim();

  if (title.length < 3) return { error: "Give the project a title." };
  if (!SERVICES.includes(service)) return { error: "Pick a valid service." };

  const { data, error } = await supabase
    .from("projects")
    .insert({ client_id: user.id, title, service, brief: brief || null })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect(`/dashboard/projects/${data.id}`);
}

/**
 * For orders paid for before this portal existed. Creates the project already
 * flagged as a claim so it lands at the top of the admin queue, and drops the
 * client straight into a thread where they can attach proof.
 */
export async function claimExistingProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const service = String(formData.get("service") ?? "ea_build") as ServiceType;
  const brief = String(formData.get("brief") ?? "").trim();
  const orderedOn = String(formData.get("ordered_on") ?? "").trim();
  const amount = String(formData.get("amount") ?? "").trim();

  if (title.length < 3) {
    return { error: "What was the bot or project called?" };
  }
  if (!SERVICES.includes(service)) return { error: "Pick a valid service." };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      client_id: user.id,
      title,
      service,
      brief: brief || null,
      origin: "claim",
      ordered_on: orderedOn || null,
      quoted_amount: amount ? Number(amount) : null,
      status: "received",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Open the thread with the client's own account of what they ordered, so the
  // record starts from their words rather than the developer's.
  await supabase.from("project_messages").insert({
    project_id: data.id,
    sender_id: user.id,
    from_admin: false,
    body:
      `Reporting an order I already paid for.\n\n` +
      `What I ordered: ${title}\n` +
      (orderedOn ? `Paid on: ${orderedOn}\n` : "") +
      (amount ? `Amount: R${amount}\n` : "") +
      (brief ? `\nDetails: ${brief}` : ""),
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/projects/${data.id}?claimed=1`);
}

const COMPLAINT_CATEGORIES = [
  "late_delivery",
  "not_as_described",
  "no_response",
  "payment",
  "other",
];

/**
 * A formal complaint. Separate from the message thread because it carries a
 * category, the date it relates to, and a status the client can watch move.
 * There is no delete path in the schema — once raised it stays on the record.
 */
export async function raiseComplaint(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const projectId = String(formData.get("project_id") ?? "");
  const category = String(formData.get("category") ?? "");
  const incidentDate = String(formData.get("incident_date") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!COMPLAINT_CATEGORIES.includes(category)) {
    return { error: "Pick what the problem is about." };
  }
  if (body.length < 10) {
    return { error: "Give me a bit more detail so I can actually fix it." };
  }

  const { data, error } = await supabase
    .from("complaints")
    .insert({
      project_id: projectId,
      client_id: user.id,
      category,
      incident_date: incidentDate || null,
      body,
      status: "open",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}`);
  return {
    ok: "Logged. You'll get a response within 5 business days.",
    token: data.id,
  };
}

export async function sendMessage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const projectId = String(formData.get("project_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write a message first." };

  // from_admin is derived server-side; the RLS policy cross-checks it against
  // is_admin() so a client cannot post a message styled as coming from support.
  const { data: adminRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  const { error } = await supabase.from("project_messages").insert({
    project_id: projectId,
    sender_id: user.id,
    body,
    from_admin: Boolean(adminRow),
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}`);
  return { ok: "Sent" };
}

export async function uploadPaymentProof(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const projectId = String(formData.get("project_id") ?? "");
  const file = formData.get("proof");
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Attach your proof of payment." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File must be under 10 MB." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  if (!["png", "jpg", "jpeg", "webp", "pdf"].includes(ext)) {
    return { error: "Upload a PNG, JPG, WEBP or PDF." };
  }

  // Path must start with the user's id — the storage RLS policy keys off it.
  const path = `${user.id}/${projectId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { error } = await supabase.from("payments").insert({
    project_id: projectId,
    client_id: user.id,
    proof_path: path,
    amount: amountRaw ? Number(amountRaw) : null,
    reference: reference || null,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}`);
  return { ok: "Uploaded. It shows as pending until it is confirmed by hand." };
}

export async function updateBrief(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireUser();
  const projectId = String(formData.get("project_id") ?? "");
  const brief = String(formData.get("brief") ?? "").trim();

  const { error } = await supabase
    .from("projects")
    .update({ brief })
    .eq("id", projectId);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: "Brief saved" };
}

/** Persists an AI intake conversation and copies the spec into the brief. */
export async function saveIntake(
  projectId: string,
  transcript: ChatMessage[],
  summary: string,
) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("ai_intake_chats").upsert(
    {
      project_id: projectId,
      client_id: user.id,
      transcript,
      summary,
    },
    { onConflict: "project_id" },
  );
  if (error) return { error: error.message };

  await supabase.from("projects").update({ brief: summary }).eq("id", projectId);

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: "Spec saved to your project" };
}
