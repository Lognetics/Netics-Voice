import type { Plan } from "@/types";

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 149,
    period: "mo",
    description: "For small teams getting started with AI voice.",
    features: [
      "2,000 AI minutes / mo",
      "3 team seats",
      "2 channels",
      "Email support",
      "Standard voices",
    ],
    minutes: 2000,
    seats: 3,
  },
  {
    id: "growth",
    name: "Growth",
    price: 449,
    period: "mo",
    description: "For growing operations that need scale and control.",
    features: [
      "12,000 AI minutes / mo",
      "15 team seats",
      "All channels",
      "Priority support",
      "Premium voices & analytics",
      "API & webhooks",
    ],
    highlighted: true,
    minutes: 12000,
    seats: 15,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 0,
    period: "mo",
    description: "Custom volume, SLAs, and dedicated support.",
    features: [
      "Unlimited AI minutes",
      "Unlimited seats",
      "SSO & audit logs",
      "Dedicated CSM",
      "Custom voices & models",
      "99.9% uptime SLA",
    ],
    minutes: Number.POSITIVE_INFINITY,
    seats: Number.POSITIVE_INFINITY,
  },
];

/** The plan the demo org is currently on. */
export const CURRENT_PLAN_ID = "growth";
