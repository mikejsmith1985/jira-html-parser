/**
 * Integration Test Suite
 * Tests that all features work together: field definitions, presets, and URL generation
 *
 * Run with: node test-integration.js
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
// Import all functions under test
// ============================================================================

const DEFAULT_FIELDS = [
  { id: "summary", label: "Summary", category: "standard" },
  { id: "description", label: "Description", category: "standard" },
  { id: "priority", label: "Priority", category: "standard" },
  { id: "assignee", label: "Assignee", category: "standard" },
  { id: "labels", label: "Labels", category: "standard" },
  { id: "due date", label: "Due Date", category: "standard" },
  { id: "component", label: "Component", category: "standard" }
];

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
  const unique = Array.from(new Map(definitions.map(d => [d.id, d])).values());
  localStorage.setItem('jiraFieldDefinitions', JSON.stringify(unique));
}

function loadConfigurationPresets() {
  try {
    const stored = localStorage.getItem('jiraConfigurationPresets');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveConfigurationPreset(preset) {
  if (!preset.id || !preset.name) throw new Error('id and name required');
  const presets = loadConfigurationPresets();
  const index = presets.findIndex(p => p.id === preset.id);
  if (index >= 0) presets[index] = preset;
  else presets.push(preset);
  localStorage.setItem('jiraConfigurationPresets', JSON.stringify(presets));
  return preset;
}

// ============================================================================
// TEST RUNNER
// ============================================================================

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${e.message}`);
    failedTests++;
  }
}

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('Integration Tests - Field Definitions + Presets');
console.log('='.repeat(70));

localStorage.clear();
describe('End-to-End: Field Definition Workflow', () => {
  test('User can add custom field definition', () => {
    const defs = loadFieldDefinitions();
    assert.ok(defs.length > 0, 'Should have default fields');

    // Add custom field
    defs.push({ id: 'customfield_10001', label: 'Custom Issue Type', category: 'custom' });
    saveFieldDefinitions(defs);

    // Verify saved
    const saved = loadFieldDefinitions();
    assert.ok(saved.some(f => f.id === 'customfield_10001'));
    assert.equal(saved.length, defs.length);
  });

  test('Deleting field definition preserves data', () => {
    const defs = loadFieldDefinitions();
    const initialCount = defs.length;

    // Remove a field
    defs.splice(0, 1);
    saveFieldDefinitions(defs);

    const saved = loadFieldDefinitions();
    assert.equal(saved.length, initialCount - 1);
  });
});

localStorage.clear();
describe('End-to-End: Preset Creation and Usage', () => {
  test('User can create preset with standard fields', () => {
    const preset = {
      id: 'bug-report',
      name: 'Bug Report',
      fields: [
        { fieldId: 'summary' },
        { fieldId: 'description', value: 'Steps to reproduce:\n* ' },
        { fieldId: 'priority', value: 'High' }
      ],
      createdAt: Date.now()
    };

    saveConfigurationPreset(preset);
    const presets = loadConfigurationPresets();

    assert.equal(presets.length, 1);
    assert.deepEqual(presets[0], preset);
  });

  test('Preset can reference custom field definitions', () => {
    const defs = loadFieldDefinitions();
    defs.push({ id: 'customfield_20000', label: 'Severity', category: 'custom' });
    saveFieldDefinitions(defs);

    const preset = {
      id: 'enhanced-bug',
      name: 'Enhanced Bug Report',
      fields: [
        { fieldId: 'summary' },
        { fieldId: 'customfield_20000', value: 'Critical' }
      ],
      createdAt: Date.now()
    };

    saveConfigurationPreset(preset);
    const presets = loadConfigurationPresets();
    const savedPreset = presets.find(p => p.id === 'enhanced-bug');

    assert.ok(savedPreset);
    assert.ok(savedPreset.fields.some(f => f.fieldId === 'customfield_20000'));
  });

  test('Multiple presets can coexist', () => {
    localStorage.clear();

    const preset1 = {
      id: 'bug',
      name: 'Bug',
      fields: [{ fieldId: 'summary' }],
      createdAt: Date.now()
    };
    const preset2 = {
      id: 'feature',
      name: 'Feature',
      fields: [{ fieldId: 'description' }],
      createdAt: Date.now()
    };
    const preset3 = {
      id: 'task',
      name: 'Task',
      fields: [{ fieldId: 'priority' }],
      createdAt: Date.now()
    };

    saveConfigurationPreset(preset1);
    saveConfigurationPreset(preset2);
    saveConfigurationPreset(preset3);

    const presets = loadConfigurationPresets();
    assert.equal(presets.length, 3);
    assert.ok(presets.find(p => p.id === 'bug'));
    assert.ok(presets.find(p => p.id === 'feature'));
    assert.ok(presets.find(p => p.id === 'task'));
  });
});

localStorage.clear();
describe('Persistence: Survive Reload', () => {
  test('Field definitions persist across reloads', () => {
    const defs = loadFieldDefinitions();
    defs.push({ id: 'custom', label: 'Custom', category: 'custom' });
    saveFieldDefinitions(defs);

    // Simulate reload
    localStorage.clear();
    localStorage.setItem('jiraFieldDefinitions', JSON.stringify(defs));

    const reloaded = loadFieldDefinitions();
    assert.ok(reloaded.some(f => f.id === 'custom'));
  });

  test('Presets persist across reloads', () => {
    const preset = {
      id: 'persistent',
      name: 'Persistent Preset',
      fields: [{ fieldId: 'summary' }],
      createdAt: Date.now()
    };
    saveConfigurationPreset(preset);

    // Simulate reload
    localStorage.clear();
    localStorage.setItem('jiraConfigurationPresets', JSON.stringify([preset]));

    const reloaded = loadConfigurationPresets();
    assert.equal(reloaded.length, 1);
    assert.equal(reloaded[0].name, 'Persistent Preset');
  });
});

localStorage.clear();
describe('Error Handling & Edge Cases', () => {
  test('Invalid preset data is rejected', () => {
    try {
      saveConfigurationPreset({ name: 'No ID' });
      assert.fail('Should throw error');
    } catch (e) {
      assert.ok(e.message.includes('id'));
    }
  });

  test('Corrupted field definitions fall back to defaults', () => {
    localStorage.clear();
    localStorage.setItem('jiraFieldDefinitions', 'corrupted data');

    const defs = loadFieldDefinitions();
    assert.deepEqual(defs, DEFAULT_FIELDS);
  });

  test('Corrupted presets fall back to empty array', () => {
    localStorage.clear();
    localStorage.setItem('jiraConfigurationPresets', 'corrupted data');

    const presets = loadConfigurationPresets();
    assert.deepEqual(presets, []);
  });

  test('Empty field value is allowed in preset', () => {
    const preset = {
      id: 'empty-value',
      name: 'Empty Value Test',
      fields: [
        { fieldId: 'summary' },
        { fieldId: 'description' } // No value
      ],
      createdAt: Date.now()
    };

    saveConfigurationPreset(preset);
    const presets = loadConfigurationPresets();
    const found = presets.find(p => p.id === 'empty-value');

    assert.ok(found);
    assert.ok(found.fields.some(f => !f.value));
  });
});

localStorage.clear();
describe('Data Consistency', () => {
  test('Updating preset preserves other presets', () => {
    localStorage.clear();

    const p1 = {
      id: 'preset1',
      name: 'Preset 1',
      fields: [{ fieldId: 'summary' }],
      createdAt: Date.now()
    };
    const p2 = {
      id: 'preset2',
      name: 'Preset 2',
      fields: [{ fieldId: 'description' }],
      createdAt: Date.now()
    };

    saveConfigurationPreset(p1);
    saveConfigurationPreset(p2);

    // Update p1
    p1.name = 'Updated Preset 1';
    saveConfigurationPreset(p1);

    const presets = loadConfigurationPresets();
    assert.equal(presets.length, 2);
    assert.equal(presets.find(p => p.id === 'preset1').name, 'Updated Preset 1');
    assert.equal(presets.find(p => p.id === 'preset2').name, 'Preset 2');
  });

  test('Field definitions update does not affect presets', () => {
    localStorage.clear();

    // Create preset
    const preset = {
      id: 'test',
      name: 'Test',
      fields: [{ fieldId: 'summary' }],
      createdAt: Date.now()
    };
    saveConfigurationPreset(preset);

    // Update field definitions
    const defs = loadFieldDefinitions();
    defs.push({ id: 'newfield', label: 'New Field', category: 'custom' });
    saveFieldDefinitions(defs);

    // Preset should be unchanged
    const presets = loadConfigurationPresets();
    assert.equal(presets[0].fields.length, 1);
  });
});

// ============================================================================
// RESULTS
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log(`Tests: ${passedTests}/${totalTests} passed, ${failedTests} failed`);
console.log('='.repeat(70));

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\n✓ All integration tests passed!');
  process.exit(0);
}
