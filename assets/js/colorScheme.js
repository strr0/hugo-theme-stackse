class StackColorScheme {
    localStorageKey = 'StackColorScheme';
    currentScheme;
    systemPreferScheme;

    constructor(toggleEl) {
        this.bindMatchMedia();
        this.currentScheme = this.getSavedScheme();
        if (window.matchMedia('(prefers-color-scheme: dark)').matches === true)
            this.systemPreferScheme = 'dark'
        else
            this.systemPreferScheme = 'light';

        this.dispatchEvent(document.documentElement.dataset.scheme);

        if (toggleEl)
            this.bindClick(toggleEl);

        if (document.body.style.transition == '')
            document.body.style.setProperty('transition', 'background-color .3s ease');
    }

    saveScheme() {
        localStorage.setItem(this.localStorageKey, this.currentScheme);
    }

    bindClick(toggleEl) {
        toggleEl.addEventListener('click', (e) => {
            if (this.isDark()) {
                /// Disable dark mode
                this.currentScheme = 'light';
            }
            else {
                this.currentScheme = 'dark';
            }

            this.setBodyClass();

            if (this.currentScheme == this.systemPreferScheme) {
                /// Set to auto
                this.currentScheme = 'auto';
            }

            this.saveScheme();
        })
    }

    isDark() {
        return (this.currentScheme == 'dark' || this.currentScheme == 'auto' && this.systemPreferScheme == 'dark');
    }

    dispatchEvent(colorScheme) {
        const event = new CustomEvent('onColorSchemeChange', {
            detail: colorScheme
        });
        window.dispatchEvent(event);
    }

    setBodyClass() {
        if (this.isDark()) {
            document.documentElement.dataset.scheme = 'dark';
        }
        else {
            document.documentElement.dataset.scheme = 'light';
        }

        this.dispatchEvent(document.documentElement.dataset.scheme);
    }

    getSavedScheme() {
        const savedScheme = localStorage.getItem(this.localStorageKey);

        if (savedScheme == 'light' || savedScheme == 'dark' || savedScheme == 'auto') return savedScheme;
        else return 'auto';
    }

    bindMatchMedia() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (e.matches) {
                this.systemPreferScheme = 'dark';
            }
            else {
                this.systemPreferScheme = 'light';
            }
            this.setBodyClass();
        });
    }
}

export default StackColorScheme;
