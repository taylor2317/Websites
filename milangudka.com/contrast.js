const contrastStorageKey = 'highContrastEnabled';

function setHighContrast(enabled) {
    document.documentElement.classList.toggle('high-contrast', enabled);
    document.querySelectorAll('.fa-droplet-slash').forEach(toggle => {
        toggle.setAttribute('aria-pressed', String(enabled));
        toggle.setAttribute('title', enabled ? 'Disable high-contrast mode' : 'Enable high-contrast mode');
    });
    localStorage.setItem(contrastStorageKey, String(enabled));
}

function toggleHighContrast() {
    setHighContrast(!document.documentElement.classList.contains('high-contrast'));
}

document.addEventListener('DOMContentLoaded', () => {
    setHighContrast(localStorage.getItem(contrastStorageKey) === 'true');

    document.querySelectorAll('.fa-droplet-slash').forEach(toggle => {
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('tabindex', '0');
        toggle.setAttribute('aria-label', 'Toggle high-contrast mode');

        toggle.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleHighContrast();
            }
        });
    });
});
