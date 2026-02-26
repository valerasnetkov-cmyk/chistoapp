// === SPA Hash Router ===
import { isLoggedIn, getCurrentUser } from './auth.js';

const routes = {};
let currentCleanup = null;

// Client routes that don't require auth
const publicRoutes = ['/', '/dashboard', '/booking', '/history', '/loyalty', '/contacts', '/tips', '/profile'];

export function route(path, handler, options = {}) {
    routes[path] = { handler, ...options };
}

export function navigate(path) {
    window.location.hash = '#' + path;
}

export function getCurrentPath() {
    return window.location.hash.slice(1) || '/';
}

async function handleRoute() {
    const path = getCurrentPath();
    const app = document.getElementById('app');

    // Cleanup previous page
    if (currentCleanup && typeof currentCleanup === 'function') {
        currentCleanup();
        currentCleanup = null;
    }

    const user = await getCurrentUser();
    
    // Auto-redirect guest from login page if already recognized
    if (path === '/login' && user && user.role === 'client') {
        navigate('/dashboard');
        return;
    }

    // Admin/Owner routes require auth
    if (path.startsWith('/admin') || path.startsWith('/owner')) {
        // Special case for admin login page itself
        if (path === '/admin/login') {
            // If already logged in as admin/owner, redirect to dashboard
            if (user && (user.role === 'admin' || user.role === 'owner')) {
                if (user.role === 'admin') navigate('/admin');
                else navigate('/owner');
                return;
            }
        } else {
            if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
                navigate('/admin/login');
                return;
            }
        }
    }

    // If logged in admin/owner visits login page, redirect to their dashboard
    if (path === '/login' && user) {
        if (user.role === 'admin') { navigate('/admin'); return; }
        if (user.role === 'owner') { navigate('/owner'); return; }
    }

    // Find matching route
    const routeEntry = routes[path];
    if (routeEntry) {
        const result = await routeEntry.handler(app);
        if (typeof result === 'function') {
            currentCleanup = result;
        }
    } else {
        // 404 — redirect to home or role dashboard
        if (user) {
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'owner') navigate('/owner');
            else navigate('/');
        } else {
            navigate('/');
        }
    }
}

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}
