// === Header Component ===
import { getCurrentUser, logout } from '../auth.js';
import { getUnreadCount, getNotifications, markAllAsRead, markAsRead } from '../notifications.js';
import { navigate, getCurrentPath } from '../router.js';
import { showModal } from './modal.js';
import { store } from '../store.js';

let notifPanelOpen = false;

export async function renderHeader() {
    const user = await getCurrentUser();
    if (!user) return '';

    const unread = await getUnreadCount(user.id);
    const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';

    let navLinks = '';
    if (user.role === 'client') {
        navLinks = `
      <a href="#/dashboard" class="app-header__link" data-route="/dashboard">🏠 Главная</a>
      <a href="#/booking" class="app-header__link" data-route="/booking">📝 Запись</a>
      <a href="#/history" class="app-header__link" data-route="/history">📋 История</a>
      <a href="#/loyalty" class="app-header__link" data-route="/loyalty">🎁 Бонусы</a>
      <a href="#/contacts" class="app-header__link" data-route="/contacts">📞 Контакты</a>
      <a href="#/tips" class="app-header__link" data-route="/tips">💡 Советы</a>
    `;
    } else if (user.role === 'admin') {
        navLinks = `
      <a href="#/admin" class="app-header__link" data-route="/admin">🏠 Обзор</a>
      <a href="#/admin/queue" class="app-header__link" data-route="/admin/queue">📋 Очередь</a>
      <a href="#/admin/booking" class="app-header__link" data-route="/admin/booking">📝 Запись</a>
    `;
    } else if (user.role === 'owner') {
        navLinks = `
      <a href="#/owner" class="app-header__link" data-route="/owner">🏠 Обзор</a>
      <a href="#/owner/services" class="app-header__link" data-route="/owner/services">🛠️ Услуги</a>
      <a href="#/owner/staff" class="app-header__link" data-route="/owner/staff">👥 Мойщики</a>
      <a href="#/owner/reports" class="app-header__link" data-route="/owner/reports">📊 Отчёты</a>
    `;
    }

    return `
    <header class="app-header">
      <a href="#/" class="app-header__logo">
        <span class="app-header__logo-icon">💧</span>
        Чисто и точка
      </a>
      <button class="app-header__menu-toggle" id="menu-toggle">☰</button>
      <nav class="app-header__nav" id="main-nav">
        ${navLinks}
      </nav>
      <div class="app-header__actions">
        <button class="app-header__notif-btn" id="notif-btn" title="Уведомления">
          🔔
          ${unread > 0 ? `<span class="notification-badge">${unread}</span>` : ''}
        </button>
        <div class="app-header__user" id="user-menu">
          <div class="app-header__avatar">${initials}</div>
          <span class="app-header__username">${user.name ? user.name.split(' ')[0] : 'Гость'}</span>
        </div>
      </div>
    </header>
  `;
}

export async function initHeaderEvents() {
    const user = await getCurrentUser();
    if (!user) return;

    const currentPath = await getCurrentPath();
    document.querySelectorAll('.app-header__link').forEach(link => {
        const route = link.dataset.route;
        if (route === currentPath) {
            link.classList.add('app-header__link--active');
        }
    });

    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('app-header__nav--open');
        });
    }

    const notifBtn = document.getElementById('notif-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await toggleNotificationPanel(user);
        });
    }

    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', async () => {
            if (user.role === 'client') {
                await navigate('/profile');
            } else {
                logout();
                await navigate('/login');
            }
        });
    }
}

