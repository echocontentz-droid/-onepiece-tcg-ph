# Defending Against Checkout Bots

For each technique the demo bot uses, here's the **signal it leaves** and the
**countermeasure** you can apply to the One Piece TCG store. This is the actual
goal of the exercise: turn the attacker's playbook into a defense checklist.

---

## 1. Stock-page polling (the "watch")
**What the bot does:** hits one product URL on a tight, fixed loop.

**Signal:** many requests to the same path from one session/IP at near-constant
intervals; few or no asset/other-page requests; metronome-regular timing with no
human "think time".

**Defense:**
- Per-IP + per-account **rate limiting** on product/stock endpoints (e.g. token
  bucket; 429 with backoff). On Next.js, do it in middleware or at the edge
  (Vercel/Cloudflare) — Supabase RLS won't catch read polling.
- Don't expose a cheap public **stock JSON API**; if you do, rate-limit and
  require auth.
- Add slight randomized cache TTL so scrapers can't infer exact restock timing.

---

## 2. Restock-time prediction
**What the bot does:** detects the exact moment `disabled` flips to buyable.

**Signal:** a spike of identical requests milliseconds after a state change.

**Defense:**
- Randomize/stagger drop timing; use a **virtual waiting room / queue** for
  hyped drops (Cloudflare Waiting Room, or a queue page that issues signed
  entry tokens).
- Gate "add to cart" behind a short server-issued nonce so you can't add to cart
  without first loading the real page.

---

## 3. Instant add-to-cart
**What the bot does:** clicks add-to-cart within tens of ms of page load.

**Signal:** `time(page_load → add_to_cart)` is implausibly short and low-variance.

**Defense:**
- Track **client-side interaction timing** (first input delay, mouse movement,
  time-on-page) and score sessions. Reject/limit add-to-cart with zero
  interaction signal.
- Require a valid, recent **CSRF/page nonce** for add-to-cart; reject stale or
  reused ones.

---

## 4. Checkout autofill / reused payloads
**What the bot does:** fills the form instantly, often the same shipping payload
across many accounts.

**Signal:** no focus/blur/keypress events between fields; identical
address/phone fingerprint reused across accounts; bursts of new accounts.

**Defense:**
- **Velocity checks:** same address/phone/device across N accounts → flag.
- **Per-account purchase limits** on limited SKUs (1–2 per customer/household),
  enforced server-side at order creation (Supabase: a constraint/trigger or a
  checked RPC, not client-side).
- Require account age / verified email/phone before checkout on hyped drops.

---

## 5. Headless / automation fingerprint
**What the bot does:** drives a real browser (Playwright/Selenium/Puppeteer).

**Signal:** `navigator.webdriver === true`, headless user-agent, missing plugins,
inconsistent screen/canvas/WebGL fingerprint, datacenter IP / known proxy ASN.

**Defense:**
- Put the store behind a **bot-management WAF** (Cloudflare Bot Management,
  Akamai, AWS WAF) — these do TLS/JA3 + fingerprint scoring you can't easily
  replicate in-app.
- Block/flag **datacenter & known-proxy ASNs** for checkout.
- Add a **proof-of-work or invisible challenge** (Cloudflare Turnstile,
  hCaptcha) at checkout — friction for bots, near-zero for humans.
- Serious bots spoof the fingerprint (stealth plugins, residential proxies),
  which is why you don't rely on fingerprint alone — combine it with the
  behavioral signals above (#1–#4).

---

## 6. Success notification + fast payment
**What the bot does:** pings Discord/Telegram on success so a human completes
payment + OTP quickly.

**Signal:** little server-side signal — this happens off your platform.

**Defense:**
- Keep the OTP/3-D Secure step (you likely rely on the payment provider here).
- **Reserve inventory only briefly** in the cart (short hold + release) so a bot
  can't park stock while a human races to pay.

---

## Priority order for our store
1. Edge rate limiting + WAF/bot management in front of Next.js (biggest win, #1/#5).
2. Server-enforced **per-account purchase limits** on limited SKUs (#4).
3. Turnstile/Captcha + page nonce on add-to-cart and checkout (#3/#5).
4. Waiting room/queue for hyped drops (#2).
5. Velocity/anomaly monitoring on accounts, addresses, devices (#4).

> Layer these. Any single control is bypassable; bots get expensive to operate
> when behavioral + network + fingerprint + business-rule checks all stack.
