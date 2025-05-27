#!/usr/bin/env node

// Test script for Postmark webhook endpoint
const testPostmarkWebhook = async () => {
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

// Run the test
testPostmarkWebhook();
