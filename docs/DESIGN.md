# Design System

NETICS Voice targets the feel of a **premium enterprise AI operating system** — minimal,
glassmorphic, dark-first, with soft shadows, generous spacing and fluid motion. Reference points:
OpenAI, Linear, Stripe, Vercel, Arc, Anthropic.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| `base.bg` | `#080B14` | App background |
| `base.primary` | `#0B0F1A` | Primary surface |
| `base.secondary` | `#151C2E` | Secondary surface |
| `base.card` | `#121826` | Cards |
| `brand` | `#3A86FF` | Primary accent / actions |
| `gold` | `#C9A227` | Premium accent / revenue |
| `success` | `#00C896` | Positive / AI resolution |
| `danger` | `#FF4D4F` | Destructive / alerts |
| `foreground` | `#FFFFFF` | Primary text |
| `muted-foreground` | `#B8C2D1` | Secondary text |

Defined in `tailwind.config.ts` (brand tokens) and `globals.css` (semantic CSS variables).

## Signature utilities (globals.css)

- `.glass` / `.glass-subtle` — glassmorphism panels (blur + hairline border + soft shadow).
- `.text-gradient`, `.text-gradient-brand`, `.text-gradient-gold` — gradient headings.
- `.bg-grid`, `bg-mesh` — hero/backdrop textures.
- `.skeleton` — shimmer loading placeholder.
- `.focus-ring` — accessible focus outline.
- `.tabular` — tabular-nums for aligned metrics.

## Typography

- **Inter** (`--font-sans`) for UI, **JetBrains Mono** (`--font-mono`) for code/keys/metrics.
- Tight tracking on headings; `tabular-nums` for KPIs.

## Primitives (`src/components/ui`)

Radix-backed, shadcn-style: `Button` (7 variants inc. `gold`/`success`), `Card`, `Badge`,
`Input`, `Label`, `Textarea`, `Avatar`, `Separator`, `Skeleton`, `Progress`, `Tabs`, `Switch`,
`Dialog`, `DropdownMenu`, `Tooltip`, `Select`, `ScrollArea`, plus `sonner` toaster.

## Composite components (`src/components/shared`)

- `StatCard` — KPI card with icon, delta chip, animated counter and sparkline.
- `AnimatedCounter` — springs numbers up when scrolled into view.
- `Sparkline` — dependency-free inline SVG trend.
- `charts.tsx` — dark-themed Recharts wrappers: `AreaTrend`, `BarSeries`, `LineTrend`, `Donut`.
- `VoiceWaveform` — animated bar-style waveform for calls.
- `indicators.tsx` — `SentimentBadge`, `ConfidenceMeter`, `LiveDot`, `StatusPill`.
- `PageHeader`, `EmptyState`, `Logo`.

## Motion

Framer Motion drives entrance transitions (opacity + y), the animated sidebar active indicator
(`layoutId`), live-call/transcript reveals, floating hero chips and KPI counters. Targets 60fps;
transforms/opacity only.

## Accessibility

- Semantic Radix primitives (focus management, ARIA, keyboard nav) throughout.
- Visible focus rings (`.focus-ring`), `sr-only` labels on icon buttons, and sufficient contrast
  on the dark theme.
- Command palette (<kbd>⌘K</kbd>) and keyboard-navigable menus/dialogs.

## Responsiveness

Layouts collapse gracefully: the sidebar is toggled on mobile, grids reflow from 4→2→1 columns,
tables become scrollable, and multi-pane views (Inbox) collapse to a list on small screens.
