import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">WelcoKit</h1>
      <p className="max-w-xl text-muted-foreground">
        Crea guías digitales personalizadas para tus huéspedes con
        recomendaciones locales generadas por IA y un asistente de WhatsApp
        integrado.
      </p>
      <div className="flex gap-4">
        <Button nativeButton={false} render={<Link href="/register" />}>
          Empezar gratis
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/login" />}
        >
          Iniciar sesión
        </Button>
      </div>
    </div>
  );
}
