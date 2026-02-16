import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    verifyApiKey: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

async function authPlugin(
  fastify: FastifyInstance,
  opts: { apiKey: string },
) {
  fastify.decorate(
    "verifyApiKey",
    async function (request: FastifyRequest, reply: FastifyReply) {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        reply.code(401).send({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Missing or invalid Authorization header. Expected: Bearer <API_KEY>",
          },
        });
        return;
      }

      const token = authHeader.slice(7);

      if (token !== opts.apiKey) {
        reply.code(403).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Invalid API key",
          },
        });
        return;
      }
    },
  );
}

export default fp(authPlugin, {
  name: "auth",
});
