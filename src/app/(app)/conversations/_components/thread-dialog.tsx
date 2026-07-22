"use client";

import * as React from "react";
import { Bot } from "lucide-react";
import type { Conversation } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SentimentBadge } from "@/components/shared/indicators";
import { cn, initials, avatarUrl } from "@/lib/utils";
import { messagesFor } from "@/lib/mock";
import {
  CHANNEL_META,
  statusMeta,
} from "../../inbox/_components/channel-meta";

interface ThreadDialogProps {
  conversation: Conversation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThreadDialog({
  conversation,
  open,
  onOpenChange,
}: ThreadDialogProps) {
  const messages = React.useMemo(
    () => (conversation ? messagesFor(conversation.id) : []),
    [conversation]
  );

  if (!conversation) return null;

  const meta = CHANNEL_META[conversation.channel];
  const Icon = meta.icon;
  const st = statusMeta(conversation.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="flex-row items-center gap-3 space-y-0 border-b border-white/[0.06] p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl(conversation.customerName)} alt={conversation.customerName} />
            <AvatarFallback>{initials(conversation.customerName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-left">
            <DialogTitle className="truncate text-sm">
              {conversation.customerName}
            </DialogTitle>
            <DialogDescription className="mt-0.5 flex items-center gap-1.5 text-xs">
              <span
                className="grid h-4 w-4 place-items-center rounded-full"
                style={{ background: meta.color }}
              >
                <Icon className="h-2.5 w-2.5 text-white" />
              </span>
              {meta.label} · Read-only history
            </DialogDescription>
          </div>
          <Badge variant={st.variant}>{st.label}</Badge>
        </DialogHeader>

        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2">
          <SentimentBadge sentiment={conversation.sentiment} />
          {conversation.aiHandled && (
            <Badge variant="secondary" className="gap-1">
              <Bot className="h-3 w-3 text-brand" /> AI-handled
            </Badge>
          )}
          {conversation.assignedTo && (
            <span className="ml-auto truncate text-xs text-muted-foreground">
              Assigned · {conversation.assignedTo}
            </span>
          )}
        </div>

        <ScrollArea className="h-80 px-4">
          <div className="space-y-3 py-4">
            {messages.map((m) => {
              const outbound = m.sender === "ai" || m.sender === "agent";
              return (
                <div
                  key={m.id}
                  className={cn("flex", outbound ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                      m.sender === "customer" && "rounded-bl-sm bg-white/[0.05]",
                      m.sender === "ai" && "rounded-br-sm bg-brand/15 text-brand-soft",
                      m.sender === "agent" && "rounded-br-sm bg-gold/15 text-gold-soft"
                    )}
                  >
                    {m.sender !== "customer" && (
                      <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide opacity-70">
                        {m.sender === "ai" ? "AI Agent" : "Agent"}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <div className="mt-0.5 text-right text-[10px] opacity-60">
                      {new Date(m.timestamp).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
