import emailjs from '@emailjs/browser';

// EmailJS configuration with fallback values
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

// Check if EmailJS is properly configured
const isEmailJSConfigured = () => {
  return EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY;
};

// Initialize EmailJS only if configured
export const initEmailJS = () => {
  if (isEmailJSConfigured()) {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error);
    }
  } else {
    console.warn('EmailJS not configured - missing environment variables. Email will fall back to mailto.');
  }
};

// Send contact form email to both addresses separately for guaranteed delivery
export const sendContactEmail = async (formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  source?: string;
}) => {
  // Check if EmailJS is configured
  if (!isEmailJSConfigured()) {
    console.log('EmailJS not configured, using mailto fallback');
    return { 
      success: false, 
      error: 'EmailJS not configured - using mailto fallback',
      fallbackReason: 'missing_config'
    };
  }

  try {
    const baseTemplateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      phone: formData.phone || 'Not provided',
      source: formData.source || 'Contact Form',
      submission_date: new Date().toLocaleString('en-GB'),
    };

    // Send to both email addresses separately to ensure delivery
    const email1Params = { ...baseTemplateParams, to_email: 'arnoldestates1@gmail.com' };
    const email2Params = { ...baseTemplateParams, to_email: '11jellis@gmail.com' };

    console.log('🚀 Sending contact email to both addresses...');
    
    // Send first email
    const result1 = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      email1Params,
      EMAILJS_PUBLIC_KEY
    );
    console.log('✅ Email sent to arnoldestates1@gmail.com:', result1);

    // Send second email
    const result2 = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      email2Params,
      EMAILJS_PUBLIC_KEY
    );
    console.log('✅ Email sent to 11jellis@gmail.com:', result2);

    return { success: true, result: { email1: result1, email2: result2 } };
  } catch (error) {
    console.error('EmailJS send error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown EmailJS error',
      fallbackReason: 'send_failed'
    };
  }
};

// Send application notification email to both addresses separately for guaranteed delivery
export const sendApplicationEmail = async (applicationData: {
  propertyTitle: string;
  propertyAddress: string;
  propertyRent: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  userId: string;
  propertyId: string;
}) => {
  // Check if EmailJS is configured
  if (!isEmailJSConfigured()) {
    console.log('EmailJS not configured, using mailto fallback');
    return { 
      success: false, 
      error: 'EmailJS not configured - using mailto fallback',
      fallbackReason: 'missing_config'
    };
  }

  try {
    const baseTemplateParams = {
      from_name: 'MSA Real Estate Website',
      from_email: 'noreply@msa-realestate.com',
      subject: `🏠 NEW APPLICATION: ${applicationData.propertyTitle} - ${applicationData.applicantName}`,
      message: `
NEW PROPERTY APPLICATION RECEIVED
=====================================

📍 PROPERTY DETAILS:
• Title: ${applicationData.propertyTitle}
• Address: ${applicationData.propertyAddress}
• Monthly Rent: £${applicationData.propertyRent}/month
• Property ID: ${applicationData.propertyId}

👤 APPLICANT INFORMATION:
• Name: ${applicationData.applicantName}
• Email: ${applicationData.applicantEmail}
• Phone: ${applicationData.applicantPhone}
• User ID: ${applicationData.userId}

📅 SUBMISSION:
• Date: ${new Date().toLocaleDateString('en-GB')}
• Time: ${new Date().toLocaleTimeString('en-GB')}

⚡ NEXT STEPS:
1. Review applicant information
2. Contact applicant via email or phone
3. Arrange property viewing if needed
4. Make rental decision

✅ This application was submitted through the MSA Real Estate website.
View admin dashboard: https://msaproperties.co.uk/admin/dashboard

Best regards,
MSA Real Estate Application System
      `,
      source: 'Property Application',
      submission_date: new Date().toLocaleString('en-GB'),
    };

    // Send to both email addresses separately to ensure delivery
    const email1Params = { ...baseTemplateParams, to_email: 'arnoldestates1@gmail.com' };
    const email2Params = { ...baseTemplateParams, to_email: '11jellis@gmail.com' };

    console.log('🚀 Sending application email to both addresses...');
    
    // Send first email
    const result1 = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      email1Params,
      EMAILJS_PUBLIC_KEY
    );
    console.log('✅ Application email sent to arnoldestates1@gmail.com:', result1);

    // Send second email
    const result2 = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      email2Params,
      EMAILJS_PUBLIC_KEY
    );
    console.log('✅ Application email sent to 11jellis@gmail.com:', result2);

    return { success: true, result: { email1: result1, email2: result2 } };
  } catch (error) {
    console.error('EmailJS application send error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown EmailJS error',
      fallbackReason: 'send_failed'
    };
  }
};

// Test email notifications to verify both addresses receive emails
export const testEmailNotifications = async () => {
  console.log('🧪 Testing email notification system...');
  
  try {
    // Test contact form email
    const contactResult = await sendContactEmail({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Email Notification Test',
      message: 'This is a test message to verify email notifications are working correctly for both addresses.',
      phone: '+44 1234 567890',
      source: 'Email Test'
    });

    // Test application email
    const applicationResult = await sendApplicationEmail({
      propertyTitle: 'Test Property',
      propertyAddress: '123 Test Street, Test City',
      propertyRent: 1000,
      applicantName: 'Test Applicant',
      applicantEmail: 'applicant@example.com',
      applicantPhone: '+44 9876 543210',
      userId: 'test-user-123',
      propertyId: 'test-property-456'
    });

    console.log('📧 Contact email test result:', contactResult);
    console.log('🏠 Application email test result:', applicationResult);

    return {
      contactEmail: contactResult,
      applicationEmail: applicationResult,
      success: contactResult.success && applicationResult.success
    };
  } catch (error) {
    console.error('❌ Email test failed:', error);
    return {
      contactEmail: { success: false, error: error },
      applicationEmail: { success: false, error: error },
      success: false
    };
  }
}; 