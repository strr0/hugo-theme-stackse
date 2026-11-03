export function setupAnswerToggle() {
    const root = document.documentElement;
    const key = 'StackShowAnswer';
    const toggle = document.getElementById('answer-toggle');

    // Sidebar switch: flip the site-wide preference (persisted).
    if (toggle) {
        toggle.addEventListener('click', () => {
            const next = root.dataset.showAnswer === 'shown' ? 'hidden' : 'shown';
            localStorage.setItem(key, next);
            root.dataset.showAnswer = next;
        });
    }

    // Per-page reveal: clicking the mask only unblocks the current article,
    // it does not change the global preference (next article stays masked).
    document.querySelectorAll('.answer-mask-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.closest('.article-content');
            if (content) content.classList.add('revealed');
        });
    });

    // Per-page collapse: a "收起答案" button appears once revealed, letting the
    // reader mask this article again without touching the global preference.
    const collapseBtns = document.querySelectorAll('.answer-collapse-btn');
    collapseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.closest('.article-content');
            if (content) content.classList.remove('revealed');
        });
    });

    // Smart float: hide the collapse button while scrolling down (so it stays
    // out of the reading area) and bring it back when scrolling up. Near the
    // top it is always shown so it never gets stuck hidden.
    if (collapseBtns.length) {
        const getScrollY = () => window.scrollY || document.documentElement.scrollTop || 0;
        let lastY = getScrollY();
        let ticking = false;
        const apply = () => {
            const y = getScrollY();
            const delta = y - lastY;
            if (Math.abs(delta) < 6) {
                ticking = false;
                return;
            }
            const hide = delta > 0 && y > 80;
            collapseBtns.forEach(btn => btn.classList.toggle('scroll-hide', hide));
            lastY = y;
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(apply);
                ticking = true;
            }
        }, { passive: true });
    }
}
