// === Admin Queue Page ===
import { getCurrentUser } from '../../auth.js';
import { store } from '../../store.js';
import { renderHeader, initHeaderEvents } from '../../components/header.js';
import { showToast } from '../../components/toast.js';
import { notifyPostAssigned, notifyWashComplete } from '../../notifications.js';

// Generate date options
function getDateOptions() {
    const opts = [];
    const today = new Date();
    for (let i = -3; i <= 10; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const v = d.toISOString().split('T')[0];
        let l = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' });
        if (i === 0) l = 'Сегодня';
        else if (i === 1) l = 'Завтра';
        else if (i === -1) l = 'Вчера';
        opts.push({ value: v, label: l });
    }
    return opts;
}

// Get date from URL hash
function getDateFromHash() {
    const hash = window.location.hash;
    const match = hash.match(/date=([^&]+)/);
    return match ? match[1] : null;
}

export async function renderQueuePage(app) {
    const user = await getCurrentUser();
    await render();

    async function render() {
        const today = store.getTodayStr();
        const selectedDate = getDateFromHash() || today;
        
        const bookings = allBookings
            .filter(b => {
                if (!b || !b.date || b.status === 'cancelled') return false;
                const bDate = b.date.includes('T') ? b.date.split('T')[0] : b.date;
                return bDate === selectedDate;
            })
            .sort((a, b) => {
                const order = { in_progress: 0, waiting: 1, pending: 2, completed: 3 };
                return (order[a.status] ?? 9) - (order[b.status] ?? 9) || (a.time || '').localeCompare(b.time || '');
            });
            
        const services = (await store.getAll('services') || []);
        const washers = (await store.getAll('washers') || []).filter(w => w && w.active);
        const posts = (await store.getAll('posts') || []);
        const users = (await store.getAll('users') || []);

        // Track busy washers and posts
        const busyWasherIds = allBookings
            .filter(b => b.status === 'in_progress')
            .map(b => String(b.washer_id || b.washerId));
            
        const busyPostIds = allBookings
            .filter(b => b.status === 'in_progress')
            .map(b => String(b.post_id || b.postNumber));

        app.innerHTML = `
      ${await renderHeader()}
      <main class="page-content animate-fade-in">
        <div class="page-header flex justify-between items-center flex-wrap gap-lg">
          <div style="flex: 1; min-width: 200px;">
            <h1 class="page-header__title">📋 Очередь</h1>
            <div style="margin-top:var(--space-sm);">
              <select id="queue-date-select" class="form-select" style="width:auto;padding:var(--space-sm) var(--space-lg);">
                ${getDateOptions().map(d => `<option value="${d.value}" ${d.value === selectedDate ? 'selected' : ''}>${d.label}</option>`).join('')}
              </select>
            </div>
          </div>
          <a href="#/admin/booking" class="btn btn--primary" style="white-space: nowrap;">+ Записать клиента</a>
        </div>

        ${bookings.length === 0 ? `
          <div class="glass-card text-center" style="padding:var(--space-4xl);">
            <div style="font-size:3rem;margin-bottom:var(--space-lg);">📋</div>
            <h3>Записей нет</h3>
            <p class="text-secondary mt-sm">На выбранную дату записей нет</p>
          </div>
        ` : `
          <div class="queue-list stagger-children">
            ${bookings.map((b, idx) => {
            const client = users.find(u => String(u.id) === String(b.user_id || b.userId));
            const serviceIds = b.service_ids ? (typeof b.service_ids === 'string' ? JSON.parse(b.service_ids) : b.service_ids) : (b.serviceIds || []);
            const svcNames = serviceIds.map(id => services.find(s => String(s.id) === String(id))).filter(Boolean);
            const currentWasherId = String(b.washer_id || b.washerId || '');
            const currentPostId = String(b.post_id || b.postNumber || '');
            const washer = currentWasherId ? washers.find(w => String(w.id) === currentWasherId) : null;
            const post = currentPostId ? posts.find(p => String(p.id) === currentPostId) : null;

            // Formatted Client Title - use data directly from booking first, then fall back to client lookup
            const clientCar = b.car_number || b.carNumber || client?.car_number || client?.carNumber || '';
            const clientPhone = b.phone || client?.phone || '';
            const clientName = b.client_name || b.clientName || client?.name || '';
            
            let displayTitle = '';
            // Format: Запись# (телефон, номер машины)
            if (clientCar || clientPhone) {
                const carPart = clientCar ? `<span style="font-weight: 800; font-size: 1.1rem;">${clientCar}</span>` : '';
                const phonePart = clientPhone ? `<span class="text-secondary">${clientPhone}</span>` : '';
                displayTitle = `<span>Запись #${b.id}</span> ${carPart || phonePart ? `(${phonePart}${clientCar && phonePart ? ', ' : ''}${carPart})` : ''}`;
            } else if (clientName) {
                displayTitle = `<span style="font-weight: 700;">${clientName}</span> ${clientPhone ? `<span class="text-secondary">(${clientPhone})</span>` : ''}`;
            } else {
                displayTitle = `<span class="text-danger">Запись #${b.id} (Нет данных клиента)</span>`;
            }

            return `
                <div class="glass-card queue-item">
                  <div class="queue-item__number">${idx + 1}</div>
                  <div class="queue-item__info">
                    <div class="queue-item__name">
                      ${displayTitle}
                    </div>
                    <div class="queue-item__car">
                      🕐 ${b.time} · ${svcNames.map(s => s.name).join(', ')} · 
                      <strong>${b.total_price || b.totalPrice || 0} ₽</strong>
                    </div>
                    <div style="margin-top:var(--space-sm);display:flex;gap:var(--space-sm);align-items:center;flex-wrap:wrap;">
                      <span class="badge badge--${getStatusBadge(b.status)}">${getStatusLabel(b.status)}</span>
                      ${post ? `<span class="badge badge--accent">📍 ${post.name}</span>` : ''}
                      ${washer ? `<span class="badge badge--glass">👤 ${washer.name}</span>` : ''}
                    </div>
                  </div>
                  <div class="queue-item__controls">
                    ${b.status === 'pending' ? `
                      <button class="btn btn--warning btn--sm action-btn" data-action="call" data-id="${b.id}" style="min-width: 100px;">📢 Вызвать</button>
                    ` : ''}
                    ${b.status === 'waiting' || b.status === 'pending' ? `
                      <div class="flex gap-sm flex-wrap" style="flex: 1; justify-content: flex-end;">
                        <select class="form-select" style="padding:0.3rem 2rem 0.3rem 0.5rem;font-size:var(--font-size-xs);width: auto; flex: 1; min-width: 100px;" id="post-${b.id}">
                          <option value="">Пост...</option>
                          ${posts.map(p => {
                            const isBusy = busyPostIds.includes(String(p.id)) && currentPostId !== String(p.id);
                            return `<option value="${p.id}" ${currentPostId === String(p.id) ? 'selected' : ''} ${isBusy ? 'disabled' : ''}>${p.name} ${isBusy ? '(Занят)' : ''}</option>`;
                          }).join('')}
                        </select>
                        <select class="form-select" style="padding:0.3rem 2rem 0.3rem 0.5rem;font-size:var(--font-size-xs);width: auto; flex: 1; min-width: 100px;" id="washer-${b.id}">
                          <option value="">Мойщик...</option>
                          ${washers.map(w => {
                            const isBusy = busyWasherIds.includes(String(w.id)) && currentWasherId !== String(w.id);
                            return `<option value="${w.id}" ${currentWasherId === String(w.id) ? 'selected' : ''} ${isBusy ? 'disabled' : ''}>${w.name} ${isBusy ? '(Занят)' : ''}</option>`;
                          }).join('')}
                        </select>
                        <button class="btn btn--primary btn--sm action-btn" data-action="start" data-id="${b.id}">▶ Начать</button>
                      </div>
                    ` : ''}
                    ${b.status === 'in_progress' ? `
                      <button class="btn btn--success btn--sm action-btn" data-action="complete" data-id="${b.id}">✅ Завершить</button>
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

        // Date selector handler
        document.getElementById('queue-date-select')?.addEventListener('change', (e) => {
            window.location.hash = '#/admin/queue?date=' + e.target.value;
        });

        // Action handlers
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                try {
                    await handleAction(action, id);
                } catch (err) {
                    console.error('Action failed:', err);
                    showToast('Ошибка при выполнении действия', 'error');
                }
            });
        });
    }

    async function handleAction(action, bookingId) {
        const booking = await store.getById('bookings', bookingId);
        if (!booking) return;

        const userId = booking.user_id || booking.userId;

        if (action === 'call') {
            await store.update('bookings', bookingId, { status: 'waiting' });
            if (userId) {
                const client = await store.getById('users', userId);
                await notifyPostAssigned(booking, 'мойку', userId);
                showToast(`Клиент ${client?.car_number || client?.carNumber || client?.name || ''} вызван`, 'info');
            } else {
                showToast('Гость вызван', 'info');
            }
            await render();
        }

        if (action === 'start') {
            const postSelect = document.getElementById(`post-${bookingId}`);
            const washerSelect = document.getElementById(`washer-${bookingId}`);
            const postId = postSelect?.value;
            const washerId = washerSelect?.value;

            if (!postId || !washerId) {
                showToast('Выберите пост и мойщика', 'warning');
                return;
            }

            const post = (await store.getAll('posts') || []).find(p => String(p.id) === String(postId));
            const postName = post?.name || `Пост ${postId}`;
            await store.update('bookings', bookingId, {
                status: 'in_progress',
                postNumber: postId,
                washerId: washerId,
            });
            if (userId) {
                await notifyPostAssigned(booking, postName, userId);
            }
            showToast('Мойка начата!', 'success');
            await render();
        }

        if (action === 'complete') {
            await store.update('bookings', bookingId, { status: 'completed' });
            if (userId) {
                await notifyWashComplete(userId);
            }
            showToast('Мойка завершена!', 'success');
            await render();
        }
    }
}

function getStatusLabel(status) {
    return { pending: 'Ожидание', waiting: 'Вызван', in_progress: 'Моется', completed: 'Завершена', cancelled: 'Отменена' }[status] || status;
}

function getStatusBadge(status) {
    return { pending: 'primary', waiting: 'warning', in_progress: 'accent', completed: 'success', cancelled: 'danger' }[status] || 'glass';
}
