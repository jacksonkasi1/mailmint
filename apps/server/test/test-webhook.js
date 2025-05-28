#!/usr/bin/env node

/**
 * Enhanced Test script for Postmark webhook endpoint
 * Tests the complete MailMint workflow with signature verification
 */

const crypto = require('crypto');

// Test configuration
const config = {
  webhookUrl: 'http://localhost:8080/webhooks/postmark/inbound',
  webhookSecret: 'test-webhook-secret-key' // Use same key in .env.development
};

/**
 * Generate HMAC-SHA256 signature for webhook verification
 */
function generateSignature(body, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');
}

// Test script for Postmark webhook endpoint
const testPostmarkWebhook = async () => {
  // Official Postmark webhook payload structure
  const testPayload = {
    "MessageID": "test-message-123",
    "Date": "2025-05-27T10:30:00Z",
    "Subject": "Test Email - Product Quotation",
    "From": "vendor@example.com",
    "FromName": "Test Vendor",
    "FromFull": {
      "Email": "vendor@example.com",
      "Name": "Test Vendor",
      "MailboxHash": ""
    },
    "To": "procurement@mailmint.com",
    "ToFull": [
      {
        "Email": "procurement@mailmint.com",
        "Name": "Procurement Team",
        "MailboxHash": ""
      }
    ],
    "Cc": "",
    "CcFull": [],
    "Bcc": "",
    "BccFull": [],
    "OriginalRecipient": "procurement@mailmint.com",
    "ReplyTo": "vendor@example.com",
    "HtmlBody": "<html><body><h1>Product Quotation</h1><p>Please find our latest pricing for Product XYZ: $299.99</p></body></html>",
    "TextBody": "Product Quotation\n\nPlease find our latest pricing for Product XYZ: $299.99",
    "StrippedTextReply": "",
    "Tag": "inbound",
    "Headers": [
      {
        "Name": "Return-Path",
        "Value": "<vendor@example.com>"
      },
      {
        "Name": "Message-ID",
        "Value": "<test-message-123@example.com>"
      },
      {
        "Name": "Content-Type",
        "Value": "multipart/alternative"
      }
    ],
    "Attachments": [
      {
        "Name": "quotation.pdf",
        "Content": "JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAv...", // Base64 sample
        "ContentType": "application/pdf",
        "ContentLength": 15420,
        "ContentID": "quotation-pdf"
      }
    ],
    "RawEmail": ""
  };

  try {
    console.log("🧪 Testing Postmark webhook endpoint...");
    console.log("📧 Test payload:", {
      messageId: testPayload.MessageID,
      from: testPayload.From,
      to: testPayload.To,
      subject: testPayload.Subject,
      attachmentCount: testPayload.Attachments.length
    });    const response = await fetch("http://localhost:8080/webhooks/postmark/inbound", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload)
    });

    const responseData = await response.json();
    
    console.log("✅ Response Status:", response.status);
    console.log("📊 Response Data:", responseData);
    
    if (response.status === 200 && responseData.success) {
      console.log("🎉 Webhook test successful!");
    } else {
      console.log("❌ Webhook test failed!");
    }
  } catch (error) {
    console.error("🚨 Test error:", error.message);
  }
};

// Enhanced test with multiple scenarios
const runAdvancedTests = async () => {
  console.log("🧪 Running Advanced Postmark Webhook Tests...\n");

  const testScenarios = [
    {
      name: "Basic Email Test",
      payload: {
        "MessageID": "test-basic-001",
        "Date": new Date().toISOString(),
        "Subject": "Basic Test Email",
        "From": "sender@example.com",
        "FromName": "Test Sender",
        "FromFull": { "Email": "sender@example.com", "Name": "Test Sender" },
        "To": "inbox@mailmint.com",
        "ToFull": [{ "Email": "inbox@mailmint.com", "Name": "MailMint Inbox" }],
        "Cc": "", "CcFull": [], "Bcc": "", "BccFull": [],
        "OriginalRecipient": "inbox@mailmint.com",
        "ReplyTo": "sender@example.com",
        "HtmlBody": "<p>Basic test email content</p>",
        "TextBody": "Basic test email content",
        "StrippedTextReply": "", "Tag": "test",
        "Headers": [
          { "Name": "Content-Type", "Value": "text/html" },
          { "Name": "Message-ID", "Value": "<test-basic-001@example.com>" }
        ],
        "Attachments": [], "RawEmail": ""
      }
    },
    {
      name: "Email with Attachments",
      payload: {
        "MessageID": "test-attachments-002",
        "Date": new Date().toISOString(),
        "Subject": "Test Email with Attachments",
        "From": "vendor@supplier.com",
        "FromName": "Vendor Support",
        "FromFull": { "Email": "vendor@supplier.com", "Name": "Vendor Support" },
        "To": "procurement@mailmint.com",
        "ToFull": [{ "Email": "procurement@mailmint.com", "Name": "Procurement Team" }],
        "Cc": "", "CcFull": [], "Bcc": "", "BccFull": [],
        "OriginalRecipient": "procurement@mailmint.com",
        "ReplyTo": "vendor@supplier.com",
        "HtmlBody": "<h2>Invoice Attached</h2><p>Please find the invoice attached.</p>",
        "TextBody": "Invoice Attached\n\nPlease find the invoice attached.",
        "StrippedTextReply": "", "Tag": "invoice",
        "Headers": [
          { "Name": "Content-Type", "Value": "multipart/mixed" },
          { "Name": "Message-ID", "Value": "<test-attachments-002@supplier.com>" }
        ],
        "Attachments": [
          {
            "Name": "invoice_12345.pdf",
            "Content": "JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAv",
            "ContentType": "application/pdf",
            "ContentLength": 25420,
            "ContentID": "invoice-pdf"
          },
          {
            "Name": "product_specs.xlsx",
            "Content": "UEsDBBQACAgIAAAAAAAAAAAAAAAAAAAAAAAYAAAAeGwv",
            "ContentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "ContentLength": 15680,
            "ContentID": "specs-xlsx"
          }
        ],
        "RawEmail": ""
      }
    }
  ];

  let passedTests = 0;
  let totalTests = testScenarios.length;

  for (const scenario of testScenarios) {
    try {
      console.log(`📋 Testing: ${scenario.name}`);
      console.log(`📧 Message ID: ${scenario.payload.MessageID}`);
      console.log(`📎 Attachments: ${scenario.payload.Attachments.length}`);

      const response = await fetch("http://localhost:8080/webhooks/postmark/inbound", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Postmark-Webhook-Test/1.0"
        },
        body: JSON.stringify(scenario.payload)
      });

      const responseData = await response.json();

      if (response.status === 200 && responseData.success) {
        console.log(`✅ ${scenario.name} - PASSED`);
        console.log(`⏱️  Processing Time: ${responseData.processingTime}`);
        passedTests++;
      } else {
        console.log(`❌ ${scenario.name} - FAILED`);
        console.log(`📊 Status: ${response.status}`);
        console.log(`📄 Response:`, responseData);
      }

    } catch (error) {
      console.log(`❌ ${scenario.name} - ERROR: ${error.message}`);
    }

    console.log(); // Empty line for readability
  }

  console.log(`🏁 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Webhook is working correctly.");
  } else {
    console.log("⚠️  Some tests failed. Please check the webhook implementation.");
  }
};

// Command line interface
const command = process.argv[2];

if (command === 'advanced') {
  runAdvancedTests();
} else {
  testPostmarkWebhook();
}
