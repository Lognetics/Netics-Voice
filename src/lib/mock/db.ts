/**
 * NETICS Voice - Deterministic Mock Database
 * -------------------------------------------------------------
 * Generates a rich, self-consistent dataset at module load using a
 * seeded PRNG so values never drift between server and client renders.
 * In production these arrays are replaced by API responses; the shapes
 * are identical (see src/types).
 */

import { NOW } from "@/lib/constants";
import { seededRandom, avatarUrl, initials } from "@/lib/utils";
import {
  FIRST_NAMES,
  LAST_NAMES,
  CITIES,
  NG_STREETS,
  RESTAURANT_ITEMS,
  INTENTS,
  LANG_CODES,
  DEPARTMENTS,
  TAGS,
  KNOWLEDGE_DOCS,
} from "./pools";
import type {
  Organization,
  Branch,
  User,
  Customer,
  Call,
  Order,
  Booking,
  Product,
  KnowledgeDocument,
  AppNotification,
  Conversation,
  Message,
  Sentiment,
  Channel,
  DocType,
  Invoice,
  ApiKey,
  Webhook,
  AuditLogEntry,
  Department,
  Intent,
  Integration,
  AIAgent,
  TimeseriesPoint,
} from "@/types";

const rng = seededRandom("netics-voice-2026");
const rand = () => rng();
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const float = (min: number, max: number, d = 2) =>
  parseFloat((rand() * (max - min) + min).toFixed(d));
const chance = (p: number) => rand() < p;
const id = (prefix: string, n: number) => `${prefix}_${(n + 1).toString().padStart(4, "0")}`;

/** ISO string `mins` minutes before the fixed NOW. */
const ago = (mins: number) => new Date(NOW.getTime() - mins * 60_000).toISOString();
const ahead = (mins: number) => new Date(NOW.getTime() + mins * 60_000).toISOString();

/* --- Phone numbers: mostly Nigerian (+234), mixed with other countries --- */
const NG_PREFIXES = [
  "803", "805", "806", "807", "808", "810", "813", "814", "816", "703",
  "706", "708", "809", "817", "818", "901", "902", "903", "904", "905",
  "906", "915", "916",
];
const ngPhone = () =>
  `+234 ${pick(NG_PREFIXES)} ${int(100, 999)} ${int(1000, 9999)}`;
const INTL_PHONES = [
  () => `+1 (${int(200, 989)}) ${int(200, 999)}-${int(1000, 9999)}`,
  () => `+44 20 ${int(7000, 7999)} ${int(1000, 9999)}`,
  () => `+971 5${int(0, 9)} ${int(100, 999)} ${int(1000, 9999)}`,
  () => `+233 ${int(20, 59)} ${int(100, 999)} ${int(1000, 9999)}`,
  () => `+254 7${int(10, 99)} ${int(100, 999)} ${int(100, 999)}`,
];
/** ~70% Nigerian, ~30% international. */
const mixedPhone = () =>
  chance(0.7) ? ngPhone() : INTL_PHONES[int(0, INTL_PHONES.length - 1)]();

const SENTIMENTS: Sentiment[] = ["positive", "neutral", "negative", "frustrated"];
const CHANNELS: Channel[] = ["phone", "whatsapp", "instagram", "messenger", "webchat", "sms"];

function fullName(i: number) {
  return `${FIRST_NAMES[i % FIRST_NAMES.length].trim()} ${
    LAST_NAMES[(i * 7) % LAST_NAMES.length]
  }`;
}

/* ------------------------------ Orgs ---------------------------------- */

