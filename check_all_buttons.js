const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  const BASE_URL = 'http://109.69.16.132';

  async function testPage(name, path, actions = async () => {}) {
    console.log(`--- Testing ${name} (${path}) ---`);
    try {
      await page.goto(BASE_URL + path);
      await page.waitForTimeout(2000);
      await actions();
      console.log(`${name}: OK`);
    } catch (e) {
      console.error(`${name}: FAILED - ${e.message}`);
    }
  }

  // 1. Client Dashboard
  await testPage('Client Dashboard', '/#/', async () => {
    const buttons = await page.$$('a.quick-action, .btn--primary');
    console.log(`Found ${buttons.length} primary/action buttons`);
    for (const btn of buttons) {
        const text = await btn.innerText();
        const href = await btn.getAttribute('href');
        console.log(` - Button: "${text.replace(/\n/g, ' ')}" -> ${href}`);
    }
  });

  // 2. Booking Page
  await testPage('Booking Page', '/#/booking', async () => {
    const submitBtn = await page.$('#submit-booking');
    console.log('Submit Button exists:', !!submitBtn);
    
    // Check if selecting a service works
    const firstService = await page.$('input[name="services"]');
    if (firstService) {
        await firstService.click();
        await page.waitForTimeout(500);
        const total = await page.innerText('#total-price');
        console.log('Total price updated to:', total);
    }
  });

  // 3. Admin Queue (Requires Login)
  await testPage('Admin Queue', '/admin.html#/admin/queue', async () => {
    // Check if redirected or login visible
    const isLogin = await page.evaluate(() => !!document.getElementById('admin-login-form'));
    if (isLogin) {
        console.log('Logging in to admin...');
        await page.fill('#admin-login-input', 'admin');
        await page.fill('#admin-password-input', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
    }
    
    await page.goto(BASE_URL + '/admin.html#/admin/queue');
    await page.waitForTimeout(2000);
    
    const actionBtns = await page.$$('.action-btn');
    console.log(`Found ${actionBtns.length} queue action buttons`);
    for (const btn of actionBtns) {
        const action = await btn.getAttribute('data-action');
        console.log(` - Queue Action: ${action}`);
    }
  });

  await browser.close();
})();
