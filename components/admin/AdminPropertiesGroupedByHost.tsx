"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AdminPropertiesTable, type AdminPropertyRow } from "./AdminPropertiesTable";

interface HostGroup {
  hostId: string;
  hostEmail: string;
  properties: AdminPropertyRow[];
}

function groupByHost(properties: AdminPropertyRow[]): HostGroup[] {
  const groups: HostGroup[] = [];
  const indexByHost = new Map<string, number>();

  for (const property of properties) {
    let index = indexByHost.get(property.hostId);
    if (index === undefined) {
      index = groups.length;
      indexByHost.set(property.hostId, index);
      groups.push({ hostId: property.hostId, hostEmail: property.hostEmail, properties: [] });
    }
    groups[index].properties.push(property);
  }

  return groups.sort((a, b) => a.hostEmail.localeCompare(b.hostEmail));
}

export function AdminPropertiesGroupedByHost({ properties }: { properties: AdminPropertyRow[] }) {
  const t = useTranslations("dashboard.admin.propertiesTable");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (properties.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  const groups = groupByHost(properties);

  function toggle(hostId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(hostId)) {
        next.delete(hostId);
      } else {
        next.add(hostId);
      }
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const isOpen = expanded.has(group.hostId);
        return (
          <div key={group.hostId} className="rounded-lg border border-border">
            <button
              type="button"
              onClick={() => toggle(group.hostId)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted/50"
            >
              <span className="flex min-w-0 items-center gap-2 font-medium">
                {isOpen ? (
                  <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                )}
                <span className="truncate">{group.hostEmail}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {t("hostGroupCount", { count: group.properties.length })}
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-border px-3 py-2">
                <AdminPropertiesTable properties={group.properties} hideHostColumn />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
