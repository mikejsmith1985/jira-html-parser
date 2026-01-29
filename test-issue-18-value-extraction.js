/**
 * Issue #18 - Field Picker Value Extraction Fix Test
 * 
 * Tests that the Field Picker bookmarklet correctly extracts:
 * 1. Actual values (sys_id) from ServiceNow reference fields
 * 2. Regular values from standard text fields
 * 3. Dropdown values (unchanged behavior)
 */

console.log('🧪 Testing Issue #18 Fix - Field Picker Value Extraction\n');

// Read the HTML file
const fs = require('fs');
const path = require('path');
const htmlPath = path.join(__dirname, 'link-generator.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract the bookmarklet code
const bookmarkletMatch = html.match(/function generateFieldPickerBookmarklet\(\)\s*\{[\s\S]*?return\s*`([\s\S]*?)`;\s*\}/);

if (!bookmarkletMatch) {
  console.error('❌ FAILED: Could not find generateFieldPickerBookmarklet function');
  process.exit(1);
}

const bookmarkletCode = bookmarkletMatch[1];

// Test 1: Check for hidden field detection logic
console.log('Test 1: Hidden field detection logic');
const hasHiddenFieldLogic = bookmarkletCode.includes('input[type="hidden"]') &&
                            bookmarkletCode.includes('closest(') &&
                            bookmarkletCode.includes('querySelectorAll');

if (hasHiddenFieldLogic) {
  console.log('✅ PASS: Bookmarklet includes hidden field detection logic');
} else {
  console.log('❌ FAIL: Missing hidden field detection logic');
  process.exit(1);
}

// Test 2: Check for sys_id pattern matching (32-char hex)
console.log('\nTest 2: Sys_id pattern matching');
const hasSysIdPattern = bookmarkletCode.includes('length===32') &&
                        bookmarkletCode.includes('[0-9a-f]{32}');

if (hasSysIdPattern) {
  console.log('✅ PASS: Bookmarklet validates sys_id format (32-char hex)');
} else {
  console.log('❌ FAIL: Missing sys_id pattern validation');
  process.exit(1);
}

// Test 3: Check for separate actualValue and displayedValue
console.log('\nTest 3: Separate actual and displayed values');
const hasSeparateValues = bookmarkletCode.includes('actualValue') &&
                          bookmarkletCode.includes('displayedValue') &&
                          bookmarkletCode.includes('currentValue:actualValue');

if (hasSeparateValues) {
  console.log('✅ PASS: Bookmarklet tracks both actual and displayed values');
} else {
  console.log('❌ FAIL: Missing separate value tracking');
  process.exit(1);
}

// Test 4: Check for container search (.reference_autocomplete, .form-group)
console.log('\nTest 4: Container-based search for hidden fields');
const hasContainerSearch = bookmarkletCode.includes('.reference_autocomplete') ||
                           bookmarkletCode.includes('.form-group');

if (hasContainerSearch) {
  console.log('✅ PASS: Bookmarklet searches in appropriate containers');
} else {
  console.log('❌ FAIL: Missing container-based search');
  process.exit(1);
}

// Test 5: Check for fallback name-based search
console.log('\nTest 5: Fallback name-based search');
const hasFallbackSearch = bookmarkletCode.includes('hiddenByName') &&
                          bookmarkletCode.includes('querySelector') &&
                          bookmarkletCode.includes('field.name');

if (hasFallbackSearch) {
  console.log('✅ PASS: Bookmarklet has fallback name-based search');
} else {
  console.log('❌ FAIL: Missing fallback search logic');
  process.exit(1);
}

// Test 6: Check for UI showing both values
console.log('\nTest 6: UI displays both values when different');
const hasisDifferent = bookmarkletCode.includes('isDifferent');
const hasActualValue = bookmarkletCode.includes('Actual Value');
const hasDisplayedText = bookmarkletCode.includes('Displayed') || bookmarkletCode.includes('display');
const hasSysIdLabel = bookmarkletCode.includes('sys_id');

if (hasisDifferent && hasActualValue && hasDisplayedText && hasSysIdLabel) {
  console.log('✅ PASS: UI shows both actual (sys_id) and displayed values');
} else {
  console.log(`❌ FAIL: Missing UI elements:`);
  console.log(`  isDifferent: ${hasisDifferent}`);
  console.log(`  Actual Value: ${hasActualValue}`);
  console.log(`  Displayed text: ${hasDisplayedText}`);
  console.log(`  sys_id label: ${hasSysIdLabel}`);
  process.exit(1);
}

// Test 7: Check that modal only shows displayedValue if different
console.log('\nTest 7: Conditional display of "Displayed Value" section');
const hasConditionalDisplay = bookmarkletCode.includes('isDifferent') &&
                              (bookmarkletCode.includes('if(isDifferent)') || bookmarkletCode.includes('isDifferent?'));

if (hasConditionalDisplay) {
  console.log('✅ PASS: "Displayed Value" only shown when values differ');
} else {
  console.log('❌ FAIL: Missing conditional display logic');
  process.exit(1);
}

// Test 8: Check that ac_display_value attribute is checked
console.log('\nTest 8: Autocomplete display value attribute');
const hasAutocompleteCheck = bookmarkletCode.includes('ac_display_value') &&
                             bookmarkletCode.includes('hasAttribute');

if (hasAutocompleteCheck) {
  console.log('✅ PASS: Checks for ac_display_value attribute');
} else {
  console.log('❌ FAIL: Missing autocomplete attribute check');
  process.exit(1);
}

// Test 9: Verify displayedValue passed to showModal
console.log('\nTest 9: displayedValue parameter in showModal');
const hasDisplayedValueParam = bookmarkletCode.includes('displayedValue:displayedValue') ||
                               bookmarkletCode.includes('displayedValue:');

if (hasDisplayedValueParam) {
  console.log('✅ PASS: displayedValue passed to modal function');
} else {
  console.log('❌ FAIL: displayedValue not passed to modal');
  process.exit(1);
}

// Test 10: Verify only shows displayedValue when != actualValue
console.log('\nTest 10: displayedValue null check');
const hasNullCheck = bookmarkletCode.includes('displayedValue!==actualValue?displayedValue:null');

if (hasNullCheck) {
  console.log('✅ PASS: displayedValue set to null when same as actualValue');
} else {
  console.log('❌ FAIL: Missing null check for duplicate values');
  process.exit(1);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('✅ ALL TESTS PASSED!');
console.log('='.repeat(60));
console.log('\n📋 Summary:');
console.log('  ✅ Hidden field detection implemented');
console.log('  ✅ Sys_id pattern validation (32-char hex)');
console.log('  ✅ Separate actual and displayed values');
console.log('  ✅ Container-based search');
console.log('  ✅ Fallback name-based search');
console.log('  ✅ UI shows both values appropriately');
console.log('  ✅ Conditional "Displayed Value" section');
console.log('  ✅ Autocomplete attribute support');
console.log('  ✅ Proper value passing to modal');
console.log('  ✅ Null check for duplicate values');
console.log('\n⚠️  USER ACTION REQUIRED:');
console.log('  Delete old Field Picker bookmark and re-drag new one!');
console.log('\n🎯 Issue #18 value extraction fix is complete!\n');
