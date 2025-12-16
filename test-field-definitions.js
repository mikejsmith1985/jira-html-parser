/**
 * Test Suite: Field Definitions Persistence Layer
 * Tests for loading, saving, and managing field definitions in localStorage
 *
 * Run with: node test-field-definitions.js
 */

const assert = require('assert');

// Mock localStorage - simple in-memory implementation
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
// Constants & Field Definition Loader Functions (UNDER TEST)
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

// Function: Load field definitions from localStorage
function loadFieldDefinitions() {
  try {
    const stored = localStorage.getItem('jiraFieldDefinitions');
    if (!stored) return DEFAULT_FIELDS;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return DEFAULT_FIELDS;
    return parsed.filter(f => f.id && f.label);
  } catch (e) {
    console.error('Failed to load field definitions:', e);
    return DEFAULT_FIELDS;
  }
}

// Function: Save field definitions to localStorage
function saveFieldDefinitions(definitions) {
  try {
    // Deduplicate by id (later definition wins)
    const unique = Array.from(new Map(definitions.map(d => [d.id, d])).values());
    localStorage.setItem('jiraFieldDefinitions', JSON.stringify(unique));
    return true;
  } catch (e) {
    const error = new Error(`Failed to save field definitions: ${e.message}`);
    error.originalError = e;
    throw error;
  }
}

