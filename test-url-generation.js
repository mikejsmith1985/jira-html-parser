/**
 * Debug Test: Complete URL Generation Flow
 * Tests the entire pipeline from field values to final URL
 *
 * Run with: node test-url-generation.js
 */

// ============================================================================
// FUNCTIONS FROM jira-link-generator.html
// ============================================================================

function htmlToJiraMarkup(html) {
  let text = html;
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, (match, content) => {
    const itemText = htmlToJiraMarkup(content);
    return '* ' + itemText.trim() + '\n';
  });
  text = text.replace(/<\/?(?:ul|ol)[^>]*>/gi, '');
  text = text.replace(/<(?:b|strong)[^>]*>(.*?)<\/(?:b|strong)>/gi, '*$1*');
  text = text.replace(/<(?:i|em)[^>]*>(.*?)<\/(?:i|em)>/gi, '_$1_');
  text = text.replace(/<u[^>]*>(.*?)<\/u>/gi, '+$1+');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<div[^>]*>/gi, '\n');
  text = text.replace(/<\/div>/gi, '');
  text = text.replace(/<[^>]+>/g, '');
  return text;
}

function smartFormatValue(val) {
  let formatted = htmlToJiraMarkup(val);
  formatted = formatted.replace(/\n\n+/g, '\n');
  const lines = formatted.split('\n');
  return lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('*')) {
      return trimmed;
    }
    return trimmed;
  }).filter(Boolean).join('\n');
}

// Simulated getFields() - returns what would be captured from the form
function getFields(fieldDataArray) {
  return fieldDataArray;
}

// Simulated URL generation (from jira-link-generator.html line 377-392)
function generateJiraUrl(baseUrl, projectId, issueTypeId, fields) {
  let url = `${baseUrl}/secure/CreateIssueDetails!init.jspa?pid=${encodeURIComponent(projectId)}&issuetype=${encodeURIComponent(issueTypeId)}`;
  fields.forEach(f => {
    let val = smartFormatValue(f.value);
    url += `&${encodeURIComponent(f.name)}=${encodeURIComponent(val)}`;
  });
  return url;
}

// ============================================================================
// TEST CASES
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('URL Generation Flow Debug Tests');
console.log('='.repeat(80));

// Test 1: Simple field with bold text
console.log('\n--- Test 1: Simple Summary with Bold Text ---');
const fields1 = [
  { fieldId: 'summary', name: 'summary', value: '<b>Critical Bug</b> - Login Fails' }
];
const url1 = generateJiraUrl('https://jira.example.com', '12345', '10001', fields1);
console.log('Field Value (HTML):', fields1[0].value);
console.log('After smartFormatValue():', smartFormatValue(fields1[0].value));
console.log('Generated URL:');
console.log(url1);
console.log('\nDecoded parameter:');
const params1 = url1.split('&summary=')[1];
if (params1) {
  console.log('summary=' + decodeURIComponent(params1.split('&')[0]));
}

// Test 2: Multiple fields with different formatting
console.log('\n--- Test 2: Multiple Fields with Various Formatting ---');
const fields2 = [
  { fieldId: 'summary', name: 'summary', value: '<b>Bug Report</b>' },
  { fieldId: 'description', name: 'description', value: '<b>Steps:</b><ul><li>Open app</li><li>Click button</li></ul>' },
  { fieldId: 'priority', name: 'priority', value: '<i>High</i>' }
];
const url2 = generateJiraUrl('https://jira.example.com', 'BUG', '10001', fields2);
console.log('Generated URL:');
console.log(url2);
console.log('\nDecoded parameters:');
url2.split('&').forEach(part => {
  if (part.includes('=')) {
    const [key, value] = part.split('=');
    if (['summary', 'description', 'priority'].includes(decodeURIComponent(key))) {
      console.log(decodeURIComponent(key) + '=' + decodeURIComponent(value));
    }
  }
});

// Test 3: Field with bullet points
console.log('\n--- Test 3: Field with Bullet List ---');
const fields3 = [
  { fieldId: 'description', name: 'description', value: '<ul><li>First step</li><li>Second step with <b>bold</b></li><li>Third step</li></ul>' }
];
const url3 = generateJiraUrl('https://jira.example.com', 'PROJ', '10001', fields3);
console.log('Field Value (HTML):', fields3[0].value);
console.log('After smartFormatValue():');
console.log(smartFormatValue(fields3[0].value));
console.log('\nGenerated URL parameter:');
const params3 = url3.split('&description=')[1];
if (params3) {
  console.log('description=' + decodeURIComponent(params3.split('&')[0]));
}

