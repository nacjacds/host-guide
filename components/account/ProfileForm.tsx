"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "./AvatarUpload";
import { toast } from "sonner";
import { isValidPhoneNumber } from "@/lib/phone";
import type { Profile } from "@/types";

export function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const t = useTranslations("dashboard.account");
  const tCommon = useTranslations("dashboard.common");
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [editing, setEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<{ fullName: string; phone: string } | null>(null);
  const [saving, setSaving] = useState(false);

  function handleEdit() {
    setSnapshot({ fullName, phone });
    setEditing(true);
  }

  function handleCancel() {
    if (snapshot) {
      setFullName(snapshot.fullName);
      setPhone(snapshot.phone);
    }
    setEditing(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone && !isValidPhoneNumber(phone)) {
      toast.error(t("phoneInvalid"));
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName || null,
          phone: phone || null,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? t("profileSaveError"));
        return;
      }

      toast.success(t("profileSaved"));
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tCommon("networkError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profileTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AvatarUpload initialAvatarUrl={profile?.avatar_url ?? null} fullName={fullName} />

          <div>
            <Label htmlFor="full_name">{t("fullNameLabel")}</Label>
            {editing ? (
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            ) : (
              <p className="text-sm text-foreground">{fullName || tCommon("notSpecified")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>

          <div>
            <Label htmlFor="phone">{t("phoneLabel")}</Label>
            {editing ? (
              <>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                />
                <p className="mt-1 text-xs text-muted-foreground">{t("phoneHelp")}</p>
              </>
            ) : (
              <p className="text-sm text-foreground">{phone || tCommon("notSpecified")}</p>
            )}
          </div>

          {editing ? (
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? t("saving") : t("saveChanges")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={handleCancel}
                disabled={saving}
              >
                {tCommon("cancel")}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="border-[#1B4F72] text-[#1B4F72] hover:bg-[#1B4F72]/5 hover:text-[#1B4F72]"
              onClick={handleEdit}
            >
              {t("editProfile")}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
