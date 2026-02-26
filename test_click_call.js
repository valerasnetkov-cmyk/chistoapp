const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  try {
    console.log('--- Logging in ---');
    await page.goto('http://109.69.16.132/admin');
    await page.waitForTimeout(1000);
    await page.fill('#admin-login-input', 'admin');
    await page.fill('#admin-password-input', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    console.log('--- Navigating to Queue ---');
    await page.goto('http://109.69.16.132/admin.html#/admin/queue');
    await page.waitForTimeout(3000);
    
    const btn = await page.$('button[data-action="call"]');
    if (btn) {
        console.log('Clicking "Вызвать"...');
        await btn.click();
        await page.waitForTimeout(2000);
        console.log('Action done.');
    } else {
        console.log('No "Вызвать" button found.');
    }
  } finally {
    await browser.close();
  }
})();
