# Integration Guide — Swapping Mocks for Real Providers

The prototype is **backend-ready**: application code never imports a concrete provider, only the
interfaces in [`src/services`](../src/services). To go live, implement an interface and register it.

## 1. Pattern

```ts
// src/services/ai/openai.ts
import type { AIProvider } from "./types";

export class OpenAIProvider implements AIProvider {
  async *streamReply(input) { /* call the LLM, yield tokens */ }
  async detectIntent(u) { /* ... */ }
  async retrieve(q) { /* vector search */ }
  // ...implement the full interface
}
```

```ts
// src/services/index.ts
export function getAIProvider(): AIProvider {
  switch (config.aiProvider) {
    case "openai": return (_ai ??= new OpenAIProvider());
    default:       return (_ai ??= new MockAIProvider());
  }
}
```

Set the provider via env (see `.env.example`): `NEXT_PUBLIC_AI_PROVIDER=openai`.

## 2. Capability → provider mapping

| Capability | Interface | Example providers |
| --- | --- | --- |
| LLM, RAG, intent, sentiment, STT/TTS | `AIProvider` | OpenAI / Anthropic + Deepgram + ElevenLabs + pgvector/Pinecone |
| Phone calls (inbound/outbound, transfer) | `TelephonyProvider` | Twilio, Vonage, SIP trunk |
| WhatsApp / SMS / IG / Messenger / Telegram | `MessagingProvider` | Meta Cloud API, Twilio |
| Payments, subscriptions, invoices | `PaymentProvider` | Stripe, Paystack, Flutterwave |
| Object storage (docs, recordings) | (planned) | S3 / R2 / MinIO |

## 3. Replacing the mock data layer

Feature pages read from `src/lib/mock`. In production:

1. Stand up the NestJS API (see [`ARCHITECTURE.md`](ARCHITECTURE.md)).
2. Replace direct mock imports with **TanStack Query** hooks hitting the API — the response shapes
   already match `src/types`, so components need minimal change.
3. Add auth (JWT/OAuth) + tenant context to every request.

Suggested query-hook layout:

```
src/services/api/
  calls.ts        useCalls(), useCall(id)
  orders.ts       useOrders(), useCreateOrder()
  bookings.ts     ...
```

## 4. Real-time

The Live Call Center and Inbox simulate streaming with timers. In production, connect the
WebSocket gateway and feed `AIProvider.transcribeStream` / call events into the same components —
the UI contracts (transcript turns, sentiment, confidence) are unchanged.

## 5. Environment

Copy `.env.example` → `.env.local` and fill provider credentials. All provider selection is driven
by `NEXT_PUBLIC_*_PROVIDER` flags so the UI can run fully mocked with no secrets.
