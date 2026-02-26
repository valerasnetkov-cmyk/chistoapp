import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
    // Print stack trace if available
    console.log('STACK:', err.stack);
  });

  try {
    console.log('Opening http://109.69.16.132 ...');
    await page.goto('http://109.69.16.132', { waitUntil: 'networkidle' });
    
    // Wait for any potential async rendering
    await page.waitForTimeout(2000);
    
    const content = await page.content();
    console.log('Content length:', content.length);
    if (content.length < 500) {
        console.log('Content too short, possible blank page.');
    }
  } catch (e) {
    console.error('Test failed:', e);
  } finally {
    await browser.close();
  }
})();
