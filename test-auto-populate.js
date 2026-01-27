const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console messages
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  const htmlPath = path.join(__dirname, 'link-generator.html');
  await page.goto('file://' + htmlPath);
  
  console.log('=== Step 1: Import test configuration ===');
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.click('button:has-text("Import Config")');
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, 'test-import.json'));
  
  await page.waitForTimeout(2000);
  
  // Click "Import Selected" in modal (assume all are selected by default)
  const importBtn = await page.locator('button:has-text("Import Selected")').first();
  if (await importBtn.count() > 0) {
    await importBtn.click();
    console.log('Clicked Import Selected');
    await page.waitForTimeout(1000);
  }
  
  console.log('\n=== Step 2: Select Base URL ===');
  await page.selectOption('#baseUrl', { index: 1 }); // Select first non-placeholder option
  await page.waitForTimeout(500);
  
  console.log('\n=== Step 3: Select Project ID ===');
  await page.selectOption('#projectId', { index: 1 });
  await page.waitForTimeout(500);
  
  console.log('\n=== Step 4: Select Issue Type ===');
  await page.selectOption('#issueType', { index: 1 });
  await page.waitForTimeout(2000); // Wait for auto-populate
  
  console.log('\n=== Step 5: Check field rows ===');
  const fieldRows = await page.locator('.field-row').count();
  console.log('Number of field rows:', fieldRows);
  
  // Check if any fields are populated
  for (let i = 0; i < Math.min(fieldRows, 5); i++) {
    const select = await page.locator('.field-row').nth(i).locator('.field-select').first();
    const value = await select.inputValue();
    const text = await select.locator('option:checked').textContent();
    console.log('Field ' + (i+1) + ':', text.trim());
  }
  
  await page.screenshot({ path: 'auto-populate-test.png', fullPage: true });
  console.log('\nScreenshot saved: auto-populate-test.png');
  
  await page.waitForTimeout(3000);
  await browser.close();
})();
