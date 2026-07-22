"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { UploadCloud, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onUpload: () => void;
}

/** A click / drag styled upload dropzone that spawns a mock document. */
export function UploadZone({ onUpload }: UploadZoneProps) {
  const [dragging, setDragging] = React.useState(false);

  return (
    <motion.div
      onClick={onUpload}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onUpload();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onUpload();
        }
      }}
      whileHover={{ scale: 1.005 }}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-6 py-10 text-center transition-colors",
        dragging
          ? "border-brand/60 bg-brand/[0.06]"
          : "border-white/[0.12] bg-white/[0.015] hover:border-brand/40 hover:bg-white/[0.03]"
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(58,134,255,0.12), transparent 70%)",
        }}
      />
      <motion.span
        animate={dragging ? { y: -4 } : { y: 0 }}
        className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/12 text-brand"
      >
        <UploadCloud className="h-6 w-6" />
      </motion.span>
      <p className="mt-4 text-sm font-medium">
        Drop files or{" "}
        <span className="text-brand">click to upload</span>
      </p>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">
        PDF, Word, Excel, PowerPoint, CSV or images. Your AI indexes and
        comprehends each document automatically.
      </p>
      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-muted-foreground">
        <Sparkles className="h-3 w-3 text-gold-soft" /> Auto-chunked &amp;
        vector-indexed
      </span>
    </motion.div>
  );
}
