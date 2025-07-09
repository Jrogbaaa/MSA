#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Helper function to run command and return promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.cyan}${colors.bold}Running:${colors.reset} ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Main test runner function
async function runAllTests() {
  console.log(`${colors.magenta}${colors.bold}
╔══════════════════════════════════════════════════════════════╗
║                    MSA Properties Test Suite                 ║
║              Property Upload Functionality Testing           ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  const startTime = Date.now();
  let jestPassed = false;
  let playwrightPassed = false;

  try {
    // Step 1: Check test setup
    console.log(`\n${colors.blue}${colors.bold}📋 Checking test setup...${colors.reset}`);
    
    const requiredFiles = [
      'jest.config.js',
      'jest.setup.js',
      'playwright.config.ts',
      'src/lib/__tests__/properties.test.ts',
      'e2e/property-upload.spec.ts'
    ];

    for (const file of requiredFiles) {
      if (fileExists(file)) {
        console.log(`${colors.green}✅ ${file}${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  ${file} (optional)${colors.reset}`);
      }
    }

    // Step 2: Run Jest unit tests
    console.log(`\n${colors.blue}${colors.bold}🧪 Running Jest Unit Tests...${colors.reset}`);
    console.log(`${colors.cyan}Testing property management functions, Firebase integration, error handling${colors.reset}`);
    
    try {
      await runCommand('npm', ['run', 'test', '--', '--coverage', '--verbose']);
      jestPassed = true;
      console.log(`${colors.green}${colors.bold}✅ Jest unit tests passed!${colors.reset}`);
    } catch (error) {
      console.log(`${colors.red}${colors.bold}❌ Jest unit tests failed${colors.reset}`);
      console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    }

    // Step 3: Check if development server is running
    console.log(`\n${colors.blue}${colors.bold}🌐 Checking development server...${colors.reset}`);
    
    try {
      const { default: fetch } = await import('node-fetch');
      const response = await fetch('http://localhost:3000', { timeout: 5000 });
      if (response.ok) {
        console.log(`${colors.green}✅ Development server is running on localhost:3000${colors.reset}`);
      } else {
        throw new Error('Server not responding correctly');
      }
    } catch (error) {
      console.log(`${colors.yellow}⚠️  Development server not detected on localhost:3000${colors.reset}`);
      console.log(`${colors.yellow}   Please run 'npm run dev' in another terminal before E2E tests${colors.reset}`);
    }

    // Step 4: Install Playwright browsers if needed
    console.log(`\n${colors.blue}${colors.bold}🎭 Preparing Playwright...${colors.reset}`);
    
    try {
      await runCommand('npx', ['playwright', 'install', '--with-deps']);
      console.log(`${colors.green}✅ Playwright browsers ready${colors.reset}`);
    } catch (error) {
      console.log(`${colors.yellow}⚠️  Playwright browser setup skipped${colors.reset}`);
    }

    // Step 5: Run Playwright E2E tests
    console.log(`\n${colors.blue}${colors.bold}🎭 Running Playwright E2E Tests...${colors.reset}`);
    console.log(`${colors.cyan}Testing property upload flow, Firebase permissions, timeout handling, real-time sync${colors.reset}`);
    
    try {
      await runCommand('npm', ['run', 'test:e2e']);
      playwrightPassed = true;
      console.log(`${colors.green}${colors.bold}✅ Playwright E2E tests passed!${colors.reset}`);
    } catch (error) {
      console.log(`${colors.red}${colors.bold}❌ Playwright E2E tests failed${colors.reset}`);
      console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
      
      // Check if it's a server issue
      console.log(`\n${colors.yellow}💡 Troubleshooting tips:${colors.reset}`);
      console.log(`${colors.white}1. Make sure 'npm run dev' is running in another terminal${colors.reset}`);
      console.log(`${colors.white}2. Verify admin credentials are correct${colors.reset}`);
      console.log(`${colors.white}3. Check Firebase permissions are properly configured${colors.reset}`);
      console.log(`${colors.white}4. Run tests individually: npm run test:e2e -- --debug${colors.reset}`);
    }

    // Step 6: Generate test report
    console.log(`\n${colors.blue}${colors.bold}📊 Test Results Summary${colors.reset}`);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n${colors.white}Test execution time: ${duration}s${colors.reset}`);
    
    console.log(`\n${colors.bold}Results:${colors.reset}`);
    console.log(`${jestPassed ? colors.green + '✅' : colors.red + '❌'} Jest Unit Tests: ${jestPassed ? 'PASSED' : 'FAILED'}${colors.reset}`);
    console.log(`${playwrightPassed ? colors.green + '✅' : colors.red + '❌'} Playwright E2E Tests: ${playwrightPassed ? 'PASSED' : 'FAILED'}${colors.reset}`);
    
    // Overall result
    const allPassed = jestPassed && playwrightPassed;
    console.log(`\n${colors.bold}Overall Result: ${allPassed ? colors.green + '✅ ALL TESTS PASSED' : colors.red + '❌ SOME TESTS FAILED'}${colors.reset}`);
    
    if (allPassed) {
      console.log(`\n${colors.green}${colors.bold}🎉 Property upload functionality is working correctly!${colors.reset}`);
      console.log(`${colors.green}✓ Firebase integration stable${colors.reset}`);
      console.log(`${colors.green}✓ Error handling robust${colors.reset}`);
      console.log(`${colors.green}✓ UI/UX responsive${colors.reset}`);
      console.log(`${colors.green}✓ Real-time sync functional${colors.reset}`);
    } else {
      console.log(`\n${colors.yellow}🔧 Some tests failed - review logs above for specific issues${colors.reset}`);
    }

    // Generate coverage report location
    if (fileExists('coverage/lcov-report/index.html')) {
      console.log(`\n${colors.cyan}📋 Coverage report available: coverage/lcov-report/index.html${colors.reset}`);
    }

    // Generate Playwright report location
    if (fileExists('playwright-report/index.html')) {
      console.log(`${colors.cyan}📋 Playwright report available: playwright-report/index.html${colors.reset}`);
    }

    console.log(`\n${colors.magenta}${colors.bold}Testing complete!${colors.reset}\n`);
    
    // Exit with appropriate code
    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error(`${colors.red}${colors.bold}💥 Test runner failed:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Handle script arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${colors.bold}MSA Properties Test Runner${colors.reset}

Usage: node scripts/test-all.js [options]

Options:
  --help, -h          Show this help message
  --jest-only         Run only Jest unit tests
  --e2e-only          Run only Playwright E2E tests
  --no-coverage       Skip coverage report for Jest

Examples:
  node scripts/test-all.js              # Run all tests
  node scripts/test-all.js --jest-only  # Run only unit tests
  node scripts/test-all.js --e2e-only   # Run only E2E tests

Test Coverage:
  ✓ Property CRUD operations
  ✓ Firebase integration & fallbacks
  ✓ Image processing & HEIC support  
  ✓ Real-time synchronization
  ✓ Error handling & timeouts
  ✓ UI form validation
  ✓ Admin authentication flow
  ✓ Property upload end-to-end flow
`);
  process.exit(0);
}

// Run specific test suites based on arguments
if (args.includes('--jest-only')) {
  console.log(`${colors.blue}Running Jest tests only...${colors.reset}`);
  runCommand('npm', ['run', 'test', '--', '--coverage'])
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else if (args.includes('--e2e-only')) {
  console.log(`${colors.blue}Running Playwright E2E tests only...${colors.reset}`);
  runCommand('npm', ['run', 'test:e2e'])
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  // Run all tests
  runAllTests();
}

// Handle process termination
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}🛑 Test runner interrupted${colors.reset}`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log(`\n${colors.yellow}🛑 Test runner terminated${colors.reset}`);
  process.exit(1);
}); 