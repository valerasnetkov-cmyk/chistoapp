const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Opening http://109.69.16.132 ...');
  await page.goto('http://109.69.16.132', { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(2000);
  const content = await page.content();
  console.log('Content length:', content.length);
  
  await browser.close();
})();
