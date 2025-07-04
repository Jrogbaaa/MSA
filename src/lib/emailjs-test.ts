// EmailJS Test Configuration
// This file verifies that the EmailJS setup is working correctly

import { sendContactEmail, initEmailJS } from './emailjs';

// Test EmailJS Configuration
export const testEmailJSConfig = async () => {
  console.log('🧪 Testing EmailJS Configuration...');
  
  // Initialize EmailJS
  initEmailJS();
  
  // Test email data
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'EmailJS Configuration Test',
    message: 'This is a test email to verify EmailJS is working correctly.',
    phone: '07123 456 789',
    source: 'Configuration Test'
  };
  
  try {
    const result = await sendContactEmail(testData);
    
    if (result.success) {
      console.log('✅ EmailJS Configuration Test PASSED');
      console.log('📧 Test email sent successfully to arnoldestates1@gmail.com');
      return true;
    } else {
      console.log('❌ EmailJS Configuration Test FAILED');
      console.log('Error:', result.error);
      console.log('Fallback reason:', result.fallbackReason);
      return false;
    }
  } catch (error) {
    console.error('❌ EmailJS Configuration Test ERROR:', error);
    return false;
  }
};

// Configuration Values for Reference
export const EMAIL_CONFIG = {
  SERVICE_ID: 'service_rujk3lq',
  TEMPLATE_ID: 'template_0npfw6f',
  PUBLIC_KEY: 'BLj0_NFd1zPr-t0-E',
  RECIPIENT: 'arnoldestates1@gmail.com'
};

// Check if all required environment variables are present
export const checkEnvironmentVariables = () => {
  const requiredVars = [
    'NEXT_PUBLIC_EMAILJS_SERVICE_ID',
    'NEXT_PUBLIC_EMAILJS_TEMPLATE_ID',
    'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing EmailJS environment variables:', missing);
    console.log('📋 Add these to your Vercel environment variables:');
    console.log('NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_rujk3lq');
    console.log('NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_0npfw6f');
    console.log('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=BLj0_NFd1zPr-t0-E');
    return false;
  }
  
  console.log('✅ All EmailJS environment variables are present');
  return true;
}; 