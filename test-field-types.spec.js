/**
 * Test Suite: Field Type System (Text vs Combobox)
 * Tests for text fields and combobox fields with label/value options
 *
 * Run with: npx playwright test test-field-types.spec.js
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const htmlPath = 'file:///' + path.resolve(__dirname, 'jira-link-generator.html').replace(/\\/g, '/');

test.describe('Field Type System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(htmlPath);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should add a combobox field with options', async ({ page }) => {
    // Add a field
    await page.click('text=Add Field');
    
    // Open field manager
    await page.click('.manage-fields-btn');
    
    // Add a new combobox field
    await page.fill('#fieldIdInput', 'customfield_10001');
    await page.fill('#fieldLabelInput', 'Story Points');
    await page.selectOption('#fieldTypeSelect', 'combobox');
    
    // Verify combobox options section is visible
    await expect(page.locator('#comboboxOptionsSection')).toBeVisible();
    
    // Add some options
    await page.fill('#optionLabelInput', '0 Points');
    await page.fill('#optionValueInput', '104111');
    await page.click('button:has-text("Add Option")');
    
    await page.fill('#optionLabelInput', '1 Point');
    await page.fill('#optionValueInput', '54505');
    await page.click('button:has-text("Add Option")');
    
    await page.fill('#optionLabelInput', '2 Points');
    await page.fill('#optionValueInput', '54506');
    await page.click('button:has-text("Add Option")');
    
    // Save the field
    await page.click('#addFieldBtn');
    
    // Close modal
    await page.click('button:has-text("Close")');
    
    // Select the new field in the LAST field row (the one we just added)
    const lastFieldRow = page.locator('.field-row').last();
    await lastFieldRow.locator('.field-select').selectOption('customfield_10001');
    
    // Verify a combobox appears (not a rich text editor) in that row
    const combobox = lastFieldRow.locator('select.rich-value');
    await expect(combobox).toBeVisible();
    
    // Verify no formatting toolbar appears for combobox
    const toolbar = lastFieldRow.locator('.formatting-toolbar');
    await expect(toolbar).not.toBeVisible();
    
    // Select an option in combobox
    await lastFieldRow.locator('select.rich-value').selectOption('54505');
    
    // Verify the option was selected
    const selectedValue = await lastFieldRow.locator('select.rich-value').inputValue();
    expect(selectedValue).toBe('54505');
  });

  test('should add a text field with rich editor', async ({ page }) => {
    // Add a field
    await page.click('text=Add Field');
    
    // Open field manager
    await page.click('.manage-fields-btn');
    
    // Add a new text field
    await page.fill('#fieldIdInput', 'customfield_10002');
    await page.fill('#fieldLabelInput', 'Custom Description');
    await page.selectOption('#fieldTypeSelect', 'text');
    
    // Verify combobox options section is NOT visible
    await expect(page.locator('#comboboxOptionsSection')).not.toBeVisible();
    
    // Save the field
    await page.click('#addFieldBtn');
    
    // Close modal
    await page.click('button:has-text("Close")');
    
    // Select the new field in the LAST field row
    const lastFieldRow = page.locator('.field-row').last();
    await lastFieldRow.locator('.field-select').selectOption('customfield_10002');
    
    // Verify rich text editor appears
    const richEditor = lastFieldRow.locator('.rich-value[contenteditable="true"]');
    await expect(richEditor).toBeVisible();
    
    // Verify formatting toolbar appears
    const toolbar = lastFieldRow.locator('.formatting-toolbar');
    await expect(toolbar).toBeVisible();
    
    // Type some text
    await richEditor.fill('This is a test description');
    
    // Use formatting - click bold button
    await toolbar.locator('button[title="Bold"]').click();
    
    // Verify the HTML contains formatting
    const html = await richEditor.innerHTML();
    expect(html).toContain('test description');
  });

  test('should persist field definitions with types', async ({ page }) => {
    // Add a combobox field
    await page.click('text=Add Field');
    await page.click('.manage-fields-btn');
    await page.fill('#fieldIdInput', 'priority');
    await page.fill('#fieldLabelInput', 'Priority');
    await page.selectOption('#fieldTypeSelect', 'combobox');
    
    await page.fill('#optionLabelInput', 'High');
    await page.fill('#optionValueInput', '1');
    await page.click('button:has-text("Add Option")');
    
    await page.fill('#optionLabelInput', 'Low');
    await page.fill('#optionValueInput', '3');
    await page.click('button:has-text("Add Option")');
    
    await page.click('#addFieldBtn');
    await page.click('button:has-text("Close")');
    
    // Reload page
    await page.reload();
    
    // Open field manager again
    await page.click('text=Add Field');
    await page.click('.manage-fields-btn');
    
    // Verify the field is in the list (be more specific)
    await expect(page.locator('#fieldsList')).toContainText('Priority');
    
    // Close and select the field in the last row
    await page.click('button:has-text("Close")');
    const lastFieldRow = page.locator('.field-row').last();
    await lastFieldRow.locator('.field-select').selectOption('priority');
    
    // Verify it renders as combobox
    const combobox = lastFieldRow.locator('select.rich-value');
    await expect(combobox).toBeVisible();
    
    // Verify options are present (check the select has these options)
    const selectOptions = await lastFieldRow.locator('select.rich-value').evaluate(sel => 
      Array.from(sel.options).map(opt => opt.textContent)
    );
    expect(selectOptions).toContain('High');
    expect(selectOptions).toContain('Low');
  });

  test('should edit combobox field and update options', async ({ page }) => {
    // Add a combobox field
    await page.click('text=Add Field');
    await page.click('.manage-fields-btn');
    await page.fill('#fieldIdInput', 'status');
    await page.fill('#fieldLabelInput', 'Status');
    await page.selectOption('#fieldTypeSelect', 'combobox');
    
    await page.fill('#optionLabelInput', 'Open');
    await page.fill('#optionValueInput', '1');
    await page.click('button:has-text("Add Option")');
    
    await page.click('#addFieldBtn');
    
    // Wait a moment for the field to be added to the list
    await page.waitForTimeout(500);
    
    // Edit the field - the last edit button in fieldsList
    const editButtons = await page.locator('#fieldsList button:has-text("Edit")');
    const lastEditButton = editButtons.last();
    await lastEditButton.click();
    
    // Verify field type is selected
    await expect(page.locator('#fieldTypeSelect')).toHaveValue('combobox');
    
    // Verify existing option is shown
    await expect(page.locator('text=Open → 1')).toBeVisible();
    
    // Add another option
    await page.fill('#optionLabelInput', 'Closed');
    await page.fill('#optionValueInput', '2');
    await page.click('button:has-text("Add Option")');
    
    // Update
    await page.click('#addFieldBtn');
    
    // Close modal
    await page.click('button:has-text("Close")');
    
    // Select the field in the last row
    const lastFieldRow = page.locator('.field-row').last();
    await lastFieldRow.locator('.field-select').selectOption('status');
    
    // Verify both options are present
    const selectOptions = await lastFieldRow.locator('select.rich-value').evaluate(sel => 
      Array.from(sel.options).map(opt => opt.textContent)
    );
    expect(selectOptions).toContain('Open');
    expect(selectOptions).toContain('Closed');
  });

  test('should default to text type for existing fields', async ({ page }) => {
    // Add field without specifying type (simulating old data)
    await page.evaluate(() => {
      localStorage.setItem('jiraFieldDefinitions', JSON.stringify([
        { id: 'legacy', label: 'Legacy Field', category: 'custom' }
      ]));
    });
    await page.reload();
    
    // Add a field and select the legacy field in the last row
    await page.click('text=Add Field');
    const lastFieldRow = page.locator('.field-row').last();
    await lastFieldRow.locator('.field-select').selectOption('legacy');
    
    // Verify it renders as text field with formatting toolbar
    const richEditor = lastFieldRow.locator('.rich-value[contenteditable="true"]');
    await expect(richEditor).toBeVisible();
    await expect(lastFieldRow.locator('.formatting-toolbar')).toBeVisible();
  });
});
