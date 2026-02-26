// === Contacts Page ===
import { renderHeader, initHeaderEvents } from '../../components/header.js';

export async function renderContactsPage(app) {
    app.innerHTML = `
    ${await renderHeader()}
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
  `;

    initHeaderEvents();
}
