// === Login Page ===
import { login, register } from '../auth.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export async function renderLoginPage(app) {
    app.innerHTML = `
    <div class="login-page">
      <div class="glass-card glass-card--elevated login-card">
        <div class="login-card__header">
          <span class="login-card__logo">💧</span>
          <h1 class="login-card__title">Чисто и точка</h1>
          <p class="login-card__subtitle">Ваша любимая автомойка</p>
        </div>

        <div class="login-card__tabs">
          <button class="login-card__tab login-card__tab--active" id="tab-login">Вход</button>
          <button class="login-card__tab" id="tab-register">Регистрация</button>
        </div>

        <div id="login-form-container">
          <form class="login-card__form" id="login-form">
            <div class="form-group">
              <label class="form-label">Телефон</label>
              <input type="tel" class="form-input" id="login-input" placeholder="+7 900 000-00-00" required autocomplete="username">
            </div>
            <div class="form-group">
              <label class="form-label">Пароль (если есть)</label>
              <input type="password" class="form-input" id="password-input" placeholder="Введите пароль" autocomplete="current-password">
              <p class="text-muted" style="font-size: 0.75rem; margin-top: 4px;">Если вы регистрировались без пароля, оставьте пустым.</p>
            </div>
            <button type="submit" class="btn btn--primary btn--lg btn--full">Войти</button>
          </form>
        </div>

        <div id="register-form-container" style="display:none;">
          <form class="login-card__form" id="register-form">
            <div class="form-group">
              <label class="form-label">Телефон</label>
              <input type="tel" class="form-input" id="reg-phone" placeholder="+7 900 123-45-67" required>
            </div>
            <div class="form-group">
              <label class="form-label">Номер машины</label>
              <input type="text" class="form-input" id="reg-car" placeholder="А123БВ777" required>
            </div>
            <p class="text-muted" style="font-size: 0.8rem; text-align: center;">Пароль не требуется — вход по номеру телефона.</p>
            <button type="submit" class="btn btn--primary btn--lg btn--full">Зарегистрироваться</button>
          </form>
        </div>

        <div class="login-card__demo">
          <p class="login-card__demo-title">Дополнительно</p>
          <div class="login-card__demo-accounts">
            <a href="#/admin/login" class="btn btn--secondary btn--sm btn--full" style="text-decoration: none;">🛡️ Вход для персонала</a>
          </div>
        </div>
      </div>
    </div>
  `;

    // Tab switching
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');

    tabLogin.addEventListener('click', async () => {
        tabLogin.classList.add('login-card__tab--active');
        tabRegister.classList.remove('login-card__tab--active');
        loginContainer.style.display = 'block';
        registerContainer.style.display = 'none';
    });

    tabRegister.addEventListener('click', async () => {
        tabRegister.classList.add('login-card__tab--active');
        tabLogin.classList.remove('login-card__tab--active');
        registerContainer.style.display = 'block';
        loginContainer.style.display = 'none';
    });

    // Login form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const loginVal = document.getElementById('login-input').value.trim();
        const passVal = document.getElementById('password-input').value.trim() || 'NO_PASSWORD';
        const user = await login(loginVal, passVal);
        if (user) {
            showToast(`Добро пожаловать, ${user.name}!`, 'success');
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'owner') navigate('/owner');
            else navigate('/dashboard');
        } else {
            showToast('Пользователь не найден или неверный пароль', 'error');
        }
    });

    // Register form
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = document.getElementById('reg-phone').value.trim();
        const car = document.getElementById('reg-car').value.trim();

        const result = await register({
            login: phone,
            password: 'NO_PASSWORD',
            name: car,
            phone: phone,
            carNumber: car,
        });
        if (result.error) {
            showToast(result.error, 'error');
        } else {
            showToast('Регистрация успешна!', 'success');
            navigate('/dashboard');
        }
    });
}
