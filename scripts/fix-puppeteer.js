const fs = require('fs');

// Read the puppeteer test file
let content = fs.readFileSync('scripts/puppeteer-tour-test.js', 'utf8');

// Replace all waitForTimeout calls
content = content.replace(/await page\.waitForTimeout\((\d+)\)/g, 'await new Promise(resolve => setTimeout(resolve, $1))');

// Write the fixed content back
fs.writeFileSync('scripts/puppeteer-tour-test.js', content);

console.log('✅ Fixed all waitForTimeout calls in puppeteer-tour-test.js'); 