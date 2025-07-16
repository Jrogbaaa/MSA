import { sendContactEmail, sendApplicationEmail, initEmailJS } from '../emailjs';
import { checkEnvironmentVariables } from '../emailjs-test';

// Mock EmailJS for testing
jest.mock('@emailjs/browser', () => ({
  init: jest.fn(),
  send: jest.fn(),
}));

describe('🌍 Global Messaging System Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID = 'service_rujk3lq';
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID = 'template_0npfw6f';
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = 'BLj0_NFd1zPr-t0-E';
  });

  describe('📧 Email Configuration Tests', () => {
    test('should have correct environment variables for global email delivery', () => {
      const result = checkEnvironmentVariables();
      expect(result).toBe(true);
    });

    test('should initialize EmailJS correctly for global access', () => {
      initEmailJS();
      
      const emailjs = require('@emailjs/browser');
      expect(emailjs.init).toHaveBeenCalledWith('BLj0_NFd1zPr-t0-E');
    });
  });

  describe('🌐 Contact Form Email Tests', () => {
    test('should send contact email to both admin addresses globally', async () => {
      const emailjs = require('@emailjs/browser');
      emailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const testData = {
        name: 'Global Test User',
        email: 'globaltest@example.com',
        subject: 'Global Test Message',
        message: 'Testing global message delivery',
        phone: '07123456789',
        source: 'Global Test Suite'
      };

      const result = await sendContactEmail(testData);

      expect(result.success).toBe(true);
      expect(emailjs.send).toHaveBeenCalledWith(
        'service_rujk3lq',
        'template_0npfw6f',
        expect.objectContaining({
          from_name: testData.name,
          from_email: testData.email,
          to_email: 'arnoldestates1@gmail.com, 11jellis@gmail.com',
          subject: testData.subject,
          message: testData.message,
          phone: testData.phone,
          source: testData.source,
          submission_date: expect.any(String),
        }),
        'BLj0_NFd1zPr-t0-E'
      );
    });

    test('should handle global email failures gracefully', async () => {
      const emailjs = require('@emailjs/browser');
      emailjs.send.mockRejectedValue(new Error('Network error - global connectivity issue'));

      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test Message'
      };

      const result = await sendContactEmail(testData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
      expect(result.fallbackReason).toBe('send_failed');
    });

    test('should include proper timestamp for global tracking', async () => {
      const emailjs = require('@emailjs/browser');
      emailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const testData = {
        name: 'Timestamp Test User',
        email: 'timestamp@example.com',
        subject: 'Timestamp Test',
        message: 'Testing timestamp functionality'
      };

      await sendContactEmail(testData);

      expect(emailjs.send).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          submission_date: expect.stringMatching(/\d{1,2}\/\d{1,2}\/\d{4}/)
        }),
        expect.any(String)
      );
    });
  });

  describe('🏠 Property Application Email Tests', () => {
    test('should send property application email to admins globally', async () => {
      const emailjs = require('@emailjs/browser');
      emailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const applicationData = {
        propertyTitle: 'Test Property - Global Application',
        propertyAddress: '123 Global Test Street, Test City, TE1 2ST',
        propertyRent: 1500,
        applicantName: 'Global Property Applicant',
        applicantEmail: 'applicant@global.test',
        applicantPhone: '07987654321',
        userId: 'global-test-user-123',
        propertyId: 'global-test-property-456'
      };

      const result = await sendApplicationEmail(applicationData);

      expect(result.success).toBe(true);
      expect(emailjs.send).toHaveBeenCalledWith(
        'service_rujk3lq',
        'template_0npfw6f',
        expect.objectContaining({
          from_name: 'MSA Real Estate Website',
          from_email: 'noreply@msa-realestate.com',
          to_email: 'arnoldestates1@gmail.com, 11jellis@gmail.com',
          subject: 'New Property Application: Test Property - Global Application',
          message: expect.stringContaining('NEW PROPERTY APPLICATION RECEIVED'),
          source: 'Property Application',
          submission_date: expect.any(String),
        }),
        'BLj0_NFd1zPr-t0-E'
      );

      // Verify the message contains all application details
      const callArgs = emailjs.send.mock.calls[0][2];
      expect(callArgs.message).toContain('Test Property - Global Application');
      expect(callArgs.message).toContain('123 Global Test Street');
      expect(callArgs.message).toContain('£1500/month');
      expect(callArgs.message).toContain('Global Property Applicant');
      expect(callArgs.message).toContain('applicant@global.test');
      expect(callArgs.message).toContain('07987654321');
    });

    test('should handle application email failures for global users', async () => {
      const emailjs = require('@emailjs/browser');
      emailjs.send.mockRejectedValue(new Error('Global service unavailable'));

      const applicationData = {
        propertyTitle: 'Test Property',
        propertyAddress: 'Test Address',
        propertyRent: 1000,
        applicantName: 'Test Applicant',
        applicantEmail: 'test@example.com',
        applicantPhone: '07123456789',
        userId: 'test-user',
        propertyId: 'test-property'
      };

      const result = await sendApplicationEmail(applicationData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Global service unavailable');
      expect(result.fallbackReason).toBe('send_failed');
    });
  });

  describe('🔧 Environment Configuration for Global Deployment', () => {
    test('should handle missing environment variables gracefully', () => {
      // Remove environment variables to simulate missing config
      delete process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      delete process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      delete process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      const result = checkEnvironmentVariables();
      expect(result).toBe(false);
    });

    test('should provide fallback mechanism for global users', async () => {
      // Remove environment variables
      delete process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;

      const testData = {
        name: 'Fallback Test User',
        email: 'fallback@example.com',
        subject: 'Fallback Test',
        message: 'Testing fallback mechanism'
      };

      const result = await sendContactEmail(testData);

      expect(result.success).toBe(false);
      expect(result.fallbackReason).toBe('missing_config');
      expect(result.error).toContain('EmailJS not configured');
    });
  });

  describe('🌍 Global Email Template Tests', () => {
    test('should format contact email properly for international recipients', async () => {
      const emailjs = require('@emailjs/browser');
      emailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const testData = {
        name: 'François Müller',
        email: 'francois.muller@example.com',
        subject: 'International Inquiry - Property Information',
        message: 'Hello, I am interested in your properties. I am relocating from Switzerland and would like more information.',
        phone: '+41 76 123 45 67',
        source: 'International Contact Form'
      };

      await sendContactEmail(testData);

      const callArgs = emailjs.send.mock.calls[0][2];
      expect(callArgs.from_name).toBe('François Müller');
      expect(callArgs.from_email).toBe('francois.muller@example.com');
      expect(callArgs.phone).toBe('+41 76 123 45 67');
      expect(callArgs.source).toBe('International Contact Form');
    });

    test('should handle application email with currency formatting for global users', async () => {
      const emailjs = require('@emailjs/browser');
      emailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const applicationData = {
        propertyTitle: 'Luxury Apartment in Central London',
        propertyAddress: '456 International House, London, SW1A 1AA',
        propertyRent: 2500,
        applicantName: 'Maria García',
        applicantEmail: 'maria.garcia@example.es',
        applicantPhone: '+34 123 456 789',
        userId: 'international-user-789',
        propertyId: 'london-luxury-apartment-123'
      };

      await sendApplicationEmail(applicationData);

      const callArgs = emailjs.send.mock.calls[0][2];
      expect(callArgs.message).toContain('£2500/month');
      expect(callArgs.message).toContain('Maria García');
      expect(callArgs.message).toContain('+34 123 456 789');
      expect(callArgs.message).toContain('maria.garcia@example.es');
    });
  });

  describe('⚡ Performance Tests for Global Users', () => {
    test('should complete email sending within reasonable time for global users', async () => {
      const emailjs = require('@emailjs/browser');
      
      // Simulate network delay for global users (2 seconds)
      emailjs.send.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ status: 200, text: 'OK' }), 2000)
        )
      );

      const testData = {
        name: 'Performance Test User',
        email: 'performance@example.com',
        subject: 'Performance Test',
        message: 'Testing email delivery performance for global users'
      };

      const startTime = Date.now();
      const result = await sendContactEmail(testData);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeGreaterThan(1900); // At least 2 seconds
      expect(endTime - startTime).toBeLessThan(3000); // Less than 3 seconds
    });

    test('should handle multiple concurrent email sends for global traffic', async () => {
      const emailjs = require('@emailjs/browser');
      emailjs.send.mockResolvedValue({ status: 200, text: 'OK' });

      const emailPromises = [];
      
      for (let i = 0; i < 5; i++) {
        const testData = {
          name: `Concurrent User ${i + 1}`,
          email: `concurrent${i + 1}@example.com`,
          subject: `Concurrent Test ${i + 1}`,
          message: `Testing concurrent email handling - User ${i + 1}`
        };
        
        emailPromises.push(sendContactEmail(testData));
      }

      const results = await Promise.all(emailPromises);

      // All emails should succeed
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
      });

      // EmailJS should have been called 5 times
      expect(emailjs.send).toHaveBeenCalledTimes(5);
    });
  });
}); 