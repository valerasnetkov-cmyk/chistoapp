const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    console.log('Opening page...');
    await page.goto('https://t.me/s/kyplu_prodam_sahalin', { waitUntil: 'networkidle', timeout: 30000 });
    const messages = await page.$$eval('.tgme_widget_message_text', els => els.map(el => el.innerText));
    console.log(`Found ${messages.length} messages.`);
    for (const msg of messages.slice(-3)) {
      console.log('---');
      console.log(msg);
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
