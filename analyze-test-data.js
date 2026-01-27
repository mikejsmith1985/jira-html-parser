const fs = require('fs');

// Read the test-import.json to see what fields should be there
const testData = JSON.parse(fs.readFileSync('test-import.json', 'utf8'));

console.log('=== Test Import Data Analysis ===');
console.log('Total fields:', testData.fieldDefinitions.length);

const requiredFields = testData.fieldDefinitions.filter(f => f.required);
console.log('\nRequired fields:', requiredFields.length);
requiredFields.forEach(f => {
  console.log('- ' + f.label + ' (ID: ' + f.id + ', issueTypeId: ' + f.issueTypeId + ', baseUrlId: ' + f.baseUrlId + ')');
});

console.log('\nBase URLs in config:');
if (testData.baseUrls) {
  testData.baseUrls.forEach(b => console.log('- ' + b.id + ': ' + b.url));
}

console.log('\nIssue Types in config:');
if (testData.issueTypes) {
  testData.issueTypes.forEach(it => console.log('- ' + it.id + ': ' + it.name));
}
