const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Project ID Manager Modal - Issue #7', () => {
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

  test('should have Project ID Manage button that opens Project ID modal only', async () => {
    const manageBtn = page.locator('label:has-text("Project ID") button:has-text("Manage")').first();
    await expect(manageBtn).toBeVisible();
    
    await manageBtn.click();
    await page.waitForTimeout(300);
    
    const projectIdModal = page.locator('#projectIdManagerModal');
    await expect(projectIdModal).toBeVisible();
    
    const baseUrlModal = page.locator('#baseUrlManagerModal');
    const issueTypeModal = page.locator('#issueTypeIdManagerModal');
    
    const baseUrlDisplay = await baseUrlModal.evaluate(el => window.getComputedStyle(el).display);
    const issueTypeDisplay = await issueTypeModal.evaluate(el => window.getComputedStyle(el).display);
    
    expect(baseUrlDisplay).toBe('none');
    expect(issueTypeDisplay).toBe('none');
  });

  test('should display Project ID modal with correct title and structure', async () => {
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#projectIdManagerModal');
    await expect(modal).toBeVisible();
    
    await expect(modal.locator('h2')).toHaveText('Manage Project IDs');
    await expect(modal.locator('#projectIdAliasInput')).toBeVisible();
    await expect(modal.locator('#projectIdValueInput')).toBeVisible();
    await expect(modal.locator('button:has-text("Save")')).toBeVisible();
    await expect(modal.locator('#projectIdSavedList')).toBeVisible();
    await expect(modal.locator('button:has-text("Close")')).toBeVisible();
  });

  test('should close Project ID modal when Close button clicked', async () => {
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#projectIdManagerModal');
    await expect(modal).toBeVisible();
    
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    const display = await modal.evaluate(el => window.getComputedStyle(el).display);
    expect(display).toBe('none');
  });

  test('should save new project ID with alias', async () => {
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#projectIdManagerModal');
    
    await modal.locator('#projectIdAliasInput').fill('Main Project');
    await modal.locator('#projectIdValueInput').fill('PROJ');
    
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    const savedList = modal.locator('#projectIdSavedList');
    await expect(savedList.locator('text=Main Project')).toBeVisible();
    await expect(savedList.locator('text=PROJ').first()).toBeVisible();
    
    await expect(modal.locator('#projectIdAliasInput')).toHaveValue('');
    await expect(modal.locator('#projectIdValueInput')).toHaveValue('');
  });

  test('should validate Project ID format before saving', async () => {
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#projectIdManagerModal');
    
    await modal.locator('#projectIdAliasInput').fill('Invalid');
    await modal.locator('#projectIdValueInput').fill('invalid-chars!@#');
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('valid');
      await dialog.accept();
    });
    
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    const savedList = modal.locator('#projectIdSavedList');
    await expect(savedList.locator('text=invalid-chars')).not.toBeVisible();
  });

  test('should require both alias and value fields', async () => {
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#projectIdManagerModal');
    
    await modal.locator('#projectIdAliasInput').fill('Main Project');
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('fill in all fields');
      await dialog.accept();
    });
    
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
  });

  test('should populate dropdown with saved project IDs', async () => {
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#projectIdManagerModal');
    await modal.locator('#projectIdAliasInput').fill('Main Project');
    await modal.locator('#projectIdValueInput').fill('PROJ');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    const dropdown = page.locator('#projectId');
    const options = await dropdown.locator('option').allTextContents();
    
    expect(options.some(opt => opt.includes('Main Project'))).toBeTruthy();
    expect(options.some(opt => opt.includes('PROJ'))).toBeTruthy();
  });

  test('should edit existing project ID', async () => {
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#projectIdManagerModal');
    await modal.locator('#projectIdAliasInput').fill('Main Project');
    await modal.locator('#projectIdValueInput').fill('PROJ');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500);
    
    const editBtn = modal.locator('#projectIdSavedList button:has-text("Edit")').first();
    await editBtn.click();
    await page.waitForTimeout(300);
    
    await expect(modal.locator('#projectIdAliasInput')).toHaveValue('Main Project');
    await expect(modal.locator('#projectIdValueInput')).toHaveValue('PROJ');
    await expect(modal.locator('button:has-text("Update")')).toBeVisible();
    await expect(modal.locator('#cancelProjectIdBtn')).toBeVisible();
  });

  test('should delete project ID after confirmation', async () => {
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#projectIdManagerModal');
    await modal.locator('#projectIdAliasInput').fill('Main Project');
    await modal.locator('#projectIdValueInput').fill('PROJ');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500);
    
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    
    await modal.locator('#projectIdSavedList button:has-text("Delete")').first().click();
    await page.waitForTimeout(500);
    
    const savedList = modal.locator('#projectIdSavedList');
    await expect(savedList.locator('text=Main Project')).not.toBeVisible();
  });

  test('should persist project IDs to localStorage', async () => {
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#projectIdManagerModal');
    await modal.locator('#projectIdAliasInput').fill('Main Project');
    await modal.locator('#projectIdValueInput').fill('PROJ');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    
    const stored = await page.evaluate(() => {
      return localStorage.getItem('jiraSavedProjectIds');
    });
    
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
    expect(parsed[0].alias).toBe('Main Project');
    expect(parsed[0].value).toBe('PROJ');
    expect(parsed[0].id).toBeTruthy();
    expect(parsed[0].createdAt).toBeTruthy();
  });

  test('should apply project ID to dropdown when Use button clicked', async () => {
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#projectIdManagerModal');
    await modal.locator('#projectIdAliasInput').fill('Main Project');
    await modal.locator('#projectIdValueInput').fill('PROJ');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500);
    
    await modal.locator('#projectIdSavedList button:has-text("Use")').first().click();
    await page.waitForTimeout(300);
    
    const dropdown = page.locator('#projectId');
    const value = await dropdown.inputValue();
    expect(value).toBe('PROJ');
    
    const display = await modal.evaluate(el => window.getComputedStyle(el).display);
    expect(display).toBe('none');
  });
});
