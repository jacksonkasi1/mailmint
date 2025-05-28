import { Hono } from "hono";
import type { Context } from "hono";
import { logger } from "@repo/logs";
import { MailMintPostmarkService, WebhookService } from "../../services/postmark";// Create Postmark webhook routes
const postmarkInboundWebhook = new Hono();

/**
 * POST /webhooks/postmark/inbound
 * Receive and process inbound emails from Postmark
 * Implements MailMint workflow: classification, extraction, and verification trigger
 */
postmarkInboundWebhook.post("/inbound", async (c: Context) => {
  const startTime = Date.now();
  
  try {
    logger.info("Received Postmark inbound webhook request");

    // Get raw body and signature for verification
    const rawBody = await c.req.text();
    const signature = WebhookService.extractSignature(c.req.header());

    if (!signature) {
      logger.error("Missing webhook signature");
      return c.json({ error: "Missing webhook signature" }, 400);
    }

    // Process the webhook using MailMint service
    const result = await MailMintPostmarkService.processInboundWebhook(rawBody, signature);

    if (!result.success) {
      logger.error("Failed to process webhook", { error: result.error });
      return c.json({ 
        success: false, 
        error: result.error || "Processing failed",
        processingTime: `${Date.now() - startTime}ms`
      }, 400);
    }

    const { processedEmail, classification } = result;

    // Log classification results
    logger.info("Email classified and processed", {
      messageId: processedEmail!.messageId,
      from: processedEmail!.from.email,
      classification: classification!.classification,
      confidence: classification!.confidence,
      shouldProcess: classification!.shouldProcess,
      processingTime: `${Date.now() - startTime}ms`
    });

    // Console output for testing and debugging
    console.log("=== MAILMINT EMAIL PROCESSING ===");
    console.log("Message ID:", processedEmail!.messageId);
    console.log("From:", processedEmail!.from.email, processedEmail!.from.name ? `(${processedEmail!.from.name})` : "");
    console.log("Subject:", processedEmail!.subject);
    console.log("Classification:", classification!.classification);
    console.log("Confidence:", (classification!.confidence * 100).toFixed(1) + "%");
    console.log("Should Process:", classification!.shouldProcess ? "YES" : "NO");
    
    if (classification!.extractedData) {
      console.log("Extracted Data:");
      console.log("  - Document Type:", classification!.extractedData.type);
      console.log("  - Amount:", classification!.extractedData.amount ? 
        `${classification!.extractedData.currency || 'USD'} ${classification!.extractedData.amount}` : "Not found");
      console.log("  - Vendor:", classification!.extractedData.vendorInfo.domain);
    }

    if (classification!.shouldProcess) {
      console.log("✅ Email qualifies for MailMint processing (FINANCE/PRODUCT_OFFER/QUOTATION)");
      
      // TODO: Implement database persistence for processedEmail and classification
      // TODO: Trigger verification workflow via Upstash queue
      
      console.log("📋 Next steps:");
      console.log("  1. Save to MongoDB (emails, documents, vendors collections)");
      console.log("  2. Check for document attachments > 10MB → upload to GCS");
      console.log("  3. Trigger verification workflow via Upstash queue");
    } else {
      console.log("⏭️  Email filtered out:", classification!.classification);
    }
    
    console.log("Processing Time:", `${Date.now() - startTime}ms`);
    console.log("================================");

    // Respond with success within 2 second requirement
    return c.json({ 
      success: true, 
      messageId: processedEmail!.messageId,
      classification: classification!.classification,
      shouldProcess: classification!.shouldProcess,
      processingTime: `${Date.now() - startTime}ms`
    }, 200);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error("Failed to process Postmark webhook", {
      error: error instanceof Error ? error.message : String(error),
      processingTime: `${processingTime}ms`,
      stack: error instanceof Error ? error.stack : undefined
    });

    // Always return 200 to prevent Postmark retry storms
    return c.json({ 
      success: false, 
      error: "Internal processing error",
      processingTime: `${processingTime}ms`
    }, 200);
  }
});

export { postmarkInboundWebhook };
