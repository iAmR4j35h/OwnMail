import { z } from "zod";

// ── Attachments ─────────────────────────────────────────────────────

export const EmailAttachmentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  contentType: z.string(),
  size: z.number().optional(),
  contentDisposition: z.string().optional(),
  contentId: z.string().optional(),
});

export type EmailAttachment = z.infer<typeof EmailAttachmentSchema>;

/** Attachment payload for sending (base64-encoded content) */
export const SendAttachmentSchema = z.object({
  filename: z.string(),
  content: z.string(), // base64-encoded
  contentType: z.string().optional(),
});

export type SendAttachment = z.infer<typeof SendAttachmentSchema>;

// ── Send Email ──────────────────────────────────────────────────────

export const SendEmailSchema = z.object({
  from: z.string().email(),
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1).max(998),
  html: z.string().optional(),
  text: z.string().optional(),
  replyTo: z.string().email().optional(),
  attachments: z.array(SendAttachmentSchema).optional(),
});

export type SendEmailRequest = z.infer<typeof SendEmailSchema>;

// ── Stored Email ────────────────────────────────────────────────────

export const EmailDirectionSchema = z.enum(["inbound", "outbound"]);
export type EmailDirection = z.infer<typeof EmailDirectionSchema>;

export const StoredEmailSchema = z.object({
  id: z.string(),
  direction: EmailDirectionSchema,
  from: z.string(),
  to: z.union([z.string(), z.array(z.string())]),
  subject: z.string(),
  html: z.string().optional(),
  text: z.string().optional(),
  replyTo: z.string().optional(),
  resendId: z.string().optional(),
  headers: z.record(z.string()).optional(),
  attachments: z.array(EmailAttachmentSchema).optional(),
  createdAt: z.string().datetime(),
});

export type StoredEmail = z.infer<typeof StoredEmailSchema>;

// ── Email Summary (for list views) ─────────────────────────────────

export const EmailSummarySchema = z.object({
  id: z.string(),
  direction: EmailDirectionSchema,
  from: z.string(),
  to: z.union([z.string(), z.array(z.string())]),
  subject: z.string(),
  createdAt: z.string().datetime(),
  snippet: z.string().optional(),
  attachmentCount: z.number().optional(),
});

export type EmailSummary = z.infer<typeof EmailSummarySchema>;

// ── Inbound Webhook Payload (from Resend via Svix) ─────────────────
// NOTE: Resend webhooks do NOT contain html/text body.
// Only metadata + email_id. Body must be fetched via Receiving API.

export const InboundWebhookDataSchema = z.object({
  email_id: z.string(),
  from: z.string(),
  to: z.union([z.string(), z.array(z.string())]),
  subject: z.string(),
  created_at: z.string().optional(),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        filename: z.string(),
        content_type: z.string(),
        content_disposition: z.string().nullable().optional(),
        content_id: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

export type InboundWebhookData = z.infer<typeof InboundWebhookDataSchema>;

// ── Full inbound email (fetched from Resend Receiving API) ─────────

export const FetchedInboundEmailSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.union([z.string(), z.array(z.string())]),
  subject: z.string(),
  html: z.string().nullable().optional(),
  text: z.string().nullable().optional(),
  headers: z.record(z.string()).optional(),
  reply_to: z.union([z.string(), z.array(z.string())]).optional(),
  cc: z.union([z.string(), z.array(z.string())]).optional(),
  bcc: z.union([z.string(), z.array(z.string())]).optional(),
  created_at: z.string().optional(),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        filename: z.string(),
        content_type: z.string(),
        content_disposition: z.string().nullable().optional(),
        content_id: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

export type FetchedInboundEmail = z.infer<typeof FetchedInboundEmailSchema>;
