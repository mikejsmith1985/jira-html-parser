/**
 * TDD Test Suite: Configuration Dropdowns with Aliases
 * 
 * RED Phase: Write failing tests first
 * GREEN Phase: Make tests pass
 * REFACTOR Phase: Clean up implementation
 * 
 * User Story:
 * As a user, I want to save multiple configurations (Base URL, Project ID, Issue Type ID)
 * with friendly names/aliases, and quickly select them from dropdowns,
 * so I can switch between different Jira environments easily.
 * 
 * Acceptance Criteria:
 * 1. Each config field has a dropdown/combobox UI
 * 2. "Manage" button is visible and functional
 * 3. Can save configurations with aliases/labels
 * 4. Can select from saved configurations via dropdown
 * 5. Configuration persists in localStorage
 */

const assert = require('assert');

// Mock DOM and localStorage
global.document = {
  getElementById: (id) => {
    const mockElements = {
      baseUrl: { value: '', options: [], selectedIndex: 0 },
      projectId: { value: '', options: [], selectedIndex: 0 },
      issueTypeId: { value: '', options: [], selectedIndex: 0 },
      baseUrlSelect: { value: '', options: [], selectedIndex: 0, addEventListener: () => {} },
      projectIdSelect: { value: '', options: [], selectedIndex: 0, addEventListener: () => {} },
      issueTypeIdSelect: { value: '', options: [], selectedIndex: 0, addEventListener: () => {} }
    };
    return mockElements[id] || { value: '', innerHTML: '', style: {}, addEventListener: () => {} };
  },
  createElement: () => ({ 
    style: {}, 
    innerHTML: '', 
    value: '', 
    options: [], 
    addEventListener: () => {},
    appendChild: () => {}
  })
};

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
// TDD RED PHASE - These tests should FAIL initially
// ============================================================================

describe('Configuration Dropdowns - TDD Tests', () => {
  
  beforeEach(() => {
    localStorage.clear();
  });

  // Test 1: Saved Configurations Storage
  describe('Saved Configurations', () => {
    it('should save a configuration with alias', () => {
      const config = {
        alias: 'Production',
        baseUrl: 'https://jira.company.com',
        projectId: 'PROD',
        issueTypeId: '10001'
      };
      
      saveConfiguration(config);
      
      const configs = loadSavedConfigurations();
      assert(configs.length > 0, 'Should have at least one configuration');
      assert.equal(configs[0].alias, 'Production');
      assert.equal(configs[0].baseUrl, 'https://jira.company.com');
    });

    it('should load all saved configurations', () => {
      saveConfiguration({ alias: 'Dev', baseUrl: 'https://dev.jira.com', projectId: 'DEV', issueTypeId: '10001' });
      saveConfiguration({ alias: 'Staging', baseUrl: 'https://staging.jira.com', projectId: 'STG', issueTypeId: '10002' });
      
      const configs = loadSavedConfigurations();
      assert.equal(configs.length, 2);
      assert.equal(configs[0].alias, 'Dev');
      assert.equal(configs[1].alias, 'Staging');
    });

    it('should delete a saved configuration', () => {
      saveConfiguration({ alias: 'Test', baseUrl: 'https://test.com', projectId: 'TEST', issueTypeId: '10001' });
      const configs = loadSavedConfigurations();
      const configId = configs[0].id;
      
      deleteConfiguration(configId);
      
      const remaining = loadSavedConfigurations();
      assert.equal(remaining.length, 0);
    });

    it('should update an existing configuration', () => {
      saveConfiguration({ alias: 'Original', baseUrl: 'https://old.com', projectId: 'OLD', issueTypeId: '10001' });
      const configs = loadSavedConfigurations();
      const configId = configs[0].id;
      
      updateConfiguration(configId, { alias: 'Updated', baseUrl: 'https://new.com', projectId: 'NEW', issueTypeId: '10002' });
      
      const updated = loadSavedConfigurations();
      assert.equal(updated[0].alias, 'Updated');
      assert.equal(updated[0].baseUrl, 'https://new.com');
    });
  });

  // Test 2: Dropdown Population
  describe('Dropdown UI', () => {
    it('should populate dropdowns with saved configurations', () => {
      saveConfiguration({ alias: 'Config1', baseUrl: 'https://one.com', projectId: 'ONE', issueTypeId: '10001' });
      saveConfiguration({ alias: 'Config2', baseUrl: 'https://two.com', projectId: 'TWO', issueTypeId: '10002' });
      
      const baseUrlOptions = populateBaseUrlDropdown();
      assert(baseUrlOptions.length >= 2, 'Should have at least 2 options');
      assert(baseUrlOptions.some(opt => opt.text === 'Config1'));
      assert(baseUrlOptions.some(opt => opt.text === 'Config2'));
    });

    it('should populate dropdown with unique values only', () => {
      saveConfiguration({ alias: 'A', baseUrl: 'https://same.com', projectId: 'P1', issueTypeId: '10001' });
      saveConfiguration({ alias: 'B', baseUrl: 'https://same.com', projectId: 'P2', issueTypeId: '10001' });
      
      const baseUrlOptions = populateBaseUrlDropdown();
      const sameUrlCount = baseUrlOptions.filter(opt => opt.value === 'https://same.com').length;
      assert.equal(sameUrlCount, 1, 'Should not duplicate same URL');
    });
  });

  // Test 3: Configuration Selection
  describe('Configuration Selection', () => {
    it('should apply selected configuration to form', () => {
      const config = {
        alias: 'MyConfig',
        baseUrl: 'https://selected.com',
        projectId: 'SEL',
        issueTypeId: '10003'
      };
      saveConfiguration(config);
      const configs = loadSavedConfigurations();
      
      applyConfiguration(configs[0].id);
      
      const baseUrl = document.getElementById('baseUrl');
      assert.equal(baseUrl.value, 'https://selected.com');
    });

    it('should remember last used configuration', () => {
      saveConfiguration({ alias: 'Last', baseUrl: 'https://last.com', projectId: 'LST', issueTypeId: '10001' });
      const configs = loadSavedConfigurations();
      
      applyConfiguration(configs[0].id);
      rememberLastUsedConfiguration(configs[0].id);
      
      const lastUsed = getLastUsedConfiguration();
      assert.equal(lastUsed, configs[0].id);
    });
  });

  // Test 4: Manage Button Functionality
  describe('Manage Button', () => {
    it('should open configuration management modal', () => {
      const modalState = openConfigurationManager();
      assert(modalState.isOpen, 'Modal should be open');
    });

    it('should display all saved configurations in modal', () => {
      saveConfiguration({ alias: 'C1', baseUrl: 'https://c1.com', projectId: 'C1', issueTypeId: '10001' });
      saveConfiguration({ alias: 'C2', baseUrl: 'https://c2.com', projectId: 'C2', issueTypeId: '10002' });
      
      const modalContent = getConfigurationManagerContent();
      assert(modalContent.includes('C1'));
      assert(modalContent.includes('C2'));
    });
  });
});

