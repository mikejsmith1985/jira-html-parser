const { test } = require('@playwright/test');
const path = require('path');

test('Debug - check for JS code in visible content', async ({ page }) => {
  const filePath = 'file://' + path.resolve(__dirname, 'jira-link-generator.html').replace(/\\/g, '/');
  await page.goto(filePath);
  await page.waitForLoadState('domcontentloaded');
  
  // Get all text nodes that contain JavaScript-looking content
  const suspiciousNodes = await page.evaluate(() => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const results = [];
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      if (text && (text.includes('function') || text.includes('localStorage') || text.includes('=>'))) {
        results.push({
          text: text.substring(0, 100),
          parent: node.parentElement.tagName,
          parentId: node.parentElement.id,
          parentClass: node.parentElement.className
        });
      }
    }
    return results;
  });
  
  console.log('Suspicious text nodes:', JSON.stringify(suspiciousNodes, null, 2));
});
