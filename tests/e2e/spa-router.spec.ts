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

test('closes via scrim click and restores the URL', async ({ page }) => {
  await page.goto('/');
  await page.locator('.lk-projgrid .lk-card').first().click();

  const overlay = page.locator('#lk-overlay');
  await expect(overlay).toHaveClass(/shown/);

  await page.locator('.lk-scrim').click({ position: { x: 5, y: 5 } });
  await expect(overlay).not.toHaveClass(/shown/);
  await expect(page).toHaveURL(/\/$/);
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
  const landedOnLastFocusable = await page.evaluate(() => {
    const panel = document.querySelector('.lk-panel') as HTMLElement;
    const all = panel.querySelectorAll('a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])');
    const focusables = [...all].filter((el) => (el as HTMLElement).offsetParent !== null && el.id !== 'lk-focus-end');
    return focusables.length > 0 && focusables[focusables.length - 1] === document.activeElement;
  });
  expect(landedOnLastFocusable).toBe(true);
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

test('a fast open-then-close does not flash the overlay back visible', async ({ page }) => {
  // openRoute() schedules requestAnimationFrame(() => requestAnimationFrame(
  // () => overlay.classList.add('shown'))) to open, which used to only
  // guard on `if (ctx)` — closing before those ~2 frames elapsed could let
  // it fire after closeVisual() already ran, re-adding .shown. The race
  // window is only 1-2 frames wide, so this doesn't reliably reproduce the
  // pre-fix bug under Playwright's own click/keypress timing — it's a
  // sanity check on end-state, not a tight trap for the exact race.
  await page.goto('/');
  const overlay = page.locator('#lk-overlay');
  await page.locator('.lk-projgrid .lk-card').first().click();
  await page.keyboard.press('Escape');

  // Give the stale rAF (2 frames, then closeVisual's 460ms hide-timeout)
  // every chance to fire before asserting it didn't leave the overlay shown.
  await page.waitForTimeout(600);
  await expect(overlay).not.toHaveClass(/shown/);
  await expect(overlay).toBeHidden();
});

test('CV print button fires window.print() without a CSP violation', async ({ page }) => {
  const cspErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && /Content Security Policy/i.test(msg.text())) cspErrors.push(msg.text());
  });

  await page.goto('/cv/');
  await page.evaluate(() => {
    (window as any).__printed = false;
    window.print = () => { (window as any).__printed = true; };
  });

  await page.locator('button[data-print]').click();

  expect(await page.evaluate(() => (window as any).__printed)).toBe(true);
  expect(cspErrors).toEqual([]);
});
