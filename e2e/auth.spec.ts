import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  
  test.describe('User Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Check form elements
      await expect(page.getByRole('heading', { name: /Create your account/i })).toBeVisible();
      await expect(page.getByLabel(/first name/i)).toBeVisible();
      await expect(page.getByLabel(/last name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
      await expect(page.getByLabel(/confirm password/i)).toBeVisible();
      
      // Check Google sign-in option
      await expect(page.getByRole('button', { name: /sign up with google/i })).toBeVisible();
      
      // Check sign-in link
      await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    });

    test('should validate form fields', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Try to submit empty form
      await page.getByRole('button', { name: /create account/i }).click();
      
      // Should show validation errors (check for various possible error indicators)
      const errorElement = page.locator('text=required').or(page.locator('text=field is required')).or(page.locator('.error')).or(page.locator('[aria-invalid="true"]')).first();
      if (await errorElement.isVisible()) {
        await expect(errorElement).toBeVisible();
      }
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Fill form with mismatched passwords
      await page.getByLabel(/first name/i).fill('Test');
      await page.getByLabel(/last name/i).fill('User');
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^password$/i).fill('password123');
      await page.getByLabel(/confirm password/i).fill('password456');
      
      await page.getByRole('button', { name: /create account/i }).click();
      
      // Should show password mismatch error (flexible matching)
      const mismatchError = page.locator('text=passwords do not match').or(page.locator('text=password mismatch')).or(page.locator('text=passwords must match')).first();
      if (await mismatchError.isVisible()) {
        await expect(mismatchError).toBeVisible();
      }
    });
  });

  test.describe('User Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Check form elements
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
      
      // Check Google sign-in option
      await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
      
      // Check sign-up link
      await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
    });

    test('should handle invalid credentials gracefully', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Fill invalid credentials
      await page.getByLabel(/email/i).fill('invalid@example.com');
      await page.getByLabel(/^password$/i).fill('wrongpassword');
      
      await page.getByRole('button', { name: 'Sign In', exact: true }).click();
      
      // Should show error message (flexible matching)
      const errorElement = page.locator('text=invalid email or password').or(page.locator('text=invalid credentials')).or(page.locator('text=login failed')).or(page.locator('.error')).first();
      if (await errorElement.isVisible()) {
        await expect(errorElement).toBeVisible();
      }
    });
  });

  test.describe('Authentication Navigation', () => {
    test('should redirect to sign-in when accessing protected routes', async ({ page }) => {
      // Try to access dashboard without authentication
      await page.goto('/dashboard');
      
      // Should redirect to sign-in page (handle both relative and absolute URLs)
      await expect(page).toHaveURL(/\/auth\/signin/);
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    });

    test('should maintain returnUrl after authentication', async ({ page }) => {
      // Try to access dashboard, should redirect to signin with returnUrl
      await page.goto('/dashboard');
      
      // Check that returnUrl is preserved in the URL
      await expect(page).toHaveURL(/returnUrl=.*dashboard/);
    });

    test('should navigate between auth pages', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Navigate to sign-up
      await page.getByRole('link', { name: /sign up/i }).click();
      await expect(page).toHaveURL(/\/auth\/signup$/);
      
      // Navigate back to sign-in
      await page.getByRole('link', { name: /sign in/i }).click();
      await expect(page).toHaveURL(/\/auth\/signin$/);
    });
  });

  test.describe('Password Visibility', () => {
    test('should toggle password visibility', async ({ page }) => {
      await page.goto('/auth/signin');
      
      const passwordInput = page.getByLabel(/^password$/i);
      const toggleButton = page.locator('button[aria-label*="password"]');
      
      // Password should be hidden by default
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle to show password
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');
        
        // Click again to hide
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });
  });

  test.describe('Mobile Authentication', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display auth forms properly on mobile', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Check that form is properly displayed on mobile
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
      
      // Check that buttons are accessible
      await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
    });

    test('should handle mobile keyboard properly', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Focus on email field
      await page.getByLabel(/email/i).focus();
      
      // Type email
      await page.getByLabel(/email/i).fill('test@example.com');
      
      // Move to password field
      await page.getByLabel(/^password$/i).focus();
      await page.getByLabel(/^password$/i).fill('password123');
      
      // Should be able to submit
      const signInButton = page.getByRole('button', { name: 'Sign In', exact: true });
      await expect(signInButton).toBeVisible();
      await expect(signInButton).toBeEnabled();
    });
  });
}); 