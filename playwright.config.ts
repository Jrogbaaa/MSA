import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Test timeout per test */
  timeout: 60 * 1000, // 60 seconds per test
  /* Expect timeout for assertions */
  expect: {
    timeout: 15 * 1000, // 15 seconds for assertions
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Default action timeout */
    actionTimeout: 15 * 1000, // 15 seconds for actions
    
    /* Default navigation timeout */
    navigationTimeout: 30 * 1000, // 30 seconds for navigation
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'desktop-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'desktop-safari',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'mobile',
      use: { 
        ...devices['iPhone 13'],
        // Increase timeouts for mobile tests
        actionTimeout: 20 * 1000,
        navigationTimeout: 45 * 1000,
      },
    },
    {
      name: 'mobile-android',
      use: { 
        ...devices['Pixel 5'],
        // Increase timeouts for mobile tests
        actionTimeout: 20 * 1000,
        navigationTimeout: 45 * 1000,
      },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
}); 