const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Issue #5 - Manage Buttons Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Load the HTML file
    const filePath = 'file://' + path.resolve(__dirname, 'jira-link-generator.html').replace(/\\/g, '/');
    await page.goto(filePath);
    
    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
  });

  test('should have visible Manage buttons for Base URL, Project ID, and Issue Type ID', async ({ page }) => {
    // Check Base URL Manage button
    const baseUrlManageBtn = page.locator('label:has-text("Base URL") button:has-text("Manage")');
    await expect(baseUrlManageBtn).toBeVisible();
    
    // Check Project ID Manage button
    const projectIdManageBtn = page.locator('label:has-text("Project ID") button:has-text("Manage")');
    await expect(projectIdManageBtn).toBeVisible();
    
    // Check Issue Type ID Manage button
    const issueTypeManageBtn = page.locator('label:has-text("Issue Type ID") button:has-text("Manage")');
    await expect(issueTypeManageBtn).toBeVisible();
  });

  test('should open Configuration Manager modal when Base URL Manage button is clicked', async ({ page }) => {
    const manageBtn = page.locator('label:has-text("Base URL") button:has-text("Manage")').first();
    await manageBtn.click();
    
    // Check if modal appears
    const modal = page.locator('#configManagerModal');
    await expect(modal).toBeVisible();
    
    // Check modal title
    await expect(page.locator('#configManagerModal h2')).toContainText('Configuration');
  });

  test('should open Configuration Manager modal when Project ID Manage button is clicked', async ({ page }) => {
    const manageBtn = page.locator('label:has-text("Project ID") button:has-text("Manage")').first();
    await manageBtn.click();
    
    const modal = page.locator('#configManagerModal');
    await expect(modal).toBeVisible();
  });

  test('should open Configuration Manager modal when Issue Type ID Manage button is clicked', async ({ page }) => {
    const manageBtn = page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first();
    await manageBtn.click();
    
    const modal = page.locator('#configManagerModal');
    await expect(modal).toBeVisible();
  });

  test('should allow saving a new configuration', async ({ page }) => {
    // Open modal
    const manageBtn = page.locator('label:has-text("Base URL") button:has-text("Manage")').first();
    await manageBtn.click();
    
    // Fill in configuration form
    await page.fill('#configAliasInput', 'Production Environment');
    await page.fill('#configBaseUrlInput', 'https://jira.example.com');
    await page.fill('#configProjectIdInput', '12345');
    await page.fill('#configIssueTypeIdInput', '10001');
    
    // Save configuration
    await page.click('button:has-text("Save Configuration")');
    
    // Wait for save operation and list refresh
    await page.waitForTimeout(500);
    
    // Check if the configuration appears in the saved list
    const savedList = page.locator('#savedConfigsList');
    await expect(savedList).toContainText('Production Environment');
    await expect(savedList).toContainText('https://jira.example.com');
  });

  test('should populate all three dropdowns when a configuration is used', async ({ page }) => {
    // First save a configuration
    const manageBtn = page.locator('label:has-text("Base URL") button:has-text("Manage")').first();
    await manageBtn.click();
    
    await page.fill('#configAliasInput', 'Test Config');
    await page.fill('#configBaseUrlInput', 'https://test.jira.com');
    await page.fill('#configProjectIdInput', '99999');
    await page.fill('#configIssueTypeIdInput', '88888');
    await page.click('button:has-text("Save Configuration")');
    
    await page.waitForTimeout(500);
    
    // Find and click "Use" button for this configuration
    const useBtn = page.locator('tr:has-text("Test Config") button:has-text("Use"), div:has-text("Test Config") button:has-text("Use")').first();
    await useBtn.click();
    
    // Verify all three dropdowns are populated
    const baseUrlValue = await page.locator('#baseUrl').inputValue();
    const projectIdValue = await page.locator('#projectId').inputValue();
    const issueTypeIdValue = await page.locator('#issueTypeId').inputValue();
    
    expect(baseUrlValue).toBe('https://test.jira.com');
    expect(projectIdValue).toBe('99999');
    expect(issueTypeIdValue).toBe('88888');
  });

  test('should not show HTML content below the UI', async ({ page }) => {
    // Get visible text (excluding script and style tags)
    const visibleText = await page.evaluate(() => {
      // Clone body and remove script/style elements
      const clone = document.body.cloneNode(true);
      clone.querySelectorAll('script, style').forEach(el => el.remove());
      return clone.textContent;
    });
    
    // Check that we don't see HTML tags or JavaScript code as visible text
    expect(visibleText).not.toContain('<html');
    expect(visibleText).not.toContain('<!DOCTYPE');
    expect(visibleText).not.toContain('function openConfigurationManager');
    expect(visibleText).not.toContain('localStorage.setItem');
  });

  test('should be able to delete a configuration', async ({ page }) => {
    // Save a configuration first
    const manageBtn = page.locator('label:has-text("Base URL") button:has-text("Manage")').first();
    await manageBtn.click();
    
    await page.fill('#configAliasInput', 'ToDelete123');
    await page.fill('#configBaseUrlInput', 'https://delete.me');
    await page.fill('#configProjectIdInput', '11111');
    await page.fill('#configIssueTypeIdInput', '22222');
    await page.click('button:has-text("Save Configuration")');
    
    await page.waitForTimeout(500);
    
    // Verify it's in the list
    const savedList = page.locator('#savedConfigsList');
    await expect(savedList).toContainText('ToDelete123');
    
    // Handle confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    
    // Now delete it - find the specific row and its delete button
    const deleteBtn = page.locator('#savedConfigsList div:has-text("ToDelete123") button:has-text("Delete")').first();
    await deleteBtn.click();
    
    await page.waitForTimeout(500);
    
    // Verify it's gone from the list
    await expect(savedList).not.toContainText('ToDelete123');
  });
});
