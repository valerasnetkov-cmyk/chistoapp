// === Client Dashboard ===
import { getCurrentUser } from '../../auth.js';
import { store } from '../../store.js';
import { renderHeader, initHeaderEvents } from '../../components/header.js';
import { getWeather } from '../../weather.js';
import { getUnreadCount } from '../../notifications.js';

export async function renderClientDashboard(app) {
    const user = await getCurrentUser() || { name: 'Гость', id: 'guest' };
    const allBookings = (await store.getAll('bookings')) || [];
    const bookings = allBookings.filter(b => b && String(b.user_id || b.userId) === String(user.id));
    const services = (await store.getAll('services')) || [];

    // Check for missed bonuses
    const bonusHistory = await store.getAll('bonusHistory');
    const ratedBookings = bookings.filter(b => b.status === 'completed' && b.rating);
    
    for (const b of ratedBookings) {
        const hasHistory = bonusHistory.some(h => String(h.booking_id) === String(b.id));
        if (!hasHistory) {
            const cashbackAmount = Math.round((b.total_price || b.totalPrice || 0) * (user.cashback_percent || 5) / 100);
            if (cashbackAmount > 0) {
                console.log('Syncing missed bonus for booking:', b.id);
                // 1. Add to DB history
                await store.add('bonusHistory', {
                    userId: user.id,
                    amount: cashbackAmount,
                    type: 'earned',
                    bookingId: b.id,
                    description: `Кэшбек ${user.cashback_percent || 5}% за мойку (синхронизация)`
                });
                // 2. Update user balance
                const currentBalance = parseFloat(user.bonus_balance || user.bonusBalance || 0);
                await store.update('users', user.id, {
                    bonus_balance: currentBalance + cashbackAmount
                });
            }
        }
    }

    // Upcoming booking
    const today = store.getTodayStr();
    const upcoming = bookings
        .filter(b => {
            if (!b || !b.date) return false;
            const bDate = b.date.includes('T') ? b.date.split('T')[0] : b.date;
            return bDate >= today && ['pending', 'waiting', 'in_progress'].includes(b.status);
        })
        .sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || ''))[0];

    const completedCount = bookings.filter(b => b && b.status === 'completed').length;
    
    // Average rating
    const rated = bookings.filter(b => b && b.rating);
    const avgRating = rated.length > 0 ? rated.reduce((sum, b) => sum + b.rating, 0) / rated.length : 0;

    const displayName = user.name || user.phone || user.carNumber || user.car_number || 'Гость';

    app.innerHTML = `
    ${await renderHeader()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">Привет, ${displayName.split(' ')[0]}! 👋</h1>
        <p class="page-header__subtitle">Добро пожаловать в «Чисто и точка»</p>
      </div>

      <!-- Upcoming Booking -->
      ${upcoming ? `
        <div class="glass-card glass-card--elevated mb-xl">
          <div class="flex items-center gap-md mb-lg">
            <span class="icon-circle icon-circle--primary">📅</span>
            <div>
              <h3 style="font-size:var(--font-size-lg);">Ближайшая запись</h3>
              <span class="badge badge--${upcoming.status === 'pending' ? 'primary' : upcoming.status === 'waiting' ? 'warning' : 'accent'}">${getStatusLabel(upcoming.status)}</span>
            </div>
          </div>
          <div class="flex justify-between items-center flex-wrap gap-md">
            <div>
              <div style="font-weight:600;font-size:var(--font-size-lg);">${formatDate(upcoming.date)} в ${upcoming.time}</div>
              <div class="text-secondary" style="font-size:var(--font-size-sm);">
                ${upcoming.service_ids ? (typeof upcoming.service_ids === 'string' ? JSON.parse(upcoming.service_ids) : upcoming.service_ids).map(id => services.find(s => String(s.id) === String(id))?.name || '').join(', ') : (upcoming.serviceIds || []).map(id => services.find(s => String(s.id) === String(id))?.name || '').join(', ')}
              </div>
            </div>
            <div style="font-family:var(--font-heading);font-size:var(--font-size-xl);font-weight:800;color:var(--color-primary);">
              ${upcoming.total_price || upcoming.totalPrice || 0} ₽
            </div>
          </div>
        </div>
      ` : `
        <div class="glass-card glass-card--static text-center mb-xl" style="padding:var(--space-2xl);">
          <div style="font-size:3rem;margin-bottom:var(--space-lg);">🚗</div>
          <h3 style="margin-bottom:var(--space-sm);">Нет активных записей</h3>
          <p class="text-secondary mb-lg">Запишитесь на мойку прямо сейчас!</p>
          <a href="#/booking" class="btn btn--primary btn--lg">Записаться</a>
        </div>
      `}

      <!-- Weather Banner -->
      <div class="glass-card glass-card--static mb-xl" id="weather-banner" style="display:none;">
        <div class="flex items-center justify-between flex-wrap gap-lg">
          <div class="flex items-center gap-lg">
            <span style="font-size:2.5rem;" id="weather-icon">🌤️</span>
            <div>
              <div style="font-weight:600;" id="weather-temp">Загрузка погоды...</div>
              <div class="text-secondary" style="font-size:var(--font-size-sm);" id="weather-desc"></div>
            </div>
          </div>
          <div id="weather-cashback" style="display:none;">
            <span class="badge badge--success" style="font-size:var(--font-size-sm);padding:0.4rem 0.8rem;">
              🎁 Повышенный кэшбек x2 за плохую погоду!
            </span>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="dashboard-grid--stats mb-2xl stagger-children">
        <div class="glass-card stat-card">
          <span class="stat-card__icon">🎁</span>
          <div class="stat-card__value">${user.bonus_balance || user.bonusBalance || 0}</div>
          <div class="stat-card__label">Бонусов</div>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-card__icon">🚿</span>
          <div class="stat-card__value">${completedCount}</div>
          <div class="stat-card__label">Моек</div>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-card__icon">⭐</span>
          <div class="stat-card__value">${avgRating > 0 ? avgRating.toFixed(1) : '—'}</div>
          <div class="stat-card__label">Ср. оценка</div>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-card__icon">💰</span>
          <div class="stat-card__value">${user.cashback_percent || user.cashbackPercent || 5}%</div>
          <div class="stat-card__label">Кэшбек</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <h2 style="font-size:var(--font-size-xl);margin-bottom:var(--space-lg);">Быстрые действия</h2>
      <div class="quick-actions stagger-children mb-2xl">
        <a href="#/booking" class="glass-card quick-action">
          <span class="quick-action__icon">📝</span>
          <span class="quick-action__label">Запись на мойку</span>
        </a>
        <a href="#/history" class="glass-card quick-action">
          <span class="quick-action__icon">📋</span>
          <span class="quick-action__label">История</span>
        </a>
        <a href="#/loyalty" class="glass-card quick-action">
          <span class="quick-action__icon">🎁</span>
          <span class="quick-action__label">Бонусы</span>
        </a>
        <a href="#/profile" class="glass-card quick-action">
          <span class="quick-action__icon">👤</span>
          <span class="quick-action__label">Профиль</span>
        </a>
        <a href="#/contacts" class="glass-card quick-action">
          <span class="quick-action__icon">📞</span>
          <span class="quick-action__label">Контакты</span>
        </a>
        <a href="#/tips" class="glass-card quick-action">
          <span class="quick-action__icon">💡</span>
          <span class="quick-action__label">Советы</span>
        </a>
      </div>
    </main>
  `;

    initHeaderEvents();
    loadWeather();
}

async function loadWeather() {
    const banner = document.getElementById('weather-banner');
    if (!banner) return;
    try {
        const w = await getWeather('Yuzhno-Sakhalinsk');
        banner.style.display = 'block';
        document.getElementById('weather-icon').textContent = w.icon;
        document.getElementById('weather-temp').textContent = w.temp !== null ? `${w.temp}°C` : 'Нет данных';
        document.getElementById('weather-desc').textContent = w.description;
        if (w.isBadWeather) {
            document.getElementById('weather-cashback').style.display = 'block';
        }
    } catch {
        // silently fail
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const dDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const d = new Date(dDate + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dDate === todayStr) return 'Сегодня';
    if (dDate === tomorrowStr) return 'Завтра';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function getStatusLabel(status) {
    const labels = {
        pending: 'Ожидание',
        waiting: 'В очереди',
        in_progress: 'Моется',
        completed: 'Завершена',
        cancelled: 'Отменена',
    };
    return labels[status] || status;
}
