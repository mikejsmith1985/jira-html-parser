/**
 * Test Suite: Configuration Presets
 * Tests for saving, loading, and applying configuration presets
 *
 * Run with: node test-configuration-presets.js
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
// CONFIGURATION PRESET FUNCTIONS (UNDER TEST)
// ============================================================================

function loadConfigurationPresets() {
  try {
    const stored = localStorage.getItem('jiraConfigurationPresets');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load presets:', e);
    return [];
  }
}

function saveConfigurationPreset(preset) {
  try {
    if (!preset.id || !preset.name) {
      throw new Error('Preset must have id and name');
    }
    const presets = loadConfigurationPresets();
    const index = presets.findIndex(p => p.id === preset.id);
    if (index >= 0) {
      presets[index] = preset;
    } else {
      presets.push(preset);
    }
    localStorage.setItem('jiraConfigurationPresets', JSON.stringify(presets));
    return preset;
  } catch (e) {
    throw new Error(`Failed to save preset: ${e.message}`);
  }
}

function deleteConfigurationPreset(presetId) {
  try {
    const presets = loadConfigurationPresets();
    const index = presets.findIndex(p => p.id === presetId);
    if (index < 0) {
      throw new Error('Preset not found');
    }
    presets.splice(index, 1);
    localStorage.setItem('jiraConfigurationPresets', JSON.stringify(presets));
    return true;
  } catch (e) {
    throw new Error(`Failed to delete preset: ${e.message}`);
  }
}

function generatePresetId(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
}

// ============================================================================
// TEST RUNNER UTILITIES
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
// TESTS
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('Configuration Presets - Test Suite');
console.log('='.repeat(70));

localStorage.clear();
describe('loadConfigurationPresets()', () => {
  test('returns empty array when no presets stored', () => {
    localStorage.clear();
    const result = loadConfigurationPresets();
    assert.deepEqual(result, []);
  });

  test('returns stored presets from localStorage', () => {
    localStorage.clear();
    const presets = [
      {
        id: 'bug-report',
        name: 'Bug Report',
        fields: [
          { fieldId: 'summary' },
          { fieldId: 'description', value: 'Steps:\n* ' }
        ],
        createdAt: Date.now()
      }
    ];
    localStorage.setItem('jiraConfigurationPresets', JSON.stringify(presets));
    const result = loadConfigurationPresets();
    assert.deepEqual(result, presets);
  });

  test('returns empty array for invalid JSON', () => {
    localStorage.clear();
    localStorage.setItem('jiraConfigurationPresets', 'invalid json {{{');
    const result = loadConfigurationPresets();
    assert.deepEqual(result, []);
  });

  test('returns empty array for non-array data', () => {
    localStorage.clear();
    localStorage.setItem('jiraConfigurationPresets', JSON.stringify({ not: 'array' }));
    const result = loadConfigurationPresets();
    assert.deepEqual(result, []);
  });
});

localStorage.clear();
describe('saveConfigurationPreset()', () => {
  test('saves new preset to localStorage', () => {
    localStorage.clear();
    const preset = {
      id: 'test-preset',
      name: 'Test Preset',
      fields: [{ fieldId: 'summary' }],
      createdAt: Date.now()
    };
    saveConfigurationPreset(preset);
    const stored = JSON.parse(localStorage.getItem('jiraConfigurationPresets'));
    assert.equal(stored.length, 1);
    assert.equal(stored[0].id, 'test-preset');
  });

  test('updates existing preset by id', () => {
    localStorage.clear();
    const preset1 = {
      id: 'test',
      name: 'Original',
      fields: [{ fieldId: 'summary' }],
      createdAt: Date.now()
    };
    const preset2 = {
      id: 'test',
      name: 'Updated',
      fields: [{ fieldId: 'description' }],
      createdAt: Date.now()
    };

    saveConfigurationPreset(preset1);
    saveConfigurationPreset(preset2);

    const stored = JSON.parse(localStorage.getItem('jiraConfigurationPresets'));
    assert.equal(stored.length, 1, 'Should have 1 preset');
    assert.equal(stored[0].name, 'Updated', 'Should be updated');
  });

  test('saves multiple different presets', () => {
    localStorage.clear();
    const preset1 = {
      id: 'bug',
      name: 'Bug Report',
      fields: [],
      createdAt: Date.now()
    };
    const preset2 = {
      id: 'feature',
      name: 'Feature Request',
      fields: [],
      createdAt: Date.now()
    };

    saveConfigurationPreset(preset1);
    saveConfigurationPreset(preset2);

    const stored = JSON.parse(localStorage.getItem('jiraConfigurationPresets'));
    assert.equal(stored.length, 2);
    assert.equal(stored.find(p => p.id === 'bug').name, 'Bug Report');
    assert.equal(stored.find(p => p.id === 'feature').name, 'Feature Request');
  });

  test('throws error if preset missing id', () => {
    localStorage.clear();
    const invalidPreset = { name: 'No ID' };
    try {
      saveConfigurationPreset(invalidPreset);
      assert.fail('Should throw error');
    } catch (e) {
      assert.ok(e.message.includes('id'));
    }
  });

  test('throws error if preset missing name', () => {
    localStorage.clear();
    const invalidPreset = { id: 'no-name' };
    try {
      saveConfigurationPreset(invalidPreset);
      assert.fail('Should throw error');
    } catch (e) {
      assert.ok(e.message.includes('name'));
    }
  });

  test('preserves all preset fields when saving', () => {
    localStorage.clear();
    const preset = {
      id: 'complex',
      name: 'Complex Preset',
      description: 'This is a complex preset',
      baseUrl: 'https://jira.example.com',
      projectId: '123',
      issueTypeId: '10001',
      fields: [
        { fieldId: 'summary', value: 'Test' },
        { fieldId: 'description', value: 'Details' }
      ],
      createdAt: 1234567890,
      lastUsed: 1234567900
    };
    saveConfigurationPreset(preset);
    const stored = JSON.parse(localStorage.getItem('jiraConfigurationPresets'));
    assert.deepEqual(stored[0], preset);
  });
});

localStorage.clear();
describe('deleteConfigurationPreset()', () => {
  test('deletes preset by id', () => {
    localStorage.clear();
    const preset = {
      id: 'to-delete',
      name: 'Delete Me',
      fields: [],
      createdAt: Date.now()
    };
    saveConfigurationPreset(preset);
    deleteConfigurationPreset('to-delete');

    const stored = loadConfigurationPresets();
    assert.equal(stored.length, 0);
  });

  test('throws error if preset not found', () => {
    localStorage.clear();
    try {
      deleteConfigurationPreset('nonexistent');
      assert.fail('Should throw error');
    } catch (e) {
      assert.ok(e.message.includes('not found'));
    }
  });

  test('deletes only specified preset', () => {
    localStorage.clear();
    const preset1 = { id: 'keep', name: 'Keep', fields: [], createdAt: Date.now() };
    const preset2 = { id: 'delete', name: 'Delete', fields: [], createdAt: Date.now() };

    saveConfigurationPreset(preset1);
    saveConfigurationPreset(preset2);
    deleteConfigurationPreset('delete');

    const stored = loadConfigurationPresets();
    assert.equal(stored.length, 1);
    assert.equal(stored[0].id, 'keep');
  });
});

localStorage.clear();
describe('generatePresetId()', () => {
  test('converts name to valid id format', () => {
    const id = generatePresetId('Bug Report');
    assert.ok(id.startsWith('bug-report-') || id === 'bug-report');
  });

  test('includes timestamp component for uniqueness', () => {
    const id = generatePresetId('Test');
    const parts = id.split('-');
    // Last part should be a timestamp
    const timestamp = parts[parts.length - 1];
    assert.ok(/^\d{13}$/.test(timestamp), 'Should include 13-digit timestamp');
  });

  test('handles special characters', () => {
    const id = generatePresetId('Bug/Report @2025 #1');
    assert.ok(!/[@#/]/.test(id), 'Should remove special chars');
    // Should start with cleaned version of the name
    assert.ok(id.match(/^[a-z0-9-]+$/), 'Should only contain alphanumeric and hyphens');
  });

  test('handles multiple spaces', () => {
    const id = generatePresetId('Bug   Report   Test');
    assert.ok(!id.includes('   '), 'Should handle multiple spaces');
  });
});

localStorage.clear();
describe('Preset Data Structure', () => {
  test('preset with minimal fields is valid', () => {
    localStorage.clear();
    const preset = {
      id: 'minimal',
      name: 'Minimal',
      fields: [],
      createdAt: Date.now()
    };
    saveConfigurationPreset(preset);
    const stored = loadConfigurationPresets();
    assert.equal(stored.length, 1, 'Should have 1 preset');
    assert.ok(stored[0].id);
    assert.ok(stored[0].name);
    assert.ok(Array.isArray(stored[0].fields));
    assert.ok(stored[0].createdAt);
  });

  test('preset with optional fields is valid', () => {
    localStorage.clear();
    const preset = {
      id: 'full',
      name: 'Full Preset',
      description: 'A complete preset',
      baseUrl: 'https://jira.example.com',
      projectId: 'PROJ',
      issueTypeId: 'BUG',
      fields: [
        { fieldId: 'summary' },
        { fieldId: 'description', value: 'Default description' }
      ],
      createdAt: Date.now(),
      lastUsed: Date.now()
    };
    saveConfigurationPreset(preset);
    const stored = loadConfigurationPresets();
    assert.equal(stored.length, 1, 'Should have 1 preset');
    assert.deepEqual(stored[0], preset);
  });

  test('field array with optional values', () => {
    localStorage.clear();
    const preset = {
      id: 'fields-test',
      name: 'Fields Test',
      fields: [
        { fieldId: 'summary' },
        { fieldId: 'description', value: 'Predefined value' },
        { fieldId: 'labels', value: 'bug,urgent' }
      ],
      createdAt: Date.now()
    };
    saveConfigurationPreset(preset);
    const stored = loadConfigurationPresets();
    assert.equal(stored.length, 1, 'Should have 1 preset');
    assert.equal(stored[0].fields.length, 3);
    assert.equal(stored[0].fields[1].value, 'Predefined value');
    assert.equal(stored[0].fields[2].value, 'bug,urgent');
  });
});

localStorage.clear();
describe('Preset Integration Scenarios', () => {
  test('can save and retrieve multiple presets', () => {
    localStorage.clear();
    const presets = [
      {
        id: 'bug-report',
        name: 'Bug Report',
        fields: [
          { fieldId: 'summary' },
          { fieldId: 'description', value: 'Steps:\n* ' }
        ],
        createdAt: Date.now()
      },
      {
        id: 'feature-request',
        name: 'Feature Request',
        fields: [
          { fieldId: 'summary' },
          { fieldId: 'description', value: 'Requirements:\n* ' }
        ],
        createdAt: Date.now()
      }
    ];

    presets.forEach(p => saveConfigurationPreset(p));
    const stored = loadConfigurationPresets();

    assert.equal(stored.length, 2);
    assert.ok(stored.find(p => p.id === 'bug-report'));
    assert.ok(stored.find(p => p.id === 'feature-request'));
  });

  test('can update preset after retrieval', () => {
    localStorage.clear();
    let preset = {
      id: 'test',
      name: 'Original',
      fields: [],
      createdAt: Date.now()
    };

    saveConfigurationPreset(preset);

    // Retrieve and update
    const stored = loadConfigurationPresets();
    stored[0].name = 'Updated';
    stored[0].lastUsed = Date.now();
    saveConfigurationPreset(stored[0]);

    // Verify update
    const updated = loadConfigurationPresets();
    assert.equal(updated[0].name, 'Updated');
    assert.ok(updated[0].lastUsed);
  });
});

console.log('\n' + '='.repeat(70));
console.log(`Tests: ${passedTests}/${totalTests} passed, ${failedTests} failed`);
console.log('='.repeat(70));

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\n✓ All tests passed!');
  process.exit(0);
}
