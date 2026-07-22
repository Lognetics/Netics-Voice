/**
 * NETICS Voice - Domain Types
 * -------------------------------------------------------------
 * A single source of truth for every entity in the platform.
 * These map 1:1 to the planned PostgreSQL schema (see docs/ARCHITECTURE.md)
 * and are consumed by the mock-data layer + all feature modules.
 */

/* ----------------------------- Primitives ----------------------------- */

export type ID = string;
export type ISODate = string;

export type Sentiment = "positive" | "neutral" | "negative" | "frustrated";

export type Channel =
  | "phone"
  | "whatsapp"
  | "instagram"
  | "messenger"
  | "telegram"
  | "webchat"
  | "sms"
  | "email";

export type Industry =
  | "restaurant"
  | "hotel"
  | "hospital"
  | "clinic"
  | "school"
  | "bank"
  | "insurance"
  | "real_estate"
  | "government"
  | "retail"
  | "ecommerce"
  | "travel"
  | "logistics"
  | "law_firm"
  | "salon"
  | "gym"
  | "automotive";

/* --------------------------- Organizations ---------------------------- */

export interface Organization {
  id: ID;
  name: string;
  slug: string;
  industry: Industry;
  logoUrl?: string;
  brandColor: string;
  website?: string;
  timezone: string;
  languages: string[];
  plan: "starter" | "growth" | "enterprise";
  createdAt: ISODate;
  phoneNumbers: string[];
  aiPersonality: string;
  greeting: string;
  status: "active" | "trial" | "suspended";
}

export interface Branch {
  id: ID;
  orgId: ID;
  name: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  timezone: string;
  status: "open" | "closed" | "busy";
  managerName: string;
  staffCount: number;
  monthlyRevenue: number;
  callsToday: number;
  rating: number; // 0..5
  aiPersonality: string;
  lat: number;
  lng: number;
}

export interface BusinessHours {
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  open: string;
  close: string;
  closed: boolean;
}

/* ------------------------------- Users -------------------------------- */

export type UserRole =
  | "owner"
  | "admin"
  | "manager"
  | "agent"
  | "analyst"
  | "viewer";

export interface User {
  id: ID;
  orgId: ID;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  department?: string;
  branchId?: ID;
  status: "online" | "away" | "offline" | "on_call";
  lastActive: ISODate;
  phone?: string;
  permissions: string[];
  callsHandled: number;
  csat: number; // 0..5
  createdAt: ISODate;
}

export interface Permission {
  key: string;
  label: string;
  description: string;
  category: string;
}

/* ----------------------------- Customers ------------------------------ */

export interface Customer {
  id: ID;
  orgId: ID;
  name: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
  city?: string;
  country: string;
  preferredLanguage: string;
  tags: string[];
  loyaltyPoints: number;
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum";
  lifetimeValue: number;
  totalOrders: number;
  totalBookings: number;
  lastContact: ISODate;
  createdAt: ISODate;
  riskLevel: "low" | "medium" | "high";
  leadScore: number; // 0..100
  sentiment: Sentiment;
  favoriteProducts: string[];
  notes?: string;
  isVip: boolean;
  aiInsight: string;
}

/* ------------------------------- Calls -------------------------------- */

export type CallStatus =
  | "live"
  | "completed"
  | "missed"
  | "escalated"
  | "voicemail";

export type CallDirection = "inbound" | "outbound";

export interface TranscriptTurn {
  id: ID;
  speaker: "ai" | "customer" | "agent";
  text: string;
  timestamp: number; // seconds from call start
  sentiment?: Sentiment;
  confidence?: number;
}

export interface Entity {
  type: string; // e.g. "date", "party_size", "product"
  value: string;
  confidence: number;
}

export interface Call {
  id: ID;
  orgId: ID;
  branchId: ID;
  customerId: ID;
  customerName: string;
  customerPhone: string;
  channel: Channel;
  direction: CallDirection;
  status: CallStatus;
  intent: string;
  language: string;
  startedAt: ISODate;
  durationSec: number;
  sentiment: Sentiment;
  confidence: number;
  aiHandled: boolean;
  resolved: boolean;
  escalatedTo?: string;
  summary: string;
  transcript: TranscriptTurn[];
  entities: Entity[];
  actionItems: string[];
  recordingUrl?: string;
  tags: string[];
  revenue?: number;
  agentId?: ID;
}

/* --------------------------- Conversations ---------------------------- */

export interface Conversation {
  id: ID;
  orgId: ID;
  customerId: ID;
  customerName: string;
  channel: Channel;
  lastMessage: string;
  lastMessageAt: ISODate;
  unread: number;
  status: "open" | "pending" | "resolved" | "escalated";
  assignedTo?: string;
  sentiment: Sentiment;
  aiHandled: boolean;
}

export interface Message {
  id: ID;
  conversationId: ID;
  sender: "ai" | "customer" | "agent";
  text: string;
  timestamp: ISODate;
  status?: "sent" | "delivered" | "read";
}

/* ------------------------------ Orders -------------------------------- */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface OrderItem {
  id: ID;
  productId: ID;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: ID;
  orgId: ID;
  branchId: ID;
  customerId: ID;
  customerName: string;
  reference: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  type: "delivery" | "pickup" | "dine_in";
  channel: Channel;
  createdAt: ISODate;
  eta?: string;
  address?: string;
  aiCreated: boolean;
  notes?: string;
}

