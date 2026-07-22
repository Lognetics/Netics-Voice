/** TelephonyProvider - abstracts Twilio / Vonage / SIP trunk. */
export interface TelephonyProvider {
  /** Place an outbound call (reminders, follow-ups). */
  dial(to: string, from: string): Promise<{ callSid: string }>;
  /** Transfer a live call to a human agent or queue. */
  transfer(callSid: string, target: string): Promise<void>;
  /** End an active call. */
  hangup(callSid: string): Promise<void>;
  /** Mute/unmute the AI leg. */
  setMuted(callSid: string, muted: boolean): Promise<void>;
  /** Provision a new phone number for an org/branch. */
  provisionNumber(areaCode: string): Promise<{ number: string }>;
}
