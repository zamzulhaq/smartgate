import * as React from "react";

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "subtle";
};

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-primary text-text",
  subtle: "bg-zinc-100 text-text",
  outline: "bg-card text-text border border-border",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";
