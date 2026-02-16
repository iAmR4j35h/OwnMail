import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { ConfigStatus } from "@resend-gateway/types";
import { ResendService } from "../services/resend.service.js";
import type { MailService } from "../services/mail.service.js";

export function configRoutes(
  fastify: FastifyInstance,
  resendService: ResendService,
  mailService: MailService,
  opts: { storageAdapter: string; webhookSecret: string; version: string },
) {
  fastify.get(
    "/api/config/status",
    { preHandler: [fastify.verifyApiKey] },
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      const [domain, connected, stats] = await Promise.all([
        resendService.getDomainStatus(),
        resendService.verifyConnection(),
        mailService.getStats(),
      ]);

      const response: ConfigStatus & { stats: typeof stats } = {
        domain,
        resendConnected: connected,
        webhookConfigured: !!opts.webhookSecret,
        storageAdapter: opts.storageAdapter,
        version: opts.version,
        stats,
      };

      return { success: true, data: response };
    },
  );
}
