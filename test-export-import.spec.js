/**
 * Playwright Test: Export/Import Configuration
 * Tests the export and import functionality in a real browser environment
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Export/Import Configuration', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    const htmlPath = path.join(__dirname, 'jira-link-generator.html');
    await page.goto(`file://${htmlPath}`);
    
    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should have export and import buttons', async () => {
    // Check export button exists
    const exportButton = page.locator('button:has-text("Export Config")');
    await expect(exportButton).toBeVisible();

    // Check import button exists
    const importButton = page.locator('button:has-text("Import Config")');
    await expect(importButton).toBeVisible();
  });

  test('should export configuration with correct structure', async () => {
    // Setup some test data
    await page.evaluate(() => {
      const testConfigItems = [
        { id: 'baseUrl', label: 'Test Base URL', category: 'config' },
        { id: 'projectId', label: 'Test Project', category: 'config' }
      ];
      const testFields = [
        { id: 'summary', label: 'Summary', type: 'text', required: true }
      ];
      
      localStorage.setItem('jiraConfigItems', JSON.stringify(testConfigItems));
      localStorage.setItem('jiraFieldDefinitions', JSON.stringify(testFields));
      localStorage.setItem('jiraSavedBaseUrls', JSON.stringify(['https://test.com']));
    });

    // Listen for download
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('button:has-text("Export Config")');
    
    // Wait for download and get config
    const download = await downloadPromise;
    const downloadPath = await download.path();
    const configContent = fs.readFileSync(downloadPath, 'utf8');
    const config = JSON.parse(configContent);

    // Verify structure
    expect(config).toHaveProperty('version');
    expect(config).toHaveProperty('exportedAt');
    expect(config).toHaveProperty('description');
    expect(config).toHaveProperty('configItems');
    expect(config).toHaveProperty('fieldDefinitions');
    expect(config).toHaveProperty('baseUrls');
    expect(config).toHaveProperty('projectIds');
    expect(config).toHaveProperty('issueTypeIds');

    // Verify data
    expect(Array.isArray(config.configItems)).toBe(true);
    expect(Array.isArray(config.fieldDefinitions)).toBe(true);
    expect(config.configItems.length).toBeGreaterThan(0);
  });

  test('should import valid configuration successfully', async () => {
    const testConfig = {
      version: '0.5.7',
      exportedAt: new Date().toISOString(),
      description: 'JIRA Issue Link Generator Configuration',
      configItems: [
        { id: 'baseUrl', label: 'Imported Base URL', category: 'config' },
        { id: 'projectId', label: 'Imported Project', category: 'config' },
        { id: 'issueTypeId', label: 'Imported Issue Type', category: 'config' }
      ],
      fieldDefinitions: [
        { id: 'summary', label: 'Imported Summary', type: 'text', required: true }
      ],
      baseUrls: ['https://imported.jira.com'],
      projectIds: ['IMP'],
      issueTypeIds: ['999']
    };

    // Create temporary config file
    const configPath = path.join(__dirname, 'temp-test-config.json');
    fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));

    // Setup file input listener before click
    const fileChooserPromise = page.waitForEvent('filechooser');
    
    // Click import button
    await page.click('button:has-text("Import Config")');
    
    // Wait for file chooser
    const fileChooser = await fileChooserPromise;
    
    // Handle the reload that happens after successful import
    page.on('dialog', async dialog => {
      const message = dialog.message();
      expect(message).toContain('successfully');
      await dialog.accept();
    });

    // Set file
    await fileChooser.setFiles(configPath);

    // Wait a bit for FileReader to process
    await page.waitForTimeout(500);

    // Verify data was saved to localStorage
    const savedConfigItems = await page.evaluate(() => {
      const stored = localStorage.getItem('jiraConfigItems');
      return stored ? JSON.parse(stored) : null;
    });

    const savedFields = await page.evaluate(() => {
      const stored = localStorage.getItem('jiraFieldDefinitions');
      return stored ? JSON.parse(stored) : null;
    });

    const savedBaseUrls = await page.evaluate(() => {
      const stored = localStorage.getItem('jiraSavedBaseUrls');
      return stored ? JSON.parse(stored) : null;
    });

    // Verify imported data
    expect(savedConfigItems).not.toBeNull();
    expect(savedConfigItems.length).toBe(3);
    expect(savedConfigItems[0].label).toBe('Imported Base URL');

    expect(savedFields).not.toBeNull();
    expect(savedFields[0].label).toBe('Imported Summary');

    expect(savedBaseUrls).not.toBeNull();
    expect(savedBaseUrls[0]).toBe('https://imported.jira.com');

    // Cleanup
    fs.unlinkSync(configPath);
  });

  test('should reject invalid configuration (missing version)', async () => {
    const invalidConfig = {
      // Missing version field
      configItems: [],
      fieldDefinitions: []
    };

    const configPath = path.join(__dirname, 'temp-invalid-config.json');
    fs.writeFileSync(configPath, JSON.stringify(invalidConfig));

    const fileChooserPromise = page.waitForEvent('filechooser');
    
    // Setup dialog handler to catch error
    let errorDialogShown = false;
    page.on('dialog', async dialog => {
      const message = dialog.message();
      if (message.includes('Error') || message.includes('missing version')) {
        errorDialogShown = true;
      }
      await dialog.accept();
    });

    await page.click('button:has-text("Import Config")');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(configPath);

    // Wait for error dialog
    await page.waitForTimeout(500);

    expect(errorDialogShown).toBe(true);

    fs.unlinkSync(configPath);
  });

  test('should handle malformed JSON gracefully', async () => {
    const malformedJson = '{ invalid json }';
    const configPath = path.join(__dirname, 'temp-malformed.json');
    fs.writeFileSync(configPath, malformedJson);

    const fileChooserPromise = page.waitForEvent('filechooser');
    
    let errorDialogShown = false;
    page.on('dialog', async dialog => {
      const message = dialog.message();
      if (message.includes('Error')) {
        errorDialogShown = true;
      }
      await dialog.accept();
    });

    await page.click('button:has-text("Import Config")');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(configPath);

    await page.waitForTimeout(500);

    expect(errorDialogShown).toBe(true);

    fs.unlinkSync(configPath);
  });

  test('should export and import roundtrip successfully', async () => {
    // Setup initial data
    await page.evaluate(() => {
      const configItems = [
        { id: 'baseUrl', label: 'Roundtrip Base URL', category: 'config' }
      ];
      const fields = [
        { id: 'summary', label: 'Roundtrip Summary', type: 'text', required: true }
      ];
      
      localStorage.setItem('jiraConfigItems', JSON.stringify(configItems));
      localStorage.setItem('jiraFieldDefinitions', JSON.stringify(fields));
    });

    // Export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Config")');
    const download = await downloadPromise;
    const exportPath = await download.path();
    const exportedContent = fs.readFileSync(exportPath, 'utf8');

    // Clear localStorage
    await page.evaluate(() => localStorage.clear());

    // Import the exported config back
    const fileChooserPromise = page.waitForEvent('filechooser');
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await page.click('button:has-text("Import Config")');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(exportPath);

    await page.waitForTimeout(500);

    // Verify roundtrip data
    const roundtripConfigItems = await page.evaluate(() => {
      const stored = localStorage.getItem('jiraConfigItems');
      return stored ? JSON.parse(stored) : null;
    });

    expect(roundtripConfigItems).not.toBeNull();
    expect(roundtripConfigItems[0].label).toBe('Roundtrip Base URL');
  });
});
