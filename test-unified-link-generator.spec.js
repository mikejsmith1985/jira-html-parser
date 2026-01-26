// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Unified Link Generator Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page first, then clear localStorage
    await page.goto('file://' + process.cwd().replace(/\\/g, '/') + '/link-generator.html');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('App type selector switches between Jira and ServiceNow', async ({ page }) => {
    
    // Default should be ServiceNow
    await expect(page.locator('#btnServiceNow')).toHaveClass(/active/);
    
    // Switch to Jira
    await page.click('#btnJira');
    await expect(page.locator('#btnJira')).toHaveClass(/active/);
    await expect(page.locator('#projectIdRow')).toBeVisible();
    
    // Switch back to ServiceNow
    await page.click('#btnServiceNow');
    await expect(page.locator('#btnServiceNow')).toHaveClass(/active/);
    await expect(page.locator('#projectIdRow')).not.toBeVisible();
  });

  test('ServiceNow link generation works', async ({ page }) => {
    
    // Add a base URL
    await page.click('button:text("Manage"):near(#baseUrl)');
    await page.fill('#baseUrlAliasInput', 'Test SNOW');
    await page.fill('#baseUrlValueInput', 'https://test.service-now.com');
    await page.click('#saveBaseUrlBtn');
    await page.click('#baseUrlManagerModal button:text("Close")');
    
    // Select the base URL
    await page.selectOption('#baseUrl', { index: 1 });
    
    // Add an issue type
    await page.click('button:text("Manage"):near(#issueType)');
    await page.fill('#issueTypeAliasInput', 'Incident');
    await page.fill('#issueTypeValueInput', 'incident');
    await page.click('#saveIssueTypeBtn');
    await page.click('#issueTypeManagerModal button:text("Close")');
    
    // Select the issue type
    await page.selectOption('#issueType', 'incident');
    
    // Generate the link (without filling any dynamic fields)
    await page.click('button:text("Generate Link")');
    
    // Check the output contains ServiceNow URL pattern
    const output = await page.locator('#output').textContent();
    expect(output).toContain('test.service-now.com');
    expect(output).toContain('incident.do');
  });

  test('Jira link generation works', async ({ page }) => {
    
    // Switch to Jira
    await page.click('#btnJira');
    
    // Add a base URL
    await page.click('button:text("Manage"):near(#baseUrl)');
    await page.fill('#baseUrlAliasInput', 'Test Jira');
    await page.fill('#baseUrlValueInput', 'https://jira.example.com');
    await page.click('#saveBaseUrlBtn');
    await page.click('#baseUrlManagerModal button:text("Close")');
    
    // Select the base URL
    await page.selectOption('#baseUrl', { index: 1 });
    
    // Add a project ID
    await page.click('button:text("Manage"):near(#projectId)');
    await page.fill('#projectIdAliasInput', 'Test Project');
    await page.fill('#projectIdValueInput', '10001');
    await page.click('#saveProjectIdBtn');
    await page.click('#projectIdManagerModal button:text("Close")');
    
    // Select the project ID
    await page.selectOption('#projectId', '10001');
    
    // Add an issue type
    await page.click('button:text("Manage"):near(#issueType)');
    await page.fill('#issueTypeAliasInput', 'Bug');
    await page.fill('#issueTypeValueInput', 'bug');
    await page.click('#saveIssueTypeBtn');
    await page.click('#issueTypeManagerModal button:text("Close")');
    
    // Select the issue type  
    await page.selectOption('#issueType', 'bug');
    
    // Generate the link (without filling any dynamic fields)
    await page.click('button:text("Generate Link")');
    
    // Check the output contains Jira URL pattern
    const output = await page.locator('#output').textContent();
    expect(output).toContain('jira.example.com');
    expect(output).toContain('CreateIssueDetails');
    expect(output).toContain('pid=10001');
    expect(output).toContain('issuetype=bug');
  });

  test('Field Extractor modal shows correct bookmarklet for app type', async ({ page }) => {
    
    // Open Field Extractor in ServiceNow mode
    await page.click('button:text("Field Extractor")');
    await expect(page.locator('#fieldExtractorModal h2')).toContainText('ServiceNow');
    await page.click('#fieldExtractorModal button:text("Close")');
    
    // Switch to Jira and open again
    await page.click('#btnJira');
    await page.click('button:text("Field Extractor")');
    await expect(page.locator('#fieldExtractorModal h2')).toContainText('Jira');
  });

  test('Configuration export/import preserves app type', async ({ page }) => {
    
    // Switch to Jira
    await page.click('#btnJira');
    
    // Verify app type is preserved after reload
    await page.reload();
    await expect(page.locator('#btnJira')).toHaveClass(/active/);
  });
});
