// Simple test script to verify email functionality
// Run with: node test-email.js

const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('🧪 Testing email setup...');
  console.log('🔑 API Key present:', process.env.RESEND_API_KEY ? 'Yes' : 'No');
  
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
    console.log('❌ ERROR: No valid Resend API key found!');
    console.log('📝 Steps to fix:');
    console.log('1. Go to https://resend.com and create an account');
    console.log('2. Create an API key in the dashboard');
    console.log('3. Update .env.local with your real API key');
    console.log('4. Restart your development server');
    return;
  }
  
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['tal.gurevich@gmail.com'],
      subject: '🧪 Test Email from Fitness Booking System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #3b82f6;">✅ Email Test Successful!</h2>
          <p>This is a test email to verify your email configuration is working.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>If you received this email, your contact form will work correctly.</p>
        </div>
      `,
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Email ID:', result.data?.id);
    console.log('👀 Check your inbox (and spam folder) for the test email');
    
  } catch (error) {
    console.log('❌ Failed to send test email:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('💡 This looks like an API key issue. Make sure you:');
      console.log('   1. Have a valid Resend API key');
      console.log('   2. Updated .env.local with the correct key');
      console.log('   3. Restarted your development server');
    }
  }
}

testEmail();