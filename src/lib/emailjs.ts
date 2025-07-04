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

// Send contact form email
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
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      to_email: '11jellis@gmail.com',
      subject: formData.subject,
      message: formData.message,
      phone: formData.phone || 'Not provided',
      source: formData.source || 'Contact Form',
      submission_date: new Date().toLocaleString('en-GB'),
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('EmailJS send result:', result);
    return { success: true, result };
  } catch (error) {
    console.error('EmailJS send error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown EmailJS error',
      fallbackReason: 'send_failed'
    };
  }
};

// Send application notification email
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
    const templateParams = {
      from_name: 'MSA Real Estate Website',
      from_email: 'noreply@msa-realestate.com',
      to_email: '11jellis@gmail.com',
      subject: `New Property Application: ${applicationData.propertyTitle}`,
      message: `
NEW PROPERTY APPLICATION RECEIVED

Property Details:
- Title: ${applicationData.propertyTitle}
- Address: ${applicationData.propertyAddress}
- Rent: £${applicationData.propertyRent}/month

Applicant Information:
- Name: ${applicationData.applicantName}
- Email: ${applicationData.applicantEmail}
- Phone: ${applicationData.applicantPhone}

Application Details:
- User ID: ${applicationData.userId}
- Property ID: ${applicationData.propertyId}
- Submission Date: ${new Date().toLocaleString('en-GB')}

Please review this application and contact the applicant to arrange next steps.

Best regards,
MSA Real Estate Website
      `,
      source: 'Property Application',
      submission_date: new Date().toLocaleString('en-GB'),
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    return { success: true, result };
  } catch (error) {
    console.error('EmailJS application send error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown EmailJS error',
      fallbackReason: 'send_failed'
    };
  }
}; 