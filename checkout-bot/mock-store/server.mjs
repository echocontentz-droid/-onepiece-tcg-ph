// Local mock store for safely testing the checkout bot end-to-end.
// Starts SOLD OUT, then flips to IN STOCK after RESTOCK_AFTER_MS — simulating a
// real restock so you can watch the bot detect and act on it. No third party.
//
//   node server.mjs
//   -> http://localhost:3000/products/test-booster-box
//
// Env: PORT (default 3000), RESTOCK_AFTER_MS (default 15000)

import http from 'node:http';

const PORT = Number(process.env.PORT ?? 3000);
const RESTOCK_AFTER_MS = Number(process.env.RESTOCK_AFTER_MS ?? 15000);
const startedAt = Date.now();

function inStock() {
  return Date.now() - startedAt >= RESTOCK_AFTER_MS;
}

const cart = { items: 0 };

function html(body) {
  return `<!doctype html><html><head><meta charset="utf-8">
<title>Mock TCG Store</title></head><body style="font-family:sans-serif;max-width:520px;margin:40px auto">${body}</body></html>`;
}

function productPage() {
  const stock = inStock();
  return html(`
    <h1>OP-09 Booster Box (TEST)</h1>
    <p>Status: <strong>${stock ? 'IN STOCK' : 'SOLD OUT'}</strong></p>
    <form method="POST" action="/cart">
      <button data-testid="add-to-cart" ${stock ? '' : 'disabled'}>Add to cart</button>
    </form>
    <p><a data-testid="checkout" href="/checkout">Go to checkout</a></p>
    <p style="color:#888">Restocks ${RESTOCK_AFTER_MS}ms after server start.</p>
  `);
}

function checkoutPage() {
  return html(`
    <h1>Checkout (TEST — no real payment)</h1>
    <p>Items in cart: ${cart.items}</p>
    <form>
      <p><input name="name" placeholder="Full name"></p>
      <p><input name="address" placeholder="Address"></p>
      <p><input name="phone" placeholder="Phone"></p>
      <p><button type="button" disabled>Pay (disabled in mock)</button></p>
    </form>
  `);
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname === '/products/test-booster-box') {
      res.writeHead(200, { 'content-type': 'text/html' }).end(productPage());
    } else if (url.pathname === '/cart' && req.method === 'POST') {
      cart.items += 1;
      res.writeHead(303, { location: '/checkout' }).end();
    } else if (url.pathname === '/checkout') {
      res.writeHead(200, { 'content-type': 'text/html' }).end(checkoutPage());
    } else {
      res.writeHead(404).end('not found');
    }
  })
  .listen(PORT, () => {
    console.log(`[mock-store] http://localhost:${PORT}/products/test-booster-box`);
    console.log(`[mock-store] will restock in ${RESTOCK_AFTER_MS}ms`);
  });
