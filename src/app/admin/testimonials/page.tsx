import { requireAdmin } from "@/lib/auth";
import { Card, Empty, Pill } from "@/components/ui";
import {
  DeleteButton,
  TestimonialForm,
  TestimonialToggle,
} from "@/components/admin-forms";
import type { Testimonial } from "@/lib/types";

export const metadata = { title: "Results" };
export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const { supabase } = await requireAdmin();

  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true })
    .returns<Testimonial[]>();

  const list = testimonials ?? [];
  const publicUrl = (path: string) =>
    supabase.storage.from("results").getPublicUrl(path).data.publicUrl;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Client results</h1>
        <p className="mt-1 text-sm text-muted">
          Published results appear on the landing page under the risk notice.
          Anything you post here is public and permanent enough to be screenshotted
          — only publish what you can stand behind.
        </p>
      </div>

      <Card>
        <h2 className="mb-5 font-semibold">Add a result</h2>
        <TestimonialForm />
      </Card>

      {list.length === 0 ? (
        <Empty>No results added yet.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <div
              key={t.id}
              className="overflow-hidden rounded-2xl border border-border bg-surface/50"
            >
              {t.image_path && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={publicUrl(t.image_path)}
                  alt={`Result from ${t.client_name}`}
                  className="aspect-4/3 w-full object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{t.client_name}</p>
                  <Pill
                    tone={
                      t.is_published
                        ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                        : ""
                    }
                  >
                    {t.is_published ? "Live" : "Draft"}
                  </Pill>
                </div>
                {t.quote && (
                  <p className="mt-2 text-sm text-muted">{t.quote}</p>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <TestimonialToggle id={t.id} published={t.is_published} />
                  <DeleteButton id={t.id} kind="testimonial" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
