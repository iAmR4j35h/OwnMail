import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SendEmailSchema } from "@resend-gateway/types";
import type { MailService } from "../services/mail.service.js";

export function sendRoutes(fastify: FastifyInstance, mailService: MailService) {
  fastify.post(
    "/api/send",
    { preHandler: [fastify.verifyApiKey] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = SendEmailSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
          },
        });
      }

      try {
        const result = await mailService.send(parsed.data);
        return reply.code(200).send({
          success: true,
          data: result,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send email";
        fastify.log.error({ err }, "Failed to send email");
        return reply.code(502).send({
          success: false,
          error: {
            code: "SEND_FAILED",
            message,
          },
        });
      }
    },
  );
}
