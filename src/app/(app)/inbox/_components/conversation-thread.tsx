"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Sparkles, Check, CheckCheck, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import type { Conversation, Message } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/empty-state";
import { SentimentBadge } from "@/components/shared/indicators";
import { cn, initials, avatarUrl } from "@/lib/utils";
import { messagesFor } from "@/lib/mock";
import { CHANNEL_META, statusMeta } from "./channel-meta";

const QUICK_REPLIES = [
  "Thanks for reaching out! 👋",
  "Let me check that for you.",
  "Your order is on the way.",
  "Is there anything else I can help with?",
];

const AI_REPLIES = [
  "Got it - I've taken care of that for you.",
  "I've updated your booking and sent a confirmation.",
  "Happy to help! Anything else you need?",
  "That's all set. You'll receive a text shortly.",
];

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

interface ConversationThreadProps {
  conversation: Conversation | null;
}

export function ConversationThread({ conversation }: ConversationThreadProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [draft, setDraft] = React.useState("");
  const [aiHandling, setAiHandling] = React.useState(true);
  const [aiTyping, setAiTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reset thread state whenever the selected conversation changes.
  React.useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }
    setMessages(messagesFor(conversation.id));
    setAiHandling(conversation.aiHandled);
    setAiTyping(false);
    setDraft("");
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [conversation]);

  React.useEffect(() => {
    const el = scrollRef.current?.querySelector<HTMLElement>(
      "[data-radix-scroll-area-viewport]"
    );
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, aiTyping]);

  if (!conversation) {
    return (
      <div className="grid h-full place-items-center p-6">
        <EmptyState
          icon={MessageSquare}
          title="Select a conversation"
          description="Choose a conversation from the list to view the thread and reply."
        />
      </div>
    );
  }

  const meta = CHANNEL_META[conversation.channel];
  const Icon = meta.icon;
  const st = statusMeta(conversation.status);

  const send = (text: string) => {
    const body = text.trim();
    if (!body) return;
    const now = new Date().toISOString();
    const mine: Message = {
      id: `${conversation.id}_local_${Date.now()}`,
      conversationId: conversation.id,
      sender: "agent",
      text: body,
      timestamp: now,
      status: "sent",
    };
    setMessages((prev) => [...prev, mine]);
    setDraft("");

    // Simulated AI follow-up when the AI is handling the conversation.
    if (aiHandling) {
      setAiTyping(true);
      const t = setTimeout(() => {
        setAiTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `${conversation.id}_ai_${Date.now()}`,
            conversationId: conversation.id,
            sender: "ai",
            text: AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)],
            timestamp: new Date().toISOString(),
            status: "delivered",
          },
        ]);
        toast.success("AI replied", { description: "Handled autonomously." });
      }, 1400);
      timers.current.push(t);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] p-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl(conversation.customerName)} alt={conversation.customerName} />
          <AvatarFallback>{initials(conversation.customerName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{conversation.customerName}</p>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="grid h-4 w-4 place-items-center rounded-full"
              style={{ background: meta.color }}
            >
              <Icon className="h-2.5 w-2.5 text-white" />
            </span>
            <span>{meta.label}</span>
          </div>
        </div>
        <SentimentBadge sentiment={conversation.sentiment} />
        <Badge variant={st.variant}>{st.label}</Badge>
      </div>

      {/* AI handling banner */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.015] px-3 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span
            className={cn(
              "grid h-6 w-6 place-items-center rounded-lg",
              aiHandling ? "bg-brand/12 text-brand" : "bg-white/[0.05] text-muted-foreground"
            )}
          >
            <Bot className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium">
            {aiHandling ? "AI is handling this conversation" : "You have taken over"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {aiHandling ? "Take over" : "Hand to AI"}
          </span>
          <Switch
            checked={aiHandling}
            onCheckedChange={(v) => {
              setAiHandling(v);
              toast(v ? "AI is now handling this chat" : "You are now handling this chat", {
                icon: v ? "🤖" : "🧑",
              });
            }}
          />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4">
        <div className="space-y-3 py-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const outbound = m.sender === "ai" || m.sender === "agent";
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", outbound ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-soft",
                      m.sender === "customer" &&
                        "rounded-bl-sm bg-white/[0.05] text-foreground",
                      m.sender === "ai" &&
                        "rounded-br-sm bg-brand/15 text-brand-soft",
                      m.sender === "agent" &&
                        "rounded-br-sm bg-gold/15 text-gold-soft"
                    )}
                  >
                    {m.sender !== "customer" && (
                      <div className="mb-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide opacity-70">
                        {m.sender === "ai" ? (
                          <>
                            <Bot className="h-3 w-3" /> AI Agent
                          </>
                        ) : (
                          "Agent"
                        )}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] opacity-60">
                      {timeLabel(m.timestamp)}
                      {outbound &&
                        (m.status === "read" ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {aiTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <div className="flex items-center gap-1.5 rounded-2xl rounded-br-sm bg-brand/15 px-3.5 py-2.5 text-brand-soft">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
                      style={{ animationDelay: `${d * 150}ms` }}
                    />
                  ))}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Quick replies */}
      <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] px-3 pt-2.5">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setDraft(q)}
            className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="flex items-end gap-2 p-3">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
          placeholder={`Message ${conversation.customerName.split(" ")[0]} on ${meta.label}…`}
          className="max-h-32 min-h-11 flex-1 resize-none"
          rows={1}
        />
        <Button
          size="icon"
          onClick={() => send(draft)}
          disabled={!draft.trim()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
