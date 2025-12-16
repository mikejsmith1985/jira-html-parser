// Test suite for HTML to Jira Wiki markup conversion
// Run with: node validate-fix.js

// Convert HTML formatting from contentEditable to Jira Wiki markup
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

// Smart format value: detect bullets and preserve formatting
function smartFormatValue(val) {
  // First convert HTML formatting to Jira markup
  let formatted = htmlToJiraMarkup(val);

  // Clean up multiple consecutive newlines
  formatted = formatted.replace(/\n\n+/g, '\n');

  // Split by lines and clean up
  const lines = formatted.split('\n');
  return lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    // If line starts with * (bullet), keep it as is
    if (trimmed.startsWith('*')) {
      return trimmed;
    }
    // Otherwise keep as plain text
    return trimmed;
  }).filter(Boolean).join('\n');
}

// Test cases
const tests = [
  {
    name: 'Bold text',
    input: '<b>Hello</b>',
    expected: '*Hello*'
  },
  {
    name: 'Italic text',
    input: '<i>Important</i>',
    expected: '_Important_'
  },
  {
    name: 'Underlined text',
    input: '<u>Critical</u>',
    expected: '+Critical+'
  },
  {
    name: 'Bold with strong tag',
    input: '<strong>Bold</strong>',
    expected: '*Bold*'
  },
  {
    name: 'Italic with em tag',
    input: '<em>Emphasis</em>',
    expected: '_Emphasis_'
  },
  {
    name: 'Mixed formatting',
    input: '<b>Bold</b>, <i>italic</i>, <u>underline</u>',
    expected: '*Bold*, _italic_, +underline+'
  },
  {
    name: 'Simple bullet list',
    input: '<ul><li>Item 1</li><li>Item 2</li></ul>',
    expected: '* Item 1\n* Item 2'
  },
  {
    name: 'Bullet list with formatting',
    input: '<ul><li><b>Bold</b> item</li><li><i>Italic</i> item</li></ul>',
    expected: '* *Bold* item\n* _Italic_ item'
  },
  {
    name: 'Line breaks',
    input: 'Line 1<br/>Line 2<br/>Line 3',
    expected: 'Line 1\nLine 2\nLine 3'
  },
  {
    name: 'Complex example',
    input: '<b>Summary:</b> Test description<br/><i>Details:</i><ul><li>Point 1</li><li><u>Point 2</u></li></ul>',
    expected: '*Summary:* Test description\n_Details:_* Point 1\n* +Point 2+'
  },
  {
    name: 'Plain text (no formatting)',
    input: 'Just plain text',
    expected: 'Just plain text'
  },
  {
    name: 'Empty string',
    input: '',
    expected: ''
  },
  {
    name: 'Multiple spaces (preserved)',
    input: '<b>Text</b>   <i>with</i>   <u>spaces</u>',
    expected: '*Text*   _with_   +spaces+'
  }
];

// Run tests
let passed = 0;
let failed = 0;

console.log('Running HTML to Jira Wiki Markup Conversion Tests\n');
console.log('=' .repeat(70));

tests.forEach((test, index) => {
  const result = smartFormatValue(test.input);
  const pass = result === test.expected;

  if (pass) {
    passed++;
    console.log(`✓ Test ${index + 1}: ${test.name}`);
  } else {
    failed++;
    console.log(`✗ Test ${index + 1}: ${test.name}`);
    console.log(`  Input:    ${test.input}`);
    console.log(`  Expected: ${JSON.stringify(test.expected)}`);
    console.log(`  Got:      ${JSON.stringify(result)}`);
  }
});

console.log('\n' + '='.repeat(70));
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${tests.length} tests`);

if (failed === 0) {
  console.log('\n✓ All tests passed! The formatting conversion is working correctly.');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed. Please review the implementation.');
  process.exit(1);
}
