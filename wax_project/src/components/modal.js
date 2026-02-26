// === Modal Component ===

export async function showModal({ title, content, footer, onClose }) {
    const container = document.getElementById('modal-container');

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
    <div class="modal__header">
      <h3 class="modal__title">${title}</h3>
      <button class="modal__close">&times;</button>
    </div>
    <div class="modal__body">${content}</div>
    ${footer ? `<div class="modal__footer">${footer}</div>` : ''}
  `;

    container.appendChild(backdrop);
    container.appendChild(modal);

    async function close() {
        backdrop.style.opacity = '0';
        modal.style.opacity = '0';
        modal.style.transform = 'translate(-50%, -50%) scale(0.95)';
        setTimeout(async () => {
            backdrop.remove();
            modal.remove();
        }, 200);
        if (onClose) onClose();
    }

    backdrop.addEventListener('click', close);
    modal.querySelector('.modal__close').addEventListener('click', close);

    return { modal, close };
}

export async function closeAllModals() {
    const container = document.getElementById('modal-container');
    container.innerHTML = '';
}
