import * as React from "react";
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  UtensilsCrossed,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  Tag,
  FileSignature,
  Link2,
  FileType,
  type LucideIcon,
} from "lucide-react";
import type { DocType, KnowledgeDocument } from "@/types";

export const DOC_ICON: Record<DocType, LucideIcon> = {
  pdf: FileText,
  word: FileText,
  excel: FileSpreadsheet,
  powerpoint: Presentation,
  csv: FileSpreadsheet,
  image: ImageIcon,
  menu: UtensilsCrossed,
  policy: ShieldCheck,
  faq: HelpCircle,
  catalog: BookOpen,
  pricelist: Tag,
  contract: FileSignature,
  url: Link2,
  text: FileType,
};

const DOC_TINT: Record<DocType, string> = {
  pdf: "#FF4D4F",
  word: "#3A86FF",
  excel: "#00C896",
  powerpoint: "#C9A227",
  csv: "#00C896",
  image: "#6BA5FF",
  menu: "#FF4D4F",
  policy: "#3A86FF",
  faq: "#C9A227",
  catalog: "#6BA5FF",
  pricelist: "#00C896",
  contract: "#C9A227",
  url: "#3A86FF",
  text: "#5b6478",
};

export function DocTypeIcon({
  type,
  className,
}: {
  type: DocType;
  className?: string;
}) {
  const Icon = DOC_ICON[type] ?? FileType;
  const tint = DOC_TINT[type] ?? "#5b6478";
  return (
    <span
      className={className}
      style={{ color: tint }}
      aria-hidden
    >
      <Icon className="h-full w-full" />
    </span>
  );
}

export function docTint(type: DocType) {
  return DOC_TINT[type] ?? "#5b6478";
}

/** Human size from KB. */
export function formatSize(sizeKb: number) {
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${Math.round(sizeKb)} KB`;
}

const STATUS_META: Record<
  KnowledgeDocument["status"],
  { label: string; variant: "success" | "warning" | "danger" | "secondary" }
> = {
  indexed: { label: "Indexed", variant: "success" },
  processing: { label: "Processing", variant: "warning" },
  queued: { label: "Queued", variant: "secondary" },
  failed: { label: "Failed", variant: "danger" },
};

export function statusMeta(status: KnowledgeDocument["status"]) {
  return STATUS_META[status];
}
