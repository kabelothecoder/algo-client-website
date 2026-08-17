import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { BootstrapButton } from "@/components/bootstrap-button";

export const metadata = { title: "Admin setup" };
export const dynamic = "force-dynamic";

/**
 * One-time claim of the admin role. `bootstrap_admin()` raises if an admin
 * already exists, so this page is harmless once setup is done.
 */
export default async function AdminSetupPage() {
  const { supabase } = await requireUser();
  const { data: exists } = await supabase.rpc("admin_exists");

  if (exists) redirect("/dashboard");

  return (
    <main className="flex-1 grid place-items-center px-6 py-16">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-bold tracking-tight">Claim the admin role</h1>
        <p className="mt-2 mb-6 text-sm text-muted">
          No admin exists yet. Because you are signed in, you can claim it now.
          After this, the page locks itself and further roles must be granted from
          the Supabase dashboard.
        </p>
        <BootstrapButton />
      </Card>
    </main>
  );
}
