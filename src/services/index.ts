/**
 * Provider Registry
 * -------------------------------------------------------------
 * Resolves the active implementation of each service interface.
 * The prototype always returns the `mock` provider. In production,
 * switch on env config (e.g. AI_PROVIDER=openai) and return the
 * matching adapter - application code never imports a concrete
 * provider directly, only these accessors.
 */

import { MockAIProvider } from "./ai/mock";
import type { AIProvider } from "./ai/types";
import type { TelephonyProvider } from "./telephony/types";
import type { MessagingProvider } from "./messaging/types";
import type { PaymentProvider } from "./payments/types";

let _ai: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!_ai) _ai = new MockAIProvider();
  return _ai;
}

// Telephony / Messaging / Payments ship as mock stubs in the prototype.
// Concrete adapters implement the interfaces in ./telephony, ./messaging, ./payments.
export const config = {
  aiProvider: process.env.NEXT_PUBLIC_AI_PROVIDER ?? "mock",
  telephonyProvider: process.env.NEXT_PUBLIC_TELEPHONY_PROVIDER ?? "mock",
  paymentProvider: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? "mock",
};

export type { AIProvider, TelephonyProvider, MessagingProvider, PaymentProvider };
export * from "./ai/types";
