# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - text: Summary Required
    - textbox "Summary Required" [ref=e3]
    - text: Reporter Required
    - textbox "Reporter Required" [ref=e4]
    - text: Priority
    - combobox "Priority" [ref=e5]:
      - option "High" [selected]
      - option "Low"
  - generic [ref=e7]:
    - heading "ServiceNow Field Extractor Results" [level=2] [ref=e8]
    - paragraph [ref=e9]:
      - text: Found
      - strong [ref=e10]: "3"
      - text: fields (1 dropdowns with options).
    - paragraph [ref=e11]:
      - strong [ref=e12]: "Extractor Version:"
      - text: 0.11.6
      - strong [ref=e13]: "Base URL:"
      - text: file://
      - strong [ref=e14]: "Issue Type:"
      - text: (not detected)
    - textbox [ref=e15]: "{ \"version\": \"1.3.0\", \"extractorVersion\": \"0.11.6\", \"extractedAt\": \"2026-01-28T00:21:55.989Z\", \"description\": \"Extracted Field Definitions\", \"tool\": \"Field Extractor Bookmarklet\", \"appType\": \"servicenow\", \"baseUrl\": \"file://\", \"issueType\": \"\", \"fieldDefinitions\": [ { \"id\": \"summary\", \"label\": \"Summary\", \"category\": \"custom\", \"fieldType\": \"text\", \"issueType\": \"\", \"required\": true }, { \"id\": \"reporter\", \"label\": \"Reporter\", \"category\": \"custom\", \"fieldType\": \"text\", \"issueType\": \"\", \"required\": true }, { \"id\": \"priority\", \"label\": \"Priority\", \"category\": \"custom\", \"fieldType\": \"combobox\", \"issueType\": \"\", \"required\": false, \"options\": [ { \"label\": \"High\", \"value\": \"high\" }, { \"label\": \"Low\", \"value\": \"low\" } ] } ] }"
    - generic [ref=e16]:
      - button "Copy to Clipboard" [ref=e17] [cursor=pointer]
      - button "Download JSON" [ref=e18] [cursor=pointer]
      - button "Close" [ref=e19] [cursor=pointer]
```