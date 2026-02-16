import { Resend } from "resend";
import type {
  SendEmailRequest,
  DomainStatus,
  FetchedInboundEmail,
  EmailAttachment,
} from "@resend-gateway/types";

interface ResendAttachmentDownload {
  id: string;
  filename: string;
  content_type: string;
  content_disposition?: string | null;
  content_id?: string | null;
  download_url: string;
  expires_at: string;
}

export class ResendService {
  private client: Resend;
  private domain: string;
  private apiKey: string;

  constructor(apiKey: string, domain: string) {
    this.client = new Resend(apiKey);
    this.domain = domain;
    this.apiKey = apiKey;
  }

  async sendEmail(
    request: SendEmailRequest,
  ): Promise<{ id: string }> {
    const toArray = Array.isArray(request.to) ? request.to : [request.to];

    const sendPayload: Record<string, unknown> = {
      from: request.from,
      to: toArray,
      subject: request.subject,
      html: request.html ?? undefined,
      text: request.text ?? "",
      replyTo: request.replyTo ?? undefined,
    };

    // Add attachments if present (base64 content -> Buffer)
    if (request.attachments?.length) {
      sendPayload.attachments = request.attachments.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content, "base64"),
        content_type: a.contentType,
      }));
    }

    const { data, error } = await this.client.emails.send(
      sendPayload as unknown as Parameters<typeof this.client.emails.send>[0],
    );

    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }

    return { id: data!.id };
  }

  /**
   * Fetch the full inbound email content (body + headers + attachment metadata)
   * from Resend's Receiving API. Webhooks only send metadata, not the body.
   */
  async fetchInboundEmail(emailId: string): Promise<FetchedInboundEmail> {
    const res = await fetch(
      `https://api.resend.com/emails/receiving/${emailId}`,
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      },
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch inbound email ${emailId}: ${res.status} ${res.statusText}`,
      );
    }

    return res.json() as Promise<FetchedInboundEmail>;
  }

  /**
   * Fetch attachment download URLs for an inbound email.
   * Each download_url is valid for 1 hour.
   */
  async fetchAttachmentDownloads(
    emailId: string,
  ): Promise<ResendAttachmentDownload[]> {
    const res = await fetch(
      `https://api.resend.com/emails/receiving/${emailId}/attachments`,
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      },
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch attachments for ${emailId}: ${res.status} ${res.statusText}`,
      );
    }

    const data = await res.json();
    return (data as { data: ResendAttachmentDownload[] }).data ?? data;
  }

  /**
   * Download a single attachment's content by fetching a fresh download URL,
   * then streaming the file. Returns the raw Response for piping.
   */
  async downloadAttachment(
    emailId: string,
    attachmentId: string,
  ): Promise<{ stream: ReadableStream; contentType: string; filename: string }> {
    const attachments = await this.fetchAttachmentDownloads(emailId);
    const attachment = attachments.find((a) => a.id === attachmentId);

    if (!attachment) {
      throw new Error(`Attachment ${attachmentId} not found on email ${emailId}`);
    }

    const res = await fetch(attachment.download_url);
    if (!res.ok || !res.body) {
      throw new Error(`Failed to download attachment: ${res.status}`);
    }

    return {
      stream: res.body,
      contentType: attachment.content_type,
      filename: attachment.filename,
    };
  }

  async getDomainStatus(): Promise<DomainStatus | null> {
    try {
      const { data } = await this.client.domains.list();
      const domainList = data?.data;
      if (!domainList) return null;

      const domain = domainList.find((d) => d.name === this.domain);
      if (!domain) return null;

      const { data: details } = await this.client.domains.get(domain.id);
      if (!details) return null;

      const records = (details.records ?? []).map((r: unknown) => {
        const rec = r as Record<string, unknown>;
        return {
          type: String(rec.record ?? rec.type ?? ""),
          name: String(rec.name ?? ""),
          value: String(rec.value ?? ""),
          status: String(rec.status ?? "pending") as
            | "verified"
            | "pending"
            | "failed",
          priority:
            typeof rec.priority === "number" ? rec.priority : undefined,
        };
      });

      return {
        id: details.id,
        name: details.name,
        status: details.status as DomainStatus["status"],
        records,
        createdAt: details.created_at,
      };
    } catch {
      return null;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.client.domains.list();
      return true;
    } catch {
      return false;
    }
  }
}