// Test 4: Field with all formatting types combined
console.log('\n--- Test 4: All Formatting Types Combined ---');
const fields4 = [
  {
    fieldId: 'description',
    name: 'description',
    value: '<b>Bold</b> <i>italic</i> <u>underline</u> and <b><i>combined</i></b>'
  }
];
const url4 = generateJiraUrl('https://jira.example.com', 'TEST', '10001', fields4);
console.log('Field Value (HTML):', fields4[0].value);
console.log('After smartFormatValue():');
console.log(smartFormatValue(fields4[0].value));
console.log('\nGenerated URL parameter:');
const params4 = url4.split('&description=')[1];
if (params4) {
  console.log('description=' + decodeURIComponent(params4.split('&')[0]));
}

// Test 5: Plain text (no formatting)
console.log('\n--- Test 5: Plain Text (No Formatting) ---');
const fields5 = [
  { fieldId: 'summary', name: 'summary', value: 'Plain text summary' }
];
const url5 = generateJiraUrl('https://jira.example.com', 'PLAIN', '10001', fields5);
console.log('Field Value (HTML):', fields5[0].value);
console.log('After smartFormatValue():', smartFormatValue(fields5[0].value));
console.log('\nGenerated URL:');
console.log(url5);

// Test 6: Custom field with formatting
console.log('\n--- Test 6: Custom Field (customfield_10000) ---');
const fields6 = [
  { fieldId: 'customfield_10000', name: 'customfield_10000', value: '<b>Custom</b> value' }
];
const url6 = generateJiraUrl('https://jira.example.com', 'CUSTOM', '10001', fields6);
console.log('Field Value (HTML):', fields6[0].value);
console.log('After smartFormatValue():', smartFormatValue(fields6[0].value));
console.log('\nGenerated URL:');
console.log(url6);

// Test 7: Issue with special characters in formatted text
console.log('\n--- Test 7: Formatting with Special Characters ---');
const fields7 = [
  { fieldId: 'summary', name: 'summary', value: '<b>Bug: Can\'t login</b> (50% failed)' }
];
const url7 = generateJiraUrl('https://jira.example.com', 'SPEC', '10001', fields7);
console.log('Field Value (HTML):', fields7[0].value);
console.log('After smartFormatValue():', smartFormatValue(fields7[0].value));
console.log('\nGenerated URL:');
console.log(url7);
console.log('\nDecoded:');
const params7 = url7.split('&summary=')[1];
if (params7) {
  console.log('summary=' + decodeURIComponent(params7.split('&')[0]));
}

// Test 8: Simulating browser's actual contentEditable output
console.log('\n--- Test 8: Real Browser ContentEditable Output (Chrome/Firefox/Edge) ---');
// Different browsers generate different HTML for the same user action
const browserOutputs = {
  'Chrome (bold)': '<b>Bold Text</b>',
  'Firefox (bold)': '<strong>Bold Text</strong>',
  'Safari (bold)': '<b>Bold Text</b>',
  'Edge (bold)': '<strong>Bold Text</strong>',
  'Chrome (list)': '<ul><li>Item 1</li><li>Item 2</li></ul>',
  'Firefox (list)': '<ul><li>Item 1</li><li>Item 2</li></ul>',
  'Nested formatting': '<strong><em>Bold Italic</em></strong>',
};

Object.entries(browserOutputs).forEach(([browser, html]) => {
  const result = smartFormatValue(html);
  console.log(`\n${browser}:`);
  console.log(`  Input:  ${html}`);
  console.log(`  Output: ${result}`);
  console.log(`  Status: ${result.match(/\*|_|\+/) ? '✓ Has formatting' : '✗ No formatting'}`);
});

// ============================================================================
// ANALYSIS
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('Analysis');
console.log('='.repeat(80));
console.log(`
Expected Jira Markup Format:
- Bold:      *text*
- Italic:    _text_
- Underline: +text+
- Bullets:   * item1
             * item2

URL Parameter Format:
- Field name: parameter name (summary, description, customfield_XXXXX)
- Field value: Jira markup, URL-encoded
- Example: &summary=*Bold*%20Text

If formatting isn't appearing in Jira:
1. Check if HTML tags are being captured from contentEditable
2. Verify htmlToJiraMarkup() is converting tags correctly
3. Ensure URL parameters are using correct field names
4. Check if Jira recognizes Jira markup in URL parameters
5. Verify browser isn't stripping formatting before sending request

Next Steps:
- Open test-contenteditable-html.html in a browser to see actual HTML
- Check Jira API documentation for parameter names
- Test if plain URL parameter works (not using form submission)
`);