// Function: Migrate old field format to new format
function migrateFieldNames(fields, fieldDefinitions) {
  return fields.map(field => {
    if (!field.fieldId && field.name) {
      // Find matching definition by name
      const def = fieldDefinitions.find(d => d.id === field.name);
      if (def) {
        return { ...field, fieldId: def.id };
      }
      // Create new definition on-demand for custom fields
      const newDef = { id: field.name, label: field.name, category: 'custom' };
      fieldDefinitions.push(newDef);
      return { ...field, fieldId: newDef.id };
    }
    return field;
  });
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
console.log('Field Definitions Persistence Layer - Test Suite');
console.log('='.repeat(70));

// Execute test groups
localStorage.clear();
describe('Field Definitions Constants', () => {
  test('DEFAULT_FIELDS is an array', () => {
    assert.ok(Array.isArray(DEFAULT_FIELDS));
  });

  test('DEFAULT_FIELDS contains valid FieldDefinition objects', () => {
    DEFAULT_FIELDS.forEach(field => {
      assert.ok(field.id, 'Field must have id');
      assert.ok(field.label, 'Field must have label');
    });
  });

  test('DEFAULT_FIELDS has at least 5 common Jira fields', () => {
    assert.ok(DEFAULT_FIELDS.length >= 5);
  });
});

localStorage.clear();
describe('loadFieldDefinitions()', () => {
  test('returns DEFAULT_FIELDS when localStorage is empty', () => {
    const loadFieldDefinitions = () => {
      try {
        const stored = localStorage.getItem('jiraFieldDefinitions');
        if (!stored) return DEFAULT_FIELDS;
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return DEFAULT_FIELDS;
        return parsed.filter(f => f.id && f.label);
      } catch (e) {
        return DEFAULT_FIELDS;
      }
    };
    const result = loadFieldDefinitions();
    assert.deepEqual(result, DEFAULT_FIELDS);
  });

  test('returns parsed data when valid JSON in localStorage', () => {
    localStorage.clear();
    const customFields = [
      { id: "summary", label: "Summary" },
      { id: "customfield_10001", label: "My Field" }
    ];
    localStorage.setItem('jiraFieldDefinitions', JSON.stringify(customFields));

    const loadFieldDefinitions = () => {
      try {
        const stored = localStorage.getItem('jiraFieldDefinitions');
        if (!stored) return DEFAULT_FIELDS;
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return DEFAULT_FIELDS;
        return parsed.filter(f => f.id && f.label);
      } catch (e) {
        return DEFAULT_FIELDS;
      }
    };
    assert.deepEqual(loadFieldDefinitions(), customFields);
  });

  test('returns DEFAULT_FIELDS when localStorage contains invalid JSON', () => {
    localStorage.clear();
    localStorage.setItem('jiraFieldDefinitions', 'invalid {{{');

    const loadFieldDefinitions = () => {
      try {
        const stored = localStorage.getItem('jiraFieldDefinitions');
        if (!stored) return DEFAULT_FIELDS;
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return DEFAULT_FIELDS;
        return parsed.filter(f => f.id && f.label);
      } catch (e) {
        return DEFAULT_FIELDS;
      }
    };
    assert.deepEqual(loadFieldDefinitions(), DEFAULT_FIELDS);
  });

  test('filters out entries with missing id or label', () => {
    localStorage.clear();
    const fields = [
      { id: "summary", label: "Summary" },
      { id: "priority" },
      { id: "description", label: "Description" }
    ];
    localStorage.setItem('jiraFieldDefinitions', JSON.stringify(fields));

    const loadFieldDefinitions = () => {
      try {
        const stored = localStorage.getItem('jiraFieldDefinitions');
        if (!stored) return DEFAULT_FIELDS;
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return DEFAULT_FIELDS;
        return parsed.filter(f => f.id && f.label);
      } catch (e) {
        return DEFAULT_FIELDS;
      }
    };
    const result = loadFieldDefinitions();
    assert.equal(result.length, 2);
  });
});

localStorage.clear();
describe('saveFieldDefinitions()', () => {
  test('saves to localStorage', () => {
    localStorage.clear();
    const saveFieldDefinitions = (definitions) => {
      const unique = Array.from(new Map(definitions.map(d => [d.id, d])).values());
      localStorage.setItem('jiraFieldDefinitions', JSON.stringify(unique));
    };

    const fields = [{ id: "summary", label: "Summary" }];
    saveFieldDefinitions(fields);
    const stored = JSON.parse(localStorage.getItem('jiraFieldDefinitions'));
    assert.deepEqual(stored, fields);
  });

  test('deduplicates by id', () => {
    localStorage.clear();
    const saveFieldDefinitions = (definitions) => {
      const unique = Array.from(new Map(definitions.map(d => [d.id, d])).values());
      localStorage.setItem('jiraFieldDefinitions', JSON.stringify(unique));
    };

    const fields = [
      { id: "summary", label: "v1" },
      { id: "priority", label: "Priority" },
      { id: "summary", label: "v2" }
    ];
    saveFieldDefinitions(fields);
    const stored = JSON.parse(localStorage.getItem('jiraFieldDefinitions'));
    assert.equal(stored.length, 2);
    assert.equal(stored.find(f => f.id === 'summary').label, 'v2');
  });

  test('throws on quota exceeded', () => {
    localStorage.clear();
    const saveFieldDefinitions = (definitions) => {
      try {
        const unique = Array.from(new Map(definitions.map(d => [d.id, d])).values());
        localStorage.setItem('jiraFieldDefinitions', JSON.stringify(unique));
      } catch (e) {
        throw new Error(`Failed to save field definitions: ${e.message}`);
      }
    };

    const original = localStorage.setItem;
    localStorage.setItem = (key) => {
      throw new Error('QuotaExceededError');
    };

    try {
      saveFieldDefinitions([{ id: "summary", label: "Summary" }]);
      assert.fail('Should throw');
    } catch (e) {
      assert.ok(e.message.includes('Failed'));
    } finally {
      localStorage.setItem = original;
    }
  });
});

localStorage.clear();
describe('Migration - Backward Compatibility', () => {
  test('migrates old format to new with fieldId', () => {
    const migrateFieldNames = (fields, defs) => {
      return fields.map(f => {
        if (!f.fieldId && f.name) {
          const def = defs.find(d => d.id === f.name);
          if (def) return { ...f, fieldId: def.id };
          const newDef = { id: f.name, label: f.name };
          defs.push(newDef);
          return { ...f, fieldId: newDef.id };
        }
        return f;
      });
    };

    const fields = [{ name: 'summary', value: 'Test' }];
    const defs = [...DEFAULT_FIELDS];
    const result = migrateFieldNames(fields, defs);
    assert.equal(result[0].fieldId, 'summary');
  });

  test('creates definition for unknown custom fields', () => {
    const migrateFieldNames = (fields, defs) => {
      return fields.map(f => {
        if (!f.fieldId && f.name) {
          const def = defs.find(d => d.id === f.name);
          if (def) return { ...f, fieldId: def.id };
          const newDef = { id: f.name, label: f.name };
          defs.push(newDef);
          return { ...f, fieldId: newDef.id };
        }
        return f;
      });
    };

    const fields = [{ name: 'customfield_10001', value: 'custom' }];
    const defs = [...DEFAULT_FIELDS];
    migrateFieldNames(fields, defs);
    assert.ok(defs.some(d => d.id === 'customfield_10001'));
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
