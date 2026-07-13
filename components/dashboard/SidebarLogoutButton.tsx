"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Shared between SidebarNav (desktop) and MobileTopbar (mobile) so both
// navs stay in sync — styled to match the regular nav links rather than
// the standalone <Button> version this replaced on /account.
export function SidebarLogoutButton({ onBeforeNavigate }: { onBeforeNavigate?: () => void }) {
  const t = useTranslations("dashboard.nav");
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    onBeforeNavigate?.();
    await createClient().auth.signOut();
    // Full reload (not router.push) so every client-held auth/session
    // state is dropped, not just the visible route.
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-sidebar-accent disabled:opacity-60"
    >
      <LogOut className="size-4" strokeWidth={1.5} />
      {loading ? t("loggingOut") : t("logout")}
    </button>
  );
}
