/**
 * MailMint Postmark Services
 * Focused services for inbound email processing and verification workflow
 */

// Core services
export { WebhookService } from './webhook.service';
export { ClassificationService } from './classification.service';
export { postmarkClient } from './client.service';

// Types
export type {
  PostmarkInboundWebhook,
  ProcessedEmail,
  EmailClassification,
  ClassificationResult,
  ExtractedDocument,
  ExtractedVendor,
  InboundRuleTrigger,
  InboundRulesResponse,
  InboundMessage,
  InboundMessagesResponse,
  PostmarkError,
} from './types';

// Import all required dependencies
import { WebhookService } from './webhook.service';
import { ClassificationService } from './classification.service';
import { postmarkClient } from './client.service';
import type { 
  PostmarkInboundWebhook, 
  ProcessedEmail, 
  ClassificationResult 
} from './types';

/**
 * Complete MailMint Email Processing Pipeline
 * This is the main entry point for processing inbound emails
 */
export class MailMintPostmarkService {
  /**
   * Process inbound webhook from Postmark
   * Main workflow for MailMint email processing
   */
  static async processInboundWebhook(
    rawBody: string, 
    signature: string
  ): Promise<{
    success: boolean;
    processedEmail?: ProcessedEmail;
    classification?: ClassificationResult;
    error?: string;
  }> {
    try {
      // Step 1: Verify webhook signature
      if (!WebhookService.verifySignature(rawBody, signature)) {
        return {
          success: false,
          error: 'Invalid webhook signature'
        };
      }

      // Step 2: Parse webhook payload
      const webhookPayload: PostmarkInboundWebhook = JSON.parse(rawBody);
      const processedEmail = WebhookService.parseInboundEmail(webhookPayload);

      // Step 3: Classify email
      const classification = await ClassificationService.classifyEmail(processedEmail);

      return {
        success: true,
        processedEmail,
        classification
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get server configuration for setup verification
   */
  static async getConfiguration() {
    return postmarkClient.getServerInfo();
  }

  /**
   * Update webhook URL during setup
   */
  static async updateWebhookUrl(url: string) {
    return postmarkClient.updateWebhookUrl(url);
  }

  /**
   * Block sender when verification identifies threats
   */
  static async blockSender(email: string) {
    return postmarkClient.createBlockingRule(email);
  }

  /**
   * Get message details for verification processing
   */
  static async getMessageDetails(messageId: string) {
    return postmarkClient.getInboundMessage(messageId);
  }
}
