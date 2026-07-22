import * as React from "react";
import { cn } from "@/lib/utils";

/** NETICS Voice wordmark + animated glyph. */
export function Logo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? 28 : size === "lg" ? 40 : 32;
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative grid place-items-center rounded-xl bg-gradient-to-br from-brand to-success shadow-glow"
        style={{ width: dim, height: dim }}
      >
        <svg
          width={dim * 0.58}
          height={dim * 0.58}
          viewBox="0 0 24 24"
          fill="none"
          className="text-base-primary"
        >
          {/* soundwave glyph */}
          <path
            d="M3 12h2M7 8v8M11 4v16M15 8v8M19 11h2"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showText && (
        <span
          className={cn(
            "font-semibold tracking-tight",
            size === "lg" ? "text-xl" : "text-[17px]"
          )}
        >
          NETICS <span className="text-muted-foreground font-normal">Voice</span>
        </span>
      )}
    </div>
  );
}
