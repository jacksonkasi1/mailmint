import { logger } from '@repo/logs';
import type { 
  ProcessedEmail, 
  EmailClassification, 
  ClassificationResult, 
  ExtractedDocument,
  ExtractedVendor 
} from './types';

/**
 * Email Classification Service for MailMint POC
 * Classifies emails and extracts document/vendor information
 * Only processes FINANCE, PRODUCT_OFFER, and QUOTATION emails
 */
export class ClassificationService {
  /**
   * Classify email using NLP/keyword analysis
   * Returns classification and whether it should be processed
   */
  static async classifyEmail(email: ProcessedEmail): Promise<ClassificationResult> {
    const subject = email.subject.toLowerCase();
    const bodyText = (email.content.text || '').toLowerCase();
    const bodyHtml = (email.content.html || '').toLowerCase();
    const combinedContent = `${subject} ${bodyText} ${bodyHtml}`;

    // Check for spam first
    if (this.isSpam(email)) {
      return {
        classification: 'SPAM',
        confidence: 0.9,
        shouldProcess: false,
      };
    }

    // Finance keywords
    const financeKeywords = [
      'invoice', 'payment', 'bill', 'receipt', 'charge', 'fee',
      'amount due', 'balance', 'overdue', 'finance', 'accounting',
      'tax', 'vat', 'gst', 'expense', 'cost'
    ];

    // Product offer keywords  
    const productKeywords = [
      'product', 'service', 'offer', 'discount', 'sale', 'promotion',
      'deal', 'special', 'catalog', 'brochure', 'new arrival',
      'launch', 'feature', 'demo', 'trial'
    ];

    // Quotation keywords
    const quotationKeywords = [
      'quote', 'quotation', 'estimate', 'proposal', 'bid',
      'rfq', 'request for quote', 'pricing', 'cost estimate',
      'tender', 'proposal submission'
    ];

    const financeScore = this.calculateKeywordScore(combinedContent, financeKeywords);
    const productScore = this.calculateKeywordScore(combinedContent, productKeywords);
    const quotationScore = this.calculateKeywordScore(combinedContent, quotationKeywords);

    // Determine classification based on highest score
    const scores = [
      { type: 'FINANCE' as EmailClassification, score: financeScore },
      { type: 'PRODUCT_OFFER' as EmailClassification, score: productScore },
      { type: 'QUOTATION' as EmailClassification, score: quotationScore },
    ];

    const bestMatch = scores.reduce((prev, current) => 
      current.score > prev.score ? current : prev
    );

    // Minimum confidence threshold
    const minConfidence = 0.3;
    const classification = bestMatch.score >= minConfidence ? bestMatch.type : 'OTHER';
    const shouldProcess = ['FINANCE', 'PRODUCT_OFFER', 'QUOTATION'].includes(classification);

    let extractedData: ExtractedDocument | undefined;
    if (shouldProcess) {
      extractedData = this.extractDocumentData(email, classification);
    }

    logger.info('Email classified', {
      messageId: email.messageId,
      classification,
      confidence: bestMatch.score,
      shouldProcess,
      scores: {
        finance: financeScore,
        product: productScore,
        quotation: quotationScore,
      }
    });

    return {
      classification,
      confidence: bestMatch.score,
      shouldProcess,
      extractedData,
    };
  }

  /**
   * Extract basic vendor and document information
   * This is basic heuristic extraction - full extraction happens in verification workflow
   */
  private static extractDocumentData(
    email: ProcessedEmail, 
    classification: EmailClassification
  ): ExtractedDocument {
    // Extract vendor info from sender
    const vendor: ExtractedVendor = {
      email: email.from.email,
      name: email.from.name,
      domain: email.from.email.split('@')[1],
    };

    // Extract basic document type based on classification
    let documentType: ExtractedDocument['type'] = 'OTHER';
    if (classification === 'FINANCE') {
      documentType = 'INVOICE';
    } else if (classification === 'QUOTATION') {
      documentType = 'QUOTE';
    } else if (classification === 'PRODUCT_OFFER') {
      documentType = 'PROPOSAL';
    }

    // Basic amount extraction (simple regex patterns)
    const amount = this.extractAmount(email.content.text || email.content.html || '');

    return {
      type: documentType,
      amount: amount?.value,
      currency: amount?.currency,
      vendorInfo: vendor,
      // Product lines will be extracted in detailed verification workflow
    };
  }

  /**
   * Calculate keyword matching score
   */
  private static calculateKeywordScore(content: string, keywords: string[]): number {
    let score = 0;
    const totalKeywords = keywords.length;

    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        // Weight longer keywords higher
        const weight = keyword.split(' ').length;
        score += weight;
      }
    }

    // Normalize to 0-1 range
    return Math.min(score / totalKeywords, 1);
  }

  /**
   * Basic spam detection using headers and content
   */
  private static isSpam(email: ProcessedEmail): boolean {
    // Check spam score from headers
    const spamScore = email.headers['X-Spam-Score'];
    if (spamScore && parseFloat(spamScore) >= 5) {
      return true;
    }

    // Check spam status
    const spamStatus = email.headers['X-Spam-Status'];
    if (spamStatus && spamStatus.toLowerCase().includes('yes')) {
      return true;
    }

    // Basic content-based spam detection
    const content = `${email.subject} ${email.content.text || ''}`.toLowerCase();
    const spamKeywords = [
      'urgent!!!', 'act now', 'limited time', 'click here now',
      'make money fast', 'get rich quick', 'free money',
      'congratulations you have won', 'claim your prize'
    ];

    const spamMatches = spamKeywords.filter(keyword => content.includes(keyword));
    return spamMatches.length >= 2; // Multiple spam indicators
  }

  /**
   * Extract monetary amounts from text
   */
  private static extractAmount(content: string): { value: number; currency: string } | null {
    // Common currency patterns
    const patterns = [
      /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, // $1,234.56
      /USD\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // USD 1234.56
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*USD/gi, // 1234.56 USD
      /€(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, // €1,234.56
      /£(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, // £1,234.56
      /INR\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // INR 1234.56
      /₹(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, // ₹1,234.56
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(content);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount)) {
          // Determine currency based on pattern
          let currency = 'USD'; // default
          if (pattern.source.includes('€')) currency = 'EUR';
          if (pattern.source.includes('£')) currency = 'GBP';
          if (pattern.source.includes('INR') || pattern.source.includes('₹')) currency = 'INR';
          
          return { value: amount, currency };
        }
      }
    }

    return null;
  }
}
