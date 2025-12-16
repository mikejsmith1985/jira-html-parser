/**
 * Test Suite: Preset UI Functionality
 * Tests for saving, loading, and managing presets through UI
 *
 * Run with: node test-preset-ui.js
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
// PRESET UI FUNCTIONS (UNDER TEST)
// ============================================================================

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

function deleteConfigurationPreset(presetId) {
  const presets = loadConfigurationPresets();
  const index = presets.findIndex(p => p.id === presetId);
  if (index < 0) throw new Error('Preset not found');
  presets.splice(index, 1);
  localStorage.setItem('jiraConfigurationPresets', JSON.stringify(presets));
  return true;
}

function generatePresetId(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
}

// Capture form state into preset object
function captureFormAsPreset(formData) {
  if (!formData.name) throw new Error('Preset name required');

  const preset = {
    id: generatePresetId(formData.name),
    name: formData.name,
    description: formData.description || '',
    fields: formData.fields || [],
    createdAt: Date.now()
  };

  if (formData.lockBaseUrl) preset.baseUrl = formData.baseUrl;
  if (formData.lockProjectId) preset.projectId = formData.projectId;
  if (formData.lockIssueTypeId) preset.issueTypeId = formData.issueTypeId;

  return preset;
}

// Apply preset to form
function applyPresetToForm(presetId) {
  const presets = loadConfigurationPresets();
  const preset = presets.find(p => p.id === presetId);
  if (!preset) throw new Error('Preset not found');
  return {
    baseUrl: preset.baseUrl || '',
    projectId: preset.projectId || '',
    issueTypeId: preset.issueTypeId || '',
    fields: preset.fields || []
  };
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
// TESTS
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('Preset UI Functionality - Test Suite');
console.log('='.repeat(70));

localStorage.clear();
describe('Capture Form As Preset', () => {
  test('captures minimal form data', () => {
    const formData = {
      name: 'Test Preset',
      fields: [{ fieldId: 'summary', value: 'Test' }]
    };

    const preset = captureFormAsPreset(formData);

    assert.ok(preset.id, 'Should have id');
    assert.equal(preset.name, 'Test Preset');
    assert.ok(preset.createdAt, 'Should have timestamp');
    assert.equal(preset.fields.length, 1);
  });

  test('captures optional description', () => {
    const formData = {
      name: 'Bug Report',
      description: 'For reporting bugs in production',
      fields: []
    };

    const preset = captureFormAsPreset(formData);

    assert.equal(preset.description, 'For reporting bugs in production');
  });

  test('captures locked baseUrl when specified', () => {
    const formData = {
      name: 'Locked Preset',
      baseUrl: 'https://jira.example.com',
      lockBaseUrl: true,
      fields: []
    };

    const preset = captureFormAsPreset(formData);

    assert.equal(preset.baseUrl, 'https://jira.example.com');
    assert.ok(!formData.lockBaseUrl === true || preset.baseUrl);
  });

  test('captures locked projectId when specified', () => {
    const formData = {
      name: 'Project Locked',
      projectId: 'PROJ123',
      lockProjectId: true,
      fields: []
    };

    const preset = captureFormAsPreset(formData);

    assert.equal(preset.projectId, 'PROJ123');
  });

  test('captures locked issueTypeId when specified', () => {
    const formData = {
      name: 'Type Locked',
      issueTypeId: '10001',
      lockIssueTypeId: true,
      fields: []
    };

    const preset = captureFormAsPreset(formData);

    assert.equal(preset.issueTypeId, '10001');
  });

  test('excludes baseUrl when not locked', () => {
    const formData = {
      name: 'Not Locked',
      baseUrl: 'https://jira.example.com',
      lockBaseUrl: false,
      fields: []
    };

    const preset = captureFormAsPreset(formData);

    assert.ok(!preset.baseUrl);
  });

  test('throws error if preset name is missing', () => {
    const formData = {
      fields: []
    };

    try {
      captureFormAsPreset(formData);
      assert.fail('Should throw error');
    } catch (e) {
      assert.ok(e.message.includes('name'));
    }
  });
});

localStorage.clear();
describe('Apply Preset To Form', () => {
  test('returns form data for minimal preset', () => {
    const preset = {
      id: 'test',
      name: 'Test',
      fields: [{ fieldId: 'summary' }],
      createdAt: Date.now()
    };

    saveConfigurationPreset(preset);
    const formData = applyPresetToForm('test');

    assert.equal(formData.baseUrl, '');
    assert.equal(formData.projectId, '');
    assert.equal(formData.issueTypeId, '');
    assert.equal(formData.fields.length, 1);
  });

  test('returns locked values when preset has them', () => {
    const preset = {
      id: 'locked',
      name: 'Locked',
      baseUrl: 'https://jira.example.com',
      projectId: 'PROJ',
      issueTypeId: 'BUG',
      fields: [],
      createdAt: Date.now()
    };

    saveConfigurationPreset(preset);
    const formData = applyPresetToForm('locked');

    assert.equal(formData.baseUrl, 'https://jira.example.com');
    assert.equal(formData.projectId, 'PROJ');
    assert.equal(formData.issueTypeId, 'BUG');
  });

  test('returns fields with preset values', () => {
    const preset = {
      id: 'fields-preset',
      name: 'Fields Preset',
      fields: [
        { fieldId: 'summary', value: 'Default summary' },
        { fieldId: 'description', value: 'Steps:\n* ' }
      ],
      createdAt: Date.now()
    };

    saveConfigurationPreset(preset);
    const formData = applyPresetToForm('fields-preset');

    assert.equal(formData.fields.length, 2);
    assert.equal(formData.fields[0].value, 'Default summary');
    assert.equal(formData.fields[1].value, 'Steps:\n* ');
  });

  test('throws error if preset not found', () => {
    try {
      applyPresetToForm('nonexistent');
      assert.fail('Should throw error');
    } catch (e) {
      assert.ok(e.message.includes('not found'));
    }
  });
});

localStorage.clear();
describe('Save Preset Workflow', () => {
  test('user can save current form as preset', () => {
    localStorage.clear();
    const formData = {
      name: 'My Bug Report',
      description: 'Template for bug reports',
      baseUrl: 'https://jira.example.com',
      lockBaseUrl: true,
      fields: [
        { fieldId: 'summary' },
        { fieldId: 'description', value: 'Steps:\n* ' }
      ]
    };

    const preset = captureFormAsPreset(formData);
    saveConfigurationPreset(preset);

    const presets = loadConfigurationPresets();
    assert.equal(presets.length, 1);
    assert.equal(presets[0].name, 'My Bug Report');
  });

  test('multiple presets can be saved from same form', () => {
    localStorage.clear();
    const bugForm = {
      name: 'Bug Template',
      fields: [{ fieldId: 'summary' }]
    };
    const featureForm = {
      name: 'Feature Template',
      fields: [{ fieldId: 'description' }]
    };

    saveConfigurationPreset(captureFormAsPreset(bugForm));
    saveConfigurationPreset(captureFormAsPreset(featureForm));

    const presets = loadConfigurationPresets();
    assert.equal(presets.length, 2);
  });
});

localStorage.clear();
describe('Load Preset Workflow', () => {
  test('user can load preset and apply to form', () => {
    // Setup: save a preset
    const preset = {
      id: 'bug-template',
      name: 'Bug Report',
      baseUrl: 'https://jira.example.com',
      projectId: 'BUG',
      issueTypeId: '10001',
      fields: [
        { fieldId: 'summary' },
        { fieldId: 'description', value: 'Steps to reproduce:\n* ' }
      ],
      createdAt: Date.now()
    };
    saveConfigurationPreset(preset);

    // User selects preset from dropdown
    const formData = applyPresetToForm('bug-template');

    // Form is populated
    assert.equal(formData.baseUrl, 'https://jira.example.com');
    assert.equal(formData.projectId, 'BUG');
    assert.equal(formData.issueTypeId, '10001');
    assert.equal(formData.fields.length, 2);
  });

  test('dropdown shows all saved presets', () => {
    localStorage.clear();

    const presets = [
      {
        id: 'bug',
        name: 'Bug Report',
        fields: [],
        createdAt: Date.now()
      },
      {
        id: 'feature',
        name: 'Feature Request',
        fields: [],
        createdAt: Date.now()
      },
      {
        id: 'task',
        name: 'Task',
        fields: [],
        createdAt: Date.now()
      }
    ];

    presets.forEach(p => saveConfigurationPreset(p));

    const allPresets = loadConfigurationPresets();
    assert.equal(allPresets.length, 3);
    assert.ok(allPresets.find(p => p.name === 'Bug Report'));
    assert.ok(allPresets.find(p => p.name === 'Feature Request'));
    assert.ok(allPresets.find(p => p.name === 'Task'));
  });
});

localStorage.clear();
describe('Manage Presets Workflow', () => {
  test('user can view all presets in manage modal', () => {
    localStorage.clear();

    const presets = [
      { id: 'p1', name: 'Preset 1', fields: [], createdAt: Date.now() },
      { id: 'p2', name: 'Preset 2', fields: [], createdAt: Date.now() }
    ];

    presets.forEach(p => saveConfigurationPreset(p));

    const stored = loadConfigurationPresets();
    assert.equal(stored.length, 2);
  });

  test('user can delete preset from manage modal', () => {
    localStorage.clear();

    const p1 = { id: 'keep', name: 'Keep', fields: [], createdAt: Date.now() };
    const p2 = { id: 'delete', name: 'Delete', fields: [], createdAt: Date.now() };

    saveConfigurationPreset(p1);
    saveConfigurationPreset(p2);

    deleteConfigurationPreset('delete');

    const presets = loadConfigurationPresets();
    assert.equal(presets.length, 1);
    assert.equal(presets[0].id, 'keep');
  });

  test('user can update preset from manage modal', () => {
    localStorage.clear();

    const original = {
      id: 'test',
      name: 'Original',
      description: 'Original description',
      fields: [],
      createdAt: Date.now()
    };

    saveConfigurationPreset(original);

    // Update
    const updated = {
      id: 'test',
      name: 'Updated',
      description: 'Updated description',
      fields: [{ fieldId: 'summary' }],
      createdAt: Date.now()
    };

    saveConfigurationPreset(updated);

    const presets = loadConfigurationPresets();
    assert.equal(presets.length, 1);
    assert.equal(presets[0].name, 'Updated');
    assert.equal(presets[0].fields.length, 1);
  });
});

localStorage.clear();
describe('UI Integration Scenarios', () => {
  test('save preset captures all form state correctly', () => {
    const formState = {
      name: 'Complete Preset',
      description: 'A complete test preset',
      baseUrl: 'https://jira.example.com',
      projectId: 'PROJ',
      issueTypeId: '10001',
      lockBaseUrl: true,
      lockProjectId: false,
      lockIssueTypeId: true,
      fields: [
        { fieldId: 'summary', value: 'Summary template' },
        { fieldId: 'description', value: 'Description template' }
      ]
    };

    const preset = captureFormAsPreset(formState);
    saveConfigurationPreset(preset);

    const loaded = loadConfigurationPresets()[0];
    assert.equal(loaded.name, formState.name);
    assert.equal(loaded.description, formState.description);
    assert.equal(loaded.baseUrl, formState.baseUrl);
    assert.ok(!loaded.projectId); // Not locked
    assert.equal(loaded.issueTypeId, formState.issueTypeId);
  });

  test('roundtrip: save preset and load it back', () => {
    localStorage.clear();

    // Save
    const original = {
      name: 'Roundtrip Test',
      description: 'Testing save and load',
      baseUrl: 'https://jira.example.com',
      lockBaseUrl: true,
      fields: [
        { fieldId: 'summary', value: 'Test summary' }
      ]
    };

    const preset = captureFormAsPreset(original);
    saveConfigurationPreset(preset);

    // Load
    const loaded = applyPresetToForm(preset.id);

    // Verify
    assert.equal(loaded.baseUrl, original.baseUrl);
    assert.equal(loaded.fields[0].fieldId, 'summary');
    assert.equal(loaded.fields[0].value, 'Test summary');
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
  console.log('\n✓ All preset UI tests passed!');
  process.exit(0);
}