export const organizations: Organization[] = [
  {
    id: "org_0001",
    name: "Bella Cucina Group",
    slug: "bella-cucina",
    industry: "restaurant",
    brandColor: "#FF4D4F",
    website: "bellacucina.ng",
    timezone: "Africa/Lagos",
    languages: ["English", "Pidgin", "Yoruba", "Igbo"],
    plan: "enterprise",
    createdAt: ago(60 * 24 * 220),
    phoneNumbers: ["+234 803 555 0148", "+234 701 555 0192"],
    aiPersonality: "Warm, upbeat, and quick to recommend specials.",
    greeting: "Thanks for calling Bella Cucina! How can I help you today?",
    status: "active",
    logoUrl: undefined,
  },
  {
    id: "org_0002",
    name: "The Grand Aurora Hotels",
    slug: "grand-aurora",
    industry: "hotel",
    brandColor: "#C9A227",
    website: "grandaurora.com",
    timezone: "Europe/London",
    languages: ["English", "French", "Arabic"],
    plan: "enterprise",
    createdAt: ago(60 * 24 * 400),
    phoneNumbers: ["+44 20 7946 0321"],
    aiPersonality: "Refined, gracious, and attentive to detail.",
    greeting: "Welcome to The Grand Aurora. How may I assist you?",
    status: "active",
  },
  {
    id: "org_0003",
    name: "St. Mary's Health Network",
    slug: "st-marys",
    industry: "hospital",
    brandColor: "#00C896",
    website: "stmarys.health",
    timezone: "Africa/Lagos",
    languages: ["English", "Hausa", "Pidgin"],
    plan: "growth",
    createdAt: ago(60 * 24 * 150),
    phoneNumbers: ["+234 902 555 0110"],
    aiPersonality: "Calm, clear, and reassuring.",
    greeting: "Thank you for calling St. Mary's. How can I help you?",
    status: "active",
  },
  {
    id: "org_0004",
    name: "Skyline Realty",
    slug: "skyline-realty",
    industry: "real_estate",
    brandColor: "#3A86FF",
    website: "skylinerealty.com",
    timezone: "America/Los_Angeles",
    languages: ["English", "Mandarin"],
    plan: "growth",
    createdAt: ago(60 * 24 * 90),
    phoneNumbers: ["+1 (415) 555-0177"],
    aiPersonality: "Professional, consultative, and proactive.",
    greeting: "Hi, thanks for calling Skyline Realty! How can I help?",
    status: "trial",
  },
  {
    id: "org_0005",
    name: "Nimbus Store",
    slug: "nimbus-store",
    industry: "ecommerce",
    brandColor: "#00C896",
    website: "nimbus.store",
    timezone: "America/New_York",
    languages: ["English", "Portuguese"],
    plan: "starter",
    createdAt: ago(60 * 24 * 45),
    phoneNumbers: ["+1 (646) 555-0133"],
    aiPersonality: "Friendly, efficient, solution-focused.",
    greeting: "Hi! Thanks for reaching out to Nimbus Store.",
    status: "active",
  },
];

/** The org the demo is "logged in" as. */
export const currentOrg = organizations[0];

/* ----------------------------- Branches ------------------------------- */

export const branches: Branch[] = Array.from({ length: 6 }, (_, i) => {
  const loc = CITIES[i % CITIES.length];
  return {
    id: id("br", i),
    orgId: currentOrg.id,
    name: `Bella Cucina - ${loc.city}`,
    city: loc.city,
    country: loc.country,
    address: `${int(1, 240)} ${pick(NG_STREETS)}`,
    phone: mixedPhone(),
    timezone: currentOrg.timezone,
    status: pick(["open", "open", "open", "busy", "closed"]) as Branch["status"],
    managerName: fullName(i * 3),
    staffCount: int(8, 32),
    monthlyRevenue: int(80_000, 420_000),
    callsToday: int(40, 220),
    rating: float(3.9, 4.9, 1),
    aiPersonality: currentOrg.aiPersonality,
    lat: loc.lat,
    lng: loc.lng,
  };
});

/* ---------------------------- Departments ----------------------------- */

export const departments: Department[] = DEPARTMENTS.map((d, i) => ({
  id: id("dept", i),
  name: d.name,
  color: d.color,
  headcount: int(3, 9),
  lead: fullName(i * 5 + 2),
}));

/* ----------------------------- Employees ------------------------------ */

const ROLES: User["role"][] = ["owner", "admin", "manager", "agent", "agent", "agent", "analyst"];
const STATUSES: User["status"][] = ["online", "on_call", "away", "offline"];

