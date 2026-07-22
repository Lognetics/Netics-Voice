"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowUpRight } from "lucide-react";
import type { AppNotification } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveDot } from "@/components/shared/indicators";
import { cn, timeAgo } from "@/lib/utils";
import { TYPE_META, PRIORITY_META } from "./notification-config";

interface NotificationItemProps {
  notification: AppNotification;
  onToggleRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onOpen: (n: AppNotification) => void;
}

export function NotificationItem({
  notification,
  onToggleRead,
  onDismiss,
  onOpen,
}: NotificationItemProps) {
  const meta = TYPE_META[notification.type];
  const priority = PRIORITY_META[notification.priority];
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22 }}
      onClick={() => onOpen(notification)}
      className={cn(
        "group relative flex cursor-pointer items-start gap-3.5 rounded-xl border p-3.5 transition-colors",
        notification.read
          ? "border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03]"
          : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]"
      )}
    >
      {/* Unread accent rail */}
      {!notification.read && (
        <span className="absolute left-0 top-3.5 h-[calc(100%-1.75rem)] w-0.5 rounded-full bg-brand" />
      )}

      <div
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
          meta.bg
        )}
      >
        <Icon className={cn("h-5 w-5", meta.color)} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {!notification.read && <LiveDot color="#3A86FF" className="h-2 w-2" />}
          <p
            className={cn(
              "truncate text-sm",
              notification.read ? "font-medium" : "font-semibold"
            )}
          >
            {notification.title}
          </p>
          {notification.priority === "high" && (
            <Badge variant={priority.variant} className="shrink-0">
              {priority.label}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {notification.body}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground/80">
          <span>{meta.label}</span>
          <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
          <span>{timeAgo(notification.createdAt)}</span>
          {notification.actionUrl && (
            <>
              <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
              <span className="inline-flex items-center gap-0.5 text-brand-soft">
                Open <ArrowUpRight className="h-3 w-3" />
              </span>
            </>
          )}
        </div>
      </div>

      {/* Row actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon-sm"
          title={notification.read ? "Mark as unread" : "Mark as read"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleRead(notification.id);
          }}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          title="Dismiss"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
