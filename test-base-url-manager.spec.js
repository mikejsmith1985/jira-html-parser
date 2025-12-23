const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Base URL Manager Modal - Issue #7', () => {
  let page;
  const filePath = 'file://' + path.resolve(__dirname, 'jira-link-generator.html').replace(/\\/g, '/');

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Clear localStorage before each test
    await page.goto(filePath);
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should have Base URL Manage button that opens Base URL modal only', async () => {
    const manageBtn = page.locator('label:has-text("Base URL") button:has-text("Manage")').first();
    await expect(manageBtn).toBeVisible();
    
    await manageBtn.click();
    await page.waitForTimeout(300);
    
    // Base URL modal should be visible
    const baseUrlModal = page.locator('#baseUrlManagerModal');
    await expect(baseUrlModal).toBeVisible();
    
    // Other modals should NOT be visible
    const projectIdModal = page.locator('#projectIdManagerModal');
    const issueTypeModal = page.locator('#issueTypeIdManagerModal');
    
    const projectIdDisplay = await projectIdModal.evaluate(el => window.getComputedStyle(el).display);
    const issueTypeDisplay = await issueTypeModal.evaluate(el => window.getComputedStyle(el).display);
    
    expect(projectIdDisplay).toBe('none');
    expect(issueTypeDisplay).toBe('none');
  });

  test('should display Base URL modal with correct title and structure', async () => {
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    await expect(modal).toBeVisible();
    
    // Check title
    await expect(modal.locator('h2')).toHaveText('Manage Base URLs');
    
    // Check for input fields
    await expect(modal.locator('#baseUrlAliasInput')).toBeVisible();
    await expect(modal.locator('#baseUrlValueInput')).toBeVisible();
    
    // Check for save button
    await expect(modal.locator('button:has-text("Save")')).toBeVisible();
    
    // Check for saved list
    await expect(modal.locator('#baseUrlSavedList')).toBeVisible();
    
    // Check for close button
    await expect(modal.locator('button:has-text("Close")')).toBeVisible();
  });

  test('should close Base URL modal when Close button clicked', async () => {
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    await expect(modal).toBeVisible();
    
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    const display = await modal.evaluate(el => window.getComputedStyle(el).display);
    expect(display).toBe('none');
  });

  test('should save new base URL with alias', async () => {
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    
    // Fill in form
    await modal.locator('#baseUrlAliasInput').fill('Production');
    await modal.locator('#baseUrlValueInput').fill('https://jira.company.com');
    
    // Save
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    // Check that item appears in saved list
    const savedList = modal.locator('#baseUrlSavedList');
    await expect(savedList.locator('text=Production')).toBeVisible();
    await expect(savedList.locator('text=https://jira.company.com')).toBeVisible();
    
    // Check that inputs are cleared
    await expect(modal.locator('#baseUrlAliasInput')).toHaveValue('');
    await expect(modal.locator('#baseUrlValueInput')).toHaveValue('');
  });

  test('should validate Base URL format before saving', async () => {
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    
    // Try to save invalid URL
    await modal.locator('#baseUrlAliasInput').fill('Invalid');
    await modal.locator('#baseUrlValueInput').fill('not-a-url');
    
    // Listen for alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('valid URL');
      await dialog.accept();
    });
    
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    // Item should NOT appear in saved list
    const savedList = modal.locator('#baseUrlSavedList');
    await expect(savedList.locator('text=not-a-url')).not.toBeVisible();
  });

  test('should require both alias and value fields', async () => {
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    
    // Try to save with only alias
    await modal.locator('#baseUrlAliasInput').fill('Production');
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('fill in all fields');
      await dialog.accept();
    });
    
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
  });

  test('should populate dropdown with saved base URLs', async () => {
    // Save a base URL
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    await modal.locator('#baseUrlAliasInput').fill('Production');
    await modal.locator('#baseUrlValueInput').fill('https://jira.company.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    // Close modal
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    // Check dropdown
    const dropdown = page.locator('#baseUrl');
    const options = await dropdown.locator('option').allTextContents();
    
    expect(options.some(opt => opt.includes('Production'))).toBeTruthy();
    expect(options.some(opt => opt.includes('https://jira.company.com'))).toBeTruthy();
  });

  test('should edit existing base URL', async () => {
    // Save a base URL first
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    await modal.locator('#baseUrlAliasInput').fill('Production');
    await modal.locator('#baseUrlValueInput').fill('https://jira.company.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500);
    
    // Click edit button
    const editBtn = modal.locator('#baseUrlSavedList button:has-text("Edit")').first();
    await editBtn.click();
    await page.waitForTimeout(300);
    
    // Check that form is populated
    await expect(modal.locator('#baseUrlAliasInput')).toHaveValue('Production');
    await expect(modal.locator('#baseUrlValueInput')).toHaveValue('https://jira.company.com');
    
    // Check that Save button changed to Update
    await expect(modal.locator('button:has-text("Update")')).toBeVisible();
    
    // Check that Cancel button is visible
    await expect(modal.locator('#cancelBaseUrlBtn')).toBeVisible();
  });

  test('should update base URL after editing', async () => {
    // Save a base URL first
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    await modal.locator('#baseUrlAliasInput').fill('Production');
    await modal.locator('#baseUrlValueInput').fill('https://jira.company.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500);
    
    // Click edit button
    await modal.locator('#baseUrlSavedList button:has-text("Edit")').first().click();
    await page.waitForTimeout(300);
    
    // Modify values
    await modal.locator('#baseUrlAliasInput').fill('Production Updated');
    await modal.locator('#baseUrlValueInput').fill('https://jira-new.company.com');
    
    // Click Update
    await modal.locator('button:has-text("Update")').click();
    await page.waitForTimeout(300);
    
    // Check that updated values appear in list
    const savedList = modal.locator('#baseUrlSavedList');
    await expect(savedList.locator('text=Production Updated')).toBeVisible();
    await expect(savedList.locator('text=https://jira-new.company.com')).toBeVisible();
    
    // Old value should not be there
    await expect(savedList.locator('text=https://jira.company.com')).not.toBeVisible();
  });

  test('should cancel edit and reset form', async () => {
    // Save a base URL first
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    await modal.locator('#baseUrlAliasInput').fill('Production');
    await modal.locator('#baseUrlValueInput').fill('https://jira.company.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500);
    
    // Click edit button
    await modal.locator('#baseUrlSavedList button:has-text("Edit")').first().click();
    await page.waitForTimeout(300);
    
    // Modify values
    await modal.locator('#baseUrlAliasInput').fill('Changed');
    
    // Click Cancel
    await modal.locator('#cancelBaseUrlBtn').click();
    await page.waitForTimeout(300);
    
    // Form should be cleared
    await expect(modal.locator('#baseUrlAliasInput')).toHaveValue('');
    await expect(modal.locator('#baseUrlValueInput')).toHaveValue('');
    
    // Save button should be visible again (not Update)
    await expect(modal.locator('button:has-text("Save")')).toBeVisible();
    await expect(modal.locator('button:has-text("Update")')).not.toBeVisible();
    
    // Cancel button should be hidden
    const cancelBtn = modal.locator('#cancelBaseUrlBtn');
    const cancelDisplay = await cancelBtn.evaluate(el => window.getComputedStyle(el).display);
    expect(cancelDisplay).toBe('none');
  });

  test('should delete base URL after confirmation', async () => {
    // Save a base URL first
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    await modal.locator('#baseUrlAliasInput').fill('Production');
    await modal.locator('#baseUrlValueInput').fill('https://jira.company.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500);
    
    // Listen for confirmation dialog
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    
    // Click delete button
    await modal.locator('#baseUrlSavedList button:has-text("Delete")').first().click();
    await page.waitForTimeout(500);
    
    // Item should be removed
    const savedList = modal.locator('#baseUrlSavedList');
    await expect(savedList.locator('text=Production')).not.toBeVisible();
  });

  test('should persist base URLs to localStorage', async () => {
    // Save a base URL
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    await modal.locator('#baseUrlAliasInput').fill('Production');
    await modal.locator('#baseUrlValueInput').fill('https://jira.company.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    // Check localStorage
    const stored = await page.evaluate(() => {
      return localStorage.getItem('jiraSavedBaseUrls');
    });
    
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
    expect(parsed[0].alias).toBe('Production');
    expect(parsed[0].value).toBe('https://jira.company.com');
    expect(parsed[0].id).toBeTruthy();
    expect(parsed[0].createdAt).toBeTruthy();
  });

  test('should load persisted base URLs on page load', async () => {
    // Set localStorage data
    await page.evaluate(() => {
      const data = [{
        id: 'base_url_12345',
        alias: 'Test Server',
        value: 'https://test.jira.com',
        createdAt: Date.now()
      }];
      localStorage.setItem('jiraSavedBaseUrls', JSON.stringify(data));
    });
    
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(300);
    
    // Open modal
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    // Check that item appears in list
    const modal = page.locator('#baseUrlManagerModal');
    const savedList = modal.locator('#baseUrlSavedList');
    await expect(savedList.locator('text=Test Server')).toBeVisible();
    await expect(savedList.locator('text=https://test.jira.com')).toBeVisible();
  });

  test('should show empty state when no base URLs saved', async () => {
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    const savedList = modal.locator('#baseUrlSavedList');
    
    // Should show empty message
    await expect(savedList.locator('text=No saved')).toBeVisible();
  });

  test('should apply base URL to dropdown when Use button clicked', async () => {
    // Save a base URL
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    await modal.locator('#baseUrlAliasInput').fill('Production');
    await modal.locator('#baseUrlValueInput').fill('https://jira.company.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500);
    
    // Click Use button
    await modal.locator('#baseUrlSavedList button:has-text("Use")').first().click();
    await page.waitForTimeout(300);
    
    // Check that dropdown value is set
    const dropdown = page.locator('#baseUrl');
    const value = await dropdown.inputValue();
    expect(value).toBe('https://jira.company.com');
    
    // Modal should close
    const display = await modal.evaluate(el => window.getComputedStyle(el).display);
    expect(display).toBe('none');
  });

  test('should not allow duplicate IDs in localStorage', async () => {
    // This tests the ID generation uniqueness
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#baseUrlManagerModal');
    
    // Save first item
    await modal.locator('#baseUrlAliasInput').fill('First');
    await modal.locator('#baseUrlValueInput').fill('https://first.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    // Save second item
    await modal.locator('#baseUrlAliasInput').fill('Second');
    await modal.locator('#baseUrlValueInput').fill('https://second.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    // Check localStorage has unique IDs
    const stored = await page.evaluate(() => {
      return localStorage.getItem('jiraSavedBaseUrls');
    });
    
    const parsed = JSON.parse(stored);
    const ids = parsed.map(item => item.id);
    const uniqueIds = [...new Set(ids)];
    
    expect(ids.length).toBe(uniqueIds.length);
  });
});
