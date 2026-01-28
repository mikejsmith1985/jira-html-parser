// Test multi-file import logic
const fs = require('fs');
const path = require('path');

// Load all test files
const testDir = './test-imports';
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.json'));

console.log(`\n${'='.repeat(80)}`);
console.log('MULTI-FILE IMPORT TEST');
console.log(`${'='.repeat(80)}\n`);
console.log(`Loading ${files.length} JSON files from ${testDir}...\n`);

const configs = files.map(filename => {
  const filepath = path.join(testDir, filename);
  const content = fs.readFileSync(filepath, 'utf8');
  return { filename, config: JSON.parse(content) };
});

// Simulate the multi-file import logic
const mergedConfig = {
  configItems: [],
  fieldDefinitions: [],
  baseUrls: [],
  issueTypes: [],
  projectIds: [],
  ignoredFields: []
};

// Merge each config
configs.forEach(({ filename, config }) => {
  console.log(`📁 Processing ${filename}:`);
  console.log(`   baseUrl: ${config.baseUrl}`);
  console.log(`   issueType: ${config.issueType}`);
  console.log(`   fields: ${config.fieldDefinitions ? config.fieldDefinitions.length : 0}`);
  
  // First, process each config individually to set baseUrlId and issueTypeId on fields
  if (config.baseUrl && config.fieldDefinitions) {
    const baseUrlId = config.baseUrl.replace(/https?:\/\//, '').replace(/\//g, '-');
    config.fieldDefinitions.forEach(field => {
      if (!field.baseUrlId) field.baseUrlId = baseUrlId;
    });
  }
  if (config.issueType && config.fieldDefinitions) {
    config.fieldDefinitions.forEach(field => {
      // Set issueTypeId from either field.issueType or config.issueType
      if (!field.issueTypeId) {
        field.issueTypeId = field.issueType || config.issueType;
      }
      // Preserve field.issueType for display
      if (!field.issueType && config.issueType) {
        field.issueType = config.issueType;
      }
    });
  }
  
  // Now merge into master config
  if (config.fieldDefinitions) mergedConfig.fieldDefinitions.push(...config.fieldDefinitions);
  
  // Handle legacy formats for baseUrls and issueTypes
  if (config.baseUrl && !mergedConfig.baseUrls.find(b => b.url === config.baseUrl)) {
    const baseUrlId = config.baseUrl.replace(/https?:\/\//, '').replace(/\//g, '-');
    mergedConfig.baseUrls.push({ id: baseUrlId, url: config.baseUrl });
  }
  if (config.issueType && !mergedConfig.issueTypes.find(it => it.id === config.issueType)) {
    mergedConfig.issueTypes.push({ 
      id: config.issueType, 
      name: config.issueTypeLabel || config.issueType,
      alias: config.issueTypeLabel || config.issueType
    });
  }
  console.log('');
});

// Deduplicate merged data
console.log(`\n${'='.repeat(80)}`);
console.log('DEDUPLICATION');
console.log(`${'='.repeat(80)}\n`);

const originalCounts = {
  baseUrls: mergedConfig.baseUrls.length,
  issueTypes: mergedConfig.issueTypes.length,
  fieldDefinitions: mergedConfig.fieldDefinitions.length
};

mergedConfig.baseUrls = Array.from(new Map(mergedConfig.baseUrls.map(b => [b.id, b])).values());
mergedConfig.issueTypes = Array.from(new Map(mergedConfig.issueTypes.map(it => [it.id, it])).values());
// DON'T dedupe field definitions - we want to preserve duplicates

console.log(`Base URLs: ${originalCounts.baseUrls} → ${mergedConfig.baseUrls.length}`);
console.log(`Issue Types: ${originalCounts.issueTypes} → ${mergedConfig.issueTypes.length}`);
console.log(`Field Definitions: ${originalCounts.fieldDefinitions} (not deduped)`);

// Analyze duplicate fields
console.log(`\n${'='.repeat(80)}`);
console.log('DUPLICATE ANALYSIS');
console.log(`${'='.repeat(80)}\n`);

const fieldGroups = new Map();
mergedConfig.fieldDefinitions.forEach(field => {
  const key = `${field.id}|${field.baseUrlId || 'global'}`;
  if (!fieldGroups.has(key)) {
    fieldGroups.set(key, []);
  }
  fieldGroups.get(key).push(field);
});

const duplicateGroups = Array.from(fieldGroups.values()).filter(group => group.length > 1);

if (duplicateGroups.length > 0) {
  const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.length, 0);
  console.log(`✅ Found ${duplicateGroups.length} duplicate field groups (${totalDuplicates} total instances):\n`);
  
  duplicateGroups.forEach((group, index) => {
    const issueTypes = group.map(f => f.issueType || f.issueTypeId).join(', ');
    console.log(`${index + 1}. ${group[0].label} (${group[0].id})`);
    console.log(`   - ${group.length} instances across issue types: [${issueTypes}]`);
    
    // Show first field's metadata
    const firstField = group[0];
    console.log(`   - baseUrlId: ${firstField.baseUrlId || 'none'}`);
    console.log(`   - issueTypeId: ${firstField.issueTypeId || 'none'}`);
    console.log('');
  });
} else {
  console.log('❌ No duplicate fields found.');
}

// Verify saveFieldDefinitions deduplication logic
console.log(`\n${'='.repeat(80)}`);
console.log('SAVE DEDUPLICATION TEST');
console.log(`${'='.repeat(80)}\n`);

// Simulate the NEW saveFieldDefinitions logic
const unique = Array.from(new Map(mergedConfig.fieldDefinitions.map(d => {
  const issueTypeKey = Array.isArray(d.issueTypeId) ? d.issueTypeId.sort().join(',') : (d.issueTypeId || 'global');
  const key = `${d.id}|${issueTypeKey}|${d.baseUrlId || 'global'}`;
  return [key, d];
})).values());

console.log(`Before save dedup: ${mergedConfig.fieldDefinitions.length} fields`);
console.log(`After save dedup: ${unique.length} fields`);
console.log(`Difference: ${mergedConfig.fieldDefinitions.length - unique.length} fields removed\n`);

if (unique.length !== mergedConfig.fieldDefinitions.length) {
  console.log('❌ PROBLEM: Save deduplication is removing fields!');
  console.log('   This means the optimizer won\'t see duplicates.\n');
} else {
  console.log('✅ GOOD: Save deduplication preserves all fields with different issue types.');
  console.log('   Optimizer should be able to detect duplicates.\n');
}

// Now test what the optimizer would see
console.log(`${'='.repeat(80)}`);
console.log('OPTIMIZER SIMULATION');
console.log(`${'='.repeat(80)}\n`);

const activeFields = unique.filter(f => !f.ignored);
const optimizerFieldGroups = new Map();

activeFields.forEach(field => {
  const key = `${field.id}|${field.baseUrlId || 'global'}`;
  if (!optimizerFieldGroups.has(key)) {
    optimizerFieldGroups.set(key, []);
  }
  optimizerFieldGroups.get(key).push(field);
});

const optimizerDuplicateGroups = [];

optimizerFieldGroups.forEach((instances, key) => {
  const [fieldId, baseUrlId] = key.split('|');
  
  // Get unique issue types from all instances
  const issueTypes = new Set();
  
  instances.forEach(inst => {
    // Handle both single issueTypeId and array of issueTypeIds
    if (inst.issueTypeId) {
      if (Array.isArray(inst.issueTypeId)) {
        inst.issueTypeId.forEach(id => issueTypes.add(id));
      } else {
        issueTypes.add(inst.issueTypeId);
      }
    }
  });
  
  // Consider as duplicate if multiple instances or single instance with multiple types
  const shouldConsiderDuplicate = instances.length > 1 || 
    (instances.length === 1 && instances[0].issueTypeId && Array.isArray(instances[0].issueTypeId) && instances[0].issueTypeId.length > 1);
  
  if (shouldConsiderDuplicate && issueTypes.size >= 2) {
    optimizerDuplicateGroups.push({
      fieldId,
      label: instances[0].label,
      instanceCount: instances.length,
      issueTypeCount: issueTypes.size,
      issueTypes: Array.from(issueTypes)
    });
  }
});

if (optimizerDuplicateGroups.length > 0) {
  console.log(`✅ Optimizer would detect ${optimizerDuplicateGroups.length} duplicate groups:\n`);
  optimizerDuplicateGroups.forEach((group, index) => {
    console.log(`${index + 1}. ${group.label} (${group.fieldId})`);
    console.log(`   - ${group.instanceCount} instances`);
    console.log(`   - ${group.issueTypeCount} issue types: [${group.issueTypes.join(', ')}]`);
    console.log('');
  });
  console.log('✅ TEST PASSED: Multi-file import and optimizer detection working!\n');
} else {
  console.log('❌ TEST FAILED: Optimizer would not detect any duplicates.\n');
}
