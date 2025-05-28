/**
 * Postmark Types for MailMint POC
 * Focus on inbound email processing and classification workflow
 */

// Postmark inbound webhook payload structure
export interface PostmarkInboundWebhook {
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
  OriginalRecipient: string;
  HtmlBody?: string;
  TextBody?: string;
  StrippedTextReply?: string;
  Tag?: string;
  Headers: Array<{
    Name: string;
    Value: string;
  }>;
  Attachments: Array<{
    Name: string;
    Content: string; // Base64 encoded
    ContentType: string;
    ContentLength: number;
    ContentID?: string;
  }>;
  MailboxHash?: string;
  MessageStream?: string;
}

// Our internal processed email format for MailMint
export interface ProcessedEmail {
  id: string;
  messageId: string;
  from: {
    email: string;
    name?: string;
  };
  to: Array<{
    email: string;
    name?: string;
    mailboxHash?: string;
  }>;
  cc?: Array<{
    email: string;
    name?: string;
  }>;
  subject: string;
  receivedAt: Date;
  content: {
    html?: string;
    text?: string;
    strippedReply?: string;
  };
  attachments: Array<{
    filename: string;
    mimeType: string;
    size: number;
    content: string; // Base64
    contentId?: string;
  }>;
  headers: Record<string, string>;
  tag?: string;
  mailboxHash?: string;
  rawPayload: PostmarkInboundWebhook;
}

// Email classification for MailMint workflow
export type EmailClassification = 
  | 'FINANCE' 
  | 'PRODUCT_OFFER' 
  | 'QUOTATION' 
  | 'SPAM' 
  | 'OTHER';

// Vendor information extracted from email
export interface ExtractedVendor {
  domain: string;
  name?: string;
  email: string;
}

// Document information for verification
export interface ExtractedDocument {
  type: 'INVOICE' | 'QUOTE' | 'PROPOSAL' | 'CONTRACT' | 'OTHER';
  amount?: number;
  currency?: string;
  vendorInfo: ExtractedVendor;
  productLines?: Array<{
    name: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  }>;
}

// Classification result
export interface ClassificationResult {
  classification: EmailClassification;
  confidence: number; // 0-1
  shouldProcess: boolean; // Only FINANCE/PRODUCT_OFFER/QUOTATION
  extractedData?: ExtractedDocument;
}

// API response types for minimal Postmark functionality needed
export interface InboundRuleTrigger {
  ID: number;
  Rule: string;
}

export interface InboundRulesResponse {
  TotalCount: number;
  InboundRules: InboundRuleTrigger[];
}

export interface InboundMessage {
  MessageID: string;
  From: string;
  FromName?: string;
  To: string;
  Subject: string;
  Date: string;
  Status: string;
  MailboxHash?: string;
}

export interface InboundMessagesResponse {
  TotalCount: number;
  InboundMessages: InboundMessage[];
}

export interface PostmarkError {
  ErrorCode: number;
  Message: string;
}
