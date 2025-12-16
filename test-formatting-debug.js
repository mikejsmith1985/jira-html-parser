/**
 * Debug Test: HTML-to-Jira-Markup Conversion
 * Tests to trace the formatting pipeline: contentEditable HTML → Jira markup → URL encoding
 *
 * Run with: node test-formatting-debug.js
 */

// ============================================================================
// HTML-TO-JIRA-MARKUP CONVERSION FUNCTION (from jira-link-generator.html)
// ============================================================================

function htmlToJiraMarkup(html) {
  let text = html;

  // Handle lists: convert <li> items to Jira bullet format with newlines between items
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, (match, content) => {
    const itemText = htmlToJiraMarkup(content);
    return '* ' + itemText.trim() + '\n';
  });

  // Remove <ul>, <ol> tags but keep content
  text = text.replace(/<\/?(?:ul|ol)[^>]*>/gi, '');

  // Convert bold: <b> and <strong> to *text*
  text = text.replace(/<(?:b|strong)[^>]*>(.*?)<\/(?:b|strong)>/gi, '*$1*');

  // Convert italic: <i> and <em> to _text_
  text = text.replace(/<(?:i|em)[^>]*>(.*?)<\/(?:i|em)>/gi, '_$1_');

  // Convert underline: <u> to +text+
  text = text.replace(/<u[^>]*>(.*?)<\/u>/gi, '+$1+');

  // Convert <br> and <br/> to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Convert <div> to newlines (but preserve the content)
  text = text.replace(/<div[^>]*>/gi, '\n');
  text = text.replace(/<\/div>/gi, '');

  // Remove any other remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  return text;
}

// Smart format value (from jira-link-generator.html)
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

// ============================================================================
// TEST CASES
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('HTML-to-Jira-Markup Conversion Debug Tests');
console.log('='.repeat(70));

// Test 1: Simple bold text
console.log('\n--- Test 1: Simple Bold ---');
const html1 = '<b>Bold Text</b>';
const result1 = htmlToJiraMarkup(html1);
console.log('Input HTML:', html1);
console.log('Expected:', '*Bold Text*');
console.log('Got:', result1);
console.log('Match:', result1 === '*Bold Text*' ? '✓ PASS' : '✗ FAIL');

// Test 2: Bold with smartFormatValue
console.log('\n--- Test 2: Bold with smartFormatValue ---');
const result2 = smartFormatValue(html1);
console.log('Input HTML:', html1);
console.log('Expected:', '*Bold Text*');
console.log('Got:', result2);
console.log('Match:', result2 === '*Bold Text*' ? '✓ PASS' : '✗ FAIL');

// Test 3: Italic
console.log('\n--- Test 3: Italic ---');
const html3 = '<i>Italic Text</i>';
const result3 = htmlToJiraMarkup(html3);
console.log('Input HTML:', html3);
console.log('Expected:', '_Italic Text_');
console.log('Got:', result3);
console.log('Match:', result3 === '_Italic Text_' ? '✓ PASS' : '✗ FAIL');

// Test 4: Underline
console.log('\n--- Test 4: Underline ---');
const html4 = '<u>Underline Text</u>';
const result4 = htmlToJiraMarkup(html4);
console.log('Input HTML:', html4);
console.log('Expected:', '+Underline Text+');
console.log('Got:', result4);
console.log('Match:', result4 === '+Underline Text+' ? '✓ PASS' : '✗ FAIL');

// Test 5: Multiple formatting in one line
console.log('\n--- Test 5: Mixed Formatting ---');
const html5 = '<b>Bold</b> and <i>italic</i>';
const result5 = htmlToJiraMarkup(html5);
console.log('Input HTML:', html5);
console.log('Expected:', '*Bold* and _italic_');
console.log('Got:', result5);
console.log('Match:', result5 === '*Bold* and _italic_' ? '✓ PASS' : '✗ FAIL');

// Test 6: Bullets (single)
console.log('\n--- Test 6: Bullet List (single item) ---');
const html6 = '<ul><li>Item 1</li></ul>';
const result6 = htmlToJiraMarkup(html6);
console.log('Input HTML:', html6);
console.log('Expected: "* Item 1\\n" (with trailing newline)');
console.log('Got:', JSON.stringify(result6));
console.log('Match:', result6.includes('* Item 1') ? '✓ PASS' : '✗ FAIL');

