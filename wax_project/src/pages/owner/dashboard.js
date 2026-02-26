// === Owner Dashboard ===
import { getCurrentUser } from '../../auth.js';
import { store } from '../../store.js';
import { renderHeader, initHeaderEvents } from '../../components/header.js';
import { showModal } from '../../components/modal.js';

export async function renderOwnerDashboard(app) {
    const user = await getCurrentUser();
    
    // Fetch data for stats
    const bookings = await store.getAll('bookings') || [];
    const services = await store.getAll('services') || [];
    const washers = await store.getAll('washers') || [];
    const allUsers = await store.getAll('users') || [];
    
    const now = new Date();
    const todayStr = store.getTodayStr();
    
    // Calculate Stats
    const todayBookings = bookings.filter(b => {
        if (!b || !b.date) return false;
        const bDate = b.date.includes('T') ? b.date.split('T')[0] : b.date;
        return bDate === todayStr;
    });
    
    const completedToday = todayBookings.filter(b => b.status === 'completed');
    const revenueToday = completedToday.reduce((sum, b) => sum + parseFloat(b.total_price || b.totalPrice || 0), 0);
    
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyBookings = bookings.filter(b => {
        if (!b || !b.date) return false;
        const d = new Date(b.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && b.status === 'completed';
    });
    const revenueMonth = monthlyBookings.reduce((sum, b) => sum + parseFloat(b.total_price || b.totalPrice || 0), 0);

    const avgRating = bookings.filter(b => b.rating).reduce((sum, b, _, arr) => sum + b.rating / arr.length, 0);

    const lowRatings = bookings.filter(b => b.rating && b.rating <= 3).slice(0, 5);

    app.innerHTML = `
    ${await renderHeader()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">👑 Панель владельца</h1>
        <p class="page-header__subtitle">Обзор бизнеса — ${new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</p>
      </div>

      <!-- Quick Stats Grid -->
      <div class="dashboard-grid--stats mb-2xl">
        <a href="#/admin/queue" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">💰</span>
          <div class="stat-card__value">${revenueToday.toLocaleString()} ₽</div>
          <div class="stat-card__label">Выручка сегодня</div>
        </a>
        <a href="#/owner/reports" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">📅</span>
          <div class="stat-card__value">${revenueMonth.toLocaleString()} ₽</div>
          <div class="stat-card__label">За этот месяц</div>
        </a>
        <a href="#/admin/queue" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">🚿</span>
          <div class="stat-card__value">${todayBookings.length}</div>
          <div class="stat-card__label">Записи сегодня</div>
        </a>
        <a href="#/admin/queue" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">⭐</span>
          <div class="stat-card__value">${avgRating ? avgRating.toFixed(1) : '—'}</div>
          <div class="stat-card__label">Средний рейтинг</div>
        </a>
      </div>

      <!-- Management Actions -->
      <h2 style="font-size:var(--font-size-xl);margin-bottom:var(--space-lg);">Управление</h2>
      <div class="dashboard-grid mb-2xl">
        <a href="#/owner/services" class="glass-card quick-action" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="quick-action__icon">🛠️</span>
          <span class="quick-action__label">Прайс-лист</span>
          <p class="text-muted" style="font-size:var(--font-size-xs);margin-top:var(--space-sm);">${services.length} активных услуг</p>
        </a>
        <a href="#/owner/staff" class="glass-card quick-action" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="quick-action__icon">👷</span>
          <span class="quick-action__label">Персонал</span>
          <p class="text-muted" style="font-size:var(--font-size-xs);margin-top:var(--space-sm);">${washers.length} сотрудников</p>
        </a>
        <a href="#/owner/reports" class="glass-card quick-action" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="quick-action__icon">📊</span>
          <span class="quick-action__label">Детальные отчёты</span>
          <p class="text-muted" style="font-size:var(--font-size-xs);margin-top:var(--space-sm);">Аналитика и графики</p>
        </a>
      </div>

      <!-- Recent Low Ratings or Alerts -->
      ${lowRatings.length > 0 ? `
        <div class="glass-card glass-card--static">
          <h3 style="margin-bottom:var(--space-md);color:var(--color-danger);">⚠️ Требует внимания (плохие оценки)</h3>
          <div class="flex flex-col gap-sm">
            ${lowRatings.map(b => {
                const client = allUsers.find(u => String(u.id) === String(b.user_id || b.userId));
                const carNum = client?.car_number || client?.carNumber || 'неизв.';
                return `
                  <div class="flex justify-between items-center" style="padding:var(--space-sm) 0; border-bottom:1px solid var(--color-divider);">
                    <div>
                      <div style="font-weight:600;font-size:var(--font-size-sm);">Оценка ${b.rating}⭐ — Машина ${carNum}</div>
                      <div class="text-muted" style="font-size:var(--font-size-xs);">${b.review || 'Без отзыва'}</div>
                    </div>
                    <button class="btn btn--secondary btn--sm detail-btn" data-id="${b.id}">Детали</button>
                  </div>
                `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    </main>
    `;

    initHeaderEvents();

    // Details handler
    document.querySelectorAll('.detail-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const booking = bookings.find(b => String(b.id) === String(id));
            if (booking) {
                const washer = (booking.washer_id || booking.washerId) ? washers.find(w => String(w.id) === String(booking.washer_id || booking.washerId)) : null;
                const client = allUsers.find(u => String(u.id) === String(booking.user_id || booking.userId));
                
                await showModal({
                    title: 'Детали мойки 🚿',
                    content: `
                        <div class="flex flex-col gap-lg">
                            <div class="glass-card glass-card--static" style="background: rgba(239, 68, 68, 0.05); border-color: var(--color-danger-100);">
                                <div style="font-size: 2rem; text-align: center; margin-bottom: var(--space-md);">${'⭐'.repeat(booking.rating || 0)}</div>
                                <div style="font-weight: 600; text-align: center; margin-bottom: var(--space-sm);">Отзыв клиента: ${client?.name || 'Гость'}</div>
                                <div style="font-style: italic; text-align: center; color: var(--color-text-secondary);">"${booking.review || 'без комментария'}"</div>
                            </div>
                            
                            <div class="grid-2">
                                <div>
                                    <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase;">Машина</div>
                                    <div style="font-weight: 700; font-size: var(--font-size-lg); color: var(--color-primary);">${client?.car_number || client?.carNumber || 'не указан'}</div>
                                </div>
                                <div>
                                    <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase;">Телефон</div>
                                    <div style="font-weight: 600;">${client?.phone || 'нет'}</div>
                                </div>
                                <div>
                                    <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase;">Тип кузова</div>
                                    <div>${booking.body_type || booking.bodyType || 'не указан'}</div>
                                </div>
                                <div>
                                    <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase;">Мойщик</div>
                                    <div style="font-weight: 600;">${washer?.name || 'не назначен'}</div>
                                </div>
                                <div>
                                    <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase;">Время мойки</div>
                                    <div>${new Date(booking.date).toLocaleDateString('ru-RU')} в ${booking.time}</div>
                                </div>
                                <div>
                                    <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase;">Сумма</div>
                                    <div style="font-weight: 700;">${booking.total_price || booking.totalPrice} ₽</div>
                                </div>
                            </div>
                        </div>
                    `,
                    footer: `
                        <button class="btn btn--primary btn--full" onclick="this.closest('.modal').querySelector('.modal__close').click()">Закрыть</button>
                    `
                });
            }
        });
    });
}
