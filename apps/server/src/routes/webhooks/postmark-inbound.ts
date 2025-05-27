import { Hono } from "hono";
import type { Context } from "hono";
import { logger } from "@repo/logs";

// Postmark webhook payload types
interface PostmarkAttachment {
  Name: string;
  Content: string;
  ContentType: string;
  ContentLength: number;
  ContentID?: string;
}

interface PostmarkWebhookPayload {
  MessageID: string;
  Date: string;
  Subject: string;
  From: string;
  FromName?: string;
  FromFull: {
    Email: string;
    Name?: string;
    MailboxHash?: string;
  };
  To: string;
  ToFull: Array<{
    Email: string;
    Name?: string;
    MailboxHash?: string;
  }>;
  Cc?: string;
  CcFull?: Array<{
    Email: string;
    Name?: string;
    MailboxHash?: string;
  }>;
  Bcc?: string;
  BccFull?: Array<{
    Email: string;
    Name?: string;
    MailboxHash?: string;
  }>;
  OriginalRecipient: string;
  ReplyTo?: string;
  HtmlBody?: string;
  TextBody?: string;
  StrippedTextReply?: string;
  Tag?: string;
  Headers: Array<{
    Name: string;
    Value: string;
  }>;
  Attachments: PostmarkAttachment[];
  RawEmail?: string;
}

// Parsed email structure for our system
interface RawEmail {
  emailId: string;
  messageId: string;
  fromAddress: string;
  fromName?: string;
  toAddresses: string[];
  ccAddresses?: string[];
  bccAddresses?: string[];
  subject?: string;
  receivedAt: Date;
  bodyHtml?: string;
  bodyText?: string;
  headers: Record<string, string>;
  attachments: Array<{
    filename: string;
    mimeType: string;
    size: number;
    content?: string;
    contentId?: string;
  }>;
  rawPayload: PostmarkWebhookPayload;
}

/**
 * Parse Postmark webhook payload into our RawEmail format
 */
function parsePostmarkPayload(payload: PostmarkWebhookPayload): RawEmail {
  // Convert headers array to object
  const headers: Record<string, string> = {};
  payload.Headers.forEach(header => {
    headers[header.Name] = header.Value;
  });

  // Extract email addresses
  const toAddresses = payload.ToFull.map(to => to.Email);
  const ccAddresses = payload.CcFull?.map(cc => cc.Email) || [];
  const bccAddresses = payload.BccFull?.map(bcc => bcc.Email) || [];

  // Parse attachments
  const attachments = payload.Attachments.map(att => ({
    filename: att.Name,
    mimeType: att.ContentType,
    size: att.ContentLength,
    content: att.Content, // Base64 encoded
    contentId: att.ContentID
  }));

  return {
    emailId: payload.MessageID,
    messageId: payload.MessageID,
    fromAddress: payload.FromFull.Email,
    fromName: payload.FromFull.Name,
    toAddresses,
    ccAddresses: ccAddresses.length > 0 ? ccAddresses : undefined,
    bccAddresses: bccAddresses.length > 0 ? bccAddresses : undefined,
    subject: payload.Subject,
    receivedAt: new Date(payload.Date),
    bodyHtml: payload.HtmlBody,
    bodyText: payload.TextBody,
    headers,
    attachments,
    rawPayload: payload
  };
}

// Create Postmark webhook routes
const postmarkInboundWebhook = new Hono();

/**
 * POST /webhooks/postmark/inbound
 * Receive and process inbound emails from Postmark
 */
postmarkInboundWebhook.post("/inbound", async (c: Context) => {
  const startTime = Date.now();
  
  try {
    logger.info("Received Postmark inbound webhook request");

    // Parse the JSON payload
    const payload: PostmarkWebhookPayload = await c.req.json();
    
    // Validate required fields
    if (!payload.MessageID) {
      logger.error("Invalid payload: Missing MessageID");
      return c.json({ error: "Invalid payload: Missing MessageID" }, 400);
    }

    // Parse the payload into our RawEmail format
    const rawEmail: RawEmail = parsePostmarkPayload(payload);

    // Log the parsed email details for testing
    logger.info("Successfully parsed Postmark webhook payload", {
      emailId: rawEmail.emailId,
      from: rawEmail.fromAddress,
      fromName: rawEmail.fromName,
      to: rawEmail.toAddresses,
      subject: rawEmail.subject,
      receivedAt: rawEmail.receivedAt,
      hasHtmlBody: !!rawEmail.bodyHtml,
      hasTextBody: !!rawEmail.bodyText,
      attachmentCount: rawEmail.attachments.length,
      attachmentSizes: rawEmail.attachments.map(att => ({
        filename: att.filename,
        size: att.size,
        type: att.mimeType
      }))
    });

    // Console log for initial testing
    console.log("=== PARSED POSTMARK EMAIL ===");
    console.log("Email ID:", rawEmail.emailId);
    console.log("From:", rawEmail.fromAddress, rawEmail.fromName ? `(${rawEmail.fromName})` : "");
    console.log("To:", rawEmail.toAddresses.join(", "));
    console.log("Subject:", rawEmail.subject);
    console.log("Received At:", rawEmail.receivedAt.toISOString());
    console.log("Body Length:", {
      html: rawEmail.bodyHtml?.length || 0,
      text: rawEmail.bodyText?.length || 0
    });
    console.log("Attachments:", rawEmail.attachments.length);
    if (rawEmail.attachments.length > 0) {
      rawEmail.attachments.forEach((att, idx) => {
        console.log(`  ${idx + 1}. ${att.filename} (${att.size} bytes, ${att.mimeType})`);
      });
    }
    console.log("Headers Count:", Object.keys(rawEmail.headers).length);
    console.log("===========================");

    // Calculate processing time
    const processingTime = Date.now() - startTime;
    logger.info(`Webhook processed successfully in ${processingTime}ms`);

    // Respond with 200 OK within 2 seconds requirement
    return c.json({ 
      success: true, 
      messageId: rawEmail.emailId,
      processingTime: `${processingTime}ms`
    }, 200);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error("Failed to process Postmark webhook", {
      error: error instanceof Error ? error.message : String(error),
      processingTime: `${processingTime}ms`,
      stack: error instanceof Error ? error.stack : undefined
    });

    // Log the error but don't fail the webhook delivery
    return c.json({ 
      success: false, 
      error: "Internal processing error",
      processingTime: `${processingTime}ms`
    }, 200);
  }
});

export { postmarkInboundWebhook };
