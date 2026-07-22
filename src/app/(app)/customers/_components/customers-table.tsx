"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Crown,
  Search,
  Users as UsersIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SentimentBadge } from "@/components/shared/indicators";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, formatCurrency, initials, timeAgo } from "@/lib/utils";
import type { Customer } from "@/types";
import {
  LeadScoreBar,
  RiskBadge,
  TIER_ORDER,
  TierBadge,
} from "./customer-helpers";

const PAGE_SIZE = 12;

type SortKey =
  | "name"
  | "lifetimeValue"
  | "totalOrders"
  | "leadScore"
  | "lastContact";

const columns: {
  key: SortKey | null;
  label: string;
  className?: string;
}[] = [
  { key: "name", label: "Customer" },
  { key: null, label: "Loyalty" },
  { key: "lifetimeValue", label: "Lifetime value", className: "text-right" },
  { key: "totalOrders", label: "Orders", className: "text-right" },
  { key: null, label: "Sentiment" },
  { key: null, label: "Risk" },
  { key: "leadScore", label: "Lead score" },
  { key: "lastContact", label: "Last contact", className: "text-right" },
];

export function CustomersTable({ data }: { data: Customer[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [tier, setTier] = React.useState<string>("all");
  const [risk, setRisk] = React.useState<string>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("lifetimeValue");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((c) => {
      if (tier !== "all" && c.loyaltyTier !== tier) return false;
      if (risk !== "all" && c.riskLevel !== risk) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [data, query, tier, risk]);

  const sorted = React.useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      switch (sortKey) {
        case "name":
          av = a.name.toLowerCase();
          bv = b.name.toLowerCase();
          break;
        case "lastContact":
          av = new Date(a.lastContact).getTime();
          bv = new Date(b.lastContact).getTime();
          break;
        default:
          av = a[sortKey];
          bv = b[sortKey];
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  // Reset to page 1 whenever filters change.
  React.useEffect(() => {
    setPage(1);
  }, [query, tier, risk, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  return (
    <div className="glass overflow-hidden rounded-2xl">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone or email…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tiers</SelectItem>
              {TIER_ORDER.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={risk} onValueChange={setRisk}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk</SelectItem>
              <SelectItem value="low">Low risk</SelectItem>
              <SelectItem value="medium">Medium risk</SelectItem>
              <SelectItem value="high">High risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {paged.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No customers found"
          description="Try adjusting your search or filters to find who you're looking for."
          className="m-4 border-none"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wide text-muted-foreground">
                {columns.map((col) => (
                  <th
                    key={col.label}
                    className={cn("px-4 py-3 font-medium", col.className)}
                  >
                    {col.key ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key as SortKey)}
                        className={cn(
                          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                          col.className?.includes("text-right") &&
                            "flex-row-reverse",
                          sortKey === col.key && "text-foreground"
                        )}
                      >
                        {col.label}
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.015, 0.2) }}
                  onClick={() => router.push(`/customers/${c.id}`)}
                  className="group cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]"
                >
                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={c.avatarUrl} alt={c.name} />
                        <AvatarFallback>{initials(c.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/customers/${c.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="truncate font-medium text-foreground hover:text-brand"
                          >
                            {c.name}
                          </Link>
                          {c.isVip && (
                            <Crown className="h-3.5 w-3.5 shrink-0 text-gold-soft" />
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.email ?? c.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Loyalty */}
                  <td className="px-4 py-3">
                    <TierBadge tier={c.loyaltyTier} />
                  </td>
                  {/* LTV */}
                  <td className="px-4 py-3 text-right font-medium tabular">
                    {formatCurrency(c.lifetimeValue)}
                  </td>
                  {/* Orders */}
                  <td className="px-4 py-3 text-right tabular text-muted-foreground">
                    {c.totalOrders}
                  </td>
                  {/* Sentiment */}
                  <td className="px-4 py-3">
                    <SentimentBadge sentiment={c.sentiment} showEmoji={false} />
                  </td>
                  {/* Risk */}
                  <td className="px-4 py-3">
                    <RiskBadge level={c.riskLevel} />
                  </td>
                  {/* Lead score */}
                  <td className="px-4 py-3">
                    <LeadScoreBar score={c.leadScore} className="w-28" />
                  </td>
                  {/* Last contact */}
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {timeAgo(c.lastContact)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer / pagination */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] p-4 text-sm text-muted-foreground sm:flex-row">
        <p>
          Showing{" "}
          <span className="font-medium text-foreground">
            {paged.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
            {(safePage - 1) * PAGE_SIZE + paged.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {sorted.length.toLocaleString()}
          </span>{" "}
          customers
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 transition-colors hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-xs tabular">
            Page {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 transition-colors hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
