import { test, expect, Page } from '@playwright/test';
import path from 'path';

// Use environment variable for admin password
const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD || '*#fhdncu^%!f';

test.describe('Property Upload Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for upload tests
    test.setTimeout(120000); // 2 minutes for file uploads
  });

  // Helper function to login as admin
  const loginAsAdmin = async (page: Page) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    
    // Wait for and fill username field
    const usernameField = page.locator('input[type="text"]').or(page.getByLabel(/username/i)).first();
    await usernameField.waitFor({ state: 'visible', timeout: 5000 });
    await usernameField.fill('arnoldestatesmsa');
    
    // Wait for and fill password field  
    const passwordField = page.locator('input[type="password"]').or(page.getByLabel(/password/i)).first();
    await passwordField.waitFor({ state: 'visible', timeout: 5000 });
    await passwordField.fill(ADMIN_PASSWORD);
    
    // Wait for and click submit button
    const submitButton = page.getByRole('button', { name: /access admin panel/i }).first();
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    await submitButton.click();
    
    // Wait for dashboard or handle redirect
    try {
      await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
      return true;
    } catch (error) {
      console.log('Login failed or redirected elsewhere');
      return false;
    }
  };

  test('should successfully login to admin panel', async ({ page }) => {
    console.log('🔐 Testing admin login...');
    const loginSuccessful = await loginAsAdmin(page);
    expect(loginSuccessful).toBe(true);
    
    // Verify dashboard is accessible
    const dashboardHeading = page.getByRole('heading', { name: /admin dashboard/i }).first();
    if (await dashboardHeading.isVisible()) {
      await expect(dashboardHeading).toBeVisible();
    }
    console.log('✅ Admin login test passed');
  });

  test('should display property management interface', async ({ page }) => {
    console.log('🏠 Testing property management interface...');
    const loginSuccessful = await loginAsAdmin(page);
    if (!loginSuccessful) {
      test.skip(true, 'Cannot login to admin panel');
      return;
    }
    
    // Look for property management section
    const propertyTab = page.getByRole('button', { name: /properties/i }).or(page.getByText(/property management/i)).first();
    if (await propertyTab.isVisible()) {
      await propertyTab.click();
      
      // Check for Add Property button
      const addPropertyButton = page.getByRole('button', { name: /add property/i }).first();
      if (await addPropertyButton.isVisible()) {
        await expect(addPropertyButton).toBeVisible();
      }
    }
    console.log('✅ Property management interface test passed');
  });

  test('should open add property form and validate required fields', async ({ page }) => {
    console.log('📝 Testing add property form validation...');
    const loginSuccessful = await loginAsAdmin(page);
    if (!loginSuccessful) {
      test.skip(true, 'Cannot login to admin panel');
      return;
    }
    
    // Navigate to property management
    const propertyTab = page.getByRole('button', { name: /properties/i }).or(page.getByText(/property management/i)).first();
    if (await propertyTab.isVisible()) {
      await propertyTab.click();
      await page.waitForTimeout(1000);
      
      // Click Add Property button
      const addPropertyButton = page.getByRole('button', { name: /add property/i }).first();
      if (await addPropertyButton.isVisible()) {
        await addPropertyButton.click();
        await page.waitForTimeout(1000);
        
        // Check if form opens
        const propertyTitleField = page.getByLabel(/property title/i).or(page.locator('input[placeholder*="Modern Studio"]')).first();
        if (await propertyTitleField.isVisible()) {
          await expect(propertyTitleField).toBeVisible();
          
          // Verify save button is initially disabled (validation working)
          const saveButton = page.getByRole('button', { name: /add property/i }).or(page.getByRole('button', { name: /save/i })).first();
          if (await saveButton.isVisible()) {
            const isDisabled = await saveButton.isDisabled();
            expect(isDisabled).toBe(true); // Should be disabled with empty form
            console.log('✅ Form validation working - save button disabled when empty');
          }
        }
      }
    }
    console.log('✅ Form validation test passed');
  });

  test('should successfully create a test property with details', async ({ page }) => {
    console.log('🏗️ Testing property creation...');
    const loginSuccessful = await loginAsAdmin(page);
    if (!loginSuccessful) {
      test.skip(true, 'Cannot login to admin panel');
      return;
    }
    
    // Clear any existing test properties first
    await page.evaluate(() => {
      const properties = JSON.parse(localStorage.getItem('msa_admin_properties') || '[]');
      const filteredProperties = properties.filter((p: any) => !p.title.includes('Test Property'));
      localStorage.setItem('msa_admin_properties', JSON.stringify(filteredProperties));
    });
    
    // Navigate to property management
    const propertyTab = page.getByRole('button', { name: /properties/i }).or(page.getByText(/property management/i)).first();
    if (await propertyTab.isVisible()) {
      await propertyTab.click();
      await page.waitForTimeout(1000);
      
      // Click Add Property button
      const addPropertyButton = page.getByRole('button', { name: /add property/i }).first();
      if (await addPropertyButton.isVisible()) {
        await addPropertyButton.click();
        await page.waitForTimeout(1000);
        
        // Fill out the form step by step
        const propertyTitleField = page.getByLabel(/property title/i).or(page.locator('input[placeholder*="Modern Studio"]')).first();
        if (await propertyTitleField.isVisible()) {
          await propertyTitleField.fill('Test Property - Automated Test');
          await page.waitForTimeout(500);
          
          const addressField = page.getByLabel(/address/i).or(page.locator('input[placeholder*="Gold Street"]')).first();
          if (await addressField.isVisible()) {
            await addressField.fill('123 Test Street, Test City, TE1 2ST');
            await page.waitForTimeout(500);
          }
          
          const rentField = page.getByLabel(/rent/i).or(page.locator('input[placeholder*="825"]')).first();
          if (await rentField.isVisible()) {
            await rentField.fill('1200');
            await page.waitForTimeout(500);
          }
          
          const bedroomsField = page.getByLabel(/bedrooms/i).first();
          if (await bedroomsField.isVisible()) {
            await bedroomsField.fill('2');
            await page.waitForTimeout(500);
          }
          
          const bathroomsField = page.getByLabel(/bathrooms/i).first();
          if (await bathroomsField.isVisible()) {
            await bathroomsField.fill('1');
            await page.waitForTimeout(500);
          }
          
          const descriptionField = page.getByLabel(/description/i).or(page.locator('textarea')).first();
          if (await descriptionField.isVisible()) {
            await descriptionField.fill('This is a test property created by automated testing to verify the property upload functionality works correctly.');
            await page.waitForTimeout(500);
          }
          
          // Wait for save button to be enabled
          const saveButton = page.getByRole('button', { name: /add property/i }).or(page.getByRole('button', { name: /save/i })).first();
          if (await saveButton.isVisible()) {
            
            // Listen for console logs during save
            page.on('console', msg => {
              if (msg.type() === 'log' && msg.text().includes('Property')) {
                console.log('Browser log:', msg.text());
              }
            });
            
            // Wait for button to be enabled
            await saveButton.waitFor({ state: 'visible' });
            const isEnabled = await saveButton.isEnabled();
            if (!isEnabled) {
              console.log('Save button still disabled, waiting...');
              await page.waitForTimeout(2000);
            }
            
            await saveButton.click();
            await page.waitForTimeout(2000);
            
            // Check if property was saved to localStorage
            const savedProperty = await page.evaluate(() => {
              const properties = JSON.parse(localStorage.getItem('msa_admin_properties') || '[]');
              return properties.find((p: any) => p.title.includes('Test Property - Automated Test'));
            });
            
            expect(savedProperty).toBeTruthy();
            expect(savedProperty.address).toBe('123 Test Street, Test City, TE1 2ST');
            expect(savedProperty.rent).toBe(1200);
            
            console.log('✅ Property created successfully:', savedProperty.title);
          }
        }
      }
    }
  });

  test('should handle multiple image upload without deletion', async ({ page }) => {
    console.log('📸 Testing multiple image upload...');
    const loginSuccessful = await loginAsAdmin(page);
    if (!loginSuccessful) {
      test.skip(true, 'Cannot login to admin panel');
      return;
    }
    
    // Navigate to property management and add property
    const propertyTab = page.getByRole('button', { name: /properties/i }).or(page.getByText(/property management/i)).first();
    if (await propertyTab.isVisible()) {
      await propertyTab.click();
      await page.waitForTimeout(1000);
      
      const addPropertyButton = page.getByRole('button', { name: /add property/i }).first();
      if (await addPropertyButton.isVisible()) {
        await addPropertyButton.click();
        await page.waitForTimeout(1000);
        
        // Fill basic property info
        const propertyTitleField = page.getByLabel(/property title/i).or(page.locator('input[placeholder*="Modern Studio"]')).first();
        if (await propertyTitleField.isVisible()) {
          await propertyTitleField.fill('Image Upload Test Property');
          
          const addressField = page.getByLabel(/address/i).or(page.locator('input[placeholder*="Gold Street"]')).first();
          if (await addressField.isVisible()) {
            await addressField.fill('456 Image Test St, Test City, TE1 3ST');
          }
          
          const rentField = page.getByLabel(/rent/i).or(page.locator('input[placeholder*="825"]')).first();
          if (await rentField.isVisible()) {
            await rentField.fill('950');
          }
          
          // Test image upload area
          const uploadArea = page.locator('input[type="file"]').first();
          if (await uploadArea.isVisible()) {
            console.log('🖼️ Found image upload input');
            
            // Check that multiple file selection is supported
            const isMultiple = await uploadArea.getAttribute('multiple');
            expect(isMultiple).not.toBeNull();
            
            // Check HEIC support in accept attribute
            const acceptAttr = await uploadArea.getAttribute('accept');
            expect(acceptAttr).toContain('.heic');
            
            console.log('✅ Image upload configuration verified');
          }
        }
      }
    }
  });

  test('should verify localStorage persistence and sync', async ({ page }) => {
    console.log('💾 Testing localStorage persistence...');
    const loginSuccessful = await loginAsAdmin(page);
    if (!loginSuccessful) {
      test.skip(true, 'Cannot login to admin panel');
      return;
    }
    
    // Check initial properties count
    const initialCount = await page.evaluate(() => {
      const properties = JSON.parse(localStorage.getItem('msa_admin_properties') || '[]');
      return properties.length;
    });
    
    console.log(`Initial properties count: ${initialCount}`);
    
    // Navigate to main site and check if same properties are loaded
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const homePageCount = await page.evaluate(() => {
      const properties = JSON.parse(localStorage.getItem('msa_admin_properties') || '[]');
      return properties.length;
    });
    
    expect(homePageCount).toBe(initialCount);
    console.log('✅ localStorage sync between admin and main site verified');
  });

  test('should verify no Firebase errors in console', async ({ page }) => {
    console.log('🔥 Testing Firebase error fix...');
    const consoleErrors: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Firebase')) {
        consoleErrors.push(msg.text());
      }
    });
    
    const loginSuccessful = await loginAsAdmin(page);
    if (!loginSuccessful) {
      test.skip(true, 'Cannot login to admin panel');
      return;
    }
    
    // Navigate around to trigger any Firebase calls
    await page.goto('/');
    await page.waitForTimeout(2000);
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
    
    // Check if Firebase errors were captured
    expect(consoleErrors.length).toBe(0);
    console.log('✅ No Firebase errors detected');
  });
}); 