// Test 7: Bullets (multiple)
console.log('\n--- Test 7: Bullet List (multiple items) ---');
const html7 = '<ul><li>First</li><li>Second</li><li>Third</li></ul>';
const result7 = smartFormatValue(html7);
console.log('Input HTML:', html7);
console.log('Expected: "* First\\n* Second\\n* Third"');
console.log('Got:', JSON.stringify(result7));
const hasBullets = result7.includes('* First') && result7.includes('* Second') && result7.includes('* Third');
console.log('Match:', hasBullets ? '✓ PASS' : '✗ FAIL');

// Test 8: Plain text (no formatting)
console.log('\n--- Test 8: Plain Text ---');
const html8 = 'Just plain text';
const result8 = htmlToJiraMarkup(html8);
console.log('Input HTML:', html8);
console.log('Expected:', 'Just plain text');
console.log('Got:', result8);
console.log('Match:', result8 === 'Just plain text' ? '✓ PASS' : '✗ FAIL');

// Test 9: HTML with nested formatting
console.log('\n--- Test 9: Nested Formatting ---');
const html9 = '<b><i>Bold and Italic</i></b>';
const result9 = htmlToJiraMarkup(html9);
console.log('Input HTML:', html9);
console.log('Expected: "*_Bold and Italic_*" (or similar)');
console.log('Got:', result9);
console.log('Note: Nested formatting may produce different but valid results');

// Test 10: Common contentEditable generated HTML (with div wrappers)
console.log('\n--- Test 10: Div-wrapped Text (common contentEditable output) ---');
const html10 = '<div>First paragraph</div><div>Second paragraph</div>';
const result10 = smartFormatValue(html10);
console.log('Input HTML:', html10);
console.log('Expected: "First paragraph\\nSecond paragraph"');
console.log('Got:', JSON.stringify(result10));
const hasParagraphs = result10.includes('First paragraph') && result10.includes('Second paragraph');
console.log('Match:', hasParagraphs ? '✓ PASS' : '✗ FAIL');

// Test 11: URL Encoding simulation
console.log('\n--- Test 11: URL Encoding (Final Step) ---');
const html11 = '<b>Bold</b> Test';
const markup11 = htmlToJiraMarkup(html11);
const encoded11 = encodeURIComponent(markup11);
console.log('Input HTML:', html11);
console.log('After htmlToJiraMarkup():', markup11);
console.log('After encodeURIComponent():', encoded11);
console.log('Decoded back:', decodeURIComponent(encoded11));
console.log('Match:', decodeURIComponent(encoded11) === markup11 ? '✓ PASS' : '✗ FAIL');

// Test 12: Edge case - empty HTML
console.log('\n--- Test 12: Empty HTML ---');
const html12 = '';
const result12 = htmlToJiraMarkup(html12);
console.log('Input HTML:', JSON.stringify(html12));
console.log('Expected: ""');
console.log('Got:', JSON.stringify(result12));
console.log('Match:', result12 === '' ? '✓ PASS' : '✗ FAIL');

// Test 13: Edge case - HTML with extra whitespace
console.log('\n--- Test 13: Whitespace Handling ---');
const html13 = '<b>  Bold  </b>';
const result13 = htmlToJiraMarkup(html13);
console.log('Input HTML:', html13);
console.log('Got:', result13);
console.log('Note: Extra whitespace preserved from HTML');

// Test 14: Real-world example - Bug Report Template
console.log('\n--- Test 14: Real-world Example (Bug Report) ---');
const html14 = `<b>Steps to reproduce:</b><br>
<ul><li>First step</li><li>Second step</li></ul><br>
<b>Expected:</b> Should work<br>
<b>Actual:</b> Does not work`;
const result14 = smartFormatValue(html14);
console.log('Input HTML:', html14);
console.log('Result:');
console.log(result14);
console.log('---');
console.log('URL encoded would be:');
console.log(encodeURIComponent(result14));

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('Debug Test Complete');
console.log('='.repeat(70));
console.log('\nIf tests pass, the conversion logic is working correctly.');
console.log('If tests fail, the regex patterns may need adjustment.');
console.log('\nNext step: Check if contentEditable actually generates <b>, <i>, <u> tags');
console.log('          or if browser uses <strong>, <em>, different wrappers');