// ============================================================================
// Functions to implement (GREEN Phase)
// ============================================================================

function saveConfiguration(config) {
  // To be implemented
  throw new Error('Not implemented yet - RED phase');
}

function loadSavedConfigurations() {
  // To be implemented
  throw new Error('Not implemented yet - RED phase');
}

function deleteConfiguration(configId) {
  // To be implemented
  throw new Error('Not implemented yet - RED phase');
}

function updateConfiguration(configId, updates) {
  // To be implemented
  throw new Error('Not implemented yet - RED phase');
}

function populateBaseUrlDropdown() {
  // To be implemented
  throw new Error('Not implemented yet - RED phase');
}

function applyConfiguration(configId) {
  // To be implemented
  throw new Error('Not implemented yet - RED phase');
}

function rememberLastUsedConfiguration(configId) {
  // To be implemented
  throw new Error('Not implemented yet - RED phase');
}

function getLastUsedConfiguration() {
  // To be implemented
  throw new Error('Not implemented yet - RED phase');
}

function openConfigurationManager() {
  // To be implemented
  throw new Error('Not implemented yet - RED phase');
}

function getConfigurationManagerContent() {
  // To be implemented
  throw new Error('Not implemented yet - RED phase');
}

// ============================================================================
// Test Runner
// ============================================================================

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${e.message}`);
  }
}

function beforeEach(fn) {
  // Simple beforeEach implementation
  fn();
}

// Run tests
console.log('='.repeat(70));
console.log('TDD RED PHASE - Configuration Dropdowns Tests');
console.log('='.repeat(70));
console.log('These tests SHOULD FAIL - this proves we need to implement the feature');
console.log('='.repeat(70));

try {
  describe('Configuration Dropdowns - TDD Tests', () => {
    // All tests here
  });
} catch (e) {
  console.log('\n✓ Tests are failing as expected - RED phase complete');
  console.log('Next: Implement functions to make tests pass (GREEN phase)');
}
