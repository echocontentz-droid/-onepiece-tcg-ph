const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const HTML_PATH = '/root/.claude/uploads/034cbb4f-dd24-41c5-ac89-8d1ee729d4c3/23981fa4-CARDHAUS_Promo_v2__Trading_Floor.html';
const FRAMES_DIR = path.join(__dirname, 'video-output', 'frames');
const FPS = 30;
const DURATION_SECS = 30;
const TOTAL_FRAMES = FPS * DURATION_SECS;

(async () => {
  if (fs.existsSync(FRAMES_DIR)) {
    fs.readdirSync(FRAMES_DIR).forEach(f => fs.unlinkSync(path.join(FRAMES_DIR, f)));
  }

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
  // Render at the native 1920x1080 the page was designed for
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  console.log('Loading HTML file...');
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0', timeout: 30000 });

  await page.waitForFunction(() => {
    const loading = document.getElementById('__bundler_loading');
    return !loading || loading.style.display === 'none' || !document.body.contains(loading);
  }, { timeout: 15000 }).catch(() => console.log('Bundler loading still present, continuing...'));

  await new Promise(r => setTimeout(r, 2000));

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${FPS}fps (1920x1080)...`);

  const frameInterval = 1000 / FPS;

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const frameName = `frame_${String(i).padStart(5, '0')}.png`;
    await page.screenshot({
      path: path.join(FRAMES_DIR, frameName),
      type: 'png',
    });

    if (i % FPS === 0) {
      console.log(`  ${i / FPS}s / ${DURATION_SECS}s captured`);
    }

    await new Promise(r => setTimeout(r, frameInterval));
  }

  console.log('All frames captured.');
  await browser.close();
  console.log('Browser closed.');
})();
