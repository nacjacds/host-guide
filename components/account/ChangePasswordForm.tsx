"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function ChangePasswordForm({ email }: { email: string }) {
  const t = useTranslations("dashboard.account.security");
  const tCommon = useTranslations("dashboard.common");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error(t("tooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("mismatch"));
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();

      // Re-verify the current password before allowing a change — a valid
      // session alone isn't proof the person at the keyboard right now
      // knows the old password (e.g. an unlocked shared computer). Supabase
      // has no dedicated reauthentication call, so this reuses the same
      // signInWithPassword the login form calls (see LoginForm.tsx); on
      // success it just refreshes the current session rather than
      // logging the user out.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) {
        toast.error(t("wrongCurrentPassword"));
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t("success"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tCommon("networkError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="current_password">{t("currentPasswordLabel")}</Label>
            <PasswordInput
              id="current_password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new_password">{t("newPasswordLabel")}</Label>
            <PasswordInput
              id="new_password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirm_password">{t("confirmPasswordLabel")}</Label>
            <PasswordInput
              id="confirm_password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? t("saving") : t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
