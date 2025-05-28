#!/usr/bin/env node

/**
 * Postmark Setup Script
 * Sets up inbound email processing for MailMint
 * @see https://postmarkapp.com/developer/user-guide/inbound
 */

const { postmarkService } = require('../src/services/postmark');
const { env } = require('../src/config/environment');

async function setupPostmarkInbound() {
  console.log('🔧 Setting up Postmark Inbound Email Processing...\n');

  try {
    // 1. Get server information
    console.log('📋 Getting server information...');
    const serverInfo = await postmarkService.getServerInfo();
    console.log(`✅ Server: ${serverInfo.Name}`);
    console.log(`📧 Inbound Address: ${serverInfo.InboundAddress}`);
    console.log(`🔑 Inbound Hash: ${serverInfo.InboundHash}`);
    console.log(`🌐 Current Webhook URL: ${serverInfo.InboundHookUrl || 'Not set'}\n`);

    // 2. Update webhook URL if needed
    if (env.POSTMARK_WEBHOOK_URL && serverInfo.InboundHookUrl !== env.POSTMARK_WEBHOOK_URL) {
      console.log('🔄 Updating webhook URL...');
      await postmarkService.updateWebhookUrl(env.POSTMARK_WEBHOOK_URL);
      console.log(`✅ Webhook URL updated to: ${env.POSTMARK_WEBHOOK_URL}\n`);
    }

    // 3. List existing inbound rules
    console.log('📝 Checking existing inbound rules...');
    const rules = await postmarkService.getInboundRules();
    console.log(`📊 Found ${rules.InboundRules?.length || 0} existing rules:`);
    
    if (rules.InboundRules && rules.InboundRules.length > 0) {
      rules.InboundRules.forEach((rule, index) => {
        console.log(`   ${index + 1}. ${rule.Rule} (${rule.TriggerType}) - ID: ${rule.ID}`);
      });
      console.log();
    }

    // 4. Create sample inbound rule (if none exist)
    if (!rules.InboundRules || rules.InboundRules.length === 0) {
      console.log('➕ Creating sample inbound rule...');
      const sampleRule = await postmarkService.createInboundRule({
        Rule: `${serverInfo.InboundHash}@inbound.postmarkapp.com`,
        TriggerType: 'EmailAddress'
      });
      console.log(`✅ Created rule: ${sampleRule.Rule}\n`);
    }

    // 5. Test webhook endpoint
    console.log('🧪 Testing webhook endpoint...');
    try {
      const testResponse = await fetch(`${env.POSTMARK_WEBHOOK_URL?.replace('/webhooks/postmark/inbound', '')}/health`);
      if (testResponse.ok) {
        console.log('✅ Webhook endpoint server is running');
      } else {
        console.log('⚠️  Webhook endpoint server may not be running');
      }
    } catch (error) {
      console.log('⚠️  Could not reach webhook endpoint server');
    }

    console.log('\n🎉 Postmark setup completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Configure your domain\'s DNS to point to Postmark');
    console.log('2. Verify your sending domain in Postmark');
    console.log('3. Test by sending an email to your inbound address');
    console.log(`4. Monitor webhook at: ${env.POSTMARK_WEBHOOK_URL}`);
    console.log('\n📚 Documentation: https://postmarkapp.com/developer/user-guide/inbound');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Check your POSTMARK_SERVER_TOKEN in .env.development');
    console.error('2. Ensure your Postmark server has inbound processing enabled');
    console.error('3. Verify your API tokens have the correct permissions');
    process.exit(1);
  }
}

// Add validation function
async function validatePostmarkConfig() {
  console.log('✅ Validating Postmark configuration...\n');

  const requiredEnvVars = [
    'POSTMARK_ACCOUNT_TOKEN',
    'POSTMARK_SERVER_TOKEN',
    'POSTMARK_WEBHOOK_URL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Please update your .env.development file');
    process.exit(1);
  }

  console.log('✅ All required environment variables are set');
}

// Add test email function
async function sendTestEmail() {
  console.log('📧 Sending test email...\n');

  try {
    const serverInfo = await postmarkService.getServerInfo();
    
    const testEmail = {
      From: 'test@mailmint.com',
      To: serverInfo.InboundAddress,
      Subject: 'Test Inbound Email - MailMint Integration',
      HtmlBody: `
        <h2>Test Inbound Email</h2>
        <p>This is a test email to verify MailMint's Postmark inbound integration.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Integration Status:</strong> Active</p>
      `,
      TextBody: `
        Test Inbound Email
        
        This is a test email to verify MailMint's Postmark inbound integration.
        
        Timestamp: ${new Date().toISOString()}
        Integration Status: Active
      `,
      Tag: 'mailmint-test'
    };

    const result = await postmarkService.sendEmail(testEmail);
    console.log(`✅ Test email sent successfully!`);
    console.log(`📧 Message ID: ${result.MessageID}`);
    console.log(`📬 Sent to: ${serverInfo.InboundAddress}`);
    console.log('\n💡 The email should trigger your webhook within a few moments.');

  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'setup':
      await validatePostmarkConfig();
      await setupPostmarkInbound();
      break;
    case 'test':
      await validatePostmarkConfig();
      await sendTestEmail();
      break;
    case 'validate':
      await validatePostmarkConfig();
      console.log('✅ Configuration is valid!');
      break;
    default:
      console.log('📋 Postmark Setup Script');
      console.log('\nUsage:');
      console.log('  node scripts/postmark-setup.js setup    - Set up Postmark inbound processing');
      console.log('  node scripts/postmark-setup.js test     - Send a test email');
      console.log('  node scripts/postmark-setup.js validate - Validate configuration');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupPostmarkInbound,
  validatePostmarkConfig,
  sendTestEmail
};
