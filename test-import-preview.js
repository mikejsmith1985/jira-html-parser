const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Open the HTML file
  const htmlPath = path.join(__dirname, 'link-generator.html');
  await page.goto('file://' + htmlPath);
  
  console.log('Page loaded, waiting for UI...');
  await page.waitForTimeout(2000);
  
  // Set up file chooser handler before clicking button
  const fileChooserPromise = page.waitForEvent('filechooser');
  
  // Click Import Config button
  console.log('Clicking Import Config button...');
  await page.click('button:has-text("Import Config")');
  
  // Handle file chooser
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, 'test-import.json'));
  
  console.log('JSON uploaded, waiting for preview modal...');
  await page.waitForTimeout(2000);
  
  // Wait for modal to appear
  const modalVisible = await page.waitForSelector('#importPreviewModal', { timeout: 5000 }).catch(() => null);
  
  if (!modalVisible) {
    console.log('ERROR: Modal did not appear!');
    await page.screenshot({ path: 'error-no-modal.png', fullPage: true });
    await browser.close();
    return;
  }
  
  console.log('Modal appeared!');
  
  // Check if fieldsList exists and has content
  const fieldsList = await page.locator('#fieldsList');
  const exists = await fieldsList.count() > 0;
  console.log('fieldsList exists:', exists);
  
  if (exists) {
    const fieldsListHTML = await fieldsList.innerHTML();
    console.log('fieldsList HTML length:', fieldsListHTML.length);
    console.log('fieldsList HTML preview:', fieldsListHTML.substring(0, 200));
    
    const fieldRows = await page.locator('#fieldsList div[data-field-index]').count();
    console.log('Number of field rows found:', fieldRows);
  }
  
  // Take screenshot of the modal
  await page.screenshot({ 
    path: 'import-preview-test.png',
    fullPage: true 
  });
  console.log('Screenshot saved as import-preview-test.png');
  
  // Keep browser open for manual inspection
  console.log('Browser will stay open for 5 seconds...');
  await page.waitForTimeout(5000);
  
  await browser.close();
  console.log('Test complete!');
})();
