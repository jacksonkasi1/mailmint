import crypto from 'crypto';
import { logger } from '@repo/logs';
import type { PostmarkInboundWebhook, ProcessedEmail } from './types';

/**
 * Webhook Security and Processing Service
 * Handles signature verification and email parsing
 */
export class WebhookService {
  /**
   * Verify Postmark webhook signature for security
   * Essential for production to prevent fake webhooks
   */
  static verifySignature(body: string, signature: string): boolean {
    const webhookSecret = process.env.POSTMARK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      logger.warn('Webhook secret not configured, skipping signature verification');
      return true; // Allow in development
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('base64');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Parse Postmark webhook payload into our internal format
   * Converts complex Postmark format to simplified structure
   */
  static parseInboundEmail(payload: PostmarkInboundWebhook): ProcessedEmail {
    // Convert headers array to object for easier access
    const headers: Record<string, string> = {};
    payload.Headers.forEach(header => {
      headers[header.Name] = header.Value;
    });

    // Parse recipient information
    const to = payload.ToFull.map(recipient => ({
      email: recipient.Email,
      name: recipient.Name,
      mailboxHash: recipient.MailboxHash,
    }));

    const cc = payload.CcFull?.map(recipient => ({
      email: recipient.Email,
      name: recipient.Name,
    }));

    // Parse attachments
    const attachments = payload.Attachments.map(att => ({
      filename: att.Name,
      mimeType: att.ContentType,
      size: att.ContentLength,
      content: att.Content, // Base64 encoded
      contentId: att.ContentID,
    }));

    return {
      id: payload.MessageID,
      messageId: payload.MessageID,
      from: {
        email: payload.FromFull.Email,
        name: payload.FromFull.Name,
      },
      to,
      cc: cc && cc.length > 0 ? cc : undefined,
      subject: payload.Subject,
      receivedAt: new Date(payload.Date),
      content: {
        html: payload.HtmlBody,
        text: payload.TextBody,
        strippedReply: payload.StrippedTextReply,
      },
      attachments,
      headers,
      tag: payload.Tag,
      mailboxHash: payload.MailboxHash,
      rawPayload: payload,
    };
  }

  /**
   * Extract mailbox hash for routing emails to specific handlers
   * Essential for multi-tenant or user-specific email processing
   */
  static extractMailboxHash(email: string): string | null {
    const match = email.match(/\+([^@]+)@/);
    return match ? match[1] : null;
  }

  /**
   * Check if email is spam based on headers
   * Uses Postmark's SpamAssassin integration
   */
  static isSpam(headers: Record<string, string>, threshold: number = 5): boolean {
    const spamScore = headers['X-Spam-Score'];
    if (!spamScore) return false;

    const score = parseFloat(spamScore);
    return !isNaN(score) && score >= threshold;
  }

  /**
   * Extract webhook signature from request headers
   * Postmark sends signature in various header formats
   */
  static extractSignature(headers: Record<string, string | string[]>): string | null {
    // Check common signature header names
    const signatureHeaders = [
      'x-postmark-signature',
      'x-pm-signature', 
      'postmark-signature',
      'signature'
    ];

    for (const headerName of signatureHeaders) {
      const value = headers[headerName] || headers[headerName.toLowerCase()];
      if (value) {
        return Array.isArray(value) ? value[0] : value;
      }
    }

    return null;
  }

  /**
   * Validate webhook payload structure
   */
  static validatePayload(payload: any): payload is PostmarkInboundWebhook {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    // Check required fields
    const requiredFields = ['MessageID', 'Date', 'FromFull', 'ToFull', 'Subject'];
    for (const field of requiredFields) {
      if (!payload[field]) {
        logger.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // Validate FromFull structure
    if (!payload.FromFull.Email) {
      logger.error('Missing FromFull.Email');
      return false;
    }

    // Validate ToFull structure
    if (!Array.isArray(payload.ToFull) || payload.ToFull.length === 0) {
      logger.error('Invalid ToFull array');
      return false;
    }

    // Validate Headers structure
    if (!Array.isArray(payload.Headers)) {
      logger.error('Invalid Headers array');
      return false;
    }

    // Validate Attachments structure
    if (!Array.isArray(payload.Attachments)) {
      logger.error('Invalid Attachments array');
      return false;
    }

    return true;
  }
}
