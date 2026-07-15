"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LocaleProvider } from "@/components/shared/LocaleProvider";
import { type AppLocale, setLocaleCookie } from "@/lib/locale";

// Only ever follows a same-site path — never an absolute/protocol-relative
// URL — so a crafted `?returnTo=` query string can't be used as an open
// redirect off the login page.
function safeReturnTo(returnTo: string | undefined): string {
  if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return "/";
}

function LoginFormContent({ returnTo }: { returnTo?: string }) {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const supabase = createClient();
  const backHref = safeReturnTo(returnTo);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // The account's stored language preference wins on login, so it follows
    // the user across devices/browsers instead of staying on whatever this
    // particular browser's NEXT_LOCALE cookie happened to be set to.
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("dashboard_locale")
        .eq("id", data.user.id)
        .single();
      if (profile?.dashboard_locale) {
        setLocaleCookie(profile.dashboard_locale as AppLocale);
      }
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link
          href={backHref}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-5" />
          {t("back")}
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="WelcoKit"
          style={{ width: "200px", height: "auto" }}
          className="mx-auto mb-8"
        />
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
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
              <div>
                <Label htmlFor="password">{t("passwordLabel")}</Label>
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="mt-1 text-right text-sm text-muted-foreground">
                  <Link href="/forgot-password" className="underline">
                    {t("forgotPassword")}
                  </Link>
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("submitLoading") : t("submit")}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <Link href="/register" className="underline">
                {t("registerLink")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function LoginForm({
  initialLocale,
  returnTo,
}: {
  initialLocale?: AppLocale;
  returnTo?: string;
}) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <LoginFormContent returnTo={returnTo} />
    </LocaleProvider>
  );
}
