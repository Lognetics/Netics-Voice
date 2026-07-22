"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Search, Bot } from "lucide-react";
import type { Conversation } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, timeAgo, initials, avatarUrl } from "@/lib/utils";
import { CHANNEL_META, sentimentDotColor } from "./channel-meta";

const STATUS_TABS = ["all", "open", "pending", "resolved", "escalated"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearch: (q: string) => void;
  status: StatusTab;
  onStatus: (s: StatusTab) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  search,
  onSearch,
  status,
  onStatus,
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-white/[0.06] p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search conversations…"
            className="pl-9"
          />
        </div>
        <Tabs value={status} onValueChange={(v) => onStatus(v as StatusTab)}>
          <TabsList className="w-full">
            {STATUS_TABS.map((s) => (
              <TabsTrigger key={s} value={s} className="flex-1 capitalize text-xs">
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Search}
              title="No conversations"
              description="Try a different search or channel filter."
            />
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {conversations.map((c, i) => {
              const meta = CHANNEL_META[c.channel];
              const Icon = meta.icon;
              const active = c.id === selectedId;
              return (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.015, 0.3) }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors",
                      active
                        ? "bg-brand/[0.08]"
                        : "hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarUrl(c.customerName)} alt={c.customerName} />
                        <AvatarFallback>{initials(c.customerName)}</AvatarFallback>
                      </Avatar>
                      <span
                        className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full border border-background"
                        style={{ background: meta.color }}
                        title={meta.label}
                      >
                        <Icon className="h-2.5 w-2.5 text-white" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{c.customerName}</p>
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: sentimentDotColor(c.sentiment) }}
                          title={c.sentiment}
                        />
                        <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                          {timeAgo(c.lastMessageAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <p className="truncate text-xs text-muted-foreground">
                          {c.lastMessage}
                        </p>
                        {c.unread > 0 && (
                          <Badge
                            variant="default"
                            className="ml-auto h-5 min-w-5 shrink-0 justify-center px-1.5 tabular"
                          >
                            {c.unread}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {c.aiHandled && (
                          <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px]">
                            <Bot className="h-3 w-3 text-brand" /> AI
                          </Badge>
                        )}
                        {c.assignedTo && (
                          <span className="truncate text-[10px] text-muted-foreground">
                            {c.assignedTo}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