export const employees: User[] = Array.from({ length: 25 }, (_, i) => {
  const name = fullName(i);
  const role = i === 0 ? "owner" : ROLES[i % ROLES.length];
  return {
    id: id("usr", i),
    orgId: currentOrg.id,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@bellacucina.ng`,
    avatarUrl: avatarUrl(name),
    role,
    department: pick(departments).name,
    branchId: pick(branches).id,
    status: i < 6 ? "online" : pick(STATUSES),
    lastActive: ago(int(0, 480)),
    phone: mixedPhone(),
    permissions: role === "owner" ? ["*"] : ["calls.view", "orders.edit", "bookings.edit"],
    callsHandled: int(120, 2400),
    csat: float(4.0, 4.9, 1),
    createdAt: ago(int(30, 400) * 60 * 24),
  };
});

export const currentUser = employees[0];

/* ----------------------------- Customers ------------------------------ */

const TIERS: Customer["loyaltyTier"][] = ["bronze", "silver", "gold", "platinum"];

export const customers: Customer[] = Array.from({ length: 500 }, (_, i) => {
  const name = fullName(i + 3);
  const loc = pick(CITIES);
  const tier = pick(TIERS);
  const orders = int(0, 60);
  const isVip = tier === "platinum" || chance(0.08);
  return {
    id: id("cus", i),
    orgId: currentOrg.id,
    name,
    email: chance(0.85) ? `${name.toLowerCase().replace(/[^a-z]/g, "")}@mail.com` : undefined,
    phone: mixedPhone(),
    avatarUrl: avatarUrl(name + i),
    city: loc.city,
    country: loc.country,
    preferredLanguage: pick(LANG_CODES),
    tags: Array.from(new Set([pick(TAGS), pick(TAGS)])),
    loyaltyPoints: int(0, 12_000),
    loyaltyTier: tier,
    lifetimeValue: int(50, 24_000),
    totalOrders: orders,
    totalBookings: int(0, 24),
    lastContact: ago(int(5, 60 * 24 * 30)),
    createdAt: ago(int(60 * 24, 60 * 24 * 500)),
    riskLevel: pick(["low", "low", "low", "medium", "high"]) as Customer["riskLevel"],
    leadScore: int(20, 99),
    sentiment: pick(SENTIMENTS),
    favoriteProducts: [pick(RESTAURANT_ITEMS).name, pick(RESTAURANT_ITEMS).name],
    isVip,
    aiInsight: pick([
      "Frequently orders on Friday evenings - good target for weekend promos.",
      "Prefers phone over chat. High responsiveness to upsells.",
      "At risk of churn - no orders in 45 days. Suggest win-back offer.",
      "High lifetime value. Prioritize for VIP handling.",
      "Sensitive to wait times; route to fastest branch.",
      "Loyalty points near reward threshold - nudge to redeem.",
    ]),
    notes: chance(0.3) ? "Allergic to shellfish. Prefers window seating." : undefined,
  };
});

/* ------------------------- Transcript builder ------------------------- */

function buildTranscript(intent: string, name: string): Call["transcript"] {
  const turns: Call["transcript"][number] = [] as never;
  const t: Call["transcript"] = [];
  let ts = 0;
  const push = (speaker: "ai" | "customer" | "agent", text: string, s?: Sentiment) => {
    t.push({
      id: `turn_${t.length}`,
      speaker,
      text,
      timestamp: ts,
      sentiment: s,
      confidence: speaker === "ai" ? float(0.82, 0.99) : undefined,
    });
    ts += int(4, 14);
  };
  push("ai", currentOrg.greeting);
  if (intent === "Place order") {
    push("customer", "Hi, I'd like to order a large pepperoni pizza.", "neutral");
    push("ai", "Great choice! Would you like to make it a combo with garlic bread and a drink for just $4 more?");
    push("customer", "Yeah, let's do that.", "positive");
    push("ai", "Perfect - that's one large pepperoni combo for $18.90. Delivery to your usual address on Admiralty Way?");
    push("customer", "Yes please.", "positive");
    push("ai", "All set! Your order will arrive in about 35 minutes. Anything else?");
  } else if (intent === "Reserve table" || intent === "Book room" || intent === "Book appointment") {
    push("customer", `Hi, I'd like to ${intent.toLowerCase()} for this weekend.`, "neutral");
    push("ai", "Absolutely. I have availability on Saturday at 7pm or Sunday at 1pm - which works best?");
    push("customer", "Saturday at 7 sounds perfect.", "positive");
    push("ai", `Wonderful, ${name}. I've reserved that for you and sent a confirmation by text. See you then!`);
  } else if (intent === "Complaint" || intent === "Request refund") {
    push("customer", "My last order was cold and an item was missing.", "frustrated");
    push("ai", "I'm really sorry about that - let me make it right. I've issued a full refund and added a $10 credit to your account.", "neutral");
    push("customer", "Okay, thank you. That helps.", "neutral");
    push("agent", "Hi, this is Maria from the team - I'll personally follow up to ensure your next order is perfect.");
  } else {
    push("customer", "Hi, I have a quick question about my account.", "neutral");
    push("ai", "Of course - I'd be happy to help with that. Could you confirm the phone number on file?");
    push("customer", "Sure, it ends in 4471.", "neutral");
    push("ai", "Thank you! I've pulled up your details. Here's what I found...");
  }
  return t;
}

/* ------------------------------- Calls -------------------------------- */

const CALL_STATUSES: Call["status"][] = [
  "completed", "completed", "completed", "missed", "escalated", "live", "voicemail",
];

export const calls: Call[] = Array.from({ length: 420 }, (_, i) => {
  const cust = customers[i % customers.length];
  const intent = pick(INTENTS);
  const status = i < 5 ? "live" : pick(CALL_STATUSES);
  const dur = status === "missed" ? 0 : status === "live" ? int(20, 240) : int(45, 620);
  const aiHandled = status !== "escalated" && chance(0.86);
  const revenue =
    intent.includes("order") || intent === "Place order" || intent === "Book room"
      ? float(12, 480, 2)
      : undefined;
  return {
    id: id("call", i),
    orgId: currentOrg.id,
    branchId: pick(branches).id,
    customerId: cust.id,
    customerName: cust.name,
    customerPhone: cust.phone,
    channel: i < 5 ? "phone" : pick(CHANNELS),
    direction: chance(0.85) ? "inbound" : "outbound",
    status,
    intent,
    language: cust.preferredLanguage,
    startedAt: status === "live" ? ago(int(0, 4)) : ago(int(5, 60 * 24 * 14)),
    durationSec: dur,
    sentiment: pick(SENTIMENTS),
    confidence: float(0.62, 0.99),
    aiHandled,
    resolved: status === "completed" && chance(0.9),
    escalatedTo: status === "escalated" ? pick(employees).name : undefined,
    summary: `${intent} handled ${aiHandled ? "autonomously by AI" : "with human assist"}. Customer ${
      pick(["satisfied", "very satisfied", "neutral", "needs follow-up"])
    }.`,
    transcript: buildTranscript(intent, cust.name),
    entities: [
      { type: "intent", value: intent, confidence: float(0.8, 0.99) },
      { type: "party_size", value: String(int(1, 8)), confidence: float(0.7, 0.98) },
      { type: "date", value: "Saturday 7:00 PM", confidence: float(0.75, 0.97) },
    ],
    actionItems: aiHandled
      ? ["Send confirmation SMS", "Add loyalty points"]
      : ["Manager callback required", "Review order accuracy"],
    tags: [intent.split(" ")[0].toLowerCase(), cust.loyaltyTier],
    revenue,
    agentId: aiHandled ? undefined : pick(employees).id,
  };
});

export const liveCalls = calls.filter((c) => c.status === "live");

/* ------------------------------ Products ------------------------------ */

export const products: Product[] = RESTAURANT_ITEMS.map((p, i) => ({
  id: id("prd", i),
  orgId: currentOrg.id,
  name: p.name,
  category: p.category,
  price: p.price,
  cost: parseFloat((p.price * 0.4).toFixed(2)),
  description: `Freshly prepared ${p.name.toLowerCase()}.`,
  inStock: chance(0.9),
  stockLevel: int(0, 200),
  unitsSold: int(80, 3200),
  rating: float(3.8, 4.9, 1),
  tags: [p.category],
}));

/* ------------------------------- Orders ------------------------------- */

const ORDER_STATUSES: Order["status"][] = [
  "pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "delivered", "cancelled",
];
const PAY_STATUSES: Order["paymentStatus"][] = ["paid", "paid", "paid", "pending", "refunded"];

export const orders: Order[] = Array.from({ length: 320 }, (_, i) => {
  const cust = customers[(i * 3) % customers.length];
  const itemCount = int(1, 4);
  const items = Array.from({ length: itemCount }, (_, j) => {
    const prod = products[(i + j) % products.length];
    const qty = int(1, 3);
    return {
      id: `oi_${i}_${j}`,
      productId: prod.id,
      name: prod.name,
      quantity: qty,
      price: prod.price,
      notes: chance(0.2) ? "No onions" : undefined,
    };
  });
  const total = parseFloat(items.reduce((s, it) => s + it.price * it.quantity, 0).toFixed(2));
  return {
    id: id("ord", i),
    orgId: currentOrg.id,
    branchId: pick(branches).id,
    customerId: cust.id,
    customerName: cust.name,
    reference: `BC-${int(10000, 99999)}`,
    items,
    total,
    status: i < 8 ? pick(["preparing", "confirmed", "out_for_delivery"]) as Order["status"] : pick(ORDER_STATUSES),
    paymentStatus: pick(PAY_STATUSES),
    paymentMethod: pick(["Visa •4471", "Apple Pay", "Mastercard •8830", "Cash", "Google Pay"]),
    type: pick(["delivery", "pickup", "dine_in"]) as Order["type"],
    channel: pick(CHANNELS),
    createdAt: ago(int(2, 60 * 24 * 20)),
    eta: chance(0.5) ? `${int(10, 45)} min` : undefined,
    address: `${int(10, 990)} Oak St, Apt ${int(1, 40)}`,
    aiCreated: chance(0.78),
    notes: chance(0.2) ? "Leave at door." : undefined,
  };
});

/* ------------------------------ Bookings ------------------------------ */

const BOOKING_STATUSES: Booking["status"][] = [
  "confirmed", "confirmed", "pending", "checked_in", "completed", "cancelled", "no_show", "waitlist",
];
const RESOURCES = ["Table 4", "Table 12", "Patio 2", "Private Room", "Suite 301", "Dr. Chen", "Stylist Maria", "Court A"];

export const bookings: Booking[] = Array.from({ length: 260 }, (_, i) => {
  const cust = customers[(i * 5) % customers.length];
  const startMin = int(-60 * 24 * 5, 60 * 24 * 14);
  return {
    id: id("bkg", i),
    orgId: currentOrg.id,
    branchId: pick(branches).id,
    customerId: cust.id,
    customerName: cust.name,
    reference: `RSV-${int(10000, 99999)}`,
    resource: pick(RESOURCES),
    resourceType: pick(["Table", "Room", "Doctor", "Stylist", "Court"]),
    service: pick(["Dinner", "Lunch", "Consultation", "Haircut", "Overnight Stay", "Checkup"]),
    status: pick(BOOKING_STATUSES),
    start: startMin >= 0 ? ahead(startMin) : ago(-startMin),
    end: startMin >= 0 ? ahead(startMin + 90) : ago(-startMin - 90),
    partySize: int(1, 10),
    price: float(0, 480, 2),
    paymentStatus: pick(PAY_STATUSES),
    channel: pick(CHANNELS),
    aiCreated: chance(0.8),
    recurring: chance(0.15),
    notes: chance(0.25) ? "Anniversary - window table requested." : undefined,
  };
});

/* --------------------------- Knowledge docs --------------------------- */

const DOC_STATUS: KnowledgeDocument["status"][] = ["indexed", "indexed", "indexed", "processing", "queued", "failed"];

export const knowledgeDocs: KnowledgeDocument[] = Array.from({ length: 100 }, (_, i) => {
  const base = KNOWLEDGE_DOCS[i % KNOWLEDGE_DOCS.length];
  return {
    id: id("doc", i),
    orgId: currentOrg.id,
    name: i < KNOWLEDGE_DOCS.length ? base.name : `${base.name.split(".")[0]} v${int(2, 6)}.${base.name.split(".")[1] ?? "pdf"}`,
    type: base.type as DocType,
    category: base.category,
    sizeKb: int(40, 8400),
    status: i < 5 ? pick(["processing", "queued"]) as KnowledgeDocument["status"] : pick(DOC_STATUS),
    confidence: float(0.55, 0.99),
    chunks: int(4, 320),
    version: int(1, 5),
    uploadedBy: pick(employees).name,
    uploadedAt: ago(int(60, 60 * 24 * 120)),
    usageCount: int(0, 1800),
    tags: [base.category],
  };
});

/* --------------------------- Conversations ---------------------------- */

export const conversations: Conversation[] = Array.from({ length: 40 }, (_, i) => {
  const cust = customers[(i * 11) % customers.length];
  return {
    id: id("conv", i),
    orgId: currentOrg.id,
    customerId: cust.id,
    customerName: cust.name,
    channel: pick(CHANNELS.filter((c) => c !== "phone")),
    lastMessage: pick([
      "Is my order on the way?",
      "Can I change my booking to 8pm?",
      "Do you have gluten-free options?",
      "Thanks, that's perfect!",
      "What time do you close today?",
      "I'd like to cancel my reservation.",
    ]),
    lastMessageAt: ago(int(1, 60 * 24 * 3)),
    unread: i < 12 ? int(1, 4) : 0,
    status: pick(["open", "open", "pending", "resolved", "escalated"]) as Conversation["status"],
    assignedTo: chance(0.4) ? pick(employees).name : undefined,
    sentiment: pick(SENTIMENTS),
    aiHandled: chance(0.8),
  };
});

export function messagesFor(conversationId: string): Message[] {
  const seed = seededRandom(conversationId);
  const count = 4 + Math.floor(seed() * 6);
  const msgs: Message[] = [];
  for (let i = 0; i < count; i++) {
    const isCust = i % 2 === 0;
    msgs.push({
      id: `${conversationId}_m${i}`,
      conversationId,
      sender: isCust ? "customer" : "ai",
      text: isCust
        ? pick(["Hi, is my order ready?", "Can I add a drink?", "What are your hours?", "Thanks!"])
        : pick(["Let me check that for you.", "Yes, absolutely!", "Your order is being prepared.", "Anything else I can help with?"]),
      timestamp: ago(count - i + 2),
      status: "read",
    });
  }
  return msgs;
}

/* --------------------------- Notifications ---------------------------- */

const NOTIF_TYPES: AppNotification["type"][] = ["call", "order", "booking", "system", "billing", "escalation"];

export const notifications: AppNotification[] = Array.from({ length: 24 }, (_, i) => {
  const type = pick(NOTIF_TYPES);
  const map: Record<AppNotification["type"], { title: string; body: string }> = {
    call: { title: "Escalated call", body: "A customer requested a human agent for a refund." },
    order: { title: "New order via AI", body: "Order BC-48213 placed on WhatsApp - $42.50." },
    booking: { title: "Booking confirmed", body: "Table for 4 reserved Saturday 7:00 PM." },
    system: { title: "Knowledge indexed", body: "Full Menu 2026.pdf finished processing (98% confidence)." },
    billing: { title: "Invoice paid", body: "Your July invoice of $1,240 was paid." },
    escalation: { title: "AI confidence low", body: "3 calls fell below 60% confidence this hour." },
  };
  return {
    id: id("ntf", i),
    orgId: currentOrg.id,
    type,
    title: map[type].title,
    body: map[type].body,
    createdAt: ago(int(1, 60 * 24 * 4)),
    read: i > 6,
    priority: pick(["low", "normal", "normal", "high"]) as AppNotification["priority"],
    actionUrl: "/calls",
  };
});

/* ------------------------------ Billing ------------------------------- */

export const invoices: Invoice[] = Array.from({ length: 12 }, (_, i) => ({
  id: id("inv", i),
  orgId: currentOrg.id,
  number: `INV-2026-${(1200 + i).toString()}`,
  amount: int(890, 3200),
  status: i === 0 ? "due" : i === 1 ? "overdue" : "paid",
  issuedAt: ago((i + 1) * 30 * 60 * 24),
  dueAt: ago(i * 30 * 60 * 24 - 60 * 24 * 14),
  period: `2026-${(7 - (i % 7)).toString().padStart(2, "0")}`,
}));

/* -------------------------------- API --------------------------------- */

export const apiKeys: ApiKey[] = [
  {
    id: "key_0001",
    name: "Production Server",
    prefix: "nvk_live_8f2a",
    scopes: ["calls:read", "orders:write", "bookings:write"],
    createdAt: ago(60 * 24 * 90),
    lastUsed: ago(12),
    status: "active",
  },
  {
    id: "key_0002",
    name: "Zapier Integration",
    prefix: "nvk_live_3c91",
    scopes: ["orders:read", "customers:read"],
    createdAt: ago(60 * 24 * 40),
    lastUsed: ago(240),
    status: "active",
  },
  {
    id: "key_0003",
    name: "Staging Sandbox",
    prefix: "nvk_test_a107",
    scopes: ["*"],
    createdAt: ago(60 * 24 * 12),
    status: "revoked",
  },
];

export const webhooks: Webhook[] = [
  {
    id: "wh_0001",
    url: "https://api.bellacucina.com/hooks/netics",
    events: ["call.completed", "order.created", "booking.confirmed"],
    status: "active",
    secret: "whsec_••••8842",
    createdAt: ago(60 * 24 * 60),
  },
  {
    id: "wh_0002",
    url: "https://ops.bellacucina.com/escalations",
    events: ["call.escalated"],
    status: "active",
    secret: "whsec_••••1190",
    createdAt: ago(60 * 24 * 20),
  },
];

export const auditLogs: AuditLogEntry[] = Array.from({ length: 40 }, (_, i) => ({
  id: id("aud", i),
  actor: pick(employees).name,
  action: pick([
    "Updated AI greeting",
    "Revoked API key",
    "Changed billing plan",
    "Added knowledge document",
    "Escalation rule modified",
    "User invited",
    "Password reset",
    "Exported analytics",
  ]),
  target: pick(["ai-agent", "api-keys", "billing", "knowledge", "settings", "users"]),
  ip: `${int(10, 220)}.${int(0, 255)}.${int(0, 255)}.${int(1, 254)}`,
  timestamp: ago(int(5, 60 * 24 * 30)),
  status: chance(0.95) ? "success" : "failure",
}));

/* ------------------------------ Intents ------------------------------- */

export const intents: Intent[] = INTENTS.slice(0, 12).map((name, i) => ({
  id: id("int", i),
  name,
  description: `Detects when a customer wants to ${name.toLowerCase()}.`,
  sampleUtterances: [
    `I want to ${name.toLowerCase()}`,
    `Can you help me ${name.toLowerCase()}?`,
    `${name} please`,
  ],
  count: int(120, 4800),
  successRate: float(0.72, 0.98),
  category: pick(["Sales", "Support", "Booking", "Order"]),
}));

/* --------------------------- Integrations ----------------------------- */

export const integrations: Integration[] = [
  { id: "int_stripe", name: "Stripe", category: "Payments", description: "Accept card payments and subscriptions.", logo: "CreditCard", connected: true, status: "healthy", lastSync: ago(8) },
  { id: "int_paystack", name: "Paystack", category: "Payments", description: "Payments across Africa.", logo: "Wallet", connected: false },
  { id: "int_flutterwave", name: "Flutterwave", category: "Payments", description: "Global payment infrastructure.", logo: "Wallet", connected: false },
  { id: "int_gcal", name: "Google Calendar", category: "Calendar", description: "Two-way booking sync.", logo: "Calendar", connected: true, status: "syncing", lastSync: ago(2) },
  { id: "int_ms365", name: "Microsoft 365", category: "Calendar", description: "Outlook calendar & email.", logo: "Mail", connected: false },
  { id: "int_salesforce", name: "Salesforce", category: "CRM", description: "Sync customers and leads.", logo: "Cloud", connected: false },
  { id: "int_hubspot", name: "HubSpot", category: "CRM", description: "Marketing & sales CRM.", logo: "Users", connected: true, status: "healthy", lastSync: ago(30) },
  { id: "int_zapier", name: "Zapier", category: "Automation", description: "Connect 6,000+ apps.", logo: "Zap", connected: true, status: "healthy", lastSync: ago(60) },
  { id: "int_twilio", name: "Twilio", category: "Telephony", description: "Phone numbers & SMS.", logo: "Phone", connected: true, status: "healthy", lastSync: ago(1) },
  { id: "int_whatsapp", name: "Meta WhatsApp", category: "Messaging", description: "WhatsApp Business API.", logo: "MessageCircle", connected: true, status: "healthy", lastSync: ago(5) },
  { id: "int_shopify", name: "Shopify", category: "Commerce", description: "Sync products & orders.", logo: "ShoppingBag", connected: false },
  { id: "int_woo", name: "WooCommerce", category: "Commerce", description: "WordPress storefront.", logo: "ShoppingCart", connected: false },
  { id: "int_pos", name: "Square POS", category: "Point of Sale", description: "In-store order sync.", logo: "Monitor", connected: false },
];

/* ------------------------------ AI Agents ----------------------------- */

export const aiAgents: AIAgent[] = [
  {
    id: "agent_0001",
    orgId: currentOrg.id,
    name: "Aria - Front of House",
    voice: "Aria",
    language: "English",
    personality: currentOrg.aiPersonality,
    status: "active",
    speechRate: 1.0,
    temperature: 0.6,
    interruptions: true,
    responseDelayMs: 220,
    emotionLevel: 0.7,
    callsHandled: 18420,
    resolutionRate: 0.89,
    greeting: currentOrg.greeting,
    escalationRules: [
      { id: "er1", trigger: "Refund > $50", condition: "amount > 50", action: "transfer", target: "Manager", enabled: true },
      { id: "er2", trigger: "Negative sentiment", condition: "sentiment = frustrated", action: "notify", target: "Supervisor", enabled: true },
      { id: "er3", trigger: "Low confidence", condition: "confidence < 0.6", action: "transfer", target: "Human agent", enabled: true },
    ],
  },
  {
    id: "agent_0002",
    orgId: currentOrg.id,
    name: "Atlas - Reservations",
    voice: "Atlas",
    language: "English",
    personality: "Efficient and precise for booking flows.",
    status: "active",
    speechRate: 1.05,
    temperature: 0.4,
    interruptions: true,
    responseDelayMs: 180,
    emotionLevel: 0.5,
    callsHandled: 9310,
    resolutionRate: 0.92,
    greeting: "Thanks for calling - I can check availability and book that for you right now.",
    escalationRules: [
      { id: "er4", trigger: "Group > 12", condition: "party_size > 12", action: "callback", target: "Events team", enabled: true },
    ],
  },
];

/* ------------------------- Analytics timeseries ----------------------- */

/** 30-day timeseries for the analytics + dashboard charts. */
export const timeseries30d: TimeseriesPoint[] = Array.from({ length: 30 }, (_, i) => {
  const day = new Date(NOW.getTime() - (29 - i) * 86_400_000);
  const weekend = [0, 6].includes(day.getUTCDay());
  const base = weekend ? 1.35 : 1;
  return {
    date: day.toISOString().slice(0, 10),
    calls: Math.round((60 + Math.sin(i / 3) * 18 + int(0, 30)) * base),
    orders: Math.round((28 + Math.cos(i / 4) * 10 + int(0, 14)) * base),
    bookings: Math.round((18 + Math.sin(i / 5) * 6 + int(0, 8)) * base),
    revenue: Math.round((4200 + Math.sin(i / 3) * 900 + int(0, 1400)) * base),
    resolution: parseFloat((0.82 + Math.sin(i / 6) * 0.06 + rand() * 0.04).toFixed(3)),
    csat: parseFloat((4.3 + Math.sin(i / 7) * 0.25 + rand() * 0.15).toFixed(2)),
    aiConfidence: parseFloat((0.86 + Math.sin(i / 5) * 0.05 + rand() * 0.03).toFixed(3)),
  };
});

/** 24-hour call volume distribution for peak-time heat. */
export const hourlyCallVolume = Array.from({ length: 24 }, (_, h) => {
  const peak = h >= 11 && h <= 14 ? 1.8 : h >= 18 && h <= 21 ? 2.1 : h < 7 ? 0.15 : 1;
  return { hour: h, calls: Math.round((10 + rand() * 20) * peak) };
});

/** Channel distribution for the omnichannel donut. */
export const channelDistribution = [
  { channel: "Phone", value: 48, color: "#3A86FF" },
  { channel: "WhatsApp", value: 22, color: "#00C896" },
  { channel: "Web Chat", value: 14, color: "#C9A227" },
  { channel: "Instagram", value: 8, color: "#FF4D4F" },
  { channel: "SMS", value: 5, color: "#6BA5FF" },
  { channel: "Messenger", value: 3, color: "#E0C158" },
];

export const topIntents = intents
  .slice()
  .sort((a, b) => b.count - a.count)
  .slice(0, 6)
  .map((i) => ({ intent: i.name, count: i.count, success: i.successRate }));

export const topProducts = products
  .slice()
  .sort((a, b) => b.unitsSold - a.unitsSold)
  .slice(0, 6);
