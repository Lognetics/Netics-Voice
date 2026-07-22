"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Crown,
  Gauge,
  Globe,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  ShieldAlert,
  Star,
  Tag,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { bookings, calls, customers, orders } from "@/lib/mock";
import { formatCurrency, formatNumber, initials } from "@/lib/utils";
import { ProfileTabs } from "../_components/profile-tabs";
import {
  LeadScoreBar,
  RiskBadge,
  TierBadge,
  tierConfig,
  tierProgress,
} from "../_components/customer-helpers";

export default function CustomerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const customer = customers.find((c) => c.id === params.id);

  if (!customer) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Customer not found"
          description="We couldn't find a customer with that ID."
        />
        <EmptyState
          icon={Users}
          title="This customer doesn't exist"
          description="The profile may have been removed or the link is incorrect."
          action={
            <Button asChild>
              <Link href="/customers">
                <ArrowLeft className="h-4 w-4" /> Back to customers
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const customerCalls = calls
    .filter((c) => c.customerId === customer.id)
    .sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt));
  const customerOrders = orders
    .filter((o) => o.customerId === customer.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const customerBookings = bookings
    .filter((b) => b.customerId === customer.id)
    .sort((a, b) => +new Date(b.start) - +new Date(a.start));

  const progress = tierProgress(customer);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4" /> Customers
          </Link>
        </Button>
      </div>

      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden">
          <div
            className="h-20 w-full"
            style={{
              background: `linear-gradient(120deg, ${
                tierConfig[customer.loyaltyTier].dot
              }22, transparent 70%)`,
            }}
          />
          <CardContent className="-mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar className="h-20 w-20 ring-4 ring-base-card">
                <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                <AvatarFallback className="text-lg">
                  {initials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {customer.name}
                  </h1>
                  {customer.isVip && (
                    <Badge variant="gold">
                      <Crown className="h-3 w-3" /> VIP
                    </Badge>
                  )}
                  <TierBadge tier={customer.loyaltyTier} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {customer.phone}
                  </span>
                  {customer.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {customer.email}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {[customer.city, customer.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => toast.success(`Calling ${customer.name}…`)}
              >
                <Phone className="h-4 w-4" /> Call
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.success(`Message sent to ${customer.name}.`)
                }
              >
                <MessageSquare className="h-4 w-4" /> Message
              </Button>
              <Button
                variant="outline"
                onClick={() => toast("Note editor opened below.")}
              >
                <Plus className="h-4 w-4" /> Add note
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Body */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-1">
          {/* Snapshot stats */}
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 p-5">
              <Snapshot
                label="Lifetime value"
                value={formatCurrency(customer.lifetimeValue)}
                accent="text-success"
              />
              <Snapshot
                label="Loyalty points"
                value={formatNumber(customer.loyaltyPoints)}
                accent="text-gold-soft"
              />
              <Snapshot
                label="Total orders"
                value={String(customer.totalOrders)}
              />
              <Snapshot
                label="Total bookings"
                value={String(customer.totalBookings)}
              />
            </CardContent>
          </Card>

          {/* Loyalty progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-4 w-4 text-gold-soft" /> Loyalty
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <TierBadge tier={customer.loyaltyTier} />
                <span className="tabular text-muted-foreground">
                  {formatNumber(customer.loyaltyPoints)} pts
                </span>
              </div>
              <Progress
                value={progress.ratio * 100}
                indicatorClassName="bg-gold-gradient"
              />
              <p className="text-xs text-muted-foreground">
                {progress.nextTier ? (
                  <>
                    {formatNumber(progress.remaining)} pts to{" "}
                    <span className="capitalize text-foreground">
                      {progress.nextTier}
                    </span>
                  </>
                ) : (
                  "Top tier reached — highest loyalty status."
                )}
              </p>
            </CardContent>
          </Card>

          {/* Risk + lead score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-brand" /> Scoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldAlert className="h-4 w-4" /> Risk level
                </span>
                <RiskBadge level={customer.riskLevel} />
              </div>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">
                  Lead score
                </span>
                <LeadScoreBar score={customer.leadScore} />
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <DetailRow
                icon={<Globe className="h-4 w-4" />}
                label="Preferred language"
                value={customer.preferredLanguage}
              />
              <DetailRow
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={[customer.city, customer.country]
                  .filter(Boolean)
                  .join(", ")}
              />

              <div>
                <p className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" /> Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {customer.tags.length ? (
                    customer.tags.map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Heart className="h-4 w-4" /> Favorite products
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {customer.favoriteProducts.length ? (
                    customer.favoriteProducts.map((p, i) => (
                      <Badge key={`${p}-${i}`} variant="outline">
                        {p}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main column */}
        <div className="lg:col-span-2">
          <ProfileTabs
            customer={customer}
            calls={customerCalls}
            orders={customerOrders}
            bookings={customerBookings}
          />
        </div>
      </div>
    </div>
  );
}

function Snapshot({
  label,
  value,
  accent = "text-foreground",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular ${accent}`}>{value}</p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-right font-medium">{value || "—"}</span>
    </div>
  );
}
