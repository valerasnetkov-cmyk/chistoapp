import re

with open('reports-CfWSr_lZ.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the Modal component CSS/HTML structure to prevent internal scrolling and fit screen
# We need to find the O function (Modal) and its internal template.
# The previous update changed the content, but the modal container might still have padding/margins.

# Let's make the modal content even more condensed.
new_modal_content = """<div class="rating-details" style="display: flex; flex-direction: column; gap: 4px; margin: -10px 0;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 2px;">
                            <span style="font-size: 1.8rem;">${"⭐".repeat(a)}</span>
                            <span style="font-weight: 800; font-size: 1.3rem; color: var(--color-primary);">${parseFloat(e).toLocaleString()} ₽</span>
                        </div>
                        
                        <div class="glass-card" style="padding: 8px; text-align: center; background: rgba(255,0,0,0.05); border: 1px solid rgba(255,0,0,0.1); border-radius: 12px;">
                            <div style="font-style: italic; font-size: 0.95rem; line-height: 1.2;">${s}</div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.8rem;">
                            <div class="glass-card" style="padding: 6px; border-radius: 10px;">
                                <div class="text-muted" style="font-size: 9px; text-transform: uppercase;">Авто</div>
                                <div style="font-weight: 800; color: var(--color-primary);">${m}</div>
                            </div>
                            <div class="glass-card" style="padding: 6px; border-radius: 10px;">
                                <div class="text-muted" style="font-size: 9px; text-transform: uppercase;">Мойщик</div>
                                <div style="font-weight: 600;">${r?.name || "неизв."}</div>
                            </div>
                            <div class="glass-card" style="padding: 6px; border-radius: 10px;">
                                <div class="text-muted" style="font-size: 9px; text-transform: uppercase;">Тел.</div>
                                <div style="font-weight: 600;">${p}</div>
                            </div>
                            <div class="glass-card" style="padding: 6px; border-radius: 10px;">
                                <div class="text-muted" style="font-size: 9px; text-transform: uppercase;">Дата</div>
                                <div style="font-weight: 600;">${u} ${t.time}</div>
                            </div>
                        </div>
                    </div>"""

# Replace the content inside F(t)
pattern = r'await O\(\{title:"Детали мойки 🚿",content:`.*?`\}\)'
match = re.search(pattern, content, re.DOTALL)
if match:
    new_call = 'await O({title:"Детали мойки 🚿",content:`' + new_modal_content + '`})'
    content = content.replace(match.group(0), new_call)

# 2. Force the global modal style to be more compact
# We look for the modal HTML structure in O function.
# It usually looks like: <div class="modal">...</div>
# We can inject a style tag to override .modal padding.

modal_style_injection = '<style>.modal { padding: 12px !important; max-width: 95vw !important; width: 340px !important; } .modal__header { margin-bottom: 8px !important; } .modal__title { font-size: 1.1rem !important; }</style>'
content = content.replace('l.className="modal",l.innerHTML=`', 'l.className="modal",l.innerHTML=`' + modal_style_injection)

with open('reports-CfWSr_lZ_fixed.js', 'w', encoding='utf-8') as f:
    f.write(content)
