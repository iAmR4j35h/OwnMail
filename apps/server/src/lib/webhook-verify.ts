import { Webhook } from "svix";

export interface WebhookHeaders {
  "svix-id"?: string;
  "svix-timestamp"?: string;
  "svix-signature"?: string;
  "webhook-id"?: string;
  "webhook-timestamp"?: string;
  "webhook-signature"?: string;
  [key: string]: string | string[] | undefined;
}

/**
 * Verify a Resend webhook signature using Svix.
 * Returns the parsed payload if valid, throws if invalid.
 */
export function verifyWebhookSignature<T = unknown>(
  secret: string,
  rawBody: string,
  headers: WebhookHeaders,
): T {
  const wh = new Webhook(secret);
  return wh.verify(rawBody, headers as Record<string, string>) as T;
}
