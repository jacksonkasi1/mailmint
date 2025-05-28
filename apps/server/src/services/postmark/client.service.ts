import { Client } from 'postmark';
import { logger } from '@repo/logs';
import type { 
  InboundRulesResponse, 
  InboundMessagesResponse, 
  PostmarkError 
} from './types';

/**
 * Postmark Client Service for MailMint POC
 * Minimal API operations needed for the verification workflow
 */
export class PostmarkClientService {
  private client: Client;

  constructor() {
    const serverToken = process.env.POSTMARK_SERVER_TOKEN;
    if (!serverToken) {
      throw new Error('POSTMARK_SERVER_TOKEN environment variable is required');
    }
    this.client = new Client(serverToken);
  }

  /**
   * Get specific inbound message details
   * Used to retrieve message when processing verification requests
   */
  async getInboundMessage(messageId: string) {
    try {
      const result = await this.client.getInboundMessageDetails(messageId);
      logger.info('Retrieved inbound message details', { messageId });
      return result;
    } catch (error) {
      logger.error('Failed to get inbound message details', { messageId, error });
      throw error;
    }
  }

  /**
   * Search inbound messages with filters
   * Used for retrieving messages for verification or review
   */
  async searchInboundMessages(params: {
    recipient?: string;
    fromemail?: string;
    subject?: string;
    mailboxhash?: string;
    fromdate?: string;
    todate?: string;
    count?: number;
    offset?: number;
  }) {
    try {
      const result = await this.client.getInboundMessages(params as any);
      logger.info('Retrieved inbound messages', {
        count: result.InboundMessages?.length || 0,
        totalCount: result.TotalCount,
        params
      });
      return result;
    } catch (error) {
      logger.error('Failed to search inbound messages', { params, error });
      throw error;
    }
  }

  /**
   * Create inbound rule for blocking spam senders
   * Used when verification workflow identifies suspicious senders
   */
  async createBlockingRule(rule: string) {
    try {
      const result = await this.client.createInboundRuleTrigger({ Rule: rule });
      logger.info('Created blocking rule', { rule, id: result.ID });
      return result;
    } catch (error) {
      logger.error('Failed to create blocking rule', { rule, error });
      throw error;
    }
  }

  /**
   * Get current blocking rules
   * Used for monitoring and managing spam prevention
   */
  async getBlockingRules() {
    try {
      const result = await this.client.getInboundRuleTriggers();
      logger.info('Retrieved blocking rules', { count: result.InboundRules?.length || 0 });
      return result;
    } catch (error) {
      logger.error('Failed to get blocking rules', { error });
      throw error;
    }
  }

  /**
   * Delete blocking rule
   * Used for managing false positives in spam detection
   */
  async deleteBlockingRule(triggerId: number) {
    try {
      const result = await this.client.deleteInboundRuleTrigger(triggerId);
      logger.info('Deleted blocking rule', { triggerId });
      return result;
    } catch (error) {
      logger.error('Failed to delete blocking rule', { triggerId, error });
      throw error;
    }
  }

  /**
   * Get server configuration including inbound hash
   * Used for setup and configuration verification
   */
  async getServerInfo() {
    try {
      const result = await this.client.getServer();
      logger.info('Retrieved server info', {
        name: result.Name,
        inboundHash: result.InboundHash,
        webhookUrl: result.InboundHookUrl
      });
      return result;
    } catch (error) {
      logger.error('Failed to get server info', { error });
      throw error;
    }
  }

  /**
   * Update webhook URL for inbound processing
   * Used during setup or when changing webhook endpoints
   */
  async updateWebhookUrl(webhookUrl: string) {
    try {
      const result = await this.client.editServer({
        InboundHookUrl: webhookUrl
      });
      logger.info('Updated webhook URL', { webhookUrl });
      return result;
    } catch (error) {
      logger.error('Failed to update webhook URL', { webhookUrl, error });
      throw error;
    }
  }
}

// Export singleton instance
export const postmarkClient = new PostmarkClientService();
