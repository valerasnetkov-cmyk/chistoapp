// === Admin Login Page ===
import { login } from '../auth.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export async function renderAdminLoginPage(app) {
    app.innerHTML = `
    <div class="login-page">
      <div class="glass-card glass-card--elevated login-card">
        <div class="login-card__header">
          <span class="login-card__logo">🛡️</span>
          <h1 class="login-card__title">Админ-панель</h1>
          <p class="login-card__subtitle">Вход для персонала</p>
        </div>

        <div id="login-form-container">
          <form class="login-card__form" id="admin-login-form">
            <div class="form-group">
              <label class="form-label">Логин</label>
              <input type="text" class="form-input" id="admin-login-input" placeholder="Введите логин" required autocomplete="username">
            </div>
            <div class="form-group">
              <label class="form-label">Пароль</label>
              <input type="password" class="form-input" id="admin-password-input" placeholder="Введите пароль" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn--primary btn--lg btn--full">Войти в систему</button>
          </form>
        </div>

        <div style="margin-top: var(--space-xl); text-align: center;">
          <a href="#/login" class="text-secondary" style="font-size: var(--font-size-sm);">← Вернуться к обычному входу</a>
        </div>
      </div>
    </div>
  `;

    // Login form
    document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const loginVal = document.getElementById('admin-login-input').value.trim();
        const passVal = document.getElementById('admin-password-input').value.trim();
        
        const user = await login(loginVal, passVal);
        
        if (user) {
            if (user.role === 'admin' || user.role === 'owner') {
                showToast(`Доступ разрешен. Добро пожаловать, ${user.name}!`, 'success');
                if (user.role === 'admin') navigate('/admin');
                else navigate('/owner');
            } else {
                showToast('Ошибка: У вас нет прав доступа к админ-панели', 'error');
                // Optional: logout if they shouldn't be logged in at all here
            }
        } else {
            showToast('Неверный логин или пароль', 'error');
        }
    });
}
