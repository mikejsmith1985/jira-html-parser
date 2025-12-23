const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Issue Type ID Manager Modal - Issue #7', () => {
  let page;
  const filePath = 'file://' + path.resolve(__dirname, 'jira-link-generator.html').replace(/\\/g, '/');

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
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

  test('should have Issue Type ID Manage button that opens Issue Type modal only', async () => {
    const manageBtn = page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first();
    await expect(manageBtn).toBeVisible();
    
    await manageBtn.click();
    await page.waitForTimeout(300);
    
    const issueTypeModal = page.locator('#issueTypeIdManagerModal');
    await expect(issueTypeModal).toBeVisible();
    
    const baseUrlModal = page.locator('#baseUrlManagerModal');
    const projectIdModal = page.locator('#projectIdManagerModal');
    
    const baseUrlDisplay = await baseUrlModal.evaluate(el => window.getComputedStyle(el).display);
    const projectIdDisplay = await projectIdModal.evaluate(el => window.getComputedStyle(el).display);
    
    expect(baseUrlDisplay).toBe('none');
    expect(projectIdDisplay).toBe('none');
  });

  test('should display Issue Type ID modal with correct title and structure', async () => {
    await page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#issueTypeIdManagerModal');
    await expect(modal).toBeVisible();
    
    await expect(modal.locator('h2')).toHaveText('Manage Issue Type IDs');
    await expect(modal.locator('#issueTypeIdAliasInput')).toBeVisible();
    await expect(modal.locator('#issueTypeIdValueInput')).toBeVisible();
    await expect(modal.locator('button:has-text("Save")')).toBeVisible();
    await expect(modal.locator('#issueTypeIdSavedList')).toBeVisible();
    await expect(modal.locator('button:has-text("Close")')).toBeVisible();
  });

  test('should close Issue Type ID modal when Close button clicked', async () => {
    await page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#issueTypeIdManagerModal');
    await expect(modal).toBeVisible();
    
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    const display = await modal.evaluate(el => window.getComputedStyle(el).display);
    expect(display).toBe('none');
  });

  test('should save new issue type ID with alias', async () => {
    await page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#issueTypeIdManagerModal');
    
    await modal.locator('#issueTypeIdAliasInput').fill('Bug');
    await modal.locator('#issueTypeIdValueInput').fill('10001');
    
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    const savedList = modal.locator('#issueTypeIdSavedList');
    await expect(savedList.locator('text=Bug')).toBeVisible();
    await expect(savedList.locator('text=10001')).toBeVisible();
    
    await expect(modal.locator('#issueTypeIdAliasInput')).toHaveValue('');
    await expect(modal.locator('#issueTypeIdValueInput')).toHaveValue('');
  });

  test('should validate Issue Type ID format before saving', async () => {
    await page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#issueTypeIdManagerModal');
    
    await modal.locator('#issueTypeIdAliasInput').fill('Invalid');
    await modal.locator('#issueTypeIdValueInput').fill('not-a-number');
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('valid');
      await dialog.accept();
    });
    
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    const savedList = modal.locator('#issueTypeIdSavedList');
    await expect(savedList.locator('text=not-a-number')).not.toBeVisible();
  });

  test('should require both alias and value fields', async () => {
    await page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#issueTypeIdManagerModal');
    
    await modal.locator('#issueTypeIdAliasInput').fill('Bug');
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('fill in all fields');
      await dialog.accept();
    });
    
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
  });

  test('should populate dropdown with saved issue type IDs', async () => {
    await page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#issueTypeIdManagerModal');
    await modal.locator('#issueTypeIdAliasInput').fill('Bug');
    await modal.locator('#issueTypeIdValueInput').fill('10001');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    const dropdown = page.locator('#issueTypeId');
    const options = await dropdown.locator('option').allTextContents();
    
    expect(options.some(opt => opt.includes('Bug'))).toBeTruthy();
    expect(options.some(opt => opt.includes('10001'))).toBeTruthy();
  });

  test('should edit existing issue type ID', async () => {
    await page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#issueTypeIdManagerModal');
    await modal.locator('#issueTypeIdAliasInput').fill('Bug');
    await modal.locator('#issueTypeIdValueInput').fill('10001');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500);
    
    const editBtn = modal.locator('#issueTypeIdSavedList button:has-text("Edit")').first();
    await editBtn.click();
    await page.waitForTimeout(300);
    
    await expect(modal.locator('#issueTypeIdAliasInput')).toHaveValue('Bug');
    await expect(modal.locator('#issueTypeIdValueInput')).toHaveValue('10001');
    await expect(modal.locator('button:has-text("Update")')).toBeVisible();
    await expect(modal.locator('#cancelIssueTypeIdBtn')).toBeVisible();
  });

  test('should delete issue type ID after confirmation', async () => {
    await page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#issueTypeIdManagerModal');
    await modal.locator('#issueTypeIdAliasInput').fill('Bug');
    await modal.locator('#issueTypeIdValueInput').fill('10001');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500);
    
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    
    await modal.locator('#issueTypeIdSavedList button:has-text("Delete")').first().click();
    await page.waitForTimeout(500);
    
    const savedList = modal.locator('#issueTypeIdSavedList');
    await expect(savedList.locator('text=Bug')).not.toBeVisible();
  });

  test('should persist issue type IDs to localStorage', async () => {
    await page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#issueTypeIdManagerModal');
    await modal.locator('#issueTypeIdAliasInput').fill('Bug');
    await modal.locator('#issueTypeIdValueInput').fill('10001');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    const stored = await page.evaluate(() => {
      return localStorage.getItem('jiraSavedIssueTypes');
    });
    
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
    expect(parsed[0].alias).toBe('Bug');
    expect(parsed[0].value).toBe('10001');
    expect(parsed[0].id).toBeTruthy();
    expect(parsed[0].createdAt).toBeTruthy();
  });

  test('should apply issue type ID to dropdown when Use button clicked', async () => {
    await page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#issueTypeIdManagerModal');
    await modal.locator('#issueTypeIdAliasInput').fill('Bug');
    await modal.locator('#issueTypeIdValueInput').fill('10001');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500);
    
    await modal.locator('#issueTypeIdSavedList button:has-text("Use")').first().click();
    await page.waitForTimeout(300);
    
    const dropdown = page.locator('#issueTypeId');
    const value = await dropdown.inputValue();
    expect(value).toBe('10001');
    
    const display = await modal.evaluate(el => window.getComputedStyle(el).display);
    expect(display).toBe('none');
  });
});
