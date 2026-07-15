"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getAppUrl } from "@/lib/env";
import { BackLink } from "@/components/shared/BackLink";
import { LocaleProvider } from "@/components/shared/LocaleProvider";
import { safeReturnTo } from "@/lib/return-to";
import { type AppLocale } from "@/lib/locale";

function ForgotPasswordFormContent() {
  const t = useTranslations("auth.forgotPassword");
  const tCommon = useTranslations("common");
  const supabase = createClient();
  const searchParams = useSearchParams();
  const backHref = safeReturnTo(searchParams.get("returnTo") ?? undefined);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getAppUrl()}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setSent(true);
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

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <BackLink href={backHref} label={tCommon("back")} />
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
                  {t("backToLogin")}
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
        <BackLink href={backHref} label={tCommon("back")} />
        {logo}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">{t("description")}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("submitLoading") : t("submit")}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link href="/login" className="underline">
                {t("backToLogin")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ForgotPasswordForm({ initialLocale }: { initialLocale?: AppLocale }) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <ForgotPasswordFormContent />
    </LocaleProvider>
  );
}
