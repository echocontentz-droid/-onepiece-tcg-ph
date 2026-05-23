const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const HTML_PATH = '/root/.claude/uploads/034cbb4f-dd24-41c5-ac89-8d1ee729d4c3/23981fa4-CARDHAUS_Promo_v2__Trading_Floor.html';
const FRAMES_DIR = path.join(__dirname, 'video-output', 'frames');
const FPS = 30;
const DURATION_SECS = 30;
const TOTAL_FRAMES = FPS * DURATION_SECS;
const FRAME_US = Math.round((1000 / FPS) * 1000); // microseconds per frame

(async () => {
  if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR, { recursive: true });
  fs.readdirSync(FRAMES_DIR).forEach(f => fs.unlinkSync(path.join(FRAMES_DIR, f)));

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const cdp = await page.createCDPSession();

  console.log('Loading HTML file...');
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0', timeout: 60000 });

  await page.waitForFunction(() => {
    const loading = document.getElementById('__bundler_loading');
    return !loading || loading.style.display === 'none' || !document.body.contains(loading);
  }, { timeout: 15000 }).catch(() => console.log('Bundler loading still present, continuing...'));

  // Let page fully initialize for 3 real seconds
  await new Promise(r => setTimeout(r, 3000));

  // Now freeze time and take control via CDP virtual time
  // "pauseIfNetworkFetchesPending" pauses virtual clock during network fetches
  await cdp.send('Emulation.setVirtualTimePolicy', {
    policy: 'pause',
  });

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${FPS}fps (${DURATION_SECS}s)...`);
  console.log(`Virtual time budget per frame: ${FRAME_US}μs`);
  const wallStart = Date.now();

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    // Take screenshot at current frozen moment
    const frameName = `frame_${String(i).padStart(5, '0')}.png`;
    await page.screenshot({
      path: path.join(FRAMES_DIR, frameName),
      type: 'png',
    });

    // Advance virtual time by exactly one frame duration
    await cdp.send('Emulation.setVirtualTimePolicy', {
      policy: 'pauseIfNetworkFetchesPending',
      budget: FRAME_US,
    });

    // Wait for the budget to be consumed
    await new Promise(resolve => {
      cdp.once('Emulation.virtualTimeBudgetExpired', resolve);
      // Safety timeout in case event doesn't fire
      setTimeout(resolve, 2000);
    });

    if (i % FPS === 0) {
      const wallElapsed = ((Date.now() - wallStart) / 1000).toFixed(1);
      console.log(`  frame ${i}/${TOTAL_FRAMES} — video time ${i / FPS}s (wall: ${wallElapsed}s)`);
    }
  }

  const totalWall = ((Date.now() - wallStart) / 1000).toFixed(1);
  console.log(`Done. ${TOTAL_FRAMES} frames in ${totalWall}s wall time.`);
  await browser.close();
})();
