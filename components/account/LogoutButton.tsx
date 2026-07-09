"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await createClient().auth.signOut();
    // Full reload (not router.push) so every client-held auth/session
    // state is dropped, not just the visible route.
    window.location.href = "/login";
  }

  return (
    <Button type="button" variant="outline" onClick={handleLogout} disabled={loading}>
      <LogOut className="size-4" strokeWidth={1.5} />
      {loading ? "Cerrando sesión..." : "Cerrar sesión"}
    </Button>
  );
}
