# Data Model

The prototype's TypeScript types in [`src/types/index.ts`](../src/types/index.ts) are the single
source of truth and map 1:1 to the planned normalized PostgreSQL schema. Every tenant-scoped table
carries an `org_id` for multi-tenant isolation.

## Core entities

```
organizations ──1:N── branches
organizations ──1:N── users ───N:1── roles
organizations ──1:N── customers
organizations ──1:N── knowledge_documents
organizations ──1:N── ai_agents ──1:N── escalation_rules

customers ──1:N── calls ──1:N── transcript_turns
customers ──1:N── conversations ──1:N── messages
customers ──1:N── orders ──1:N── order_items ──N:1── products
customers ──1:N── bookings ──N:1── resources

organizations ──1:N── invoices / payments
organizations ──1:N── api_keys / webhooks / audit_logs
organizations ──1:N── notifications / analytics_events
```

## Table sketch (planned Postgres)

| Table | Key columns |
| --- | --- |
| `organizations` | id, name, slug, industry, plan, brand_color, timezone, languages[], status |
| `branches` | id, org_id, name, city, country, phone, status, manager, staff_count, revenue |
| `users` | id, org_id, name, email, role, department, branch_id, status, permissions[] |
| `customers` | id, org_id, name, phone, email, loyalty_tier, ltv, lead_score, sentiment, tags[] |
| `calls` | id, org_id, branch_id, customer_id, channel, status, intent, sentiment, confidence, duration, summary |
| `transcript_turns` | id, call_id, speaker, text, ts, sentiment, confidence |
| `conversations` | id, org_id, customer_id, channel, status, assigned_to, sentiment |
| `messages` | id, conversation_id, sender, text, ts, status |
| `orders` | id, org_id, branch_id, customer_id, reference, total, status, payment_status, type, channel |
| `order_items` | id, order_id, product_id, name, qty, price |
| `products` | id, org_id, name, category, price, stock_level, units_sold |
| `bookings` | id, org_id, branch_id, customer_id, resource, service, status, start, end, price |
| `knowledge_documents` | id, org_id, name, type, category, status, confidence, chunks, version |
| `ai_agents` | id, org_id, name, voice, language, personality, temperature, resolution_rate |
| `escalation_rules` | id, agent_id, trigger, condition, action, target, enabled |
| `intents` | id, org_id, name, category, count, success_rate, sample_utterances[] |
| `invoices` | id, org_id, number, amount, status, issued_at, due_at, period |
| `api_keys` | id, org_id, name, prefix, scopes[], status, last_used |
| `webhooks` | id, org_id, url, events[], secret, status |
| `audit_logs` | id, org_id, actor, action, target, ip, ts, status |
| `notifications` | id, org_id, type, title, body, read, priority, created_at |
| `analytics_events` | id, org_id, type, payload jsonb, ts |

## Indexing & isolation notes

- Composite indexes on `(org_id, created_at)` for feed queries; `(org_id, status)` for pipelines.
- Row-level security policies keyed on `org_id` enforce tenant isolation.
- Vector embeddings for knowledge chunks stored in `pgvector` (or an external vector DB) keyed by
  `(org_id, document_id, chunk_id)` for RAG retrieval.
- Time-series analytics roll up into materialized views for dashboard/analytics performance.
