const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  try {
    const baseUrl = 'http://localhost:3000';
    
    console.log('1. Запуск проекта: localhost:3000...');
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    console.log('   Успешно. Title:', await page.title());

    console.log('2. Проверка гостевого входа (главная)...');
    await page.waitForSelector('.app-header__username', { state: 'visible' });
    const welcome = await page.textContent('.app-header__username');
    console.log('   Имя пользователя в хедере:', welcome);

    console.log('3. Проверка навигации...');
    const navItems = [
        { name: 'Запись', route: '/booking' },
        { name: 'История', route: '/history' },
        { name: 'Бонусы', route: '/loyalty' },
        { name: 'Контакты', route: '/contacts' },
        { name: 'Советы', route: '/tips' },
        { name: 'Профиль', route: '/profile' }
    ];
    for (const item of navItems) {
        if (item.name === 'Профиль') {
            await page.click('#user-menu');
        } else {
            await page.click(`.app-header__link[data-route="${item.route}"]`);
        }
        await page.waitForFunction((r) => window.location.hash.includes(r), item.route);
        console.log(`   - [OK] ${item.name} -> ${await page.evaluate(() => window.location.hash)}`);
    }

    console.log('4. Логин Админа (admin/admin)...');
    await page.goto(`${baseUrl}/#/login`);
    await page.waitForSelector('#login-input');
    await page.fill('#login-input', 'admin');
    await page.fill('#password-input', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.hash.includes('admin'));
    console.log('   [OK] Админ вошел, адрес:', await page.evaluate(() => window.location.hash));

    console.log('   Выход из аккаунта...');
    await page.click('#user-menu');
    await page.waitForFunction(() => window.location.hash.includes('login'));

    console.log('5. Логин Владельца (owner/owner)...');
    await page.fill('#login-input', 'owner');
    await page.fill('#password-input', 'owner');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.hash.includes('owner'));
    console.log('   [OK] Владелец вошел, адрес:', await page.evaluate(() => window.location.hash));

    console.log('\n--- ПРОВЕРКА ЗАВЕРШЕНА УСПЕШНО ---');
  } catch (err) {
    console.error('\n!!! ТЕСТ ПРОВАЛЕН:', err.message);
    await page.screenshot({ path: 'test_error.png' });
    console.log('Скриншот ошибки сохранен в test_error.png');
  } finally {
    await browser.close();
  }
})();
