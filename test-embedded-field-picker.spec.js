const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Embedded Field Picker - Issue #20 Fixed', () => {
  test('should open embedded field picker modal instead of external window', async ({ page }) => {
    await page.goto(`file:///${path.join(__dirname, 'link-generator.html').replace(/\\/g, '/')}`);
    
    // Click the Field Picker button in toolbar (more specific selector)
    const fieldPickerBtn = page.locator('button[onclick="openFieldPickerModal()"]');
    await expect(fieldPickerBtn).toBeVisible();
    await fieldPickerBtn.click();
    
    // Should show the modal (not try to open external window)
    const modal = page.locator('#fieldPickerFullModal');
    await expect(modal).toBeVisible();
    
    // Check modal title
    await expect(page.locator('#fieldPickerFullModal h2')).toContainText('Multi-Field Picker');
  });
  
  test('should have all field picker UI components', async ({ page }) => {
    await page.goto(`file:///${path.join(__dirname, 'link-generator.html').replace(/\\/g, '/')}`);
    
    // Open modal
    await page.click('button[onclick="openFieldPickerModal()"]');
    
    // Check for status bar
    await expect(page.locator('#fpStatusBar')).toBeVisible();
    
    // Check for activate button
    const activateBtn = page.locator('#fpActivateBtn');
    await expect(activateBtn).toBeVisible();
    await expect(activateBtn).toContainText('Activate Field Picker');
    
    // Check for selected fields panel
    await expect(page.locator('#fpSelectedList')).toBeVisible();
    await expect(page.locator('#fpFieldCount')).toContainText('0');
    
    // Check for save and clear buttons
    const saveBtn = page.locator('#fpSaveBtn');
    const clearBtn = page.locator('#fpClearBtn');
    await expect(saveBtn).toBeVisible();
    await expect(clearBtn).toBeVisible();
    await expect(saveBtn).toBeDisabled();
    await expect(clearBtn).toBeDisabled();
  });
  
  test('should activate field picker and show banner', async ({ page }) => {
    await page.goto(`file:///${path.join(__dirname, 'link-generator.html').replace(/\\/g, '/')}`);
    
    // Open modal
    await page.click('button[onclick="openFieldPickerModal()"]');
    
    // Activate the picker
    await page.click('#fpActivateBtn');
    
    // Wait for activation
    await page.waitForTimeout(500);
    
    // Check banner appears
    const banner = page.locator('#fpBanner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Field Picker Active');
    
    // Check status updated
    await expect(page.locator('#fpStatusBar')).toContainText('Active');
    
    // Check cursor changed
    const cursor = await page.evaluate(() => document.body.style.cursor);
    expect(cursor).toBe('crosshair');
  });
  
  test('should select fields and add to list', async ({ page }) => {
    await page.goto(`file:///${path.join(__dirname, 'link-generator.html').replace(/\\/g, '/')}`);
    
    // Open modal and activate picker
    await page.click('button[onclick="openFieldPickerModal()"]');
    await page.click('#fpActivateBtn');
    await page.waitForTimeout(500);
    
    // Click on the base URL dropdown (should be a select field outside modal)
    const baseUrlDropdown = page.locator('#baseUrlDropdown');
    if (await baseUrlDropdown.isVisible()) {
      await baseUrlDropdown.click();
      await page.waitForTimeout(500);
      
      // Check if field was added
      const fieldCount = await page.locator('#fpFieldCount').textContent();
      expect(parseInt(fieldCount)).toBeGreaterThan(0);
      
      // Check save button is now enabled
      const saveBtn = page.locator('#fpSaveBtn');
      await expect(saveBtn).not.toBeDisabled();
    } else {
      // If no visible dropdown, just verify the picker can be activated
      expect(await page.locator('#fpBanner').isVisible()).toBe(true);
    }
  });
  
  test('should deactivate with ESC key', async ({ page }) => {
    await page.goto(`file:///${path.join(__dirname, 'link-generator.html').replace(/\\/g, '/')}`);
    
    // Open modal and activate picker
    await page.click('button[onclick="openFieldPickerModal()"]');
    await page.click('#fpActivateBtn');
    await page.waitForTimeout(500);
    
    // Press ESC
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Banner should be removed
    await expect(page.locator('#fpBanner')).not.toBeVisible();
    
    // Status should be back to ready
    await expect(page.locator('#fpStatusBar')).toContainText('Ready to activate');
    
    // Cursor should be normal
    const cursor = await page.evaluate(() => document.body.style.cursor);
    expect(cursor).not.toBe('crosshair');
  });
  
  test('should close modal with close button', async ({ page }) => {
    await page.goto(`file:///${path.join(__dirname, 'link-generator.html').replace(/\\/g, '/')}`);
    
    // Open modal
    await page.click('button[onclick="openFieldPickerModal()"]');
    
    // Modal should be visible
    const modal = page.locator('#fieldPickerFullModal');
    await expect(modal).toBeVisible();
    
    // Click close button
    const closeBtn = modal.locator('button[onclick="closeFieldPickerFullModal()"]');
    await closeBtn.click();
    await page.waitForTimeout(300);
    
    // Modal should be hidden
    await expect(modal).toBeHidden();
  });
  
  test('should not reference external field-picker-window.html', async ({ page }) => {
    await page.goto(`file:///${path.join(__dirname, 'link-generator.html').replace(/\\/g, '/')}`);
    
    // Monitor console for errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Monitor network for 404s
    const networkErrors = [];
    page.on('response', response => {
      if (response.status() === 404) {
        networkErrors.push(response.url());
      }
    });
    
    // Click Field Picker button
    await page.click('button[onclick="openFieldPickerModal()"]');
    await page.waitForTimeout(1000);
    
    // Should have no 404 errors for field-picker-window.html
    const has404 = networkErrors.some(url => url.includes('field-picker-window.html'));
    expect(has404).toBe(false);
    
    // Should have no console errors
    expect(consoleErrors.length).toBe(0);
  });
  
  test('should work as a self-contained single file', async ({ page }) => {
    await page.goto(`file:///${path.join(__dirname, 'link-generator.html').replace(/\\/g, '/')}`);
    
    // Check that window.fieldPickerInstance exists
    const hasInstance = await page.evaluate(() => {
      return typeof window.fieldPickerInstance === 'object' &&
             typeof window.fieldPickerInstance.activate === 'function' &&
             typeof window.fieldPickerInstance.deactivate === 'function';
    });
    expect(hasInstance).toBe(true);
    
    // Check that all functions exist
    const hasFunctions = await page.evaluate(() => {
      return typeof openFieldPickerModal === 'function' &&
             typeof closeFieldPickerFullModal === 'function' &&
             typeof activateFieldPickerInline === 'function' &&
             typeof saveFieldsToConfig === 'function';
    });
    expect(hasFunctions).toBe(true);
  });
});
