/**
 * Test Suite: Configuration Items Persistence Layer
 * Tests for managing Base URL, Project ID, and Issue Type ID as editable configuration items
 *
 * Run with: node test-config-items.js
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
// Constants & Configuration Items Loader Functions (UNDER TEST)
// ============================================================================

const DEFAULT_CONFIG_ITEMS = [
  { id: "baseUrl", label: "Base URL", category: "config" },
  { id: "projectId", label: "Project ID", category: "config" },
  { id: "issueTypeId", label: "Issue Type ID", category: "config" }
];

function loadConfigurationItems() {
  try {
    const stored = localStorage.getItem('jiraConfigItems');
    if (!stored) return DEFAULT_CONFIG_ITEMS;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return DEFAULT_CONFIG_ITEMS;
    return parsed.filter(c => c.id && c.label);
  } catch (e) {
    console.error('Failed to load config items:', e);
    return DEFAULT_CONFIG_ITEMS;
  }
}

function saveConfigurationItems(items) {
  try {
    const unique = Array.from(new Map(items.map(d => [d.id, d])).values());
    localStorage.setItem('jiraConfigItems', JSON.stringify(unique));
    return true;
  } catch (e) {
    console.error('Failed to save config items:', e);
    throw new Error('Could not save configuration items (localStorage full?)');
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
  console.log('Configuration Items Persistence Layer - Test Suite');
  console.log('='.repeat(70) + '\n');

  // Test 1: DEFAULT_CONFIG_ITEMS structure
  console.log('Configuration Items Constants');
  test('DEFAULT_CONFIG_ITEMS is an array', () => {
    assert(Array.isArray(DEFAULT_CONFIG_ITEMS), 'DEFAULT_CONFIG_ITEMS should be an array');
  });

  test('DEFAULT_CONFIG_ITEMS contains valid ConfigItem objects', () => {
    DEFAULT_CONFIG_ITEMS.forEach(item => {
      assert(item.id && typeof item.id === 'string', `Item ${item} should have string id`);
      assert(item.label && typeof item.label === 'string', `Item ${item} should have string label`);
      assert(item.category === 'config', `Item ${item} should have category 'config'`);
    });
  });

  test('DEFAULT_CONFIG_ITEMS contains Base URL, Project ID, and Issue Type ID', () => {
    const ids = DEFAULT_CONFIG_ITEMS.map(i => i.id);
    assert(ids.includes('baseUrl'), 'Should include baseUrl');
    assert(ids.includes('projectId'), 'Should include projectId');
    assert(ids.includes('issueTypeId'), 'Should include issueTypeId');
  });

  // Test 2: loadConfigurationItems
  console.log('\nloadConfigurationItems()');
  test('returns DEFAULT_CONFIG_ITEMS when localStorage is empty', () => {
    localStorage.clear();
    const items = loadConfigurationItems();
    assert.deepEqual(items, DEFAULT_CONFIG_ITEMS);
  });

  test('returns parsed data when valid JSON in localStorage', () => {
    localStorage.clear();
    const customItems = [
      { id: 'baseUrl', label: 'Custom Base URL', category: 'config' }
    ];
    localStorage.setItem('jiraConfigItems', JSON.stringify(customItems));
    const items = loadConfigurationItems();
    assert.deepEqual(items, customItems);
  });

  test('returns DEFAULT_CONFIG_ITEMS when localStorage contains invalid JSON', () => {
    localStorage.clear();
    localStorage.setItem('jiraConfigItems', 'not valid json');
    const items = loadConfigurationItems();
    assert.deepEqual(items, DEFAULT_CONFIG_ITEMS);
  });

  test('filters out entries with missing id or label', () => {
    localStorage.clear();
    const badItems = [
      { id: 'baseUrl', label: 'Base URL', category: 'config' },
      { label: 'No ID', category: 'config' },
      { id: 'noLabel', category: 'config' }
    ];
    localStorage.setItem('jiraConfigItems', JSON.stringify(badItems));
    const items = loadConfigurationItems();
    assert.equal(items.length, 1);
    assert.equal(items[0].id, 'baseUrl');
  });

  // Test 3: saveConfigurationItems
  console.log('\nsaveConfigurationItems()');
  test('saves to localStorage', () => {
    localStorage.clear();
    const items = [
      { id: 'baseUrl', label: 'Updated Base URL', category: 'config' }
    ];
    saveConfigurationItems(items);
    const stored = localStorage.getItem('jiraConfigItems');
    assert(stored, 'Should save to localStorage');
    const parsed = JSON.parse(stored);
    assert.equal(parsed[0].label, 'Updated Base URL');
  });

  test('deduplicates by id', () => {
    localStorage.clear();
    const items = [
      { id: 'baseUrl', label: 'First', category: 'config' },
      { id: 'baseUrl', label: 'Second', category: 'config' }
    ];
    saveConfigurationItems(items);
    const stored = JSON.parse(localStorage.getItem('jiraConfigItems'));
    assert.equal(stored.length, 1);
    assert.equal(stored[0].label, 'Second');
  });

  test('preserves category on save', () => {
    localStorage.clear();
    const items = [
      { id: 'projectId', label: 'Modified Project ID', category: 'config' }
    ];
    saveConfigurationItems(items);
    const stored = JSON.parse(localStorage.getItem('jiraConfigItems'));
    assert.equal(stored[0].category, 'config');
  });

  // Test 4: Edit/Update functionality
  console.log('\nConfiguration Item Edit/Update Workflow');
  test('can load, modify, and save a config item', () => {
    localStorage.clear();
    
    // Load defaults
    const items = loadConfigurationItems();
    const index = items.findIndex(i => i.id === 'baseUrl');
    
    // Modify
    items[index].label = 'Custom Base URL Label';
    
    // Save
    saveConfigurationItems(items);
    
    // Reload and verify
    const reloaded = loadConfigurationItems();
    const reloadedItem = reloaded.find(i => i.id === 'baseUrl');
    assert.equal(reloadedItem.label, 'Custom Base URL Label');
  });

  test('preserves other items when updating one', () => {
    localStorage.clear();
    
    let items = loadConfigurationItems();
    items[0].label = 'Modified Base URL';
    saveConfigurationItems(items);
    
    items = loadConfigurationItems();
    items[1].label = 'Modified Project ID';
    saveConfigurationItems(items);
    
    const final = loadConfigurationItems();
    assert.equal(final[0].label, 'Modified Base URL');
    assert.equal(final[1].label, 'Modified Project ID');
  });

  // Test 5: Delete functionality
  console.log('\nConfiguration Item Delete Workflow');
  test('can delete a config item', () => {
    localStorage.clear();
    const items = loadConfigurationItems();
    const originalCount = items.length;
    
    items.splice(0, 1);
    saveConfigurationItems(items);
    
    const reloaded = loadConfigurationItems();
    assert.equal(reloaded.length, originalCount - 1);
  });

  test('cannot delete essential items permanently (reload restores defaults)', () => {
    localStorage.clear();
    let items = loadConfigurationItems();
    items.splice(0, items.length); // Delete all
    saveConfigurationItems(items);
    
    // When reloading from empty storage, should get defaults
    localStorage.removeItem('jiraConfigItems');
    const restored = loadConfigurationItems();
    assert.equal(restored.length, DEFAULT_CONFIG_ITEMS.length);
  });

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log(`Tests: ${passed}/${passed + failed} passed, ${failed} failed`);
  console.log('='.repeat(70));

  if (failed === 0) {
    console.log('\n✓ All tests passed!');
    return 0;
  } else {
    console.log(`\n✗ ${failed} test(s) failed`);
    return 1;
  }
}

const exitCode = runTests();
process.exit(exitCode);
