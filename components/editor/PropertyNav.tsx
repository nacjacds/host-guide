"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, isActiveNavLink } from "@/lib/utils";

const TABS = [
  { key: "edit", label: "Editor", href: (id: string) => `/properties/${id}/edit` },
  { key: "settings", label: "Ajustes", href: (id: string) => `/properties/${id}/settings` },
  { key: "messages", label: "Mensajes", href: (id: string) => `/properties/${id}/messages` },
  { key: "stats", label: "Estadísticas", href: (id: string) => `/properties/${id}/stats` },
] as const;

export function PropertyNav({ propertyId }: { propertyId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {TABS.map((tab) => {
        const href = tab.href(propertyId);
        const active = isActiveNavLink(pathname, href);
        return (
          <Link
            key={tab.key}
            href={href}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
