import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Shared across every standalone page that has no sidebar/tabs/hamburger of
// its own (login, register, forgot/reset-password, admin) plus the public
// guide, so "< Back" always looks and behaves the same wherever it appears.
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-4 flex w-fit items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="size-5" />
      {label}
    </Link>
  );
}
