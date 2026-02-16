import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { Readable } from "node:stream";
import { ListOptionsSchema } from "@resend-gateway/types";
import type { MailService } from "../services/mail.service.js";
import type { ResendService } from "../services/resend.service.js";

interface IdParams {
  Params: { id: string };
}

interface AttachmentParams {
  Params: { id: string; attachmentId: string };
}

export function inboxRoutes(
  fastify: FastifyInstance,
  mailService: MailService,
  resendService: ResendService,
) {
  // List emails
  fastify.get(
    "/api/inbox",
    { preHandler: [fastify.verifyApiKey] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = ListOptionsSchema.safeParse(request.query);

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

      const result = await mailService.listEmails(parsed.data);
      return reply.send({ success: true, data: result });
    },
  );

  // Get single email
  fastify.get<IdParams>(
    "/api/inbox/:id",
    { preHandler: [fastify.verifyApiKey] },
    async (request, reply) => {
      const email = await mailService.getEmail(request.params.id);

      if (!email) {
        return reply.code(404).send({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Email not found",
          },
        });
      }

      return reply.send({ success: true, data: email });
    },
  );

  // Delete email
  fastify.delete<IdParams>(
    "/api/inbox/:id",
    { preHandler: [fastify.verifyApiKey] },
    async (request, reply) => {
      const deleted = await mailService.deleteEmail(request.params.id);

      if (!deleted) {
        return reply.code(404).send({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Email not found",
          },
        });
      }

      return reply.send({ success: true, data: { deleted: true } });
    },
  );

  // Download attachment (proxied through server so API key stays hidden)
  fastify.get<AttachmentParams>(
    "/api/inbox/:id/attachments/:attachmentId",
    { preHandler: [fastify.verifyApiKey] },
    async (request, reply) => {
      const email = await mailService.getEmail(request.params.id);

      if (!email) {
        return reply.code(404).send({
          success: false,
          error: { code: "NOT_FOUND", message: "Email not found" },
        });
      }

      // Only inbound emails have downloadable attachments from Resend
      if (!email.resendId) {
        return reply.code(400).send({
          success: false,
          error: {
            code: "NO_RESEND_ID",
            message: "This email has no associated Resend ID for attachment download",
          },
        });
      }

      const attachment = email.attachments?.find(
        (a) => a.id === request.params.attachmentId,
      );

      if (!attachment) {
        return reply.code(404).send({
          success: false,
          error: { code: "NOT_FOUND", message: "Attachment not found" },
        });
      }

      try {
        const download = await resendService.downloadAttachment(
          email.resendId,
          request.params.attachmentId,
        );

        reply.header("Content-Type", download.contentType);
        reply.header(
          "Content-Disposition",
          `attachment; filename="${download.filename}"`,
        );

        // Convert Web ReadableStream to Node Readable for Fastify
        const nodeStream = Readable.fromWeb(download.stream as import("stream/web").ReadableStream);
        return reply.send(nodeStream);
      } catch (err) {
        fastify.log.error({ err }, "Failed to download attachment");
        return reply.code(502).send({
          success: false,
          error: {
            code: "DOWNLOAD_FAILED",
            message:
              err instanceof Error
                ? err.message
                : "Failed to download attachment",
          },
        });
      }
    },
  );
}
