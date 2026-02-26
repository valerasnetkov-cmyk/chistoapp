import re

with open('reports_lib.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. FIX MODAL SCROLLING - ABSOLUTE FORCE
# Make the modal strictly fit the screen and scroll only the body if needed
modal_style = '''<style>
.modal { 
    padding: 8px 12px 12px !important; 
    max-width: 94vw !important; 
    width: 320px !important; 
    border-radius: 16px !important;
    max-height: 85vh !important;
    display: flex !important;
    flex-direction: column !important;
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
}
.modal__body { 
    overflow-y: auto !important; 
    flex: 1 !important;
    max-height: calc(85vh - 80px) !important;
    padding-right: 2px !important;
}
.modal__header { margin-bottom: 4px !important; padding-bottom: 4px !important; flex-shrink: 0 !important; }
.modal__title { font-size: 0.95rem !important; }
.modal__close { top: 4px !important; right: 4px !important; padding: 4px !important; }
.modal__footer { margin-top: 6px !important; flex-shrink: 0 !important; padding: 0 !important; }
.modal__footer .btn { padding: 8px !important; font-size: 0.9rem !important; }
</style>'''

# Inject style into the Modal function O
content = re.sub(r'l.className="modal",l.innerHTML=`.*?`<div class="modal__header">', 
                 'l.className="modal",l.innerHTML=`' + modal_style + '<div class="modal__header">', 
                 content, flags=re.DOTALL)

# 2. FIX RATING DETAILS CONTENT - ULTRA COMPACT
new_rating_content = """<div style="display:flex; flex-direction:column; gap:4px; font-size:12px; line-height:1.1;">
    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.04); padding:4px 8px; border-radius:8px;">
        <span style="font-size:1.2rem;">${"⭐".repeat(a)}</span>
        <b style="font-size:1.1rem; color:var(--color-primary);">${parseFloat(e).toLocaleString()} ₽</b>
    </div>
    <div style="padding:6px; background:rgba(255,0,0,0.05); border-radius:8px; text-align:center; font-style:italic; border:1px solid rgba(255,0,0,0.05);">${s}</div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
        <div style="background:rgba(0,0,0,0.02); padding:4px; border-radius:6px; text-align:center;">
            <small style="color:#888; font-size:8px; display:block;">АВТО</small><b>${m}</b>
        </div>
        <div style="background:rgba(0,0,0,0.02); padding:4px; border-radius:6px; text-align:center;">
            <small style="color:#888; font-size:8px; display:block;">МОЙЩИК</small><b>${r?.name?.split(' ')[0] || "---"}</b>
        </div>
        <div style="background:rgba(0,0,0,0.02); padding:4px; border-radius:6px; text-align:center;">
            <small style="color:#888; font-size:8px; display:block;">ТЕЛЕФОН</small><b>${p}</b>
        </div>
        <div style="background:rgba(0,0,0,0.02); padding:4px; border-radius:6px; text-align:center;">
            <small style="color:#888; font-size:8px; display:block;">ВРЕМЯ</small><b>${t.time}</b>
        </div>
    </div>
</div>"""

content = re.sub(r'await O\(\{title:"Детали мойки 🚿",content:`.*?`\}\)', 
                 'await O({title:"Детали мойки 🚿",content:`' + new_rating_content + '`})', 
                 content, flags=re.DOTALL)

with open('reports_lib_fixed.js', 'w', encoding='utf-8') as f:
    f.write(content)

# 3. FIX MAIN APP - BUTTONS AND DATE SELECTION
with open('main_app.js', 'r', encoding='utf-8') as f:
    main_content = f.read()

# Fix Service Selection logic: ensure the whole card is clickable and updates the checkbox correctly
service_click_fix = '''
    document.querySelectorAll(".service-option[data-service-id]").forEach(card => {
        card.style.cursor = "pointer";
        card.onclick = (e) => {
            const cb = card.querySelector('input[type="checkbox"]');
            if (e.target !== cb) {
                cb.checked = !cb.checked;
                cb.dispatchEvent(new Event("change", { bubbles: true }));
            }
        };
    });
'''

# Fix Date/Time refresh: Ensure time dropdown updates when date changes
# The current code has a listener, but maybe it needs a manual trigger or more robust logic
main_content = main_content.replace('a.addEventListener("change",()=>{', 'a.addEventListener("change",()=>{ console.log("Date changed:", a.value); ')

# Add the click fix into the de(e,t,c,i) function or at the end of le(e)
main_content = main_content.replace('return document.getElementById("total-price").textContent=', service_click_fix + 'return document.getElementById("total-price").textContent=')

with open('main_app_fixed.js', 'w', encoding='utf-8') as f:
    f.write(main_content)
