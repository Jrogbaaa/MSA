import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

// Test EmailJS configuration and template mapping
export const testEmailJSConfiguration = async (): Promise<{
  success: boolean;
  message: string;
  details: string[];
}> => {
  const details: string[] = [];
  
  try {
    console.log('🧪 Testing EmailJS Configuration...');
    
    // Check environment variables
    if (!EMAILJS_SERVICE_ID) {
      return {
        success: false,
        message: 'Missing NEXT_PUBLIC_EMAILJS_SERVICE_ID',
        details: ['Check your .env.local file']
      };
    }
    
    if (!EMAILJS_TEMPLATE_ID) {
      return {
        success: false,
        message: 'Missing NEXT_PUBLIC_EMAILJS_TEMPLATE_ID',
        details: ['Check your .env.local file']
      };
    }
    
    if (!EMAILJS_PUBLIC_KEY) {
      return {
        success: false,
        message: 'Missing NEXT_PUBLIC_EMAILJS_PUBLIC_KEY',
        details: ['Check your .env.local file']
      };
    }
    
    details.push('✅ All environment variables configured');
    
    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);
    details.push('✅ EmailJS initialized successfully');
    
    // Test template parameters with correct mapping
    const testTemplateParams = {
      from_name: 'EmailJS Test User',
      from_email: 'test@example.com',
      to_email: 'arnoldestates1@gmail.com, 11jellis@gmail.com',
      subject: 'Test Email from MSA Properties',
      message: 'This is a test message to verify EmailJS template mapping is working correctly.',
      phone: '+44 20 1234 5678',
      source: 'EmailJS Configuration Test',
      submission_date: new Date().toLocaleString('en-GB'),
    };
    
    details.push('✅ Template parameters prepared with correct mapping:');
    details.push('   - from_name → {{from_name}} in template');
    details.push('   - from_email → {{from_email}} in template');
    details.push('   - subject → {{subject}} in template');
    details.push('   - message → {{message}} in template');
    details.push('   - phone → {{phone}} in template');
    details.push('   - source → {{source}} in template');
    details.push('   - submission_date → {{submission_date}} in template');
    
    console.log('📧 Sending test email with parameters:', testTemplateParams);
    
    // Send test email
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      testTemplateParams,
      EMAILJS_PUBLIC_KEY
    );
    
    details.push(`✅ Test email sent successfully (Status: ${result.status})`);
    details.push('📧 Check arnoldestates1@gmail.com and 11jellis@gmail.com for test email');
    
    return {
      success: true,
      message: 'EmailJS configuration test completed successfully',
      details
    };
    
  } catch (error: any) {
    console.error('EmailJS test error:', error);
    
    let errorMessage = 'EmailJS test failed';
    
    if (error.message?.includes('template')) {
      errorMessage = 'Template configuration error - check your EmailJS template variables';
      details.push('❌ Template Error: Make sure your EmailJS template uses the correct variables:');
      details.push('   Subject: Contact Us: {{subject}}');
      details.push('   Body should include: {{from_name}}, {{from_email}}, {{message}}, {{phone}}, etc.');
    } else if (error.message?.includes('service')) {
      errorMessage = 'EmailJS service configuration error';
      details.push('❌ Check your EmailJS service ID in the dashboard');
    } else if (error.message?.includes('key')) {
      errorMessage = 'EmailJS public key error';
      details.push('❌ Check your EmailJS public key in the dashboard');
    } else {
      details.push(`❌ Error: ${error.message}`);
    }
    
    return {
      success: false,
      message: errorMessage,
      details
    };
  }
};

