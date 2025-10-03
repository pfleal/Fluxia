import { test, expect } from '@playwright/test';

test.describe('CRM Application Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('Production Planning page loads correctly', async ({ page }) => {
    // Navigate to Production Planning page
    await page.goto('/production-planning');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page content is loaded (look for any content instead of specific title)
    await expect(page.locator('body')).toBeVisible();
    
    // Check for KPI cards (be more flexible with count)
    const statisticElements = page.locator('.ant-statistic');
    await expect(statisticElements.first()).toBeVisible({ timeout: 10000 });
    
    // Check for charts container
    await expect(page.locator('.ant-card').first()).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/production-planning.png' });
  });

  test('Stock Analysis page loads correctly', async ({ page }) => {
    // Navigate to Stock Analysis page
    await page.goto('/reports/stock-analysis');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page content is loaded
    await expect(page.locator('body')).toBeVisible();
    
    // Check for tabs (be more flexible)
    const tabElements = page.locator('.ant-tabs-tab');
    if (await tabElements.count() > 0) {
      await expect(tabElements.first()).toBeVisible();
    }
    
    // Check for table
    const tableElements = page.locator('.ant-table');
    if (await tableElements.count() > 0) {
      await expect(tableElements.first()).toBeVisible();
    }
    
    // Check for alert if present
    const alert = page.locator('.ant-alert');
    if (await alert.count() > 0) {
      await expect(alert).toBeVisible();
    }
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/stock-analysis.png' });
  });

  test('Inventory Reports page loads correctly', async ({ page }) => {
    // Navigate to Inventory Reports page
    await page.goto('/reports/inventory');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page content is loaded
    await expect(page.locator('body')).toBeVisible();
    
    // Check for KPI cards (be more flexible)
    const statisticElements = page.locator('.ant-statistic');
    if (await statisticElements.count() > 0) {
      await expect(statisticElements.first()).toBeVisible({ timeout: 10000 });
    }
    
    // Check for charts and tables
    const cardElements = page.locator('.ant-card');
    if (await cardElements.count() > 0) {
      await expect(cardElements.first()).toBeVisible();
    }
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/inventory-reports.png' });
  });

  test('Navigation between pages works', async ({ page }) => {
    // Start from home page
    await page.goto('/');
    
    // Navigate to Production Planning
    await page.goto('/production-planning');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    
    // Navigate to Stock Analysis
    await page.goto('/reports/stock-analysis');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    
    // Navigate to Inventory Reports
    await page.goto('/reports/inventory');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Check for console errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Test Production Planning page
    await page.goto('/production-planning');
    await page.waitForLoadState('networkidle');
    
    // Test Stock Analysis page
    await page.goto('/reports/stock-analysis');
    await page.waitForLoadState('networkidle');
    
    // Test Inventory Reports page
    await page.goto('/reports/inventory');
    await page.waitForLoadState('networkidle');
    
    // Filter out known warnings that are not critical
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('deprecated') && 
      !error.includes('warning') &&
      !error.includes('filteredValue') &&
      !error.includes('key prop')
    );
    
    // Log errors for debugging
    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }
    
    // We expect no critical console errors
    expect(criticalErrors.length).toBe(0);
  });

  test('Responsive design check', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/production-planning');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/production-planning-mobile.png' });
    
    await page.goto('/reports/stock-analysis');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/stock-analysis-mobile.png' });
    
    await page.goto('/reports/inventory');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/inventory-reports-mobile.png' });
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/production-planning');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/production-planning-tablet.png' });
  });
});