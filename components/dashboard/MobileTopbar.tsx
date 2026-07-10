"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn, getInitials, isActiveNavLink } from "@/lib/utils";

export interface NavLinkItem {
  href: string;
  label: string;
  badge?: number;
}

export type NavLinkGroup = NavLinkItem[];

export function MobileTopbar({
  fullName,
  avatarUrl,
  navGroups,
}: {
  fullName: string | null;
  avatarUrl: string | null;
  navGroups: NavLinkGroup[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-3 items-center border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
      <div aria-hidden />

      <Link href="/dashboard" className="justify-self-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="WelcoKit"
          style={{ width: "180px", height: "auto" }}
        />
      </Link>

      <Dialog open={open} onOpenChange={setOpen}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="flex size-9 shrink-0 items-center justify-center justify-self-end rounded-lg hover:bg-sidebar-accent"
        >
          <Menu size={26} strokeWidth={1.5} />
        </button>
        <DialogContent
          showCloseButton={false}
          className="top-0 left-0 flex h-dvh max-h-dvh w-72 max-w-[85vw] translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground ring-0 sm:max-w-[85vw] data-open:slide-in-from-left data-open:zoom-in-100 data-closed:slide-out-to-left data-closed:zoom-out-100"
        >
          <DialogTitle className="sr-only">Menú de navegación</DialogTitle>

          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="mt-4 flex flex-col items-center gap-2 px-3"
          >
            <Avatar className="size-16">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName ?? ""} />}
              <AvatarFallback className="text-lg font-medium">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{fullName ?? "Mi cuenta"}</span>
          </Link>

          <hr className="mt-6 mb-2 border-[#DDD8CC]" />

          <nav className="mt-2 flex flex-col text-sm">
            {navGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {groupIndex > 0 && <hr className="my-3 border-[#DDD8CC]" />}
                <div className="flex flex-col gap-2">
                  {group.map((link) => {
                    const active = isActiveNavLink(pathname, link.href);
                    return (
                      <div key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
