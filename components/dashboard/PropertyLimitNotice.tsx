import Link from "next/link";
import { TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PlanDefinition } from "@/lib/plans";

export function PropertyLimitNotice({
  plan,
  count,
}: {
  plan: PlanDefinition;
  count: number;
}) {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <TriangleAlertIcon className="size-8 text-amber-500" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            Has alcanzado el límite de propiedades de tu plan {plan.label} ({count}/
            {plan.maxProperties})
          </p>
          <Button nativeButton={false} render={<Link href="/account" />} className="mt-1">
            Mejorar plan
          </Button>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Volver a mis propiedades
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
