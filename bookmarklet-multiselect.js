// Multi-Select Field Picker Bookmarklet
// This version creates a persistent side panel for selecting multiple fields

(function() {
  // Check if already active
  if (window.fieldPickerMultiSelect) {
    alert('Field Picker is already active!');
    return;
  }
  
  // State
  window.fieldPickerMultiSelect = {
    selectedFields: [],
    isActive: false
  };
  
  const state = window.fieldPickerMultiSelect;
  
  // Helper functions
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
  
  // Create side panel
  const panel = document.createElement('div');
  panel.id = 'fpSidePanel';
  panel.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    background: white;
    box-shadow: -4px 0 12px rgba(0,0,0,0.3);
    z-index: 999999;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
  
  panel.innerHTML = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0; font-size: 20px;">🎯 Field Picker</h2>
        <button id="fpClosePanel" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 20px;">&times;</button>
      </div>
      <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">Click fields to select, then save all at once</p>
    </div>
    
    <div style="padding: 16px; background: #f8f9fa; border-bottom: 2px solid #e2e8f0;">
      <button id="fpActivateBtn" style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 15px;">
        🚀 Activate Field Picker
      </button>
    </div>
    
    <div style="flex: 1; overflow-y: auto; padding: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div style="font-weight: 600; color: #2c3e50;">Selected Fields (<span id="fpFieldCount">0</span>)</div>
        <button id="fpClearAll" style="background: #6c757d; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; display: none;">Clear All</button>
      </div>
      <div id="fpFieldList">
        <div style="text-align: center; padding: 40px 20px; color: #7f8c8d;">
          <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
          <div>No fields selected</div>
          <div style="font-size: 12px; margin-top: 8px;">Activate and click form fields</div>
        </div>
      </div>
    </div>
    
    <div style="padding: 16px; border-top: 2px solid #e2e8f0; background: #f8f9fa;">
      <button id="fpSaveAllBtn" disabled style="width: 100%; background: #27ae60; color: white; border: none; padding: 14px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 15px; margin-bottom: 8px; opacity: 0.5;">
        💾 Save All to Config
      </button>
      <div style="font-size: 11px; color: #7f8c8d; text-align: center;">Fields will be saved to localStorage</div>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // Banner
  const banner = document.createElement('div');
  banner.id = 'fpBanner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background: #27ae60;
    color: white;
    padding: 12px 24px;
    border-radius: 0 0 8px 8px;
    z-index: 999998;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: none;
  `;
  banner.textContent = '🎯 Field Picker Active - Click any form field (ESC to deactivate)';
  document.body.appendChild(banner);
  
  // Update UI
  function updateUI() {
    const count = document.getElementById('fpFieldCount');
    const list = document.getElementById('fpFieldList');
    const saveBtn = document.getElementById('fpSaveAllBtn');
    const clearBtn = document.getElementById('fpClearAll');
    const activateBtn = document.getElementById('fpActivateBtn');
    
    count.textContent = state.selectedFields.length;
    saveBtn.disabled = state.selectedFields.length === 0;
    saveBtn.style.opacity = state.selectedFields.length === 0 ? '0.5' : '1';
    saveBtn.style.cursor = state.selectedFields.length === 0 ? 'not-allowed' : 'pointer';
    clearBtn.style.display = state.selectedFields.length > 0 ? 'block' : 'none';
    
    if (state.isActive) {
      activateBtn.textContent = '⏸️ Picker Active (ESC to stop)';
      activateBtn.style.background = '#95a5a6';
      activateBtn.disabled = true;
      activateBtn.style.cursor = 'not-allowed';
      document.body.style.cursor = 'crosshair';
      banner.style.display = 'block';
    } else {
      activateBtn.textContent = '🚀 Activate Field Picker';
      activateBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      activateBtn.disabled = false;
      activateBtn.style.cursor = 'pointer';
      document.body.style.cursor = '';
      banner.style.display = 'none';
    }
    
    if (state.selectedFields.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #7f8c8d;">
          <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
          <div>No fields selected</div>
          <div style="font-size: 12px; margin-top: 8px;">Activate and click form fields</div>
        </div>
      `;
    } else {
      list.innerHTML = state.selectedFields.map((field, index) => `
        <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #667eea;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <div style="font-weight: 600; color: #2c3e50; font-size: 14px; flex: 1;">${escapeHtml(field.label || field.id)}</div>
            <button onclick="window.fieldPickerMultiSelect.removeField(${index})" style="background: #e74c3c; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">Remove</button>
          </div>
          <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 4px;"><strong>ID:</strong> ${escapeHtml(field.id)}</div>
          <div style="font-size: 12px; color: #7f8c8d;"><strong>Type:</strong> <span style="background: #667eea; color: white; padding: 2px 6px; border-radius: 4px;">${field.type}</span></div>
          ${field.required ? '<div style="font-size: 12px; color: #e74c3c; font-weight: 600; margin-top: 4px;">✓ Required</div>' : ''}
        </div>
      `).join('');
    }
  }
  
  // Remove field
  state.removeField = function(index) {
    state.selectedFields.splice(index, 1);
    updateUI();
  };
  
  // Activate
  function activate() {
    if (state.isActive) return;
    state.isActive = true;
    updateUI();
  }
  
  // Deactivate
  function deactivate() {
    if (!state.isActive) return;
    state.isActive = false;
    updateUI();
  }
  
  // Handle field click
  function handleFieldClick(e) {
    if (!state.isActive) return;
    
    // Ignore clicks in the side panel
    if (e.target.closest('#fpSidePanel') || e.target.closest('#fpBanner')) {
      return;
    }
    
    let field = e.target.matches('input,select,textarea') ? e.target : e.target.closest('input,select,textarea');
    if (!field) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Extract field info
    let fieldId = field.id || field.name || field.getAttribute('data-ref') || field.getAttribute('aria-labelledby');
    
    if (!fieldId) {
      // Try to find hidden input for reference fields
      const parent = field.closest('[data-element]');
      if (parent) {
        fieldId = parent.getAttribute('data-element');
      }
    }
    
    if (!fieldId) {
      alert('This field has no ID or name attribute!');
      return;
    }
    
    // Check if already selected
    if (state.selectedFields.some(f => f.id === fieldId)) {
      // Flash red
      const origBg = field.style.background;
      field.style.background = '#e74c3c';
      setTimeout(() => field.style.background = origBg, 300);
      return;
    }
    
    // Get label
    let label = fieldId;
    const ariaLabelledBy = field.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelEl = document.getElementById(ariaLabelledBy);
      if (labelEl) label = labelEl.textContent.trim();
    } else {
      const labelFor = document.querySelector(`label[for="${field.id}"]`);
      if (labelFor) label = labelFor.textContent.trim();
    }
    
    // Clean label
    label = label.replace(/[*:]/g, '').trim();
    label = label.replace(/\s+(Required|Mandatory)[\s.,;:!?]*$/gi, '').trim();
    
    // Get type
    let fieldType = 'text';
    if (field.tagName === 'SELECT') fieldType = 'combobox';
    else if (field.tagName === 'TEXTAREA') fieldType = 'text';
    else if (field.type) fieldType = field.type;
    
    // Check required
    const isRequired = field.required || field.getAttribute('aria-required') === 'true';
    
    // Get options for dropdowns
    let options = [];
    if (fieldType === 'combobox' && field.options) {
      Array.from(field.options).forEach(opt => {
        if (opt.value) {
          options.push({ label: opt.textContent.trim(), value: opt.value });
        }
      });
    }
    
    // Add to selection
    state.selectedFields.push({
      id: fieldId,
      label: label,
      type: fieldType,
      required: isRequired,
      options: options
    });
    
    // Flash green
    const origBg = field.style.background;
    field.style.background = '#27ae60';
    setTimeout(() => field.style.background = origBg, 300);
    
    updateUI();
  }
  
  // Handle hover
  function handleHover(e) {
    if (!state.isActive) return;
    if (e.target.closest('#fpSidePanel') || e.target.closest('#fpBanner')) return;
    
    let field = e.target.matches('input,select,textarea') ? e.target : e.target.closest('input,select,textarea');
    if (field) {
      field.style.outline = '2px solid #3498db';
    }
  }
  
  function handleHoverOut(e) {
    if (!state.isActive) return;
    
    let field = e.target.matches('input,select,textarea') ? e.target : e.target.closest('input,select,textarea');
    if (field) {
      field.style.outline = '';
    }
  }
  
  // Handle ESC key
  function handleEscape(e) {
    if (e.key === 'Escape') {
      deactivate();
    }
  }
  
  // Event listeners
  document.addEventListener('click', handleFieldClick, true);
  document.addEventListener('mouseover', handleHover, true);
  document.addEventListener('mouseout', handleHoverOut, true);
  document.addEventListener('keydown', handleEscape);
  
  // Button handlers
  document.getElementById('fpActivateBtn').onclick = activate;
  document.getElementById('fpClosePanel').onclick = function() {
    if (confirm('Close field picker? All selected fields will be lost.')) {
      panel.remove();
      banner.remove();
      document.removeEventListener('click', handleFieldClick, true);
      document.removeEventListener('mouseover', handleHover, true);
      document.removeEventListener('mouseout', handleHoverOut, true);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.cursor = '';
      delete window.fieldPickerMultiSelect;
    }
  };
  
  document.getElementById('fpClearAll').onclick = function() {
    if (confirm('Clear all selected fields?')) {
      state.selectedFields = [];
      updateUI();
    }
  };
  
  document.getElementById('fpSaveAllBtn').onclick = function() {
    if (state.selectedFields.length === 0) {
      alert('No fields selected!');
      return;
    }
    
    // Save to localStorage with special key
    const STORAGE_KEY = 'jiraLinkGen_pendingFieldImport';
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      timestamp: Date.now(),
      fields: state.selectedFields
    }));
    
    const count = state.selectedFields.length;
    alert(`✅ Saved ${count} field(s)!\n\nNow go back to the Link Generator tab and the fields will be automatically imported.`);
    
    // Clear selection
    state.selectedFields = [];
    updateUI();
    deactivate();
  };
  
  updateUI();
})();
