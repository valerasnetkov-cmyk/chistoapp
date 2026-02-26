// === Owner Services Page ===
import { store } from '../../store.js';
import { renderHeader, initHeaderEvents } from '../../components/header.js';
import { showToast } from '../../components/toast.js';
import { showModal } from '../../components/modal.js';

export async function renderOwnerServicesPage(app) {
    const services = (await store.getAll('services') || []);

    app.innerHTML = `
    ${await renderHeader()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">🛠️ Управление услугами</h1>
        <p class="page-header__subtitle">Настройка прайс-листа автомойки</p>
      </div>

      <div class="glass-card mb-2xl">
        <div class="flex justify-between items-center mb-lg flex-wrap gap-md">
            <h3>Список услуг</h3>
            <button class="btn btn--primary btn--sm" id="add-service-btn">+ Добавить услугу</button>
        </div>
        
        <div class="services-list">
            ${services.length === 0 ? '<p class="text-center text-muted p-xl">Услуг пока нет</p>' : services.map(s => `
                <div class="flex justify-between items-center p-md mb-md glass-card--static" style="background: rgba(255,255,255,0.3); border-radius: var(--radius-md);">
                    <div class="flex items-center gap-md">
                        <span style="font-size: 1.5rem;">${s.icon || '🧼'}</span>
                        <div>
                            <div style="font-weight: 600;">${s.name}</div>
                            <div style="font-size: var(--font-size-sm);" class="text-secondary">${s.price} ₽</div>
                        </div>
                    </div>
                    <div class="flex gap-sm">
                        <button class="btn btn--ghost btn--sm edit-btn" data-id="${s.id}">✏️</button>
                        <button class="btn btn--ghost btn--sm delete-btn" data-id="${s.id}" style="color: var(--color-danger);">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>
      </div>
    </main>
    `;

    initHeaderEvents();

    // Delete Service
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (confirm('Удалить эту услугу?')) {
                await store.remove('services', id);
                showToast('Услуга удалена', 'success');
                await renderOwnerServicesPage(app);
            }
        });
    });

    // Add/Edit Service Modal
    const openServiceModal = async (service = null) => {
        const isEdit = !!service;
        const { modal, close } = await showModal({
            title: isEdit ? 'Редактировать услугу' : 'Добавить услугу',
            content: `
                <div class="flex flex-col gap-lg">
                    <div class="form-group">
                        <label class="form-label">Название</label>
                        <input type="text" class="form-input" id="svc-name" value="${service?.name || ''}" placeholder="Напр: Мойка кузова">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Цена (₽)</label>
                        <input type="number" class="form-input" id="svc-price" value="${service?.price || ''}" placeholder="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Иконка (эмодзи)</label>
                        <input type="text" class="form-input" id="svc-icon" value="${service?.icon || '🧼'}" placeholder="🧼">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Описание</label>
                        <textarea class="form-textarea" id="svc-desc" placeholder="Краткое описание услуги">${service?.description || ''}</textarea>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn--secondary" id="svc-cancel">Отмена</button>
                <button class="btn btn--primary" id="svc-save">${isEdit ? 'Сохранить' : 'Добавить'}</button>
            `
        });

        document.getElementById('svc-cancel').addEventListener('click', close);
        document.getElementById('svc-save').addEventListener('click', async () => {
            const name = document.getElementById('svc-name').value.trim();
            const price = parseFloat(document.getElementById('svc-price').value);
            const icon = document.getElementById('svc-icon').value.trim();
            const description = document.getElementById('svc-desc').value.trim();

            if (!name || isNaN(price)) {
                showToast('Заполните название и цену', 'warning');
                return;
            }

            const payload = { name, price, icon, description, active: true };

            if (isEdit) {
                await store.update('services', service.id, payload);
                showToast('Услуга обновлена', 'success');
            } else {
                await store.add('services', payload);
                showToast('Услуга добавлена', 'success');
            }

            close();
            await renderOwnerServicesPage(app);
        });
    };

    document.getElementById('add-service-btn').addEventListener('click', () => openServiceModal());
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const service = (await store.getAll('services')).find(s => String(s.id) === String(id));
            if (service) openServiceModal(service);
        });
    });
}
