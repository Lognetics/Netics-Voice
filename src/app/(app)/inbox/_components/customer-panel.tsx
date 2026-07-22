"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShoppingBag,
  CalendarCheck,
  Star,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone as PhoneIcon,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import type { Conversation, Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/empty-state";
import { SentimentBadge } from "@/components/shared/indicators";
import { initials, avatarUrl, formatCurrency } from "@/lib/utils";

const tierVariant: Record<string, "secondary" | "gold" | "default"> = {
  platinum: "gold",
  gold: "gold",
  silver: "secondary",
  bronze: "secondary",
};

interface CustomerPanelProps {
  conversation: Conversation | null;
  customer: Customer | undefined;
  onStatusChange: (next: Conversation["status"]) => void;
}

export function CustomerPanel({
  conversation,
  customer,
  onStatusChange,
}: CustomerPanelProps) {
  if (!conversation) {
    return (
      <div className="grid h-full place-items-center p-6">
        <EmptyState
          icon={UserPlus}
          title="No customer selected"
          description="Customer context appears here once you open a conversation."
        />
      </div>
    );
  }

  const name = conversation.customerName;

  const act = (label: string, next?: Conversation["status"]) => {
    if (next) onStatusChange(next);
    toast.success(label, { description: name });
  };

  return (
    <ScrollArea className="h-full">
      <motion.div
        key={conversation.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 p-4"
      >
        {/* Profile */}
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl(name)} alt={name} />
            <AvatarFallback className="text-lg">{initials(name)}</AvatarFallback>
          </Avatar>
          <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold">
            {name}
            {customer?.isVip && <Star className="h-3.5 w-3.5 fill-gold text-gold" />}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <SentimentBadge sentiment={conversation.sentiment} />
            {customer && (
              <Badge variant={tierVariant[customer.loyaltyTier]} className="capitalize">
                {customer.loyaltyTier}
              </Badge>
            )}
          </div>
        </div>

        {customer && (
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {customer.email && (
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> <span className="truncate">{customer.email}</span>
              </p>
            )}
            <p className="flex items-center gap-2">
              <PhoneIcon className="h-3.5 w-3.5" /> {customer.phone}
            </p>
            {customer.city && (
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> {customer.city}, {customer.country}
              </p>
            )}
          </div>
        )}

        <Separator />

        {/* Stats */}
        {customer ? (
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Orders" value={String(customer.totalOrders)} icon={ShoppingBag} />
            <Stat label="Bookings" value={String(customer.totalBookings)} icon={CalendarCheck} />
            <Stat label="LTV" value={formatCurrency(customer.lifetimeValue, { compact: true })} icon={Star} />
          </div>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            No linked customer record.
          </p>
        )}

        {/* Tags */}
        {customer && customer.tags.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {customer.tags.map((t) => (
                <Badge key={t} variant="secondary" className="capitalize">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI insight */}
        {customer && (
          <div className="rounded-xl border border-brand/20 bg-brand/[0.06] p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-soft">
              <Sparkles className="h-3.5 w-3.5" /> AI Insight
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {customer.aiInsight}
            </p>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => act("Assigned to you")}
          >
            <UserPlus className="h-4 w-4" /> Assign to me
          </Button>
          <Button
            variant="success"
            className="w-full justify-start"
            onClick={() => act("Marked as resolved", "resolved")}
          >
            <CheckCircle2 className="h-4 w-4" /> Resolve conversation
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={() => act("Escalated to a human agent", "escalated")}
          >
            <AlertTriangle className="h-4 w-4" /> Escalate
          </Button>
        </div>
      </motion.div>
    </ScrollArea>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <p className="mt-1 text-sm font-semibold tabular">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
