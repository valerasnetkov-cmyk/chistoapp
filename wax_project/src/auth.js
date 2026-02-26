// === Auth Module (TG + API Integrated) ===
import { store } from './store.js';

const tg = window.Telegram?.WebApp;
const OWNER_TG_ID = 111062181; // Valera's ID

export async function login(loginStr, password) {
    const data = await store.apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login: loginStr, password })
    });
    
    if (data && data.success) {
        await store.set('currentUser', data.user);
        localStorage.setItem('cit_auth_token', data.token || 'logged_in');
        localStorage.setItem('cit_persistent_user', JSON.stringify(data.user));
        return data.user;
    }
    return null;
}

export async function register({ login: loginStr, password, name, phone, carNumber }) {
    const displayName = name || phone || carNumber || 'Клиент';
    
    const data = await store.apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
            login: loginStr, 
            password, 
            name: displayName, 
            phone, 
            car_number: carNumber 
        })
    });
    
    if (data && data.success) {
        return await login(loginStr, password);
    }
    return { error: 'Ошибка регистрации' };
}

export function logout() {
    localStorage.removeItem('cit_currentUser');
    localStorage.removeItem('cit_auth_token');
    localStorage.removeItem('cit_persistent_user');
}

export async function getCurrentUser() {
    // 1. Try manual session first (highest priority)
    const localUser = await store.get('currentUser');
    if (localUser) {
        // Refresh from server if it's a numeric ID
        if (!isNaN(parseInt(localUser.id))) {
            const freshUser = await store.apiFetch(`/users/${localUser.id}`);
            if (freshUser) {
                await store.set('currentUser', freshUser);
                return freshUser;
            }
        }
        return localUser;
    }

    // 2. Telegram User
    if (tg?.initDataUnsafe?.user) {
        const tgUser = tg.initDataUnsafe.user;
        const login = `tg_${tgUser.id}`;
        // Try to fetch from server by login
        const dbUser = await store.apiFetch(`/users/${login}`);
        if (dbUser) {
            await store.set('currentUser', dbUser);
            return dbUser;
        }

        return {
            id: login,
            login: login,
            name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
            role: tgUser.id === OWNER_TG_ID ? 'owner' : 'client',
            bonus_balance: 0,
            cashback_percent: 5,
            tg_id: tgUser.id
        };
    }
    
    // 3. Persistent storage
    const persistent = localStorage.getItem('cit_persistent_user');
    if (persistent) {
        const user = JSON.parse(persistent);
        await store.set('currentUser', user);
        return user;
    }
    
    return null;
}

export async function updateCurrentUser(updates) {
    const user = await getCurrentUser();
    if (!user) return null;
    
    const updated = await store.update('users', user.id, updates);
    if (updated) {
        await store.set('currentUser', updated);
        localStorage.setItem('cit_persistent_user', JSON.stringify(updated));
    }
    return updated;
}

export async function isLoggedIn() {
    return !!(await getCurrentUser());
}

export async function hasRole(role) {
    const user = await getCurrentUser();
    return user && user.role === role;
}

export async function requireRole(...roles) {
    const user = await getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role);
}
