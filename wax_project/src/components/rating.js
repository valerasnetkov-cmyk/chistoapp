// === Rating Component ===

export function createRating(currentRating = 0, onChange = null, readonly = false) {
    const container = document.createElement('div');
    container.className = 'star-rating';

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = `star-rating__star${i <= currentRating ? ' star-rating__star--active' : ''}`;
        star.textContent = '⭐';
        star.dataset.value = i;

        if (!readonly) {
            star.addEventListener('mouseenter', () => {
                container.querySelectorAll('.star-rating__star').forEach((s, idx) => {
                    s.classList.toggle('star-rating__star--active', idx < i);
                });
            });

            star.addEventListener('mouseleave', () => {
                const current = parseInt(container.dataset.rating || '0');
                container.querySelectorAll('.star-rating__star').forEach((s, idx) => {
                    s.classList.toggle('star-rating__star--active', idx < current);
                });
            });

            star.addEventListener('click', () => {
                container.dataset.rating = i;
                container.querySelectorAll('.star-rating__star').forEach((s, idx) => {
                    s.classList.toggle('star-rating__star--active', idx < i);
                });
                if (onChange) onChange(i);
            });
        }

        container.appendChild(star);
    }

    container.dataset.rating = currentRating;
    return container;
}

export function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '⭐' : '☆';
    }
    return stars;
}
