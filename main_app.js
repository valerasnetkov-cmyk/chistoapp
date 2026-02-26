import{g as D,s as d,r as E,i as B,a as h,u as P,n as $,b as U,c as R,l as F,d as J,e as V,f as H,h as f,j as Q,k as Y,m as G,o as K,p as X,q as Z,t as ee,v as te,w as ae}from"./reports-CfWSr_lZ.js";let T=null,A=0;const se=3600*1e3;async function j(e="Yuzhno-Sakhalinsk"){var c,i,l,r,s;const t=Date.now();if(T&&t-A<se)return T;try{console.log("Fetching weather proxy for:",e);const a=await fetch(`/api/weather?city=${encodeURIComponent(e)}`);if(!a.ok)throw new Error("Weather Proxy error: "+a.status);const u=(c=(await a.json()).current_condition)==null?void 0:c[0];if(!u)throw new Error("No weather data in response");const v=parseInt(u.weatherCode);return T={temp:parseInt(u.temp_C),feelsLike:parseInt(u.FeelsLikeC),humidity:parseInt(u.humidity),weatherCode:v,description:((l=(i=u.lang_ru)==null?void 0:i[0])==null?void 0:l.value)||((s=(r=u.weatherDesc)==null?void 0:r[0])==null?void 0:s.value)||"",icon:ne(v),isBadWeather:ie(v)},A=t,T}catch(a){return console.error("Weather Proxy Fetch Error:",a),{temp:null,feelsLike:null,humidity:null,weatherCode:0,description:"Сервис временно недоступен",icon:"🌤️",isBadWeather:!1}}}function ie(e){return[176,179,182,185,200,227,230,248,260,263,266,281,284,293,296,299,302,305,308,311,314,317,320,323,326,329,332,335,338,350,353,356,359,362,365,368,371,374,377,386,389,392,395].includes(e)}function ne(e){return e===113?"☀️":e===116?"⛅":e===119||e===122?"☁️":[143,248,260].includes(e)?"🌫️":[176,263,266,293,296].includes(e)?"🌦️":[299,302,305,308,353,356,359].includes(e)?"🌧️":[179,182,185,227,230,323,326,329,332,335,338,368,371].includes(e)?"🌨️":[200,386,389,392,395].includes(e)?"⛈️":"🌤️"}async function M(e){const t=await D()||{name:"Гость",id:"guest"},i=(await d.getAll("bookings")||[]).filter(n=>n&&String(n.user_id||n.userId)===String(t.id)),l=await d.getAll("services")||[],r=await d.getAll("bonusHistory"),s=i.filter(n=>n.status==="completed"&&n.rating);for(const n of s)if(!r.some(b=>String(b.booking_id)===String(n.id))){const b=Math.round((n.total_price||n.totalPrice||0)*(t.cashback_percent||5)/100);if(b>0){console.log("Syncing missed bonus for booking:",n.id),await d.add("bonusHistory",{userId:t.id,amount:b,type:"earned",bookingId:n.id,description:`Кэшбек ${t.cashback_percent||5}% за мойку (синхронизация)`});const y=parseFloat(t.bonus_balance||t.bonusBalance||0);await d.update("users",t.id,{bonus_balance:y+b})}}const a=d.getTodayStr(),o=i.filter(n=>!n||!n.date?!1:(n.date.includes("T")?n.date.split("T")[0]:n.date)>=a&&["pending","waiting","in_progress"].includes(n.status)).sort((n,m)=>(n.date||"").localeCompare(m.date||"")||(n.time||"").localeCompare(m.time||""))[0],u=i.filter(n=>n&&n.status==="completed").length,v=i.filter(n=>n&&n.rating),g=v.length>0?v.reduce((n,m)=>n+m.rating,0)/v.length:0,p=t.name||t.phone||t.carNumber||t.car_number||"Гость";e.innerHTML=`
    ${await E()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">Привет, ${p.split(" ")[0]}! 👋</h1>
        <p class="page-header__subtitle">Добро пожаловать в «Чисто и точка»</p>
      </div>

      <!-- Upcoming Booking -->
      ${o?`
        <div class="glass-card glass-card--elevated mb-xl">
          <div class="flex items-center gap-md mb-lg">
            <span class="icon-circle icon-circle--primary">📅</span>
            <div>
              <h3 style="font-size:var(--font-size-lg);">Ближайшая запись</h3>
              <span class="badge badge--${o.status==="pending"?"primary":o.status==="waiting"?"warning":"accent"}">${oe(o.status)}</span>
            </div>
          </div>
          <div class="flex justify-between items-center flex-wrap gap-md">
            <div>
              <div style="font-weight:600;font-size:var(--font-size-lg);">${re(o.date)} в ${o.time}</div>
              <div class="text-secondary" style="font-size:var(--font-size-sm);">
                ${o.service_ids?(typeof o.service_ids=="string"?JSON.parse(o.service_ids):o.service_ids).map(n=>{var m;return((m=l.find(b=>String(b.id)===String(n)))==null?void 0:m.name)||""}).join(", "):(o.serviceIds||[]).map(n=>{var m;return((m=l.find(b=>String(b.id)===String(n)))==null?void 0:m.name)||""}).join(", ")}
              </div>
            </div>
            <div style="font-family:var(--font-heading);font-size:var(--font-size-xl);font-weight:800;color:var(--color-primary);">
              ${o.total_price||o.totalPrice||0} ₽
            </div>
          </div>
        </div>
      `:`
        <div class="glass-card glass-card--static text-center mb-xl" style="padding:var(--space-2xl);">
          <div style="font-size:3rem;margin-bottom:var(--space-lg);">🚗</div>
          <h3 style="margin-bottom:var(--space-sm);">Нет активных записей</h3>
          <p class="text-secondary mb-lg">Запишитесь на мойку прямо сейчас!</p>
          <a href="#/booking" class="btn btn--primary btn--lg">Записаться</a>
        </div>
      `}

      <!-- Weather Banner -->
      <div class="glass-card glass-card--static mb-xl" id="weather-banner" style="display:none;">
        <div class="flex items-center justify-between flex-wrap gap-lg">
          <div class="flex items-center gap-lg">
            <span style="font-size:2.5rem;" id="weather-icon">🌤️</span>
            <div>
              <div style="font-weight:600;" id="weather-temp">Загрузка погоды...</div>
              <div class="text-secondary" style="font-size:var(--font-size-sm);" id="weather-desc"></div>
            </div>
          </div>
          <div id="weather-cashback" style="display:none;">
            <span class="badge badge--success" style="font-size:var(--font-size-sm);padding:0.4rem 0.8rem;">
              🎁 Повышенный кэшбек x2 за плохую погоду!
            </span>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="dashboard-grid--stats mb-2xl stagger-children">
        <div class="glass-card stat-card">
          <span class="stat-card__icon">🎁</span>
          <div class="stat-card__value">${t.bonus_balance||t.bonusBalance||0}</div>
          <div class="stat-card__label">Бонусов</div>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-card__icon">🚿</span>
          <div class="stat-card__value">${u}</div>
          <div class="stat-card__label">Моек</div>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-card__icon">⭐</span>
          <div class="stat-card__value">${g>0?g.toFixed(1):"—"}</div>
          <div class="stat-card__label">Ср. оценка</div>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-card__icon">💰</span>
          <div class="stat-card__value">${t.cashback_percent||t.cashbackPercent||5}%</div>
          <div class="stat-card__label">Кэшбек</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <h2 style="font-size:var(--font-size-xl);margin-bottom:var(--space-lg);">Быстрые действия</h2>
      <div class="quick-actions stagger-children mb-2xl">
        <a href="#/booking" class="glass-card quick-action">
          <span class="quick-action__icon">📝</span>
          <span class="quick-action__label">Запись на мойку</span>
        </a>
        <a href="#/history" class="glass-card quick-action">
          <span class="quick-action__icon">📋</span>
          <span class="quick-action__label">История</span>
        </a>
        <a href="#/loyalty" class="glass-card quick-action">
          <span class="quick-action__icon">🎁</span>
          <span class="quick-action__label">Бонусы</span>
        </a>
        <a href="#/profile" class="glass-card quick-action">
          <span class="quick-action__icon">👤</span>
          <span class="quick-action__label">Профиль</span>
        </a>
        <a href="#/contacts" class="glass-card quick-action">
          <span class="quick-action__icon">📞</span>
          <span class="quick-action__label">Контакты</span>
        </a>
        <a href="#/tips" class="glass-card quick-action">
          <span class="quick-action__icon">💡</span>
          <span class="quick-action__label">Советы</span>
        </a>
      </div>
    </main>
  `,B(),ce()}async function ce(){const e=document.getElementById("weather-banner");if(e)try{const t=await j("Yuzhno-Sakhalinsk");e.style.display="block",document.getElementById("weather-icon").textContent=t.icon,document.getElementById("weather-temp").textContent=t.temp!==null?`${t.temp}°C`:"Нет данных",document.getElementById("weather-desc").textContent=t.description,t.isBadWeather&&(document.getElementById("weather-cashback").style.display="block")}catch{}}function re(e){if(!e)return"";const t=e.includes("T")?e.split("T")[0]:e,c=new Date(t+"T00:00:00"),i=new Date,l=new Date(i);l.setDate(i.getDate()+1);const r=i.toISOString().split("T")[0],s=l.toISOString().split("T")[0];return t===r?"Сегодня":t===s?"Завтра":c.toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}function oe(e){return{pending:"Ожидание",waiting:"В очереди",in_progress:"Моется",completed:"Завершена",cancelled:"Отменена"}[e]||e}async function le(e){const t=await D(),c=(await d.getAll("services")||[]).filter(s=>s&&s.active),i=await d.get("bodyTypeMultipliers")||{sedan:{label:"Седан",multiplier:1},suv:{label:"Внедорожник",multiplier:1.3},crossover:{label:"Кроссовер",multiplier:1.2},minivan:{label:"Минивэн",multiplier:1.5}},l=await d.getAll("bookings")||[],r=d.getTodayStr();e.innerHTML=`
    ${await E()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">📝 Запись на мойку</h1>
        <p class="page-header__subtitle">Выберите услуги и удобное время</p>
      </div>

      <div class="booking-form">
        <div class="booking-form__section">
          <!-- Client Info -->
          <div class="glass-card glass-card--static">
            <h3 class="booking-form__section-title">👤 Ваши данные</h3>
            <div class="flex flex-col gap-md">
              <div class="form-group">
                <label class="form-label">Телефон</label>
                <input type="tel" class="form-input" id="booking-phone" value="${t.phone||""}" placeholder="+7 900 000-00-00" required>
              </div>
              <div class="form-group">
                <label class="form-label">Номер машины</label>
                <input type="text" class="form-input" id="booking-car" value="${t.carNumber||t.car_number||""}" placeholder="А000АА777" required>
              </div>
            </div>
          </div>

          <!-- Body Type -->
          <div class="glass-card glass-card--static">
            <h3 class="booking-form__section-title">🚗 Тип кузова</h3>
            <div class="flex flex-col gap-sm">
              ${Object.entries(i).map(([s,a])=>`
                <label class="service-option" data-bodytype="${s}">
                  <div class="service-option__info">
                    <input type="radio" name="bodyType" value="${s}" ${s==="sedan"?"checked":""} style="accent-color:var(--color-primary);">
                    <span class="service-option__name">${a.label}</span>
                  </div>
                  <span class="service-option__price">${a.multiplier>1?`x${a.multiplier}`:"Базовая цена"}</span>
                </label>
              `).join("")}
            </div>
          </div>

          <!-- Services -->
          <div class="glass-card glass-card--static">
            <h3 class="booking-form__section-title">🧽 Услуги</h3>
            <div class="flex flex-col gap-sm" id="services-list">
              ${c.map(s=>`
                <label class="service-option" data-service-id="${s.id}">
                  <div class="service-option__info">
                    <input type="checkbox" name="services" value="${s.id}" style="accent-color:var(--color-primary);">
                    <div>
                      <span class="service-option__name">${s.icon||"🧼"} ${s.name}</span>
                      <div class="text-secondary" style="font-size:var(--font-size-xs);">${s.description||""}</div>
                    </div>
                  </div>
                  <span class="service-option__price">${s.price} ₽</span>
                </label>
              `).join("")}
            </div>
          </div>

          <!-- Date & Time -->
          <div class="glass-card glass-card--static">
            <h3 class="booking-form__section-title">📅 Дата и время</h3>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Дата</label>
                <select class="form-select" id="booking-date" required>
                  ${me().map(s=>`<option value="${s.value}">${s.label}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Время</label>
                <select class="form-select" id="booking-time" required>
                  <option value="">Выберите время...</option>
                  ${N(r,l).map(s=>`
                    <option value="${s.time}" ${s.disabled?"disabled":""}>
                      ${s.time} ${s.disabled?"(Мест нет)":""}
                    </option>
                  `).join("")}
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="booking-form__section">
          <div class="glass-card glass-card--elevated booking-summary">
            <h3 class="booking-form__section-title">💰 Итого</h3>
            
            <div id="summary-services" class="flex flex-col gap-sm mb-lg">
              <div class="text-center text-muted" style="padding:var(--space-xl);">
                Выберите услуги
              </div>
            </div>

            <div id="summary-bonus" style="display:none;" class="mb-lg">
              <div class="flex justify-between items-center" style="font-size:var(--font-size-sm);">
                <span class="text-secondary">Можно списать бонусов:</span>
                <span class="text-success" style="font-weight:600;" id="bonus-available">0</span>
              </div>
              <div class="flex items-center gap-sm mt-sm">
                <input type="checkbox" id="use-bonus" style="accent-color:var(--color-primary);">
                <label for="use-bonus" style="font-size:var(--font-size-sm);cursor:pointer;">Списать бонусы</label>
              </div>
            </div>

            <div class="booking-summary__total">
              <span class="booking-summary__total-label">К оплате:</span>
              <span class="booking-summary__total-price" id="total-price">0 ₽</span>
            </div>

            <div class="mt-lg" style="font-size:var(--font-size-xs);color:var(--color-text-muted);" id="cashback-info">
              Кэшбек ${t.cashback_percent||t.cashbackPercent||5}%: <strong id="cashback-amount">0</strong> бонусов
            </div>

            <button class="btn btn--primary btn--lg btn--full mt-xl" id="submit-booking">
              Записаться
            </button>
          </div>
        </div>
      </div>
    </main>
  `,B(),de(t,c,i,l)}function de(e,t,c,i){const l=document.querySelectorAll('input[name="services"]'),r=document.querySelectorAll('input[name="bodyType"]'),s=document.getElementById("use-bonus"),a=document.getElementById("booking-date"),o=document.getElementById("booking-time"),u=document.getElementById("booking-phone"),v=document.getElementById("booking-car");d.getTodayStr(),a.addEventListener("change",()=>{const p=N(a.value,i);o.innerHTML='<option value="">Выберите время...</option>'+p.map(n=>`<option value="${n.time}" ${n.disabled?"disabled":""}>${n.time} ${n.disabled?"(Мест нет)":""}</option>`).join("")});function g(){var q,_;const p=((q=document.querySelector('input[name="bodyType"]:checked'))==null?void 0:q.value)||"sedan",n=((_=c[p])==null?void 0:_.multiplier)||1,m=[];l.forEach(w=>{if(w.checked){const L=t.find(W=>String(W.id)===String(w.value));L&&m.push(L)}});const b=document.getElementById("summary-services");m.length===0?(b.innerHTML='<div class="text-center text-muted" style="padding:var(--space-xl);">Выберите услуги</div>',document.getElementById("summary-bonus").style.display="none"):(b.innerHTML=m.map(w=>`
        <div class="flex justify-between" style="font-size:var(--font-size-sm);">
          <span>${w.icon||"🧼"} ${w.name}</span>
          <span style="font-weight:500;">${Math.round(w.price*n)} ₽</span>
        </div>
      `).join(""),n>1&&(b.innerHTML+=`
          <div class="flex justify-between text-muted" style="font-size:var(--font-size-xs);">
            <span>Коэффициент (${c[p].label})</span>
            <span>x${n}</span>
          </div>
        `),document.getElementById("summary-bonus").style.display="block");const y=m.reduce((w,L)=>w+Math.round(L.price*n),0),I=Math.min(e.bonus_balance||e.bonusBalance||0,Math.floor(y*.3));document.getElementById("bonus-available").textContent=`до ${I} ₽`;const z=s!=null&&s.checked?I:0,k=Math.max(0,y-z);return document.getElementById("total-price").textContent=`${k} ₽`,document.getElementById("cashback-amount").textContent=Math.round(k*(e.cashback_percent||e.cashbackPercent||5)/100),document.querySelectorAll(".service-option[data-service-id]").forEach(w=>{const L=w.querySelector('input[type="checkbox"]');w.classList.toggle("service-option--selected",L.checked)}),{selectedServices:m,subtotal:y,total:k,bonusDiscount:z,multiplier:n,selectedBody:p}}l.forEach(p=>p.addEventListener("change",g)),r.forEach(p=>p.addEventListener("change",g)),s==null||s.addEventListener("change",g),document.getElementById("submit-booking").addEventListener("click",async()=>{const p=u.value.trim(),n=v.value.trim();if(!p||!n){h("Пожалуйста, введите телефон и номер машины","warning");return}const{selectedServices:m,total:b,bonusDiscount:y,selectedBody:I}=g();if(m.length===0){h("Выберите хотя бы одну услугу","warning");return}const z=a.value,k=o.value;if(!z||!k){h("Укажите дату и время","warning");return}if((p!==e.phone||n!==(e.carNumber||e.car_number))&&await P({phone:p,carNumber:n}),i.filter(_=>(_.date.includes("T")?_.date.split("T")[0]:_.date)===z&&_.time.startsWith(k)&&_.status!=="cancelled").length>=3){h("Извините, на это время мест больше нет","error");return}if(await d.add("bookings",{user_id:e.id,service_ids:m.map(_=>_.id),body_type:I,date:z,time:k,total_price:b,bonus_used:y,status:"pending"}),y>0){const _=await d.update("users",e.id,{bonus_balance:(e.bonus_balance||e.bonusBalance||0)-y});await d.set("currentUser",_),await d.add("bonusHistory",{userId:e.id,amount:-y,type:"spent",description:"Списание бонусов при записи"})}h("Запись создана! Ожидайте подтверждения.","success"),$("/history")})}function me(){const e=[],t=new Date;for(let c=0;c<5;c++){const i=new Date(t);i.setDate(t.getDate()+c);const l=i.toISOString().split("T")[0];let r=i.toLocaleDateString("ru-RU",{day:"numeric",month:"long"});c===0&&(r="Сегодня"),c===1&&(r="Завтра"),e.push({value:l,label:r})}return e}function N(e,t){const c=[],i=new Date,l=d.getTodayStr(),r=e===l,s=i.getHours()*60+i.getMinutes();for(let a=8;a<=20;a++){const o=`${a.toString().padStart(2,"0")}:00`,u=a*60;if(!r||u>s+15){const v=t.filter(g=>(g.date.includes("T")?g.date.split("T")[0]:g.date)===e&&g.time.startsWith(o)&&g.status!=="cancelled").length;c.push({time:o,disabled:v>=3})}if(a<20){const v=`${a.toString().padStart(2,"0")}:30`,g=a*60+30;if(!r||g>s+15){const p=t.filter(n=>(n.date.includes("T")?n.date.split("T")[0]:n.date)===e&&n.time.startsWith(v)&&n.status!=="cancelled").length;c.push({time:v,disabled:p>=3})}}}return c}function pe(e=0,t=null,c=!1){const i=document.createElement("div");i.className="star-rating";for(let l=1;l<=5;l++){const r=document.createElement("span");r.className=`star-rating__star${l<=e?" star-rating__star--active":""}`,r.textContent="⭐",r.dataset.value=l,c||(r.addEventListener("mouseenter",()=>{i.querySelectorAll(".star-rating__star").forEach((s,a)=>{s.classList.toggle("star-rating__star--active",a<l)})}),r.addEventListener("mouseleave",()=>{const s=parseInt(i.dataset.rating||"0");i.querySelectorAll(".star-rating__star").forEach((a,o)=>{a.classList.toggle("star-rating__star--active",o<s)})}),r.addEventListener("click",()=>{i.dataset.rating=l,i.querySelectorAll(".star-rating__star").forEach((s,a)=>{s.classList.toggle("star-rating__star--active",a<l)}),t&&t(l)})),i.appendChild(r)}return i.dataset.rating=e,i}function ve(e){let t="";for(let c=1;c<=5;c++)t+=c<=e?"⭐":"☆";return t}async function ge(e){const t=await D();await c();async function c(){const r=(await d.getAll("bookings")||[]).filter(a=>a&&String(a.user_id||a.userId)===String(t.id)).sort((a,o)=>(o.date||"").localeCompare(a.date||"")||(o.time||"").localeCompare(a.time||"")),s=await d.getAll("services")||[];e.innerHTML=`
      ${await E()}
      <main class="page-content animate-fade-in">
        <div class="page-header">
          <h1 class="page-header__title">📋 История записей</h1>
          <p class="page-header__subtitle">Все ваши записи в одном месте</p>
        </div>

        ${r.length===0?`
          <div class="glass-card text-center" style="padding:var(--space-4xl);">
            <div style="font-size:3rem;margin-bottom:var(--space-lg);">📋</div>
            <h3 style="margin-bottom:var(--space-sm);">Записей пока нет</h3>
            <p class="text-secondary mb-lg">Запишитесь на первую мойку!</p>
            <a href="#/booking" class="btn btn--primary">Записаться</a>
          </div>
        `:`
          <div class="history-list stagger-children">
            ${r.map(a=>{const u=(a.service_ids?typeof a.service_ids=="string"?JSON.parse(a.service_ids):a.service_ids:a.serviceIds||[]).map(v=>s.find(g=>String(g.id)===String(v))).filter(Boolean);return`
                <div class="glass-card history-item">
                  <div class="history-item__date">
                    <div class="history-item__day">${a.date?new Date(a.date).getDate():"??"}</div>
                    <div class="history-item__month">${a.date?new Date(a.date).toLocaleDateString("ru-RU",{month:"short"}):""}</div>
                  </div>
                  <div class="history-item__details">
                    <div class="history-item__services">${u.map(v=>`${v.icon||"🧼"} ${v.name}`).join(", ")}</div>
                    <div class="history-item__meta">
                      <span>🕐 ${a.time}</span>
                      <span>💰 ${a.total_price||a.totalPrice||0} ₽</span>
                      <span class="badge badge--${be(a.status)}">${ue(a.status)}</span>
                    </div>
                    ${a.rating?`
                      <div style="margin-top:var(--space-sm);font-size:var(--font-size-sm);">
                        ${ve(a.rating)} 
                        ${a.review?`<span class="text-secondary"> — ${a.review}</span>`:""}
                      </div>
                    `:""}
                  </div>
                  <div class="history-item__actions">
                    ${a.status==="pending"?`
                      <button class="btn btn--danger btn--sm cancel-btn" data-id="${a.id}">Отменить</button>
                    `:""}
                    ${a.status==="completed"&&!a.rating?`
                      <button class="btn btn--primary btn--sm rate-btn" data-id="${a.id}">Оценить</button>
                    `:""}
                  </div>
                </div>
              `}).join("")}
          </div>
        `}
      </main>
    `,B(),document.querySelectorAll(".cancel-btn").forEach(a=>{a.addEventListener("click",async()=>{const o=a.dataset.id;await d.update("bookings",o,{status:"cancelled"}),h("Запись отменена","info"),await c()})}),document.querySelectorAll(".rate-btn").forEach(a=>{a.addEventListener("click",async()=>{await i(a.dataset.id,t)})})}async function i(l,r){let s=0;const{modal:a,close:o}=await U({title:"Оценка мойки",content:`
        <div class="text-center mb-xl">
          <p class="text-secondary mb-lg">Оцените качество мойки</p>
          <div id="modal-rating" style="display:flex;justify-content:center;"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Отзыв (необязательно)</label>
          <textarea class="form-textarea" id="review-text" placeholder="Ваш отзыв о мойке..." rows="3"></textarea>
        </div>
      `,footer:`
        <button class="btn btn--secondary" id="cancel-rating">Отмена</button>
        <button class="btn btn--primary" id="submit-rating">Отправить</button>
      `}),u=a.querySelector("#modal-rating"),v=await pe(0,g=>{s=g});u.appendChild(v),a.querySelector("#cancel-rating").addEventListener("click",o),a.querySelector("#submit-rating").addEventListener("click",async()=>{if(s===0){h("Выберите оценку","warning");return}const g=a.querySelector("#review-text").value.trim(),p=await d.update("bookings",l,{rating:s,review:g}),n=p.total_price||p.totalPrice||0,m=r.cashback_percent||r.cashbackPercent||5,b=r.bonus_balance||r.bonusBalance||0,y=Math.round(n*m/100);if(y>0){const I=await d.update("users",r.id,{bonus_balance:b+y});await d.set("currentUser",I),await d.add("bonusHistory",{userId:r.id,amount:y,type:"earned",bookingId:l,description:`Кэшбек ${m}% за мойку`})}s<=3&&await R(p,s,r.name),o(),h(`Спасибо за оценку! Начислено ${y} бонусов`,"success"),await c()})}}function ue(e){return{pending:"Ожидание",waiting:"В очереди",in_progress:"Моется",completed:"Завершена",cancelled:"Отменена"}[e]||e}function be(e){return{pending:"primary",waiting:"warning",in_progress:"accent",completed:"success",cancelled:"danger"}[e]||"glass"}async function fe(e){const t=await D(),c=t.bonus_balance||t.bonusBalance||0,i=t.cashback_percent||t.cashbackPercent||5,r=(await d.getAll("bonusHistory")||[]).filter(s=>s&&String(s.userId)===String(t.id)).sort((s,a)=>new Date(a.createdAt)-new Date(s.createdAt));e.innerHTML=`
    ${await E()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">🎁 Программа лояльности</h1>
        <p class="page-header__subtitle">Зарабатывайте бонусы с каждой мойкой</p>
      </div>

      <!-- Hero -->
      <div class="loyalty-hero mb-2xl animate-scale-in">
        <div class="loyalty-hero__balance">${c} ₽</div>
        <div class="loyalty-hero__label">Бонусный баланс</div>
        <div class="loyalty-hero__cashback" id="cashback-badge">
          💰 Ваш кэшбек: ${i}%
        </div>
      </div>

      <!-- Weather Cashback Info -->
      <div class="glass-card glass-card--static mb-2xl" id="weather-bonus" style="display:none;">
        <div class="flex items-center gap-lg">
          <span style="font-size:2rem;" id="wb-icon">🌧️</span>
          <div>
            <div style="font-weight:600;color:var(--color-success);">Повышенный кэшбек x2!</div>
            <div class="text-secondary" style="font-size:var(--font-size-sm);">
              Сегодня плохая погода — кэшбек удваивается до <strong>${i*2}%</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- How it works -->
      <div class="glass-card glass-card--static mb-2xl">
        <h3 style="margin-bottom:var(--space-xl);">Как это работает</h3>
        <div class="grid-3 stagger-children">
          <div class="text-center">
            <div style="font-size:2rem;margin-bottom:var(--space-md);">🚿</div>
            <div style="font-weight:600;margin-bottom:var(--space-xs);">Мойте авто</div>
            <div class="text-secondary" style="font-size:var(--font-size-sm);">Записывайтесь на мойку через приложение</div>
          </div>
          <div class="text-center">
            <div style="font-size:2rem;margin-bottom:var(--space-md);">💰</div>
            <div style="font-weight:600;margin-bottom:var(--space-xs);">Получайте кэшбек</div>
            <div class="text-secondary" style="font-size:var(--font-size-sm);">${i}% от суммы возвращается бонусами</div>
          </div>
          <div class="text-center">
            <div style="font-size:2rem;margin-bottom:var(--space-md);">🎁</div>
            <div style="font-weight:600;margin-bottom:var(--space-xs);">Оплачивайте бонусами</div>
            <div class="text-secondary" style="font-size:var(--font-size-sm);">До 30% стоимости следующей мойки</div>
          </div>
        </div>
      </div>

      <!-- Bonus levels -->
      <div class="glass-card glass-card--static mb-2xl">
        <h3 style="margin-bottom:var(--space-xl);">Уровни кэшбека</h3>
        <div class="flex flex-col gap-md">
          ${[{name:"Стандарт",percent:5,moeks:"0-9",active:i<=5},{name:"Серебро",percent:7,moeks:"10-24",active:i>5&&i<=7},{name:"Золото",percent:10,moeks:"25-49",active:i>7&&i<=10},{name:"Платина",percent:15,moeks:"50+",active:i>10}].map(s=>`
            <div class="flex items-center justify-between" style="padding:var(--space-md) var(--space-lg);border-radius:var(--radius-md);${s.active?"background:rgba(37,99,235,0.06);border:1px solid rgba(37,99,235,0.15);":""}">
              <div class="flex items-center gap-md">
                ${s.active?'<span class="badge badge--primary">Текущий</span>':""}
                <span style="font-weight:${s.active?"600":"400"};">${s.name}</span>
              </div>
              <div class="flex items-center gap-xl">
                <span class="text-secondary" style="font-size:var(--font-size-sm);">${s.moeks} моек</span>
                <span style="font-weight:700;color:var(--color-primary);">${s.percent}%</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- History -->
      <div class="glass-card glass-card--static">
        <h3 style="margin-bottom:var(--space-xl);">История начислений</h3>
        ${r.length===0?`
          <div class="empty-state">
            <div class="empty-state__icon">📊</div>
            <div class="empty-state__title">Пока нет начислений</div>
          </div>
        `:`
          <div class="flex flex-col gap-sm">
            ${r.map(s=>`
              <div class="flex items-center justify-between" style="padding:var(--space-md) 0;border-bottom:1px solid var(--color-divider);">
                <div>
                  <div style="font-size:var(--font-size-sm);font-weight:500;">${s.description}</div>
                  <div class="text-muted" style="font-size:var(--font-size-xs);">
                    ${s.createdAt?new Date(s.createdAt).toLocaleDateString("ru-RU",{day:"numeric",month:"short",year:"numeric"}):"---"}
                  </div>
                </div>
                <span style="font-weight:700;color:${s.amount>0?"var(--color-success)":"var(--color-danger)"};">
                  ${s.amount>0?"+":""}${s.amount} ₽
                </span>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    </main>
  `,B(),j().then(s=>{if(s.isBadWeather){const a=document.getElementById("weather-bonus");a&&(a.style.display="block",document.getElementById("wb-icon").textContent=s.icon)}}).catch(async()=>{})}async function ye(e){e.innerHTML=`
    ${await E()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">📞 Контакты</h1>
        <p class="page-header__subtitle">Как нас найти и связаться</p>
      </div>

      <div class="contacts-grid stagger-children mb-2xl">
        <div class="glass-card contact-item">
          <span class="contact-item__icon">📍</span>
          <div>
            <div class="contact-item__label">Адрес</div>
            <div class="contact-item__value">г. Москва, ул. Автомоечная, д. 12</div>
          </div>
        </div>
        <div class="glass-card contact-item">
          <span class="contact-item__icon">📱</span>
          <div>
            <div class="contact-item__label">Телефон</div>
            <div class="contact-item__value">+7 (499) 123-45-67</div>
          </div>
        </div>
        <div class="glass-card contact-item">
          <span class="contact-item__icon">🕐</span>
          <div>
            <div class="contact-item__label">Часы работы</div>
            <div class="contact-item__value">Ежедневно, 8:00 – 21:00</div>
          </div>
        </div>
        <div class="glass-card contact-item">
          <span class="contact-item__icon">✉️</span>
          <div>
            <div class="contact-item__label">Email</div>
            <div class="contact-item__value">info@chistoitochka.ru</div>
          </div>
        </div>
      </div>

      <div class="glass-card glass-card--static mb-2xl">
        <h3 style="margin-bottom:var(--space-lg);">📌 Как добраться</h3>
        <div style="width:100%;height:300px;border-radius:var(--radius-lg);overflow:hidden;background:linear-gradient(135deg, rgba(37,99,235,0.05), rgba(6,182,212,0.05));display:flex;align-items:center;justify-content:center;">
          <div class="text-center">
            <div style="font-size:3rem;margin-bottom:var(--space-md);">🗺️</div>
            <div class="text-secondary">Мы находимся рядом с метро Автозаводская</div>
            <div class="text-muted" style="font-size:var(--font-size-sm);margin-top:var(--space-sm);">5 минут пешком от выхода №2</div>
          </div>
        </div>
      </div>

      <div class="glass-card glass-card--static">
        <h3 style="margin-bottom:var(--space-lg);">🌐 Мы в социальных сетях</h3>
        <div class="flex gap-md flex-wrap">
          <a class="btn btn--secondary" href="#">📷 Instagram</a>
          <a class="btn btn--secondary" href="#">💬 Telegram</a>
          <a class="btn btn--secondary" href="#">📘 VK</a>
          <a class="btn btn--secondary" href="#">🌐 WhatsApp</a>
        </div>
      </div>
    </main>
  `,B()}async function O(e){const t=await D(),c=t.name||t.phone||t.carNumber||t.car_number||"Гость";e.innerHTML=`
    ${await E()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">👤 Профиль</h1>
        <p class="page-header__subtitle">Управление вашими данными</p>
      </div>

      <div style="max-width:560px;">
        <div class="glass-card glass-card--elevated mb-2xl">
          <div class="flex items-center gap-xl mb-2xl" style="padding-bottom:var(--space-xl);border-bottom:1px solid var(--color-divider);">
            <div style="width:72px;height:72px;border-radius:var(--radius-full);background:var(--gradient-primary);color:white;display:flex;align-items:center;justify-content:center;font-size:var(--font-size-2xl);font-weight:800;">
              ${c.split(" ").map(i=>i[0]).join("").toUpperCase().slice(0,2)}
            </div>
            <div>
              <h2 style="font-size:var(--font-size-xl);">${c}</h2>
              <span class="badge badge--primary">Клиент</span>
            </div>
          </div>

          <form id="profile-form" class="flex flex-col gap-xl">
            <div class="form-group">
              <label class="form-label">Имя (необязательно)</label>
              <input type="text" class="form-input" id="profile-name" value="${t.name||""}" placeholder="Как к вам обращаться?">
            </div>
            <div class="form-group">
              <label class="form-label">Телефон</label>
              <input type="tel" class="form-input" id="profile-phone" value="${t.phone||""}" required placeholder="+7 900 000-00-00">
            </div>
            <div class="form-group">
              <label class="form-label">Номер машины</label>
              <input type="text" class="form-input" id="profile-car" value="${t.carNumber||t.car_number||""}" placeholder="А000АА777" required>
            </div>
            <button type="submit" class="btn btn--primary btn--lg">Сохранить изменения</button>
          </form>
        </div>

        <div class="glass-card glass-card--static">
          <h3 style="margin-bottom:var(--space-lg);">Действия</h3>
          <button class="btn btn--danger btn--full" id="logout-btn">Выйти из аккаунта</button>
        </div>
      </div>
    </main>
  `,B(),document.getElementById("profile-form").addEventListener("submit",async i=>{i.preventDefault();try{await P({name:document.getElementById("profile-name").value.trim(),phone:document.getElementById("profile-phone").value.trim(),carNumber:document.getElementById("profile-car").value.trim()}),h("Профиль обновлён!","success"),await O(e)}catch(l){console.error(l),h("Ошибка при сохранении","error")}}),document.getElementById("logout-btn").addEventListener("click",async()=>{F(),$("/login"),h("Вы вышли из аккаунта","info")})}const he=[{icon:"🧽",title:"Мойте машину регулярно",text:"Рекомендуется мыть автомобиль каждые 1-2 недели. Грязь и соль разрушают лакокрасочное покрытие, особенно зимой. Регулярная мойка предотвращает коррозию и сохраняет блеск кузова."},{icon:"🌧️",title:"Мойте после дождя и снега",text:"Дождевая вода содержит кислоты и загрязнения, которые оставляют пятна при высыхании. После сильного дождя или снегопада лучше помыть машину в течение пары дней."},{icon:"☀️",title:"Не мойте на солнце",text:"Прямые солнечные лучи высушивают воду слишком быстро, оставляя разводы и пятна. Лучшее время для мойки — раннее утро, вечер или облачный день."},{icon:"💎",title:"Наносите воск",text:"Восковое покрытие создаёт защитный слой, отталкивающий воду и грязь. Рекомендуется наносить воск после каждой 3-4 мойки для максимальной защиты."},{icon:"🪣",title:"Используйте два ведра",text:"При ручной мойке используйте метод двух ведер: одно с мыльным раствором, другое с чистой водой для ополаскивания губки. Это предотвращает царапины от грязи."},{icon:"🚗",title:"Не забывайте о днище",text:"Зимой дороги обрабатывают реагентами, которые разъедают металл. Периодически мойте днище автомобиля, особенно весной после зимнего сезона."},{icon:"🧹",title:"Ухаживайте за салоном",text:"Регулярно пылесосьте салон и протирайте поверхности. Кожаные сиденья обрабатывайте специальным кондиционером раз в 2-3 месяца для предотвращения трещин."},{icon:"🔧",title:"Проверяйте щётки стеклоочистителей",text:"Изношенные дворники оставляют разводы и царапины на стекле. Меняйте их каждые 6-12 месяцев или при первых признаках износа."}];async function _e(e){e.innerHTML=`
    ${await E()}
    <main class="page-content animate-fade-in">
      <div class="page-header">
        <h1 class="page-header__title">💡 Полезные советы</h1>
        <p class="page-header__subtitle">Советы по уходу за автомобилем от экспертов</p>
      </div>

      <div class="tips-grid stagger-children">
        ${he.map(t=>`
          <div class="glass-card">
            <div class="tip-card__icon">${t.icon}</div>
            <h3 class="tip-card__title">${t.title}</h3>
            <p class="tip-card__text">${t.text}</p>
          </div>
        `).join("")}
      </div>
    </main>
  `,B()}async function we(e){e.innerHTML=`
    <div class="login-page">
      <div class="glass-card glass-card--elevated login-card">
        <div class="login-card__header">
          <span class="login-card__logo">💧</span>
          <h1 class="login-card__title">Чисто и точка</h1>
          <p class="login-card__subtitle">Ваша любимая автомойка</p>
        </div>

        <div class="login-card__tabs">
          <button class="login-card__tab login-card__tab--active" id="tab-login">Вход</button>
          <button class="login-card__tab" id="tab-register">Регистрация</button>
        </div>

        <div id="login-form-container">
          <form class="login-card__form" id="login-form">
            <div class="form-group">
              <label class="form-label">Телефон</label>
              <input type="tel" class="form-input" id="login-input" placeholder="+7 900 000-00-00" required autocomplete="username">
            </div>
            <div class="form-group">
              <label class="form-label">Пароль (если есть)</label>
              <input type="password" class="form-input" id="password-input" placeholder="Введите пароль" autocomplete="current-password">
              <p class="text-muted" style="font-size: 0.75rem; margin-top: 4px;">Если вы регистрировались без пароля, оставьте пустым.</p>
            </div>
            <button type="submit" class="btn btn--primary btn--lg btn--full">Войти</button>
          </form>
        </div>

        <div id="register-form-container" style="display:none;">
          <form class="login-card__form" id="register-form">
            <div class="form-group">
              <label class="form-label">Телефон</label>
              <input type="tel" class="form-input" id="reg-phone" placeholder="+7 900 123-45-67" required>
            </div>
            <div class="form-group">
              <label class="form-label">Номер машины</label>
              <input type="text" class="form-input" id="reg-car" placeholder="А123БВ777" required>
            </div>
            <p class="text-muted" style="font-size: 0.8rem; text-align: center;">Пароль не требуется — вход по номеру телефона.</p>
            <button type="submit" class="btn btn--primary btn--lg btn--full">Зарегистрироваться</button>
          </form>
        </div>

        <div class="login-card__demo">
          <p class="login-card__demo-title">Дополнительно</p>
          <div class="login-card__demo-accounts">
            <a href="#/admin/login" class="btn btn--secondary btn--sm btn--full" style="text-decoration: none;">🛡️ Вход для персонала</a>
          </div>
        </div>
      </div>
    </div>
  `;const t=document.getElementById("tab-login"),c=document.getElementById("tab-register"),i=document.getElementById("login-form-container"),l=document.getElementById("register-form-container");t.addEventListener("click",async()=>{t.classList.add("login-card__tab--active"),c.classList.remove("login-card__tab--active"),i.style.display="block",l.style.display="none"}),c.addEventListener("click",async()=>{c.classList.add("login-card__tab--active"),t.classList.remove("login-card__tab--active"),l.style.display="block",i.style.display="none"}),document.getElementById("login-form").addEventListener("submit",async r=>{r.preventDefault();const s=document.getElementById("login-input").value.trim(),a=document.getElementById("password-input").value.trim()||"NO_PASSWORD",o=await J(s,a);o?(h(`Добро пожаловать, ${o.name}!`,"success"),o.role==="admin"?$("/admin"):o.role==="owner"?$("/owner"):$("/dashboard")):h("Пользователь не найден или неверный пароль","error")}),document.getElementById("register-form").addEventListener("submit",async r=>{r.preventDefault();const s=document.getElementById("reg-phone").value.trim(),a=document.getElementById("reg-car").value.trim(),o=await V({login:s,password:"NO_PASSWORD",name:a,phone:s,carNumber:a});o.error?h(o.error,"error"):(h("Регистрация успешна!","success"),$("/dashboard"))})}var C;const S=(C=window.Telegram)==null?void 0:C.WebApp;d.initDefaults();S&&(S.ready(),S.expand(),S.BackButton.onClick(async()=>{const e=await H();e!=="/"&&e!=="/dashboard"&&await $("/")}));window.addEventListener("hashchange",async()=>{if(S){const e=await H();e==="/"||e==="/dashboard"||e==="/admin"||e==="/owner"?S.BackButton.hide():S.BackButton.show()}});async function x(){let e=await D();if(e&&isNaN(parseInt(e.id))){await d.apiFetch("/auth/register",{method:"POST",body:JSON.stringify({login:e.login||e.id,password:"NO_PASSWORD",name:e.name||"Клиент",phone:e.phone||"",car_number:e.carNumber||e.car_number||""})});const t=await d.apiFetch(`/users/${e.login||e.id}`);if(t)return await d.set("currentUser",t),t}if(!e){let t=localStorage.getItem("cit_guestId");t||(t="guest_"+d.uid(),localStorage.setItem("cit_guestId",t));const c={id:t,login:t,password:"",name:"Гость",phone:"",carNumber:"",role:"client",bonus_balance:0,cashback_percent:5};await d.apiFetch("/auth/register",{method:"POST",body:JSON.stringify({login:t,password:"NO_PASSWORD",name:"Гость",phone:"",car_number:""})});const i=await d.apiFetch(`/users/${t}`);return i?(await d.set("currentUser",i),i):(await d.set("currentUser",c),c)}return e}f("/",async e=>{await x(),await M(e)});f("/dashboard",async e=>{await x(),await M(e)});f("/booking",async e=>{await x(),await le(e)});f("/history",async e=>{await x(),await ge(e)});f("/loyalty",async e=>{await x(),await fe(e)});f("/contacts",async e=>{await x(),await ye(e)});f("/tips",async e=>{await x(),await _e(e)});f("/profile",async e=>{await x(),await O(e)});f("/login",async e=>{await we(e)});f("/admin/login",async e=>{await Y(e)});f("/admin",async e=>await G(e));f("/admin/queue",async e=>await K(e));f("/admin/booking",async e=>await X(e));f("/owner",async e=>await Z(e));f("/owner/services",async e=>await ee(e));f("/owner/staff",async e=>await te(e));f("/owner/reports",async e=>await ae(e));Q();
