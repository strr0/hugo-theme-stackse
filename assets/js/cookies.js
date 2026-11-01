class CookieConsent {
    static COOKIE_NAME = 'cookie_consent';
    static COOKIE_DAYS = 365;

    state = null;
    banner = null;
    settingsPanel = null;

    constructor() {
        this.banner = document.getElementById('cookie-consent-banner');
        this.settingsPanel = document.getElementById('cookie-settings-panel');

        this.state = this.loadState();

        if (!this.state && this.banner) {
            this.showBanner();
        }

        this.bindEvents();
        this.dispatchConsentEvent();
    }

    loadState() {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(CookieConsent.COOKIE_NAME + '='));

        if (!cookie) return null;

        try {
            return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
        } catch {
            return null;
        }
    }

    saveState() {
        if (!this.state) return;

        const expires = new Date();
        expires.setDate(expires.getDate() + CookieConsent.COOKIE_DAYS);

        document.cookie = `${CookieConsent.COOKIE_NAME}=${encodeURIComponent(JSON.stringify(this.state))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    }

    showBanner() {
        if (this.banner) {
            this.banner.removeAttribute('aria-hidden');
        }
    }

    hideBanner() {
        if (this.banner) {
            // Blur any focused element inside the banner before hiding
            const activeElement = document.activeElement;
            if (activeElement && this.banner.contains(activeElement)) {
                activeElement.blur();
            }
            this.banner.setAttribute('aria-hidden', 'true');
        }
        this.hideSettings();
    }

    showSettings() {
        if (this.settingsPanel) {
            this.settingsPanel.removeAttribute('aria-hidden');

            // Restore checkbox states from current state or defaults
            const checkboxes = this.settingsPanel.querySelectorAll('input[data-cookie-category]');
            checkboxes.forEach((cb) => {
                const category = cb.dataset.cookieCategory;
                if (category && this.state && typeof this.state[category] === 'boolean') {
                    cb.checked = this.state[category];
                } else {
                    cb.checked = false;
                }
            });
        }
    }

    hideSettings() {
        if (this.settingsPanel) {
            // Blur any focused element inside the settings panel before hiding
            const activeElement = document.activeElement;
            if (activeElement && this.settingsPanel.contains(activeElement)) {
                activeElement.blur();
            }
            this.settingsPanel.setAttribute('aria-hidden', 'true');
        }
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            const action = target.dataset.cookieAction;

            if (!action) return;

            switch (action) {
                case 'accept':
                    this.acceptAll();
                    break;
                case 'deny':
                    this.denyAll();
                    break;
                case 'settings':
                    this.showSettings();
                    break;
                case 'save':
                    this.saveSettings();
                    break;
                case 'cancel':
                    this.hideSettings();
                    break;
                case 'reopen':
                    this.showBanner();
                    break;
            }
        });
    }

    acceptAll() {
        this.state = {
            necessary: true,
            analytics: true,
            functional: true,
            timestamp: Date.now()
        };
        this.saveState();
        this.hideBanner();
        this.dispatchConsentEvent();
    }

    denyAll() {
        this.state = {
            necessary: true,
            analytics: false,
            functional: false,
            timestamp: Date.now()
        };
        this.saveState();
        this.hideBanner();
        this.dispatchConsentEvent();
    }

    saveSettings() {
        const checkboxes = document.querySelectorAll('input[data-cookie-category]');

        this.state = {
            necessary: true,
            analytics: false,
            functional: false,
            timestamp: Date.now()
        };

        checkboxes.forEach((cb) => {
            const category = cb.dataset.cookieCategory;
            if (category && category in this.state) {
                this.state[category] = cb.checked;
            }
        });

        this.saveState();
        this.hideBanner();
        this.dispatchConsentEvent();
    }

    dispatchConsentEvent() {
        // Cross-module event consumed by consent-gated features (for example commentsConsent.js).
        const event = new CustomEvent('onCookieConsentChange', {
            detail: this.state
        });
        window.dispatchEvent(event);

        // Set data attributes on document for CSS-based control
        if (this.state) {
            document.documentElement.dataset.consentAnalytics = String(this.state.analytics);
            document.documentElement.dataset.consentFunctional = String(this.state.functional);
        }
    }

    // Public API
    hasConsent(category) {
        if (!this.state) return false;
        return this.state[category] ?? false;
    }

    getState() {
        return this.state;
    }

    reopenBanner() {
        this.showBanner();
    }
}

// Initialize when DOM is ready and expose globally
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cookieConsent = new CookieConsent();
    });
} else {
    window.cookieConsent = new CookieConsent();
}
