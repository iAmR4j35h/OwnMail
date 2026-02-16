export type { IStorageAdapter } from "./interface.js";
export { SqliteAdapter } from "./sqlite.js";
export { PostgresAdapter } from "./postgres.js";

import { SqliteAdapter } from "./sqlite.js";
import { PostgresAdapter } from "./postgres.js";
import type { IStorageAdapter } from "./interface.js";

/**
 * Factory function to create the appropriate storage adapter
 * based on the STORAGE_ADAPTER environment variable.
 */
export function createStorage(
  type: string = "sqlite",
  options?: { sqlitePath?: string; databaseUrl?: string }
): IStorageAdapter {
  switch (type) {
    case "sqlite":
      return new SqliteAdapter(options?.sqlitePath);
    case "postgres":
      return new PostgresAdapter(options?.databaseUrl);
    default:
      return new SqliteAdapter(options?.sqlitePath);
  }
}
