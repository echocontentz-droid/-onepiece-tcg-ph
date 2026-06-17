import { chromium } from 'playwright';
import { config, assertSafeTarget } from './config.js';
import { waitForStock } from './monitor.js';
import { runCheckout } from './checkout.js';
import { notify } from './notify.js';

/**
 * Orchestrator.
 *   --mode=monitor   watch the product page and alert on restock (no checkout)
 *   --mode=checkout  watch, then auto-add-to-cart + autofill, then STOP at payment
 */
async function main(): Promise<void> {
  assertSafeTarget(); // refuse third-party production targets

  const mode = (process.argv.find((a) => a.startsWith('--mode='))?.split('=')[1] ?? 'monitor') as
    | 'monitor'
    | 'checkout';

  console.log(`[bot] starting in "${mode}" mode against ${config.productUrl}`);
  console.log(`[bot] headless=${config.headless} pollInterval=${config.pollIntervalMs}ms`);

  const browser = await chromium.launch({ headless: config.headless });
  // NOTE: a plain Playwright browser advertises navigator.webdriver=true and a
  // headless/automation user-agent. That is exactly the fingerprint defenders
  // look for (DEFENSE.md #5). We do NOT spoof it here — leaving it visible is
  // the point of the exercise.
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await waitForStock(page);
    await notify(`Stock detected: ${config.productUrl}`);

    if (mode === 'checkout') {
      await runCheckout(page);
      await notify('Reached payment review (stopped before payment — human required).');
    } else {
      console.log('[bot] monitor mode — alert sent, not proceeding to checkout.');
    }
  } finally {
    if (mode === 'checkout' && !config.headless) {
      console.log('[bot] leaving browser open for human review for 60s...');
      await page.waitForTimeout(60_000);
    }
    await browser.close();
  }
}

main().catch((err) => {
  console.error('[bot] fatal:', err.message);
  process.exit(1);
});
