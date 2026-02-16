import type { FastifyInstance } from "fastify";
import type { HealthResponse } from "@resend-gateway/types";

const startTime = Date.now();

export function healthRoutes(
  fastify: FastifyInstance,
  storageType: string,
  version: string,
) {
  fastify.get("/api/health", async () => {
    const response: HealthResponse = {
      status: "ok",
      version,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      storage: storageType,
    };
    return response;
  });
}
