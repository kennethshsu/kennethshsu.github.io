(function () {
    'use strict';

    var reveals = document.querySelectorAll('.reveal');

    if (!reveals || reveals.length === 0) return;

    var baseDelay = 300;
    var bannerInitialDelay = 120;
    var bannerStaggerStep = 90;
    var started = false;
    var banner = document.querySelector('#banner');
    var bannerStagger = 0;

    function revealDelay(el) {
        var custom = el.getAttribute('data-delay');
        if (custom != null && custom !== '') {
            return custom;
        }
        if (banner && banner.contains(el)) {
            var delay = bannerInitialDelay + bannerStagger * bannerStaggerStep;
            bannerStagger += 1;
            return delay + 'ms';
        }
        return baseDelay + 'ms';
    }

    function showAllImmediately() {
        Array.prototype.forEach.call(reveals, function (el) {
            el.classList.add('is-visible');
        });
    }

    function startRevealAnimations() {
        if (started) return;
        started = true;

        if (!('IntersectionObserver' in window)) {
            showAllImmediately();
            return;
        }

        var io = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var el = entry.target;
                el.style.transitionDelay = revealDelay(el);
                el.classList.add('is-visible');
                observer.unobserve(el);
            });
        }, { threshold: 0.15 });

        Array.prototype.forEach.call(reveals, function (el) {
            io.observe(el);
        });
    }

    function afterPreloadRemoved() {
        requestAnimationFrame(function () {
            requestAnimationFrame(startRevealAnimations);
        });
    }

    document.addEventListener('pagereveal', afterPreloadRemoved, { once: true });

    // Fallback if pagereveal never fires (e.g. script load order).
    window.setTimeout(function () {
        if (started) return;
        if (document.body.classList.contains('is-preload')) return;
        afterPreloadRemoved();
    }, 400);
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
