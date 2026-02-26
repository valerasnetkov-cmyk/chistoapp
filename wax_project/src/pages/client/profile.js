// === Profile Page ===
import { getCurrentUser, updateCurrentUser, logout } from '../../auth.js';
import { renderHeader, initHeaderEvents } from '../../components/header.js';
import { showToast } from '../../components/toast.js';
import { navigate } from '../../router.js';

export async function renderProfilePage(app) {
    const user = await getCurrentUser();
    const displayName = user.name || user.phone || user.carNumber || user.car_number || 'Гость';

    app.innerHTML = `
    ${await renderHeader()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">👤 Профиль</h1>
        <p class="page-header__subtitle">Управление вашими данными</p>
      </div>

      <div style="max-width:560px;">
        <div class="glass-card glass-card--elevated mb-2xl">
          <div class="flex items-center gap-xl mb-2xl" style="padding-bottom:var(--space-xl);border-bottom:1px solid var(--color-divider);">
            <div style="width:72px;height:72px;border-radius:var(--radius-full);background:var(--gradient-primary);color:white;display:flex;align-items:center;justify-content:center;font-size:var(--font-size-2xl);font-weight:800;">
              ${displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h2 style="font-size:var(--font-size-xl);">${displayName}</h2>
              <span class="badge badge--primary">Клиент</span>
            </div>
          </div>

          <form id="profile-form" class="flex flex-col gap-xl">
            <div class="form-group">
              <label class="form-label">Имя (необязательно)</label>
              <input type="text" class="form-input" id="profile-name" value="${user.name || ''}" placeholder="Как к вам обращаться?">
            </div>
            <div class="form-group">
              <label class="form-label">Телефон</label>
              <input type="tel" class="form-input" id="profile-phone" value="${user.phone || ''}" required placeholder="+7 900 000-00-00">
            </div>
            <div class="form-group">
              <label class="form-label">Номер машины</label>
              <input type="text" class="form-input" id="profile-car" value="${user.carNumber || user.car_number || ''}" placeholder="А000АА777" required>
            </div>
            <button type="submit" class="btn btn--primary btn--lg">Сохранить изменения</button>
          </form>
        </div>

        <div class="glass-card glass-card--static">
          <h3 style="margin-bottom:var(--space-lg);">Действия</h3>
          <button class="btn btn--danger btn--full" id="logout-btn">Выйти из аккаунта</button>
        </div>
      </div>
    </main>
  `;

    initHeaderEvents();

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await updateCurrentUser({
                name: document.getElementById('profile-name').value.trim(),
                phone: document.getElementById('profile-phone').value.trim(),
                carNumber: document.getElementById('profile-car').value.trim(),
            });
            showToast('Профиль обновлён!', 'success');
            // Re-render current page
            await renderProfilePage(app);
        } catch (err) {
            console.error(err);
            showToast('Ошибка при сохранении', 'error');
        }
    });

    document.getElementById('logout-btn').addEventListener('click', async () => {
        logout();
        navigate('/login');
        showToast('Вы вышли из аккаунта', 'info');
    });
}
