import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  icon: Icon,
  accentColor,
  isDestructive,
  children,
}: {
  icon: LucideIcon;
  accentColor: string;
  isDestructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col items-center gap-3 text-center">
      <Icon
        size={48}
        strokeWidth={1.5}
        color={isDestructive ? undefined : accentColor}
        className={isDestructive ? "text-destructive" : undefined}
      />
      <h1
        className={cn(
          "font-serif text-2xl font-bold",
          isDestructive && "text-destructive"
        )}
      >
        {children}
      </h1>
    </div>
  );
}
