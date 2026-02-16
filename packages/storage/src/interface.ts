import type {
  StoredEmail,
  EmailSummary,
  ListOptions,
  PaginatedResult,
  StorageStats,
} from "@resend-gateway/types";

/**
 * Storage adapter interface.
 * All persistence backends must implement this contract.
 */
export interface IStorageAdapter {
  /** Initialize the storage backend (create tables, run migrations, etc.) */
  init(): Promise<void>;

  /** Persist an email and return its ID */
  saveEmail(email: StoredEmail): Promise<string>;

  /** List emails with pagination and optional filtering */
  listEmails(opts: ListOptions): Promise<PaginatedResult<EmailSummary>>;

  /** Retrieve a single email by ID, or null if not found */
  getEmailById(id: string): Promise<StoredEmail | null>;

  /** Delete an email by ID. Returns true if the email existed. */
  deleteEmail(id: string): Promise<boolean>;

  /** Get aggregate storage statistics */
  getStats(): Promise<StorageStats>;

  /** Gracefully close the storage connection */
  close(): Promise<void>;
}
