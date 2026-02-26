import sys

with open('reports-CfWSr_lZ.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Target the detailed rating modal content in function F(t)
# We want to make it more compact to fit on one screen

old_modal_content = """<div class="rating-details">
                        <div class="rating-details__stars" style="font-size: 3rem; text-align: center; margin-bottom: var(--space-lg);">
                            ${"⭐".repeat(a)}
                        </div>
                        <div class="glass-card" style="padding: var(--space-lg); text-align: center; margin-bottom: var(--space-xl);">
                            <div class="text-muted" style="font-size: var(--font-size-sm); margin-bottom: var(--space-xs);">Отзыв клиента: ${l?.name || "Гость"}</div>
                            <div style="font-style: italic; font-size: 1.1rem; color: var(--color-text);">"${s}"</div>
                        </div>
                        
                        <div class="grid-2" style="gap: var(--space-lg);">
                            <div>
                                <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.05em;">Машина</div>
                                <div style="font-weight: 700; color: var(--color-primary); font-size: 1.1rem;">${m}</div>
                            </div>
                            <div>
                                <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.05em;">Телефон</div>
                                <div style="font-weight: 600;">${p}</div>
                            </div>
                            <div>
                                <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.05em;">Тип кузова</div>
                                <div style="color: var(--color-text-secondary);">${i}</div>
                            </div>
                            <div>
                                <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.05em;">Мойщик</div>
                                <div style="font-weight: 600;">${r?.name || "неизв."}</div>
                            </div>
                        </div>

                        <div style="margin-top: var(--space-xl); padding-top: var(--space-lg); border-top: 1px solid var(--color-divider);">
                            <div class="flex justify-between items-center mb-xs">
                                <span class="text-muted" style="font-size: var(--font-size-sm);">Время мойки</span>
                                <span style="font-weight: 600;">${u} в ${t.time}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-muted" style="font-size: var(--font-size-sm);">Сумма</span>
                                <span style="font-weight: 800; font-size: 1.2rem; color: var(--color-primary);">${parseFloat(e).toLocaleString()} ₽</span>
                            </div>
                        </div>
                    </div>"""

# Since it might be minified or slightly different, I'll use a more flexible replacement
# or just target the specific lines if I can find them.
# Let's try a very compact version.

new_modal_content = """<div class="rating-details" style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 4px;">
                            <span style="font-size: 2rem;">${"⭐".repeat(a)}</span>
                            <span style="font-weight: 700; font-size: 1.2rem; color: var(--color-primary);">${parseFloat(e).toLocaleString()} ₽</span>
                        </div>
                        
                        <div class="glass-card" style="padding: 10px; text-align: center; background: rgba(255,0,0,0.05);">
                            <div style="font-style: italic; font-size: 1rem;">"${s}"</div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem;">
                            <div class="glass-card" style="padding: 8px;">
                                <div class="text-muted" style="font-size: 10px; text-transform: uppercase;">Машина</div>
                                <div style="font-weight: 800; color: var(--color-primary);">${m}</div>
                            </div>
                            <div class="glass-card" style="padding: 8px;">
                                <div class="text-muted" style="font-size: 10px; text-transform: uppercase;">Мойщик</div>
                                <div style="font-weight: 600;">${r?.name || "неизв."}</div>
                            </div>
                            <div class="glass-card" style="padding: 8px;">
                                <div class="text-muted" style="font-size: 10px; text-transform: uppercase;">Телефон</div>
                                <div style="font-weight: 600;">${p}</div>
                            </div>
                            <div class="glass-card" style="padding: 8px;">
                                <div class="text-muted" style="font-size: 10px; text-transform: uppercase;">Дата/Время</div>
                                <div style="font-weight: 600;">${u} ${t.time}</div>
                            </div>
                        </div>
                    </div>"""

# Search for the pattern and replace
# It's likely inside At or a similar function call.
# Let's find where F(t) is defined and its template string.

import re
# Look for O({title:"Детали мойки 🚿",content:`...`})
pattern = r'await O\(\{title:"Детали мойки 🚿",content:`.*?`\}\)'
match = re.search(pattern, content, re.DOTALL)
if match:
    new_call = 'await O({title:"Детали мойки 🚿",content:`' + new_modal_content + '`})'
    content = content.replace(match.group(0), new_call)

with open('reports-CfWSr_lZ_compact.js', 'w', encoding='utf-8') as f:
    f.write(content)
