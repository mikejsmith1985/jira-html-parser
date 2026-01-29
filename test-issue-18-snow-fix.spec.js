/**
 * Test for Issue #18 - ServiceNow field population fix
 * Verifies that field names are stripped of table prefixes in sysparm_query
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🧪 Testing ServiceNow URL Generation - Issue #18\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const filePath = path.resolve(__dirname, 'link-generator.html');
  await page.goto(`file:///${filePath.replace(/\\/g, '/')}`);
  await page.waitForLoadState('networkidle');

  console.log('✅ Page loaded\n');

  try {
    // Step 1: Set application type to ServiceNow
    console.log('📝 Step 1: Setting app type to ServiceNow...');
    await page.selectOption('#appType', 'servicenow');
    await page.waitForTimeout(500);
    console.log('   ✅ App type set to ServiceNow\n');

    // Step 2: Set base URL
    console.log('📝 Step 2: Setting base URL...');
    await page.evaluate(() => {
      const baseUrlInput = document.getElementById('baseUrl');
      if (baseUrlInput) {
        baseUrlInput.value = 'https://example.service-now.com';
        baseUrlInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(300);
    console.log('   ✅ Base URL set\n');

    // Step 3: Set issue type
    console.log('📝 Step 3: Setting issue type...');
    await page.evaluate(() => {
      const issueTypeInput = document.getElementById('issueType');
      if (issueTypeInput) {
        issueTypeInput.value = 'change_request';
        issueTypeInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(300);
    console.log('   ✅ Issue type set to: change_request\n');

    // Step 4: Add fields with table prefixes (as they are stored)
    console.log('📝 Step 4: Adding fields with table prefixes...');
    
    const testFields = [
      { name: 'change_request.short_description', value: 'Test Change Request' },
      { name: 'change_request.description', value: 'This is a detailed description' },
      { name: 'change_request.u_impact', value: '1-High' },
      { name: 'change_request.justification', value: 'Business justification here' }
    ];

    await page.evaluate((fields) => {
      // Clear existing fields first
      const fieldsContainer = document.getElementById('fields');
      fieldsContainer.innerHTML = '';
      
      // Add test fields
      fields.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'field-row';
        fieldDiv.innerHTML = `
          <input type="text" class="field-name" value="${field.name}" placeholder="Field Name">
          <input type="text" class="field-value" value="${field.value}" placeholder="Field Value">
          <button type="button" class="btn-remove" onclick="removeField(this)">Remove</button>
        `;
        fieldsContainer.appendChild(fieldDiv);
      });
    }, testFields);

    await page.waitForTimeout(500);
    console.log('   ✅ Added 4 fields with table prefixes:\n');
    testFields.forEach(f => {
      console.log(`      - ${f.name}`);
    });
    console.log('');

    // Step 5: Generate the link
    console.log('📝 Step 5: Generating ServiceNow link...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Step 6: Extract and analyze the generated URL
    console.log('📝 Step 6: Analyzing generated URL...\n');
    
    const generatedUrl = await page.evaluate(() => {
      return document.getElementById('link').textContent;
    });

    console.log('📋 Generated URL:');
    console.log(`   ${generatedUrl}\n`);

    // Parse the URL
    const urlObj = new URL(generatedUrl);
    const sysparmQuery = urlObj.searchParams.get('sysparm_query');

    console.log('🔍 Decoded sysparm_query:');
    console.log(`   ${decodeURIComponent(sysparmQuery)}\n`);

    // Validate: Check if field names have table prefixes or not
    const queryParts = decodeURIComponent(sysparmQuery).split('^');
    
    let hasTablePrefixes = false;
    let correctFieldNames = true;

    console.log('✅ Field Name Validation:\n');
    queryParts.forEach(part => {
      const [fieldName, value] = part.split('=');
      const hasPrefix = fieldName.includes('.');
      
      if (hasPrefix) {
        console.log(`   ❌ ${fieldName} (HAS TABLE PREFIX - WRONG)`);
        hasTablePrefixes = true;
        correctFieldNames = false;
      } else {
        console.log(`   ✅ ${fieldName} (No table prefix - CORRECT)`);
      }
    });

    console.log('');

    // Final result
    if (!hasTablePrefixes && correctFieldNames) {
      console.log('╔════════════════════════════════════════════════════╗');
      console.log('║  ✅ TEST PASSED - Issue #18 FIXED!                ║');
      console.log('╚════════════════════════════════════════════════════╝\n');
      console.log('✅ All field names are correctly stripped of table prefixes');
      console.log('✅ ServiceNow will now populate the fields correctly!\n');
      
      console.log('Expected behavior:');
      console.log('  - Field names like "change_request.short_description"');
      console.log('  - Should become just "short_description" in the URL');
      console.log('  - ServiceNow can then populate the field values ✅\n');
    } else {
      console.log('╔════════════════════════════════════════════════════╗');
      console.log('║  ❌ TEST FAILED - Issue #18 NOT FIXED             ║');
      console.log('╚════════════════════════════════════════════════════╝\n');
      console.log('❌ Field names still have table prefixes');
      console.log('❌ ServiceNow will NOT populate the fields\n');
    }

    // Generate a visual report
    const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Issue #18 Test Report - ServiceNow Field Population</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      color: #2d3748;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: ${!hasTablePrefixes ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)'};
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
    .status {
      padding: 40px;
      text-align: center;
      background: #f7fafc;
    }
    .status-badge {
      display: inline-block;
      padding: 20px 40px;
      border-radius: 50px;
      font-size: 24px;
      font-weight: bold;
      background: ${!hasTablePrefixes ? '#48bb78' : '#f56565'};
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .comparison {
      padding: 40px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    .comparison-card {
      background: #f7fafc;
      padding: 30px;
      border-radius: 12px;
      border: 2px solid;
    }
    .comparison-card.before {
      border-color: #f56565;
    }
    .comparison-card.after {
      border-color: #48bb78;
    }
    .comparison-card h3 {
      font-size: 20px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .comparison-card.before h3 {
      color: #c53030;
    }
    .comparison-card.after h3 {
      color: #2f855a;
    }
    .field-example {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 10px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      border-left: 4px solid;
    }
    .field-example.wrong {
      border-left-color: #f56565;
      color: #c53030;
    }
    .field-example.correct {
      border-left-color: #48bb78;
      color: #2f855a;
    }
    .url-section {
      padding: 40px;
    }
    .url-section h2 {
      margin-bottom: 20px;
      color: #2d3748;
    }
    .url-box {
      background: #f7fafc;
      padding: 20px;
      border-radius: 12px;
      border: 2px solid #cbd5e0;
      word-break: break-all;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.8;
    }
    .validation-list {
      padding: 40px;
      background: #f7fafc;
    }
    .validation-list h2 {
      margin-bottom: 20px;
      color: #2d3748;
    }
    .validation-item {
      padding: 15px 20px;
      margin-bottom: 10px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
    }
    .validation-item.pass {
      background: #f0fff4;
      border-left: 4px solid #48bb78;
      color: #22543d;
    }
    .validation-item.fail {
      background: #fff5f5;
      border-left: 4px solid #f56565;
      color: #742a2a;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${!hasTablePrefixes ? '✅' : '❌'} Issue #18 Test Report</h1>
      <p>ServiceNow Field Population Fix</p>
    </div>

    <div class="status">
      <div class="status-badge">
        ${!hasTablePrefixes ? '✅ FIXED' : '❌ FAILED'}
      </div>
    </div>

    <div class="comparison">
      <div class="comparison-card before">
        <h3>❌ Before Fix (BROKEN)</h3>
        <p style="margin-bottom: 15px; color: #4a5568;">Field names included table prefixes:</p>
        <div class="field-example wrong">change_request.short_description=Test</div>
        <div class="field-example wrong">change_request.description=Details</div>
        <div class="field-example wrong">change_request.u_impact=1-High</div>
        <p style="margin-top: 15px; color: #c53030; font-weight: 600;">ServiceNow ignores these fields!</p>
      </div>

      <div class="comparison-card after">
        <h3>✅ After Fix (WORKING)</h3>
        <p style="margin-bottom: 15px; color: #4a5568;">Field names stripped of table prefix:</p>
        <div class="field-example correct">short_description=Test</div>
        <div class="field-example correct">description=Details</div>
        <div class="field-example correct">u_impact=1-High</div>
        <p style="margin-top: 15px; color: #2f855a; font-weight: 600;">ServiceNow populates these fields! ✅</p>
      </div>
    </div>

    <div class="url-section">
      <h2>🔗 Generated URL</h2>
      <div class="url-box">${generatedUrl}</div>
    </div>

    <div class="validation-list">
      <h2>🔍 Field Name Validation</h2>
      ${queryParts.map(part => {
        const [fieldName] = part.split('=');
        const hasPrefix = fieldName.includes('.');
        return `
          <div class="validation-item ${hasPrefix ? 'fail' : 'pass'}">
            ${hasPrefix ? '❌' : '✅'} ${fieldName} ${hasPrefix ? '(Has table prefix - WRONG)' : '(No prefix - CORRECT)'}
          </div>
        `;
      }).join('')}
    </div>
  </div>
</body>
</html>
    `;

    const reportPath = path.join(__dirname, 'test-results', 'issue-18-report.html');
    fs.writeFileSync(reportPath, reportHtml);
    console.log(`📊 Visual report saved: ${reportPath}`);
    
    // Open the report
    const { exec } = require('child_process');
    exec(`start ${reportPath}`);

    await browser.close();
    process.exit(!hasTablePrefixes ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    await browser.close();
    process.exit(1);
  }
})();
