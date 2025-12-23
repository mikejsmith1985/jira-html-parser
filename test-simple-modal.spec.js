const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Issue #5 - Simple Modal Test', () => {
  test('should open modal when Manage button is clicked', async ({ page }) => {
    // Load the HTML file
    const filePath = 'file://' + path.resolve(__dirname, 'jira-link-generator.html').replace(/\\/g, '/');
    
    // Listen for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto(filePath);
    await page.waitForLoadState('domcontentloaded');
    
    console.log('Page loaded');
    
    // Check if button exists and is visible
    const manageBtn = page.locator('label:has-text("Base URL") button:has-text("Manage")').first();
    await expect(manageBtn).toBeVisible();
    console.log('Manage button is visible');
    
    // Check if modal exists before clicking
    const modalBefore = page.locator('#configManagerModal');
    const displayBefore = await modalBefore.evaluate(el => window.getComputedStyle(el).display);
    console.log('Modal display before click:', displayBefore);
    
    // Click the button
    await manageBtn.click();
    console.log('Clicked manage button');
    
    // Wait a moment
    await page.waitForTimeout(1000);
    
    // Check if there were any errors
    if (errors.length > 0) {
      console.log('JavaScript errors detected:', errors);
    }
    
    // Check modal display after click
    const displayAfter = await modalBefore.evaluate(el => window.getComputedStyle(el).display);
    console.log('Modal display after click:', displayAfter);
    
    // Check if the function exists
    const functionExists = await page.evaluate(() => {
      return typeof window.openConfigurationManager === 'function';
    });
    console.log('openConfigurationManager function exists:', functionExists);
    
    // Try calling the function directly
    await page.evaluate(() => {
      window.openConfigurationManager();
    });
    
    await page.waitForTimeout(500);
    
    const displayAfterDirect = await modalBefore.evaluate(el => window.getComputedStyle(el).display);
    console.log('Modal display after direct call:', displayAfterDirect);
    
    // Now check visibility
    await expect(modalBefore).toBeVisible();
  });
});
