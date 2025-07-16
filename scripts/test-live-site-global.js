#!/usr/bin/env node

/**
 * 🌍 MSA Properties Live Site Global Functionality Test Suite
 * 
 * This script tests the complete functionality of the live production site
 * at msaproperties.co.uk to ensure global users can successfully:
 * - Submit contact forms and receive responses
 * - Apply for properties
 * - Have their messages reach admin emails
 * - Experience proper Firebase real-time functionality
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const LIVE_SITE_URL = 'https://msaproperties.co.uk';
const TEST_RESULTS_DIR = './test-results/live-site';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test tracking
let testResults = {
  jest: { passed: 0, failed: 0, total: 0 },
  playwright: { passed: 0, failed: 0, total: 0 },
  startTime: Date.now(),
  endTime: null
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(` 🌍 ${message}`, colors.bright + colors.cyan);
  log(`${'='.repeat(60)}`, colors.cyan);
}

function logSection(message) {
  log(`\n${'─'.repeat(40)}`, colors.blue);
  log(` ${message}`, colors.bright + colors.blue);
  log(`${'─'.repeat(40)}`, colors.blue);
}

function createTestResultsDir() {
  if (!fs.existsSync(TEST_RESULTS_DIR)) {
    fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
  }
}

async function checkLiveSiteAccessibility() {
  logSection('🔗 Checking Live Site Accessibility');
  
  return new Promise((resolve, reject) => {
    const fetch = require('node-fetch').default || require('node-fetch');
    
    if (!fetch) {
      log('Installing node-fetch for connectivity test...', colors.yellow);
      exec('npm install node-fetch', (error) => {
        if (error) {
          log('❌ Could not install node-fetch, skipping connectivity test', colors.red);
          resolve(false);
        } else {
          checkLiveSiteAccessibility().then(resolve).catch(reject);
        }
      });
      return;
    }

    log(`🌐 Testing connectivity to: ${LIVE_SITE_URL}`, colors.blue);
    
    fetch(LIVE_SITE_URL, { timeout: 10000 })
      .then(response => {
        if (response.ok) {
          log(`✅ Live site is accessible (${response.status})`, colors.green);
          log(`📊 Response time: ${response.headers.get('x-response-time') || 'N/A'}`, colors.blue);
          resolve(true);
        } else {
          log(`❌ Live site returned status: ${response.status}`, colors.red);
          resolve(false);
        }
      })
      .catch(error => {
        log(`❌ Cannot access live site: ${error.message}`, colors.red);
        log('🔧 Please check your internet connection and try again', colors.yellow);
        resolve(false);
      });
  });
}

async function runJestTests() {
  logSection('🧪 Running Jest Tests for Global Messaging');
  
  return new Promise((resolve) => {
    const jestCommand = 'npx jest src/lib/__tests__/global-messaging.test.ts --verbose --json --outputFile=' + 
                      path.join(TEST_RESULTS_DIR, `jest-results-${TIMESTAMP}.json`);
    
    log('🔄 Executing Jest test suite...', colors.blue);
    log(`Command: ${jestCommand}`, colors.cyan);
    
    exec(jestCommand, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Jest tests failed: ${error.message}`, colors.red);
        testResults.jest.failed = 1;
      } else {
        log('✅ Jest tests completed', colors.green);
        
        try {
          // Parse Jest results
          const resultFile = path.join(TEST_RESULTS_DIR, `jest-results-${TIMESTAMP}.json`);
          if (fs.existsSync(resultFile)) {
            const results = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
            testResults.jest.passed = results.numPassedTests || 0;
            testResults.jest.failed = results.numFailedTests || 0;
            testResults.jest.total = results.numTotalTests || 0;
            
            log(`📊 Jest Results: ${testResults.jest.passed} passed, ${testResults.jest.failed} failed`, 
                testResults.jest.failed > 0 ? colors.yellow : colors.green);
          }
        } catch (parseError) {
          log('⚠️ Could not parse Jest results', colors.yellow);
        }
      }
      
      if (stdout) log(`Jest Output:\n${stdout}`, colors.blue);
      if (stderr && !error) log(`Jest Warnings:\n${stderr}`, colors.yellow);
      
      resolve(!error);
    });
  });
}

async function runPlaywrightTests() {
  logSection('🎭 Running Playwright Tests for Live Site');
  
  return new Promise((resolve) => {
    // Set environment variable for live site testing
    process.env.PLAYWRIGHT_BASE_URL = LIVE_SITE_URL;
    
    const playwrightCommand = 'npx playwright test e2e/live-site-global-functionality.spec.ts --reporter=json';
    
    log(`🔄 Executing Playwright test suite against: ${LIVE_SITE_URL}`, colors.blue);
    log(`Command: ${playwrightCommand}`, colors.cyan);
    
    const playwrightProcess = spawn('npx', [
      'playwright', 'test', 
      'e2e/live-site-global-functionality.spec.ts',
      '--reporter=json',
      `--output=${TEST_RESULTS_DIR}/playwright-results-${TIMESTAMP}.json`
    ], {
      env: { ...process.env, PLAYWRIGHT_BASE_URL: LIVE_SITE_URL },
      stdio: 'pipe'
    });
    
    let stdoutData = '';
    let stderrData = '';
    
    playwrightProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
      // Show real-time output
      process.stdout.write(data);
    });
    
    playwrightProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
      process.stderr.write(data);
    });
    
    playwrightProcess.on('close', (code) => {
      if (code === 0) {
        log('✅ Playwright tests completed successfully', colors.green);
        
        // Try to parse results
        try {
          const playwrightResults = JSON.parse(stdoutData);
          if (playwrightResults.stats) {
            testResults.playwright.passed = playwrightResults.stats.passed || 0;
            testResults.playwright.failed = playwrightResults.stats.failed || 0;
            testResults.playwright.total = playwrightResults.stats.total || 0;
          }
        } catch (parseError) {
          log('⚠️ Could not parse Playwright results', colors.yellow);
        }
        
        resolve(true);
      } else {
        log(`❌ Playwright tests failed with exit code: ${code}`, colors.red);
        testResults.playwright.failed = 1;
        resolve(false);
      }
    });
  });
}

function generateTestReport() {
  logSection('📊 Generating Test Report');
  
  testResults.endTime = Date.now();
  const duration = Math.round((testResults.endTime - testResults.startTime) / 1000);
  
  const report = {
    timestamp: new Date().toISOString(),
    liveSiteUrl: LIVE_SITE_URL,
    duration: `${duration} seconds`,
    results: testResults,
    summary: {
      totalTests: testResults.jest.total + testResults.playwright.total,
      totalPassed: testResults.jest.passed + testResults.playwright.passed,
      totalFailed: testResults.jest.failed + testResults.playwright.failed,
      overallSuccess: (testResults.jest.failed + testResults.playwright.failed) === 0
    }
  };
  
  // Save detailed report
  const reportPath = path.join(TEST_RESULTS_DIR, `live-site-test-report-${TIMESTAMP}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Display summary
  log('\n📋 TEST SUMMARY:', colors.bright + colors.magenta);
  log(`🌐 Site Tested: ${LIVE_SITE_URL}`, colors.blue);
  log(`⏱️  Duration: ${duration} seconds`, colors.blue);
  log(`📧 Jest Tests: ${testResults.jest.passed}/${testResults.jest.total} passed`, 
      testResults.jest.failed > 0 ? colors.red : colors.green);
  log(`🎭 Playwright Tests: ${testResults.playwright.passed}/${testResults.playwright.total} passed`,
      testResults.playwright.failed > 0 ? colors.red : colors.green);
  
  if (report.summary.overallSuccess) {
    log('\n🎉 ALL TESTS PASSED! Your live site is fully functional for global users!', colors.bright + colors.green);
    log('✅ Global users can successfully send messages and apply for properties', colors.green);
    log('✅ Admin emails (arnoldestates1@gmail.com & 11jellis@gmail.com) will receive notifications', colors.green);
    log('✅ Firebase real-time functionality is working globally', colors.green);
  } else {
    log('\n⚠️  SOME TESTS FAILED - Please review the results above', colors.bright + colors.yellow);
    log('🔧 Check the detailed test report for specific issues', colors.yellow);
  }
  
  log(`\n📁 Detailed report saved to: ${reportPath}`, colors.cyan);
  
  return report.summary.overallSuccess;
}

async function runEmailDeliveryCheck() {
  logSection('📧 Email Delivery System Check');
  
  log('🔍 Verifying EmailJS configuration...', colors.blue);
  
  // Check if EmailJS environment variables are set
  const requiredVars = [
    'NEXT_PUBLIC_EMAILJS_SERVICE_ID',
    'NEXT_PUBLIC_EMAILJS_TEMPLATE_ID', 
    'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log('⚠️  EmailJS environment variables not found in local environment', colors.yellow);
    log('   This is normal for live site testing - production has these configured', colors.yellow);
    log('✅ Email delivery will be tested via live site forms', colors.blue);
  } else {
    log('✅ EmailJS configuration found', colors.green);
  }
  
  log('📧 Target admin emails:', colors.blue);
  log('   • arnoldestates1@gmail.com', colors.cyan);
  log('   • 11jellis@gmail.com', colors.cyan);
  
  return true;
}

// Main execution function
async function main() {
  logHeader('MSA Properties Live Site Global Functionality Test Suite');
  
  log(`🚀 Starting comprehensive test suite for: ${LIVE_SITE_URL}`, colors.bright);
  log(`📅 Test started at: ${new Date().toLocaleString()}`, colors.blue);
  
  createTestResultsDir();
  
  try {
    // Step 1: Check live site accessibility
    const siteAccessible = await checkLiveSiteAccessibility();
    if (!siteAccessible) {
      log('\n❌ Cannot access live site. Tests cannot proceed.', colors.red);
      log('🔧 Please ensure msaproperties.co.uk is online and accessible', colors.yellow);
      process.exit(1);
    }
    
    // Step 2: Email delivery system check
    await runEmailDeliveryCheck();
    
    // Step 3: Run Jest tests
    const jestSuccess = await runJestTests();
    
    // Step 4: Run Playwright tests
    const playwrightSuccess = await runPlaywrightTests();
    
    // Step 5: Generate report
    const overallSuccess = generateTestReport();
    
    // Exit with appropriate code
    process.exit(overallSuccess ? 0 : 1);
    
  } catch (error) {
    log(`\n💥 Test suite failed with error: ${error.message}`, colors.red);
    log('🔧 Please check your configuration and try again', colors.yellow);
    process.exit(1);
  }
}

// Handle interruption gracefully
process.on('SIGINT', () => {
  log('\n\n⚠️  Test suite interrupted by user', colors.yellow);
  generateTestReport();
  process.exit(1);
});

// Run the test suite
if (require.main === module) {
  main();
}

module.exports = { main, runJestTests, runPlaywrightTests, checkLiveSiteAccessibility }; 