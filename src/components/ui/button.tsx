"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white shadow-glow hover:bg-brand/90 hover:shadow-[0_0_50px_-8px_rgba(58,134,255,0.6)]",
        gold: "bg-gold-gradient text-base-primary font-semibold hover:opacity-90 shadow-glow-gold",
        success:
          "bg-success text-base-primary font-semibold hover:bg-success/90 shadow-glow-green",
        destructive:
          "bg-danger text-white hover:bg-danger/90",
        outline:
          "border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-foreground",
        secondary:
          "bg-base-secondary text-foreground hover:bg-base-elevated border border-white/5",
        ghost: "hover:bg-white/[0.06] text-muted-foreground hover:text-foreground",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
