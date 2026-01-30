// Enhanced Field Picker with Multi-Select
// This version allows selecting multiple fields before exporting as a single JSON config

(function() {
  if (window.fieldPickerActive) {
    alert('Field Picker is already active!');
    return;
  }
  
  window.fieldPickerActive = true;
  window.selectedFields = window.selectedFields || [];
  
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
  
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches;
  const colors = isDarkMode ? {
    modalBg: '#1e293b',
    borderColor: '#475569',
    sectionBg: '#334155',
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    codeBg: '#1e293b',
    buttonBg: '#3b82f6',
    buttonHover: '#2563eb',
    successBg: '#166534',
    panelBg: '#0f172a'
  } : {
    modalBg: '#ffffff',
    borderColor: '#e2e8f0',
    sectionBg: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    codeBg: '#f8fafc',
    buttonBg: '#3b82f6',
    buttonHover: '#2563eb',
    successBg: '#27ae60',
    panelBg: '#ffffff'
  };

  // Create persistent side panel
  let sidePanel = document.createElement('div');
  sidePanel.id = 'fpSidePanel';
  sidePanel.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    width: 320px;
    max-height: calc(100vh - 80px);
    background: ${colors.panelBg};
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 999997;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 2px solid ${colors.borderColor};
  `;
  
  const updateSidePanel = () => {
    const count = window.selectedFields.length;
    
    let html = `
      <div style="padding: 16px; background: ${colors.successBg}; color: white; font-weight: 600; display: flex; justify-content: space-between; align-items: center;">
        <span>📦 Selected Fields (${count})</span>
        <button id="fpClosePanelBtn" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 24px; height: 24px; line-height: 1;">&times;</button>
      </div>
      <div style="flex: 1; overflow-y: auto; padding: 12px;">
    `;
    
    if (count === 0) {
      html += `
        <div style="text-align: center; padding: 40px 20px; color: ${colors.textSecondary};">
          <div style="font-size: 48px; margin-bottom: 12px;">🎯</div>
          <div style="font-size: 14px; line-height: 1.5;">Click fields to add them to your selection</div>
        </div>
      `;
    } else {
      window.selectedFields.forEach((field, idx) => {
        const hasOptions = field.options && field.options.length > 0;
        html += `
          <div style="background: ${colors.sectionBg}; padding: 12px; border-radius: 6px; margin-bottom: 8px; border: 1px solid ${colors.borderColor};">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; color: ${colors.textPrimary}; font-size: 14px; margin-bottom: 4px; word-break: break-word;">${escapeHtml(field.label)}</div>
                <div style="font-size: 12px; color: ${colors.textSecondary}; font-family: Monaco, Consolas, monospace; word-break: break-all;">${escapeHtml(field.id)}</div>
              </div>
              <button class="fpRemoveBtn" data-index="${idx}" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-left: 8px; white-space: nowrap;">Remove</button>
            </div>
            <div style="display: flex; gap: 8px; font-size: 11px; margin-top: 6px;">
              <span style="background: ${colors.codeBg}; padding: 3px 8px; border-radius: 3px; color: ${colors.textPrimary}; border: 1px solid ${colors.borderColor};">${field.fieldType}</span>
              <span style="background: ${colors.codeBg}; padding: 3px 8px; border-radius: 3px; color: ${field.required ? '#e74c3c' : '#27ae60'}; border: 1px solid ${colors.borderColor};">${field.required ? 'Required' : 'Optional'}</span>
              ${hasOptions ? `<span style="background: ${colors.codeBg}; padding: 3px 8px; border-radius: 3px; color: ${colors.textPrimary}; border: 1px solid ${colors.borderColor};">${field.options.length} options</span>` : ''}
            </div>
          </div>
        `;
      });
    }
    
    html += `</div>`;
    
    if (count > 0) {
      html += `
        <div style="padding: 12px; background: ${colors.sectionBg}; border-top: 2px solid ${colors.borderColor};">
          <button id="fpExportAllBtn" style="width: 100%; background: ${colors.successBg}; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; margin-bottom: 8px;">📋 Copy All as JSON</button>
          <button id="fpClearAllBtn" style="width: 100%; background: #6c757d; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 13px;">Clear All</button>
        </div>
      `;
    }
    
    sidePanel.innerHTML = html;
    
    // Attach event listeners
    const closeBtn = document.getElementById('fpClosePanelBtn');
    if (closeBtn) {
      closeBtn.onclick = deactivate;
    }
    
    const removeButtons = document.querySelectorAll('.fpRemoveBtn');
    removeButtons.forEach(btn => {
      btn.onclick = () => {
        const index = parseInt(btn.getAttribute('data-index'));
        window.selectedFields.splice(index, 1);
        updateSidePanel();
      };
    });
    
    const exportBtn = document.getElementById('fpExportAllBtn');
    if (exportBtn) {
      exportBtn.onclick = exportAllFields;
    }
    
    const clearBtn = document.getElementById('fpClearAllBtn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        if (confirm(`Clear all ${count} selected fields?`)) {
          window.selectedFields = [];
          updateSidePanel();
        }
      };
    }
  };
  
  const exportAllFields = () => {
    const fieldDefinitions = window.selectedFields.map(field => {
      const def = {
        id: field.id,
        label: field.label,
        fieldType: field.fieldType,
        required: field.required
      };
      if (field.options && field.options.length > 0 && field.options.length < 50) {
        def.options = field.options;
      }
      return def;
    });
    
    const config = {
      version: "0.13.0",
      exportedAt: new Date().toISOString(),
      fieldDefinitions: fieldDefinitions,
      configItems: [],
      baseUrls: [],
      projectIds: [],
      issueTypeIds: []
    };
    
    const jsonStr = JSON.stringify(config, null, 2);
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = jsonStr;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    
    const btn = document.getElementById('fpExportAllBtn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied to Clipboard!';
    btn.style.background = '#27ae60';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = colors.successBg;
    }, 2000);
  };

  // Create banner
  let banner = document.createElement('div');
  banner.id = 'fpBanner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background: ${colors.successBg};
    color: white;
    padding: 12px 24px;
    border-radius: 0 0 8px 8px;
    z-index: 999998;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    pointer-events: none;
  `;
  banner.textContent = '🎯 Multi-Field Picker Active - Click fields to add (ESC to exit)';
  
  document.body.appendChild(banner);
  document.body.appendChild(sidePanel);
  document.body.style.cursor = 'crosshair';
  
  updateSidePanel();

  const extractFieldMetadata = (field) => {
    let fieldId = field.id || field.name || field.getAttribute('data-ref') || field.getAttribute('aria-labelledby');
    
    if (!fieldId && field.closest('[data-element]')) {
      fieldId = field.closest('[data-element]').getAttribute('data-element');
    }
    
    if (!fieldId) {
      const parent = field.parentElement;
      if (parent && parent.classList.contains('reference')) {
        const hiddenInput = parent.querySelector('input[type="hidden"]');
        if (hiddenInput && hiddenInput.name) {
          fieldId = hiddenInput.name;
        }
      }
    }
    
    // Clean up field ID
    let cleanId = fieldId;
    if (cleanId && cleanId.includes('.')) {
      cleanId = cleanId.split('.').pop();
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
    
    label = label.replace(/[*:]/g, '').trim();
    label = label.replace(/\s+(Required|Mandatory)[\s.,;:!?]*$/gi, '').trim();
    label = label.replace(/\s+(Required|Mandatory)\b/gi, '').trim();
    
    // Get field type
    let fieldType = 'text';
    if (field.tagName === 'SELECT') fieldType = 'combobox';
    else if (field.tagName === 'TEXTAREA') fieldType = 'text';
    
    // Check if required
    const isRequired = field.required || field.getAttribute('aria-required') === 'true' || field.hasAttribute('required');
    
    // Get options for dropdowns
    let options = [];
    let optionCount = 0;
    if (fieldType === 'combobox' && field.options) {
      Array.from(field.options).forEach(opt => {
        if (opt.value) {
          options.push({
            label: opt.textContent.trim(),
            value: opt.value
          });
        }
      });
      optionCount = options.length;
    }
    
    return {
      id: cleanId,
      label: label,
      fieldType: fieldType,
      required: isRequired,
      options: options,
      optionCount: optionCount
    };
  };

  const handleClick = (e) => {
    // Ignore clicks on side panel
    if (e.target.closest('#fpSidePanel')) {
      return;
    }
    
    let field = null;
    if (e.target && e.target.nodeType === 1 && e.target.matches) {
      field = e.target.matches('input,select,textarea') ? e.target : e.target.closest('input,select,textarea');
    }
    
    if (!field) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const meta = extractFieldMetadata(field);
    
    // Check if already selected
    const existing = window.selectedFields.findIndex(f => f.id === meta.id);
    
    if (existing >= 0) {
      // Already selected - show notification
      showNotification(`Field "${meta.label}" is already selected!`, 'warning');
    } else {
      // Add to selection
      window.selectedFields.push(meta);
      updateSidePanel();
      showNotification(`Added "${meta.label}" to selection`, 'success');
      
      // Flash the field green
      const originalOutline = field.style.outline;
      field.style.outline = '3px solid #27ae60';
      setTimeout(() => {
        field.style.outline = originalOutline;
      }, 500);
    }
  };

  const showNotification = (message, type) => {
    const notif = document.createElement('div');
    const bgColor = type === 'success' ? '#27ae60' : '#f39c12';
    
    notif.style.cssText = `
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: ${bgColor};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideDown 0.3s ease;
    `;
    notif.textContent = message;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
      notif.style.transition = 'opacity 0.3s ease';
      notif.style.opacity = '0';
      setTimeout(() => {
        notif.remove();
      }, 300);
    }, 2000);
  };

  const handleHover = (e) => {
    if (e.target.closest('#fpSidePanel')) return;
    
    let field = null;
    if (e.target && e.target.nodeType === 1 && e.target.matches) {
      field = e.target.matches('input,select,textarea') ? e.target : e.target.closest('input,select,textarea');
    }
    
    if (field) {
      field.style.outline = '2px solid #3498db';
    }
  };

  const handleHoverOut = (e) => {
    let field = null;
    if (e.target && e.target.nodeType === 1 && e.target.matches) {
      field = e.target.matches('input,select,textarea') ? e.target : e.target.closest('input,select,textarea');
    }
    
    if (field) {
      field.style.outline = '';
    }
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      if (window.selectedFields.length > 0) {
        if (confirm(`Exit with ${window.selectedFields.length} selected fields? They will be lost.`)) {
          deactivate();
        }
      } else {
        deactivate();
      }
    }
  };

  const deactivate = () => {
    window.fieldPickerActive = false;
    window.selectedFields = [];
    
    if (banner) banner.remove();
    if (sidePanel) sidePanel.remove();
    
    document.body.style.cursor = '';
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('keydown', handleEscape, true);
    document.removeEventListener('mouseover', handleHover, true);
    document.removeEventListener('mouseout', handleHoverOut, true);
  };

  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleEscape, true);
  document.addEventListener('mouseover', handleHover, true);
  document.addEventListener('mouseout', handleHoverOut, true);
})();
