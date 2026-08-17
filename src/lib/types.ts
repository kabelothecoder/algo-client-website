export type AppRole = "admin" | "client";

export type ServiceType =
  | "ea_build"
  | "indicator"
  | "code_review"
  | "mobile_bot"
  | "other";

export type ProjectStatus =
  | "received"
  | "scoping"
  | "in_dev"
  | "testing"
  | "revision"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "confirmed" | "rejected";

export type Profile = {
  id: string;
  full_name: string | null;
  whatsapp: string | null;
  platform: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  client_id: string;
  title: string;
  service: ServiceType;
  status: ProjectStatus;
  brief: string | null;
  quoted_amount: number | null;
  currency: string;
  agreed_scope: string | null;
  due_date: string | null;
  origin: "portal" | "claim";
  ordered_on: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectUpdate = {
  id: string;
  project_id: string;
  status: ProjectStatus;
  note: string | null;
  created_by: string;
  created_at: string;
};

export type ProjectMessage = {
  id: string;
  project_id: string;
  sender_id: string;
  body: string;
  from_admin: boolean;
  created_at: string;
};

export type Payment = {
  id: string;
  project_id: string;
  client_id: string;
  proof_path: string;
  amount: number | null;
  currency: string;
  reference: string | null;
  status: PaymentStatus;
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Deliverable = {
  id: string;
  project_id: string;
  file_path: string;
  file_name: string;
  notes: string | null;
  released: boolean;
  created_at: string;
};

export type Testimonial = {
  id: string;
  client_name: string;
  quote: string | null;
  image_path: string | null;
  service: ServiceType | null;
  is_published: boolean;
  sort_order: number;
};

export type Special = {
  id: string;
  title: string;
  description: string | null;
  discount_label: string | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

export type ComplaintCategory =
  | "late_delivery"
  | "not_as_described"
  | "no_response"
  | "payment"
  | "other";

export type Complaint = {
  id: string;
  project_id: string;
  client_id: string;
  category: ComplaintCategory;
  incident_date: string | null;
  body: string;
  status: "open" | "acknowledged" | "resolved";
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type AdminStats = {
  active_projects: number;
  awaiting_payment: number;
  open_complaints: number;
  backlog_claims: number;
  unanswered_messages: number;
  stale_projects: number;
  delivered_this_month: number;
  total_clients: number;
};
