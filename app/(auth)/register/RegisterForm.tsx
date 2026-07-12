"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LocaleProvider, useLocale } from "@/components/shared/LocaleProvider";
import { type AppLocale } from "@/lib/locale";

function RegisterFormContent() {
  const t = useTranslations("auth.register");
  const { locale } = useLocale();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        // The locale the visitor already chose (landing/login/register
        // header toggle) becomes this account's initial dashboard_locale —
        // read by the handle_new_user() trigger, see
        // supabase/migrations/20260712100000_profiles_dashboard_locale.sql
        options: { data: { full_name: fullName, locale } },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setRegistered(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  const logo = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="WelcoKit"
      style={{ width: "200px", height: "auto" }}
      className="mx-auto mb-8"
    />
  );

  if (registered) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {logo}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t("checkEmailTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t.rich("checkEmailBody", {
                  email,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/login" className="underline">
                  {t("checkEmailLoginLink")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {logo}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">{t("fullNameLabel")}</Label>
                <Input
                  id="fullName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">{t("emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">{t("passwordLabel")}</Label>
                <PasswordInput
                  id="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("submitLoading") : t("submit")}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t("hasAccount")}{" "}
              <Link href="/login" className="underline">
                {t("loginLink")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function RegisterForm({ initialLocale }: { initialLocale?: AppLocale }) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <RegisterFormContent />
    </LocaleProvider>
  );
}
