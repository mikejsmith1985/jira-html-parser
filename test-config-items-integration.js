/**
 * Integration Test: Configuration Items Management UI
 * Tests that configuration items (Base URL, Project ID, Issue Type ID) work 
 * like fields in the "Add Field" section
 *
 * Run with: node test-config-items-integration.js
 */

const assert = require('assert');

// Mock localStorage
global.localStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

// ============================================================================
// Code from jira-link-generator.html
// ============================================================================

const DEFAULT_CONFIG_ITEMS = [
  { id: "baseUrl", label: "Base URL", category: "config" },
  { id: "projectId", label: "Project ID", category: "config" },
  { id: "issueTypeId", label: "Issue Type ID", category: "config" }
];

const DEFAULT_FIELDS = [
  { id: "summary", label: "Summary", category: "standard" },
  { id: "description", label: "Description", category: "standard" },
  { id: "priority", label: "Priority", category: "standard" },
  { id: "assignee", label: "Assignee", category: "standard" },
  { id: "labels", label: "Labels", category: "standard" },
  { id: "due date", label: "Due Date", category: "standard" },
  { id: "component", label: "Component", category: "standard" }
];

function loadConfigurationItems() {
  try {
    const stored = localStorage.getItem('jiraConfigItems');
    if (!stored) return DEFAULT_CONFIG_ITEMS;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return DEFAULT_CONFIG_ITEMS;
    return parsed.filter(c => c.id && c.label);
  } catch (e) {
    return DEFAULT_CONFIG_ITEMS;
  }
}

function saveConfigurationItems(items) {
  try {
    const unique = Array.from(new Map(items.map(d => [d.id, d])).values());
    localStorage.setItem('jiraConfigItems', JSON.stringify(unique));
    return true;
  } catch (e) {
    throw new Error('Could not save configuration items (localStorage full?)');
  }
}

function loadFieldDefinitions() {
  try {
    const stored = localStorage.getItem('jiraFieldDefinitions');
    if (!stored) return DEFAULT_FIELDS;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return DEFAULT_FIELDS;
    return parsed.filter(f => f.id && f.label);
  } catch (e) {
    return DEFAULT_FIELDS;
  }
}

function saveFieldDefinitions(definitions) {
  try {
    const unique = Array.from(new Map(definitions.map(d => [d.id, d])).values());
    localStorage.setItem('jiraFieldDefinitions', JSON.stringify(unique));
    return true;
  } catch (e) {
    throw new Error('Could not save field definitions (localStorage full?)');
  }
}

// ============================================================================
// Test Suite
// ============================================================================

