// === Notifications Module ===
import { store } from './store.js';
import { getCurrentUser } from './auth.js';

export async function getNotifications(userId) {
    const all = await store.getAll('notifications') || [];
    return all
        .filter(n => n && String(n.userId) === String(userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getUnreadCount(userId) {
    const all = await store.getAll('notifications') || [];
    return all
        .filter(n => n && String(n.userId) === String(userId) && !n.read)
        .length;
}

export async function markAsRead(notifId) {
    await store.update('notifications', notifId, { read: true });
}

export async function markAllAsRead(userId) {
    const all = await store.getAll('notifications') || [];
    const updated = all.map(n => {
        if (n && String(n.userId) === String(userId) && !n.read) {
            return { ...n, read: true };
        }
        return n;
    });
    await store.set('notifications', updated);
}

export async function createNotification({ userId, type, message, icon, data }) {
    return await store.add('notifications', {
        userId,
        type,
        message,
        icon: icon || getDefaultIcon(type),
        read: false,
        data: data || null
    });
}

function getDefaultIcon(type) {
    const icons = {
        reminder: '⏰',
        post_assigned: '📍',
        wash_complete: '✅',
        low_rating: '⚠️',
        bonus: '🎁',
        info: 'ℹ️',
    };
    return icons[type] || 'ℹ️';
}

// Send notifications for low ratings with full details
export async function notifyLowRating(booking, rating, userName) {
    const allUsers = await store.getAll('users') || [];
    const admins = allUsers.filter(u => u && u.role === 'admin');
    const owners = allUsers.filter(u => u && u.role === 'owner');
    
    const washers = await store.getAll('washers') || [];
    const washerId = booking.washer_id || booking.washerId;
    const washer = washerId ? washers.find(w => String(w.id) === String(washerId)) : null;
    
    const userId = booking.user_id || booking.userId;
    const client = allUsers.find(u => String(u.id) === String(userId));
    
    // Explicitly package data to avoid missing fields
    const details = {
        id: booking.id,
        bookingId: booking.id,
        clientPhone: client?.phone || booking.phone || 'нет',
        clientCar: client?.car_number || client?.carNumber || booking.car_number || booking.carNumber || 'не указан',
        bodyType: booking.body_type || booking.bodyType || 'не указан',
        rating: rating,
        review: booking.review || booking.comment || 'без комментария',
        comment: booking.review || booking.comment || 'без комментария',
        time: booking.time || '--:--',
        date: booking.date || new Date().toISOString(),
        washerName: washer?.name || 'не назначен',
        totalPrice: booking.total_price || booking.totalPrice || 0
    };

    const message = `Плохая оценка: ${rating}⭐ от ${details.clientCar}. Жмите для деталей.`;

    if (rating <= 3) {
        for (const admin of admins) {
            await createNotification({
                userId: admin.id,
                type: 'low_rating',
                message: message,
                icon: '⚠️',
                data: details
            });
        }
    }

    if (rating <= 2) {
        for (const owner of owners) {
            await createNotification({
                userId: owner.id,
                type: 'low_rating',
                message: message,
                icon: '🔴',
                data: details
            });
        }
    }
}

// Send reminder notification
export async function sendReminder(booking, user) {
    await createNotification({
        userId: user.id,
        type: 'reminder',
        message: `Напоминаем о записи на мойку ${booking.date} в ${booking.time}`,
        icon: '⏰',
    });
}

// Send post assignment notification
export async function notifyPostAssigned(booking, postName, userId) {
    await createNotification({
        userId: userId,
        type: 'post_assigned',
        message: `Ваша машина ожидается на ${postName}. Пожалуйста, подъезжайте!`,
        icon: '📍',
    });
}

// Send wash complete notification
export async function notifyWashComplete(userId) {
    await createNotification({
        userId: userId,
        type: 'wash_complete',
        message: 'Мойка завершена! Можете забрать свой автомобиль. Не забудьте оценить качество!',
        icon: '✅',
    });
}
