// === Main Entry Point (TG Integrated) ===
import './styles/index.css';
import { store } from './store.js';
import { route, initRouter, navigate, getCurrentPath } from './router.js';
import { getCurrentUser } from './auth.js';

// Pages — Client
import { renderClientDashboard } from './pages/client/dashboard.js';
import { renderBookingPage } from './pages/client/booking.js';
import { renderHistoryPage } from './pages/client/history.js';
import { renderLoyaltyPage } from './pages/client/loyalty.js';
import { renderContactsPage } from './pages/client/contacts.js';
import { renderProfilePage } from './pages/client/profile.js';
import { renderTipsPage } from './pages/client/tips.js';

// Pages — Auth
import { renderLoginPage } from './pages/login.js';
import { renderAdminLoginPage } from './pages/admin-login.js';

// Pages — Admin
import { renderAdminDashboard } from './pages/admin/dashboard.js';
import { renderQueuePage } from './pages/admin/queue.js';
import { renderAdminBookingPage } from './pages/admin/booking.js';

// Pages — Owner
import { renderOwnerDashboard } from './pages/owner/dashboard.js';
import { renderOwnerServicesPage } from './pages/owner/services.js';
import { renderOwnerStaffPage } from './pages/owner/staff.js';
import { renderOwnerReportsPage } from './pages/owner/reports.js';

const tg = window.Telegram?.WebApp;

// Initialize default data
store.initDefaults();

// TG Setup
if (tg) {
    tg.ready();
    tg.expand();
    
    // Listen for BackButton
    tg.BackButton.onClick(async () => {
        const path = await getCurrentPath();
        if (path !== '/' && path !== '/dashboard') {
            await navigate('/');
        }
    });
}

// Router hook for TG BackButton
window.addEventListener('hashchange', async () => {
    if (tg) {
        const path = await getCurrentPath();
        if (path === '/' || path === '/dashboard' || path === '/admin' || path === '/owner') {
            tg.BackButton.hide();
        } else {
            tg.BackButton.show();
        }
    }
});

// Ensure guest user exists for non-TG environments
async function ensureGuestUser() {
    let user = await getCurrentUser();
    
    // If we have a user but they are purely local (not in DB yet)
    if (user && isNaN(parseInt(user.id))) {
        // Attempt to register on server
        const registered = await store.apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                login: user.login || user.id,
                password: 'NO_PASSWORD',
                name: user.name || 'Клиент',
                phone: user.phone || '',
                car_number: user.carNumber || user.car_number || ''
            })
        });
        
        // Refresh user to get numeric ID
        const fresh = await store.apiFetch(`/users/${user.login || user.id}`);
        if (fresh) {
            await store.set('currentUser', fresh);
            return fresh;
        }
    }

    if (!user) {
        let guestId = localStorage.getItem('cit_guestId');
        if (!guestId) {
            guestId = 'guest_' + (store.uid());
            localStorage.setItem('cit_guestId', guestId);
        }
        
        const guestUser = {
            id: guestId,
            login: guestId,
            password: '',
            name: 'Гость',
            phone: '',
            carNumber: '',
            role: 'client',
            bonus_balance: 0,
            cashback_percent: 5,
        };
        
        // Register on server
        await store.apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                login: guestId,
                password: 'NO_PASSWORD',
                name: 'Гость',
                phone: '',
                car_number: ''
            })
        });

        // Fetch to get DB ID
        const dbUser = await store.apiFetch(`/users/${guestId}`);
        if (dbUser) {
            await store.set('currentUser', dbUser);
            return dbUser;
        }

        await store.set('currentUser', guestUser);
        return guestUser;
    }
    return user;
}

// Register routes — Client (no auth needed)
route('/', async (app) => {
    await ensureGuestUser();
    await renderClientDashboard(app);
});
route('/dashboard', async (app) => {
    await ensureGuestUser();
    await renderClientDashboard(app);
});
route('/booking', async (app) => {
    await ensureGuestUser();
    await renderBookingPage(app);
});
route('/history', async (app) => {
    await ensureGuestUser();
    await renderHistoryPage(app);
});
route('/loyalty', async (app) => {
    await ensureGuestUser();
    await renderLoyaltyPage(app);
});
route('/contacts', async (app) => {
    await ensureGuestUser();
    await renderContactsPage(app);
});
route('/tips', async (app) => {
    await ensureGuestUser();
    await renderTipsPage(app);
});
route('/profile', async (app) => {
    await ensureGuestUser();
    await renderProfilePage(app);
});

// Auth page
route('/login', async (app) => {
    await renderLoginPage(app);
});

// Separate Admin Login page
route('/admin/login', async (app) => {
    await renderAdminLoginPage(app);
});

// Admin routes (require admin role)
route('/admin', async (app) => await renderAdminDashboard(app));
route('/admin/queue', async (app) => await renderQueuePage(app));
route('/admin/booking', async (app) => await renderAdminBookingPage(app));

// Owner routes (require owner role)
route('/owner', async (app) => await renderOwnerDashboard(app));
route('/owner/services', async (app) => await renderOwnerServicesPage(app));
route('/owner/staff', async (app) => await renderOwnerStaffPage(app));
route('/owner/reports', async (app) => await renderOwnerReportsPage(app));

// Init router
initRouter();