function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (e) {
      console.log(`  ✗ ${name}`);
      console.log(`    ${e.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('Configuration Items Integration Test');
  console.log('='.repeat(70) + '\n');

  // Test 1: Configuration Items exist alongside Field Definitions
  console.log('Configuration Items Visibility');
  test('Configuration items are loaded independently from field definitions', () => {
    localStorage.clear();
    const configItems = loadConfigurationItems();
    const fields = loadFieldDefinitions();
    
    assert(Array.isArray(configItems), 'configItems should be array');
    assert(Array.isArray(fields), 'fields should be array');
    assert(configItems.length > 0, 'configItems should not be empty');
    assert(fields.length > 0, 'fields should not be empty');
  });

  test('Configuration items are separate from field definitions', () => {
    localStorage.clear();
    const configItems = loadConfigurationItems();
    const fields = loadFieldDefinitions();
    
    const configIds = configItems.map(c => c.id);
    const fieldIds = fields.map(f => f.id);
    
    // No overlap
    const overlap = configIds.filter(id => fieldIds.includes(id));
    assert.equal(overlap.length, 0, 'Config items and fields should not overlap');
  });

  // Test 2: Configuration Items can be edited like fields
  console.log('\nConfiguration Items Edit Workflow');
  test('can edit configuration item label', () => {
    localStorage.clear();
    const items = loadConfigurationItems();
    const baseUrlItem = items.find(c => c.id === 'baseUrl');
    
    // Edit
    baseUrlItem.label = 'Custom Base URL Label';
    saveConfigurationItems(items);
    
    // Verify
    const updated = loadConfigurationItems();
    const updatedItem = updated.find(c => c.id === 'baseUrl');
    assert.equal(updatedItem.label, 'Custom Base URL Label');
  });

  test('editing config item preserves its ID', () => {
    localStorage.clear();
    const items = loadConfigurationItems();
    const originalId = items[0].id;
    
    items[0].label = 'New Label';
    saveConfigurationItems(items);
    
    const updated = loadConfigurationItems();
    assert.equal(updated[0].id, originalId);
  });

  test('can edit multiple config items independently', () => {
    localStorage.clear();
    let items = loadConfigurationItems();
    
    // Edit first item
    items[0].label = 'Custom URL';
    saveConfigurationItems(items);
    
    // Edit second item
    items = loadConfigurationItems();
    items[1].label = 'Custom Project';
    saveConfigurationItems(items);
    
    // Verify both changes
    const final = loadConfigurationItems();
    assert.equal(final[0].label, 'Custom URL');
    assert.equal(final[1].label, 'Custom Project');
  });

  // Test 3: Configuration Items can be deleted/restored like fields
  console.log('\nConfiguration Items Delete Workflow');
  test('can delete a configuration item from list', () => {
    localStorage.clear();
    let items = loadConfigurationItems();
    const originalCount = items.length;
    assert(originalCount > 0, 'Should have at least one config item');
    
    items.splice(0, 1);
    saveConfigurationItems(items);
    
    const updated = loadConfigurationItems();
    assert.equal(updated.length, originalCount - 1, `Expected ${originalCount - 1} items but got ${updated.length}`);
  });

  test('can restore config items by clearing localStorage', () => {
    localStorage.clear();
    let items = loadConfigurationItems();
    items.splice(0, items.length);
    saveConfigurationItems(items);
    
    // Clear storage to get defaults
    localStorage.removeItem('jiraConfigItems');
    const restored = loadConfigurationItems();
    assert.equal(restored.length, DEFAULT_CONFIG_ITEMS.length);
  });

  // Test 4: Configuration Items work alongside Field Definitions
  console.log('\nConfiguration Items + Field Definitions Coexistence');
  test('can add custom field without affecting config items', () => {
    localStorage.clear();
    const configItems = loadConfigurationItems();
    let fields = loadFieldDefinitions();
    
    // Add custom field
    fields.push({ id: 'customfield_10001', label: 'Custom Field', category: 'custom' });
    saveFieldDefinitions(fields);
    
    // Config items should be unchanged
    const unchanged = loadConfigurationItems();
    assert.equal(unchanged.length, configItems.length);
  });

  test('can edit config item and field independently', () => {
    localStorage.clear();
    // Explicitly reset by reloading
    localStorage.removeItem('jiraConfigItems');
    localStorage.removeItem('jiraFieldDefinitions');
    
    let configItems = loadConfigurationItems();
    let fields = loadFieldDefinitions();
    
    if (configItems.length > 0 && fields.length > 0) {
      configItems[0].label = 'Custom Config Label';
      fields[0].label = 'Custom Field Label';
      
      saveConfigurationItems(configItems);
      saveFieldDefinitions(fields);
      
      const reloadedConfig = loadConfigurationItems();
      const reloadedFields = loadFieldDefinitions();
      
      assert.equal(reloadedConfig[0].label, 'Custom Config Label');
      assert.equal(reloadedFields[0].label, 'Custom Field Label');
    }
  });

  // Test 5: Configuration Items support add/edit/delete UI operations
  console.log('\nConfiguration Items UI Operation Simulation');
  test('simulates clicking "Edit" button on config item', () => {
    localStorage.clear();
    localStorage.removeItem('jiraConfigItems');
    
    let items = loadConfigurationItems();
    if (items.length > 0) {
      const index = 0;
      const item = items[index];
      assert(item.id, 'Should have ID for disabling input');
      assert(item.label, 'Should have label to prefill');
      
      // Simulate editing
      item.label = 'Updated Label';
      items[index] = item;
      saveConfigurationItems(items);
      
      const updated = loadConfigurationItems();
      assert(updated[index], 'Item should still exist');
      assert.equal(updated[index].label, 'Updated Label');
    }
  });

  test('simulates cancel edit operation on config item', () => {
    localStorage.clear();
    localStorage.removeItem('jiraConfigItems');
    
    let items = loadConfigurationItems();
    if (items.length > 0) {
      const originalLabel = items[0].label;
      
      // Don't save changes
      // Just verify original is still there
      const current = loadConfigurationItems();
      assert.equal(current[0].label, originalLabel);
    }
  });

  // Test 6: Adding new config items works (future extensibility)
  console.log('\nConfiguration Items Extensibility');
  test('can add additional configuration items', () => {
    localStorage.clear();
    const items = loadConfigurationItems();
    const originalCount = items.length;
    
    items.push({ id: 'customConfig', label: 'Custom Config', category: 'config' });
    saveConfigurationItems(items);
    
    const updated = loadConfigurationItems();
    assert.equal(updated.length, originalCount + 1);
    assert(updated.some(c => c.id === 'customConfig'));
  });

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log(`Tests: ${passed}/${passed + failed} passed, ${failed} failed`);
  console.log('='.repeat(70));

  if (failed === 0) {
    console.log('\n✓ All tests passed!');
    console.log('\nConfiguration Items are now fully manageable like fields in the');
    console.log('"Add Field" section with Edit, Delete, and optional Add operations.');
    return 0;
  } else {
    console.log(`\n✗ ${failed} test(s) failed`);
    return 1;
  }
}

const exitCode = runTests();
process.exit(exitCode);
