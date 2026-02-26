// === Loyalty Page ===
import { getCurrentUser } from '../../auth.js';
import { store } from '../../store.js';
import { renderHeader, initHeaderEvents } from '../../components/header.js';
import { getWeather, getBonusCashbackMultiplier } from '../../weather.js';

export async function renderLoyaltyPage(app) {
    const user = await getCurrentUser();
    
    const bonusBalance = user.bonus_balance || user.bonusBalance || 0;
    const cashbackPercent = user.cashback_percent || user.cashbackPercent || 5;

    const allHistory = (await store.getAll('bonusHistory')) || [];
    const history = allHistory
        .filter(h => h && String(h.userId) === String(user.id))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    app.innerHTML = `
    ${await renderHeader()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">🎁 Программа лояльности</h1>
        <p class="page-header__subtitle">Зарабатывайте бонусы с каждой мойкой</p>
      </div>

      <!-- Hero -->
      <div class="loyalty-hero mb-2xl animate-scale-in">
        <div class="loyalty-hero__balance">${bonusBalance} ₽</div>
        <div class="loyalty-hero__label">Бонусный баланс</div>
        <div class="loyalty-hero__cashback" id="cashback-badge">
          💰 Ваш кэшбек: ${cashbackPercent}%
        </div>
      </div>

      <!-- Weather Cashback Info -->
      <div class="glass-card glass-card--static mb-2xl" id="weather-bonus" style="display:none;">
        <div class="flex items-center gap-lg">
          <span style="font-size:2rem;" id="wb-icon">🌧️</span>
          <div>
            <div style="font-weight:600;color:var(--color-success);">Повышенный кэшбек x2!</div>
            <div class="text-secondary" style="font-size:var(--font-size-sm);">
              Сегодня плохая погода — кэшбек удваивается до <strong>${cashbackPercent * 2}%</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- How it works -->
      <div class="glass-card glass-card--static mb-2xl">
        <h3 style="margin-bottom:var(--space-xl);">Как это работает</h3>
        <div class="grid-3 stagger-children">
          <div class="text-center">
            <div style="font-size:2rem;margin-bottom:var(--space-md);">🚿</div>
            <div style="font-weight:600;margin-bottom:var(--space-xs);">Мойте авто</div>
            <div class="text-secondary" style="font-size:var(--font-size-sm);">Записывайтесь на мойку через приложение</div>
          </div>
          <div class="text-center">
            <div style="font-size:2rem;margin-bottom:var(--space-md);">💰</div>
            <div style="font-weight:600;margin-bottom:var(--space-xs);">Получайте кэшбек</div>
            <div class="text-secondary" style="font-size:var(--font-size-sm);">${cashbackPercent}% от суммы возвращается бонусами</div>
          </div>
          <div class="text-center">
            <div style="font-size:2rem;margin-bottom:var(--space-md);">🎁</div>
            <div style="font-weight:600;margin-bottom:var(--space-xs);">Оплачивайте бонусами</div>
            <div class="text-secondary" style="font-size:var(--font-size-sm);">До 30% стоимости следующей мойки</div>
          </div>
        </div>
      </div>

      <!-- Bonus levels -->
      <div class="glass-card glass-card--static mb-2xl">
        <h3 style="margin-bottom:var(--space-xl);">Уровни кэшбека</h3>
        <div class="flex flex-col gap-md">
          ${[
            { name: 'Стандарт', percent: 5, moeks: '0-9', active: cashbackPercent <= 5 },
            { name: 'Серебро', percent: 7, moeks: '10-24', active: cashbackPercent > 5 && cashbackPercent <= 7 },
            { name: 'Золото', percent: 10, moeks: '25-49', active: cashbackPercent > 7 && cashbackPercent <= 10 },
            { name: 'Платина', percent: 15, moeks: '50+', active: cashbackPercent > 10 },
        ].map(level => `
            <div class="flex items-center justify-between" style="padding:var(--space-md) var(--space-lg);border-radius:var(--radius-md);${level.active ? 'background:rgba(37,99,235,0.06);border:1px solid rgba(37,99,235,0.15);' : ''}">
              <div class="flex items-center gap-md">
                ${level.active ? '<span class="badge badge--primary">Текущий</span>' : ''}
                <span style="font-weight:${level.active ? '600' : '400'};">${level.name}</span>
              </div>
              <div class="flex items-center gap-xl">
                <span class="text-secondary" style="font-size:var(--font-size-sm);">${level.moeks} моек</span>
                <span style="font-weight:700;color:var(--color-primary);">${level.percent}%</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- History -->
      <div class="glass-card glass-card--static">
        <h3 style="margin-bottom:var(--space-xl);">История начислений</h3>
        ${history.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon">📊</div>
            <div class="empty-state__title">Пока нет начислений</div>
          </div>
        ` : `
          <div class="flex flex-col gap-sm">
            ${history.map(h => `
              <div class="flex items-center justify-between" style="padding:var(--space-md) 0;border-bottom:1px solid var(--color-divider);">
                <div>
                  <div style="font-size:var(--font-size-sm);font-weight:500;">${h.description}</div>
                  <div class="text-muted" style="font-size:var(--font-size-xs);">
                    ${h.createdAt ? new Date(h.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '---'}
                  </div>
                </div>
                <span style="font-weight:700;color:${h.amount > 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
                  ${h.amount > 0 ? '+' : ''}${h.amount} ₽
                </span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </main>
  `;

    initHeaderEvents();

    // Check weather for bonus
    getWeather().then(w => {
        if (w.isBadWeather) {
            const el = document.getElementById('weather-bonus');
            if (el) {
                el.style.display = 'block';
                document.getElementById('wb-icon').textContent = w.icon;
            }
        }
    }).catch(async () => { });
}
