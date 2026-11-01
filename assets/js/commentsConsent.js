/*
 * Consent-gated comments bootstrap.
 *
 * This module controls whether third-party comments are rendered based on
 * functional cookie consent, and injects template scripts in sequence to
 * avoid eager or duplicate script execution.
 */

/**
 * Resolve functional consent with layered fallback:
 * 1) explicit event detail, 2) CookieConsent public API, 3) dataset mirror.
 */
const hasFunctionalConsent = (consentDetail) => {
    const cookieConsent = window.cookieConsent;

    return (
        consentDetail?.functional ??
        cookieConsent?.hasConsent?.('functional') ??
        document.documentElement.dataset.consentFunctional === 'true'
    );
};

const prepareDeferredScripts = (fragment) => {
    return Array.from(fragment.querySelectorAll('script')).map(script => {
        const placeholder = document.createComment('comments-script-placeholder');
        script.replaceWith(placeholder);
        return { placeholder, script };
    });
};

const activateDeferredScripts = async (scripts) => {
    // Inject scripts sequentially so third-party embeds can rely on execution order.
    for (const { placeholder, script } of scripts) {
        if (!placeholder.parentNode) {
            continue;
        }

        const newScript = document.createElement('script');
        Array.from(script.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });

        if (script.textContent) {
            newScript.text = script.textContent;
        }

        let done = Promise.resolve();
        if (newScript.src) {
            done = new Promise(resolve => {
                newScript.onload = newScript.onerror = () => resolve();
            });
        }

        placeholder.replaceWith(newScript);
        await done;
    }
};

const initCommentsConsent = () => {
    // Main entry: gate comments rendering by functional cookie consent.
    const placeholder = document.getElementById('comments-consent-placeholder');
    const container = document.getElementById('comments-container');
    const template = document.getElementById('comments-template');

    if (!placeholder || !container || !template) {
        return;
    }

    let commentsLoaded = false;
    let commentsLoading = false;

    const showComments = async () => {
        placeholder.style.display = 'none';
        container.style.display = 'block';

        if (commentsLoaded || commentsLoading) {
            return;
        }

        // Prevent duplicate template hydration while scripts are still loading.
        commentsLoading = true;

        try {
            const clone = template.content.cloneNode(true);
            const scripts = prepareDeferredScripts(clone);

            container.appendChild(clone);
            await activateDeferredScripts(scripts);
            commentsLoaded = true;
        } finally {
            commentsLoading = false;
        }
    };

    const hideComments = () => {
        placeholder.style.display = 'block';
        container.style.display = 'none';
    };

    window.addEventListener('onCookieConsentChange', (event) => {
        // Cross-module contract: this event is dispatched by cookies.js.
        const detail = event.detail;
        if (hasFunctionalConsent(detail)) {
            showComments();
        } else {
            hideComments();
        }
    });

    if (hasFunctionalConsent()) {
        showComments();
    } else {
        hideComments();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommentsConsent, { once: true });
} else {
    initCommentsConsent();
}
