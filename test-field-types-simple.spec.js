/**
 * Simple manual test for field types
 * Run with: npx playwright test test-field-types-simple.spec.js --headed
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const htmlPath = 'file:///' + path.resolve(__dirname, 'jira-link-generator.html').replace(/\\/g, '/');

test('debug combobox field', async ({ page }) => {
  await page.goto(htmlPath);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  
  // Add a field
  await page.click('text=Add Field');
  
  // Open field manager
  await page.click('.manage-fields-btn');
  
  //Wait for modal
  await page.waitForSelector('#fieldManagerModal[style*="flex"]');
  
  // Check if field type select exists
  const fieldTypeSelect = await page.locator('#fieldTypeSelect');
  await expect(fieldTypeSelect).toBeVisible();
  console.log('Field type select found');
  
  // Fill in the field
  await page.fill('#fieldIdInput', 'test_combo');
  await page.fill('#fieldLabelInput', 'Test Combo');
  await page.selectOption('#fieldTypeSelect', 'combobox');
  
  // Check if options section appears
  await page.waitForTimeout(500);
  const optionsSection = await page.locator('#comboboxOptionsSection');
  console.log('Options section display:', await optionsSection.evaluate(el => el.style.display));
  await expect(optionsSection).toBeVisible();
  
  // Add an option
  await page.fill('#optionLabelInput', 'Option 1');
  await page.fill('#optionValueInput', 'val1');
  await page.click('button:has-text("Add Option")');
  
  // Check if option appears in list
  await page.waitForTimeout(500);
  await expect(page.locator('text=Option 1 → val1')).toBeVisible();
  console.log('Option added successfully');
  
  // Save the field
  await page.click('#addFieldBtn');
  
  // Wait a bit
  await page.waitForTimeout(500);
  
  // Check localStorage
  const definitions = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('jiraFieldDefinitions') || '[]');
  });
  console.log('Saved definitions:', JSON.stringify(definitions, null, 2));
  
  // Close modal
  await page.click('button:has-text("Close")');
  
  // Select the field IN THE LAST ROW
  const lastFieldRow = page.locator('.field-row').last();
  await lastFieldRow.locator('.field-select').selectOption('test_combo');
  
  // Wait for render
  await page.waitForTimeout(1000);
  
  // Check what's in the value container of the LAST ROW
  const containerHTML = await lastFieldRow.locator('.editor-container').innerHTML();
  console.log('Container HTML:', containerHTML);
  
  // Look for select element in the last row
  const selectElement = await lastFieldRow.locator('.rich-value').count();
  console.log('Number of .rich-value elements:', selectElement);
  
  const isSelect = await lastFieldRow.locator('select.rich-value').count();
  console.log('Number of select.rich-value elements:', isSelect);
  
  if (isSelect > 0) {
    console.log('SUCCESS: Combobox rendered!');
  } else {
    console.log('FAIL: Combobox not rendered');
  }
});
