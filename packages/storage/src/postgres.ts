import type {
  StoredEmail,
  EmailSummary,
  ListOptions,
  PaginatedResult,
  StorageStats,
} from "@resend-gateway/types";
import type { IStorageAdapter } from "./interface.js";

/**
 * PostgreSQL storage adapter — stub for Phase 2.
 * Will use the `pg` package once implemented.
 */
export class PostgresAdapter implements IStorageAdapter {
  constructor(_connectionString?: string) {
    // Will be implemented in Phase 2
  }

  async init(): Promise<void> {
    throw new Error(
      "PostgreSQL adapter is not yet implemented. Use STORAGE_ADAPTER=sqlite for now."
    );
  }

  async saveEmail(_email: StoredEmail): Promise<string> {
    throw new Error("Not implemented");
  }

  async listEmails(_opts: ListOptions): Promise<PaginatedResult<EmailSummary>> {
    throw new Error("Not implemented");
  }

  async getEmailById(_id: string): Promise<StoredEmail | null> {
    throw new Error("Not implemented");
  }

  async deleteEmail(_id: string): Promise<boolean> {
    throw new Error("Not implemented");
  }

  async getStats(): Promise<StorageStats> {
    throw new Error("Not implemented");
  }

  async close(): Promise<void> {
    // No-op for stub
  }
}
