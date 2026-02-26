import re

with open('reports-CfWSr_lZ.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the Modal function O to have absolute minimum height requirements
# and hide overflow if necessary to force it into one screen.
# We also make sure the backdrop doesn't allow scrolling behind.

modal_js_old = 'l.className="modal",l.innerHTML=`'
modal_style_injection = '''<style>
.modal { 
    padding: 8px 12px 12px !important; 
    max-width: 92vw !important; 
    width: 320px !important; 
    border-radius: 16px !important;
    max-height: 90vh !important;
    display: flex !important;
    flex-direction: column !important;
}
.modal__body { 
    overflow-y: auto !important; 
    flex: 1 !important;
    max-height: calc(90vh - 100px) !important;
}
.modal__header { margin-bottom: 4px !important; padding-bottom: 4px !important; flex-shrink: 0 !important; }
.modal__title { font-size: 1rem !important; }
.modal__close { top: 8px !important; right: 8px !important; padding: 4px !important; }
.modal__footer { margin-top: 8px !important; flex-shrink: 0 !important; }
</style>'''

content = content.replace(modal_js_old, 'l.className="modal",l.innerHTML=`' + modal_style_injection)

# 2. Make the specific rating details in F(t) even smaller
new_modal_content = """<div style="display:flex; flex-direction:column; gap:2px; font-size:12px; line-height:1.05;">
    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.05); padding:4px 8px; border-radius:8px;">
        <span style="font-size:1.3rem;">${"⭐".repeat(a)}</span>
        <b style="font-size:1.1rem; color:var(--color-primary);">${parseFloat(e).toLocaleString()} ₽</b>
    </div>
    <div style="padding:4px 8px; background:rgba(255,0,0,0.05); border-radius:8px; text-align:center; font-style:italic; border:1px solid rgba(255,0,0,0.1); margin:2px 0;">"${s}"</div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
        <div style="background:rgba(0,0,0,0.03); padding:4px 6px; border-radius:6px;">
            <span style="color:#888; font-size:8px; display:block; text-transform:uppercase;">Авто</span><b>${m}</b>
        </div>
        <div style="background:rgba(0,0,0,0.03); padding:4px 6px; border-radius:6px;">
            <span style="color:#888; font-size:8px; display:block; text-transform:uppercase;">Мойщик</span><b>${r?.name?.split(' ')[0] || "---"}</b>
        </div>
        <div style="background:rgba(0,0,0,0.03); padding:4px 6px; border-radius:6px;">
            <span style="color:#888; font-size:8px; display:block; text-transform:uppercase;">Тел.</span><b>${p}</b>
        </div>
        <div style="background:rgba(0,0,0,0.03); padding:4px 6px; border-radius:6px;">
            <span style="color:#888; font-size:8px; display:block; text-transform:uppercase;">Время</span><b>${t.time}</b>
        </div>
    </div>
</div>"""

pattern = r'await O\(\{title:"Детали мойки 🚿",content:`.*?`\}\)'
match = re.search(pattern, content, re.DOTALL)
if match:
    new_call = 'await O({title:"Детали мойки 🚿",content:`' + new_modal_content + '`})'
    content = content.replace(match.group(0), new_call)

with open('reports-CfWSr_lZ_final.js', 'w', encoding='utf-8') as f:
    f.write(content)
