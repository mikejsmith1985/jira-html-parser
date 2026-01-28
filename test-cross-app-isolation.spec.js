const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Cross-App Field Isolation', () => {
  test('Field Optimizer should NOT merge fields from Jira and ServiceNow', async ({ page }) => {
    const htmlPath = 'file:///' + path.resolve('link-generator.html').replace(/\\/g, '/');
    await page.goto(htmlPath);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Clear any existing data
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Create test data: "description" field in both Jira and ServiceNow
    await page.evaluate(() => {
      const jiraFields = [
        {
          id: 'description',
          label: 'Description',
          appType: 'jira',
          baseUrlId: 'jira-base-1',
          issueTypeId: 'jira-issue-1',
          category: 'standard',
          fieldType: 'text'
        },
        {
          id: 'description',
          label: 'Description',
          appType: 'jira',
          baseUrlId: 'jira-base-1',
          issueTypeId: 'jira-issue-2',
          category: 'standard',
          fieldType: 'text'
        }
      ];

      const snowFields = [
        {
          id: 'description',
          label: 'Description',
          appType: 'servicenow',
          baseUrlId: 'snow-base-1',
          issueTypeId: 'incident',
          category: 'standard',
          fieldType: 'text'
        },
        {
          id: 'description',
          label: 'Description',
          appType: 'servicenow',
          baseUrlId: 'snow-base-1',
          issueTypeId: 'change_request',
          category: 'standard',
          fieldType: 'text'
        }
      ];

      // Save to separate storage keys
      localStorage.setItem('linkGenJiraFieldDefinitions', JSON.stringify(jiraFields));
      localStorage.setItem('linkGenSnowFieldDefinitions', JSON.stringify(snowFields));

      // Also save issue types for both
      localStorage.setItem('linkGenJiraIssueTypes', JSON.stringify([
        { id: 'jira-issue-1', name: 'Bug' },
        { id: 'jira-issue-2', name: 'Task' }
      ]));

      localStorage.setItem('linkGenSnowIssueTypes', JSON.stringify([
        { id: 'incident', name: 'Incident' },
        { id: 'change_request', name: 'Change Request' }
      ]));
    });

    // Test Jira mode
    await page.evaluate(() => {
      window.switchAppType('jira');
      return window.analyzeFieldDuplicates();
    });

    const jiraAnalysis = await page.evaluate(() => {
      return window.currentOptimizationAnalysis || window.analyzeFieldDuplicates();
    });

    console.log('Jira Analysis:', JSON.stringify(jiraAnalysis, null, 2));

    // Test ServiceNow mode
    await page.evaluate(() => {
      window.switchAppType('servicenow');
      return window.analyzeFieldDuplicates();
    });

    const snowAnalysis = await page.evaluate(() => {
      return window.currentOptimizationAnalysis || window.analyzeFieldDuplicates();
    });

    console.log('ServiceNow Analysis:', JSON.stringify(snowAnalysis, null, 2));

    // Assertions
    expect(jiraAnalysis).toBeDefined();
    expect(jiraAnalysis.totalGroups).toBe(1);
    expect(jiraAnalysis.groups[0].fieldId).toBe('description');
    expect(jiraAnalysis.groups[0].appType).toBe('jira');
    expect(jiraAnalysis.groups[0].instanceCount).toBe(2);
    expect(jiraAnalysis.groups[0].issueTypeCount).toBe(2);

    expect(snowAnalysis).toBeDefined();
    expect(snowAnalysis.totalGroups).toBe(1);
    expect(snowAnalysis.groups[0].fieldId).toBe('description');
    expect(snowAnalysis.groups[0].appType).toBe('servicenow');
    expect(snowAnalysis.groups[0].instanceCount).toBe(2);
    expect(snowAnalysis.groups[0].issueTypeCount).toBe(2);

    // CRITICAL: Verify that Jira and ServiceNow descriptions are treated as separate groups
    // If they were grouped together, we'd see 4 instances in one group
    // Instead, we should see 2 separate groups (one per app type) with 2 instances each
    expect(jiraAnalysis.totalGroups + snowAnalysis.totalGroups).toBe(2);
    expect(jiraAnalysis.groups.every(g => g.instanceCount === 2)).toBe(true);
    expect(snowAnalysis.groups.every(g => g.instanceCount === 2)).toBe(true);

    console.log('✅ PASS: Jira and ServiceNow fields are properly isolated');
  });
});
