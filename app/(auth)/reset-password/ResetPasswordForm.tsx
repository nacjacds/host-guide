"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { BackLink } from "@/components/shared/BackLink";
import { LocaleProvider } from "@/components/shared/LocaleProvider";
import { safeReturnTo } from "@/lib/return-to";
import { type AppLocale } from "@/lib/locale";

function ResetPasswordFormContent() {
  const t = useTranslations("auth.resetPassword");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const supabase = createClient();
  // Reached only via the recovery link in a password-reset email, never by
  // navigating from another page in the app — `returnTo` will practically
  // always be absent, so this falls back to home almost every time. Still
  // included for consistency with every other standalone page's back link.
  const searchParams = useSearchParams();
  const backHref = safeReturnTo(searchParams.get("returnTo") ?? undefined);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    // The recovery link sets the session via a URL hash fragment that the
    // Supabase browser client parses automatically on load. Supabase fires
    // a PASSWORD_RECOVERY auth event once that's done — but also fall back
    // to checking for any session after a grace period, in case the event
    // already fired before this listener attached.
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) setInvalidLink(true);
      });
    }, 2000);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t("success"));
      router.push("/dashboard");
      router.refresh();
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

  if (invalidLink) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <BackLink href={backHref} label={tCommon("back")} />
          {logo}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t("invalidLinkTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t("invalidLinkBody")}</p>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/forgot-password" className="underline">
                  {t("requestNewLink")}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">{t("newPasswordLabel")}</Label>
                <PasswordInput
                  id="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!ready}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !ready}>
                {loading ? t("submitLoading") : t("submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ResetPasswordForm({ initialLocale }: { initialLocale?: AppLocale }) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <ResetPasswordFormContent />
    </LocaleProvider>
  );
}
