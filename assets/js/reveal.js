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
