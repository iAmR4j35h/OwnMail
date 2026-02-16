import Fastify from "fastify";
import cors from "@fastify/cors";
import { createStorage } from "@resend-gateway/storage";
import { loadConfig } from "./config.js";
import { ResendService } from "./services/resend.service.js";
import { MailService } from "./services/mail.service.js";
import authPlugin from "./plugins/auth.js";

import { sendRoutes } from "./routes/send.js";
import { inboxRoutes } from "./routes/inbox.js";
import { webhookRoutes } from "./routes/webhook.js";
import { healthRoutes } from "./routes/health.js";
import { configRoutes } from "./routes/config.js";

const VERSION = "0.1.0";

async function main() {
  const config = loadConfig();

  const fastify = Fastify({
    logger: {
      level: config.logLevel,
    },
  });

  // Capture raw body for webhook signature verification
  fastify.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (req, body, done) => {
      try {
        const rawBody = body as string;
        (req as unknown as { rawBody: string }).rawBody = rawBody;
        const parsed = JSON.parse(rawBody);
        done(null, parsed);
      } catch (err) {
        done(err as Error);
      }
    },
  );

  // Register plugins
  await fastify.register(cors, { origin: true });
  await fastify.register(authPlugin, { apiKey: config.apiKey });

  // Initialize storage
  const storage = createStorage(config.storageAdapter, {
    sqlitePath: config.sqlitePath,
    databaseUrl: config.databaseUrl,
  });
  await storage.init();
  fastify.log.info(`Storage initialized: ${config.storageAdapter}`);

  // Initialize services
  const resendService = new ResendService(config.resendApiKey, config.domain);
  const mailService = new MailService(storage, resendService);

  // Register routes
  healthRoutes(fastify, config.storageAdapter, VERSION);
  sendRoutes(fastify, mailService);
  inboxRoutes(fastify, mailService, resendService);
  webhookRoutes(fastify, mailService, config.webhookSecret);
  configRoutes(fastify, resendService, mailService, {
    storageAdapter: config.storageAdapter,
    webhookSecret: config.webhookSecret,
    version: VERSION,
  });

  // Graceful shutdown
  const shutdown = async () => {
    fastify.log.info("Shutting down...");
    await fastify.close();
    await storage.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Start server
  await fastify.listen({ port: config.serverPort, host: "0.0.0.0" });
  fastify.log.info(
    `Resend Email Gateway v${VERSION} running on port ${config.serverPort}`,
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
