// === Owner Staff Page ===
import { store } from '../../store.js';
import { renderHeader, initHeaderEvents } from '../../components/header.js';
import { showToast } from '../../components/toast.js';
import { showModal } from '../../components/modal.js';

export async function renderOwnerStaffPage(app) {
    const staff = (await store.getAll('washers') || []);

    app.innerHTML = `
    ${await renderHeader()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">👥 Управление персоналом</h1>
        <p class="page-header__subtitle">Мойщики и их условия работы</p>
      </div>

      <div class="glass-card mb-2xl">
        <div class="flex justify-between items-center mb-lg flex-wrap gap-md">
            <h3>Список сотрудников</h3>
            <button class="btn btn--primary btn--sm" id="add-staff-btn">+ Нанять сотрудника</button>
        </div>
        
        <div class="staff-list">
            ${staff.length === 0 ? '<p class="text-center text-muted p-xl">Сотрудников пока нет</p>' : staff.map(w => `
                <div class="flex justify-between items-center p-md mb-md glass-card--static" style="background: rgba(255,255,255,0.3); border-radius: var(--radius-md);">
                    <div class="flex items-center gap-md">
                        <div class="app-header__avatar" style="width: 40px; height: 40px; font-size: 1rem;">${w.name ? w.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '??'}</div>
                        <div>
                            <div style="font-weight: 600;">${w.name}</div>
                            <div style="font-size: var(--font-size-sm);" class="text-secondary">Ставка: ${w.percent}%</div>
                        </div>
                    </div>
                    <div class="flex gap-sm">
                        <button class="btn btn--ghost btn--sm edit-btn" data-id="${w.id}">✏️</button>
                        <button class="btn btn--ghost btn--sm delete-btn" data-id="${w.id}" style="color: var(--color-danger);">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>
      </div>
    </main>
    `;

    initHeaderEvents();

    // Delete Staff
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (confirm('Уволить сотрудника?')) {
                await store.remove('washers', id);
                showToast('Сотрудник удален', 'success');
                await renderOwnerStaffPage(app);
            }
        });
    });

    // Add/Edit Staff Modal
    const openStaffModal = async (member = null) => {
        const isEdit = !!member;
        const { modal, close } = await showModal({
            title: isEdit ? 'Редактировать сотрудника' : 'Нанять сотрудника',
            content: `
                <div class="flex flex-col gap-lg">
                    <div class="form-group">
                        <label class="form-label">ФИО</label>
                        <input type="text" class="form-input" id="staff-name" value="${member?.name || ''}" placeholder="Иван Иванов">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Ставка (%)</label>
                        <input type="number" class="form-input" id="staff-percent" value="${member?.percent || '30'}" placeholder="30">
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn--secondary" id="staff-cancel">Отмена</button>
                <button class="btn btn--primary" id="staff-save">${isEdit ? 'Сохранить' : 'Добавить'}</button>
            `
        });

        document.getElementById('staff-cancel').addEventListener('click', close);
        document.getElementById('staff-save').addEventListener('click', async () => {
            const name = document.getElementById('staff-name').value.trim();
            const percent = parseInt(document.getElementById('staff-percent').value);

            if (!name || isNaN(percent)) {
                showToast('Заполните все поля', 'warning');
                return;
            }

            const payload = { name, percent, active: true };

            if (isEdit) {
                await store.update('washers', member.id, payload);
                showToast('Данные обновлены', 'success');
            } else {
                await store.add('washers', payload);
                showToast('Сотрудник добавлен', 'success');
            }

            close();
            await renderOwnerStaffPage(app);
        });
    };

    document.getElementById('add-staff-btn').addEventListener('click', () => openStaffModal());

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const member = (await store.getAll('washers')).find(w => String(w.id) === String(id));
            if (member) openStaffModal(member);
        });
    });
}
