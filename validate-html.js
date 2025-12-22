/**
 * Syntax Validation for jira-link-generator.html
 * Verifies that all required JavaScript functions are defined
 */

const fs = require('fs');

// Load HTML file
const html = fs.readFileSync('./jira-link-generator.html', 'utf8');

// Functions that should exist
const requiredFunctions = [
  'loadConfigurationItems',
  'saveConfigurationItems',
  'loadFieldDefinitions',
  'saveFieldDefinitions',
  'openFieldManager',
  'closeFieldManager',
  'refreshConfigItemsList',
  'editConfigurationItem',
  'updateConfigurationItem',
  'deleteConfigurationItem',
  'refreshFieldsList',
  'editFieldDefinition',
  'addFieldDefinition',
  'deleteFieldDefinition',
  'updateAllFieldSelects',
  'cancelEditField',
  'loadConfigurationPresets',
  'saveConfigurationPreset',
  'deleteConfigurationPreset',
  'saveCurrentAsPreset',
  'loadPresetFromDropdown',
  'applyPresetToForm',
  'editConfigurationPreset',
  'openManagePresetsModal',
  'closeManagePresetsModal',
  'openSavePresetModal',
  'closeSavePresetModal',
  'populatePresetDropdown'
];

let passed = 0;
let failed = 0;

console.log('\n' + '='.repeat(70));
console.log('HTML JavaScript Validation');
console.log('='.repeat(70) + '\n');

requiredFunctions.forEach(fn => {
  const pattern = new RegExp(`\\bfunction\\s+${fn}\\s*\\(|\\bconst\\s+${fn}\\s*=|\\b${fn}\\s*=\\s*function`);
  if (pattern.test(html)) {
    console.log(`✓ ${fn}`);
    passed++;
  } else {
    console.log(`✗ ${fn} - MISSING`);
    failed++;
  }
});

// Check for configuration constants
const constants = [
  'DEFAULT_CONFIG_ITEMS',
  'DEFAULT_FIELDS'
];

console.log('\nConstants:');
constants.forEach(cn => {
  const pattern = new RegExp(`\\bconst\\s+${cn}\\s*=\\s*\\[`);
  if (pattern.test(html)) {
    console.log(`✓ ${cn}`);
    passed++;
  } else {
    console.log(`✗ ${cn} - MISSING`);
    failed++;
  }
});

// Check for key HTML elements
const elements = [
  { id: 'fieldManagerModal', desc: 'Field Manager Modal' },
  { id: 'configItemsList', desc: 'Config Items List' },
  { id: 'fieldsList', desc: 'Fields List' },
  { id: 'savePresetModal', desc: 'Save Preset Modal' },
  { id: 'managePresetsModal', desc: 'Manage Presets Modal' }
];

console.log('\nHTML Elements:');
elements.forEach(elem => {
  const pattern = new RegExp(`id=["']${elem.id}["']`);
  if (pattern.test(html)) {
    console.log(`✓ ${elem.desc}`);
    passed++;
  } else {
    console.log(`✗ ${elem.desc} - MISSING`);
    failed++;
  }
});

console.log('\n' + '='.repeat(70));
console.log(`Total: ${passed} passed, ${failed} failed`);
console.log('='.repeat(70));

if (failed === 0) {
  console.log('\n✓ HTML file is valid and contains all required functions and elements!');
  process.exit(0);
} else {
  console.log(`\n✗ ${failed} item(s) are missing!`);
  process.exit(1);
}
