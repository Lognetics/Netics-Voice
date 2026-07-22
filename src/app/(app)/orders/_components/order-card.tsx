"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Timer, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, initials, cn } from "@/lib/utils";
import type { Order } from "@/types";
import { STATUS_META, PAYMENT_META, TYPE_META, nextStatus } from "./order-config";

interface Props {
  order: Order;
  onAdvance: (order: Order) => void;
  onOpen: (order: Order) => void;
}

export function OrderCard({ order, onAdvance, onOpen }: Props) {
  const pay = PAYMENT_META[order.paymentStatus];
  const type = TYPE_META[order.type];
  const next = nextStatus(order.status);
  const itemCount = order.items.reduce((s, it) => s + it.quantity, 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.12] hover:bg-white/[0.035]"
    >
      <button
        type="button"
        onClick={() => onOpen(order)}
        className="w-full text-left"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-muted-foreground">
            {order.reference}
          </span>
          {order.aiCreated && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-medium text-gold-soft">
              <Sparkles className="h-2.5 w-2.5" /> AI
            </span>
          )}
          <span className="ml-auto text-sm font-semibold tabular">
            {formatCurrency(order.total)}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px]">
              {initials(order.customerName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{order.customerName}</p>
            <p className="text-xs text-muted-foreground">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <Badge variant={type.variant} className="gap-1">
            <type.icon className="h-3 w-3" />
            {type.label}
          </Badge>
          <Badge variant={pay.variant}>{pay.label}</Badge>
          {order.eta && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Timer className="h-3 w-3" />
              {order.eta}
            </span>
          )}
        </div>
      </button>

      {next && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-2.5 w-full justify-center"
          onClick={() => onAdvance(order)}
        >
          <ChevronsRight className="h-3.5 w-3.5" />
          Move to {STATUS_META[next].label}
        </Button>
      )}
    </motion.div>
  );
}
