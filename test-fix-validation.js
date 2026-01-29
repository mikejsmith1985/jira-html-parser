/**
 * Manual validation script for Issue #17 and #18 fixes
 * Run with: node test-fix-validation.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating fixes for GH Issues #17 and #18...\n');

// Read the main HTML file
const htmlPath = path.join(__dirname, 'link-generator.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

let allPassed = true;

// Test 1: Check Save Preset Modal dark mode CSS
console.log('Test 1: Save Preset Modal Dark Mode CSS');
console.log('─'.repeat(50));

const savePresetModalCSS = html.includes('#savePresetModal div[style*="background:#f5f5f5"]') ||
                            html.includes('#savePresetModal div[style*="background:#f9f9f9"]');

if (savePresetModalCSS) {
  console.log('✅ Save Preset modal CSS selectors found');
} else {
  console.log('❌ Save Preset modal CSS selectors NOT found');
  allPassed = false;
}

// Check for label/span/strong styling
const savePresetTextStyles = html.includes('#savePresetModal label') &&
                              html.includes('#savePresetModal span') &&
                              html.includes('#savePresetModal strong');

if (savePresetTextStyles) {
  console.log('✅ Save Preset modal text styling found');
} else {
  console.log('❌ Save Preset modal text styling NOT found');
  allPassed = false;
}

// Check for input/textarea styling
const savePresetInputStyles = html.includes('#savePresetModal input') &&
                               html.includes('#savePresetModal textarea');

if (savePresetInputStyles) {
  console.log('✅ Save Preset modal input styling found');
} else {
  console.log('❌ Save Preset modal input styling NOT found');
  allPassed = false;
}

console.log('');

// Test 2: Check Field Picker bookmarklet for table prefix stripping
console.log('Test 2: Field Picker Bookmarklet Table Prefix Logic');
console.log('─'.repeat(50));

// The bookmarklet is on one very long line, so we just search for the strings
const hasCleanId = html.includes('let cleanId=meta.id');
const hasSplitCheck = html.includes("cleanId.includes('.')");
const hasSplitLogic = html.includes('cleanId=cleanId.split');
const hasPopLogic = html.includes('.pop()');
const usesCleanId = html.includes('id:cleanId');

if (hasCleanId) {
  console.log('✅ cleanId variable declaration found');
} else {
  console.log('❌ cleanId variable declaration NOT found');
  allPassed = false;
}

if (hasSplitCheck) {
  console.log('✅ Table prefix detection (includes) found');
} else {
  console.log('❌ Table prefix detection NOT found');
  allPassed = false;
}

if (hasSplitLogic && hasPopLogic) {
  console.log('✅ Table prefix stripping logic (.split().pop()) found');
} else {
  console.log('❌ Table prefix stripping logic NOT found');
  allPassed = false;
}

if (usesCleanId) {
  console.log('✅ JSON uses cleanId instead of meta.id');
} else {
  console.log('❌ JSON still uses meta.id (should use cleanId)');
  allPassed = false;
}

// Test the logic
console.log('\n📝 Testing logic with sample data:');

const testCases = [
  { input: 'change_request.short_description', expected: 'short_description' },
  { input: 'incident.priority', expected: 'priority' },
  { input: 'simple_field', expected: 'simple_field' }
];

for (const testCase of testCases) {
  let cleanId = testCase.input;
  if (cleanId.includes('.')) {
    cleanId = cleanId.split('.').pop();
  }
  const pass = cleanId === testCase.expected;
  console.log(`  ${pass ? '✅' : '❌'} ${testCase.input} -> ${cleanId} (expected: ${testCase.expected})`);
  if (!pass) allPassed = false;
}

console.log('');

// Test 3: Check ServiceNow URL generation for table prefix stripping
console.log('Test 3: ServiceNow URL Generation Table Prefix Logic');
console.log('─'.repeat(50));

// Find the ServiceNow URL generation function
const snowUrlMatch = html.match(/\/\/ ServiceNow link generation[\s\S]{0,2000}queryParts\.push/);

if (snowUrlMatch) {
  const snowSection = snowUrlMatch[0];
  
  // Check for .split('.').pop() logic
  const hasSplitPop = snowSection.includes(".split('.').pop()");
  const hasComment = snowSection.includes('FIX for Issue #18');
  const hasFieldName = snowSection.includes('let fieldName = f.name');
  const hasIncludesCheck = snowSection.includes("if (fieldName.includes('.')");
  
  if (hasSplitPop && hasFieldName && hasIncludesCheck) {
    console.log('✅ ServiceNow URL generation strips table prefixes');
  } else {
    console.log('❌ ServiceNow URL generation does NOT strip table prefixes');
    allPassed = false;
  }
  
  if (hasComment) {
    console.log('✅ Fix comment for Issue #18 found');
  }
  
  // Show relevant lines
  const lines = snowSection.split('\n');
  const relevantLines = lines.filter(line => 
    line.includes('let fieldName') || 
    line.includes('fieldName.split') ||
    line.includes('queryParts.push')
  );
  
  if (relevantLines.length > 0) {
    console.log('\n   Key lines:');
    relevantLines.forEach(line => console.log('   ' + line.trim()));
  }
  
} else {
  console.log('❌ ServiceNow URL generation logic NOT found');
  allPassed = false;
}

console.log('');
console.log('═'.repeat(50));

if (allPassed) {
  console.log('✅ ALL TESTS PASSED');
  console.log('\n📋 Summary:');
  console.log('  • Save Preset modal dark mode CSS: ✅');
  console.log('  • Field Picker table prefix stripping: ✅');
  console.log('  • ServiceNow URL generation fix: ✅');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('\nPlease review the failures above.');
  process.exit(1);
}
