export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestLog {
  id: string;
  method: HttpMethod;
  endpoint: string;
  status: number;
  latency: number;
  timestamp: string;
}

export const methodTone: Record<
  HttpMethod,
  { badge: string; text: string }
> = {
  GET: { badge: "bg-brand/15 text-brand-soft", text: "text-brand-soft" },
  POST: { badge: "bg-success/15 text-success", text: "text-success" },
  PUT: { badge: "bg-amber-500/15 text-amber-400", text: "text-amber-400" },
  DELETE: { badge: "bg-danger/15 text-danger-soft", text: "text-danger-soft" },
};

const ENDPOINTS: { method: HttpMethod; path: string }[] = [
  { method: "GET", path: "/v1/calls" },
  { method: "POST", path: "/v1/calls" },
  { method: "GET", path: "/v1/orders" },
  { method: "POST", path: "/v1/orders" },
  { method: "GET", path: "/v1/bookings" },
  { method: "PUT", path: "/v1/bookings/bkg_0042" },
  { method: "GET", path: "/v1/customers" },
  { method: "POST", path: "/v1/webhooks" },
  { method: "DELETE", path: "/v1/keys/key_0003" },
  { method: "GET", path: "/v1/analytics/summary" },
];

const STATUSES = [200, 200, 200, 201, 204, 400, 401, 429, 500];

// Deterministic recent request logs (no client/server drift).
export const requestLogs: RequestLog[] = Array.from({ length: 14 }, (_, i) => {
  const ep = ENDPOINTS[i % ENDPOINTS.length];
  const status = STATUSES[(i * 3) % STATUSES.length];
  return {
    id: `req_${i}`,
    method: ep.method,
    endpoint: ep.path,
    status,
    latency: 40 + ((i * 37) % 380),
    timestamp: new Date(Date.now() - (i * 47 + 3) * 60_000).toISOString(),
  };
});

export interface DocEndpoint {
  method: HttpMethod;
  path: string;
  description: string;
}

export const docEndpoints: DocEndpoint[] = [
  { method: "GET", path: "/v1/calls", description: "List calls with filters & pagination." },
  { method: "POST", path: "/v1/calls", description: "Place an outbound AI call." },
  { method: "GET", path: "/v1/orders", description: "List orders across channels." },
  { method: "POST", path: "/v1/orders", description: "Create an order programmatically." },
  { method: "GET", path: "/v1/bookings", description: "List and search bookings." },
  { method: "POST", path: "/v1/webhooks", description: "Register a webhook endpoint." },
];

export const sampleCurl = `curl https://api.netics.ai/v1/calls \\
  -H "Authorization: Bearer nvk_live_8f2a..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+1 (212) 555-0148",
    "agent_id": "agent_0001",
    "language": "en"
  }'`;

export const sampleResponse = `{
  "id": "call_0421",
  "status": "queued",
  "direction": "outbound",
  "agent_id": "agent_0001",
  "created_at": "2026-07-21T14:32:08Z"
}`;
