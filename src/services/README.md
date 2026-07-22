# Service Adapter Layer

Every external capability in NETICS Voice is accessed through a **provider-agnostic
interface** defined here. The prototype ships a `mock` implementation of each; swapping
in a production provider (Twilio, OpenAI, Stripe…) means implementing the same interface
and registering it — **no application code changes**.

```
services/
  ai/            LLM orchestration, RAG, STT/TTS, sentiment, intent
  telephony/     Inbound/outbound calls, live transcription streams
  messaging/     WhatsApp, SMS, Instagram, Messenger, Telegram
  payments/      Stripe / Paystack / Flutterwave charge + subscription
  storage/       S3-compatible object storage for knowledge docs
  index.ts       Provider registry — resolves the active implementation
```

## Contract-first design

Interfaces live next to their mock implementation. Production adapters implement the
interface and are selected via environment configuration in `services/index.ts`.
See `docs/ARCHITECTURE.md` for the planned backend (NestJS + Postgres + Redis + BullMQ).
