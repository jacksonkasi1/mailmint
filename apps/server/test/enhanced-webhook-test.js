#!/usr/bin/env node

/**
 * Enhanced MailMint Webhook Test Script
 * Tests the complete Postmark inbound workflow with signature verification
 */

const crypto = require('crypto');
const https = require('https');

// Configuration
const BASE_URL = 'http://localhost:8080';
const WEBHOOK_SECRET = 'test-webhook-secret-key'; // Should match .env.development

/**
 * Generate HMAC-SHA256 signature for webhook authentication
 */
function generateSignature(body, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');
}

/**
 * Test webhook payloads for different email categories
 */
const testPayloads = {
  finance: {
    "MessageID": "test-finance-001",
    "Date": new Date().toISOString(),
    "Subject": "Invoice #12345 - Payment Due",
    "From": "billing@supplier.com",
    "FromName": "Billing Department",
    "FromFull": {
      "Email": "billing@supplier.com",
      "Name": "Billing Department"
    },
    "To": "procurement@mailmint.com",
    "ToFull": [
      {
        "Email": "procurement@mailmint.com",
        "Name": "Procurement Team"
      }
    ],
    "Cc": "",
    "CcFull": [],
    "OriginalRecipient": "procurement@mailmint.com",
    "HtmlBody": "<h2>Invoice #12345</h2><p>Amount due: $2,500.00 USD</p><p>Due date: 30 days</p>",
    "TextBody": "Invoice #12345\\n\\nAmount due: $2,500.00 USD\\nDue date: 30 days",
    "StrippedTextReply": "",
    "Tag": "finance",
    "Headers": [
      { "Name": "Content-Type", "Value": "text/html" },
      { "Name": "Message-ID", "Value": "<finance-001@supplier.com>" }
    ],
    "Attachments": [
      {
        "Name": "invoice_12345.pdf",
        "Content": "JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAv",
        "ContentType": "application/pdf",
        "ContentLength": 25000
      }
    ]
  },
  
  productOffer: {
    "MessageID": "test-product-002",
    "Date": new Date().toISOString(),
    "Subject": "New Product Launch - Special Pricing",
    "From": "sales@techvendor.com",
    "FromName": "Sales Team",
    "FromFull": {
      "Email": "sales@techvendor.com",
      "Name": "Sales Team"
    },
    "To": "procurement@mailmint.com",
    "ToFull": [
      {
        "Email": "procurement@mailmint.com",
        "Name": "Procurement Team"
      }
    ],
    "Cc": "",
    "CcFull": [],
    "OriginalRecipient": "procurement@mailmint.com",
    "HtmlBody": "<h1>New Product Launch</h1><p>Introducing our latest product with special launch pricing of $199.99</p>",
    "TextBody": "New Product Launch\\n\\nIntroducing our latest product with special launch pricing of $199.99",
    "StrippedTextReply": "",
    "Tag": "product-offer",
    "Headers": [
      { "Name": "Content-Type", "Value": "text/html" },
      { "Name": "Message-ID", "Value": "<product-002@techvendor.com>" }
    ],
    "Attachments": []
  },
  
  quotation: {
    "MessageID": "test-quotation-003",
    "Date": new Date().toISOString(),
    "Subject": "RFQ Response - Equipment Quote",
    "From": "quotes@industrial.com",
    "FromName": "Quote Department",
    "FromFull": {
      "Email": "quotes@industrial.com",
      "Name": "Quote Department"
    },
    "To": "procurement@mailmint.com",
    "ToFull": [
      {
        "Email": "procurement@mailmint.com",
        "Name": "Procurement Team"
      }
    ],
    "Cc": "",
    "CcFull": [],
    "OriginalRecipient": "procurement@mailmint.com",
    "HtmlBody": "<h2>Equipment Quotation</h2><p>Total quote: €15,750.00</p><p>Delivery: 4-6 weeks</p>",
    "TextBody": "Equipment Quotation\\n\\nTotal quote: €15,750.00\\nDelivery: 4-6 weeks",
    "StrippedTextReply": "",
    "Tag": "quotation",
    "Headers": [
      { "Name": "Content-Type", "Value": "text/html" },
      { "Name": "Message-ID", "Value": "<quotation-003@industrial.com>" }
    ],
    "Attachments": []
  },
  
  spam: {
    "MessageID": "test-spam-004",
    "Date": new Date().toISOString(),
    "Subject": "URGENT!!! Win $1,000,000 NOW!!!",
    "From": "noreply@spam.com",
    "FromName": "Get Rich Quick",
    "FromFull": {
      "Email": "noreply@spam.com",
      "Name": "Get Rich Quick"
    },
    "To": "procurement@mailmint.com",
    "ToFull": [
      {
        "Email": "procurement@mailmint.com",
        "Name": "Procurement Team"
      }
    ],
    "Cc": "",
    "CcFull": [],
    "OriginalRecipient": "procurement@mailmint.com",
    "HtmlBody": "<h1>URGENT!!! CLICK HERE NOW!!!</h1><p>Make money fast! Act now!</p>",
    "TextBody": "URGENT!!! CLICK HERE NOW!!!\\n\\nMake money fast! Act now!",
    "StrippedTextReply": "",
    "Tag": "spam",
    "Headers": [
      { "Name": "Content-Type", "Value": "text/html" },
      { "Name": "X-Spam-Score", "Value": "8.5" },
      { "Name": "Message-ID", "Value": "<spam-004@spam.com>" }
    ],
    "Attachments": []
  }
};

