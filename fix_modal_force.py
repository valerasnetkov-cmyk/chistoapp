import re

with open('reports-CfWSr_lZ.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Сделаем сам контент экстремально плотным
new_modal_content = """<div style="display:flex; flex-direction:column; gap:4px; font-size:13px; line-height:1.1;">
    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.05); padding:6px; border-radius:8px;">
        <span style="font-size:1.5rem;">${"⭐".repeat(a)}</span>
        <b style="font-size:1.1rem; color:var(--color-primary);">${parseFloat(e).toLocaleString()} ₽</b>
    </div>
    <div style="padding:6px; background:rgba(255,0,0,0.05); border-radius:8px; text-align:center; font-style:italic;">"${s}"</div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
        <div style="background:rgba(0,0,0,0.03); padding:4px 8px; border-radius:6px;">
            <small style="color:#888; font-size:9px; display:block;">АВТО</small><b>${m}</b>
        </div>
        <div style="background:rgba(0,0,0,0.03); padding:4px 8px; border-radius:6px;">
            <small style="color:#888; font-size:9px; display:block;">МОЙЩИК</small><b>${r?.name?.split(' ')[0] || "---"}</b>
        </div>
        <div style="background:rgba(0,0,0,0.03); padding:4px 8px; border-radius:6px;">
            <small style="color:#888; font-size:9px; display:block;">ТЕЛЕФОН</small><b>${p}</b>
        </div>
        <div style="background:rgba(0,0,0,0.03); padding:4px 8px; border-radius:6px;">
            <small style="color:#888; font-size:9px; display:block;">ВРЕМЯ</small><b>${t.time}</b>
        </div>
    </div>
</div>"""

# Заменяем вызов в функции F
pattern = r'await O\(\{title:"Детали мойки 🚿",content:`.*?`\}\)'
match = re.search(pattern, content, re.DOTALL)
if match:
    new_call = 'await O({title:"Детали мойки 🚿",content:`' + new_modal_content + '`})'
    content = content.replace(match.group(0), new_call)

# 2. Жёстко правим стили самого модального окна в функции O
# Уменьшаем паддинги, отступы и размеры шрифтов
style_fix = """<style>
.modal { 
    padding: 8px 12px 12px !important; 
    max-width: 92vw !important; 
    width: 320px !important; 
    border-radius: 16px !important;
}
.modal__header { margin-bottom: 4px !important; padding-bottom: 4px !important; }
.modal__title { font-size: 1rem !important; }
.modal__close { top: 8px !important; right: 8px !important; padding: 4px !important; }
</style>"""

content = content.replace('l.className="modal",l.innerHTML=`', 'l.className="modal",l.innerHTML=`' + style_fix)

with open('reports-CfWSr_lZ_ultra.js', 'w', encoding='utf-8') as f:
    f.write(content)
