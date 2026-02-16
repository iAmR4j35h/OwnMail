import { v4 as uuidv4 } from "uuid";
import type { IStorageAdapter } from "@resend-gateway/storage";
import type {
  SendEmailRequest,
  StoredEmail,
  InboundWebhookData,
  EmailSummary,
  EmailAttachment,
  ListOptions,
  PaginatedResult,
  StorageStats,
} from "@resend-gateway/types";
import { ResendService } from "./resend.service.js";

export class MailService {
  constructor(
    private storage: IStorageAdapter,
    private resend: ResendService,
  ) {}

  async send(
    request: SendEmailRequest,
  ): Promise<{ id: string; resendId: string }> {
    const { id: resendId } = await this.resend.sendEmail(request);

    // Build attachment metadata for storage (without the content)
    const attachments: EmailAttachment[] | undefined =
      request.attachments?.map((a, i) => ({
        id: `out-${uuidv4()}-${i}`,
        filename: a.filename,
        contentType: a.contentType ?? "application/octet-stream",
        size: Math.ceil((a.content.length * 3) / 4), // approx base64 -> bytes
      }));

    const email: StoredEmail = {
      id: uuidv4(),
      direction: "outbound",
      from: request.from,
      to: request.to,
      subject: request.subject,
      html: request.html,
      text: request.text,
      replyTo: request.replyTo,
      resendId,
      attachments: attachments?.length ? attachments : undefined,
      createdAt: new Date().toISOString(),
    };

    const id = await this.storage.saveEmail(email);
    return { id, resendId };
  }

  /**
   * Process an inbound webhook event:
   * 1. Extract the email_id from the webhook payload
   * 2. Fetch the full email body from Resend's Receiving API
   * 3. Store the complete email locally
   */
  async receiveInbound(webhookData: InboundWebhookData): Promise<string> {
    // Fetch full email content from Resend (body is NOT in the webhook)
    const fullEmail = await this.resend.fetchInboundEmail(
      webhookData.email_id,
    );

    // Map attachment metadata
    const attachments: EmailAttachment[] | undefined = fullEmail.attachments
      ?.map((a) => ({
        id: a.id,
        filename: a.filename,
        contentType: a.content_type,
        contentDisposition: a.content_disposition ?? undefined,
        contentId: a.content_id ?? undefined,
      }));

    // Normalize reply_to
    const replyTo = Array.isArray(fullEmail.reply_to)
      ? fullEmail.reply_to[0]
      : fullEmail.reply_to;

    const email: StoredEmail = {
      id: uuidv4(),
      direction: "inbound",
      from: fullEmail.from,
      to: fullEmail.to,
      subject: fullEmail.subject,
      html: fullEmail.html ?? undefined,
      text: fullEmail.text ?? undefined,
      replyTo: replyTo ?? undefined,
      resendId: webhookData.email_id,
      headers: fullEmail.headers,
      attachments: attachments?.length ? attachments : undefined,
      createdAt: fullEmail.created_at ?? new Date().toISOString(),
    };

    return this.storage.saveEmail(email);
  }

  async listEmails(
    opts: ListOptions,
  ): Promise<PaginatedResult<EmailSummary>> {
    return this.storage.listEmails(opts);
  }

  async getEmail(id: string): Promise<StoredEmail | null> {
    return this.storage.getEmailById(id);
  }

  async deleteEmail(id: string): Promise<boolean> {
    return this.storage.deleteEmail(id);
  }

  async getStats(): Promise<StorageStats> {
    return this.storage.getStats();
  }
}