/**
 * Send webhook test request
 */
async function sendWebhookTest(name, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const signature = generateSignature(body, WEBHOOK_SECRET);
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/webhooks/postmark/inbound',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Postmark-Signature': signature,
        'User-Agent': 'Postmark/1.0'
      }
    };

    console.log(`\\n📧 Testing ${name.toUpperCase()} email...`);
    console.log(`📝 Message ID: ${payload.MessageID}`);
    console.log(`📤 From: ${payload.FromFull.Email}`);
    console.log(`📋 Subject: ${payload.Subject}`);
    console.log(`🔐 Signature: ${signature.substring(0, 20)}...`);

    const req = require('http').request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`📊 Classification: ${response.classification || 'N/A'}`);
          console.log(`🎯 Should Process: ${response.shouldProcess ? 'YES' : 'NO'}`);
          console.log(`⏱️  Processing Time: ${response.processingTime}`);
          
          if (response.success) {
            console.log(`✅ ${name.toUpperCase()} test PASSED`);
          } else {
            console.log(`❌ ${name.toUpperCase()} test FAILED: ${response.error}`);
          }
          
          resolve(response);
        } catch (error) {
          console.log(`❌ Failed to parse response: ${error.message}`);
          console.log(`Raw response: ${responseData}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request failed: ${error.message}`);
      reject(error);
    });

    req.write(body);
    req.end();
  });
}

/**
 * Test signature verification with invalid signature
 */
async function testInvalidSignature() {
  return new Promise((resolve, reject) => {
    const payload = testPayloads.finance;
    const body = JSON.stringify(payload);
    const invalidSignature = 'invalid-signature-123';
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/webhooks/postmark/inbound',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Postmark-Signature': invalidSignature,
        'User-Agent': 'Postmark/1.0'
      }
    };

    console.log(`\\n🔒 Testing INVALID SIGNATURE...`);
    console.log(`🔐 Invalid Signature: ${invalidSignature}`);

    const req = require('http').request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          console.log(`📊 Status: ${res.statusCode}`);
          
          if (res.statusCode === 400 || !response.success) {
            console.log(`✅ SECURITY test PASSED - Invalid signature rejected`);
          } else {
            console.log(`❌ SECURITY test FAILED - Invalid signature accepted`);
          }
          
          resolve(response);
        } catch (error) {
          console.log(`❌ Failed to parse response: ${error.message}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request failed: ${error.message}`);
      reject(error);
    });

    req.write(body);
    req.end();
  });
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('🚀 MailMint Postmark Webhook Test Suite');
  console.log('========================================');
  console.log(`🌐 Testing endpoint: ${BASE_URL}/webhooks/postmark/inbound`);
  console.log(`🔐 Using webhook secret: ${WEBHOOK_SECRET.substring(0, 10)}...`);
  
  try {
    // Test each email category
    await sendWebhookTest('finance', testPayloads.finance);
    await sendWebhookTest('product offer', testPayloads.productOffer);
    await sendWebhookTest('quotation', testPayloads.quotation);
    await sendWebhookTest('spam', testPayloads.spam);
    
    // Test security
    await testInvalidSignature();
    
    console.log('\\n🎉 All tests completed!');
    console.log('\\n📋 Expected Results:');
    console.log('✅ FINANCE, PRODUCT OFFER, QUOTATION → Should Process: YES');
    console.log('❌ SPAM → Should Process: NO');
    console.log('🔒 Invalid Signature → Rejected');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests, sendWebhookTest, generateSignature };