export interface Product {
  id: ID;
  orgId: ID;
  name: string;
  category: string;
  price: number;
  cost?: number;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
  stockLevel: number;
  unitsSold: number;
  rating: number;
  tags: string[];
}

/* ----------------------------- Bookings ------------------------------- */

export type BookingStatus =
  | "confirmed"
  | "pending"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show"
  | "waitlist";

export interface Booking {
  id: ID;
  orgId: ID;
  branchId: ID;
  customerId: ID;
  customerName: string;
  reference: string;
  resource: string; // room, table, doctor, stylist...
  resourceType: string;
  service: string;
  status: BookingStatus;
  start: ISODate;
  end: ISODate;
  partySize?: number;
  price: number;
  paymentStatus: PaymentStatus;
  channel: Channel;
  aiCreated: boolean;
  notes?: string;
  recurring: boolean;
}

export interface Resource {
  id: ID;
  orgId: ID;
  name: string;
  type: string;
  capacity: number;
  status: "available" | "occupied" | "maintenance";
  price: number;
}

/* --------------------------- Knowledge Base --------------------------- */

export type DocType =
  | "pdf"
  | "word"
  | "excel"
  | "powerpoint"
  | "csv"
  | "image"
  | "menu"
  | "policy"
  | "faq"
  | "catalog"
  | "pricelist"
  | "contract"
  | "url"
  | "text";

export interface KnowledgeDocument {
  id: ID;
  orgId: ID;
  name: string;
  type: DocType;
  category: string;
  sizeKb: number;
  status: "indexed" | "processing" | "failed" | "queued";
  confidence: number; // AI comprehension confidence
  chunks: number;
  version: number;
  uploadedBy: string;
  uploadedAt: ISODate;
  usageCount: number;
  tags: string[];
}

/* ----------------------------- AI Agents ------------------------------ */

export interface AIAgent {
  id: ID;
  orgId: ID;
  branchId?: ID;
  name: string;
  voice: string;
  language: string;
  personality: string;
  status: "active" | "paused" | "draft";
  speechRate: number; // 0.5..2
  temperature: number;
  interruptions: boolean;
  responseDelayMs: number;
  emotionLevel: number; // 0..1
  callsHandled: number;
  resolutionRate: number;
  greeting: string;
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  id: ID;
  trigger: string;
  condition: string;
  action: "transfer" | "notify" | "callback" | "voicemail";
  target: string;
  enabled: boolean;
}

export interface Intent {
  id: ID;
  name: string;
  description: string;
  sampleUtterances: string[];
  count: number;
  successRate: number;
  category: string;
}

/* ----------------------------- Analytics ------------------------------ */

export interface TimeseriesPoint {
  date: string;
  [metric: string]: number | string;
}

export interface KPI {
  key: string;
  label: string;
  value: number;
  delta: number;
  trend: number[];
  prefix?: string;
  suffix?: string;
  accent?: "brand" | "gold" | "success" | "danger";
  compact?: boolean;
  decimals?: number;
}

/* --------------------------- Notifications ---------------------------- */

export interface AppNotification {
  id: ID;
  orgId: ID;
  type: "call" | "order" | "booking" | "system" | "billing" | "escalation";
  title: string;
  body: string;
  createdAt: ISODate;
  read: boolean;
  priority: "low" | "normal" | "high";
  actionUrl?: string;
}

/* ---------------------------- Integrations ---------------------------- */

export interface Integration {
  id: ID;
  name: string;
  category: string;
  description: string;
  logo: string; // lucide icon name or short code
  connected: boolean;
  status?: "healthy" | "error" | "syncing";
  lastSync?: ISODate;
}

/* ------------------------------ Billing ------------------------------- */

export interface Invoice {
  id: ID;
  orgId: ID;
  number: string;
  amount: number;
  status: "paid" | "due" | "overdue";
  issuedAt: ISODate;
  dueAt: ISODate;
  period: string;
}

export interface UsageMetric {
  label: string;
  used: number;
  limit: number;
  unit: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: "mo" | "yr";
  description: string;
  features: string[];
  highlighted?: boolean;
  minutes: number;
  seats: number;
}

/* ------------------------------- API ---------------------------------- */

export interface ApiKey {
  id: ID;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: ISODate;
  lastUsed?: ISODate;
  status: "active" | "revoked";
}

export interface Webhook {
  id: ID;
  url: string;
  events: string[];
  status: "active" | "disabled";
  secret: string;
  createdAt: ISODate;
}

export interface AuditLogEntry {
  id: ID;
  actor: string;
  action: string;
  target: string;
  ip: string;
  timestamp: ISODate;
  status: "success" | "failure";
}

/* ------------------------------ Employees ----------------------------- */

export interface Department {
  id: ID;
  name: string;
  headcount: number;
  lead: string;
  color: string;
}

/* ---------------------------- Templates ------------------------------- */

export interface IndustryTemplate {
  industry: Industry;
  label: string;
  icon: string;
  tagline: string;
  color: string;
  knowledgeCategories: string[];
  sampleIntents: string[];
  bookingFields: string[];
  orderFlow: string[];
  greeting: string;
  sampleConversation: { role: "customer" | "ai"; text: string }[];
}
