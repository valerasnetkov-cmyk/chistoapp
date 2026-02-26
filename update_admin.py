import sys

with open('reports-CfWSr_lZ.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update At (Admin Queue)
# We need to find the function At(t) and its inner function a()
# and inject the logic for date switching.

old_a_start = 'async function a(){const e=d.getTodayStr(),n=await d.getAll("bookings")||[],o=n.filter(i=>!i||!i.date||i.status==="cancelled"?!1:(i.date.includes("T")?i.date.split("T")[0]:i.date)===e).sort((i,u)=>{'
new_a_start = 'async function a(viewDate=null){const e=viewDate||d.getTodayStr(),n=await d.getAll("bookings")||[],o=n.filter(i=>!i||!i.date||i.status==="cancelled"?!1:(i.date.includes("T")?i.date.split("T")[0]:i.date)===e).sort((i,u)=>{'

content = content.replace(old_a_start, new_a_start)

# Update the header to show other dates
header_old = '<h1 class="page-header__title">📋 Очередь на сегодня</h1>'
header_new = '''<h1 class="page-header__title">📋 Очередь ${e === d.getTodayStr() ? "на сегодня" : "на " + new Date(e).toLocaleDateString("ru-RU")}</h1>'''
content = content.replace(header_old, header_new)

# Add the date switcher logic
# Find unique future dates with bookings
date_logic = '''
        const futureDates = [...new Set(n.filter(i => i && i.date && i.status !== "cancelled").map(i => i.date.includes("T") ? i.date.split("T")[0] : i.date))].filter(date => date !== e).sort();
        const dateTabs = futureDates.length > 0 ? `
          <div class="flex gap-sm mb-lg overflow-x-auto pb-sm" style="border-bottom: 1px solid var(--color-divider);">
            <button class="btn btn--sm ${e === d.getTodayStr() ? "btn--primary" : "btn--glass"} date-tab" data-date="${d.getTodayStr()}">Сегодня</button>
            ${futureDates.map(date => `
              <button class="btn btn--sm ${e === date ? "btn--primary" : "btn--glass"} date-tab" data-date="${date}">${new Date(date).toLocaleDateString("ru-RU", {day:"numeric", month:"short"})}</button>
            `).join("")}
          </div>
        ` : "";
'''

# Inject dateTabs before the queue-list or empty message
content = content.replace('t.innerHTML=`', 't.innerHTML=`' + date_logic)
content = content.replace('<p class="page-header__subtitle">${new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"})}</p>', '<p class="page-header__subtitle">${new Date(e).toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"})}</p>')
content = content.replace('</div>\n          <a href="#/admin/booking" class="btn btn--primary" style="white-space: nowrap;">+ Записать клиента</a>', '</div>\n          <a href="#/admin/booking" class="btn btn--primary" style="white-space: nowrap;">+ Записать клиента</a>\n        </div>${dateTabs}')

# Add event listeners for date tabs
event_listener = 'document.querySelectorAll(".date-tab").forEach(btn => btn.addEventListener("click", () => a(btn.dataset.date)));'
content = content.replace('try{await s(u,v)}', event_listener + 'try{await s(u,v,e)}') # Injecting e (viewDate) into s

# Update s to support viewDate for re-render
content = content.replace('async function s(e,n){', 'async function s(e,n,currentViewDate){')
content = content.replace('await a()}', 'await a(currentViewDate)}')

# 2. Update Lt (Owner Reports)
# We need to change the logic from "today" to "all completed bookings" but keep today's stats separate.
# Actually the requirement says "In admin panel reports show only for current day. Reset at 24:00".
# Let's check Lt logic. It already has "today" (c) and "month" (u).
# It uses const l=d.getTodayStr().

# The user says "In admin panel reports are presented only for current day. Reset at 24:00".
# This sounds like they want the main dashboard/reports to strictly stick to "today".
# Our current kt (Reports and revenue) uses d.getTodayStr() indirectly? 
# Wait, kt uses o=a.filter(r=>r.status==="completed"). It shows EVERYTHING completed.
# Let's restrict it to today.

kt_old = 'const o=a.filter(r=>r.status==="completed"),'
kt_new = 'const today=d.getTodayStr(),o=a.filter(r=>r.status==="completed" && (r.date.includes("T")?r.date.split("T")[0]:r.date)===today),'
content = content.replace(kt_old, kt_new)

with open('reports-CfWSr_lZ_updated.js', 'w', encoding='utf-8') as f:
    f.write(content)
