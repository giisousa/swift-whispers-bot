import type { FlagType } from "@/data/messages";
import { flagLabels } from "@/data/messages";
import { cn } from "@/lib/utils";

interface FlagBadgeProps {
  flag: FlagType;
  pulse?: boolean;
  className?: string;
}

const flagStyles: Record<FlagType, string> = {
  urgent: "bg-flag-urgent text-destructive-foreground",
  high: "bg-flag-high text-primary-foreground",
  medium: "bg-flag-medium text-primary-foreground",
  low: "bg-flag-low text-primary-foreground",
};

const FlagBadge = ({ flag, pulse, className }: FlagBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      flagStyles[flag],
      pulse && flag === "urgent" && "animate-pulse-flag",
      className
    )}
  >
    {flagLabels[flag]}
  </span>
);

export default FlagBadge;
