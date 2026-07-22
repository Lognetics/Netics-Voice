# Architecture

This document describes the current frontend architecture and the **planned** backend + AI
architecture that the prototype is designed to plug into.

## 1. Frontend

### Rendering & routing
- **Next.js 14 App Router**. Marketing landing is largely static; the authenticated app lives under
  the `(app)` route group which supplies the persistent shell (sidebar + topbar + command palette).
- Auth screens use a separate `(auth)` route group with a branded split layout.
- Most module pages are **client components** (`"use client"`) because they are highly interactive
  (live simulations, local optimistic state). Data is read from the mock layer synchronously; in
  production these become TanStack Query calls against the API.

### State
- **Zustand** (`src/hooks/use-app-store.ts`) holds cross-cutting UI state: sidebar collapse,
  command-palette open, active branch, global AI pause. Persisted to `localStorage`.
- **TanStack Query** is provisioned in `src/components/providers.tsx` for server-state once a real
  API exists. Query keys should be namespaced by tenant + resource.
- Local component state drives per-screen optimistic interactions (advancing an order, sending a
  message, editing settings) with `sonner` toasts as feedback.

### Design system
- Tailwind tokens in `tailwind.config.ts` + CSS variables in `globals.css` implement a dark-first,
  glassmorphic theme. Semantic shadcn-style tokens (`--background`, `--card`, `--primary`…) coexist
  with brand tokens (`gold`, `brand`, `success`, `danger`).
- Primitives (`src/components/ui`) wrap Radix UI. Shared composite components
  (`src/components/shared`) include `StatCard`, chart wrappers, `VoiceWaveform`, sentiment/confidence
  indicators, and the animated counter.

### Performance
- Route-level code splitting via the App Router; heavy modules are isolated per route.
- Charts and framer-motion animations are client-only and lazy by route.
- Deterministic mock generation avoids hydration mismatches (seeded RNG + fixed reference time).
- Skeletons/empty/error states are provided by shared components.

## 2. Service adapter layer (the seam)

`src/services` defines a **provider-agnostic interface** for every external capability and ships a
`mock` implementation. The registry in `src/services/index.ts` resolves the active provider from env
config. Application code depends only on the interface.

```
AIProvider        → LLM streaming, RAG retrieval, intent, entities, sentiment, STT/TTS, summaries
TelephonyProvider → dial, transfer, hangup, mute, provision numbers
MessagingProvider → send/template across WhatsApp/SMS/IG/Messenger/Telegram + inbound subscribe
PaymentProvider   → charge, subscribe, refund, invoice
```

## 3. Planned backend

```
                    ┌──────────────────────────────────────────────┐
   Phone / SIP ─────┤  Telephony gateway (Twilio / SIP trunk)       │
   WhatsApp / SMS ──┤  Messaging webhooks (Meta / Twilio)           │
                    └───────────────┬──────────────────────────────┘
                                    │  real-time audio + events
                        ┌───────────▼───────────┐
                        │   NestJS API Gateway   │  REST + GraphQL
                        │   WebSockets (live)    │
                        └───┬─────────┬──────────┘
              ┌─────────────┘         └───────────────┐
     ┌────────▼────────┐                      ┌────────▼─────────┐
     │  PostgreSQL      │  Prisma ORM         │  Redis           │  cache + pub/sub
     │  (multi-tenant)  │                     │  BullMQ queues   │  async jobs
     └────────┬─────────┘                     └────────┬─────────┘
              │                                        │
     ┌────────▼─────────┐                     ┌────────▼─────────┐
     │  S3-compatible   │  knowledge docs     │  Vector DB       │  RAG embeddings
     │  object storage  │  + recordings       │  (pgvector/Pinecone)
     └──────────────────┘                     └──────────────────┘
                                    │
                          OpenTelemetry traces/metrics/logs
```

- **NestJS** modular services (calls, orders, bookings, CRM, knowledge, billing, auth) behind a
  gateway exposing **REST and GraphQL**. **WebSockets** stream live call/transcript events to the
  Live Call Center and Inbox.
- **PostgreSQL** with **Prisma**; strict **tenant isolation** (org_id on every row + row-level
  security). See [`DATA-MODEL.md`](DATA-MODEL.md).
- **Redis** for caching + pub/sub; **BullMQ** for async work (indexing docs, sending reminders,
  outbound campaigns, webhook delivery).
- **S3-compatible** object storage for knowledge documents and call recordings.
- **OpenTelemetry** for observability across the voice pipeline.

## 4. Planned AI architecture

- **LLM orchestration** with pluggable providers behind `AIProvider`. Prompt templates + guardrails
  are versioned; conversation memory persists per customer.
- **RAG**: documents chunked + embedded into a **vector database**; retrieval grounds every reply
  in tenant-specific knowledge with confidence scoring.
- **Voice pipeline**: Speech-to-Text → intent/entity/sentiment → LLM (RAG) → Text-to-Speech, with
  **Voice Activity Detection**, barge-in/interruptions and real-time streaming.
- **Multi-language** (150+) with real-time translation.
- **Guardrails & moderation** wrap generation; low-confidence or policy triggers route to the
  human-handoff flow with full context transfer.
- Adapters keep providers swappable — models/vendors can change without touching feature logic.

## 5. Security

- **RBAC** with roles (owner/admin/manager/agent/analyst/viewer) and a permissions matrix.
- **Tenant isolation** at the data layer; JWT/OAuth for auth (SSO + MFA placeholders in UI).
- Input validation with **Zod**; CSRF strategy for mutations; **audit logging** of sensitive actions.
- Encryption in transit + at rest; secrets in a managed vault (placeholders in the prototype).
