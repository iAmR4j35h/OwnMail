import type {
  StoredEmail,
  EmailSummary,
  PaginatedResult,
  ConfigStatus,
  StorageStats,
  HealthResponse,
} from "@resend-gateway/types";

const API_URL = process.env.INTERNAL_API_URL || "http://localhost:8080";
const API_KEY = process.env.API_KEY || "";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...init?.headers,
    },
    cache: "no-store",
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error?.message || "API request failed");
  }

  return json.data as T;
}

export async function listEmails(params?: {
  page?: number;
  limit?: number;
  direction?: string;
  search?: string;
}): Promise<PaginatedResult<EmailSummary>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.direction) query.set("direction", params.direction);
  if (params?.search) query.set("search", params.search);

  const qs = query.toString();
  return apiFetch<PaginatedResult<EmailSummary>>(
    `/api/inbox${qs ? `?${qs}` : ""}`,
  );
}

export async function getEmail(id: string): Promise<StoredEmail> {
  return apiFetch<StoredEmail>(`/api/inbox/${id}`);
}

export async function deleteEmail(id: string): Promise<void> {
  await apiFetch(`/api/inbox/${id}`, { method: "DELETE" });
}

export async function getConfigStatus(): Promise<
  ConfigStatus & { stats: StorageStats }
> {
  return apiFetch<ConfigStatus & { stats: StorageStats }>("/api/config/status");
}

export async function sendEmail(body: {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  attachments?: { filename: string; content: string; contentType?: string }[];
}): Promise<{ id: string; resendId: string }> {
  return apiFetch<{ id: string; resendId: string }>("/api/send", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Build a URL for downloading an attachment (proxied through the dashboard) */
export function getAttachmentDownloadUrl(
  emailId: string,
  attachmentId: string,
): string {
  return `/api/attachments/${emailId}/${attachmentId}`;
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/api/health`, { cache: "no-store" });
  return res.json();
}
