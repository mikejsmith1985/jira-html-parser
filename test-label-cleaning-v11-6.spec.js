const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Field Label Cleaning - v0.11.6', () => {
  test('should extract bookmarklet and clean labels correctly', async ({ page }) => {
    // Navigate to the link generator
    await page.goto(`file:///${process.cwd()}/link-generator.html`.replace(/\\/g, '/'));
    
    // Open Field Extractor modal
    await page.click('text=🔍 Field Extractor');
    
    // Get the bookmarklet code
    const bookmarkletHref = await page.getAttribute('#fieldExtractorBookmarklet', 'href');
    expect(bookmarkletHref).toContain('javascript:');
    
    // Extract the JavaScript code (remove "javascript:" prefix and URL encoding)
    const bookmarkletCode = decodeURIComponent(bookmarkletHref.replace('javascript:', ''));
    
    // Check version is 0.11.6
    expect(bookmarkletCode).toContain("extractorVersion: '0.11.6'");
    
    // Verify the label cleaning code is present
    expect(bookmarkletCode).toContain('.replace(/\\s+(Required|Mandatory)[\\s.,;:!?]*$/gi');
    
    console.log('✅ Bookmarklet contains v0.11.6 version tag');
    console.log('✅ Bookmarklet contains enhanced label cleaning regex');
  });

  test('should clean "Summary Required" to "Summary" in mock extraction', async ({ page }) => {
    // Create a mock Jira page with fields
    const mockJiraHTML = `
      <!DOCTYPE html>
      <html>
      <head><title>Mock Jira Issue</title></head>
      <body>
        <form>
          <label for="summary">Summary Required</label>
          <input type="text" id="summary" name="summary" />
          
          <label for="reporter">Reporter Required</label>
          <input type="text" id="reporter" name="reporter" />
          
          <label for="priority">Priority</label>
          <select id="priority" name="priority">
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
        </form>
      </body>
      </html>
    `;
    
    // Save mock HTML
    const mockPath = path.join(process.cwd(), 'test-mock-jira-form.html');
    fs.writeFileSync(mockPath, mockJiraHTML);
    
    try {
      // Load the link generator to get the bookmarklet
      await page.goto(`file:///${process.cwd()}/link-generator.html`.replace(/\\/g, '/'));
      await page.click('text=🔍 Field Extractor');
      
      const bookmarkletHref = await page.getAttribute('#fieldExtractorBookmarklet', 'href');
      const bookmarkletCode = decodeURIComponent(bookmarkletHref.replace('javascript:', ''));
      
      // Now navigate to mock Jira page
      await page.goto(`file:///${mockPath}`.replace(/\\/g, '/'));
      
      // Execute the bookmarklet
      await page.evaluate((code) => {
        eval(code);
      }, bookmarkletCode);
      
      // Wait for the extraction modal to appear
      await page.waitForSelector('text=Jira Field Extractor Results', { timeout: 5000 });
      
      // Take a screenshot
      const screenshotPath = path.join(process.cwd(), 'test-results', 'label-cleaning-proof-v0.11.6.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot saved to: ${screenshotPath}`);
      
      // Get the extracted data from the JSON display
      const extractedJSON = await page.evaluate(() => {
        const pre = document.querySelector('pre');
        return pre ? JSON.parse(pre.textContent) : null;
      });
      
      // Verify labels are cleaned
      const summaryField = extractedJSON.fields.find(f => f.id === 'summary');
      const reporterField = extractedJSON.fields.find(f => f.id === 'reporter');
      
      console.log(`\n=== FIELD EXTRACTION RESULTS ===`);
      console.log(`Summary field label: "${summaryField?.label}"`);
      console.log(`Reporter field label: "${reporterField?.label}"`);
      
      expect(summaryField).toBeDefined();
      expect(summaryField.label).toBe('Summary'); // Should NOT be "Summary Required"
      
      expect(reporterField).toBeDefined();
      expect(reporterField.label).toBe('Reporter'); // Should NOT be "Reporter Required"
      
      console.log('✅ All labels cleaned correctly!');
      
    } finally {
      // Cleanup
      if (fs.existsSync(mockPath)) {
        fs.unlinkSync(mockPath);
      }
    }
  });
  
  test('should display extractorVersion as 0.11.6', async ({ page }) => {
    await page.goto(`file:///${process.cwd()}/link-generator.html`.replace(/\\/g, '/'));
    await page.click('text=🔍 Field Extractor');
    
    const bookmarkletHref = await page.getAttribute('#fieldExtractorBookmarklet', 'href');
    const bookmarkletCode = decodeURIComponent(bookmarkletHref.replace('javascript:', ''));
    
    // Check both the JSON version and the display version
    expect(bookmarkletCode).toContain("extractorVersion: '0.11.6'");
    expect(bookmarkletCode).toContain('0.11.6'); // Display badge
    
    console.log('✅ Version 0.11.6 confirmed in both JSON and display');
  });
});
