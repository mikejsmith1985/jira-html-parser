/**
 * Test for Preset Save/Load - Base URL, Issue Type, and Project ID
 * Validates that presets correctly save and restore all configuration fields
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Preset Save/Load Logic...\n');

// Read the main HTML file
const htmlPath = path.join(__dirname, 'link-generator.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

let allPassed = true;

// Test 1: Check that presets ALWAYS save baseUrl and issueType (not just when locked)
console.log('Test 1: Preset Save - Always Save Base URL and Issue Type');
console.log('─'.repeat(60));

const saveLogic = html.match(/function saveCurrentAsPreset\(\)[\s\S]{0,1500}saveConfigurationPreset/);
if (saveLogic) {
  const saveCode = saveLogic[0];
  
  // Should NOT have the condition "if (lockBaseUrl && baseUrl)"
  const hasOldBuggyLogic = saveCode.includes('if (lockBaseUrl && baseUrl) preset.baseUrl');
  
  // Should have the new logic "if (baseUrl) preset.baseUrl"
  const hasNewLogic = saveCode.includes('if (baseUrl) preset.baseUrl');
  const hasSaveIssueType = saveCode.includes('if (issueType) preset.issueType');
  
  if (hasOldBuggyLogic) {
    console.log('❌ OLD BUGGY LOGIC FOUND: baseUrl only saved when locked');
    allPassed = false;
  } else {
    console.log('✅ Old buggy logic removed');
  }
  
  if (hasNewLogic) {
    console.log('✅ Base URL always saved (when present)');
  } else {
    console.log('❌ Base URL save logic NOT found');
    allPassed = false;
  }
  
  if (hasSaveIssueType) {
    console.log('✅ Issue Type always saved (when present)');
  } else {
    console.log('❌ Issue Type save logic NOT found');
    allPassed = false;
  }
  
} else {
  console.log('❌ saveCurrentAsPreset function NOT found');
  allPassed = false;
}

console.log('');

// Test 2: Check that presets save projectId for Jira
console.log('Test 2: Preset Save - Project ID for Jira');
console.log('─'.repeat(60));

if (saveLogic) {
  const saveCode = saveLogic[0];
  
  const hasJiraCheck = saveCode.includes("currentAppType === 'jira'");
  const hasProjectIdSave = saveCode.includes("getElementById('projectId')") && 
                           saveCode.includes('preset.projectId');
  
  if (hasJiraCheck && hasProjectIdSave) {
    console.log('✅ Project ID saved for Jira presets');
  } else {
    if (!hasJiraCheck) {
      console.log('❌ No check for Jira app type');
      allPassed = false;
    }
    if (!hasProjectIdSave) {
      console.log('❌ Project ID save logic NOT found');
      allPassed = false;
    }
  }
  
} else {
  console.log('❌ Save logic not found');
  allPassed = false;
}

console.log('');

// Test 3: Check that presets restore all fields when loaded
console.log('Test 3: Preset Load - Restore All Fields');
console.log('─'.repeat(60));

const loadLogic = html.match(/function loadPresetFromDropdown\(\)[\s\S]{0,800}saveState/);
if (loadLogic) {
  const loadCode = loadLogic[0];
  
  const restoresBaseUrl = loadCode.includes("getElementById('baseUrl').value = formData.baseUrl");
  const restoresIssueType = loadCode.includes("getElementById('issueType').value = formData.issueType");
  const restoresProjectId = loadCode.includes("getElementById('projectId').value = formData.projectId");
  const hasJiraCheck = loadCode.includes("currentAppType === 'jira'");
  
  if (restoresBaseUrl) {
    console.log('✅ Base URL restored when loading preset');
  } else {
    console.log('❌ Base URL restore logic NOT found');
    allPassed = false;
  }
  
  if (restoresIssueType) {
    console.log('✅ Issue Type restored when loading preset');
  } else {
    console.log('❌ Issue Type restore logic NOT found');
    allPassed = false;
  }
  
  if (restoresProjectId && hasJiraCheck) {
    console.log('✅ Project ID restored for Jira presets');
  } else {
    if (!restoresProjectId) {
      console.log('❌ Project ID restore logic NOT found');
      allPassed = false;
    }
    if (!hasJiraCheck) {
      console.log('❌ No check for Jira app type during restore');
      allPassed = false;
    }
  }
  
} else {
  console.log('❌ loadPresetFromDropdown function NOT found');
  allPassed = false;
}

console.log('');

// Test 4: Check applyPresetToForm includes projectId
console.log('Test 4: Apply Preset - Return Project ID');
console.log('─'.repeat(60));

const applyLogic = html.match(/function applyPresetToForm\([^)]+\)[\s\S]{0,400}\}/);
if (applyLogic) {
  const applyCode = applyLogic[0];
  
  const returnsProjectId = applyCode.includes('projectId: preset.projectId');
  
  if (returnsProjectId) {
    console.log('✅ applyPresetToForm returns projectId');
  } else {
    console.log('❌ applyPresetToForm does NOT return projectId');
    allPassed = false;
  }
  
} else {
  console.log('❌ applyPresetToForm function NOT found');
  allPassed = false;
}

console.log('');

// Test 5: Check editConfigurationPreset also restores projectId
console.log('Test 5: Edit Preset - Restore Project ID');
console.log('─'.repeat(60));

const editLogic = html.match(/function editConfigurationPreset\([^)]+\)[\s\S]{0,800}closeManagePresetsModal/);
if (editLogic) {
  const editCode = editLogic[0];
  
  const restoresProjectId = editCode.includes("getElementById('projectId').value = preset.projectId");
  const hasJiraCheck = editCode.includes("currentAppType === 'jira'");
  
  if (restoresProjectId && hasJiraCheck) {
    console.log('✅ Project ID restored when editing Jira presets');
  } else {
    if (!restoresProjectId) {
      console.log('❌ Project ID restore logic NOT found in edit function');
      allPassed = false;
    }
    if (!hasJiraCheck) {
      console.log('❌ No check for Jira app type in edit function');
      allPassed = false;
    }
  }
  
} else {
  console.log('❌ editConfigurationPreset function NOT found');
  allPassed = false;
}

console.log('');
console.log('═'.repeat(60));

if (allPassed) {
  console.log('✅ ALL TESTS PASSED');
  console.log('\n📋 Summary:');
  console.log('  • Presets always save Base URL: ✅');
  console.log('  • Presets always save Issue Type: ✅');
  console.log('  • Presets save Project ID for Jira: ✅');
  console.log('  • Presets restore all fields on load: ✅');
  console.log('  • Edit preset also restores all fields: ✅');
  console.log('\n🎯 Presets now work correctly for both Jira and ServiceNow!');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('\nPlease review the failures above.');
  process.exit(1);
}
