// === History Page ===
import { getCurrentUser } from '../../auth.js';
import { store } from '../../store.js';
import { renderHeader, initHeaderEvents } from '../../components/header.js';
import { showToast } from '../../components/toast.js';
import { showModal } from '../../components/modal.js';
import { createRating, renderStars } from '../../components/rating.js';
import { notifyLowRating } from '../../notifications.js';

export async function renderHistoryPage(app) {
    const user = await getCurrentUser();
    await render();

    async function render() {
        const allBookings = (await store.getAll('bookings')) || [];
        const bookings = allBookings
            .filter(b => b && String(b.user_id || b.userId) === String(user.id))
            .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.time || '').localeCompare(a.time || ''));
        const services = (await store.getAll('services')) || [];

        app.innerHTML = `
      ${await renderHeader()}
      <main class="page-content animate-fade-in">
        <div class="page-header">
          <h1 class="page-header__title">📋 История записей</h1>
          <p class="page-header__subtitle">Все ваши записи в одном месте</p>
        </div>

        ${bookings.length === 0 ? `
          <div class="glass-card text-center" style="padding:var(--space-4xl);">
            <div style="font-size:3rem;margin-bottom:var(--space-lg);">📋</div>
            <h3 style="margin-bottom:var(--space-sm);">Записей пока нет</h3>
            <p class="text-secondary mb-lg">Запишитесь на первую мойку!</p>
            <a href="#/booking" class="btn btn--primary">Записаться</a>
          </div>
        ` : `
          <div class="history-list stagger-children">
            ${bookings.map(b => {
            const serviceIds = b.service_ids ? (typeof b.service_ids === 'string' ? JSON.parse(b.service_ids) : b.service_ids) : (b.serviceIds || []);
            const svcNames = serviceIds.map(id => services.find(s => String(s.id) === String(id))).filter(Boolean);
            return `
                <div class="glass-card history-item">
                  <div class="history-item__date">
                    <div class="history-item__day">${b.date ? new Date(b.date).getDate() : '??'}</div>
                    <div class="history-item__month">${b.date ? new Date(b.date).toLocaleDateString('ru-RU', { month: 'short' }) : ''}</div>
                  </div>
                  <div class="history-item__details">
                    <div class="history-item__services">${svcNames.map(s => `${s.icon || '🧼'} ${s.name}`).join(', ')}</div>
                    <div class="history-item__meta">
                      <span>🕐 ${b.time}</span>
                      <span>💰 ${b.total_price || b.totalPrice || 0} ₽</span>
                      <span class="badge badge--${getStatusBadge(b.status)}">${getStatusLabel(b.status)}</span>
                    </div>
                    ${b.rating ? `
                      <div style="margin-top:var(--space-sm);font-size:var(--font-size-sm);">
                        ${renderStars(b.rating)} 
                        ${b.review ? `<span class="text-secondary"> — ${b.review}</span>` : ''}
                      </div>
                    ` : ''}
                  </div>
                  <div class="history-item__actions">
                    ${b.status === 'pending' ? `
                      <button class="btn btn--danger btn--sm cancel-btn" data-id="${b.id}">Отменить</button>
                    ` : ''}
                    ${b.status === 'completed' && !b.rating ? `
                      <button class="btn btn--primary btn--sm rate-btn" data-id="${b.id}">Оценить</button>
                    ` : ''}
                  </div>
                </div>
              `;
        }).join('')}
          </div>
        `}
      </main>
    `;

        initHeaderEvents();

        // Cancel booking
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const bookingId = btn.dataset.id;
                await store.update('bookings', bookingId, { status: 'cancelled' });
                showToast('Запись отменена', 'info');
                await render();
            });
        });

        // Rate booking
        document.querySelectorAll('.rate-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                await openRatingModal(btn.dataset.id, user);
            });
        });
    }

    async function openRatingModal(bookingId, user) {
        let selectedRating = 0;
        const { modal, close } = await showModal({
            title: 'Оценка мойки',
            content: `
        <div class="text-center mb-xl">
          <p class="text-secondary mb-lg">Оцените качество мойки</p>
          <div id="modal-rating" style="display:flex;justify-content:center;"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Отзыв (необязательно)</label>
          <textarea class="form-textarea" id="review-text" placeholder="Ваш отзыв о мойке..." rows="3"></textarea>
        </div>
      `,
            footer: `
        <button class="btn btn--secondary" id="cancel-rating">Отмена</button>
        <button class="btn btn--primary" id="submit-rating">Отправить</button>
      `,
        });

        const ratingContainer = modal.querySelector('#modal-rating');
        const ratingEl = await createRating(0, (val) => { selectedRating = val; });
        ratingContainer.appendChild(ratingEl);

        modal.querySelector('#cancel-rating').addEventListener('click', close);
        modal.querySelector('#submit-rating').addEventListener('click', async () => {
            if (selectedRating === 0) {
                showToast('Выберите оценку', 'warning');
                return;
            }

            const review = modal.querySelector('#review-text').value.trim();
            const booking = await store.update('bookings', bookingId, { rating: selectedRating, review });

            // Add cashback bonus
            const totalPrice = booking.total_price || booking.totalPrice || 0;
            const cashbackPercent = user.cashback_percent || user.cashbackPercent || 5;
            const bonusBalance = user.bonus_balance || user.bonusBalance || 0;
            
            const cashbackAmount = Math.round(totalPrice * cashbackPercent / 100);
            if (cashbackAmount > 0) {
                const updatedUser = await store.update('users', user.id, {
                    bonus_balance: bonusBalance + cashbackAmount,
                });
                await store.set('currentUser', updatedUser);

                await store.add('bonusHistory', {
                    userId: user.id,
                    amount: cashbackAmount,
                    type: 'earned',
                    bookingId: bookingId,
                    description: `Кэшбек ${cashbackPercent}% за мойку`,
                });
            }

            // Notify admins/owners for low ratings
            if (selectedRating <= 3) {
                await notifyLowRating(booking, selectedRating, user.name);
            }

            close();
            showToast(`Спасибо за оценку! Начислено ${cashbackAmount} бонусов`, 'success');
            await render();
        });
    }
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

function getStatusBadge(status) {
    const badges = {
        pending: 'primary',
        waiting: 'warning',
        in_progress: 'accent',
        completed: 'success',
        cancelled: 'danger',
    };
    return badges[status] || 'glass';
}
