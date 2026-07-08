"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, isActiveNavLink } from "@/lib/utils";
import type { NavLinkGroup } from "./MobileTopbar";

export function SidebarNav({ navGroups }: { navGroups: NavLinkGroup[] }) {
  const pathname = usePathname();

  return (
    <nav className="mt-8 flex flex-col text-sm">
      {navGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          {groupIndex > 0 && <hr className="my-3 border-[#DDD8CC]" />}
          <div className="flex flex-col gap-2">
            {group.map((link, linkIndex) => {
              const active = isActiveNavLink(pathname, link.href);
              return (
                <div key={link.href}>
                  {groupIndex === 0 && linkIndex === 1 && (
                    <hr className="my-2 border-[#DDD8CC]" />
                  )}
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between rounded-lg border-l-[3px] border-transparent px-3 py-2 transition-colors",
                      active
                        ? "border-[#1A1A18] bg-[#E8D5B0] text-[#1A1A18]"
                        : "hover:bg-sidebar-accent"
                    )}
                  >
                    {link.label}
                    {link.badge ? (
                      <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-medium text-white">
                        {link.badge}
                      </span>
                    ) : null}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
