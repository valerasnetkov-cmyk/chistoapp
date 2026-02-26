// === Data Store (API Integrated) ===
import { getCarWashId } from './config.js';

const API_BASE = '/api'; // Use relative path for VPS proxy

async function apiFetch(endpoint, options = {}) {
    const washId = getCarWashId();
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-Car-Wash-Id': washId,
                ...options.headers,
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 404) return null;
            throw new Error(errorData.error || `API Error: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

// LocalStorage fallbacks for simple keys
async function getLocal(key) {
    try {
        const data = localStorage.getItem('cit_' + key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

async function setLocal(key, value) {
    localStorage.setItem('cit_' + key, JSON.stringify(value));
}

// === API CRUD Helpers ===
async function getAll(key) {
    let results = null;
    if (key === 'services') results = await apiFetch('/services');
    else if (key === 'washers') results = await apiFetch('/washers');
    else if (key === 'bookings') results = await apiFetch('/bookings');
    else if (key === 'posts') results = await apiFetch('/posts');
    else if (key === 'notifications') results = await apiFetch('/notifications');
    else if (key === 'bonusHistory') results = await apiFetch('/bonusHistory');
    else if (key === 'users') {
        const dbUsers = await apiFetch('/users') || [];
        const localUsers = await getLocal('users') || [];
        const mergedMap = new Map();
        dbUsers.forEach(u => mergedMap.set(String(u.id), u));
        localUsers.forEach(u => mergedMap.set(String(u.id), u));
        return Array.from(mergedMap.values());
    } 
    else results = await getLocal(key);
    
    // Default fallback for posts if API fails
    if (key === 'posts' && (!results || results.length === 0)) {
        return [
            { id: 1, name: 'Пост 1' },
            { id: 2, name: 'Пост 2' },
            { id: 3, name: 'Пост 3' }
        ];
    }

    // Map DB fields to camelCase for frontend consistency
    if (key === 'notifications' && Array.isArray(results)) {
        return results.map(n => ({
            ...n,
            userId: n.user_id,
            read: !!n.is_read,
            createdAt: n.created_at,
            data: n.data ? (typeof n.data === 'string' ? JSON.parse(n.data) : n.data) : null
        }));
    }

    return Array.isArray(results) ? results : [];
}

async function getById(key, id) {
    if (!id) return null;

    if (key === 'users') {
        const user = await apiFetch(`/users/${id}`);
        if (user) return user;
    }
    
    const items = await getAll(key);
    return items.find(item => String(item.id) === String(id)) || null;
}

async function add(key, item) {
    if (key === 'bookings') return await apiFetch('/bookings', { method: 'POST', body: JSON.stringify(item) });
    if (key === 'services') return await apiFetch('/services', { method: 'POST', body: JSON.stringify(item) });
    if (key === 'notifications') return await apiFetch('/notifications', { method: 'POST', body: JSON.stringify(item) });
    if (key === 'washers') return await apiFetch('/washers', { method: 'POST', body: JSON.stringify(item) });
    if (key === 'bonusHistory') return await apiFetch('/bonusHistory', { method: 'POST', body: JSON.stringify(item) });
    if (key === 'users') {
        const result = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(item) });
        if (result && result.success) return result;
        
        const items = await getLocal(key) || [];
        const newItem = { id: uid(), ...item, createdAt: new Date().toISOString() };
        items.push(newItem);
        await setLocal(key, items);
        return newItem;
    }
    
    const items = await getAll(key);
    const newItem = { id: uid(), ...item, createdAt: new Date().toISOString() };
    items.push(newItem);
    await setLocal(key, items);
    return newItem;
}

async function update(key, id, updates) {
    if (key === 'bookings') return await apiFetch(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    if (key === 'notifications') return await apiFetch(`/notifications/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    if (key === 'washers') return await apiFetch(`/washers/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    if (key === 'users') {
        const res = await apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
        if (res) return res;
        
        const items = await getLocal(key) || [];
        const idx = items.findIndex(item => String(item.id) === String(id));
        if (idx !== -1) {
            items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
            await setLocal(key, items);
            return items[idx];
        }
    }

    const items = await getAll(key);
    const idx = items.findIndex(item => String(item.id) === String(id));
    if (idx === -1) return null;
    const updated = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    items[idx] = updated;
    await setLocal(key, items);
    return updated;
}

async function remove(key, id) {
    if (key === 'services') return await apiFetch(`/services/${id}`, { method: 'DELETE' });
    if (key === 'washers') return await apiFetch(`/washers/${id}`, { method: 'DELETE' });
    
    const items = await getAll(key);
    const filtered = items.filter(item => String(item.id) !== String(id));
    await setLocal(key, filtered);
}

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getTodayStr() {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - (offset * 60 * 1000));
    return local.toISOString().split('T')[0];
}

function initDefaults() {
    console.log('App initialized with server-side data.');
}

export const store = {
    get: getLocal,
    set: setLocal,
    uid,
    getAll,
    getById,
    add,
    update,
    remove,
    getTodayStr,
    initDefaults,
    apiFetch // Export for auth module
};
