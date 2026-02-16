import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { InboundWebhookDataSchema } from "@resend-gateway/types";
import { verifyWebhookSignature } from "../lib/webhook-verify.js";
import type { MailService } from "../services/mail.service.js";

interface WebhookPayload {
  type: string;
  data: Record<string, unknown>;
}

export function webhookRoutes(
  fastify: FastifyInstance,
  mailService: MailService,
  webhookSecret: string,
) {
  fastify.post(
    "/api/webhook",
    {},
    async (request: FastifyRequest, reply: FastifyReply) => {
      const rawBody = (request as unknown as { rawBody: string }).rawBody;

      if (!rawBody) {
        return reply.code(400).send({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing request body",
          },
        });
      }

      // Verify webhook signature
      let payload: WebhookPayload;
      try {
        payload = verifyWebhookSignature<WebhookPayload>(
          webhookSecret,
          rawBody,
          request.headers as Record<string, string>,
        );
      } catch (err) {
        fastify.log.warn({ err }, "Webhook signature verification failed");
        return reply.code(401).send({
          success: false,
          error: {
            code: "INVALID_SIGNATURE",
            message: "Webhook signature verification failed",
          },
        });
      }

      // Handle email.received event
      if (payload.type === "email.received") {
        const parsed = InboundWebhookDataSchema.safeParse(payload.data);

        if (!parsed.success) {
          fastify.log.warn(
            { issues: parsed.error.issues },
            "Invalid inbound email webhook payload",
          );
          return reply.code(400).send({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid inbound email webhook payload",
            },
          });
        }

        try {
          // receiveInbound will fetch the full body from Resend's API
          const id = await mailService.receiveInbound(parsed.data);
          fastify.log.info(
            { id, emailId: parsed.data.email_id },
            "Inbound email fetched and stored",
          );
          return reply.send({ success: true, data: { id } });
        } catch (err) {
          fastify.log.error({ err }, "Failed to fetch/store inbound email");
          return reply.code(500).send({
            success: false,
            error: {
              code: "PROCESSING_ERROR",
              message: "Failed to fetch and store inbound email",
            },
          });
        }
      }

      // Acknowledge other event types without processing
      fastify.log.info(
        { type: payload.type },
        "Webhook event received (unhandled type)",
      );
      return reply.send({ success: true, data: { acknowledged: true } });
    },
  );
}
