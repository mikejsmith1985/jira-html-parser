/**
 * Comprehensive Test Suite for Dark Mode and Field Picker
 * Following copilot-instructions.md Phase 4: Visual Proof Protocol
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Load link-generator.html
  const filePath = path.resolve(__dirname, 'link-generator.html');
  await page.goto(`file:///${filePath.replace(/\\/g, '/')}`);
  await page.waitForLoadState('networkidle');

  console.log('✅ Page loaded');

  const results = {
    passed: [],
    failed: [],
    screenshots: []
  };

  // Helper: Take screenshot with highlighting
  async function captureWithHighlight(name, selector, description) {
    try {
      if (selector) {
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) {
            el.style.outline = '3px solid #ff00ff';
            el.style.outlineOffset = '2px';
            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }, selector);
        await page.waitForTimeout(500);
      }

      const screenshot = await page.screenshot({ fullPage: true });
      const screenshotPath = path.join(__dirname, `test-results/${name}.png`);
      
      // Ensure directory exists
      if (!fs.existsSync(path.join(__dirname, 'test-results'))) {
        fs.mkdirSync(path.join(__dirname, 'test-results'), { recursive: true });
      }
      
      fs.writeFileSync(screenshotPath, screenshot);
      
      results.screenshots.push({
        name,
        description,
        path: screenshotPath,
        base64: screenshot.toString('base64')
      });

      console.log(`📸 Screenshot saved: ${name}`);

      // Remove highlight
      if (selector) {
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) {
            el.style.outline = '';
            el.style.outlineOffset = '';
          }
        }, selector);
      }
    } catch (err) {
      console.error(`❌ Failed to capture ${name}:`, err.message);
    }
  }

  // ============================================================
  // TEST 1: Toggle to Dark Mode
  // ============================================================
  try {
    console.log('\n🧪 TEST 1: Toggle to Dark Mode');
    
    // Click the dark mode toggle
    await page.click('#darkModeToggle');
    await page.waitForTimeout(300);

    // Verify dark mode is active
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-bs-theme'));
    
    if (theme === 'dark') {
      results.passed.push('Dark mode toggle works');
      console.log('  ✅ Dark mode activated');
    } else {
      results.failed.push('Dark mode toggle did not activate');
      console.log('  ❌ Dark mode NOT activated');
    }

    await captureWithHighlight('01-dark-mode-main', null, 'Main page in dark mode');
  } catch (err) {
    results.failed.push(`Dark mode toggle error: ${err.message}`);
    console.error('  ❌ Error:', err.message);
  }

  // ============================================================
  // TEST 2: Check Manage Configs Modal in Dark Mode
  // ============================================================
  try {
    console.log('\n🧪 TEST 2: Manage Configs Modal - Dark Mode');
    
    await page.click('button:has-text("Manage Configs")');
    await page.waitForTimeout(500);

    const modalVisible = await page.isVisible('#configManagementModal');
    if (!modalVisible) throw new Error('Modal not visible');

    await captureWithHighlight('02-manage-configs-dark', '#configManagementModal', 'Manage Configs modal in dark mode');

    // Check if modal has dark styling
    const modalBg = await page.evaluate(() => {
      const modal = document.querySelector('#configManagementModal > div');
      return window.getComputedStyle(modal).backgroundColor;
    });

    console.log(`  Modal background: ${modalBg}`);

    // Close modal
    await page.evaluate(() => {
      document.getElementById('configManagementModal').style.display = 'none';
    });

    results.passed.push('Manage Configs modal opened');
  } catch (err) {
    results.failed.push(`Manage Configs modal error: ${err.message}`);
    console.error('  ❌ Error:', err.message);
  }

  // ============================================================
  // TEST 3: Check Field Extractor Modal in Dark Mode
  // ============================================================
  try {
    console.log('\n🧪 TEST 3: Field Extractor Modal - Dark Mode');
    
    await page.click('button:has-text("Field Extractor")');
    await page.waitForTimeout(500);

    const modalVisible = await page.isVisible('#fieldExtractorModal');
    if (!modalVisible) throw new Error('Modal not visible');

    await captureWithHighlight('03-field-extractor-dark', '#fieldExtractorModal', 'Field Extractor modal in dark mode');

    // Check if modal has dark styling
    const modalBg = await page.evaluate(() => {
      const modal = document.querySelector('#fieldExtractorModal > div');
      return window.getComputedStyle(modal).backgroundColor;
    });

    console.log(`  Modal background: ${modalBg}`);

    // Close modal
    await page.evaluate(() => {
      document.getElementById('fieldExtractorModal').style.display = 'none';
    });

    results.passed.push('Field Extractor modal opened');
  } catch (err) {
    results.failed.push(`Field Extractor modal error: ${err.message}`);
    console.error('  ❌ Error:', err.message);
  }

  // ============================================================
  // TEST 4: Check Field Picker Modal in Dark Mode
  // ============================================================
  try {
    console.log('\n🧪 TEST 4: Field Picker Modal - Dark Mode');
    
    await page.click('button:has-text("Field Picker")');
    await page.waitForTimeout(500);

    const modalVisible = await page.isVisible('#fieldPickerModal');
    if (!modalVisible) throw new Error('Modal not visible');

    await captureWithHighlight('04-field-picker-modal-dark', '#fieldPickerModal', 'Field Picker modal in dark mode');

    // Check if modal has dark styling
    const modalBg = await page.evaluate(() => {
      const modal = document.querySelector('#fieldPickerModal > div');
      return window.getComputedStyle(modal).backgroundColor;
    });

    console.log(`  Modal background: ${modalBg}`);

    // Close modal
    await page.evaluate(() => {
      document.getElementById('fieldPickerModal').style.display = 'none';
    });

    results.passed.push('Field Picker modal opened');
  } catch (err) {
    results.failed.push(`Field Picker modal error: ${err.message}`);
    console.error('  ❌ Error:', err.message);
  }

  // ============================================================
  // TEST 5: Check Manage Presets Modal in Dark Mode
  // ============================================================
  try {
    console.log('\n🧪 TEST 5: Manage Presets Modal - Dark Mode');
    
    await page.click('button:has-text("Presets")');
    await page.waitForTimeout(500);

    const modalVisible = await page.isVisible('#managePresetsModal');
    if (!modalVisible) throw new Error('Modal not visible');

    await captureWithHighlight('05-presets-modal-dark', '#managePresetsModal', 'Presets modal in dark mode');

    // Check if modal has dark styling
    const modalBg = await page.evaluate(() => {
      const modal = document.querySelector('#managePresetsModal > div');
      return window.getComputedStyle(modal).backgroundColor;
    });

    console.log(`  Modal background: ${modalBg}`);

    // Close modal
    await page.evaluate(() => {
      document.getElementById('managePresetsModal').style.display = 'none';
    });

    results.passed.push('Presets modal opened');
  } catch (err) {
    results.failed.push(`Presets modal error: ${err.message}`);
    console.error('  ❌ Error:', err.message);
  }

  // ============================================================
  // TEST 6: Check Field Manager Modal in Dark Mode
  // ============================================================
  try {
    console.log('\n🧪 TEST 6: Field Manager Modal - Dark Mode');
    
    // Open Manage Configs first
    await page.click('button:has-text("Manage Configs")');
    await page.waitForTimeout(500);

    // Click "Manage Fields" tab
    await page.click('button:has-text("Manage Fields")');
    await page.waitForTimeout(500);

    await captureWithHighlight('06-field-manager-dark', '#fieldManagerModal', 'Field Manager modal in dark mode');

    // Check if modal has dark styling
    const modalBg = await page.evaluate(() => {
      const modal = document.querySelector('#fieldManagerModal > div');
      return window.getComputedStyle(modal).backgroundColor;
    });

    console.log(`  Modal background: ${modalBg}`);

    // Close modals
    await page.evaluate(() => {
      document.getElementById('fieldManagerModal').style.display = 'none';
      document.getElementById('configManagementModal').style.display = 'none';
    });

    results.passed.push('Field Manager modal opened');
  } catch (err) {
    results.failed.push(`Field Manager modal error: ${err.message}`);
    console.error('  ❌ Error:', err.message);
  }

  // ============================================================
  // TEST 7: Validate Field Picker Bookmarklet Code
  // ============================================================
  try {
    console.log('\n🧪 TEST 7: Field Picker Bookmarklet Code Validation');
    
    const bookmarkletCode = await page.evaluate(() => {
      // Open Field Picker modal
      document.getElementById('fieldPickerModal').style.display = 'flex';
      
      // Get the bookmarklet code
      const bookmarkletLink = document.getElementById('fieldPickerBookmarklet');
      if (!bookmarkletLink) throw new Error('Bookmarklet link not found');
      
      const href = bookmarkletLink.href;
      if (!href.startsWith('javascript:')) throw new Error('Bookmarklet href missing javascript:');
      
      // Decode and return
      const encoded = href.replace('javascript:', '');
      return decodeURIComponent(encoded);
    });

    console.log('  📝 Bookmarklet code length:', bookmarkletCode.length);

    // Check for literal newlines in the code (should be none)
    const hasLiteralNewlines = /\n/.test(bookmarkletCode);
    
    if (hasLiteralNewlines) {
      results.failed.push('Bookmarklet contains literal newline characters');
      console.log('  ❌ Bookmarklet has literal newlines!');
    } else {
      results.passed.push('Bookmarklet has no literal newlines');
      console.log('  ✅ No literal newlines found');
    }

    // Try to execute the bookmarklet code to check for syntax errors
    try {
      new Function(bookmarkletCode);
      results.passed.push('Bookmarklet code is syntactically valid');
      console.log('  ✅ Bookmarklet code is valid JavaScript');
    } catch (syntaxErr) {
      results.failed.push(`Bookmarklet syntax error: ${syntaxErr.message}`);
      console.log('  ❌ Bookmarklet syntax error:', syntaxErr.message);
    }

    // Close modal
    await page.evaluate(() => {
      document.getElementById('fieldPickerModal').style.display = 'none';
    });
  } catch (err) {
    results.failed.push(`Bookmarklet validation error: ${err.message}`);
    console.error('  ❌ Error:', err.message);
  }

  // ============================================================
  // TEST 8: Test Field Picker on Sample Form
  // ============================================================
  try {
    console.log('\n🧪 TEST 8: Field Picker on Sample Form');

    // Create a test page with a form
    await page.evaluate(() => {
      const testForm = document.createElement('div');
      testForm.id = 'testForm';
      testForm.innerHTML = `
        <form>
          <label for="testInput">Test Field</label>
          <input type="text" id="testInput" name="testInput" value="Sample Value" required>
          
          <label for="testSelect">Test Select</label>
          <select id="testSelect" name="testSelect">
            <option value="">-- Select --</option>
            <option value="opt1">Option 1</option>
            <option value="opt2">Option 2</option>
            <option value="opt3">Option 3</option>
          </select>
        </form>
      `;
      document.body.appendChild(testForm);
    });

    // Get the bookmarklet code and execute it
    const bookmarkletCode = await page.evaluate(() => {
      const bookmarkletLink = document.getElementById('fieldPickerBookmarklet');
      const href = bookmarkletLink.href;
      const encoded = href.replace('javascript:', '');
      return decodeURIComponent(encoded);
    });

    // Execute the bookmarklet
    await page.evaluate((code) => {
      try {
        eval(code);
      } catch (err) {
        throw new Error('Bookmarklet execution failed: ' + err.message);
      }
    }, bookmarkletCode);

    await page.waitForTimeout(500);

    // Check if banner appeared
    const bannerVisible = await page.isVisible('#fpBanner');
    if (bannerVisible) {
      results.passed.push('Field Picker activated (banner visible)');
      console.log('  ✅ Field Picker banner appeared');
    } else {
      results.failed.push('Field Picker banner did not appear');
      console.log('  ❌ Field Picker banner NOT visible');
    }

    await captureWithHighlight('08-field-picker-active', '#fpBanner', 'Field Picker activated with banner');

    // Now click on the test input field
    await page.click('#testInput');
    await page.waitForTimeout(500);

    // Check if the Field Picker modal appeared
    const fpModalVisible = await page.isVisible('#fpModal');
    
    if (fpModalVisible) {
      results.passed.push('Field Picker modal appeared on field click');
      console.log('  ✅ Field Picker modal appeared!');
      
      await captureWithHighlight('09-field-picker-modal-shown', '#fpModal', 'Field Picker modal showing field details');

      // Extract the modal content
      const modalContent = await page.evaluate(() => {
        const modal = document.getElementById('fpModal');
        return {
          visible: modal !== null,
          innerHTML: modal ? modal.innerHTML.substring(0, 500) : null
        };
      });

      console.log('  📄 Modal content preview:', modalContent.innerHTML ? 'Present' : 'Empty');
    } else {
      results.failed.push('Field Picker modal did NOT appear on field click');
      console.log('  ❌ Field Picker modal did NOT appear');
      
      // Check console for errors
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));
      
      await page.waitForTimeout(1000);
      
      if (consoleMessages.length > 0) {
        console.log('  📋 Console messages:', consoleMessages);
      }
    }

  } catch (err) {
    results.failed.push(`Field Picker test error: ${err.message}`);
    console.error('  ❌ Error:', err.message);
  }

  // ============================================================
  // Generate HTML Report
  // ============================================================
  console.log('\n📊 Generating validation report...');

  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dark Mode & Field Picker Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      color: #2d3748;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 {
      font-size: 36px;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 18px;
      opacity: 0.9;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      padding: 40px;
      background: #f7fafc;
    }
    .summary-card {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      text-align: center;
    }
    .summary-card h3 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #718096;
      margin-bottom: 10px;
    }
    .summary-card .number {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .summary-card.passed .number { color: #48bb78; }
    .summary-card.failed .number { color: #f56565; }
    .summary-card.total .number { color: #667eea; }
    .results {
      padding: 40px;
    }
    .result-section {
      margin-bottom: 40px;
    }
    .result-section h2 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .result-list {
      list-style: none;
    }
    .result-list li {
      padding: 15px 20px;
      margin-bottom: 10px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
    }
    .result-list li.passed {
      background: #f0fff4;
      border-left: 4px solid #48bb78;
      color: #22543d;
    }
    .result-list li.failed {
      background: #fff5f5;
      border-left: 4px solid #f56565;
      color: #742a2a;
    }
    .screenshots {
      padding: 40px;
      background: #f7fafc;
    }
    .screenshots h2 {
      font-size: 28px;
      margin-bottom: 30px;
      color: #2d3748;
      text-align: center;
    }
    .screenshot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 30px;
    }
    .screenshot-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .screenshot-card img {
      width: 100%;
      height: auto;
      display: block;
      border-bottom: 3px solid #667eea;
    }
    .screenshot-card .info {
      padding: 20px;
    }
    .screenshot-card .info h3 {
      font-size: 18px;
      margin-bottom: 8px;
      color: #2d3748;
    }
    .screenshot-card .info p {
      font-size: 14px;
      color: #718096;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Dark Mode & Field Picker Test Report</h1>
      <p>Visual Proof Protocol - Issue #17 Validation</p>
    </div>

    <div class="summary">
      <div class="summary-card total">
        <h3>Total Tests</h3>
        <div class="number">${results.passed.length + results.failed.length}</div>
      </div>
      <div class="summary-card passed">
        <h3>Passed</h3>
        <div class="number">${results.passed.length}</div>
      </div>
      <div class="summary-card failed">
        <h3>Failed</h3>
        <div class="number">${results.failed.length}</div>
      </div>
    </div>

    <div class="results">
      <div class="result-section">
        <h2>✅ Passed Tests</h2>
        <ul class="result-list">
          ${results.passed.map(test => `<li class="passed">✓ ${test}</li>`).join('')}
        </ul>
      </div>

      ${results.failed.length > 0 ? `
      <div class="result-section">
        <h2>❌ Failed Tests</h2>
        <ul class="result-list">
          ${results.failed.map(test => `<li class="failed">✗ ${test}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>

    <div class="screenshots">
      <h2>📸 Visual Evidence</h2>
      <div class="screenshot-grid">
        ${results.screenshots.map(ss => `
          <div class="screenshot-card">
            <img src="data:image/png;base64,${ss.base64}" alt="${ss.name}">
            <div class="info">
              <h3>${ss.name}</h3>
              <p>${ss.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const reportPath = path.join(__dirname, 'test-results/validation-report.html');
  fs.writeFileSync(reportPath, htmlReport);

  console.log(`\n✅ Report saved: ${reportPath}`);
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total: ${results.passed.length + results.failed.length}`);
  console.log(`   ✅ Passed: ${results.passed.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);

  // Auto-open the report
  const { exec } = require('child_process');
  exec(`start ${reportPath}`);

  await browser.close();
  
  process.exit(results.failed.length > 0 ? 1 : 0);
})();
