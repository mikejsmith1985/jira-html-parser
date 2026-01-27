const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture all console messages
  page.on('console', msg => {
    const text = msg.text();
    console.log('BROWSER:', text);
  });
  
  const htmlPath = path.join(__dirname, 'link-generator.html');
  await page.goto('file://' + htmlPath);
  
  console.log('\n=== STEP 1: Import Configuration ===');
  await page.waitForTimeout(1000);
  
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.click('button:has-text("Import Config")');
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, 'test-import.json'));
  
  await page.waitForTimeout(2000);
  
  // Click Import Selected (all fields selected by default)
  await page.click('button:has-text("Import Selected")');
  console.log('Clicked Import Selected, waiting for page reload...');
  
  // Wait for alert and handle it
  page.on('dialog', async dialog => {
    console.log('Alert:', dialog.message());
    await dialog.accept();
  });
  
  // Wait for page reload
  await page.waitForTimeout(3000);
  
  console.log('\n=== STEP 2: After Import, Check Dropdowns ===');
  
  // Check if base URL dropdown has options
  const baseUrlOptions = await page.locator('#baseUrl option').count();
  console.log('Base URL dropdown options:', baseUrlOptions);
  
  if (baseUrlOptions > 1) {
    const baseUrlTexts = await page.locator('#baseUrl option').allTextContents();
    console.log('Base URL options:', baseUrlTexts);
  }
  
  // Check if issue type dropdown has options
  const issueTypeOptions = await page.locator('#issueType option').count();
  console.log('Issue Type dropdown options:', issueTypeOptions);
  
  if (issueTypeOptions > 1) {
    const issueTypeTexts = await page.locator('#issueType option').allTextContents();
    console.log('Issue Type options:', issueTypeTexts);
  }
  
  // Check if project ID dropdown has options
  const projectIdOptions = await page.locator('#projectId option').count();
  console.log('Project ID dropdown options:', projectIdOptions);
  
  if (projectIdOptions > 1) {
    const projectIdTexts = await page.locator('#projectId option').allTextContents();
    console.log('Project ID options:', projectIdTexts);
  }
  
  console.log('\n=== STEP 3: Try Selecting Dropdowns ===');
  
  if (baseUrlOptions > 1) {
    await page.selectOption('#baseUrl', { index: 1 });
    console.log('Selected first base URL option');
    await page.waitForTimeout(1000);
  }
  
  if (projectIdOptions > 1) {
    await page.selectOption('#projectId', { index: 1 });
    console.log('Selected first project ID option');
    await page.waitForTimeout(1000);
  }
  
  if (issueTypeOptions > 1) {
    await page.selectOption('#issueType', { index: 1 });
    console.log('Selected first issue type option');
    await page.waitForTimeout(2000);
  }
  
  console.log('\n=== STEP 4: Check Field Rows ===');
  const fieldRows = await page.locator('.field-row').count();
  console.log('Number of field rows:', fieldRows);
  
  await page.screenshot({ path: 'auto-populate-result.png', fullPage: true });
  console.log('\nScreenshot: auto-populate-result.png');
  
  await page.waitForTimeout(5000);
  await browser.close();
})();
