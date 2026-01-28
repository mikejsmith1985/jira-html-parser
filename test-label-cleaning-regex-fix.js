// Quick test to verify the regex fix for label cleaning

console.log('Testing Label Cleaning Regex Fix');
console.log('=================================\n');

// Test cases
const testCases = [
  'Short Description Required',
  'Risk Mandatory',
  'Summary Required.',
  'Status Mandatory!',
  'Priority  Required  ',
  'Category Required, Required',
  'Field with Required in middle Required',
  'Required at start',
  'Required'
];

// OLD REGEX (with double backslashes - WRONG)
const oldRegex1 = /\\s+(Required|Mandatory)[\\s.,;:!?]*$/gi;
const oldRegex2 = /\\s+(Required|Mandatory)\\b/gi;

// NEW REGEX (with single backslashes - CORRECT)
const newRegex1 = /\s+(Required|Mandatory)[\s.,;:!?]*$/gi;
const newRegex2 = /\s+(Required|Mandatory)\b/gi;

testCases.forEach(original => {
  // Apply OLD regex
  let labelOld = original;
  labelOld = labelOld.replace(oldRegex1, '').trim();
  labelOld = labelOld.replace(oldRegex2, '').trim();
  
  // Apply NEW regex
  let labelNew = original;
  labelNew = labelNew.replace(newRegex1, '').trim();
  labelNew = labelNew.replace(newRegex2, '').trim();
  
  const fixed = labelOld !== labelNew;
  const icon = fixed ? '✅ FIXED' : (labelNew.includes('Required') || labelNew.includes('Mandatory') ? '⚠️  UNCHANGED' : '✓ OK');
  
  console.log(`${icon} "${original}"`);
  console.log(`   OLD: "${labelOld}"`);
  console.log(`   NEW: "${labelNew}"`);
  console.log();
});

console.log('\nSummary:');
console.log('- OLD regex uses \\\\s (matches literal backslash+s)');
console.log('- NEW regex uses \\s (matches whitespace character class)');
console.log('- This fixes the label cleaning for both Jira and ServiceNow bookmarklets');
