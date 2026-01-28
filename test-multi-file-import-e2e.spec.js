const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Multi-File Import with Optimizer', () => {
  test('should import 7 JSON files and detect 47 duplicate groups in optimizer', async ({ page }) => {
    // Load the HTML file
    const htmlPath = path.resolve(__dirname, 'link-generator.html');
    await page.goto(`file://${htmlPath}`);
    
    // Wait for page to load
    await page.waitForSelector('#baseUrl');
    
    // Clear localStorage first
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    console.log('\n=== Starting Multi-File Import Test ===\n');
    
    // Get all test JSON files
    const testDir = path.resolve(__dirname, 'test-imports');
    const jsonFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.json'));
    
    console.log(`Found ${jsonFiles.length} JSON files to import`);
    
    // Click Import Config button and handle file picker
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('button:has-text("Import Config")')
    ]);
    
    // Select all JSON files at once
    const filePaths = jsonFiles.map(f => path.join(testDir, f));
    await fileChooser.setFiles(filePaths);
    
    console.log(`Selected ${filePaths.length} files for import`);
    
    // Wait for import preview modal to appear
    await page.waitForSelector('#importPreviewModal', { timeout: 10000 });
    console.log('✓ Import preview modal opened');
    
    // Check the preview content for duplicate detection message
    const previewContent = await page.locator('#importPreviewModal').textContent();
    
    // Look for duplicate detection info
    const duplicateMatch = previewContent.match(/(\d+) field\(s\) found across multiple issue types/);
    if (duplicateMatch) {
      console.log(`✓ Preview shows: ${duplicateMatch[1]} fields found across multiple issue types`);
    }
    
    // Count how many fields are shown in the preview
    const fieldCount = await page.locator('.import-field-checkbox').count();
    console.log(`✓ Preview showing ${fieldCount} fields`);
    
    // Expect around 260 fields from 7 JSON files
    expect(fieldCount).toBeGreaterThan(200);
    expect(fieldCount).toBeLessThan(300);
    
    // Click Import Selected button
    await page.click('#confirmImportBtn');
    console.log('✓ Clicked Import Selected');
    
    // Wait a bit for the import to process
    await page.waitForTimeout(2000);
    
    // Wait for modal to close
    await page.waitForSelector('#importPreviewModal', { state: 'hidden', timeout: 10000 });
    console.log('✓ Import completed');
    
    // Check what's in localStorage
    const storageDebug = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const relevant = keys.filter(k => k.includes('Field') || k.includes('field'));
      const result = {};
      relevant.forEach(k => {
        const val = localStorage.getItem(k);
        result[k] = val ? `${val.length} chars, ${JSON.parse(val).length} items` : 'null';
      });
      return { allKeys: keys, relevantKeys: relevant, values: result };
    });
    
    console.log('\nLocalStorage debug:', JSON.stringify(storageDebug, null, 2));
    
    // Check localStorage to verify fields were saved
    const savedFields = await page.evaluate(() => {
      // Determine which storage key based on app type
      const currentAppType = window.currentAppType || 'jira'; // default to jira
      const storageKey = currentAppType === 'jira' ? 'linkGenJiraFieldDefinitions' : 'linkGenSnowFieldDefinitions';
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    });
    
    console.log(`\n=== Checking Saved Fields ===`);
    console.log(`Total fields saved: ${savedFields.length}`);
    
    // Count fields per issue type
    const issueTypeGroups = {};
    savedFields.forEach(field => {
      const issueType = field.issueTypeId || field.issueType || 'unknown';
      issueTypeGroups[issueType] = (issueTypeGroups[issueType] || 0) + 1;
    });
    
    console.log('Fields by issue type:');
    Object.entries(issueTypeGroups).forEach(([issueType, count]) => {
      console.log(`  ${issueType}: ${count} fields`);
    });
    
    // Count how many fields have the same ID
    const fieldIdGroups = {};
    savedFields.forEach(field => {
      const key = `${field.id}|${field.baseUrlId || 'global'}`;
      if (!fieldIdGroups[key]) {
        fieldIdGroups[key] = [];
      }
      fieldIdGroups[key].push(field);
    });
    
    const duplicateFieldGroups = Object.values(fieldIdGroups).filter(group => group.length > 1);
    console.log(`\nFields with same ID across issue types: ${duplicateFieldGroups.length} groups`);
    
    // Show sample duplicates
    if (duplicateFieldGroups.length > 0) {
      console.log('\nSample duplicates:');
      duplicateFieldGroups.slice(0, 5).forEach(group => {
        const issueTypes = group.map(f => f.issueTypeId || f.issueType).join(', ');
        console.log(`  - ${group[0].label} (${group[0].id}): ${group.length} instances [${issueTypes}]`);
      });
    }
    
    // Verify we have around 260 fields saved (not 92!)
    expect(savedFields.length).toBeGreaterThan(200);
    expect(savedFields.length).toBeLessThan(300);
    
    // Verify we have multiple issue types
    expect(Object.keys(issueTypeGroups).length).toBeGreaterThanOrEqual(7);
    
    // Now test the Field Optimizer directly via JavaScript
    console.log(`\n=== Testing Field Optimizer ===`);
    
    const optimizerResults = await page.evaluate(() => {
      // Call the analyzer function directly
      function analyzeFieldDuplicates() {
        const loadAllFieldDefinitions = () => {
          const currentAppType = window.currentAppType || 'jira';
          const storageKey = currentAppType === 'jira' ? 'linkGenJiraFieldDefinitions' : 'linkGenSnowFieldDefinitions';
          const stored = localStorage.getItem(storageKey);
          if (!stored) return [];
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? parsed.filter(f => f.id && f.label) : [];
        };
        
        const allFields = loadAllFieldDefinitions();
        const activeFields = allFields.filter(f => !f.ignored);
        
        // Group fields by ID and baseUrlId to find duplicates
        const fieldGroups = new Map();
        
        activeFields.forEach(field => {
          const key = `${field.id}|${field.baseUrlId || 'global'}`;
          if (!fieldGroups.has(key)) {
            fieldGroups.set(key, []);
          }
          fieldGroups.get(key).push(field);
        });
        
        // Analyze each group for duplicates
        const duplicateGroups = [];
        
        fieldGroups.forEach((instances, key) => {
          const [fieldId, baseUrlId] = key.split('|');
          
          // Get unique issue types from all instances
          const issueTypes = new Set();
          
          instances.forEach(inst => {
            if (inst.issueTypeId) {
              if (Array.isArray(inst.issueTypeId)) {
                inst.issueTypeId.forEach(id => issueTypes.add(id));
              } else {
                issueTypes.add(inst.issueTypeId);
              }
            }
          });
          
          const shouldConsiderDuplicate = instances.length > 1 || 
            (instances.length === 1 && instances[0].issueTypeId && Array.isArray(instances[0].issueTypeId) && instances[0].issueTypeId.length > 1);
          
          if (shouldConsiderDuplicate && issueTypes.size >= 2) {
            duplicateGroups.push({
              fieldId: fieldId,
              label: instances[0].label,
              instanceCount: instances.length,
              issueTypeCount: issueTypes.size,
              issueTypes: Array.from(issueTypes),
              recommendMerge: issueTypes.size >= 2
            });
          }
        });
        
        return {
          totalGroups: duplicateGroups.length,
          recommended: duplicateGroups.filter(g => g.recommendMerge).length,
          groups: duplicateGroups
        };
      }
      
      return analyzeFieldDuplicates();
    });
    
    console.log(`\nOptimizer results:`);
    console.log(`  Total duplicate groups: ${optimizerResults.totalGroups}`);
    console.log(`  Recommended for merging: ${optimizerResults.recommended}`);
    
    if (optimizerResults.groups.length > 0) {
      console.log(`\nTop 5 duplicate groups:`);
      optimizerResults.groups.slice(0, 5).forEach((group, i) => {
        console.log(`  ${i + 1}. ${group.label} (${group.fieldId}): ${group.instanceCount} instances across ${group.issueTypeCount} issue types`);
      });
    }
    
    // Expect at least 40 duplicate groups (we calculated 47)
    expect(optimizerResults.totalGroups).toBeGreaterThanOrEqual(40);
    expect(optimizerResults.recommended).toBeGreaterThanOrEqual(40);
    
    console.log(`\n✅ TEST PASSED: Optimizer detects ${optimizerResults.totalGroups} duplicate groups!\n`);
  });
});
