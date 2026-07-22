"use client";

import * as React from "react";
import {
  FileText,
  MapPin,
  CreditCard,
  Sparkles,
  Ban,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, timeAgo, cn } from "@/lib/utils";
import type { Order } from "@/types";
import {
  STATUS_META,
  PAYMENT_META,
  TYPE_META,
  nextStatus,
} from "./order-config";

interface Props {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdvance: (order: Order) => void;
  onCancel: (order: Order) => void;
  onRefund: (order: Order) => void;
}

export function OrderDetailDialog({
  order,
  open,
  onOpenChange,
  onAdvance,
  onCancel,
  onRefund,
}: Props) {
  if (!order) return null;

  const status = STATUS_META[order.status];
  const pay = PAYMENT_META[order.paymentStatus];
  const type = TYPE_META[order.type];
  const next = nextStatus(order.status);
  const isTerminal = order.status === "delivered" || order.status === "cancelled";
  const subtotal = order.items.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <DialogTitle className="font-mono text-base tracking-tight">
              {order.reference}
            </DialogTitle>
            <Badge variant={status.variant} className="gap-1">
              <status.icon className="h-3 w-3" />
              {status.label}
            </Badge>
            {order.aiCreated && (
              <Badge variant="gold" className="gap-1">
                <Sparkles className="h-3 w-3" /> AI
              </Badge>
            )}
          </div>
          <DialogDescription>
            {order.customerName} · placed {timeAgo(order.createdAt)} · via{" "}
            <span className="capitalize">{order.channel}</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[52vh] px-6">
          {/* Meta chips */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={type.variant} className="gap-1">
              <type.icon className="h-3 w-3" />
              {type.label}
            </Badge>
            <Badge variant={pay.variant}>{pay.label}</Badge>
            {order.eta && (
              <Badge variant="secondary">ETA {order.eta}</Badge>
            )}
          </div>

          {/* Line items */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Items
            </p>
            <div className="space-y-1.5">
              {order.items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/[0.05] text-xs font-medium tabular">
                    {it.quantity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{it.name}</p>
                    {it.notes && (
                      <p className="truncate text-xs text-amber-400/80">
                        Note: {it.notes}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm tabular text-muted-foreground">
                    {formatCurrency(it.price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="mt-4 space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatCurrency(subtotal)} muted />
            <Row label="Tax & fees" value="Included" muted />
            <Separator className="my-1" />
            <Row
              label="Total"
              value={formatCurrency(order.total)}
              className="text-base font-semibold"
            />
          </div>

          {/* Payment + address */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CreditCard className="h-3.5 w-3.5" /> Payment
              </div>
              <p className="text-sm font-medium">{order.paymentMethod}</p>
              <Badge variant={pay.variant} className="mt-1.5">
                {pay.label}
              </Badge>
            </div>
            {order.address && (
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> Address
                </div>
                <p className="text-sm font-medium leading-snug">
                  {order.address}
                </p>
              </div>
            )}
          </div>

          {order.notes && (
            <p className="mt-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground">
              {order.notes}
            </p>
          )}
          <div className="h-2" />
        </ScrollArea>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success(`Invoice generated for ${order.reference}`, {
                description: "A PDF invoice has been emailed to the customer.",
              })
            }
          >
            <FileText className="h-4 w-4" /> Generate invoice
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {order.paymentStatus === "paid" && !isTerminal && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onRefund(order)}
              >
                <RotateCcw className="h-4 w-4" /> Refund
              </Button>
            )}
            {!isTerminal && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancel(order)}
              >
                <Ban className="h-4 w-4" /> Cancel
              </Button>
            )}
            {next && (
              <Button size="sm" onClick={() => onAdvance(order)}>
                {STATUS_META[next].label} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  label,
  value,
  muted,
  className,
}: {
  label: string;
  value: string;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className={cn(muted && "text-muted-foreground")}>{label}</span>
      <span className="tabular">{value}</span>
    </div>
  );
}
