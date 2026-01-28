// Test executeImport mergeItems logic
const fs = require('fs');
const path = require('path');

// Load all test files
const testDir = './test-imports';
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.json'));

console.log(`\n${'='.repeat(80)}`);
console.log('TESTING executeImport mergeItems LOGIC');
console.log(`${'='.repeat(80)}\n`);

const configs = files.map(filename => {
  const filepath = path.join(testDir, filename);
  const content = fs.readFileSync(filepath, 'utf8');
  return { filename, config: JSON.parse(content) };
});

// Simulate what importMultipleConfigurations does
const mergedConfig = {
  fieldDefinitions: []
};

configs.forEach(({ filename, config }) => {
  if (config.baseUrl && config.fieldDefinitions) {
    const baseUrlId = config.baseUrl.replace(/https?:\/\//, '').replace(/\//g, '-');
    config.fieldDefinitions.forEach(field => {
      if (!field.baseUrlId) field.baseUrlId = baseUrlId;
    });
  }
  if (config.issueType && config.fieldDefinitions) {
    config.fieldDefinitions.forEach(field => {
      if (!field.issueTypeId) {
        field.issueTypeId = field.issueType || config.issueType;
      }
      if (!field.issueType && config.issueType) {
        field.issueType = config.issueType;
      }
    });
  }
  
  if (config.fieldDefinitions) mergedConfig.fieldDefinitions.push(...config.fieldDefinitions);
});

console.log(`After multi-file merge: ${mergedConfig.fieldDefinitions.length} fields`);

// Simulate the OLD mergeItems (by ID only)
function mergeItemsOld(existing, incoming) {
  const map = new Map();
  if (Array.isArray(existing)) {
    existing.forEach(i => map.set(i.id, i));
  }
  if (Array.isArray(incoming)) {
    incoming.forEach(item => {
      map.set(item.id, item);
    });
  }
  return Array.from(map.values());
}

// Simulate the NEW mergeItems (by id + issueTypeId + baseUrlId)
function mergeItemsNew(existing, incoming, isFieldDefinitions = false) {
  const map = new Map();
  if (Array.isArray(existing)) {
    existing.forEach(i => {
      if (isFieldDefinitions) {
        const issueTypeKey = Array.isArray(i.issueTypeId) ? i.issueTypeId.sort().join(',') : (i.issueTypeId || 'global');
        const key = `${i.id}|${issueTypeKey}|${i.baseUrlId || 'global'}`;
        map.set(key, i);
      } else {
        map.set(i.id, i);
      }
    });
  }
  if (Array.isArray(incoming)) {
    incoming.forEach(item => {
      if (isFieldDefinitions) {
        const issueTypeKey = Array.isArray(item.issueTypeId) ? item.issueTypeId.sort().join(',') : (item.issueTypeId || 'global');
        const key = `${item.id}|${issueTypeKey}|${item.baseUrlId || 'global'}`;
        map.set(key, item);
      } else {
        map.set(item.id, item);
      }
    });
  }
  return Array.from(map.values());
}

// Test OLD mergeItems (existing implementation)
console.log(`\n${'='.repeat(80)}`);
console.log('OLD mergeItems (by ID only)');
console.log(`${'='.repeat(80)}\n`);

const existingFields = []; // Empty for first import
const afterOldMerge = mergeItemsOld(existingFields, mergedConfig.fieldDefinitions);
console.log(`After OLD mergeItems: ${afterOldMerge.length} fields`);
console.log(`Lost: ${mergedConfig.fieldDefinitions.length - afterOldMerge.length} fields\n`);

// Test NEW mergeItems
console.log(`${'='.repeat(80)}`);
console.log('NEW mergeItems (by id + issueTypeId + baseUrlId)');
console.log(`${'='.repeat(80)}\n`);

const afterNewMerge = mergeItemsNew(existingFields, mergedConfig.fieldDefinitions, true);
console.log(`After NEW mergeItems: ${afterNewMerge.length} fields`);
console.log(`Lost: ${mergedConfig.fieldDefinitions.length - afterNewMerge.length} fields\n`);

// Analyze duplicates in OLD vs NEW
console.log(`${'='.repeat(80)}`);
console.log('DUPLICATE ANALYSIS');
console.log(`${'='.repeat(80)}\n`);

function analyzeDuplicates(fields, label) {
  const fieldGroups = new Map();
  fields.forEach(field => {
    const key = `${field.id}|${field.baseUrlId || 'global'}`;
    if (!fieldGroups.has(key)) {
      fieldGroups.set(key, []);
    }
    fieldGroups.get(key).push(field);
  });
  
  const duplicateGroups = Array.from(fieldGroups.values()).filter(group => group.length > 1);
  
  console.log(`${label}:`);
  if (duplicateGroups.length > 0) {
    console.log(`  ✅ ${duplicateGroups.length} duplicate groups found`);
    console.log(`  Sample: ${duplicateGroups[0][0].label} appears in ${duplicateGroups[0].length} issue types\n`);
  } else {
    console.log(`  ❌ NO duplicates found - optimizer will fail!\n`);
  }
}

analyzeDuplicates(afterOldMerge, 'OLD mergeItems result');
analyzeDuplicates(afterNewMerge, 'NEW mergeItems result');

if (afterNewMerge.length === mergedConfig.fieldDefinitions.length) {
  console.log('✅ TEST PASSED: NEW mergeItems preserves all fields!');
} else {
  console.log('❌ TEST FAILED: NEW mergeItems is still losing fields.');
}
