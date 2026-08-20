"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import type { ProjectStatus } from "@/lib/types";

export type ActionState = { error?: string; ok?: string };

/** Sets the commercial terms. Admin-only, and the DB trigger enforces it too. */
export async function updateAgreement(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const projectId = String(formData.get("project_id") ?? "");
  const amount = String(formData.get("quoted_amount") ?? "").trim();
  const scope = String(formData.get("agreed_scope") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();

  const { error } = await supabase
    .from("projects")
    .update({
      quoted_amount: amount ? Number(amount) : null,
      agreed_scope: scope || null,
      due_date: dueDate || null,
    })
    .eq("id", projectId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: "Agreement saved" };
}

export async function addStatusUpdate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const projectId = String(formData.get("project_id") ?? "");
  const status = String(formData.get("status") ?? "") as ProjectStatus;
  const note = String(formData.get("note") ?? "").trim();

  const { error: statusError } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);
  if (statusError) return { error: statusError.message };

  // The status trigger already logs a bare row; only add a second entry when
  // there is an actual note to show the client.
  if (note) {
    const { error } = await supabase.from("project_updates").insert({
      project_id: projectId,
      status,
      note,
      created_by: user.id,
    });
    if (error) return { error: error.message };
  }

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: "Update posted" };
}

export async function reviewPayment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const paymentId = String(formData.get("payment_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("admin_note") ?? "").trim();

  if (!["confirmed", "rejected"].includes(decision)) {
    return { error: "Invalid decision." };
  }

  const { error } = await supabase
    .from("payments")
    .update({
      status: decision,
      admin_note: note || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: `Payment ${decision}` };
}

export async function respondToComplaint(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const complaintId = String(formData.get("complaint_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const response = String(formData.get("admin_response") ?? "").trim();
  const status = String(formData.get("status") ?? "acknowledged");

  if (!response) return { error: "Write a response." };
  if (!["acknowledged", "resolved"].includes(status)) {
    return { error: "Invalid status." };
  }

  const { error } = await supabase
    .from("complaints")
    .update({
      admin_response: response,
      status,
      responded_at: new Date().toISOString(),
    })
    .eq("id", complaintId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: "Response sent" };
}

export async function uploadDeliverable(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const projectId = String(formData.get("project_id") ?? "");
  const clientId = String(formData.get("client_id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const release = formData.get("released") === "on";
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Attach a file." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File must be under 10 MB." };
  }

  // Prefix with the client's id so the storage read policy lets them fetch it.
  const path = `${clientId}/${projectId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("deliverables")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { error: uploadError.message };

  const { error } = await supabase.from("deliverables").insert({
    project_id: projectId,
    file_path: path,
    file_name: file.name,
    notes: notes || null,
    released: release,
    created_by: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: release ? "Uploaded and released" : "Uploaded, not yet released" };
}

export async function toggleDeliverable(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("deliverable_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const released = formData.get("released") === "true";

  const { error } = await supabase
    .from("deliverables")
    .update({ released })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: released ? "Released to client" : "Hidden from client" };
}

// ── Specials ───────────────────────────────────────────────────────────────

export async function saveSpecial(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    discount_label: String(formData.get("discount_label") ?? "").trim() || null,
    active: formData.get("active") === "on",
    starts_at: String(formData.get("starts_at") ?? "") || null,
    ends_at: String(formData.get("ends_at") ?? "") || null,
  };

  if (!payload.title) return { error: "Give the special a title." };

  const { error } = id
    ? await supabase.from("specials").update(payload).eq("id", id)
    : await supabase.from("specials").insert(payload);

  if (error) return { error: error.message };

  revalidatePath("/admin/specials");
  revalidatePath("/");
  return { ok: "Saved" };
}

export async function toggleSpecial(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";

  const { error } = await supabase
    .from("specials")
    .update({ active })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/specials");
  revalidatePath("/");
  return { ok: active ? "Live on the site" : "Hidden" };
}

export async function deleteSpecial(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("specials")
    .delete()
    .eq("id", String(formData.get("id") ?? ""));
  if (error) return { error: error.message };
  revalidatePath("/admin/specials");
  revalidatePath("/");
  return { ok: "Deleted" };
}

// ── Testimonials ───────────────────────────────────────────────────────────

export async function saveTestimonial(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const clientName = String(formData.get("client_name") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  const publish = formData.get("is_published") === "on";
  const file = formData.get("image");

  if (!clientName) return { error: "Add the client's name or handle." };

  let imagePath: string | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > 10 * 1024 * 1024) return { error: "Image must be under 10 MB." };
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    if (!["png", "jpg", "jpeg", "webp"].includes(ext)) {
      return { error: "Upload a PNG, JPG or WEBP." };
    }
    imagePath = `testimonials/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("results")
      .upload(imagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) return { error: uploadError.message };
  }

  const { error } = await supabase.from("testimonials").insert({
    client_name: clientName,
    quote: quote || null,
    image_path: imagePath,
    is_published: publish,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { ok: "Saved" };
}

export async function toggleTestimonial(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const publish = formData.get("is_published") === "true";

  const { error } = await supabase
    .from("testimonials")
    .update({ is_published: publish })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { ok: publish ? "Published" : "Unpublished" };
}

export async function deleteTestimonial(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", String(formData.get("id") ?? ""));
  if (error) return { error: error.message };
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { ok: "Deleted" };
}

export async function markQuoteHandled(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const handled = formData.get("handled") === "true";

  const { error } = await supabase
    .from("quote_requests")
    .update({ handled })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
  return { ok: handled ? "Marked handled" : "Reopened" };
}

export async function setSessionStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!["requested", "confirmed", "done", "cancelled"].includes(status)) {
    return { error: "Invalid status." };
  }

  const { error } = await supabase
    .from("session_bookings")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/sessions");
  revalidatePath("/admin");
  return { ok: `Marked ${status}` };
}
