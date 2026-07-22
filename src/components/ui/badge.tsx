import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand/15 text-brand-soft",
        secondary: "border-white/10 bg-white/[0.04] text-muted-foreground",
        success: "border-transparent bg-success/15 text-success",
        gold: "border-transparent bg-gold/15 text-gold-soft",
        danger: "border-transparent bg-danger/15 text-danger-soft",
        warning: "border-transparent bg-amber-500/15 text-amber-400",
        outline: "border-white/12 text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
