import type {
  AIProvider,
  ChatRequest,
  IntentResult,
  RetrievedChunk,
  CallSummary,
  AudioSource,
  TranscriptChunk,
} from "./types";
import type { Entity, Sentiment } from "@/types";
import { intents, knowledgeDocs } from "@/lib/mock/db";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** In-memory AI provider that mimics streaming, RAG and analysis for the prototype. */
export class MockAIProvider implements AIProvider {
  async *streamReply(input: ChatRequest): AsyncIterable<string> {
    const last = input.messages[input.messages.length - 1]?.content ?? "";
    const reply = this.canned(last);
    for (const word of reply.split(" ")) {
      await wait(45);
      yield word + " ";
    }
  }

  private canned(prompt: string) {
    const p = prompt.toLowerCase();
    if (p.includes("book") || p.includes("table") || p.includes("room"))
      return "Absolutely - I can book that for you. I have availability Saturday at 7pm or Sunday at 1pm. Which works best?";
    if (p.includes("order") || p.includes("pizza"))
      return "Great choice! Would you like to make it a combo with garlic bread and a drink for just $4 more?";
    if (p.includes("refund") || p.includes("cancel"))
      return "I'm sorry about that - let me make it right. I've processed your request and added a credit to your account.";
    return "Of course, I'd be happy to help with that. Could you share a little more detail so I can assist accurately?";
  }

  async detectIntent(utterance: string): Promise<IntentResult> {
    await wait(120);
    const match =
      intents.find((i) => utterance.toLowerCase().includes(i.name.split(" ")[1] ?? "")) ??
      intents[0];
    return {
      intent: match.name,
      confidence: 0.82 + Math.random() * 0.16,
      alternatives: intents.slice(1, 3).map((i) => ({
        intent: i.name,
        confidence: 0.2 + Math.random() * 0.3,
      })),
    };
  }

  async extractEntities(utterance: string): Promise<Entity[]> {
    await wait(90);
    const out: Entity[] = [];
    const num = utterance.match(/\d+/)?.[0];
    if (num) out.push({ type: "party_size", value: num, confidence: 0.9 });
    if (/saturday|sunday|monday|tomorrow|today/i.test(utterance))
      out.push({ type: "date", value: utterance.match(/\w+day|tomorrow|today/i)![0], confidence: 0.88 });
    return out;
  }

  async analyzeSentiment(text: string): Promise<{ sentiment: Sentiment; score: number }> {
    await wait(70);
    const t = text.toLowerCase();
    if (/thank|great|perfect|love|awesome/.test(t)) return { sentiment: "positive", score: 0.9 };
    if (/angry|terrible|worst|refund|missing|cold/.test(t)) return { sentiment: "frustrated", score: 0.8 };
    return { sentiment: "neutral", score: 0.6 };
  }

  async retrieve(query: string, opts?: { topK?: number }): Promise<RetrievedChunk[]> {
    await wait(110);
    return knowledgeDocs.slice(0, opts?.topK ?? 3).map((d) => ({
      docId: d.id,
      docName: d.name,
      text: `Relevant excerpt from ${d.name} matching "${query}"…`,
      score: 0.7 + Math.random() * 0.28,
    }));
  }

  async summarize(): Promise<CallSummary> {
    await wait(200);
    return {
      summary: "Customer placed an order and accepted an upsell. Payment confirmed.",
      actionItems: ["Send confirmation SMS", "Add loyalty points"],
      sentiment: "positive",
      resolved: true,
    };
  }

  async synthesizeSpeech(text: string, voice: string) {
    await wait(60);
    return { audioUrl: `mock://tts/${voice}/${encodeURIComponent(text.slice(0, 24))}` };
  }

  async *transcribeStream(_source: AudioSource): AsyncIterable<TranscriptChunk> {
    const lines = [
      "Hi, I'd like to place an order.",
      "Sure, what would you like today?",
      "A large pepperoni pizza please.",
    ];
    for (const [i, text] of lines.entries()) {
      await wait(600);
      yield { speaker: i % 2 ? "ai" : "customer", text, isFinal: true, confidence: 0.94 };
    }
  }
}
