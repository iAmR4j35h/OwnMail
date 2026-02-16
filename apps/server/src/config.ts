import "dotenv/config";
import { AppConfigSchema, type AppConfig } from "@resend-gateway/types";

/**
 * Loads and validates app configuration from environment variables.
 * Throws a descriptive error if required values are missing.
 */
export function loadConfig(): AppConfig {
  const raw = {
    resendApiKey: process.env.RESEND_API_KEY,
    domain: process.env.DOMAIN,
    webhookSecret: process.env.WEBHOOK_SECRET,
    apiKey: process.env.API_KEY,
    storageAdapter: process.env.STORAGE_ADAPTER,
    sqlitePath: process.env.SQLITE_PATH,
    databaseUrl: process.env.DATABASE_URL,
    serverPort: process.env.SERVER_PORT,
    logLevel: process.env.LOG_LEVEL,
  };

  const result = AppConfigSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid configuration:\n${issues}\n\nCheck your .env file.`);
  }

  return result.data;
}
