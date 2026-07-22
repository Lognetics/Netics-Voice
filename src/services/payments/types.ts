/** PaymentProvider - abstracts Stripe / Paystack / Flutterwave. */
export interface PaymentProvider {
  charge(amount: number, currency: string, source: string): Promise<PaymentResult>;
  createSubscription(planId: string, customerId: string): Promise<{ subscriptionId: string }>;
  refund(paymentId: string, amount?: number): Promise<PaymentResult>;
  createInvoice(customerId: string, amount: number): Promise<{ invoiceId: string; url: string }>;
}

export interface PaymentResult {
  id: string;
  status: "succeeded" | "pending" | "failed";
  amount: number;
  currency: string;
}