async function toggleNotificationPanel(user) {
    const existing = document.querySelector('.notifications-panel');
    if (existing) {
        existing.remove();
        notifPanelOpen = false;
        return;
    }

    const notifs = await getNotifications(user.id);
    const panel = document.createElement('div');
    panel.className = 'notifications-panel';
    panel.style.background = '#ffffff'; 
    panel.innerHTML = `
    <div class="notifications-panel__header" style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 16px; font-weight: 700; margin: 0;">Уведомления</h3>
      <div style="display:flex; gap: 8px;">
        <button class="btn btn--ghost btn--sm" id="mark-all-read" style="font-size: 12px; padding: 4px 8px;">Прочитать все</button>
        <button class="btn btn--ghost btn--sm" id="close-notif" style="font-size: 16px; padding: 4px 8px;">✕</button>
      </div>
    </div>
    <div class="notifications-panel__list" style="display: flex; flex-direction: column;">
        ${notifs.length === 0 ? `
          <div class="empty-state" style="padding: 40px 20px; text-align: center; color: #94a3b8;">
            <div style="font-size: 32px; margin-bottom: 8px;">🔔</div>
            <div style="font-weight: 600;">Нет уведомлений</div>
          </div>
        ` : notifs.map(n => `
          <button class="notification-item ${n.read ? '' : 'notification-item--unread'}" 
               data-id="${n.id}" 
               style="width: 100%; text-align: left; background: ${n.read ? '#fff' : '#f0f7ff'}; border: none; border-bottom: 1px solid #f1f5f9; padding: 12px 16px; display: flex; gap: 12px; cursor: pointer; position: relative;">
            <span style="font-size: 20px; flex-shrink: 0;">${n.icon || 'ℹ️'}</span>
            <div style="flex: 1; pointer-events: none;">
              <div style="font-size: 14px; line-height: 1.4; color: #1e293b; margin-bottom: 4px;">${n.message}</div>
              <div style="font-size: 11px; color: #94a3b8;">${formatTimeAgo(n.createdAt)}</div>
            </div>
            ${(n.data || n.type === 'wash_complete') ? '<span style="color: #2563eb; align-self: center; font-weight: bold;">→</span>' : ''}
          </button>
        `).join('')}
    </div>
  `;

    document.body.appendChild(panel);
    notifPanelOpen = true;

    panel.querySelectorAll('.notification-item').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const id = btn.dataset.id;
            const notif = notifs.find(n => String(n.id) === String(id));
            
            if (notif) {
                await markAsRead(notif.id);
                
                // Handle different types
                if (notif.type === 'low_rating' && notif.data) {
                    const bId = notif.data.bookingId || notif.data.id;
                    if (bId) {
                        const freshBooking = await store.getById('bookings', bId);
                        await showRatingDetails(freshBooking || notif.data);
                    } else {
                        await showRatingDetails(notif.data);
                    }
                } else if (notif.type === 'wash_complete') {
                    await navigate('/history');
                }
                
                panel.remove();
                notifPanelOpen = false;
                
                const unread = await getUnreadCount(user.id);
                const badge = document.querySelector('.notification-badge');
                if (badge) {
                    if (unread > 0) badge.textContent = unread;
                    else badge.remove();
                }
            }
        });
    });

    document.getElementById('close-notif')?.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.remove();
        notifPanelOpen = false;
    });

    document.getElementById('mark-all-read')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await markAllAsRead(user.id);
        panel.remove();
        notifPanelOpen = false;
        const badge = document.querySelector('.notification-badge');
        if (badge) badge.remove();
    });

    const outsideHandler = (e) => {
        if (!panel.contains(e.target) && !e.target.closest('#notif-btn')) {
            panel.remove();
            notifPanelOpen = false;
            document.removeEventListener('click', outsideHandler);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', outsideHandler);
    }, 100);
}

async function showRatingDetails(b) {
    const rating = b.rating || 0;
    const comment = b.review || b.comment || 'без комментария';
    const totalPrice = b.total_price || b.totalPrice || 0;
    
    const userId = b.user_id || b.userId;
    const washerId = b.washer_id || b.washerId;
    
    // Fetch User Info
    let client = null;
    if (userId) {
        client = await store.getById('users', userId);
    }
    
    // Fetch Washer Info
    const washers = await store.getAll('washers');
    const washer = washerId ? washers.find(w => String(w.id) === String(washerId)) : null;

    const car = b.car_number || b.carNumber || client?.car_number || client?.carNumber || 'не указан';
    const phone = b.phone || b.clientPhone || client?.phone || 'нет';
    
    const bodyLabels = { sedan: 'Седан', suv: 'Внедорожник', crossover: 'Кроссовер', minivan: 'Минивэн' };
    const displayBody = bodyLabels[b.body_type || b.bodyType] || b.body_type || b.bodyType || 'не указан';
    
    let displayDate = 'неизвестно';
    try {
        if (b.date) {
            const d = new Date(b.date);
            displayDate = isNaN(d.getTime()) ? b.date : d.toLocaleDateString('ru-RU');
        }
    } catch(e) {}

    await showModal({
        title: 'Детали мойки 🚿',
        content: `
            <div class="flex flex-col gap-lg">
                <div class="glass-card glass-card--static" style="background: rgba(239, 68, 68, 0.05); border-color: var(--color-danger-100); padding: 1.5rem;">
                    <div style="font-size: 2rem; text-align: center; margin-bottom: 1rem;">${'⭐'.repeat(rating)}</div>
                    <div style="font-weight: 600; text-align: center; margin-bottom: 0.5rem;">Отзыв клиента: ${client?.name || 'Гость'}</div>
                    <div style="font-style: italic; text-align: center; color: #475569; line-height: 1.4;">"${comment}"</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 2px;">Машина</div>
                        <div style="font-weight: 800; font-size: 1.1rem; color: #2563eb;">${car}</div>
                    </div>
                    <div>
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 2px;">Телефон</div>
                        <div style="font-weight: 600;">${phone}</div>
                    </div>
                    <div>
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 2px;">Тип кузова</div>
                        <div style="text-transform: capitalize;">${displayBody}</div>
                    </div>
                    <div>
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 2px;">Мойщик</div>
                        <div style="font-weight: 600;">${washer?.name || 'не назначен'}</div>
                    </div>
                    <div style="grid-column: span 2;">
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 2px;">Дата и время</div>
                        <div>${displayDate} в ${b.time || '--:--'}</div>
                    </div>
                    <div>
                        <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; margin-bottom: 2px;">Сумма</div>
                        <div style="font-weight: 700; color: #10b981;">${totalPrice} ₽</div>
                    </div>
                </div>
            </div>
        `,
        footer: `
            <button class="btn btn--primary btn--full" id="close-rating-modal">Закрыть</button>
        `
    }).then(({modal, close}) => {
        document.getElementById('close-rating-modal')?.addEventListener('click', close);
    });
}

function formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
    if (diff < 172800) return 'вчера';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}
