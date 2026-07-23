import { test, expect } from '@playwright/test';

// Covers the SPA router in src/scripts/living-terminal.js — the overlay
// open/close lifecycle, rapid next/prev navigation (the bootId race that
// shipped once already this session), and the cross-origin-iframe-safe
// focus trap.

test('opens a project overlay from a card click and closes on Escape', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.lk-projgrid .lk-card').first();
  const slug = (await card.getAttribute('data-lk'))!.split(':')[1];
  await card.click();

  const overlay = page.locator('#lk-overlay');
  await expect(overlay).toHaveClass(/shown/);
  await expect(page).toHaveURL(new RegExp(`/projects/${slug}/$`));
  await expect(page.locator('.lk-panel')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(overlay).not.toHaveClass(/shown/);
  await expect(page).toHaveURL(/\/$/);
});

test('closes via the close button and restores the URL', async ({ page }) => {
  await page.goto('/');
  await page.locator('.lk-postlist .lk-post').first().click();

  const overlay = page.locator('#lk-overlay');
  await expect(overlay).toHaveClass(/shown/);

  await page.locator('.lk-tl .close').click();
  await expect(overlay).not.toHaveClass(/shown/);
  await expect(page).toHaveURL(/\/$/);
});

test('closes via scrim click', async ({ page }) => {
  await page.goto('/');
  await page.locator('.lk-projgrid .lk-card').first().click();

  const overlay = page.locator('#lk-overlay');
  await expect(overlay).toHaveClass(/shown/);

  await page.locator('.lk-scrim').click({ position: { x: 5, y: 5 } });
  await expect(overlay).not.toHaveClass(/shown/);
});

test('rapid next/prev navigation does not leave the boot cover stuck', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.lk-projgrid .lk-card');
  test.skip((await cards.count()) < 3, 'needs at least 3 projects for older + newer neighbors');

  await cards.nth(1).click();
  const overlay = page.locator('#lk-overlay');
  await expect(overlay).toHaveClass(/shown/);

  const older = page.locator('#lk-prev');
  const newer = page.locator('#lk-next');
  for (let i = 0; i < 4; i++) {
    if (await older.isVisible()) await older.click({ force: true });
    if (await newer.isVisible()) await newer.click({ force: true });
  }

  await expect(page.locator('#lk-boot')).toBeHidden({ timeout: 3000 });
  await expect(overlay).toHaveClass(/shown/);
});

test('shift+tab from the first control wraps to the last', async ({ page }) => {
  await page.goto('/');
  await page.locator('.lk-projgrid .lk-card').first().click();
  await expect(page.locator('#lk-overlay')).toHaveClass(/shown/);

  const closeBtn = page.locator('.lk-tl .close');
  await closeBtn.focus();
  await expect(closeBtn).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(closeBtn).not.toBeFocused();
  const stillInPanel = await page.evaluate(
    () => !!document.querySelector('.lk-panel')?.contains(document.activeElement)
  );
  expect(stillInPanel).toBe(true);
});

test('focusing the tab-trap sentinel returns focus to the first control', async ({ page }) => {
  // Mirrors what happens once focus leaves giscus's cross-origin iframe —
  // a keydown-based trap never sees it, so #lk-focus-end is what recovers.
  await page.goto('/');
  await page.locator('.lk-projgrid .lk-card').first().click();
  await expect(page.locator('#lk-overlay')).toHaveClass(/shown/);

  await page.locator('#lk-focus-end').focus();
  await expect(page.locator('.lk-tl .close')).toBeFocused();
});
