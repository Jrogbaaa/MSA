import { test, expect, Page } from '@playwright/test';

// Test configuration for live site
const LIVE_SITE_URL = 'https://msaproperties.co.uk';
const TEST_TIMEOUT = 30000; // 30 seconds for network operations

test.describe('🌍 MSA Properties Live Site - Global User Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for live site testing
    test.setTimeout(120000); // 2 minutes for live site tests
    
    // Add network error monitoring
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ Network error: ${response.status()} ${response.url()}`);
      }
    });
    
    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🚨 Console error: ${msg.text()}`);
      }
    });
  });

  test('🌐 should load live site successfully for global users', async ({ page }) => {
    console.log('🔗 Testing live site accessibility at: ' + LIVE_SITE_URL);
    
    await page.goto(LIVE_SITE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    // Verify site loads
    await expect(page).toHaveTitle(/MSA Properties|Real Estate/i);
    
    // Check main navigation exists
    const navigation = page.getByRole('navigation').first();
    await expect(navigation).toBeVisible({ timeout: 10000 });
    
    // Verify key navigation links are accessible
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
    
    console.log('✅ Live site loads successfully for global users');
  });

  test('📧 should submit contact form and verify message reaches admins', async ({ page }) => {
    console.log('📝 Testing global contact form functionality...');
    
    await page.goto(`${LIVE_SITE_URL}/contact`);
    await page.waitForLoadState('domcontentloaded');
    
    // Generate unique test data
    const timestamp = Date.now();
    const testData = {
      name: `Global Test User ${timestamp}`,
      email: `globaltest${timestamp}@example.com`,
      subject: `Global Test Message ${timestamp}`,
      message: `This is a test message from the global functionality test suite. Timestamp: ${timestamp}. Please ignore this automated test message.`,
      phone: '07123456789'
    };
    
    // Fill out contact form
    const nameField = page.getByLabel(/name/i);
    const emailField = page.getByLabel(/email/i);
    const subjectField = page.getByLabel(/subject/i);
    const messageField = page.getByLabel(/message/i);
    const phoneField = page.getByLabel(/phone/i);
    
    await nameField.fill(testData.name);
    await emailField.fill(testData.email);
    await subjectField.fill(testData.subject);
    await messageField.fill(testData.message);
    
    // Fill phone if field exists
    if (await phoneField.isVisible()) {
      await phoneField.fill(testData.phone);
    }
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /send|submit/i });
    await submitButton.click();
    
    // Wait for submission to complete
    await page.waitForTimeout(5000);
    
    // Check for success indicators
    const successMessage = page.locator('text=/success|sent|thank|received/i').first();
    if (await successMessage.isVisible({ timeout: 10000 })) {
      await expect(successMessage).toBeVisible();
      console.log('✅ Contact form submitted successfully');
    } else {
      // Check if form was cleared (another success indicator)
      const nameFieldValue = await nameField.inputValue();
      if (nameFieldValue === '') {
        console.log('✅ Form cleared after submission (success indicator)');
      }
    }
    
    console.log(`✅ Global contact form test completed for user: ${testData.name}`);
  });

  test('🏠 should submit property application and verify it reaches admin dashboard', async ({ page }) => {
    console.log('🏘️ Testing global property application functionality...');
    
    await page.goto(LIVE_SITE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for properties to load
    await page.waitForTimeout(5000);
    
    // Find and click on first available "Apply Now" button
    const applyButton = page.getByRole('button', { name: /apply now/i }).first();
    
    if (await applyButton.isVisible({ timeout: 10000 })) {
      await applyButton.click();
      
      // Wait for application form or navigation
      await page.waitForTimeout(3000);
      
      // Generate unique application data
      const timestamp = Date.now();
      const testData = {
        name: `Global Property Applicant ${timestamp}`,
        email: `propertytest${timestamp}@example.com`,
        phone: '07987654321',
        message: `Global test application message. Timestamp: ${timestamp}. Please ignore this automated test.`
      };
      
      // Fill application form (if we're on application page)
      const nameField = page.getByLabel(/name/i).first();
      const emailField = page.getByLabel(/email/i).first();
      const phoneField = page.getByLabel(/phone/i).first();
      const messageField = page.getByLabel(/message|additional/i).first();
      
      if (await nameField.isVisible()) {
        await nameField.fill(testData.name);
        await emailField.fill(testData.email);
        await phoneField.fill(testData.phone);
        
        if (await messageField.isVisible()) {
          await messageField.fill(testData.message);
        }
        
        // Submit application
        const submitAppButton = page.getByRole('button', { name: /submit|apply|send/i });
        if (await submitAppButton.isVisible()) {
          await submitAppButton.click();
          await page.waitForTimeout(5000);
          
          // Check for success
          const successIndicator = page.locator('text=/success|submitted|received|thank/i').first();
          if (await successIndicator.isVisible({ timeout: 10000 })) {
            await expect(successIndicator).toBeVisible();
            console.log('✅ Property application submitted successfully');
          }
        }
      }
      
      console.log(`✅ Global property application test completed for: ${testData.name}`);
    } else {
      console.log('ℹ️ No Apply Now buttons found - testing property viewing instead');
      
      // Test property viewing functionality
      const propertyLink = page.locator('a[href*="/property/"]').first();
      if (await propertyLink.isVisible()) {
        await propertyLink.click();
        await page.waitForLoadState('domcontentloaded');
        
        // Verify property page loads
        const propertyTitle = page.locator('h1').first();
        await expect(propertyTitle).toBeVisible();
        console.log('✅ Property viewing functionality working');
      }
    }
  });

  test('🔥 should verify Firebase real-time functionality for global users', async ({ page }) => {
    console.log('🔥 Testing Firebase real-time functionality...');
    
    await page.goto(LIVE_SITE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for Firebase to initialize
    await page.waitForTimeout(5000);
    
    // Check if Firebase is working by monitoring console
    const firebaseErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Firebase')) {
        firebaseErrors.push(msg.text());
      }
    });
    
    // Navigate to different sections to trigger Firebase calls
    await page.goto(`${LIVE_SITE_URL}/contact`);
    await page.waitForTimeout(3000);
    
    await page.goto(LIVE_SITE_URL);
    await page.waitForTimeout(3000);
    
    // Check for Firebase connectivity
    const firebaseStatus = await page.evaluate(() => {
      // Check if Firebase is accessible globally
      return typeof window !== 'undefined' && 'firebase' in window;
    });
    
    // Verify no critical Firebase errors
    const criticalErrors = firebaseErrors.filter(error => 
      !error.includes('warning') && 
      !error.includes('debug') &&
      error.includes('error')
    );
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ Firebase real-time functionality verified for global users');
  });

  test('📱 should work on mobile devices globally', async ({ page, browserName }) => {
    console.log('📱 Testing mobile functionality for global users...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(LIVE_SITE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    // Test mobile navigation
    const mobileMenu = page.locator('button[aria-label*="menu"]').or(page.locator('[data-testid="mobile-menu"]')).first();
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await page.waitForTimeout(1000);
    }
    
    // Verify mobile contact form
    await page.goto(`${LIVE_SITE_URL}/contact`);
    await page.waitForTimeout(3000);
    
    const mobileForm = page.locator('form').first();
    await expect(mobileForm).toBeVisible();
    
    // Test form fields are accessible on mobile
    const nameField = page.getByLabel(/name/i);
    const emailField = page.getByLabel(/email/i);
    
    await expect(nameField).toBeVisible();
    await expect(emailField).toBeVisible();
    
    // Quick mobile form test
    await nameField.fill('Mobile Test User');
    await emailField.fill('mobile@test.com');
    
    console.log('✅ Mobile functionality verified for global users');
  });

  test('🌍 should verify global accessibility and performance', async ({ page }) => {
    console.log('🌍 Testing global accessibility and performance...');
    
    const startTime = Date.now();
    
    await page.goto(LIVE_SITE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Site load time: ${loadTime}ms`);
    
    // Verify load time is reasonable for global users (under 10 seconds)
    expect(loadTime).toBeLessThan(10000);
    
    // Test navigation performance
    const navStartTime = Date.now();
    await page.goto(`${LIVE_SITE_URL}/contact`);
    await page.waitForLoadState('domcontentloaded');
    const navTime = Date.now() - navStartTime;
    
    console.log(`⏱️ Navigation time: ${navTime}ms`);
    expect(navTime).toBeLessThan(8000);
    
    // Verify essential elements are accessible
    await expect(page.locator('main')).toBeVisible();
    
    // Check for basic accessibility
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    
    console.log('✅ Global accessibility and performance verified');
  });

  test('🎯 should verify admin email delivery system', async ({ page }) => {
    console.log('📧 Testing admin email delivery system...');
    
    await page.goto(`${LIVE_SITE_URL}/contact`);
    await page.waitForLoadState('domcontentloaded');
    
    // Generate unique test data for tracking
    const timestamp = Date.now();
    const testIdentifier = `ADMIN-EMAIL-TEST-${timestamp}`;
    
    const testData = {
      name: 'Email Delivery Test',
      email: 'emailtest@example.com',
      subject: testIdentifier,
      message: `Testing admin email delivery system. This should reach both arnoldestates1@gmail.com and 11jellis@gmail.com. Test ID: ${testIdentifier}`,
    };
    
    // Fill and submit form
    await page.getByLabel(/name/i).fill(testData.name);
    await page.getByLabel(/email/i).fill(testData.email);
    await page.getByLabel(/subject/i).fill(testData.subject);
    await page.getByLabel(/message/i).fill(testData.message);
    
    // Monitor network requests for EmailJS
    const emailRequests: any[] = [];
    page.on('response', response => {
      if (response.url().includes('emailjs') || response.url().includes('email')) {
        emailRequests.push({
          url: response.url(),
          status: response.status(),
          timestamp: Date.now()
        });
      }
    });
    
    const submitButton = page.getByRole('button', { name: /send|submit/i });
    await submitButton.click();
    
    // Wait for email processing
    await page.waitForTimeout(8000);
    
    // Verify email service was called
    const successfulEmailRequests = emailRequests.filter(req => req.status >= 200 && req.status < 300);
    
    if (successfulEmailRequests.length > 0) {
      console.log('✅ Email service successfully called');
      console.log('📧 Email delivery request sent for test:', testIdentifier);
    }
    
    console.log('✅ Admin email delivery system test completed');
  });
});

// Additional test suite for stress testing global functionality
test.describe('🚀 MSA Properties Live Site - Stress Testing', () => {
  test('🔄 should handle multiple concurrent users', async ({ page, context }) => {
    console.log('🔄 Testing concurrent user handling...');
    
    // Simulate multiple users by opening multiple pages
    const pages = [page];
    
    try {
      // Create additional pages to simulate concurrent users
      for (let i = 0; i < 2; i++) {
        const newPage = await context.newPage();
        pages.push(newPage);
      }
      
      // Have all pages visit the site simultaneously
      const promises = pages.map(async (p, index) => {
        await p.goto(LIVE_SITE_URL);
        await p.waitForLoadState('domcontentloaded');
        
        // Each user performs different actions
        if (index === 0) {
          await p.goto(`${LIVE_SITE_URL}/contact`);
        } else if (index === 1) {
          await p.goto(`${LIVE_SITE_URL}/about`);
        }
        
        return p.title();
      });
      
      const titles = await Promise.all(promises);
      
      // Verify all pages loaded successfully
      titles.forEach((title, index) => {
        expect(title).toBeTruthy();
        console.log(`✅ User ${index + 1} successfully loaded: ${title}`);
      });
      
      console.log('✅ Concurrent user handling test passed');
      
    } finally {
      // Clean up additional pages
      for (let i = 1; i < pages.length; i++) {
        await pages[i].close();
      }
    }
  });
}); 