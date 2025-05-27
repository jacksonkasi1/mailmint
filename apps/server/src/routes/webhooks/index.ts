import { Hono } from "hono";
import { postmarkInboundWebhook } from "./postmark-inbound";

// Create webhook routes
const webhookRoutes = new Hono();

// Mount webhook endpoints
webhookRoutes.route("/postmark", postmarkInboundWebhook);

export { webhookRoutes };
