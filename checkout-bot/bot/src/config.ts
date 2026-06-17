import 'dotenv/config';

/**
 * Central config. Everything is env-driven so the bot is never hard-wired to a
 * specific (let alone third-party) target. Defaults point at localhost.
 */
export const config = {
  targetUrl: process.env.TARGET_URL ?? 'http://localhost:3000',
  productUrl: process.env.PRODUCT_URL ?? 'http://localhost:3000/products/test-booster-box',
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? 3000),

  selectors: {
    stock: process.env.SELECTOR_STOCK ?? '[data-testid="add-to-cart"]:not([disabled])',
    addToCart: process.env.SELECTOR_ADD_TO_CART ?? '[data-testid="add-to-cart"]',
    checkout: process.env.SELECTOR_CHECKOUT ?? '[data-testid="checkout"]',
  },

  shipping: {
    name: process.env.SHIP_NAME ?? 'Test Buyer',
    address: process.env.SHIP_ADDRESS ?? '123 Test St, Quezon City',
    phone: process.env.SHIP_PHONE ?? '09170000000',
  },

  notify: {
    telegramToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID ?? '',
    discordWebhook: process.env.DISCORD_WEBHOOK_URL ?? '',
  },

  headless: (process.env.HEADLESS ?? 'false') === 'true',
};

/** Guardrail: refuse to run against obvious third-party production hosts. */
const BLOCKED_HOSTS = ['lazada.', 'shopee.', 'amazon.', 'nike.', 'shopify.'];

export function assertSafeTarget(): void {
  const url = config.productUrl.toLowerCase();
  for (const host of BLOCKED_HOSTS) {
    if (url.includes(host)) {
      throw new Error(
        `Refusing to run: "${host}" looks like a third-party production site. ` +
          `This tool is for your own / test store only. Edit TARGET_URL in .env.`,
      );
    }
  }
}
