# User Guide: Jira & ServiceNow Link Generators

This comprehensive guide explains how to use the Jira and ServiceNow Link Generator tools to streamline your workflow, manage configurations, and share setups with your team.

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Jira Link Generator](#jira-link-generator)
4. [ServiceNow Link Generator](#servicenow-link-generator)
5. [Managing Fields & Presets](#managing-fields--presets)
6. [Exporting & Importing Configurations](#exporting--importing-configurations)
7. [Troubleshooting](#troubleshooting)

---

## Introduction

These tools allow you to create pre-filled URL links for creating issues in Jira or records in ServiceNow. 
*   **Offline Capable**: They run entirely in your browser as single HTML files.
*   **Persistent**: Your settings (Base URLs, Fields, Presets) are saved automatically to your browser's local storage.
*   **Shareable**: You can export your configuration to a JSON file and share it with colleagues.

## Getting Started

1.  **Download**: Get the latest `jira-link-generator.html` or `servicenow-link-generator.html` from the [Releases page](https://github.com/mikejsmith1985/jira-html-parser/releases).
2.  **Open**: Double-click the file to open it in any modern web browser (Chrome, Edge, Firefox, Safari).
3.  **No Install**: No server or installation is required.

---

## Jira Link Generator

### 1. Basic Setup
*   **Base URL**: Enter your Jira instance URL (e.g., `https://company.atlassian.net`).
*   **Project ID**: The ID of the project where issues will be created (e.g., `10000`).
*   **Issue Type ID**: The ID for the type of issue (e.g., `10001` for Story, `10002` for Bug).

### 2. Adding Fields
*   Click **"+ Add Field"** to add standard fields like Summary, Description, Priority, etc.
*   Use **"Manage Fields"** to define custom fields (see [Managing Fields](#managing-fields--presets)).

### 3. Generating Links
1.  Fill in the values for your fields.
2.  Click **"Generate Link"**.
3.  The tool generates a URL. Click **"Copy"** to save it to your clipboard.
4.  Paste this link anywhere (Slack, Email, Docs). When clicked, it opens Jira with all fields pre-filled.

---

## ServiceNow Link Generator

### 1. Basic Setup
*   **Base URL**: Select or add your ServiceNow instance URL (e.g., `https://dev12345.service-now.com`).
*   **Table Name**: Enter the table you want to create a record in (e.g., `incident`, `change_request`).

### 2. Working with Instances
*   You can save multiple **Base URLs** (Instances) and switch between them.
*   **Field Association**: Some fields can be linked to specific instances (see [Field Management](#field-management)).

### 3. Rich Text Formatting
*   ServiceNow fields support rich text.
*   You can paste content with bullets, numbers, and basic formatting.
*   The tool automatically converts this to a format ServiceNow can read.

### 4. URL Limits
*   ServiceNow URLs have a length limit.
*   If your content exceeds **8,200 characters**, the tool will show a warning.
*   **Tip**: If you see the warning, try reducing the length of description fields to avoid a "414 Request-URI Too Large" error.

---

## Managing Fields & Presets

### Field Management
Click **"Manage Fields"** inside the tool to customize available fields.

*   **Add Custom Field**:
    *   **ID**: The internal system name (e.g., `customfield_123` for Jira, `u_category` for ServiceNow).
    *   **Label**: The display name (e.g., "Root Cause").
    *   **Type**: Choose `Text` or `Combobox` (Dropdown).
*   **Instance Association (ServiceNow Only)**:
    *   When adding/editing a field, you can select an **"Associated Instance"**.
    *   **Global**: If no instance is selected, the field appears for all instances.
    *   **Specific**: If an instance is selected, the field *only* appears in the dropdown when that specific Base URL is active.
    *   **Table Association (ServiceNow Only)**:
    *   Similarly, you can associate a field with a specific **Table Name** (e.g., `incident`).
    *   The field will only appear when that Table is selected.

### Finding Field IDs (Developer Tools)
To configure custom fields, you need their internal system IDs. You can find these using your browser's Developer Tools.

1.  **Open ServiceNow/Jira**: Navigate to the form where the field exists.
2.  **Right-click the Field**: Right-click on the input box or label of the field you want to add.
3.  **Inspect**: Select **"Inspect"** or **"Inspect Element"** from the context menu.
4.  **Find the ID**:
    *   **ServiceNow**: Look for the `name` or `id` attribute. It often starts with `u_` (e.g., `name="u_root_cause"`).
    *   **Jira**: Look for `id="customfield_10000"` or similar.
5.  **Copy**: Copy this ID and paste it into the **ID** field in the Link Generator's "Manage Fields" modal.

### Presets
Presets allow you to save a snapshot of your current form (fields and values) for quick reuse.

1.  **Save Preset**: 
    *   Set up the form exactly how you want it.
    *   Click **"Save as Preset"**.
    *   Give it a name (e.g., "Standard Bug Report").
    *   Optionally lock the Base URL or Table/Project ID.
2.  **Load Preset**:
    *   Select a preset from the dropdown at the top of the page.
    *   The form will instantly populate with your saved configuration.

---

## Exporting & Importing Configurations

You can share your entire setup (Base URLs, Fields, Presets) with your team.

### Exporting
1.  Click the **"Export Config"** button (Green button).
2.  A `.json` file will be downloaded to your computer (e.g., `servicenow-config-2025-01-23.json`).
3.  Send this file to your team members.

### Importing
1.  Click the **"Import Config"** button (Orange button).
2.  Select the `.json` file provided by your administrator or colleague.
3.  **Warning**: Importing a configuration **overwrites** your existing settings (Fields, Base URLs, Presets). Ensure you have backed up your current config if you want to keep it.
4.  The page will reload, and you will have all the shared Base URLs, Fields, and Presets.

---

## Using the Links

*   **Clicking**: Clicking the generated link will open the target system (Jira or ServiceNow) in a new tab.
*   **Pre-filled Form**: You will land on the "Create Issue" or "New Record" page with all your data filled in.
*   **Final Review**: You can review and edit the data in the target system before clicking "Create" or "Submit".

---

## Troubleshooting

### "414 Request-URI Too Large" Error
*   **Cause**: The generated URL is too long for the server to handle. This usually happens with very long descriptions or pasted images/content.
*   **Solution**: Reduce the amount of text in the rich text fields. The ServiceNow generator warns you if you exceed 8,200 characters.

### Fields Not Loading
*   **Cause**: You might be on the wrong Instance (Base URL).
*   **Solution**: Check if the field is associated with a specific Base URL. Switch the Base URL to see instance-specific fields.

### Import Not Working
*   **Cause**: The JSON file might be corrupted or from an incompatible version.
*   **Solution**: Ensure you are using a valid export file generated by the same tool.
