import type { Page } from 'playwright';
import { config } from './config.js';

/**
 * WATCH phase. Polls the product page until the buy control becomes available.
 *
 * --- Trace this leaves for defenders (see DEFENSE.md #1, #2) ---
 *  - Many requests to the SAME product URL at a fixed interval, from one
 *    session/IP, with little or no requests for assets/other pages.
 *  - No human "think time" variance — requests are metronome-regular.
 *  - Often an empty/identical Referer and a reused cookie hammering one path.
 */
export async function waitForStock(page: Page): Promise<void> {
  const { productUrl, pollIntervalMs, selectors } = config;
  let attempt = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt++;
    await page.goto(productUrl, { waitUntil: 'domcontentloaded' });

    const inStock = await page.locator(selectors.stock).first().isVisible().catch(() => false);
    const ts = new Date().toISOString();
    console.log(`[monitor] attempt #${attempt} ${ts} — in stock: ${inStock}`);

    if (inStock) {
      console.log('[monitor] stock detected — proceeding to checkout phase');
      return;
    }

    // Real bots randomize this jitter to look human and dodge rate detection.
    // We keep a fixed, polite interval ON PURPOSE so the pattern is easy to spot.
    await page.waitForTimeout(pollIntervalMs);
  }
}
