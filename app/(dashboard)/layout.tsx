import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const emailNotConfirmed = !user.email_confirmed_at;

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r p-4">
        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/dashboard" className="rounded px-3 py-2 hover:bg-muted">
            Propiedades
          </Link>
          <Link href="/account" className="rounded px-3 py-2 hover:bg-muted">
            Mi cuenta
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {emailNotConfirmed && (
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200">
            Todavía no has confirmado tu email ({user.email}). Revisa tu bandeja de
            entrada y confirma tu cuenta para poder publicar tu guía.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
