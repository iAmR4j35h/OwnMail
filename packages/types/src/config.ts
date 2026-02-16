import { z } from "zod";

// ── App Configuration ──────────────────────────────────────────────

export const AppConfigSchema = z.object({
  resendApiKey: z.string().min(1),
  domain: z.string().min(1),
  webhookSecret: z.string().min(1),
  apiKey: z.string().min(1),
  storageAdapter: z.enum(["sqlite", "postgres"]).default("sqlite"),
  sqlitePath: z.string().default("./data/emails.db"),
  databaseUrl: z.string().optional(),
  serverPort: z.coerce.number().default(8080),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

// ── Domain Status ──────────────────────────────────────────────────

export interface DomainRecord {
  type: string;
  name: string;
  value: string;
  status: "verified" | "pending" | "failed";
  priority?: number;
}

export interface DomainStatus {
  id: string;
  name: string;
  status: "verified" | "pending" | "failed" | "not_started";
  records: DomainRecord[];
  createdAt: string;
}

export interface ConfigStatus {
  domain: DomainStatus | null;
  resendConnected: boolean;
  webhookConfigured: boolean;
  storageAdapter: string;
  version: string;
}
