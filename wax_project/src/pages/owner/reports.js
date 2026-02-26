// === Owner Reports Page ===
import { store } from '../../store.js';
import { renderHeader, initHeaderEvents } from '../../components/header.js';
import { showModal } from '../../components/modal.js';

export async function renderOwnerReportsPage(app) {
    const bookings = await store.getAll('bookings') || [];
    const washers = await store.getAll('washers') || [];
    const allUsers = await store.getAll('users') || [];
    const posts = await store.getAll('posts') || [
        { id: 1, name: 'Пост 1' },
        { id: 2, name: 'Пост 2' },
        { id: 3, name: 'Пост 3' }
    ];

    const todayStr = store.getTodayStr();
    const completed = bookings.filter(b => b.status === 'completed');

    // Stats by Washer
    const washerStats = washers.map(w => {
        const wBookings = completed.filter(b => String(b.washer_id || b.washerId) === String(w.id));
        const totalRevenue = wBookings.reduce((sum, b) => sum + parseFloat(b.total_price || b.totalPrice || 0), 0);
        const washerEarning = wBookings.reduce((sum, b) => {
            const price = parseFloat(b.total_price || b.totalPrice || 0);
            return sum + (price * (w.percent / 100));
        }, 0);
        
        return {
            id: w.id,
            name: w.name,
            percent: w.percent,
            count: wBookings.length,
            revenue: totalRevenue,
            earning: washerEarning,
            bookings: wBookings
        };
    }).sort((a, b) => b.revenue - a.revenue);

    // Stats by Post
    const postStats = posts.map(p => {
        const pBookings = completed.filter(b => String(b.post_id || b.postNumber) === String(p.id));
        const totalRevenue = pBookings.reduce((sum, b) => sum + parseFloat(b.total_price || b.totalPrice || 0), 0);
        return {
            name: p.name,
            count: pBookings.length,
            revenue: totalRevenue
        };
    });

    app.innerHTML = `
    ${await renderHeader()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">📊 Отчёты и выручка</h1>
        <p class="page-header__subtitle">Аналитика по постам, мойкам и времени</p>
      </div>

      <!-- Total Summary -->
      <div class="dashboard-grid--stats mb-xl">
        <div class="glass-card stat-card">
          <span class="stat-card__icon">💰</span>
          <div class="stat-card__value">${completed.reduce((s, b) => s + parseFloat(b.total_price || b.totalPrice || 0), 0).toLocaleString()} ₽</div>
          <div class="stat-card__label">Общая выручка</div>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-card__icon">🚿</span>
          <div class="stat-card__value">${completed.length}</div>
          <div class="stat-card__label">Всего моек</div>
        </div>
      </div>

      <!-- Revenue by Washers -->
      <div class="glass-card mb-xl">
        <h3 class="mb-lg">👷 Эффективность мойщиков</h3>
        <p class="text-muted mb-md" style="font-size: var(--font-size-xs);">Нажмите на имя мойщика для детальной истории</p>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Мойщик</th>
                <th>Моек</th>
                <th>Выручка</th>
                <th>З/П</th>
              </tr>
            </thead>
            <tbody>
              ${washerStats.map(ws => `
                <tr class="washer-row" data-id="${ws.id}" style="cursor: pointer;">
                  <td style="font-weight:600; color: var(--color-primary); text-decoration: underline;">${ws.name}</td>
                  <td>${ws.count}</td>
                  <td>${ws.revenue.toLocaleString()} ₽</td>
                  <td class="text-success" style="font-weight:700;">${ws.earning.toLocaleString()} ₽</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Revenue by Posts -->
      <div class="glass-card mb-xl">
        <h3 class="mb-lg">📍 Загрузка постов</h3>
        <div class="grid-3">
          ${postStats.map(ps => `
            <div class="text-center p-md" style="background: rgba(255,255,255,0.2); border-radius: var(--radius-md);">
              <div class="text-muted" style="font-size: var(--font-size-xs);">${ps.name}</div>
              <div style="font-weight:700; font-size: var(--font-size-lg); margin: 4px 0;">${ps.revenue.toLocaleString()} ₽</div>
              <div class="text-secondary" style="font-size: var(--font-size-xs);">${ps.count} моек</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Detailed Log -->
      <div class="glass-card">
        <h3 class="mb-lg">📋 Лог последних моек</h3>
        <div class="flex flex-col gap-sm">
          ${completed.slice(0, 15).map(b => {
            const washer = washers.find(w => String(w.id) === String(b.washer_id || b.washerId));
            const client = allUsers.find(u => String(u.id) === String(b.user_id || b.userId));
            const carNum = b.car_number || b.carNumber || client?.car_number || client?.carNumber || 'неизв.';
            
            return `
              <div class="flex justify-between items-center py-sm" style="border-bottom: 1px solid var(--color-divider);">
                <div>
                  <div style="font-weight:600; font-size: var(--font-size-sm);">${new Date(b.date).toLocaleDateString('ru-RU')} — ${b.time}</div>
                  <div class="text-secondary" style="font-size: var(--font-size-sm); font-weight: 700;">🚗 ${carNum}</div>
                  <div class="text-muted" style="font-size: var(--font-size-xs);">Мойщик: ${washer?.name || 'неизв.'}</div>
                </div>
                <div class="text-right">
                  <div style="font-weight:700;">${parseFloat(b.total_price || b.totalPrice).toLocaleString()} ₽</div>
                  ${b.rating ? `<div style="font-size: 10px;">${'⭐'.repeat(b.rating)}</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </main>
    `;

    initHeaderEvents();

    // Washer Details Modal Handler
    document.querySelectorAll('.washer-row').forEach(row => {
        row.addEventListener('click', async () => {
            const id = row.dataset.id;
            const ws = washerStats.find(s => String(s.id) === String(id));
            if (!ws) return;

            await showModal({
                title: `История: ${ws.name} (${ws.percent}%)`,
                content: `
                    <div class="flex flex-col gap-md">
                        <div class="dashboard-grid--stats" style="grid-template-columns: 1fr 1fr; gap: 8px;">
                            <div class="glass-card" style="padding: 12px; text-align: center;">
                                <div class="text-muted" style="font-size: 10px;">ВЫРУЧКА</div>
                                <div style="font-weight: 800; font-size: 1.1rem; color: var(--color-primary);">${ws.revenue.toLocaleString()} ₽</div>
                            </div>
                            <div class="glass-card" style="padding: 12px; text-align: center;">
                                <div class="text-muted" style="font-size: 10px;">ЗАРПЛАТА</div>
                                <div style="font-weight: 800; font-size: 1.1rem; color: var(--color-success);">${ws.earning.toLocaleString()} ₽</div>
                            </div>
                        </div>
                        
                        <div class="flex flex-col gap-xs" style="max-height: 350px; overflow-y: auto; padding-right: 4px;">
                            ${ws.bookings.length === 0 ? '<p class="text-center text-muted">Нет моек</p>' : ws.bookings.map(b => {
                                const client = allUsers.find(u => String(u.id) === String(b.user_id || b.userId));
                                const carNum = b.car_number || b.carNumber || client?.car_number || client?.carNumber || 'неизв.';
                                const phone = client?.phone || 'нет';
                                const bodyLabels = { sedan: 'Седан', suv: 'Внедорожник', crossover: 'Кроссовер', minivan: 'Минивэн' };
                                const displayBody = bodyLabels[b.body_type || b.bodyType] || b.body_type || b.bodyType || 'неизв.';
                                
                                return `
                                    <div class="washer-history-item">
                                        <div class="washer-history-item__header">
                                            <div class="washer-history-item__car">🚗 ${carNum}</div>
                                            <div class="washer-history-item__price">${parseFloat(b.total_price || b.totalPrice).toLocaleString()} ₽</div>
                                        </div>
                                        <div class="washer-history-item__meta">
                                            <span>${new Date(b.date).toLocaleDateString('ru-RU')} в ${b.time}</span>
                                            <span>📞 ${phone}</span>
                                        </div>
                                        <div class="washer-history-item__meta">
                                            <span class="text-secondary">${displayBody}</span>
                                            <span style="color: #fbbf24;">${b.rating ? '⭐'.repeat(b.rating) : 'нет оценки'}</span>
                                        </div>
                                        ${b.review ? `<div class="washer-history-item__comment">"${b.review}"</div>` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `,
                footer: `
                    <button class="btn btn--primary btn--full" id="close-ws-modal">Закрыть</button>
                `
            }).then(({modal, close}) => {
                document.getElementById('close-ws-modal')?.addEventListener('click', close);
            });
        });
    });
}
