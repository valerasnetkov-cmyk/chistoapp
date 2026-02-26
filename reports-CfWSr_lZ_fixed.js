(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))e(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&e(l)}).observe(document,{childList:!0,subtree:!0});function s(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function e(n){if(n.ep)return;n.ep=!0;const o=s(n);fetch(n.href,o)}})();const tt={DEFAULT_CAR_WASH_ID:1};function et(){return tt.DEFAULT_CAR_WASH_ID}const at="/api";async function x(t,a={}){const s=et();try{const e=await fetch(`${at}${t}`,{...a,headers:{"Content-Type":"application/json","X-Car-Wash-Id":s,...a.headers}});if(!e.ok){const n=await e.json().catch(()=>({}));if(e.status===404)return null;throw new Error(n.error||`API Error: ${e.status}`)}return await e.json()}catch(e){return console.error(e),null}}async function B(t){try{const a=localStorage.getItem("cit_"+t);return a?JSON.parse(a):null}catch{return null}}async function D(t,a){localStorage.setItem("cit_"+t,JSON.stringify(a))}async function q(t){let a=null;if(t==="services")a=await x("/services");else if(t==="washers")a=await x("/washers");else if(t==="bookings")a=await x("/bookings");else if(t==="posts")a=await x("/posts");else if(t==="notifications")a=await x("/notifications");else if(t==="bonusHistory")a=await x("/bonusHistory");else if(t==="users"){const s=await x("/users")||[],e=await B("users")||[],n=new Map;return s.forEach(o=>n.set(String(o.id),o)),e.forEach(o=>n.set(String(o.id),o)),Array.from(n.values())}else a=await B(t);return t==="posts"&&(!a||a.length===0)?[{id:1,name:"Пост 1"},{id:2,name:"Пост 2"},{id:3,name:"Пост 3"}]:t==="notifications"&&Array.isArray(a)?a.map(s=>({...s,userId:s.user_id,read:!!s.is_read,createdAt:s.created_at,data:s.data?typeof s.data=="string"?JSON.parse(s.data):s.data:null})):Array.isArray(a)?a:[]}async function st(t,a){if(!a)return null;if(t==="users"){const e=await x(`/users/${a}`);if(e)return e}return(await q(t)).find(e=>String(e.id)===String(a))||null}async function it(t,a){if(t==="bookings")return await x("/bookings",{method:"POST",body:JSON.stringify(a)});if(t==="services")return await x("/services",{method:"POST",body:JSON.stringify(a)});if(t==="notifications")return await x("/notifications",{method:"POST",body:JSON.stringify(a)});if(t==="washers")return await x("/washers",{method:"POST",body:JSON.stringify(a)});if(t==="bonusHistory")return await x("/bonusHistory",{method:"POST",body:JSON.stringify(a)});if(t==="users"){const n=await x("/auth/register",{method:"POST",body:JSON.stringify(a)});if(n&&n.success)return n;const o=await B(t)||[],l={id:R(),...a,createdAt:new Date().toISOString()};return o.push(l),await D(t,o),l}const s=await q(t),e={id:R(),...a,createdAt:new Date().toISOString()};return s.push(e),await D(t,s),e}async function nt(t,a,s){if(t==="bookings")return await x(`/bookings/${a}`,{method:"PATCH",body:JSON.stringify(s)});if(t==="notifications")return await x(`/notifications/${a}`,{method:"PATCH",body:JSON.stringify(s)});if(t==="washers")return await x(`/washers/${a}`,{method:"PATCH",body:JSON.stringify(s)});if(t==="users"){const l=await x(`/users/${a}`,{method:"PATCH",body:JSON.stringify(s)});if(l)return l;const c=await B(t)||[],r=c.findIndex(m=>String(m.id)===String(a));if(r!==-1)return c[r]={...c[r],...s,updatedAt:new Date().toISOString()},await D(t,c),c[r]}const e=await q(t),n=e.findIndex(l=>String(l.id)===String(a));if(n===-1)return null;const o={...e[n],...s,updatedAt:new Date().toISOString()};return e[n]=o,await D(t,e),o}async function rt(t,a){if(t==="services")return await x(`/services/${a}`,{method:"DELETE"});if(t==="washers")return await x(`/washers/${a}`,{method:"DELETE"});const e=(await q(t)).filter(n=>String(n.id)!==String(a));await D(t,e)}function R(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function ot(){const t=new Date,a=t.getTimezoneOffset();return new Date(t.getTime()-a*60*1e3).toISOString().split("T")[0]}function lt(){console.log("App initialized with server-side data.")}const d={get:B,set:D,uid:R,getAll:q,getById:st,add:it,update:nt,remove:rt,getTodayStr:ot,initDefaults:lt,apiFetch:x};var Q;const M=(Q=window.Telegram)==null?void 0:Q.WebApp,ct=111062181;async function Y(t,a){const s=await d.apiFetch("/auth/login",{method:"POST",body:JSON.stringify({login:t,password:a})});return s&&s.success?(await d.set("currentUser",s.user),localStorage.setItem("cit_auth_token",s.token||"logged_in"),localStorage.setItem("cit_persistent_user",JSON.stringify(s.user)),s.user):null}async function bt({login:t,password:a,name:s,phone:e,carNumber:n}){const o=s||e||n||"Клиент",l=await d.apiFetch("/auth/register",{method:"POST",body:JSON.stringify({login:t,password:a,name:o,phone:e,car_number:n})});return l&&l.success?await Y(t,a):{error:"Ошибка регистрации"}}function dt(){localStorage.removeItem("cit_currentUser"),localStorage.removeItem("cit_auth_token"),localStorage.removeItem("cit_persistent_user")}async function L(){var s;const t=await d.get("currentUser");if(t){if(!isNaN(parseInt(t.id))){const e=await d.apiFetch(`/users/${t.id}`);if(e)return await d.set("currentUser",e),e}return t}if((s=M==null?void 0:M.initDataUnsafe)!=null&&s.user){const e=M.initDataUnsafe.user,n=`tg_${e.id}`,o=await d.apiFetch(`/users/${n}`);return o?(await d.set("currentUser",o),o):{id:n,login:n,name:`${e.first_name} ${e.last_name||""}`.trim(),role:e.id===ct?"owner":"client",bonus_balance:0,cashback_percent:5,tg_id:e.id}}const a=localStorage.getItem("cit_persistent_user");if(a){const e=JSON.parse(a);return await d.set("currentUser",e),e}return null}async function _t(t){const a=await L();if(!a)return null;const s=await d.update("users",a.id,t);return s&&(await d.set("currentUser",s),localStorage.setItem("cit_persistent_user",JSON.stringify(s))),s}const V={};let N=null;function xt(t,a,s={}){V[t]={handler:a,...s}}function $(t){window.location.hash="#"+t}function X(){return window.location.hash.slice(1)||"/"}async function C(){const t=X(),a=document.getElementById("app");N&&typeof N=="function"&&(N(),N=null);const s=await L();if(t==="/login"&&s&&s.role==="client"){$("/dashboard");return}if(t.startsWith("/admin")||t.startsWith("/owner")){if(t==="/admin/login"){if(s&&(s.role==="admin"||s.role==="owner")){s.role==="admin"?$("/admin"):$("/owner");return}}else if(!s||s.role!=="admin"&&s.role!=="owner"){$("/admin/login");return}}if(t==="/login"&&s){if(s.role==="admin"){$("/admin");return}if(s.role==="owner"){$("/owner");return}}const e=V[t];if(e){const n=await e.handler(a);typeof n=="function"&&(N=n)}else s?s.role==="admin"?$("/admin"):s.role==="owner"?$("/owner"):$("/"):$("/")}function $t(){window.addEventListener("hashchange",C),C()}async function K(t){return(await d.getAll("notifications")||[]).filter(s=>s&&String(s.userId)===String(t)).sort((s,e)=>new Date(e.createdAt)-new Date(s.createdAt))}async function Z(t){return(await d.getAll("notifications")||[]).filter(s=>s&&String(s.userId)===String(t)&&!s.read).length}async function ut(t){await d.update("notifications",t,{read:!0})}async function mt(t){const s=(await d.getAll("notifications")||[]).map(e=>e&&String(e.userId)===String(t)&&!e.read?{...e,read:!0}:e);await d.set("notifications",s)}async function P({userId:t,type:a,message:s,icon:e,data:n}){return await d.add("notifications",{userId:t,type:a,message:s,icon:e||pt(a),read:!1,data:n||null})}function pt(t){return{reminder:"⏰",post_assigned:"📍",wash_complete:"✅",low_rating:"⚠️",bonus:"🎁",info:"ℹ️"}[t]||"ℹ️"}async function St(t,a,s){const e=await d.getAll("users")||[],n=e.filter(u=>u&&u.role==="admin"),o=e.filter(u=>u&&u.role==="owner"),l=await d.getAll("washers")||[],c=t.washer_id||t.washerId,r=c?l.find(u=>String(u.id)===String(c)):null,m=t.user_id||t.userId,p=e.find(u=>String(u.id)===String(m)),f={id:t.id,bookingId:t.id,clientPhone:(p==null?void 0:p.phone)||t.phone||"нет",clientCar:(p==null?void 0:p.car_number)||(p==null?void 0:p.carNumber)||t.car_number||t.carNumber||"не указан",bodyType:t.body_type||t.bodyType||"не указан",rating:a,review:t.review||t.comment||"без комментария",comment:t.review||t.comment||"без комментария",time:t.time||"--:--",date:t.date||new Date().toISOString(),washerName:(r==null?void 0:r.name)||"не назначен",totalPrice:t.total_price||t.totalPrice||0},i=`Плохая оценка: ${a}⭐ от ${f.clientCar}. Жмите для деталей.`;if(a<=3)for(const u of n)await P({userId:u.id,type:"low_rating",message:i,icon:"⚠️",data:f});if(a<=2)for(const u of o)await P({userId:u.id,type:"low_rating",message:i,icon:"🔴",data:f})}async function H(t,a,s){await P({userId:s,type:"post_assigned",message:`Ваша машина ожидается на ${a}. Пожалуйста, подъезжайте!`,icon:"📍"})}async function ft(t){await P({userId:t,type:"wash_complete",message:"Мойка завершена! Можете забрать свой автомобиль. Не забудьте оценить качество!",icon:"✅"})}async function O({title:t,content:a,footer:s,onClose:e}){const n=document.getElementById("modal-container"),o=document.createElement("div");o.className="modal-backdrop";const l=document.createElement("div");l.className="modal",l.innerHTML=`<style>.modal { padding: 12px !important; max-width: 95vw !important; width: 340px !important; } .modal__header { margin-bottom: 8px !important; } .modal__title { font-size: 1.1rem !important; }</style>
    <div class="modal__header">
      <h3 class="modal__title">${t}</h3>
      <button class="modal__close">&times;</button>
    </div>
    <div class="modal__body">${a}</div>
    ${s?`<div class="modal__footer">${s}</div>`:""}
  `,n.appendChild(o),n.appendChild(l);async function c(){o.style.opacity="0",l.style.opacity="0",l.style.transform="translate(-50%, -50%) scale(0.95)",setTimeout(async()=>{o.remove(),l.remove()},200),e&&e()}return o.addEventListener("click",c),l.querySelector(".modal__close").addEventListener("click",c),{modal:l,close:c}}async function k(){const t=await L();if(!t)return"";const a=await Z(t.id),s=t.name?t.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2):"??";let e="";return t.role==="client"?e=`
      <a href="#/dashboard" class="app-header__link" data-route="/dashboard">🏠 Главная</a>
      <a href="#/booking" class="app-header__link" data-route="/booking">📝 Запись</a>
      <a href="#/history" class="app-header__link" data-route="/history">📋 История</a>
      <a href="#/loyalty" class="app-header__link" data-route="/loyalty">🎁 Бонусы</a>
      <a href="#/contacts" class="app-header__link" data-route="/contacts">📞 Контакты</a>
      <a href="#/tips" class="app-header__link" data-route="/tips">💡 Советы</a>
    `:t.role==="admin"?e=`
      <a href="#/admin" class="app-header__link" data-route="/admin">🏠 Обзор</a>
      <a href="#/admin/queue" class="app-header__link" data-route="/admin/queue">📋 Очередь</a>
      <a href="#/admin/booking" class="app-header__link" data-route="/admin/booking">📝 Запись</a>
    `:t.role==="owner"&&(e=`
      <a href="#/owner" class="app-header__link" data-route="/owner">🏠 Обзор</a>
      <a href="#/owner/services" class="app-header__link" data-route="/owner/services">🛠️ Услуги</a>
      <a href="#/owner/staff" class="app-header__link" data-route="/owner/staff">👥 Мойщики</a>
      <a href="#/owner/reports" class="app-header__link" data-route="/owner/reports">📊 Отчёты</a>
    `),`
    <header class="app-header">
      <a href="#/" class="app-header__logo">
        <span class="app-header__logo-icon">💧</span>
        Чисто и точка
      </a>
      <button class="app-header__menu-toggle" id="menu-toggle">☰</button>
      <nav class="app-header__nav" id="main-nav">
        ${e}
      </nav>
      <div class="app-header__actions">
        <button class="app-header__notif-btn" id="notif-btn" title="Уведомления">
          🔔
          ${a>0?`<span class="notification-badge">${a}</span>`:""}
        </button>
        <div class="app-header__user" id="user-menu">
          <div class="app-header__avatar">${s}</div>
          <span class="app-header__username">${t.name?t.name.split(" ")[0]:"Гость"}</span>
        </div>
      </div>
    </header>
  `}async function T(){const t=await L();if(!t)return;const a=await X();document.querySelectorAll(".app-header__link").forEach(l=>{l.dataset.route===a&&l.classList.add("app-header__link--active")});const s=document.getElementById("menu-toggle"),e=document.getElementById("main-nav");s&&e&&s.addEventListener("click",()=>{e.classList.toggle("app-header__nav--open")});const n=document.getElementById("notif-btn");n&&n.addEventListener("click",async l=>{l.preventDefault(),l.stopPropagation(),await gt(t)});const o=document.getElementById("user-menu");o&&o.addEventListener("click",async()=>{t.role==="client"?await $("/profile"):(dt(),await $("/login"))})}async function gt(t){var o,l;const a=document.querySelector(".notifications-panel");if(a){a.remove();return}const s=await K(t.id),e=document.createElement("div");e.className="notifications-panel",e.style.background="#ffffff",e.innerHTML=`
    <div class="notifications-panel__header" style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 16px; font-weight: 700; margin: 0;">Уведомления</h3>
      <div style="display:flex; gap: 8px;">
        <button class="btn btn--ghost btn--sm" id="mark-all-read" style="font-size: 12px; padding: 4px 8px;">Прочитать все</button>
        <button class="btn btn--ghost btn--sm" id="close-notif" style="font-size: 16px; padding: 4px 8px;">✕</button>
      </div>
    </div>
    <div class="notifications-panel__list" style="display: flex; flex-direction: column;">
        ${s.length===0?`
          <div class="empty-state" style="padding: 40px 20px; text-align: center; color: #94a3b8;">
            <div style="font-size: 32px; margin-bottom: 8px;">🔔</div>
            <div style="font-weight: 600;">Нет уведомлений</div>
          </div>
        `:s.map(c=>`
          <button class="notification-item ${c.read?"":"notification-item--unread"}" 
               data-id="${c.id}" 
               style="width: 100%; text-align: left; background: ${c.read?"#fff":"#f0f7ff"}; border: none; border-bottom: 1px solid #f1f5f9; padding: 12px 16px; display: flex; gap: 12px; cursor: pointer; position: relative;">
            <span style="font-size: 20px; flex-shrink: 0;">${c.icon||"ℹ️"}</span>
            <div style="flex: 1; pointer-events: none;">
              <div style="font-size: 14px; line-height: 1.4; color: #1e293b; margin-bottom: 4px;">${c.message}</div>
              <div style="font-size: 11px; color: #94a3b8;">${vt(c.createdAt)}</div>
            </div>
            ${c.data||c.type==="wash_complete"?'<span style="color: #2563eb; align-self: center; font-weight: bold;">→</span>':""}
          </button>
        `).join("")}
    </div>
  `,document.body.appendChild(e),e.querySelectorAll(".notification-item").forEach(c=>{c.addEventListener("click",async r=>{r.preventDefault(),r.stopPropagation();const m=c.dataset.id,p=s.find(f=>String(f.id)===String(m));if(p){if(await ut(p.id),p.type==="low_rating"&&p.data){const u=p.data.bookingId||p.data.id;if(u){const v=await d.getById("bookings",u);await F(v||p.data)}else await F(p.data)}else p.type==="wash_complete"&&await $("/history");e.remove();const f=await Z(t.id),i=document.querySelector(".notification-badge");i&&(f>0?i.textContent=f:i.remove())}})}),(o=document.getElementById("close-notif"))==null||o.addEventListener("click",c=>{c.stopPropagation(),e.remove()}),(l=document.getElementById("mark-all-read"))==null||l.addEventListener("click",async c=>{c.stopPropagation(),await mt(t.id),e.remove();const r=document.querySelector(".notification-badge");r&&r.remove()});const n=c=>{!e.contains(c.target)&&!c.target.closest("#notif-btn")&&(e.remove(),document.removeEventListener("click",n))};setTimeout(()=>{document.addEventListener("click",n)},100)}async function F(t){const a=t.rating||0,s=t.review||t.comment||"без комментария",e=t.total_price||t.totalPrice||0,n=t.user_id||t.userId,o=t.washer_id||t.washerId;let l=null;n&&(l=await d.getById("users",n));const c=await d.getAll("washers"),r=o?c.find(v=>String(v.id)===String(o)):null,m=t.car_number||t.carNumber||(l==null?void 0:l.car_number)||(l==null?void 0:l.carNumber)||"не указан",p=t.phone||t.clientPhone||(l==null?void 0:l.phone)||"нет",i={sedan:"Седан",suv:"Внедорожник",crossover:"Кроссовер",minivan:"Минивэн"}[t.body_type||t.bodyType]||t.body_type||t.bodyType||"не указан";let u="неизвестно";try{if(t.date){const v=new Date(t.date);u=isNaN(v.getTime())?t.date:v.toLocaleDateString("ru-RU")}}catch{}await O({title:"Детали мойки 🚿",content:`<div class="rating-details" style="display: flex; flex-direction: column; gap: 4px; margin: -10px 0;">
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
                    </div>`}).then(({modal:v,close:I})=>{var g;(g=document.getElementById("close-rating-modal"))==null||g.addEventListener("click",I)})}function vt(t){if(!t)return"";const a=new Date(t),e=Math.floor((new Date-a)/1e3);return e<60?"только что":e<3600?`${Math.floor(e/60)} мин. назад`:e<86400?`${Math.floor(e/3600)} ч. назад`:e<172800?"вчера":a.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}async function b(t,a="info",s=3500){const e=document.getElementById("toast-container"),n={success:"✅",error:"❌",warning:"⚠️",info:"ℹ️"},o=document.createElement("div");o.className=`toast toast--${a}`,o.innerHTML=`
    <span class="toast__icon">${n[a]||n.info}</span>
    <span class="toast__message">${t}</span>
    <button class="toast__close" onclick="this.parentElement.remove()">✕</button>
  `,e.appendChild(o),setTimeout(async()=>{o.style.opacity="0",o.style.transform="translateX(100%)",o.style.transition="all 0.3s ease",setTimeout(()=>o.remove(),300)},s)}async function It(t){t.innerHTML=`
    <div class="login-page">
      <div class="glass-card glass-card--elevated login-card">
        <div class="login-card__header">
          <span class="login-card__logo">🛡️</span>
          <h1 class="login-card__title">Админ-панель</h1>
          <p class="login-card__subtitle">Вход для персонала</p>
        </div>

        <div id="login-form-container">
          <form class="login-card__form" id="admin-login-form">
            <div class="form-group">
              <label class="form-label">Логин</label>
              <input type="text" class="form-input" id="admin-login-input" placeholder="Введите логин" required autocomplete="username">
            </div>
            <div class="form-group">
              <label class="form-label">Пароль</label>
              <input type="password" class="form-input" id="admin-password-input" placeholder="Введите пароль" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn--primary btn--lg btn--full">Войти в систему</button>
          </form>
        </div>

        <div style="margin-top: var(--space-xl); text-align: center;">
          <a href="#/login" class="text-secondary" style="font-size: var(--font-size-sm);">← Вернуться к обычному входу</a>
        </div>
      </div>
    </div>
  `,document.getElementById("admin-login-form").addEventListener("submit",async a=>{a.preventDefault();const s=document.getElementById("admin-login-input").value.trim(),e=document.getElementById("admin-password-input").value.trim(),n=await Y(s,e);n?n.role==="admin"||n.role==="owner"?(b(`Доступ разрешен. Добро пожаловать, ${n.name}!`,"success"),n.role==="admin"?$("/admin"):$("/owner")):b("Ошибка: У вас нет прав доступа к админ-панели","error"):b("Неверный логин или пароль","error")})}async function Et(t){const a=await L();if(!a||a.role!=="admin"&&a.role!=="owner"){window.location.hash="#/admin/login";return}const s=d.getTodayStr(),n=(await d.getAll("bookings")||[]).filter(i=>!i||!i.date?!1:(i.date.includes("T")?i.date.split("T")[0]:i.date)===s);await d.getAll("services");const o=await d.getAll("washers")||[],l=await d.getAll("users")||[],c=[{id:1,name:"Пост 1"},{id:2,name:"Пост 2"},{id:3,name:"Пост 3"}],r=n.filter(i=>i&&["pending","waiting"].includes(i.status)),m=n.filter(i=>i&&i.status==="in_progress"),p=n.filter(i=>i&&i.status==="completed");(await K(a.id)||[]).filter(i=>i&&i.type==="low_rating"&&!i.read),t.innerHTML=`
    ${await k()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">🛡️ Панель администратора</h1>
        <p class="page-header__subtitle">Управление мойкой — ${new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"})}</p>
      </div>

      <!-- Stats -->
      <div class="dashboard-grid--stats mb-2xl">
        <a href="#/admin/queue" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">⏳</span>
          <div class="stat-card__value">${r.length}</div>
          <div class="stat-card__label">В очереди</div>
        </a>
        <a href="#/admin/queue" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">🚿</span>
          <div class="stat-card__value">${m.length}</div>
          <div class="stat-card__label">На мойке</div>
        </a>
        <a href="#/admin/queue" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">✅</span>
          <div class="stat-card__value">${p.length}</div>
          <div class="stat-card__label">Завершено</div>
        </a>
        <a href="#/owner/reports" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">💰</span>
          <div class="stat-card__value">${p.reduce((i,u)=>i+parseFloat(u.total_price||u.totalPrice||0),0)} ₽</div>
          <div class="stat-card__label">Выручка сегодня</div>
        </a>
      </div>

      <!-- Posts status -->
      <div class="glass-card glass-card--static mb-2xl">
        <h3 style="margin-bottom:var(--space-lg);">📍 Статус постов</h3>
        <div class="grid-3 stagger-children">
          ${c.map(i=>{const u=m.find(g=>(g.post_id||g.postNumber)==i.id),v=u?o.find(g=>g.id==(u.washer_id||u.washerId)):null,I=u?l.find(g=>g.id==(u.user_id||u.userId)):null;return`
              <div class="glass-card ${u?"":"glass-card--static"}" style="text-align:center;">
                <div style="font-size:1.5rem;margin-bottom:var(--space-md);">${u?"🚿":"✅"}</div>
                <div style="font-weight:700;font-size:var(--font-size-lg);">${i.name}</div>
                <div class="badge badge--${u?"accent":"success"}" style="margin-top:var(--space-sm);">
                  ${u?"Занят":"Свободен"}
                </div>
                ${u?`
                  <div style="margin-top:var(--space-md);font-size:var(--font-size-sm);" class="text-secondary">
                    ${I?I.name||"Гость":"Запись #"+u.id}<br>
                    ${(v==null?void 0:v.name)||"Мойщик не назначен"}
                  </div>
                `:""}
              </div>
            `}).join("")}
        </div>
      </div>

      <!-- Quick actions -->
      <div class="grid-3 stagger-children">
        <a href="#/admin/queue" class="glass-card quick-action" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="quick-action__icon">📋</span>
          <span class="quick-action__label">Управление очередью</span>
        </a>
        <a href="#/admin/booking" class="glass-card quick-action" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="quick-action__icon">📝</span>
          <span class="quick-action__label">Записать клиента</span>
        </a>
        <a href="#/owner/reports" class="glass-card quick-action" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="quick-action__icon">📊</span>
          <span class="quick-action__label">Записей сегодня: ${n.length}</span>
        </a>
      </div>
    </main>
  `,T()}async function At(t){await L(),await a();async function a(){const e=d.getTodayStr(),n=await d.getAll("bookings")||[],o=n.filter(i=>!i||!i.date||i.status==="cancelled"?!1:(i.date.includes("T")?i.date.split("T")[0]:i.date)===e).sort((i,u)=>{const v={in_progress:0,waiting:1,pending:2,completed:3};return(v[i.status]??9)-(v[u.status]??9)||(i.time||"").localeCompare(u.time||"")}),l=await d.getAll("services")||[],c=(await d.getAll("washers")||[]).filter(i=>i&&i.active),r=await d.getAll("posts")||[],m=await d.getAll("users")||[],p=n.filter(i=>i.status==="in_progress").map(i=>String(i.washer_id||i.washerId)),f=n.filter(i=>i.status==="in_progress").map(i=>String(i.post_id||i.postNumber));t.innerHTML=`
      ${await k()}
      <main class="page-content animate-fade-in">
        <div class="page-header flex justify-between items-center flex-wrap gap-lg">
          <div style="flex: 1; min-width: 200px;">
            <h1 class="page-header__title">📋 Очередь на сегодня</h1>
            <p class="page-header__subtitle">${new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"})}</p>
          </div>
          <a href="#/admin/booking" class="btn btn--primary" style="white-space: nowrap;">+ Записать клиента</a>
        </div>

        ${o.length===0?`
          <div class="glass-card text-center" style="padding:var(--space-4xl);">
            <div style="font-size:3rem;margin-bottom:var(--space-lg);">📋</div>
            <h3>Очередь пуста</h3>
            <p class="text-secondary mt-sm">На сегодня записей нет</p>
          </div>
        `:`
          <div class="queue-list stagger-children">
            ${o.map((i,u)=>{const v=m.find(_=>String(_.id)===String(i.user_id||i.userId)),g=(i.service_ids?typeof i.service_ids=="string"?JSON.parse(i.service_ids):i.service_ids:i.serviceIds||[]).map(_=>l.find(z=>String(z.id)===String(_))).filter(Boolean),y=String(i.washer_id||i.washerId||""),w=String(i.post_id||i.postNumber||""),S=y?c.find(_=>String(_.id)===y):null,h=w?r.find(_=>String(_.id)===w):null,E=(v==null?void 0:v.car_number)||(v==null?void 0:v.carNumber)||"",A=(v==null?void 0:v.phone)||"",j=(v==null?void 0:v.name)||"";let U="";return E?U=`<span style="font-weight: 800; font-size: 1.1rem;">${E}</span> ${A?`<span class="text-secondary">(${A})</span>`:""}`:j?U=`<span style="font-weight: 700;">${j}</span> ${A?`<span class="text-secondary">(${A})</span>`:""}`:U=`<span class="text-danger">Запись #${i.id} (Нет данных клиента)</span>`,`
                <div class="glass-card queue-item">
                  <div class="queue-item__number">${u+1}</div>
                  <div class="queue-item__info">
                    <div class="queue-item__name">
                      ${U}
                    </div>
                    <div class="queue-item__car">
                      🕐 ${i.time} · ${g.map(_=>_.name).join(", ")} · 
                      <strong>${i.total_price||i.totalPrice||0} ₽</strong>
                    </div>
                    <div style="margin-top:var(--space-sm);display:flex;gap:var(--space-sm);align-items:center;flex-wrap:wrap;">
                      <span class="badge badge--${ht(i.status)}">${yt(i.status)}</span>
                      ${h?`<span class="badge badge--accent">📍 ${h.name}</span>`:""}
                      ${S?`<span class="badge badge--glass">👤 ${S.name}</span>`:""}
                    </div>
                  </div>
                  <div class="queue-item__controls">
                    ${i.status==="pending"?`
                      <button class="btn btn--warning btn--sm action-btn" data-action="call" data-id="${i.id}" style="min-width: 100px;">📢 Вызвать</button>
                    `:""}
                    ${i.status==="waiting"||i.status==="pending"?`
                      <div class="flex gap-sm flex-wrap" style="flex: 1; justify-content: flex-end;">
                        <select class="form-select" style="padding:0.3rem 2rem 0.3rem 0.5rem;font-size:var(--font-size-xs);width: auto; flex: 1; min-width: 100px;" id="post-${i.id}">
                          <option value="">Пост...</option>
                          ${r.map(_=>{const z=f.includes(String(_.id))&&w!==String(_.id);return`<option value="${_.id}" ${w===String(_.id)?"selected":""} ${z?"disabled":""}>${_.name} ${z?"(Занят)":""}</option>`}).join("")}
                        </select>
                        <select class="form-select" style="padding:0.3rem 2rem 0.3rem 0.5rem;font-size:var(--font-size-xs);width: auto; flex: 1; min-width: 100px;" id="washer-${i.id}">
                          <option value="">Мойщик...</option>
                          ${c.map(_=>{const z=p.includes(String(_.id))&&y!==String(_.id);return`<option value="${_.id}" ${y===String(_.id)?"selected":""} ${z?"disabled":""}>${_.name} ${z?"(Занят)":""}</option>`}).join("")}
                        </select>
                        <button class="btn btn--primary btn--sm action-btn" data-action="start" data-id="${i.id}">▶ Начать</button>
                      </div>
                    `:""}
                    ${i.status==="in_progress"?`
                      <button class="btn btn--success btn--sm action-btn" data-action="complete" data-id="${i.id}">✅ Завершить</button>
                    `:""}
                  </div>
                </div>
              `}).join("")}
          </div>
        `}
      </main>
    `,T(),document.querySelectorAll(".action-btn").forEach(i=>{i.addEventListener("click",async()=>{const u=i.dataset.action,v=i.dataset.id;try{await s(u,v)}catch(I){console.error("Action failed:",I),b("Ошибка при выполнении действия","error")}})})}async function s(e,n){const o=await d.getById("bookings",n);if(!o)return;const l=o.user_id||o.userId;if(e==="call"){if(await d.update("bookings",n,{status:"waiting"}),l){const c=await d.getById("users",l);await H(o,"мойку",l),b(`Клиент ${(c==null?void 0:c.car_number)||(c==null?void 0:c.carNumber)||(c==null?void 0:c.name)||""} вызван`,"info")}else b("Гость вызван","info");await a()}if(e==="start"){const c=document.getElementById(`post-${n}`),r=document.getElementById(`washer-${n}`),m=c==null?void 0:c.value,p=r==null?void 0:r.value;if(!m||!p){b("Выберите пост и мойщика","warning");return}const f=(await d.getAll("posts")||[]).find(u=>String(u.id)===String(m)),i=(f==null?void 0:f.name)||`Пост ${m}`;await d.update("bookings",n,{status:"in_progress",postNumber:m,washerId:p}),l&&await H(o,i,l),b("Мойка начата!","success"),await a()}e==="complete"&&(await d.update("bookings",n,{status:"completed"}),l&&await ft(l),b("Мойка завершена!","success"),await a())}}function yt(t){return{pending:"Ожидание",waiting:"Вызван",in_progress:"Моется",completed:"Завершена",cancelled:"Отменена"}[t]||t}function ht(t){return{pending:"primary",waiting:"warning",in_progress:"accent",completed:"success",cancelled:"danger"}[t]||"glass"}async function zt(t){const a=(await d.getAll("services")||[]).filter(r=>r&&r.active),s=await d.get("bodyTypeMultipliers")||{sedan:{label:"Седан",multiplier:1},suv:{label:"Внедорожник",multiplier:1.3},crossover:{label:"Кроссовер",multiplier:1.2},minivan:{label:"Минивэн",multiplier:1.5}},e=(await d.getAll("users")||[]).filter(r=>r&&r.role==="client"),n=await d.getAll("bookings")||[],o=d.getTodayStr();t.innerHTML=`
    ${await k()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">📝 Записать клиента</h1>
        <p class="page-header__subtitle">Выберите дату и время записи</p>
      </div>

      <div style="max-width:640px;">
        <div class="glass-card glass-card--elevated">
          <form id="admin-booking-form" class="flex flex-col gap-xl">

            <!-- Client selection -->
            <div class="form-group">
              <label class="form-label">Клиент</label>
              <select class="form-select" id="ab-client">
                <option value="">Выберите клиента...</option>
                ${e.map(r=>`<option value="${r.id}">${r.name||r.phone||"Без имени"} (${r.carNumber||r.car_number||"???"})</option>`).join("")}
              </select>
            </div>

            <!-- Or new client -->
            <div style="text-align:center;">
              <span class="text-muted" style="font-size:var(--font-size-sm);">или данные нового</span>
            </div>
            
            <div class="glass-card glass-card--static" style="padding:var(--space-lg);">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Телефон</label>
                  <input type="tel" class="form-input" id="ab-new-phone" placeholder="+7...">
                </div>
                <div class="form-group">
                  <label class="form-label">Номер машины</label>
                  <input type="text" class="form-input" id="ab-new-car" placeholder="А000АА000">
                </div>
              </div>
            </div>

            <!-- Body Type -->
            <div class="form-group">
              <label class="form-label">Тип кузова</label>
              <select class="form-select" id="ab-bodytype" required>
                ${Object.entries(s).map(([r,m])=>`
                  <option value="${r}">${m.label}</option>
                `).join("")}
              </select>
            </div>

            <!-- Services -->
            <div class="form-group">
              <label class="form-label">Услуги</label>
              <div class="flex flex-col gap-sm">
                ${a.map(r=>`
                  <label class="service-option">
                    <div class="service-option__info">
                      <input type="checkbox" name="ab-services" value="${r.id}" style="accent-color:var(--color-primary);">
                      <span class="service-option__name">${r.icon||"🧼"} ${r.name}</span>
                    </div>
                    <span class="service-option__price">${r.price} ₽</span>
                  </label>
                `).join("")}
              </div>
            </div>

            <!-- Date & Time Selection -->
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Дата</label>
                <select class="form-select" id="ab-date" required>
                  ${wt().map(r=>`<option value="${r.value}">${r.label}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Время</label>
                <select class="form-select" id="ab-time" required>
                  <option value="">Выберите время...</option>
                  ${J(o,n).map(r=>`
                    <option value="${r.time}" ${r.disabled?"disabled":""}>
                      ${r.time} ${r.disabled?"(Мест нет)":""}
                    </option>
                  `).join("")}
                </select>
              </div>
            </div>

            <button type="submit" class="btn btn--primary btn--lg btn--full">Создать запись</button>
          </form>
        </div>
      </div>
    </main>
  `,T();const l=document.getElementById("ab-date"),c=document.getElementById("ab-time");l.addEventListener("change",()=>{const r=J(l.value,n);c.innerHTML='<option value="">Выберите время...</option>'+r.map(m=>`
        <option value="${m.time}" ${m.disabled?"disabled":""}>
          ${m.time} ${m.disabled?"(Мест нет)":""}
        </option>
      `).join("")}),document.getElementById("admin-booking-form").addEventListener("submit",async r=>{var S;r.preventDefault();let m=document.getElementById("ab-client").value;const p=document.getElementById("ab-new-phone").value.trim(),f=document.getElementById("ab-new-car").value.trim();if(!m){if(!p||!f){b("Выберите клиента или введите телефон и номер машины","warning");return}m=(await d.add("users",{login:p,password:"1234_NO_PASSWORD",name:f,phone:p,carNumber:f,role:"client",bonusBalance:0,cashbackPercent:5})).id}const i=[];if(document.querySelectorAll('input[name="ab-services"]:checked').forEach(h=>{i.push(h.value)}),i.length===0){b("Выберите хотя бы одну услугу","warning");return}const u=l.value,v=c.value;if(!v){b("Выберите время записи","warning");return}const I=document.getElementById("ab-bodytype").value,g=((S=s[I])==null?void 0:S.multiplier)||1,y=i.reduce((h,E)=>{const A=a.find(j=>String(j.id)===String(E));return h+(A?Math.round(A.price*g):0)},0),w=n.filter(h=>(h.date.includes("T")?h.date.split("T")[0]:h.date)===u&&h.time===v&&h.status!=="cancelled");if(w.length>=3){b("К сожалению, на это время уже записано 3 клиента","error");return}if(await d.add("bookings",{user_id:m,service_ids:i,body_type:I,date:u,time:v,status:"pending",total_price:y}),w.length===2){const h=(await d.getAll("users")).filter(E=>E.role==="admin"||E.role==="owner");for(const E of h)await P({userId:E.id,type:"info",message:`Лимит записи достигнут: на ${new Date(u).toLocaleDateString("ru-RU")} в ${v} занято 3 поста.`,icon:"🚫"})}b("Запись успешно создана!","success"),$("/admin/queue")})}function wt(){const t=[],a=new Date;for(let s=0;s<5;s++){const e=new Date(a);e.setDate(a.getDate()+s);const n=e.toISOString().split("T")[0];let o=e.toLocaleDateString("ru-RU",{day:"numeric",month:"long"});s===0&&(o="Сегодня"),s===1&&(o="Завтра"),t.push({value:n,label:o})}return t}function J(t,a){const s=new Date,e=[];for(let l=8;l<=21;l++)e.push(`${l.toString().padStart(2,"0")}:00`),l<21&&e.push(`${l.toString().padStart(2,"0")}:30`);const n=d.getTodayStr(),o=s.getHours()*60+s.getMinutes();return e.filter(l=>{if(t!==n)return!0;const[c,r]=l.split(":").map(Number);return c*60+r>o+15}).map(l=>{const c=a.filter(r=>(r.date.includes("T")?r.date.split("T")[0]:r.date)===t&&r.time.startsWith(l)&&r.status!=="cancelled").length;return{time:l,disabled:c>=3}})}async function Lt(t){await L();const a=await d.getAll("bookings")||[],s=await d.getAll("services")||[],e=await d.getAll("washers")||[],n=await d.getAll("users")||[],o=new Date,l=d.getTodayStr(),c=a.filter(g=>!g||!g.date?!1:(g.date.includes("T")?g.date.split("T")[0]:g.date)===l),m=c.filter(g=>g.status==="completed").reduce((g,y)=>g+parseFloat(y.total_price||y.totalPrice||0),0),p=o.getMonth(),f=o.getFullYear(),u=a.filter(g=>{if(!g||!g.date)return!1;const y=new Date(g.date);return y.getMonth()===p&&y.getFullYear()===f&&g.status==="completed"}).reduce((g,y)=>g+parseFloat(y.total_price||y.totalPrice||0),0),v=a.filter(g=>g.rating).reduce((g,y,w,S)=>g+y.rating/S.length,0),I=a.filter(g=>g.rating&&g.rating<=3).slice(0,5);t.innerHTML=`
    ${await k()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">👑 Панель владельца</h1>
        <p class="page-header__subtitle">Обзор бизнеса — ${new Date().toLocaleDateString("ru-RU",{month:"long",year:"numeric"})}</p>
      </div>

      <!-- Quick Stats Grid -->
      <div class="dashboard-grid--stats mb-2xl">
        <a href="#/admin/queue" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">💰</span>
          <div class="stat-card__value">${m.toLocaleString()} ₽</div>
          <div class="stat-card__label">Выручка сегодня</div>
        </a>
        <a href="#/owner/reports" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">📅</span>
          <div class="stat-card__value">${u.toLocaleString()} ₽</div>
          <div class="stat-card__label">За этот месяц</div>
        </a>
        <a href="#/admin/queue" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">🚿</span>
          <div class="stat-card__value">${c.length}</div>
          <div class="stat-card__label">Записи сегодня</div>
        </a>
        <a href="#/admin/queue" class="glass-card stat-card" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="stat-card__icon">⭐</span>
          <div class="stat-card__value">${v?v.toFixed(1):"—"}</div>
          <div class="stat-card__label">Средний рейтинг</div>
        </a>
      </div>

      <!-- Management Actions -->
      <h2 style="font-size:var(--font-size-xl);margin-bottom:var(--space-lg);">Управление</h2>
      <div class="dashboard-grid mb-2xl">
        <a href="#/owner/services" class="glass-card quick-action" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="quick-action__icon">🛠️</span>
          <span class="quick-action__label">Прайс-лист</span>
          <p class="text-muted" style="font-size:var(--font-size-xs);margin-top:var(--space-sm);">${s.length} активных услуг</p>
        </a>
        <a href="#/owner/staff" class="glass-card quick-action" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="quick-action__icon">👷</span>
          <span class="quick-action__label">Персонал</span>
          <p class="text-muted" style="font-size:var(--font-size-xs);margin-top:var(--space-sm);">${e.length} сотрудников</p>
        </a>
        <a href="#/owner/reports" class="glass-card quick-action" style="text-decoration: none; color: inherit; display: flex !important; flex-direction: column; align-items: center; justify-content: center;">
          <span class="quick-action__icon">📊</span>
          <span class="quick-action__label">Детальные отчёты</span>
          <p class="text-muted" style="font-size:var(--font-size-xs);margin-top:var(--space-sm);">Аналитика и графики</p>
        </a>
      </div>

      <!-- Recent Low Ratings or Alerts -->
      ${I.length>0?`
        <div class="glass-card glass-card--static">
          <h3 style="margin-bottom:var(--space-md);color:var(--color-danger);">⚠️ Требует внимания (плохие оценки)</h3>
          <div class="flex flex-col gap-sm">
            ${I.map(g=>{const y=n.find(S=>String(S.id)===String(g.user_id||g.userId)),w=(y==null?void 0:y.car_number)||(y==null?void 0:y.carNumber)||"неизв.";return`
                  <div class="flex justify-between items-center" style="padding:var(--space-sm) 0; border-bottom:1px solid var(--color-divider);">
                    <div>
                      <div style="font-weight:600;font-size:var(--font-size-sm);">Оценка ${g.rating}⭐ — Машина ${w}</div>
                      <div class="text-muted" style="font-size:var(--font-size-xs);">${g.review||"Без отзыва"}</div>
                    </div>
                    <button class="btn btn--secondary btn--sm detail-btn" data-id="${g.id}">Детали</button>
                  </div>
                `}).join("")}
          </div>
        </div>
      `:""}
    </main>
    `,T(),document.querySelectorAll(".detail-btn").forEach(g=>{g.addEventListener("click",async()=>{const y=g.dataset.id,w=a.find(S=>String(S.id)===String(y));if(w){const S=w.washer_id||w.washerId?e.find(E=>String(E.id)===String(w.washer_id||w.washerId)):null,h=n.find(E=>String(E.id)===String(w.user_id||w.userId));await O({title:"Детали мойки 🚿",content:`
                        <div class="flex flex-col gap-lg">
                            <div class="glass-card glass-card--static" style="background: rgba(239, 68, 68, 0.05); border-color: var(--color-danger-100);">
                                <div style="font-size: 2rem; text-align: center; margin-bottom: var(--space-md);">${"⭐".repeat(w.rating||0)}</div>
                                <div style="font-weight: 600; text-align: center; margin-bottom: var(--space-sm);">Отзыв клиента: ${(h==null?void 0:h.name)||"Гость"}</div>
                                <div style="font-style: italic; text-align: center; color: var(--color-text-secondary);">"${w.review||"без комментария"}"</div>
                            </div>
                            
                            <div class="grid-2">
                                <div>
                                    <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase;">Машина</div>
                                    <div style="font-weight: 700; font-size: var(--font-size-lg); color: var(--color-primary);">${(h==null?void 0:h.car_number)||(h==null?void 0:h.carNumber)||"не указан"}</div>
                                </div>
                                <div>
                                    <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase;">Телефон</div>
                                    <div style="font-weight: 600;">${(h==null?void 0:h.phone)||"нет"}</div>
                                </div>
                                <div>
                                    <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase;">Тип кузова</div>
                                    <div>${w.body_type||w.bodyType||"не указан"}</div>
                                </div>
                                <div>
                                    <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase;">Мойщик</div>
                                    <div style="font-weight: 600;">${(S==null?void 0:S.name)||"не назначен"}</div>
                                </div>
                                <div>
                                    <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase;">Время мойки</div>
                                    <div>${new Date(w.date).toLocaleDateString("ru-RU")} в ${w.time}</div>
                                </div>
                                <div>
                                    <div class="text-muted" style="font-size: var(--font-size-xs); text-transform: uppercase;">Сумма</div>
                                    <div style="font-weight: 700;">${w.total_price||w.totalPrice} ₽</div>
                                </div>
                            </div>
                        </div>
                    `,footer:`
                        <button class="btn btn--primary btn--full" onclick="this.closest('.modal').querySelector('.modal__close').click()">Закрыть</button>
                    `})}})})}async function W(t){const a=await d.getAll("services")||[];t.innerHTML=`
    ${await k()}
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
            ${a.length===0?'<p class="text-center text-muted p-xl">Услуг пока нет</p>':a.map(e=>`
                <div class="flex justify-between items-center p-md mb-md glass-card--static" style="background: rgba(255,255,255,0.3); border-radius: var(--radius-md);">
                    <div class="flex items-center gap-md">
                        <span style="font-size: 1.5rem;">${e.icon||"🧼"}</span>
                        <div>
                            <div style="font-weight: 600;">${e.name}</div>
                            <div style="font-size: var(--font-size-sm);" class="text-secondary">${e.price} ₽</div>
                        </div>
                    </div>
                    <div class="flex gap-sm">
                        <button class="btn btn--ghost btn--sm edit-btn" data-id="${e.id}">✏️</button>
                        <button class="btn btn--ghost btn--sm delete-btn" data-id="${e.id}" style="color: var(--color-danger);">🗑️</button>
                    </div>
                </div>
            `).join("")}
        </div>
      </div>
    </main>
    `,T(),document.querySelectorAll(".delete-btn").forEach(e=>{e.addEventListener("click",async()=>{const n=e.dataset.id;confirm("Удалить эту услугу?")&&(await d.remove("services",n),b("Услуга удалена","success"),await W(t))})});const s=async(e=null)=>{const n=!!e,{modal:o,close:l}=await O({title:n?"Редактировать услугу":"Добавить услугу",content:`
                <div class="flex flex-col gap-lg">
                    <div class="form-group">
                        <label class="form-label">Название</label>
                        <input type="text" class="form-input" id="svc-name" value="${(e==null?void 0:e.name)||""}" placeholder="Напр: Мойка кузова">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Цена (₽)</label>
                        <input type="number" class="form-input" id="svc-price" value="${(e==null?void 0:e.price)||""}" placeholder="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Иконка (эмодзи)</label>
                        <input type="text" class="form-input" id="svc-icon" value="${(e==null?void 0:e.icon)||"🧼"}" placeholder="🧼">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Описание</label>
                        <textarea class="form-textarea" id="svc-desc" placeholder="Краткое описание услуги">${(e==null?void 0:e.description)||""}</textarea>
                    </div>
                </div>
            `,footer:`
                <button class="btn btn--secondary" id="svc-cancel">Отмена</button>
                <button class="btn btn--primary" id="svc-save">${n?"Сохранить":"Добавить"}</button>
            `});document.getElementById("svc-cancel").addEventListener("click",l),document.getElementById("svc-save").addEventListener("click",async()=>{const c=document.getElementById("svc-name").value.trim(),r=parseFloat(document.getElementById("svc-price").value),m=document.getElementById("svc-icon").value.trim(),p=document.getElementById("svc-desc").value.trim();if(!c||isNaN(r)){b("Заполните название и цену","warning");return}const f={name:c,price:r,icon:m,description:p,active:!0};n?(await d.update("services",e.id,f),b("Услуга обновлена","success")):(await d.add("services",f),b("Услуга добавлена","success")),l(),await W(t)})};document.getElementById("add-service-btn").addEventListener("click",()=>s()),document.querySelectorAll(".edit-btn").forEach(e=>{e.addEventListener("click",async()=>{const n=e.dataset.id,o=(await d.getAll("services")).find(l=>String(l.id)===String(n));o&&s(o)})})}async function G(t){const a=await d.getAll("washers")||[],u_all=await d.getAll("users")||[],admins=u_all.filter(u=>u.role==="admin");t.innerHTML=`
    ${await k()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">👥 Управление персоналом</h1>
        <p class="page-header__subtitle">Мойщики и их условия работы</p>
      </div>

      <div class="glass-card mb-2xl">
        <div class="flex justify-between items-center mb-lg flex-wrap gap-md">
            <h3>Список сотрудников</h3>
            
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
<button class="btn btn--primary btn--sm" id="add-staff-btn">+ Нанять сотрудника</button>
        </div>
        
        <div class="staff-list">
            ${a.length===0?'<p class="text-center text-muted p-xl">Сотрудников пока нет</p>':a.map(e=>`
                <div class="flex justify-between items-center p-md mb-md glass-card--static" style="background: rgba(255,255,255,0.3); border-radius: var(--radius-md);">
                    <div class="flex items-center gap-md">
                        <div class="app-header__avatar" style="width: 40px; height: 40px; font-size: 1rem;">${e.name?e.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2):"??"}</div>
                        <div>
                            <div style="font-weight: 600;">${e.name}</div>
                            <div style="font-size: var(--font-size-sm);" class="text-secondary">Ставка: ${e.percent}%</div>
                        </div>
                    </div>
                    <div class="flex gap-sm">
                        <button class="btn btn--ghost btn--sm edit-btn" data-id="${e.id}">✏️</button>
                        <button class="btn btn--ghost btn--sm delete-btn" data-id="${e.id}" style="color: var(--color-danger);">🗑️</button>
                    </div>
                </div>
            `).join("")}
        </div>
      </div>
    </main>
    `,T(),document.querySelectorAll(".delete-btn").forEach(e=>{e.addEventListener("click",async()=>{const n=e.dataset.id;confirm("Уволить сотрудника?")&&(await d.remove("washers",n),b("Сотрудник удален","success"),await G(t))})});const s=async(e=null)=>{const n=!!e,{modal:o,close:l}=await O({title:n?"Редактировать сотрудника":"Нанять сотрудника",content:`
                <div class="flex flex-col gap-lg">
                    <div class="form-group">
                        <label class="form-label">ФИО</label>
                        <input type="text" class="form-input" id="staff-name" value="${(e==null?void 0:e.name)||""}" placeholder="Иван Иванов">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Ставка (%)</label>
                        <input type="number" class="form-input" id="staff-percent" value="${(e==null?void 0:e.percent)||"30"}" placeholder="30">
                    </div>
                </div>
            `,footer:`
                <button class="btn btn--secondary" id="staff-cancel">Отмена</button>
                <button class="btn btn--primary" id="staff-save">${n?"Сохранить":"Добавить"}</button>
            `});document.getElementById("staff-cancel").addEventListener("click",l),document.getElementById("staff-save").addEventListener("click",async()=>{const c=document.getElementById("staff-name").value.trim(),r=parseInt(document.getElementById("staff-percent").value);if(!c||isNaN(r)){b("Заполните все поля","warning");return}const m={name:c,percent:r,active:!0};n?(await d.update("washers",e.id,m),b("Данные обновлены","success")):(await d.add("washers",m),b("Сотрудник добавлен","success")),l(),await G(t)})};
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
document.getElementById("add-staff-btn").addEventListener("click",()=>s()),document.querySelectorAll(".edit-btn").forEach(e=>{e.addEventListener("click",async()=>{const n=e.dataset.id,o=(await d.getAll("washers")).find(l=>String(l.id)===String(n));o&&s(o)})})}async function kt(t){const a=await d.getAll("bookings")||[],s=await d.getAll("washers")||[],e=await d.getAll("users")||[],n=await d.getAll("posts")||[{id:1,name:"Пост 1"},{id:2,name:"Пост 2"},{id:3,name:"Пост 3"}];d.getTodayStr();const o=a.filter(r=>r.status==="completed"),l=s.map(r=>{const m=o.filter(i=>String(i.washer_id||i.washerId)===String(r.id)),p=m.reduce((i,u)=>i+parseFloat(u.total_price||u.totalPrice||0),0),f=m.reduce((i,u)=>{const v=parseFloat(u.total_price||u.totalPrice||0);return i+v*(r.percent/100)},0);return{id:r.id,name:r.name,percent:r.percent,count:m.length,revenue:p,earning:f,bookings:m}}).sort((r,m)=>m.revenue-r.revenue),c=n.map(r=>{const m=o.filter(f=>String(f.post_id||f.postNumber)===String(r.id)),p=m.reduce((f,i)=>f+parseFloat(i.total_price||i.totalPrice||0),0);return{name:r.name,count:m.length,revenue:p}});t.innerHTML=`
    ${await k()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">📊 Отчёты и выручка</h1>
        <p class="page-header__subtitle">Аналитика по постам, мойкам и времени</p>
      </div>

      <!-- Total Summary -->
      <div class="dashboard-grid--stats mb-xl">
        <div class="glass-card stat-card">
          <span class="stat-card__icon">💰</span>
          <div class="stat-card__value">${o.reduce((r,m)=>r+parseFloat(m.total_price||m.totalPrice||0),0).toLocaleString()} ₽</div>
          <div class="stat-card__label">Общая выручка</div>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-card__icon">🚿</span>
          <div class="stat-card__value">${o.length}</div>
          <div class="stat-card__label">Всего моек</div>
        </div>
      </div>

      <!-- Revenue by Washers -->
      <div class="glass-card mb-xl">
        <h3 class="mb-lg">👷 Эффективность мойщиков</h3>
        <p class="text-muted mb-md" style="font-size: var(--font-size-xs);">Нажмите на имя мойщика для детальной истории</p>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Мойщик</th>
                <th>Моек</th>
                <th>Выручка</th>
                <th>З/П</th>
              </tr>
            </thead>
            <tbody>
              ${l.map(r=>`
                <tr class="washer-row" data-id="${r.id}" style="cursor: pointer;">
                  <td style="font-weight:600; color: var(--color-primary); text-decoration: underline;">${r.name}</td>
                  <td>${r.count}</td>
                  <td>${r.revenue.toLocaleString()} ₽</td>
                  <td class="text-success" style="font-weight:700;">${r.earning.toLocaleString()} ₽</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Revenue by Posts -->
      <div class="glass-card mb-xl">
        <h3 class="mb-lg">📍 Загрузка постов</h3>
        <div class="grid-3">
          ${c.map(r=>`
            <div class="text-center p-md" style="background: rgba(255,255,255,0.2); border-radius: var(--radius-md);">
              <div class="text-muted" style="font-size: var(--font-size-xs);">${r.name}</div>
              <div style="font-weight:700; font-size: var(--font-size-lg); margin: 4px 0;">${r.revenue.toLocaleString()} ₽</div>
              <div class="text-secondary" style="font-size: var(--font-size-xs);">${r.count} моек</div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Detailed Log -->
      <div class="glass-card">
        <h3 class="mb-lg">📋 Лог последних моек</h3>
        <div class="flex flex-col gap-sm">
          ${o.slice(0,15).map(r=>{const m=s.find(i=>String(i.id)===String(r.washer_id||r.washerId)),p=e.find(i=>String(i.id)===String(r.user_id||r.userId)),f=r.car_number||r.carNumber||(p==null?void 0:p.car_number)||(p==null?void 0:p.carNumber)||"неизв.";return`
              <div class="flex justify-between items-center py-sm" style="border-bottom: 1px solid var(--color-divider);">
                <div>
                  <div style="font-weight:600; font-size: var(--font-size-sm);">${new Date(r.date).toLocaleDateString("ru-RU")} — ${r.time}</div>
                  <div class="text-secondary" style="font-size: var(--font-size-sm); font-weight: 700;">🚗 ${f}</div>
                  <div class="text-muted" style="font-size: var(--font-size-xs);">Мойщик: ${(m==null?void 0:m.name)||"неизв."}</div>
                </div>
                <div class="text-right">
                  <div style="font-weight:700;">${parseFloat(r.total_price||r.totalPrice).toLocaleString()} ₽</div>
                  ${r.rating?`<div style="font-size: 10px;">${"⭐".repeat(r.rating)}</div>`:""}
                </div>
              </div>
            `}).join("")}
        </div>
      </div>
    </main>
    `,T(),document.querySelectorAll(".washer-row").forEach(r=>{r.addEventListener("click",async()=>{const m=r.dataset.id,p=l.find(f=>String(f.id)===String(m));p&&await O({title:`История: ${p.name} (${p.percent}%)`,content:`
                    <div class="flex flex-col gap-md">
                        <div class="dashboard-grid--stats" style="grid-template-columns: 1fr 1fr; gap: 8px;">
                            <div class="glass-card" style="padding: 12px; text-align: center;">
                                <div class="text-muted" style="font-size: 10px;">ВЫРУЧКА</div>
                                <div style="font-weight: 800; font-size: 1.1rem; color: var(--color-primary);">${p.revenue.toLocaleString()} ₽</div>
                            </div>
                            <div class="glass-card" style="padding: 12px; text-align: center;">
                                <div class="text-muted" style="font-size: 10px;">ЗАРПЛАТА</div>
                                <div style="font-weight: 800; font-size: 1.1rem; color: var(--color-success);">${p.earning.toLocaleString()} ₽</div>
                            </div>
                        </div>
                        
                        <div class="flex flex-col gap-xs" style="max-height: 350px; overflow-y: auto; padding-right: 4px;">
                            ${p.bookings.length===0?'<p class="text-center text-muted">Нет моек</p>':p.bookings.map(f=>{const i=e.find(y=>String(y.id)===String(f.user_id||f.userId)),u=f.car_number||f.carNumber||(i==null?void 0:i.car_number)||(i==null?void 0:i.carNumber)||"неизв.",v=(i==null?void 0:i.phone)||"нет",g={sedan:"Седан",suv:"Внедорожник",crossover:"Кроссовер",minivan:"Минивэн"}[f.body_type||f.bodyType]||f.body_type||f.bodyType||"неизв.";return`
                                    <div class="washer-history-item">
                                        <div class="washer-history-item__header">
                                            <div class="washer-history-item__car">🚗 ${u}</div>
                                            <div class="washer-history-item__price">${parseFloat(f.total_price||f.totalPrice).toLocaleString()} ₽</div>
                                        </div>
                                        <div class="washer-history-item__meta">
                                            <span>${new Date(f.date).toLocaleDateString("ru-RU")} в ${f.time}</span>
                                            <span>📞 ${v}</span>
                                        </div>
                                        <div class="washer-history-item__meta">
                                            <span class="text-secondary">${g}</span>
                                            <span style="color: #fbbf24;">${f.rating?"⭐".repeat(f.rating):"нет оценки"}</span>
                                        </div>
                                        ${f.review?`<div class="washer-history-item__comment">"${f.review}"</div>`:""}
                                    </div>
                                `}).join("")}
                        </div>
                    </div>
                `,footer:`
                    <button class="btn btn--primary btn--full" id="close-ws-modal">Закрыть</button>
                `}).then(({modal:f,close:i})=>{var u;(u=document.getElementById("close-ws-modal"))==null||u.addEventListener("click",i)})})})}export{b as a,O as b,St as c,Y as d,bt as e,X as f,L as g,xt as h,T as i,$t as j,It as k,dt as l,Et as m,$ as n,At as o,zt as p,Lt as q,k as r,d as s,W as t,_t as u,G as v,kt as w};
