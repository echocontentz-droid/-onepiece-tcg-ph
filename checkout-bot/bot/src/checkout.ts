import type { Page } from 'playwright';
import { config } from './config.js';

/**
 * COOK phase. Add to cart and rush the checkout form with pre-saved details.
 *
 * --- Trace this leaves for defenders (see DEFENSE.md #3, #4) ---
 *  - Time from page-load -> add-to-cart -> checkout is inhumanly short and
 *    consistent (tens of ms; humans take seconds and vary).
 *  - Form fields are filled instantly and in DOM order, with no focus/blur,
 *    keypress, or mouse-move events in between.
 *  - Identical shipping payload reused across many accounts/sessions.
 *
 * IMPORTANT: this function intentionally STOPS at the payment review step.
 * It never submits payment or handles OTP. We study the approach, not place orders.
 */
export async function runCheckout(page: Page): Promise<void> {
  const { selectors, shipping } = config;
  const t0 = Date.now();

  // 1) Add to cart the instant it's available.
  await page.locator(selectors.addToCart).first().click();
  console.log(`[checkout] added to cart (+${Date.now() - t0}ms)`);

  // 2) Go to checkout.
  await page.locator(selectors.checkout).first().click().catch(() => {
    console.log('[checkout] no explicit checkout button — assuming cart auto-advances');
  });

  // 3) Autofill shipping. Bots blast these in; humans type and tab.
  //    We use generic field name guesses — adjust selectors to your store.
  await fillIfPresent(page, ['input[name="name"]', '#fullName'], shipping.name);
  await fillIfPresent(page, ['input[name="address"]', '#address'], shipping.address);
  await fillIfPresent(page, ['input[name="phone"]', '#phone'], shipping.phone);
  console.log(`[checkout] shipping autofilled (+${Date.now() - t0}ms from start)`);

  // 4) HARD STOP. A real scalper bot would click "Place Order" and feed the OTP
  //    here. We deliberately do not. Pause for a human to review.
  console.log('[checkout] STOPPING at payment review — human confirmation required.');
  console.log('[checkout] (this is the boundary: no payment, no OTP automation)');
}

async function fillIfPresent(page: Page, selectors: string[], value: string): Promise<void> {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible().catch(() => false)) {
      await loc.fill(value);
      return;
    }
  }
}