// Test contact form email functionality
export const testContactFormEmail = async (): Promise<{
  success: boolean;
  message: string;
  details: string[];
}> => {
  const details: string[] = [];
  
  try {
    console.log('📝 Testing Contact Form Email...');
    
    const contactFormData = {
      name: 'Contact Form Test User',
      email: 'contact.test@example.com',
      subject: 'Test Contact Form Submission',
      message: 'This is a test contact form submission to verify the email template is working correctly with all user details.',
      phone: '+44 20 9876 5432',
      source: 'Contact Form Test'
    };
    
    // Import and use the actual sendContactEmail function
    const { sendContactEmail } = await import('./emailjs');
    
    const result = await sendContactEmail(contactFormData);
    
    if (result.success) {
      details.push('✅ Contact form email sent successfully');
      details.push('📧 Check for email with all contact details:');
      details.push(`   - Name: ${contactFormData.name}`);
      details.push(`   - Email: ${contactFormData.email}`);
      details.push(`   - Phone: ${contactFormData.phone}`);
      details.push(`   - Subject: ${contactFormData.subject}`);
      details.push(`   - Message: ${contactFormData.message}`);
      
      return {
        success: true,
        message: 'Contact form email test completed successfully',
        details
      };
    } else {
      details.push(`❌ Contact form email failed: ${result.error}`);
      return {
        success: false,
        message: 'Contact form email test failed',
        details
      };
    }
    
  } catch (error: any) {
    console.error('Contact form email test error:', error);
    return {
      success: false,
      message: 'Contact form email test failed',
      details: [`❌ Error: ${error.message}`]
    };
  }
};

// Test application notification email
export const testApplicationEmail = async (): Promise<{
  success: boolean;
  message: string;
  details: string[];
}> => {
  const details: string[] = [];
  
  try {
    console.log('🏠 Testing Application Email...');
    
    const applicationData = {
      propertyTitle: 'Test Property - 2 Bedroom Apartment',
      propertyAddress: '123 Test Street, Northampton, NN1 1AA',
      propertyRent: 2500,
      applicantName: 'Application Test User',
      applicantEmail: 'applicant.test@example.com',
      applicantPhone: '+44 20 5555 1234',
      userId: 'test_user_12345',
      propertyId: 'test_property_67890'
    };
    
    // Import and use the actual sendApplicationEmail function
    const { sendApplicationEmail } = await import('./emailjs');
    
    const result = await sendApplicationEmail(applicationData);
    
    if (result.success) {
      details.push('✅ Application email sent successfully');
      details.push('📧 Check for email with all application details:');
      details.push(`   - Property: ${applicationData.propertyTitle}`);
      details.push(`   - Address: ${applicationData.propertyAddress}`);
      details.push(`   - Rent: £${applicationData.propertyRent}/month`);
      details.push(`   - Applicant: ${applicationData.applicantName}`);
      details.push(`   - Contact: ${applicationData.applicantEmail}`);
      details.push(`   - Phone: ${applicationData.applicantPhone}`);
      
      return {
        success: true,
        message: 'Application email test completed successfully',
        details
      };
    } else {
      details.push(`❌ Application email failed: ${result.error}`);
      return {
        success: false,
        message: 'Application email test failed',
        details
      };
    }
    
  } catch (error: any) {
    console.error('Application email test error:', error);
    return {
      success: false,
      message: 'Application email test failed',
      details: [`❌ Error: ${error.message}`]
    };
  }
};

// Run all EmailJS tests
export const runAllEmailJSTests = async (): Promise<void> => {
  console.log('🧪 Running all EmailJS tests...');
  console.log('='.repeat(50));
  
  // Test 1: Configuration
  const configTest = await testEmailJSConfiguration();
  console.log(`\n📋 Configuration Test: ${configTest.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Message: ${configTest.message}`);
  configTest.details.forEach(detail => console.log(detail));
  
  if (!configTest.success) {
    console.log('\n⚠️ Skipping further tests due to configuration issues');
    return;
  }
  
  // Test 2: Contact Form
  const contactTest = await testContactFormEmail();
  console.log(`\n📝 Contact Form Test: ${contactTest.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Message: ${contactTest.message}`);
  contactTest.details.forEach(detail => console.log(detail));
  
  // Test 3: Application Email
  const appTest = await testApplicationEmail();
  console.log(`\n🏠 Application Email Test: ${appTest.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Message: ${appTest.message}`);
  appTest.details.forEach(detail => console.log(detail));
  
  console.log('\n' + '='.repeat(50));
  console.log('🧪 All EmailJS tests completed');
}; 