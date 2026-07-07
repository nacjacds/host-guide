"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getInitials } from "@/lib/utils";

export interface NavLinkItem {
  href: string;
  label: string;
  badge?: number;
}

export function MobileTopbar({
  fullName,
  email,
  avatarUrl,
  navLinks,
}: {
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  navLinks: NavLinkItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
      <Link
        href="/account"
        className="flex min-w-0 items-center gap-2"
        onClick={() => setOpen(false)}
      >
        <Avatar className="size-8 shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName ?? ""} />}
          <AvatarFallback className="text-xs font-medium">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-medium">{fullName ?? email}</span>
      </Link>

      <Dialog open={open} onOpenChange={setOpen}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-sidebar-accent"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <DialogContent
          showCloseButton={false}
          className="top-0 left-0 h-dvh max-h-dvh w-72 max-w-[85vw] translate-x-0 translate-y-0 overflow-y-auto rounded-none border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground ring-0 sm:max-w-[85vw] data-open:slide-in-from-left data-open:zoom-in-100 data-closed:slide-out-to-left data-closed:zoom-out-100"
        >
          <DialogTitle className="sr-only">Menú de navegación</DialogTitle>
          <nav className="flex flex-col gap-2 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded px-3 py-2 hover:bg-sidebar-accent"
              >
                {link.label}
                {link.badge ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-medium text-white">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  );
}
