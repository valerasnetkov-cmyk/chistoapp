const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  try {
    console.log('--- Navigating to Admin Login ---');
    await page.goto('http://109.69.16.132/admin');
    await page.waitForTimeout(2000);
    
    console.log('--- Attempting Login ---');
    await page.fill('#admin-login-input', 'admin');
    await page.fill('#admin-password-input', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    console.log('Current URL:', page.url());
    
    console.log('--- Navigating to Queue ---');
    await page.goto('http://109.69.16.132/admin.html#/admin/queue');
    await page.waitForTimeout(3000);
    
    const items = await page.$$('.queue-item');
    console.log('Queue items found:', items.length);
    
    const html = await page.innerHTML('body');
    console.log('Is "Очередь пуста" visible?', html.includes('Очередь пуста'));
    
    if (items.length > 0) {
        const firstBtnText = await items[0].$eval('.action-btn', el => el.innerText);
        console.log('First action button text:', firstBtnText);
    }

  } catch (e) {
    console.error('Test failed:', e.message);
  } finally {
    await browser.close();
  }
})();
