function menu() {
    console.log("Toggling menu visibility...");
    document.querySelectorAll('.menuList').forEach(element => {
        const currentDisplay = element.style.display;
        const newDisplay = (currentDisplay === 'none' || currentDisplay === '') ? 'block' : 'none';
        
        element.style.display = newDisplay;
        console.log(`Menu element toggled: ${element}, display set to: ${newDisplay}`);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const revealItems = document.querySelectorAll('.welcome, .homeHero, .homeStrip, .homeGrid, .homePanel, .featuredWork, .workCard, .homeCards, .pageBlock, .card, .portCard, .soloCard, .cv, .references, .project, .quotes, .contForm, .footer');

    const canRevealOnScroll = 'IntersectionObserver' in window;

    if (canRevealOnScroll) {
        revealItems.forEach(item => item.classList.add('reveal-ready'));

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-in');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -50px 0px'
        });

        revealItems.forEach(item => revealObserver.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add('reveal-in'));
    }

    document.querySelectorAll('[onclick]').forEach(element => {
        if (!element.hasAttribute('role')) {
            element.setAttribute('role', 'button');
        }

        const isAnchorWithHref = element.tagName.toLowerCase() === 'a' && element.hasAttribute('href');

        if (!element.hasAttribute('tabindex') && !isAnchorWithHref) {
            element.setAttribute('tabindex', '0');
        }

        element.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                element.click();
            }
        });
    });

    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', event => event.preventDefault());
    });

    const canUseCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (canUseCustomCursor) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        window.addEventListener('pointermove', (event) => {
            document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
            document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
            cursor.style.left = `${event.clientX}px`;
            cursor.style.top = `${event.clientY}px`;
        });

        document.querySelectorAll('a, button, input, textarea, [onclick], .menuButton').forEach(element => {
            element.addEventListener('pointerenter', () => cursor.classList.add('is-hovering'));
            element.addEventListener('pointerleave', () => cursor.classList.remove('is-hovering'));
        });
    }
});
