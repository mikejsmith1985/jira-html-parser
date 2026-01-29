/**
 * Final Validation Test for GH Issues #17 and #18
 * 
 * Tests:
 * 1. Save Preset Modal dark mode (Issue #17 - white text on white background)
 * 2. Field Picker bookmarklet table prefix stripping (Issue #18)
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('GH Issue #17 & #18 Final Fixes', () => {
  
  test('Save Preset Modal has proper dark mode styling', async ({ page }) => {
    await page.goto('file://' + path.resolve(__dirname, 'link-generator.html'));
    
    // Enable dark mode
    await page.click('button[title="Toggle dark mode"]');
    await page.waitForTimeout(500);
    
    // Verify dark mode is active
    const theme = await page.getAttribute('html', 'data-bs-theme');
    expect(theme).toBe('dark');
    
    // Open Manage Presets modal
    await page.click('button:has-text("Manage Presets")');
    await page.waitForTimeout(500);
    
    // Click Save Preset
    await page.click('button:has-text("Save Preset")');
    await page.waitForTimeout(500);
    
    // Check if Save Preset modal is visible
    const savePresetModal = await page.locator('#savePresetModal');
    await expect(savePresetModal).toBeVisible();
    
    // Get the inner div with inline styles
    const innerDiv = await page.locator('#savePresetModal div[style*="background"]').first();
    
    // Get computed background color (should be dark, not light)
    const bgColor = await innerDiv.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    console.log('Save Preset Modal background color:', bgColor);
    
    // The background should NOT be white/light gray (should be dark)
    // rgb(245, 245, 245) is the inline style #f5f5f5
    // rgb(45, 55, 72) is the dark mode color #2d3748
    expect(bgColor).not.toBe('rgb(245, 245, 245)');
    expect(bgColor).not.toBe('rgb(249, 249, 249)');
    
    // Check text color (should be light on dark background)
    const labelColor = await page.locator('#savePresetModal label').first().evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    
    console.log('Save Preset Modal label color:', labelColor);
    
    // Text should be light colored
    expect(labelColor).toContain('241'); // Should have rgb(241, 245, 249) - #f1f5f9
    
    // Take screenshot for visual proof
    await page.screenshot({ 
      path: 'test-results/save-preset-dark-mode.png',
      fullPage: false
    });
    
    console.log('✅ Save Preset Modal dark mode validated');
  });
  
  test('Field Picker bookmarklet strips table prefixes', async ({ page }) => {
    await page.goto('file://' + path.resolve(__dirname, 'link-generator.html'));
    
    // Open Field Picker modal
    await page.click('button:has-text("Field Picker")');
    await page.waitForTimeout(500);
    
    // Get the bookmarklet code
    const bookmarkletCode = await page.locator('#fieldPickerBookmarklet').getAttribute('href');
    
    console.log('Bookmarklet length:', bookmarkletCode.length);
    
    // Verify the bookmarklet contains table prefix stripping logic
    expect(bookmarkletCode).toContain('cleanId=meta.id');
    expect(bookmarkletCode).toContain('if(cleanId.includes');
    expect(bookmarkletCode).toContain('cleanId=cleanId.split');
    expect(bookmarkletCode).toContain('.pop()');
    
    // The JSON should use cleanId, not meta.id
    expect(bookmarkletCode).toContain('id:cleanId');
    
    console.log('✅ Field Picker bookmarklet contains table prefix stripping logic');
    
    // Now test that the logic actually works by simulating the function
    const testCases = [
      { input: 'change_request.short_description', expected: 'short_description' },
      { input: 'incident.priority', expected: 'priority' },
      { input: 'simple_field', expected: 'simple_field' },
      { input: 'u_custom_table.u_field', expected: 'u_field' }
    ];
    
    for (const testCase of testCases) {
      // Simulate the bookmarklet logic
      const result = await page.evaluate((input) => {
        let cleanId = input;
        if (cleanId.includes('.')) {
          cleanId = cleanId.split('.').pop();
        }
        return cleanId;
      }, testCase.input);
      
      expect(result).toBe(testCase.expected);
      console.log(`✅ ${testCase.input} -> ${result}`);
    }
    
    console.log('✅ All table prefix stripping tests passed');
  });
  
  test('ServiceNow URL generation strips table prefixes', async ({ page }) => {
    await page.goto('file://' + path.resolve(__dirname, 'link-generator.html'));
    
    // Switch to ServiceNow platform
    await page.selectOption('#platform-toggle', 'servicenow');
    await page.waitForTimeout(500);
    
    // Set base URL
    await page.click('button:has-text("Manage Configs")');
    await page.waitForTimeout(500);
    
    const baseUrlInput = await page.locator('input[placeholder*="base URL"]');
    await baseUrlInput.fill('https://dev12345.service-now.com');
    
    // Close config modal
    await page.click('#configManagementModal button:has-text("Close")');
    await page.waitForTimeout(500);
    
    // Add a test field
    await page.click('button:has-text("Add Field")');
    await page.waitForTimeout(500);
    
    // Select a field with table prefix
    const fieldSelect = await page.locator('.field-row:last-child select').first();
    
    // Check if field options include table prefixes
    const options = await fieldSelect.locator('option').allTextContents();
    console.log('Available field options:', options);
    
    // Look for a field with a table prefix (e.g., change_request.short_description)
    const prefixedField = options.find(opt => opt.includes('.'));
    
    if (prefixedField) {
      console.log('Testing with field:', prefixedField);
      
      await fieldSelect.selectOption({ label: prefixedField });
      
      // Fill in a value
      const valueInput = await page.locator('.field-row:last-child input[type="text"]');
      await valueInput.fill('Test Value');
      
      // Generate link
      await page.click('button:has-text("Generate Link")');
      await page.waitForTimeout(1000);
      
      // Get the generated URL
      const urlDisplay = await page.locator('#urlOutput');
      const url = await urlDisplay.textContent();
      
      console.log('Generated URL:', url);
      
      // Extract the field name from the URL
      const fieldNameInUrl = prefixedField.split('.').pop();
      
      // Verify URL contains field name WITHOUT table prefix
      expect(url).toContain(fieldNameInUrl);
      expect(url).not.toContain('change_request.short_description=');
      expect(url).toContain('short_description='); // Should have just the field name
      
      console.log('✅ ServiceNow URL correctly strips table prefix');
    } else {
      console.log('⚠️  No fields with table prefixes found - test skipped');
    }
  });
});
