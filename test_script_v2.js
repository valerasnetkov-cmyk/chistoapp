const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  try {
    await page.goto('http://109.69.16.132/#/booking');
    await page.waitForTimeout(2000);
    const services = await page.$$('input[name="services"]');
    console.log('Services count:', services.length);
    if (services.length > 0) {
      await services[0].click();
      await page.waitForTimeout(500);
      const total = await page.innerText('#total-price');
      console.log('Total before submit:', total);
      await page.click('#submit-booking');
      console.log('Clicked submit');
      await page.waitForTimeout(2000);
      console.log('URL after submit:', page.url());
      const historyText = await page.innerText('body');
      console.log('History Text Includes "Записей пока нет":', historyText.includes('Записей пока нет'));
    }
  } finally {
    await browser.close();
  }
})();
