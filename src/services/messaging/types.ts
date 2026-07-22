import type { Channel } from "@/types";

/** MessagingProvider - unifies WhatsApp / SMS / Instagram / Messenger / Telegram. */
export interface MessagingProvider {
  send(channel: Channel, to: string, text: string): Promise<{ messageId: string }>;
  sendTemplate(
    channel: Channel,
    to: string,
    template: string,
    vars: Record<string, string>
  ): Promise<{ messageId: string }>;
  /** Subscribe to inbound messages for the unified inbox. */
  onMessage(handler: (msg: InboundMessage) => void): () => void;
}

export interface InboundMessage {
  channel: Channel;
  from: string;
  text: string;
  timestamp: string;
}
