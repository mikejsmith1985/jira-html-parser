const { test, expect } = require('@playwright/test');

test.describe('Legacy Data Migration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + __dirname + '/link-generator.html');
    
    // Clear all storage first
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('migrates Jira base URLs from legacy storage', async ({ page }) => {
    // Set up legacy Jira data
    await page.evaluate(() => {
      const legacyJiraUrls = [
        { id: '1', alias: 'Jira Dev', value: 'https://dev.atlassian.net' },
        { id: '2', alias: 'Jira Prod', value: 'https://prod.atlassian.net' }
      ];
      localStorage.setItem('jiraSavedBaseUrls', JSON.stringify(legacyJiraUrls));
    });

    // Switch to Jira mode
    await page.click('#btnJira');
    await page.waitForTimeout(500);

    // Check that base URLs were migrated
    const options = await page.locator('#baseUrl option').allTextContents();
    expect(options).toContain('Jira Dev: https://dev.atlassian.net');
    expect(options).toContain('Jira Prod: https://prod.atlassian.net');

    // Verify data was migrated to new key
    const migratedData = await page.evaluate(() => {
      return localStorage.getItem('linkGenJiraBaseUrls');
    });
    expect(migratedData).toBeTruthy();
    const parsed = JSON.parse(migratedData);
    expect(parsed).toHaveLength(2);
  });

  test('migrates ServiceNow base URLs from legacy storage', async ({ page }) => {
    // Set up legacy ServiceNow data
    await page.evaluate(() => {
      const legacySnowUrls = [
        { id: '1', alias: 'SNOW Dev', value: 'https://dev.service-now.com' },
        { id: '2', alias: 'SNOW Prod', value: 'https://prod.service-now.com' }
      ];
      localStorage.setItem('snowSavedBaseUrls', JSON.stringify(legacySnowUrls));
    });

    // Switch to ServiceNow mode
    await page.click('#btnServiceNow');
    await page.waitForTimeout(500);

    // Check that base URLs were migrated
    const options = await page.locator('#baseUrl option').allTextContents();
    expect(options).toContain('SNOW Dev: https://dev.service-now.com');
    expect(options).toContain('SNOW Prod: https://prod.service-now.com');

    // Verify data was migrated to new key
    const migratedData = await page.evaluate(() => {
      return localStorage.getItem('linkGenSnowBaseUrls');
    });
    expect(migratedData).toBeTruthy();
    const parsed = JSON.parse(migratedData);
    expect(parsed).toHaveLength(2);
  });

  test('migrates Jira issue types from legacy storage', async ({ page }) => {
    // Set up legacy Jira issue types
    await page.evaluate(() => {
      const legacyJiraTypes = [
        { id: '1', alias: 'Story', value: '10001' },
        { id: '2', alias: 'Bug', value: '10004' }
      ];
      localStorage.setItem('jiraSavedIssueTypes', JSON.stringify(legacyJiraTypes));
    });

    // Switch to Jira mode
    await page.click('#btnJira');
    await page.waitForTimeout(500);

    // Check that issue types were migrated
    const options = await page.locator('#issueType option').allTextContents();
    expect(options).toContain('Story: 10001');
    expect(options).toContain('Bug: 10004');

    // Verify data was migrated to new key
    const migratedData = await page.evaluate(() => {
      return localStorage.getItem('linkGenJiraIssueTypes');
    });
    expect(migratedData).toBeTruthy();
    const parsed = JSON.parse(migratedData);
    expect(parsed).toHaveLength(2);
  });

  test('migrates ServiceNow issue types from legacy storage', async ({ page }) => {
    // Set up legacy ServiceNow issue types (old key: snowSavedTableNames)
    await page.evaluate(() => {
      const legacySnowTypes = [
        { id: '1', alias: 'Incident', value: 'incident' },
        { id: '2', alias: 'Change Request', value: 'change_request' }
      ];
      localStorage.setItem('snowSavedIssueTypes', JSON.stringify(legacySnowTypes));
    });

    // Switch to ServiceNow mode
    await page.click('#btnServiceNow');
    await page.waitForTimeout(500);

    // Check that issue types were migrated
    const options = await page.locator('#issueType option').allTextContents();
    expect(options).toContain('Incident: incident');
    expect(options).toContain('Change Request: change_request');
  });

  test('migrates Jira project IDs from legacy storage', async ({ page }) => {
    // Set up legacy Jira project IDs
    await page.evaluate(() => {
      const legacyJiraProjects = [
        { id: '1', alias: 'MYAPP', value: '12345' },
        { id: '2', alias: 'TOOLS', value: '67890' }
      ];
      localStorage.setItem('jiraSavedProjectIds', JSON.stringify(legacyJiraProjects));
    });

    // Switch to Jira mode
    await page.click('#btnJira');
    await page.waitForTimeout(500);

    // Check that project IDs were migrated
    const options = await page.locator('#projectId option').allTextContents();
    expect(options).toContain('MYAPP: 12345');
    expect(options).toContain('TOOLS: 67890');

    // Verify data was migrated to new key
    const migratedData = await page.evaluate(() => {
      return localStorage.getItem('linkGenJiraProjectIds');
    });
    expect(migratedData).toBeTruthy();
    const parsed = JSON.parse(migratedData);
    expect(parsed).toHaveLength(2);
  });

  test('keeps Jira and ServiceNow data separate', async ({ page }) => {
    // Set up both Jira and ServiceNow data
    await page.evaluate(() => {
      const jiraUrls = [
        { id: '1', alias: 'Jira', value: 'https://jira.example.com' }
      ];
      const snowUrls = [
        { id: '1', alias: 'SNOW', value: 'https://snow.service-now.com' }
      ];
      localStorage.setItem('jiraSavedBaseUrls', JSON.stringify(jiraUrls));
      localStorage.setItem('snowSavedBaseUrls', JSON.stringify(snowUrls));
    });

    // Switch to Jira
    await page.click('#btnJira');
    await page.waitForTimeout(500);
    let options = await page.locator('#baseUrl option').allTextContents();
    expect(options).toContain('Jira: https://jira.example.com');
    expect(options.join('')).not.toContain('SNOW');

    // Switch to ServiceNow
    await page.click('#btnServiceNow');
    await page.waitForTimeout(500);
    options = await page.locator('#baseUrl option').allTextContents();
    expect(options).toContain('SNOW: https://snow.service-now.com');
    expect(options.join('')).not.toContain('Jira');
  });

  test('handles missing legacy data gracefully', async ({ page }) => {
    // No legacy data, just switch modes
    await page.click('#btnJira');
    await page.waitForTimeout(500);
    
    const jiraOptions = await page.locator('#baseUrl option').count();
    expect(jiraOptions).toBe(1); // Just the placeholder

    await page.click('#btnServiceNow');
    await page.waitForTimeout(500);
    
    const snowOptions = await page.locator('#baseUrl option').count();
    expect(snowOptions).toBe(1); // Just the placeholder
  });

  test('migration happens only once per app type', async ({ page }) => {
    // Set up legacy data
    await page.evaluate(() => {
      const legacyUrls = [
        { id: '1', alias: 'Test', value: 'https://test.example.com' }
      ];
      localStorage.setItem('jiraSavedBaseUrls', JSON.stringify(legacyUrls));
    });

    // Switch to Jira (triggers migration)
    await page.click('#btnJira');
    await page.waitForTimeout(500);

    // Verify migrated data exists
    let options = await page.locator('#baseUrl option').allTextContents();
    expect(options).toContain('Test: https://test.example.com');

    // Add a new item manually through the unified storage
    await page.evaluate(() => {
      const currentItems = JSON.parse(localStorage.getItem('linkGenJiraBaseUrls') || '[]');
      currentItems.push({ id: '2', alias: 'New URL', value: 'https://new.example.com' });
      localStorage.setItem('linkGenJiraBaseUrls', JSON.stringify(currentItems));
    });

    // Switch away and back
    await page.click('#btnServiceNow');
    await page.waitForTimeout(300);
    await page.click('#btnJira');
    await page.waitForTimeout(500);

    // Should have both old and new URLs
    options = await page.locator('#baseUrl option').allTextContents();
    expect(options).toContain('Test: https://test.example.com');
    expect(options).toContain('New URL: https://new.example.com');
    
    // Should have exactly 3 options (placeholder + 2 URLs)
    expect(options).toHaveLength(3);
  });
});
