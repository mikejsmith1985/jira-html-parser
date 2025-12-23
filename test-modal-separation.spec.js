const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Modal Separation - Issue #7', () => {
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

  test('should have three separate modal elements in the DOM', async () => {
    const baseUrlModal = page.locator('#baseUrlManagerModal');
    const projectIdModal = page.locator('#projectIdManagerModal');
    const issueTypeModal = page.locator('#issueTypeIdManagerModal');
    
    await expect(baseUrlModal).toHaveCount(1);
    await expect(projectIdModal).toHaveCount(1);
    await expect(issueTypeModal).toHaveCount(1);
  });

  test('should not have old configManagerModal in the DOM', async () => {
    const oldModal = page.locator('#configManagerModal');
    await expect(oldModal).toHaveCount(0);
  });

  test('should have three separate manage buttons', async () => {
    const baseUrlBtn = page.locator('label:has-text("Base URL") button:has-text("Manage")');
    const projectIdBtn = page.locator('label:has-text("Project ID") button:has-text("Manage")');
    const issueTypeBtn = page.locator('label:has-text("Issue Type ID") button:has-text("Manage")');
    
    await expect(baseUrlBtn).toHaveCount(1);
    await expect(projectIdBtn).toHaveCount(1);
    await expect(issueTypeBtn).toHaveCount(1);
  });

  test('should use separate localStorage keys for each field', async () => {
    // Save data in each modal
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    let modal = page.locator('#baseUrlManagerModal');
    await modal.locator('#baseUrlAliasInput').fill('Test Base');
    await modal.locator('#baseUrlValueInput').fill('https://test.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    modal = page.locator('#projectIdManagerModal');
    await modal.locator('#projectIdAliasInput').fill('Test Project');
    await modal.locator('#projectIdValueInput').fill('TEST');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    await page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    modal = page.locator('#issueTypeIdManagerModal');
    await modal.locator('#issueTypeIdAliasInput').fill('Test Type');
    await modal.locator('#issueTypeIdValueInput').fill('99999');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    // Check that each has its own storage key
    const storageKeys = await page.evaluate(() => {
      return {
        baseUrls: localStorage.getItem('jiraSavedBaseUrls'),
        projectIds: localStorage.getItem('jiraSavedProjectIds'),
        issueTypes: localStorage.getItem('jiraSavedIssueTypes')
      };
    });
    
    expect(storageKeys.baseUrls).toBeTruthy();
    expect(storageKeys.projectIds).toBeTruthy();
    expect(storageKeys.issueTypes).toBeTruthy();
    
    const baseUrls = JSON.parse(storageKeys.baseUrls);
    const projectIds = JSON.parse(storageKeys.projectIds);
    const issueTypes = JSON.parse(storageKeys.issueTypes);
    
    expect(baseUrls[0].alias).toBe('Test Base');
    expect(projectIds[0].alias).toBe('Test Project');
    expect(issueTypes[0].alias).toBe('Test Type');
  });

  test('should not affect other modals when saving in one modal', async () => {
    // Save in base URL modal
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    let modal = page.locator('#baseUrlManagerModal');
    await modal.locator('#baseUrlAliasInput').fill('Base1');
    await modal.locator('#baseUrlValueInput').fill('https://base1.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    // Check that other storage keys are empty
    const storage = await page.evaluate(() => {
      return {
        projectIds: localStorage.getItem('jiraSavedProjectIds'),
        issueTypes: localStorage.getItem('jiraSavedIssueTypes')
      };
    });
    
    expect(storage.projectIds).toBeNull();
    expect(storage.issueTypes).toBeNull();
  });

  test('should maintain separate edit states for each modal', async () => {
    // Save items in all three modals
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    let modal = page.locator('#baseUrlManagerModal');
    await modal.locator('#baseUrlAliasInput').fill('Base1');
    await modal.locator('#baseUrlValueInput').fill('https://base1.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    modal = page.locator('#projectIdManagerModal');
    await modal.locator('#projectIdAliasInput').fill('Project1');
    await modal.locator('#projectIdValueInput').fill('PROJ1');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    // Start editing in Base URL modal
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    const baseUrlModal = page.locator('#baseUrlManagerModal');
    await baseUrlModal.locator('#baseUrlSavedList button:has-text("Edit")').first().click();
    await page.waitForTimeout(300);
    
    // Verify base URL modal is in edit mode
    await expect(baseUrlModal.locator('button:has-text("Update")')).toBeVisible();
    await expect(baseUrlModal.locator('#cancelBaseUrlBtn')).toBeVisible();
    
    // Close and open Project ID modal
    await baseUrlModal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    const projectIdModal = page.locator('#projectIdManagerModal');
    
    // Project ID modal should NOT be in edit mode
    await expect(projectIdModal.locator('button:has-text("Save")')).toBeVisible();
    await expect(projectIdModal.locator('button:has-text("Update")')).not.toBeVisible();
    
    const cancelBtn = projectIdModal.locator('#cancelProjectIdBtn');
    const cancelDisplay = await cancelBtn.evaluate(el => window.getComputedStyle(el).display);
    expect(cancelDisplay).toBe('none');
  });

  test('should populate only the corresponding dropdown for each modal', async () => {
    // Save in base URL modal
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    let modal = page.locator('#baseUrlManagerModal');
    await modal.locator('#baseUrlAliasInput').fill('Base1');
    await modal.locator('#baseUrlValueInput').fill('https://base1.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    // Check that only base URL dropdown is populated
    const baseUrlDropdown = page.locator('#baseUrl');
    const projectIdDropdown = page.locator('#projectId');
    const issueTypeDropdown = page.locator('#issueTypeId');
    
    const baseUrlOptions = await baseUrlDropdown.locator('option').allTextContents();
    const projectIdOptions = await projectIdDropdown.locator('option').allTextContents();
    const issueTypeOptions = await issueTypeDropdown.locator('option').allTextContents();
    
    expect(baseUrlOptions.some(opt => opt.includes('Base1'))).toBeTruthy();
    expect(projectIdOptions.every(opt => !opt.includes('Base1'))).toBeTruthy();
    expect(issueTypeOptions.every(opt => !opt.includes('Base1'))).toBeTruthy();
  });

  test('should delete from one modal without affecting others', async () => {
    // Save items in all three modals
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    let modal = page.locator('#baseUrlManagerModal');
    await modal.locator('#baseUrlAliasInput').fill('Base1');
    await modal.locator('#baseUrlValueInput').fill('https://base1.com');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    await page.locator('label:has-text("Project ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    modal = page.locator('#projectIdManagerModal');
    await modal.locator('#projectIdAliasInput').fill('Project1');
    await modal.locator('#projectIdValueInput').fill('PROJ1');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    await page.locator('label:has-text("Issue Type ID") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    modal = page.locator('#issueTypeIdManagerModal');
    await modal.locator('#issueTypeIdAliasInput').fill('Type1');
    await modal.locator('#issueTypeIdValueInput').fill('10001');
    await modal.locator('button:has-text("Save")').click();
    await page.waitForTimeout(300);
    await modal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    // Delete from base URL modal
    await page.locator('label:has-text("Base URL") button:has-text("Manage")').first().click();
    await page.waitForTimeout(300);
    const baseUrlModal = page.locator('#baseUrlManagerModal');
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await baseUrlModal.locator('#baseUrlSavedList button:has-text("Delete")').first().click();
    await page.waitForTimeout(500);
    await baseUrlModal.locator('button:has-text("Close")').click();
    await page.waitForTimeout(300);
    
    // Verify other modals still have their data
    const storage = await page.evaluate(() => {
      return {
        baseUrls: localStorage.getItem('jiraSavedBaseUrls'),
        projectIds: localStorage.getItem('jiraSavedProjectIds'),
        issueTypes: localStorage.getItem('jiraSavedIssueTypes')
      };
    });
    
    const baseUrls = JSON.parse(storage.baseUrls);
    const projectIds = JSON.parse(storage.projectIds);
    const issueTypes = JSON.parse(storage.issueTypes);
    
    expect(baseUrls.length).toBe(0);
    expect(projectIds.length).toBe(1);
    expect(issueTypes.length).toBe(1);
    expect(projectIds[0].alias).toBe('Project1');
    expect(issueTypes[0].alias).toBe('Type1');
  });

  test('should have independent function names for each modal', async () => {
    const functions = await page.evaluate(() => {
      return {
        openBaseUrlManager: typeof window.openBaseUrlManager,
        closeBaseUrlManager: typeof window.closeBaseUrlManager,
        saveBaseUrl: typeof window.saveBaseUrl,
        openProjectIdManager: typeof window.openProjectIdManager,
        closeProjectIdManager: typeof window.closeProjectIdManager,
        saveProjectId: typeof window.saveProjectId,
        openIssueTypeIdManager: typeof window.openIssueTypeIdManager,
        closeIssueTypeIdManager: typeof window.closeIssueTypeIdManager,
        saveIssueTypeId: typeof window.saveIssueTypeId
      };
    });
    
    expect(functions.openBaseUrlManager).toBe('function');
    expect(functions.closeBaseUrlManager).toBe('function');
    expect(functions.saveBaseUrl).toBe('function');
    expect(functions.openProjectIdManager).toBe('function');
    expect(functions.closeProjectIdManager).toBe('function');
    expect(functions.saveProjectId).toBe('function');
    expect(functions.openIssueTypeIdManager).toBe('function');
    expect(functions.closeIssueTypeIdManager).toBe('function');
    expect(functions.saveIssueTypeId).toBe('function');
  });

  test('should not have old openConfigurationManager function', async () => {
    const hasOldFunction = await page.evaluate(() => {
      return typeof window.openConfigurationManager === 'function';
    });
    
    expect(hasOldFunction).toBe(false);
  });
});
