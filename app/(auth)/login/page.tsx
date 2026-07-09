"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="WelcoKit"
          style={{ width: "200px", height: "auto" }}
          className="mx-auto mb-8"
        />
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
          </CardHeader>
          <CardContent>
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
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="mt-1 text-right text-sm text-muted-foreground">
                  <Link href="/forgot-password" className="underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="underline">
                Regístrate
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
