// === Admin Dashboard ===
import { getCurrentUser } from '../../auth.js';
import { store } from '../../store.js';
import { renderHeader, initHeaderEvents } from '../../components/header.js';
import { getNotifications } from '../../notifications.js';
import { renderStars } from '../../components/rating.js';

export async function renderAdminDashboard(app) {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
        // Redundancy check - router should handle this, but better safe
        window.location.hash = '#/admin/login';
        return;
    }

    const today = store.getTodayStr();
    const bookings = (await store.getAll('bookings')) || [];
    const todayBookings = bookings.filter(b => {
        if (!b || !b.date) return false;
        // Normalize date comparison: DB date might be "2026-02-20T00:00:00.000Z"
        const bDate = b.date.includes('T') ? b.date.split('T')[0] : b.date;
        return bDate === today;
    });
    
    const services = (await store.getAll('services')) || [];
    const washers = (await store.getAll('washers')) || [];
    const allUsers = (await store.getAll('users')) || [];
    
    const posts = [
        { id: 1, name: 'Пост 1' },
        { id: 2, name: 'Пост 2' },
        { id: 3, name: 'Пост 3' },
    ];

    const waiting = todayBookings.filter(b => b && ['pending', 'waiting'].includes(b.status));
    const inProgress = todayBookings.filter(b => b && b.status === 'in_progress');
    const completed = todayBookings.filter(b => b && b.status === 'completed');

    // Low rating notifications
    const allNotifs = (await getNotifications(user.id)) || [];
    const notifs = allNotifs.filter(n => n && n.type === 'low_rating' && !n.read);

    app.innerHTML = `
    ${await renderHeader()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">🛡️ Панель администратора</h1>
        <p class="page-header__subtitle">Управление мойкой — ${new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <!-- Stats -->
      <div class="dashboard-grid--stats mb-2xl">
        <a href="#/admin/queue" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">⏳</span>
          <div class="stat-card__value">${waiting.length}</div>
          <div class="stat-card__label">В очереди</div>
        </a>
        <a href="#/admin/queue" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">🚿</span>
          <div class="stat-card__value">${inProgress.length}</div>
          <div class="stat-card__label">На мойке</div>
        </a>
        <a href="#/admin/queue" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">✅</span>
          <div class="stat-card__value">${completed.length}</div>
          <div class="stat-card__label">Завершено</div>
        </a>
        <a href="#/owner/reports" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">💰</span>
          <div class="stat-card__value">${completed.reduce((s, b) => s + parseFloat(b.total_price || b.totalPrice || 0), 0)} ₽</div>
          <div class="stat-card__label">Выручка сегодня</div>
        </a>
      </div>

      <!-- Posts status -->
      <div class="glass-card glass-card--static mb-2xl">
        <h3 style="margin-bottom:var(--space-lg);">📍 Статус постов</h3>
        <div class="grid-3 stagger-children">
          ${posts.map(p => {
        const activeBooking = inProgress.find(b => (b.post_id || b.postNumber) == p.id);
        const washer = activeBooking ? washers.find(w => w.id == (activeBooking.washer_id || activeBooking.washerId)) : null;
        const client = activeBooking ? allUsers.find(u => u.id == (activeBooking.user_id || activeBooking.userId)) : null;
        
        return `
              <div class="glass-card ${activeBooking ? '' : 'glass-card--static'}" style="text-align:center;">
                <div style="font-size:1.5rem;margin-bottom:var(--space-md);">${activeBooking ? '🚿' : '✅'}</div>
                <div style="font-weight:700;font-size:var(--font-size-lg);">${p.name}</div>
                <div class="badge badge--${activeBooking ? 'accent' : 'success'}" style="margin-top:var(--space-sm);">
                  ${activeBooking ? 'Занят' : 'Свободен'}
                </div>
                ${activeBooking ? `
                  <div style="margin-top:var(--space-md);font-size:var(--font-size-sm);" class="text-secondary">
                    ${client ? (client.name || 'Гость') : 'Запись #' + activeBooking.id}<br>
                    ${washer?.name || 'Мойщик не назначен'}
                  </div>
                ` : ''}
              </div>
            `;
    }).join('')}
        </div>
      </div>

      <!-- Quick actions -->
      <div class="grid-3 stagger-children">
        <a href="#/admin/queue" class="glass-card quick-action" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="quick-action__icon">📋</span>
          <span class="quick-action__label">Управление очередью</span>
        </a>
        <a href="#/admin/booking" class="glass-card quick-action" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="quick-action__icon">📝</span>
          <span class="quick-action__label">Записать клиента</span>
        </a>
        <a href="#/owner/reports" class="glass-card quick-action" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="quick-action__icon">📊</span>
          <span class="quick-action__label">Записей сегодня: ${todayBookings.length}</span>
        </a>
      </div>
    </main>
  `;

    initHeaderEvents();
}
