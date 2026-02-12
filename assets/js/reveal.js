(function () {
    'use strict';

    var reveals = document.querySelectorAll('.reveal');

    if (!reveals || reveals.length === 0) return;

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

        if (!replyCheckbox || !replyFieldsContainer) return;

        function updateReplyFields() {
            const isChecked = replyCheckbox.checked;
            
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
        
        // Initialize state on page load
        updateReplyFields();
    }

    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReplyFields);
    } else {
        initReplyFields();
    }

    // Also expose globally if footer is loaded dynamically via fetch
    window.initReplyFields = initReplyFields;
})();
