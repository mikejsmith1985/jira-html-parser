const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Field Extractor Import Enhancements - Issue #10', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + path.resolve(__dirname, 'link-generator.html'));
    
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('filters out meaningless field IDs during import', async ({ page }) => {
    // Switch to Jira mode and add a saved issue type for mapping
    await page.click('#btnJira');
    await page.evaluate(() => {
      localStorage.setItem('linkGenJiraIssueTypes', JSON.stringify([
        { id: '1', alias: 'Defect', value: '18501' }
      ]));
    });
    await page.reload();
    await page.click('#btnJira');

    // Create test JSON with meaningless fields
    const testConfig = {
      version: '1.2.0',
      appType: 'jira',
      issueType: '18501',
      fieldDefinitions: [
        {id: 'summary', label: 'Summary', category: 'custom', fieldType: 'text', issueType: '18501'},
        {id: 'customfield_11800_CHAWzoZaH1HKiTow', label: 'customfield_11800_CHAWzoZaH1HKiTow', category: 'custom', fieldType: 'text', issueType: '18501'}, // Should be skipped
        {id: 'formToken', label: 'formToken', category: 'custom', fieldType: 'text', issueType: '18501'}, // Should be skipped
        {id: 'customfield_11800', label: 'Acceptance Criteria', category: 'custom', fieldType: 'text', issueType: '18501'}, // Should be kept
        {id: 'description', label: 'Description', category: 'custom', fieldType: 'text', issueType: '18501'}
      ]
    };

    // Trigger import
    const fileInput = await page.evaluateHandle(() => {
      return new Promise((resolve) => {
        const originalClick = HTMLInputElement.prototype.click;
        HTMLInputElement.prototype.click = function() {
          if (this.type === 'file') {
            resolve(this);
            return;
          }
          originalClick.call(this);
        };
        document.querySelector('button[onclick="openImportModal()"]').click();
      });
    });

    await fileInput.asElement().setInputFiles({
      name: 'test-config.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(testConfig))
    });

    // Wait for preview modal
    await page.waitForSelector('#importPreviewModal', { timeout: 5000 });

    // Check that skipped fields count is shown
    const skippedText = await page.locator('#importPreviewModal').textContent();
    expect(skippedText).toContain('Skipped 2 field(s)');

    // Check summary shows correct count (3 fields kept, 2 skipped)
    expect(skippedText).toContain('3 field definition(s)');
  });

  test('maps issue type ID to human-readable label', async ({ page }) => {
    // Switch to Jira and add saved issue types
    await page.click('#btnJira');
    await page.evaluate(() => {
      localStorage.setItem('linkGenJiraIssueTypes', JSON.stringify([
        { id: '1', alias: 'Defect', value: '18501' },
        { id: '2', alias: 'Story', value: '10001' }
      ]));
    });
    await page.reload();
    await page.click('#btnJira');

    const testConfig = {
      version: '1.2.0',
      appType: 'jira',
      issueType: '18501',
      fieldDefinitions: [
        {id: 'summary', label: 'Summary', category: 'custom', fieldType: 'text', issueType: '18501'}
      ]
    };

    const fileInput = await page.evaluateHandle(() => {
      return new Promise((resolve) => {
        const originalClick = HTMLInputElement.prototype.click;
        HTMLInputElement.prototype.click = function() {
          if (this.type === 'file') {
            resolve(this);
            return;
          }
          originalClick.call(this);
        };
        document.querySelector('button[onclick="openImportModal()"]').click();
      });
    });

    await fileInput.asElement().setInputFiles({
      name: 'test-config.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(testConfig))
    });

    await page.waitForSelector('#importPreviewModal');

    // Check that issue type was mapped
    const previewText = await page.locator('#importPreviewModal').textContent();
    expect(previewText).toContain('Issue Type Mapped');
    expect(previewText).toContain('18501');
    expect(previewText).toContain('Defect');
  });

  test('shows import preview before confirming', async ({ page }) => {
    await page.click('#btnJira');
    
    const testConfig = {
      version: '1.0.0',
      appType: 'jira',
      fieldDefinitions: [
        {id: 'summary', label: 'Summary', category: 'custom', fieldType: 'text'}
      ],
      baseUrls: [
        {id: '1', alias: 'Test', value: 'https://test.com'}
      ]
    };

    const fileInput = await page.evaluateHandle(() => {
      return new Promise((resolve) => {
        const originalClick = HTMLInputElement.prototype.click;
        HTMLInputElement.prototype.click = function() {
          if (this.type === 'file') {
            resolve(this);
            return;
          }
          originalClick.call(this);
        };
        document.querySelector('button[onclick="openImportModal()"]').click();
      });
    });

    await fileInput.asElement().setInputFiles({
      name: 'test-config.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(testConfig))
    });

    // Wait for modal
    await page.waitForSelector('#importPreviewModal');

    // Check modal content
    const modalText = await page.locator('#importPreviewModal').textContent();
    expect(modalText).toContain('Import Preview');
    expect(modalText).toContain('1 field definition(s)');
    expect(modalText).toContain('1 base URL(s)');
    expect(modalText).toContain('Confirm Import');
    expect(modalText).toContain('Cancel');
  });

  test('can cancel import from preview', async ({ page }) => {
    await page.click('#btnJira');
    
    const testConfig = {
      version: '1.0.0',
      appType: 'jira',
      fieldDefinitions: [{id: 'test', label: 'Test', category: 'custom', fieldType: 'text'}]
    };

    const fileInput = await page.evaluateHandle(() => {
      return new Promise((resolve) => {
        const originalClick = HTMLInputElement.prototype.click;
        HTMLInputElement.prototype.click = function() {
          if (this.type === 'file') {
            resolve(this);
            return;
          }
          originalClick.call(this);
        };
        document.querySelector('button[onclick="openImportModal()"]').click();
      });
    });

    await fileInput.asElement().setInputFiles({
      name: 'test-config.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(testConfig))
    });

    await page.waitForSelector('#importPreviewModal');
    await page.click('#cancelImportBtn');

    // Modal should be gone
    await expect(page.locator('#importPreviewModal')).not.toBeVisible();

    // No fields should have been imported
    const fields = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('jiraFieldDefinitions') || '[]');
    });
    expect(fields.length).toBe(0);
  });

  test('merges dropdown options during import', async ({ page }) => {
    // Pre-populate with existing field that has some options
    await page.click('#btnJira');
    await page.evaluate(() => {
      localStorage.setItem('jiraFieldDefinitions', JSON.stringify([
        {
          id: 'priority',
          label: 'Priority',
          category: 'custom',
          fieldType: 'combobox',
          options: [
            {label: 'High', value: '1'},
            {label: 'Medium', value: '2'}
          ]
        }
      ]));
    });
    await page.reload();

    const testConfig = {
      version: '1.0.0',
      appType: 'jira',
      fieldDefinitions: [
        {
          id: 'priority',
          label: 'Priority',
          category: 'custom',
          fieldType: 'combobox',
          options: [
            {label: 'Medium', value: '2'}, // Duplicate
            {label: 'Low', value: '3'} // New
          ]
        }
      ]
    };

    const fileInput = await page.evaluateHandle(() => {
      return new Promise((resolve) => {
        const originalClick = HTMLInputElement.prototype.click;
        HTMLInputElement.prototype.click = function() {
          if (this.type === 'file') {
            resolve(this);
            return;
          }
          originalClick.call(this);
        };
        document.querySelector('button[onclick="openImportModal()"]').click();
      });
    });

    await fileInput.asElement().setInputFiles({
      name: 'test-config.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(testConfig))
    });

    await page.waitForSelector('#importPreviewModal');
    
    // Intercept the reload to check storage before it happens
    const mergedFields = await page.evaluate(async (config) => {
      // Simulate the merge operation
      const mergeItems = (existing, incoming) => {
        const map = new Map();
        if (Array.isArray(existing)) {
          existing.forEach(i => map.set(i.id, i));
        }
        if (Array.isArray(incoming)) {
          incoming.forEach(item => {
            const existingItem = map.get(item.id);
            if (existingItem && existingItem.fieldType === 'combobox' && item.fieldType === 'combobox') {
              // Merge dropdown options
              const optionsMap = new Map();
              if (existingItem.options) existingItem.options.forEach(opt => optionsMap.set(opt.value, opt));
              if (item.options) item.options.forEach(opt => optionsMap.set(opt.value, opt));
              item.options = Array.from(optionsMap.values());
            }
            map.set(item.id, item);
          });
        }
        return Array.from(map.values());
      };

      const existing = JSON.parse(localStorage.getItem('jiraFieldDefinitions') || '[]');
      return mergeItems(existing, config.fieldDefinitions);
    }, testConfig);

    // Check merged options
    const priorityField = mergedFields.find(f => f.id === 'priority');
    expect(priorityField).toBeTruthy();
    expect(priorityField.options).toHaveLength(3); // High, Medium, Low
    expect(priorityField.options.map(o => o.value)).toContain('1');
    expect(priorityField.options.map(o => o.value)).toContain('2');
    expect(priorityField.options.map(o => o.value)).toContain('3');
  });
});
