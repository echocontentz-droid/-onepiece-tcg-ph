# Checkout Bot — Red-Team / Defense Study

> **Purpose:** Replicate the techniques scalper / checkout ("cook") bots use so we
> can **detect and prevent them** on our own store. This is a defensive-security
> exercise. Run it **only against your own store or a local test target** — never
> against a third party's live site (it breaks their ToS and can get accounts/IPs
> banned).

## Why this exists
The One Piece TCG store sells limited, high-demand product (booster boxes,
sealed cases). Those are exactly what scalper bots target. To defend the store we
first need to understand the attacker's playbook. This folder is that playbook,
implemented, with each technique mapped to the **signal it leaves** and the
**countermeasure** — see [`DEFENSE.md`](./DEFENSE.md).

## What's here
```
checkout-bot/
├── README.md        # this file
├── DEFENSE.md       # technique -> detection signal -> prevention  (the deliverable)
├── bot/             # the demonstration bot (Playwright + TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── config.ts    # target URL + selectors (defaults to localhost)
│       ├── monitor.ts   # stock/price polling — the "watch" phase
│       ├── checkout.ts   # add-to-cart + autofill — the "cook" phase
│       ├── notify.ts    # Telegram/Discord success notifier
│       └── index.ts     # orchestrator
```

## How real checkout bots work (the pattern we replicate)
1. **Watch** — poll the product page (or a hidden stock API) on a tight loop.
2. **Cook** — the instant stock flips, add-to-cart and rush the checkout form
   using pre-saved address + payment.
3. **Stay hidden** — rotate proxies, randomize timing, spoof the browser
   fingerprint so it doesn't look automated.
4. **Notify** — ping a Discord/Telegram channel on success.

This demo implements 1, 2, and 4 honestly (so the traces are realistic) and
**documents** 3 rather than weaponizing it — the point is to recognize those
traces, not to defeat protections at scale.

## Running the demo (against the included local mock store)
The `mock-store/` server starts **SOLD OUT** and flips to **IN STOCK** on a timer,
so you can watch the bot detect a restock and act on it — safely, with no third
party involved.

```bash
# Terminal 1 — start the mock store (restocks 15s after launch)
cd checkout-bot/mock-store
node server.mjs
#   -> http://localhost:3000/products/test-booster-box

# Terminal 2 — run the bot
cd checkout-bot/bot
npm install
npx playwright install chromium
cp .env.example .env            # defaults already point at the mock store
npm run watch                   # monitor only: alerts when it restocks
npm run run                     # monitor -> add-to-cart -> autofill -> STOP
```
By design the bot **stops before submitting payment** — we study the approach,
we don't place real orders.

> **Why a mock store and not a live site?** Pointing the monitor at a third
> party's production store (Lazada/Shopee/etc.) is automated access that breaks
> their ToS and can get your IP/account banned — even if you never check out, the
> polling itself is the abusive load. `config.ts` refuses those hosts on purpose.
> The mock store reproduces a real restock locally so the test proves the same
> thing without touching anyone else's infrastructure.

## Boundaries (intentionally not built)
- No CAPTCHA-solving / bypass.
- No fingerprint-spoofing or proxy-rotation tooling built to defeat protections
  at scale (documented in DEFENSE.md as attacker behavior, not provided as code).
- No payment submission / OTP automation.
- Not pointed at Lazada or any third-party production site.
