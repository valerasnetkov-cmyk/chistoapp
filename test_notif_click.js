const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE:', msg.text()));
  try {
    await page.goto('http://109.69.16.132/admin');
    await page.waitForTimeout(1000);
    await page.fill('#admin-login-input', 'admin');
    await page.fill('#admin-password-input', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.click('#notif-btn');
    await page.waitForTimeout(1000);
    
    const notifs = await page.$$('.notification-item');
    console.log('Notifs visible:', notifs.length);
    if (notifs.length > 0) {
        console.log('Clicking first notif...');
        await notifs[0].click();
        await page.waitForTimeout(1000);
        const modalVisible = await page.isVisible('.modal');
        console.log('Modal visible after click:', modalVisible);
    }
  } finally {
    await browser.close();
  }
})();
