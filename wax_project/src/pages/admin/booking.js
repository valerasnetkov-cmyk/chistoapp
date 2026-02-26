// === Admin Booking Page (manual client booking) ===
import { store } from '../../store.js';
import { renderHeader, initHeaderEvents } from '../../components/header.js';
import { showToast } from '../../components/toast.js';
import { navigate } from '../../router.js';
import { createNotification } from '../../notifications.js';

export async function renderAdminBookingPage(app) {
  const services = (await store.getAll('services') || []).filter(s => s && s.active);
  const bodyTypes = (await store.get('bodyTypeMultipliers') || {
    sedan: { label: 'Седан', multiplier: 1 },
    suv: { label: 'Внедорожник', multiplier: 1.3 },
    crossover: { label: 'Кроссовер', multiplier: 1.2 },
    minivan: { label: 'Минивэн', multiplier: 1.5 }
  });
  const users = (await store.getAll('users') || []).filter(u => u && u.role === 'client');
  const allBookings = (await store.getAll('bookings') || []);

  const todayStr = store.getTodayStr();

  app.innerHTML = `
    ${await renderHeader()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">📝 Записать клиента</h1>
        <p class="page-header__subtitle">Выберите дату и время записи</p>
      </div>

      <div style="max-width:640px;">
        <div class="glass-card glass-card--elevated">
          <form id="admin-booking-form" class="flex flex-col gap-xl">

            <!-- Client selection -->
            <div class="form-group">
              <label class="form-label">Клиент</label>
              <select class="form-select" id="ab-client">
                <option value="">Выберите клиента...</option>
                ${users.map(u => `<option value="${u.id}">${u.name || u.phone || 'Без имени'} (${u.carNumber || u.car_number || '???'})</option>`).join('')}
              </select>
            </div>

            <!-- Or new client -->
            <div style="text-align:center;">
              <span class="text-muted" style="font-size:var(--font-size-sm);">или данные нового</span>
            </div>
            
            <div class="glass-card glass-card--static" style="padding:var(--space-lg);">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Телефон</label>
                  <input type="tel" class="form-input" id="ab-new-phone" placeholder="+7...">
                </div>
                <div class="form-group">
                  <label class="form-label">Номер машины</label>
                  <input type="text" class="form-input" id="ab-new-car" placeholder="А000АА000">
                </div>
              </div>
            </div>

            <!-- Body Type -->
            <div class="form-group">
              <label class="form-label">Тип кузова</label>
              <select class="form-select" id="ab-bodytype" required>
                ${Object.entries(bodyTypes).map(([key, bt]) => `
                  <option value="${key}">${bt.label}</option>
                `).join('')}
              </select>
            </div>

            <!-- Services -->
            <div class="form-group">
              <label class="form-label">Услуги</label>
              <div class="flex flex-col gap-sm">
                ${services.map(s => `
                  <label class="service-option">
                    <div class="service-option__info">
                      <input type="checkbox" name="ab-services" value="${s.id}" style="accent-color:var(--color-primary);">
                      <span class="service-option__name">${s.icon || '🧼'} ${s.name}</span>
                    </div>
                    <span class="service-option__price">${s.price} ₽</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Date & Time Selection -->
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Дата</label>
                <select class="form-select" id="ab-date" required>
                  ${generateDateOptions().map(d => `<option value="${d.value}">${d.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Время</label>
                <select class="form-select" id="ab-time" required>
                  <option value="">Выберите время...</option>
                  ${(generateAvailableSlots(todayStr, allBookings)).map(t => `
                    <option value="${t.time}" ${t.disabled ? 'disabled' : ''}>
                      ${t.time} ${t.disabled ? '(Мест нет)' : ''}
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <button type="submit" class="btn btn--primary btn--lg btn--full">Создать запись</button>
          </form>
        </div>
      </div>
    </main>
  `;

  initHeaderEvents();

  const dateSelect = document.getElementById('ab-date');
  const timeSelect = document.getElementById('ab-time');

  dateSelect.addEventListener('change', () => {
    const slots = generateAvailableSlots(dateSelect.value, allBookings);
    timeSelect.innerHTML = '<option value="">Выберите время...</option>' + 
      slots.map(t => `
        <option value="${t.time}" ${t.disabled ? 'disabled' : ''}>
          ${t.time} ${t.disabled ? '(Мест нет)' : ''}
        </option>
      `).join('');
  });

  document.getElementById('admin-booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    let userId = document.getElementById('ab-client').value;
    const phone = document.getElementById('ab-new-phone').value.trim();
    const car = document.getElementById('ab-new-car').value.trim();

    if (!userId) {
      if (!phone || !car) {
        showToast('Выберите клиента или введите телефон и номер машины', 'warning');
        return;
      }

      const newUser = await store.add('users', {
        login: phone,
        password: '1234_NO_PASSWORD',
        name: car, 
        phone,
        carNumber: car,
        role: 'client',
        bonusBalance: 0,
        cashbackPercent: 5,
      });
      userId = newUser.id;
    }

    const selectedServices = [];
    document.querySelectorAll('input[name="ab-services"]:checked').forEach(cb => {
      selectedServices.push(cb.value);
    });

    if (selectedServices.length === 0) {
      showToast('Выберите хотя бы одну услугу', 'warning');
      return;
    }

    const date = dateSelect.value;
    const time = timeSelect.value;
    if (!time) {
      showToast('Выберите время записи', 'warning');
      return;
    }

    const bodyType = document.getElementById('ab-bodytype').value;
    const multiplier = bodyTypes[bodyType]?.multiplier || 1;
    const totalPrice = selectedServices.reduce((sum, id) => {
      const svc = services.find(s => String(s.id) === String(id));
      return sum + (svc ? Math.round(svc.price * multiplier) : 0);
    }, 0);

    // Final check for capacity
    const currentDayBookings = allBookings.filter(b => {
        const bDate = b.date.includes('T') ? b.date.split('T')[0] : b.date;
        return bDate === date && b.time === time && b.status !== 'cancelled';
    });

    if (currentDayBookings.length >= 3) {
        showToast('К сожалению, на это время уже записано 3 клиента', 'error');
        return;
    }

    await store.add('bookings', {
      user_id: userId,
      service_ids: selectedServices,
      body_type: bodyType,
      date: date,
      time: time,
      status: 'pending',
      total_price: totalPrice,
    });

    if (currentDayBookings.length === 2) { 
        const staff = (await store.getAll('users')).filter(u => u.role === 'admin' || u.role === 'owner');
        for (const s of staff) {
            await createNotification({
                userId: s.id,
                type: 'info',
                message: `Лимит записи достигнут: на ${new Date(date).toLocaleDateString('ru-RU')} в ${time} занято 3 поста.`,
                icon: '🚫'
            });
        }
    }

    showToast('Запись успешно создана!', 'success');
    navigate('/admin/queue');
  });
}

function generateDateOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const value = d.toISOString().split('T')[0];
    let label = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    if (i === 0) label = 'Сегодня';
    if (i === 1) label = 'Завтра';
    options.push({ value, label });
  }
  return options;
}

function generateAvailableSlots(date, allBookings) {
  const now = new Date();
  const baseSlots = [];
  for (let h = 8; h <= 21; h++) {
    baseSlots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 21) baseSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  const todayStr = store.getTodayStr();
  const currentTimeInMin = now.getHours() * 60 + now.getMinutes();

  return baseSlots
    .filter(s => {
        // Filter out past time if it's today
        if (date !== todayStr) return true;
        const [h, m] = s.split(':').map(Number);
        const slotTotalMin = h * 60 + m;
        return slotTotalMin > (currentTimeInMin + 15); // 15 mins buffer
    })
    .map(s => {
        const count = allBookings.filter(b => {
            const bDate = b.date.includes('T') ? b.date.split('T')[0] : b.date;
            return bDate === date && b.time.startsWith(s) && b.status !== 'cancelled';
        }).length;

        return {
            time: s,
            disabled: count >= 3
        };
    });
}
