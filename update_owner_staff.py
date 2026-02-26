import sys

with open('reports-CfWSr_lZ.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update G(t) - Staff Management Page
# Add "Administrators" section and tab logic

old_g_start = 'async function G(t){const a=await d.getAll("washers")||[];t.innerHTML=`'
new_g_start = 'async function G(t){const a=await d.getAll("washers")||[],u_all=await d.getAll("users")||[],admins=u_all.filter(u=>u.role==="admin");t.innerHTML=`'

content = content.replace(old_g_start, new_g_start)

# Change header and layout to support two lists
old_header = '<h1 class="page-header__title">👥 Мойщики</h1>'
new_header = '<h1 class="page-header__title">👥 Управление персоналом</h1>'
content = content.replace(old_header, new_header)

old_staff_top = '<div class="page-header flex justify-between items-center">'
new_staff_top = '<div class="page-header flex justify-between items-center mb-xl">'
content = content.replace(old_staff_top, new_staff_top)

# Insert Admin section before Washers
admin_section = '''
      <div class="glass-card mb-2xl">
        <div class="flex justify-between items-center mb-lg">
          <h3 class="mb-0">🛡️ Администраторы</h3>
          <button class="btn btn--primary btn--sm" id="add-admin-btn">+ Добавить админа</button>
        </div>
        <div class="staff-list mb-lg">
          ${admins.length===0?'<p class="text-center text-muted py-md">Администраторы не назначены</p>':admins.map(adm=>`
            <div class="glass-card staff-card">
              <div class="staff-card__info">
                <div class="staff-card__name">${adm.name||adm.login}</div>
                <div class="staff-card__meta">Логин: ${adm.login}</div>
              </div>
              <div class="staff-card__actions">
                <button class="btn btn--glass btn--sm edit-admin-btn" data-id="${adm.id}">⚙️ Изменить</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="flex justify-between items-center mb-lg">
        <h3 class="mb-0">👷 Мойщики</h3>
'''
content = content.replace('<h1 class="page-header__title">👥 Управление персоналом</h1>\n            <p class="page-header__subtitle">Список сотрудников и их процентные ставки</p>\n          </div>\n          <button class="btn btn--primary btn--sm" id="add-staff-btn">+ Нанять сотрудника</button>', 
                          '<h1 class="page-header__title">👥 Управление персоналом</h1>\n            <p class="page-header__subtitle">Управление администраторами и мойщиками</p>\n          </div>')

# Actually, the original string might be slightly different due to minification or whitespace.
# Let's target the button and the subtitle.
content = content.replace('<p class="page-header__subtitle">Список сотрудников и их процентные ставки</p>', '<p class="page-header__subtitle">Управление администраторами и мойщиками</p>')
content = content.replace('<button class="btn btn--primary btn--sm" id="add-staff-btn">+ Нанять сотрудника</button>', admin_section + '<button class="btn btn--primary btn--sm" id="add-staff-btn">+ Нанять сотрудника</button>')

# 2. Add Modal for Admin adding/editing
admin_modal_js = '''
    const showAdminModal = async (adminData = null) => {
        const isEdit = !!adminData;
        const { modal, close } = await O({
            title: isEdit ? "Редактировать админа" : "Добавить администратора",
            content: `
                <div class="flex flex-col gap-lg">
                    <div class="form-group">
                        <label class="form-label">Имя (отображаемое)</label>
                        <input type="text" class="form-input" id="adm-name" value="${adminData?.name || ""}" placeholder="Александр">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Логин (телефон или ник)</label>
                        <input type="text" class="form-input" id="adm-login" value="${adminData?.login || ""}" placeholder="admin_1" ${isEdit ? "disabled" : ""}>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Пароль</label>
                        <input type="text" class="form-input" id="adm-pass" value="${adminData?.password || ""}" placeholder="Минимум 4 символа">
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn--secondary" id="adm-cancel">Отмена</button>
                <button class="btn btn--primary" id="adm-save">${isEdit ? "Сохранить" : "Создать"}</button>
            `
        });

        document.getElementById("adm-cancel").addEventListener("click", close);
        document.getElementById("adm-save").addEventListener("click", async () => {
            const name = document.getElementById("adm-name").value.trim();
            const login = document.getElementById("adm-login").value.trim();
            const password = document.getElementById("adm-pass").value.trim();

            if (!name || !login || !password) {
                b("Заполните все поля", "warning");
                return;
            }

            const data = { name, login, password, role: "admin", car_wash_id: d.DEFAULT_CAR_WASH_ID || 1 };
            
            try {
                if (isEdit) {
                    await d.update("users", adminData.id, data);
                    b("Данные администратора обновлены", "success");
                } else {
                    const res = await d.apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) });
                    if (res?.success) {
                        // After register, update the role because register defaults to client
                        await d.update("users", res.id, { role: "admin" });
                        b("Администратор успешно добавлен", "success");
                    } else {
                        throw new Error(res?.error || "Ошибка при создании");
                    }
                }
                close();
                await G(t);
            } catch (err) {
                b(err.message, "error");
            }
        });
    };

    document.getElementById("add-admin-btn").addEventListener("click", () => showAdminModal());
    document.querySelectorAll(".edit-admin-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const admin = admins.find(a => String(a.id) === String(id));
            if (admin) showAdminModal(admin);
        });
    });
'''

# Inject admin modal logic into G(t) before its end
content = content.replace('await G(t)})};', 'await G(t)})};' + admin_modal_js)

with open('reports-CfWSr_lZ_owner_updated.js', 'w', encoding='utf-8') as f:
    f.write(content)
