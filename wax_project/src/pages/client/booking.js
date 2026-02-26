// === Booking Page ===
import { getCurrentUser, updateCurrentUser } from '../../auth.js';
import { store } from '../../store.js';
import { renderHeader, initHeaderEvents } from '../../components/header.js';
import { showToast } from '../../components/toast.js';
import { navigate } from '../../router.js';
import { getWeather, getBonusCashbackMultiplier } from '../../weather.js';

export async function renderBookingPage(app) {
    const user = await getCurrentUser();
    const services = (await store.getAll('services') || []).filter(s => s && s.active);
    const bodyTypes = (await store.get('bodyTypeMultipliers') || {
        sedan: { label: 'Седан', multiplier: 1 },
        suv: { label: 'Внедорожник', multiplier: 1.3 },
        crossover: { label: 'Кроссовер', multiplier: 1.2 },
        minivan: { label: 'Минивэн', multiplier: 1.5 }
    });
    const allBookings = (await store.getAll('bookings') || []);

    const todayStr = store.getTodayStr();

    app.innerHTML = `
    ${await renderHeader()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">📝 Запись на мойку</h1>
        <p class="page-header__subtitle">Выберите услуги и удобное время</p>
      </div>

      <div class="booking-form">
        <div class="booking-form__section">
          <!-- Client Info -->
          <div class="glass-card glass-card--static">
            <h3 class="booking-form__section-title">👤 Ваши данные</h3>
            <div class="flex flex-col gap-md">
              <div class="form-group">
                <label class="form-label">Телефон</label>
                <input type="tel" class="form-input" id="booking-phone" value="${user.phone || ''}" placeholder="+7 900 000-00-00" required>
              </div>
              <div class="form-group">
                <label class="form-label">Номер машины</label>
                <input type="text" class="form-input" id="booking-car" value="${user.carNumber || user.car_number || ''}" placeholder="А000АА777" required>
              </div>
            </div>
          </div>

          <!-- Body Type -->
          <div class="glass-card glass-card--static">
            <h3 class="booking-form__section-title">🚗 Тип кузова</h3>
            <div class="flex flex-col gap-sm">
              ${Object.entries(bodyTypes).map(([key, bt]) => `
                <label class="service-option" data-bodytype="${key}">
                  <div class="service-option__info">
                    <input type="radio" name="bodyType" value="${key}" ${key === 'sedan' ? 'checked' : ''} style="accent-color:var(--color-primary);">
                    <span class="service-option__name">${bt.label}</span>
                  </div>
                  <span class="service-option__price">${bt.multiplier > 1 ? `x${bt.multiplier}` : 'Базовая цена'}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Services -->
          <div class="glass-card glass-card--static">
            <h3 class="booking-form__section-title">🧽 Услуги</h3>
            <div class="flex flex-col gap-sm" id="services-list">
              ${services.map(s => `
                <label class="service-option" data-service-id="${s.id}">
                  <div class="service-option__info">
                    <input type="checkbox" name="services" value="${s.id}" style="accent-color:var(--color-primary);">
                    <div>
                      <span class="service-option__name">${s.icon || '🧼'} ${s.name}</span>
                      <div class="text-secondary" style="font-size:var(--font-size-xs);">${s.description || ''}</div>
                    </div>
                  </div>
                  <span class="service-option__price">${s.price} ₽</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Date & Time -->
          <div class="glass-card glass-card--static">
            <h3 class="booking-form__section-title">📅 Дата и время</h3>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Дата</label>
                <select class="form-select" id="booking-date" required>
                  ${generateDateOptions().map(d => `<option value="${d.value}">${d.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Время</label>
                <select class="form-select" id="booking-time" required>
                  <option value="">Выберите время...</option>
                  ${(generateAvailableTimeSlots(todayStr, allBookings)).map(t => `
                    <option value="${t.time}" ${t.disabled ? 'disabled' : ''}>
                      ${t.time} ${t.disabled ? '(Мест нет)' : ''}
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="booking-form__section">
          <div class="glass-card glass-card--elevated booking-summary">
            <h3 class="booking-form__section-title">💰 Итого</h3>
            
            <div id="summary-services" class="flex flex-col gap-sm mb-lg">
              <div class="text-center text-muted" style="padding:var(--space-xl);">
                Выберите услуги
              </div>
            </div>

            <div id="summary-bonus" style="display:none;" class="mb-lg">
              <div class="flex justify-between items-center" style="font-size:var(--font-size-sm);">
                <span class="text-secondary">Можно списать бонусов:</span>
                <span class="text-success" style="font-weight:600;" id="bonus-available">0</span>
              </div>
              <div class="flex items-center gap-sm mt-sm">
                <input type="checkbox" id="use-bonus" style="accent-color:var(--color-primary);">
                <label for="use-bonus" style="font-size:var(--font-size-sm);cursor:pointer;">Списать бонусы</label>
              </div>
            </div>

            <div class="booking-summary__total">
              <span class="booking-summary__total-label">К оплате:</span>
              <span class="booking-summary__total-price" id="total-price">0 ₽</span>
            </div>

            <div class="mt-lg" style="font-size:var(--font-size-xs);color:var(--color-text-muted);" id="cashback-info">
              Кэшбек ${user.cashback_percent || user.cashbackPercent || 5}%: <strong id="cashback-amount">0</strong> бонусов
            </div>

            <button class="btn btn--primary btn--lg btn--full mt-xl" id="submit-booking">
              Записаться
            </button>
          </div>
        </div>
      </div>
    </main>
  `;

    initHeaderEvents();
    initBookingLogic(user, services, bodyTypes, allBookings);
}

function initBookingLogic(user, services, bodyTypes, allBookings) {
    const servicesCheckboxes = document.querySelectorAll('input[name="services"]');
    const bodyTypeRadios = document.querySelectorAll('input[name="bodyType"]');
    const useBonusCheckbox = document.getElementById('use-bonus');
    const dateSelect = document.getElementById('booking-date');
    const timeSelect = document.getElementById('booking-time');
    const phoneInput = document.getElementById('booking-phone');
    const carInput = document.getElementById('booking-car');

    const todayStr = store.getTodayStr();

    dateSelect.addEventListener('change', () => {
        const slots = generateAvailableTimeSlots(dateSelect.value, allBookings);
        timeSelect.innerHTML = '<option value="">Выберите время...</option>' + 
            slots.map(t => `<option value="${t.time}" ${t.disabled ? 'disabled' : ''}>${t.time} ${t.disabled ? '(Мест нет)' : ''}</option>`).join('');
    });

    function calculateTotal() {
        const selectedBody = document.querySelector('input[name="bodyType"]:checked')?.value || 'sedan';
        const multiplier = bodyTypes[selectedBody]?.multiplier || 1;

        const selectedServices = [];
        servicesCheckboxes.forEach(cb => {
            if (cb.checked) {
                const svc = services.find(s => String(s.id) === String(cb.value));
                if (svc) selectedServices.push(svc);
            }
        });

        // Update summary
        const summaryEl = document.getElementById('summary-services');
        if (selectedServices.length === 0) {
            summaryEl.innerHTML = '<div class="text-center text-muted" style="padding:var(--space-xl);">Выберите услуги</div>';
            document.getElementById('summary-bonus').style.display = 'none';
        } else {
            summaryEl.innerHTML = selectedServices.map(s => `
        <div class="flex justify-between" style="font-size:var(--font-size-sm);">
          <span>${s.icon || '🧼'} ${s.name}</span>
          <span style="font-weight:500;">${Math.round(s.price * multiplier)} ₽</span>
        </div>
      `).join('');
            if (multiplier > 1) {
                summaryEl.innerHTML += `
          <div class="flex justify-between text-muted" style="font-size:var(--font-size-xs);">
            <span>Коэффициент (${bodyTypes[selectedBody].label})</span>
            <span>x${multiplier}</span>
          </div>
        `;
            }
            document.getElementById('summary-bonus').style.display = 'block';
        }

        const subtotal = selectedServices.reduce((sum, s) => sum + Math.round(s.price * multiplier), 0);
        const maxBonus = Math.min(user.bonus_balance || user.bonusBalance || 0, Math.floor(subtotal * 0.3)); // Max 30% discount
        document.getElementById('bonus-available').textContent = `до ${maxBonus} ₽`;

        const bonusDiscount = useBonusCheckbox?.checked ? maxBonus : 0;
        const total = Math.max(0, subtotal - bonusDiscount);

        document.getElementById('total-price').textContent = `${total} ₽`;
        document.getElementById('cashback-amount').textContent = Math.round(total * (user.cashback_percent || user.cashbackPercent || 5) / 100);

        // Highlight selected service options
        document.querySelectorAll('.service-option[data-service-id]').forEach(el => {
            const cb = el.querySelector('input[type="checkbox"]');
            el.classList.toggle('service-option--selected', cb.checked);
        });

        return { selectedServices, subtotal, total, bonusDiscount, multiplier, selectedBody };
    }

    servicesCheckboxes.forEach(cb => cb.addEventListener('change', calculateTotal));
    bodyTypeRadios.forEach(rb => rb.addEventListener('change', calculateTotal));
    useBonusCheckbox?.addEventListener('change', calculateTotal);

    // Submit
    document.getElementById('submit-booking').addEventListener('click', async () => {
        const phone = phoneInput.value.trim();
        const car = carInput.value.trim();

        if (!phone || !car) {
            showToast('Пожалуйста, введите телефон и номер машины', 'warning');
            return;
        }

        const { selectedServices, total, bonusDiscount, selectedBody } = calculateTotal();
        if (selectedServices.length === 0) {
            showToast('Выберите хотя бы одну услугу', 'warning');
            return;
        }

        const date = dateSelect.value;
        const time = timeSelect.value;

        if (!date || !time) {
            showToast('Укажите дату и время', 'warning');
            return;
        }

        if (phone !== user.phone || car !== (user.carNumber || user.car_number)) {
            await updateCurrentUser({ phone, carNumber: car });
        }

        // Final check for capacity
        const currentDayBookings = allBookings.filter(b => {
            const bDate = b.date.includes('T') ? b.date.split('T')[0] : b.date;
            return bDate === date && b.time.startsWith(time) && b.status !== 'cancelled';
        });

        if (currentDayBookings.length >= 3) {
            showToast('Извините, на это время мест больше нет', 'error');
            return;
        }

        // Create booking
        await store.add('bookings', {
            user_id: user.id,
            service_ids: selectedServices.map(s => s.id),
            body_type: selectedBody,
            date,
            time,
            total_price: total,
            bonus_used: bonusDiscount,
            status: 'pending'
        });

        // Deduct bonus if used
        if (bonusDiscount > 0) {
            const updatedUser = await store.update('users', user.id, {
                bonus_balance: (user.bonus_balance || user.bonusBalance || 0) - bonusDiscount,
            });
            await store.set('currentUser', updatedUser);

            await store.add('bonusHistory', {
                userId: user.id,
                amount: -bonusDiscount,
                type: 'spent',
                description: 'Списание бонусов при записи',
            });
        }

        showToast('Запись создана! Ожидайте подтверждения.', 'success');
        navigate('/history');
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

function generateAvailableTimeSlots(date, allBookings) {
    const slots = [];
    const now = new Date();
    const todayStr = store.getTodayStr();
    const isToday = date === todayStr;
    const currentTimeInMin = now.getHours() * 60 + now.getMinutes();

    for (let h = 8; h <= 20; h++) {
        const time1 = `${h.toString().padStart(2, '0')}:00`;
        const t1Min = h * 60;
        
        if (!isToday || t1Min > (currentTimeInMin + 15)) {
            const count1 = allBookings.filter(b => {
                const bDate = b.date.includes('T') ? b.date.split('T')[0] : b.date;
                return bDate === date && b.time.startsWith(time1) && b.status !== 'cancelled';
            }).length;
            
            slots.push({
                time: time1,
                disabled: count1 >= 3
            });
        }

        if (h < 20) {
            const time2 = `${h.toString().padStart(2, '0')}:30`;
            const t2Min = h * 60 + 30;
            
            if (!isToday || t2Min > (currentTimeInMin + 15)) {
                const count2 = allBookings.filter(b => {
                    const bDate = b.date.includes('T') ? b.date.split('T')[0] : b.date;
                    return bDate === date && b.time.startsWith(time2) && b.status !== 'cancelled';
                }).length;
                
                slots.push({
                    time: time2,
                    disabled: count2 >= 3
                });
            }
        }
    }
    return slots;
}
