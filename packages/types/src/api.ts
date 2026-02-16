import { z } from "zod";

// ── Generic API Response Wrappers ──────────────────────────────────

export const ApiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = z.infer<typeof ApiErrorSchema>;

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ── Pagination ─────────────────────────────────────────────────────

export const ListOptionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  direction: z.enum(["inbound", "outbound", "all"]).default("all"),
  search: z.string().optional(),
});

export type ListOptions = z.infer<typeof ListOptionsSchema>;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Health Check ───────────────────────────────────────────────────

export interface HealthResponse {
  status: "ok" | "degraded" | "error";
  version: string;
  uptime: number;
  storage: string;
}

// ── Storage Stats ──────────────────────────────────────────────────

export interface StorageStats {
  totalEmails: number;
  inboundCount: number;
  outboundCount: number;
}
