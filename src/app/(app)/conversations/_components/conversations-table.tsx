"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Bot, ChevronRight } from "lucide-react";
import type { Conversation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { SentimentBadge } from "@/components/shared/indicators";
import { Search } from "lucide-react";
import { cn, timeAgo, initials, avatarUrl } from "@/lib/utils";
import { CHANNEL_META, statusMeta } from "../../inbox/_components/channel-meta";

interface ConversationsTableProps {
  conversations: Conversation[];
  onOpen: (c: Conversation) => void;
}

export function ConversationsTable({
  conversations,
  onOpen,
}: ConversationsTableProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Search}
          title="No conversations found"
          description="Adjust your filters or search to see more history."
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Customer</th>
            <th className="px-4 py-2.5 font-medium">Channel</th>
            <th className="px-4 py-2.5 font-medium">Last message</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Sentiment</th>
            <th className="px-4 py-2.5 font-medium">Assigned</th>
            <th className="px-4 py-2.5 font-medium">Handled</th>
            <th className="px-4 py-2.5 text-right font-medium">Updated</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {conversations.map((c, i) => {
            const meta = CHANNEL_META[c.channel];
            const Icon = meta.icon;
            const st = statusMeta(c.status);
            return (
              <motion.tr
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.01, 0.25) }}
                onClick={() => onOpen(c)}
                className="group cursor-pointer border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl(c.customerName)} alt={c.customerName} />
                      <AvatarFallback className="text-xs">
                        {initials(c.customerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.customerName}</p>
                      {c.unread > 0 && (
                        <span className="text-[10px] text-brand-soft">
                          {c.unread} unread
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                      meta.chip
                    )}
                  >
                    <Icon className="h-3 w-3" /> {meta.label}
                  </span>
                </td>
                <td className="max-w-[240px] px-4 py-3">
                  <p className="truncate text-muted-foreground">{c.lastMessage}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={st.variant}>{st.label}</Badge>
                </td>
                <td className="px-4 py-3">
                  <SentimentBadge sentiment={c.sentiment} showEmoji={false} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {c.assignedTo ?? "-"}
                </td>
                <td className="px-4 py-3">
                  {c.aiHandled ? (
                    <Badge variant="secondary" className="gap-1">
                      <Bot className="h-3 w-3 text-brand" /> AI
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Agent</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                  {timeAgo(c.lastMessageAt)}
                </td>
                <td className="px-2 py-3 text-muted-foreground">
                  <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
