(function () {
    'use strict';

    var reveals = document.querySelectorAll('.reveal');

    if (!reveals || reveals.length === 0) return;

    // if elements lack an explicit delay attribute, assign a staggered default
    var baseDelay = 150; // ms between items
    Array.prototype.forEach.call(reveals, function (el, idx) {
        if (!el.hasAttribute('data-delay')) {
            el.setAttribute('data-delay', (baseDelay * (idx + 1)) + 'ms');
        }
    });

    if (!('IntersectionObserver' in window)) {
        Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
        return;
    }

    var io = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var delay = el.getAttribute('data-delay');
                if (delay) el.style.transitionDelay = delay;
                el.classList.add('is-visible');
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.15 });

    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });

})();

/* Contact Form Reply Fields Toggle */
(function () {
    'use strict';

    function initReplyFields() {
        const replyCheckbox = document.getElementById('reply-request');
        const replyFieldsContainer = document.getElementById('reply-fields');
        const emailField = document.getElementById('email');
        const linkedinField = document.getElementById('linkedin');

        if (!replyCheckbox || !replyFieldsContainer) {
            console.warn('[initReplyFields] Elements not found, retrying...');
            return false;
        }

        function updateReplyFields() {
            const isChecked = replyCheckbox.checked;
            console.log('[updateReplyFields] Checkbox checked:', isChecked);

            if (isChecked) {
                replyFieldsContainer.classList.add('visible');
                emailField && emailField.setAttribute('required', 'required');
                linkedinField && linkedinField.setAttribute('required', 'required');
            } else {
                replyFieldsContainer.classList.remove('visible');
                emailField && emailField.removeAttribute('required');
                linkedinField && linkedinField.removeAttribute('required');
            }
        }

        replyCheckbox.addEventListener('change', updateReplyFields);
        replyCheckbox.addEventListener('click', updateReplyFields);

        // Initialize state on page load
        updateReplyFields();
        console.log('[initReplyFields] Successfully initialized');
        return true;
    }

    function attemptInit() {
        if (initReplyFields()) {
            return; // Success
        }
        // Retry after a short delay if elements not yet available
        setTimeout(attemptInit, 100);
    }

    // Try to initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attemptInit);
    } else {
        attemptInit();
    }

    // Also expose globally for manual trigger (e.g., after fetch)
    window.initReplyFields = initReplyFields;
})();
