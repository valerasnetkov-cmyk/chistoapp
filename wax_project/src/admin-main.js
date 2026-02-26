// === Admin Entry Point ===
import './styles/index.css';
import { store } from './store.js';
import { route, initRouter, navigate } from './router.js';
import { getCurrentUser } from './auth.js';

// Admin Pages
import { renderAdminLoginPage } from './pages/admin-login.js';
import { renderAdminDashboard } from './pages/admin/dashboard.js';
import { renderQueuePage } from './pages/admin/queue.js';
import { renderAdminBookingPage } from './pages/admin/booking.js';

// Owner Pages
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
}

// Redirect logic for admin entry
async function checkAdminAuth() {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
        return false;
    }
    return true;
}

// Register routes
route('/', async (app) => {
    if (await checkAdminAuth()) {
        const user = await getCurrentUser();
        if (user.role === 'owner') await renderOwnerDashboard(app);
        else await renderAdminDashboard(app);
    } else {
        await renderAdminLoginPage(app);
    }
});

route('/login', async (app) => await renderAdminLoginPage(app));
route('/admin', async (app) => await renderAdminDashboard(app));
route('/admin/queue', async (app) => await renderQueuePage(app));
route('/admin/booking', async (app) => await renderAdminBookingPage(app));

route('/owner', async (app) => await renderOwnerDashboard(app));
route('/owner/services', async (app) => await renderOwnerServicesPage(app));
route('/owner/staff', async (app) => await renderOwnerStaffPage(app));
route('/owner/reports', async (app) => await renderOwnerReportsPage(app));

// Start router
initRouter();
