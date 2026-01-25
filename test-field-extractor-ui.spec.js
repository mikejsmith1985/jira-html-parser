const { test, expect } = require('@playwright/test');

test.describe('Field Extractor UI Tests', () => {
  test('ServiceNow - Field Extractor modal opens and displays correctly', async ({ page }) => {
    await page.goto(`file:///${__dirname}/servicenow-link-generator.html`.replace(/\\/g, '/'));
    
    // Click the Field Extractor button
    await page.click('button:has-text("🔍 Field Extractor")');
    
    // Check modal is visible
    const modal = page.locator('#fieldExtractorModal');
    await expect(modal).toBeVisible();
    
    // Check that the bookmarklet link exists and has href set
    const bookmarkletLink = page.locator('#fieldExtractorBookmarklet');
    await expect(bookmarkletLink).toBeVisible();
    const href = await bookmarkletLink.getAttribute('href');
    expect(href).toContain('javascript:');
    
    // Check that bookmarklet text is shown as button text, not HTML
    const linkText = await bookmarkletLink.textContent();
    expect(linkText).toBe('🔍 ServiceNow Field Extractor');
    expect(linkText).not.toContain('<');
    expect(linkText).not.toContain('>');
    
    // Check close button works - be specific to the Field Extractor modal
    await page.click('#fieldExtractorModal button:has-text("Close")');
    await expect(modal).not.toBeVisible();
  });

  test('Jira - Field Extractor modal opens and displays correctly', async ({ page }) => {
    await page.goto(`file:///${__dirname}/jira-link-generator.html`.replace(/\\/g, '/'));
    
    // Click the Field Extractor button
    await page.click('button:has-text("🔍 Field Extractor")');
    
    // Check modal is visible
    const modal = page.locator('#fieldExtractorModal');
    await expect(modal).toBeVisible();
    
    // Check that the bookmarklet link exists and has href set
    const bookmarkletLink = page.locator('#fieldExtractorBookmarklet');
    await expect(bookmarkletLink).toBeVisible();
    const href = await bookmarkletLink.getAttribute('href');
    expect(href).toContain('javascript:');
    
    // Check that bookmarklet text is shown as button text, not HTML
    const linkText = await bookmarkletLink.textContent();
    expect(linkText).toBe('🔍 Jira Field Extractor');
    expect(linkText).not.toContain('<');
    expect(linkText).not.toContain('>');
    
    // Check close button works - be specific to the Field Extractor modal
    await page.click('#fieldExtractorModal button:has-text("Close")');
    await expect(modal).not.toBeVisible();
  });
});
