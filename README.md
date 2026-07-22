<div align="center">

# NETICS Voice

### The AI Employee That Never Misses a Customer.

A production-quality frontend prototype of a multi-tenant **AI Customer Operations Platform** —
automating phone calls, bookings, orders, support and customer engagement with conversational AI,
across every industry.

</div>

---

## ✨ What this is

NETICS Voice is not just an AI call center — it's an **AI Operations Employee**. It understands
natural conversations, answers questions, takes orders, processes bookings, and escalates complex
requests to human staff. This repository is a **fully navigable frontend prototype** with a rich,
deterministic mock-data layer and **backend-ready service interfaces**, so it can be wired to real
AI, telephony, messaging and payment providers without changing application code.

> Everything you see is powered by mocked data. The architecture is designed so each external
> capability is swapped in behind a stable interface — see [`src/services`](src/services).

## 🚀 Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

**Demo flow:** Landing → `Start free trial` → Register → **Onboarding wizard** → **Dashboard**,
or jump straight into the app via `View live demo`. Press <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> anywhere
for the command palette.

## 🧭 Product modules

| Area | Route | Highlights |
| --- | --- | --- |
| **Landing** | `/` | Hero with live-call simulation, industries, pricing |
| **Auth** | `/login` `/register` `/forgot-password` | MFA + SSO placeholders |
| **Onboarding** | `/onboarding` | 6-step org setup wizard w/ industry templates |
| **Dashboard** | `/dashboard` | Animated KPIs, live calls, charts, activity feed |
| **Live Call Center** | `/calls` | Real-time (simulated) call cards, transcripts, takeover |
| **Conversation Viewer** | `/calls/[id]` | Transcript playback, sentiment timeline, entities |
| **Omnichannel Inbox** | `/inbox` | Unified phone/WhatsApp/IG/SMS conversation inbox |
| **Conversations** | `/conversations` | History + conversation intelligence |
| **Customers (CRM)** | `/customers` `/customers/[id]` | Profiles, LTV, loyalty, AI insights |
| **Orders** | `/orders` | Kitchen pipeline board, order lifecycle, analytics |
| **Bookings** | `/bookings` | Calendar, resources, reschedule, waitlist |
| **Branches** | `/branches` | Multi-location performance + map |
| **Employees** | `/employees` | Roles, permissions, performance, takeover history |
| **AI Studio** | `/ai-studio` | No-code flow builder, persona, testing playground |
| **Voice Settings** | `/voice` | Voice, tone, speed, emotion, brand alignment |
| **Knowledge Base** | `/knowledge` | Upload, indexing, confidence, versions |
| **Analytics** | `/analytics` | Revenue, funnels, heat maps, branch comparison |
| **Integrations** | `/integrations` | Stripe, Twilio, WhatsApp, Salesforce… (mock) |
| **Billing** | `/billing` | Plans, usage meters, invoices |
| **API & Webhooks** | `/api` | Keys, webhooks, logs, docs viewer |
| **Notifications** | `/notifications` | Multi-channel alerts + preferences |
| **Settings** | `/settings` | Org, branding, security, compliance, localization |

## 🛠 Tech stack

- **Next.js 14** (App Router) · **TypeScript** (strict)
- **Tailwind CSS** + custom design tokens (glassmorphism, dark-first)
- **shadcn/ui**-style primitives on **Radix UI**
- **Framer Motion** (60fps animations) · **Recharts** (data viz)
- **Zustand** (UI state) · **TanStack Query** (data layer) · **Zod** + **React Hook Form**
- **cmdk** (command palette) · **sonner** (toasts) · **lucide-react** (icons)

## 📁 Structure

```
src/
  app/                 # App Router routes
    (auth)/            # login · register · forgot-password  (auth layout)
    (app)/             # authenticated shell (sidebar + topbar) — all modules
    onboarding/        # org setup wizard
    page.tsx           # marketing landing
  components/
    ui/                # design-system primitives (Button, Card, Dialog…)
    shared/            # StatCard, charts, waveform, indicators, logo…
    layout/            # sidebar, topbar, command palette
    providers.tsx      # Query + Tooltip + Toaster
  features/
    marketing/         # landing page sections
  hooks/               # zustand store + hooks
  lib/
    mock/              # deterministic mock database (db, kpis, pools)
    constants.ts       # industries, voices, languages, brand
    navigation.ts      # sidebar config
    utils.ts           # cn + formatters + seeded RNG
  services/            # provider-agnostic adapters (ai, telephony, messaging, payments)
  types/               # single source of truth domain types
```

## 📚 Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — frontend & planned backend/AI architecture
- [`docs/DESIGN.md`](docs/DESIGN.md) — design system, tokens, components
- [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) — entities & the planned normalized schema
- [`docs/INTEGRATION.md`](docs/INTEGRATION.md) — how to swap mocks for real providers
- [`src/services/README.md`](src/services/README.md) — the service adapter layer

## 🔌 From prototype to production

Every external capability is accessed through an interface in `src/services`. Ship a production
adapter that implements the same interface (e.g. Twilio for telephony, OpenAI/Anthropic + a vector
DB for AI, Stripe for payments) and register it — **no UI or feature code changes required**. The
mock data shapes in `src/lib/mock` mirror the domain types in `src/types`, which map 1:1 to the
planned PostgreSQL schema.

## ⚠️ Assumptions & scope

- All data is **mocked** and generated deterministically (seeded) so server/client renders match.
- Auth, payments, telephony and AI are **simulated** via placeholder service interfaces.
- Timestamps are computed from a fixed reference "now" for stable, reproducible demos.
- This is a **prototype** demonstrating the complete product vision — not a deployed backend.

---

<div align="center">
Built as a product prototype · © 2026 NETICS Voice
</div>
