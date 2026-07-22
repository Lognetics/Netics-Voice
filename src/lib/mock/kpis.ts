import type { KPI } from "@/types";
import { timeseries30d } from "./db";

const last14 = (key: string) =>
  timeseries30d.slice(-14).map((p) => Number(p[key]));

/** Headline KPIs for the dashboard. Aggregate demo numbers reflect a busy day. */
export const dashboardKPIs: KPI[] = [
  {
    key: "calls_today",
    label: "Calls Today",
    value: 1284,
    delta: 0.124,
    trend: last14("calls"),
    accent: "brand",
  },
  {
    key: "revenue_today",
    label: "Revenue Today",
    value: 48250,
    delta: 0.086,
    trend: last14("revenue"),
    prefix: "$",
    compact: true,
    accent: "gold",
  },
  {
    key: "ai_resolution",
    label: "AI Resolution Rate",
    value: 89.4,
    delta: 0.031,
    trend: last14("resolution").map((v) => v * 100),
    suffix: "%",
    decimals: 1,
    accent: "success",
  },
  {
    key: "csat",
    label: "Customer Satisfaction",
    value: 4.6,
    delta: 0.02,
    trend: last14("csat"),
    decimals: 1,
    suffix: "/5",
    accent: "brand",
  },
  {
    key: "orders_today",
    label: "Orders Today",
    value: 742,
    delta: 0.153,
    trend: last14("orders"),
    accent: "success",
  },
  {
    key: "bookings_today",
    label: "Bookings Today",
    value: 318,
    delta: -0.022,
    trend: last14("bookings"),
    accent: "gold",
  },
  {
    key: "missed_calls",
    label: "Missed Calls",
    value: 6,
    delta: -0.41,
    trend: [14, 12, 11, 9, 10, 8, 7, 9, 6, 5, 7, 6, 5, 6],
    accent: "danger",
  },
  {
    key: "avg_response",
    label: "Avg Response Time",
    value: 1.2,
    delta: -0.18,
    trend: [2.1, 2.0, 1.9, 1.8, 1.7, 1.6, 1.5, 1.5, 1.4, 1.3, 1.3, 1.2, 1.2, 1.2],
    suffix: "s",
    decimals: 1,
    accent: "success",
  },
];

/** Secondary KPI strip. */
export const secondaryKPIs: KPI[] = [
  { key: "conversion", label: "Conversion Rate", value: 34.2, delta: 0.05, trend: last14("resolution").map((v) => v * 40), suffix: "%", decimals: 1, accent: "brand" },
  { key: "returning", label: "Returning Customers", value: 62.8, delta: 0.03, trend: last14("csat").map((v) => v * 14), suffix: "%", decimals: 1, accent: "gold" },
  { key: "ai_confidence", label: "AI Confidence", value: 91.7, delta: 0.014, trend: last14("aiConfidence").map((v) => v * 100), suffix: "%", decimals: 1, accent: "success" },
  { key: "live_calls", label: "Live Calls", value: 5, delta: 0, trend: [3, 4, 6, 5, 7, 4, 5, 6, 5, 4, 5, 6, 5, 5], accent: "brand" },
];
