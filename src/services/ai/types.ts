import type { Sentiment, Entity } from "@/types";

/**
 * AIProvider - the single seam between NETICS and any LLM/voice stack.
 * Production adapters (OpenAI, Anthropic, Deepgram, ElevenLabs) implement this.
 */
export interface AIProvider {
  /** Stream a conversational reply token-by-token, grounded in retrieved knowledge. */
  streamReply(input: ChatRequest): AsyncIterable<string>;
  /** Classify the customer's intent from an utterance. */
  detectIntent(utterance: string): Promise<IntentResult>;
  /** Extract structured entities (dates, party size, products…). */
  extractEntities(utterance: string): Promise<Entity[]>;
  /** Score sentiment for a turn or window. */
  analyzeSentiment(text: string): Promise<{ sentiment: Sentiment; score: number }>;
  /** Retrieval-Augmented Generation: fetch relevant knowledge chunks. */
  retrieve(query: string, opts?: { topK?: number }): Promise<RetrievedChunk[]>;
  /** Summarize a completed conversation. */
  summarize(transcript: string): Promise<CallSummary>;
  /** Text-to-Speech - returns an audio stream URL (mock returns a placeholder). */
  synthesizeSpeech(text: string, voice: string): Promise<{ audioUrl: string }>;
  /** Speech-to-Text over a streaming audio source. */
  transcribeStream(source: AudioSource): AsyncIterable<TranscriptChunk>;
}

export interface ChatRequest {
  orgId: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  /** Knowledge base namespace for RAG grounding. */
  knowledgeNamespace?: string;
}

export interface IntentResult {
  intent: string;
  confidence: number;
  alternatives: { intent: string; confidence: number }[];
}

export interface RetrievedChunk {
  docId: string;
  docName: string;
  text: string;
  score: number;
}

export interface CallSummary {
  summary: string;
  actionItems: string[];
  sentiment: Sentiment;
  resolved: boolean;
}

export interface AudioSource {
  callId: string;
}

export interface TranscriptChunk {
  speaker: "customer" | "ai";
  text: string;
  isFinal: boolean;
  confidence: number;
}
