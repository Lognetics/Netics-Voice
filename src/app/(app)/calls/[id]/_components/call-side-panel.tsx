"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2, Circle, Sparkles, Tag, User2, Crown, StickyNote,
  PhoneForwarded, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { SentimentBadge, ConfidenceMeter } from "@/components/shared/indicators";
import { formatCurrency, avatarUrl, initials, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Call, Customer } from "@/types";

export function CallSidePanel({ call, customer }: { call: Call; customer?: Customer }) {
  const [done, setDone] = React.useState<Record<number, boolean>>({});
  const [note, setNote] = React.useState("");
  const [noteOpen, setNoteOpen] = React.useState(false);

  const intentEntity = call.entities.find((e) => e.type === "intent");
  const otherEntities = call.entities.filter((e) => e.type !== "intent");

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="gold"
          className="flex-1"
          onClick={() => toast.success(`Transferring ${call.customerName} to a human agent`)}
        >
          <PhoneForwarded className="h-4 w-4" /> Transfer to human
        </Button>
        <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <StickyNote className="h-4 w-4" /> Add note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a note</DialogTitle>
              <DialogDescription>
                Attach an internal note to this call for {call.customerName}.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Type your note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setNoteOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  toast.success("Note saved");
                  setNote("");
                  setNoteOpen(false);
                }}
                disabled={!note.trim()}
              >
                Save note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-brand" /> AI summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">{call.summary}</p>
          <div className="flex flex-wrap items-center gap-2">
            <SentimentBadge sentiment={call.sentiment} />
            {call.revenue ? (
              <Badge variant="success">{formatCurrency(call.revenue)} revenue</Badge>
            ) : null}
            <Badge variant={call.resolved ? "success" : "warning"}>
              {call.resolved ? "Resolved" : "Follow-up"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Intent recognition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Intent recognition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{call.intent}</span>
            <span className="text-xs text-muted-foreground tabular">
              {Math.round((intentEntity?.confidence ?? call.confidence) * 100)}%
            </span>
          </div>
          <ConfidenceMeter value={intentEntity?.confidence ?? call.confidence} showLabel={false} />
        </CardContent>
      </Card>

      {/* Action items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Action items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {call.actionItems.map((item, i) => (
            <button
              key={i}
              onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-white/[0.03]"
            >
              {done[i] ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className={cn(done[i] && "text-muted-foreground line-through")}>{item}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Extracted entities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-4 w-4 text-gold-soft" /> Extracted entities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {otherEntities.map((e, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {e.type.replace(/_/g, " ")}
                </p>
                <p className="truncate text-sm font-medium">{e.value}</p>
              </div>
              <div className="w-20 shrink-0">
                <ConfidenceMeter value={e.confidence} showLabel={false} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Customer mini-profile */}
      {customer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User2 className="h-4 w-4 text-brand" /> Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={avatarUrl(customer.name)} alt={customer.name} />
                <AvatarFallback>{initials(customer.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                  {customer.name}
                  {customer.isVip && <Crown className="h-3.5 w-3.5 text-gold-soft" />}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {customer.city ? `${customer.city} · ` : ""}{customer.phone}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Lifetime" value={formatCurrency(customer.lifetimeValue, { compact: true })} />
              <Stat label="Orders" value={String(customer.totalOrders)} />
              <Stat label="Tier" value={customer.loyaltyTier} className="capitalize" />
            </div>

            <div className="rounded-lg border border-brand/15 bg-brand/[0.06] p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-brand">
                <Sparkles className="h-3 w-3" /> AI insight
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {customer.aiInsight}
              </p>
            </div>

            <Separator />
            <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
              <Link href="/customers">
                View full profile <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-2 py-2">
      <p className={cn("text-sm font-semibold tabular", className)}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
