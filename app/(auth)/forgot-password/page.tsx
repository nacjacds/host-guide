"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getAppUrl } from "@/lib/env";

export default function ForgotPasswordPage() {
  const supabase = createClient();
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
      toast.error(err instanceof Error ? err.message : "Error de red");
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
          {logo}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Revisa tu email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Si existe una cuenta con <strong>{email}</strong>, te hemos enviado un
                enlace para restablecer tu contraseña.
              </p>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/login" className="underline">
                  Volver a iniciar sesión
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
            <CardTitle>Restablecer contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link href="/login" className="underline">
                Volver a iniciar sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
