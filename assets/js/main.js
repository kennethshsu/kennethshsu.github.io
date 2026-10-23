(function ($) {

	var $window = $(window),
		$body = $('body'),
		$header = $('#header'),
		$banner = $('#banner');

	// Breakpoints.
	breakpoints({
		xlarge: '(max-width: 1680px)',
		large: '(max-width: 1280px)',
		medium: '(max-width: 980px)',
		small: '(max-width: 736px)',
		xsmall: '(max-width: 480px)'
	});

	// Show the hero as soon as the page structure is ready (not after every image downloads).
	$(function () {
		window.setTimeout(function () {
			$body.removeClass('is-preload');
		}, 100);
	});

	function loadBackgroundImage() {
		if ($body.hasClass('has-background-image'))
			return;
		var img = new Image();
		img.src = 'images/background/background.webp';
		img.onload = function () {
			$body.addClass('has-background-image');
		};
	}

	$(function () {
		var run = function () {
			loadBackgroundImage();
		};
		if (window.requestIdleCallback)
			window.requestIdleCallback(run, { timeout: 2500 });
		else
			window.setTimeout(run, 400);
	});

	// Header.
	if ($banner.length > 0
		&& $header.hasClass('alt')) {

		$window.on('resize', function () { $window.trigger('scroll'); });

		$banner.scrollex({
			bottom: $header.outerHeight(),
			terminate: function () { $header.removeClass('alt'); },
			enter: function () { $header.addClass('alt'); },
			leave: function () { $header.removeClass('alt'); }
		});

	}

	// Menu.
	var $menu = $('#menu');

	$menu._locked = false;

	$menu._lock = function () {

		if ($menu._locked)
			return false;

		$menu._locked = true;

		window.setTimeout(function () {
			$menu._locked = false;
		}, 350);

		return true;

	};

	$menu._show = function () {

		if ($menu._lock())
			$body.addClass('is-menu-visible');

	};

	$menu._hide = function () {

		if ($menu._lock())
			$body.removeClass('is-menu-visible');

	};

	$menu._toggle = function () {

		if ($menu._lock())
			$body.toggleClass('is-menu-visible');

	};

	$menu
		.appendTo($body)
		.on('click', function (event) {

			event.stopPropagation();

			// Hide.
			$menu._hide();

		})
		.find('.inner')
		.on('click', '.close', function (event) {

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();

			// Hide.
			$menu._hide();

		})
		.on('click', function (event) {
			event.stopPropagation();
		})
		.on('click', 'a', function (event) {

			var href = $(this).attr('href');

			event.preventDefault();
			event.stopPropagation();

			// Hide.
			$menu._hide();

			// Redirect.
			window.setTimeout(function () {
				window.location.href = href;
			}, 350);

		});

	$body
		.on('click', 'a[href="#menu"]', function (event) {

			event.stopPropagation();
			event.preventDefault();

			// Toggle.
			$menu._toggle();

		})
		.on('keydown', function (event) {

			// Hide on escape.
			if (event.keyCode == 27)
				$menu._hide();

		});

	// Popup banner: optional deadline from #popup-banner data-show-until (ISO 8601). Omit attribute for no expiry.
	// data-manual banners stay hidden until something else adds .is-visible.
	$(document).ready(function () {
		var $banner = $('#popup-banner');
		if (!$banner.length || $banner.is('[data-manual]'))
			return;

		var raw = $banner.attr('data-show-until');
		var showUntilMs = raw ? Date.parse(raw) : Infinity;
		if (Number.isNaN(showUntilMs))
			showUntilMs = Infinity;

		function hideIfExpired() {
			if (Date.now() >= showUntilMs)
				$banner.removeClass('is-visible');
		}

		if (Date.now() >= showUntilMs)
			return;

		setTimeout(function () {
			hideIfExpired();
			if (Date.now() >= showUntilMs)
				return;
			$banner.addClass('is-visible');
			var msLeft = showUntilMs - Date.now();
			if (Number.isFinite(msLeft) && msLeft > 0)
				setTimeout(hideIfExpired, msLeft);
		}, 2000);
	});

	var pageScrollY = 0;
	var scrollRestorationBackup = null;

	function pageScrollIsLocked() {
		return document.documentElement.classList.contains('puzzle-open');
	}

	function readPageScrollY() {
		return window.scrollY || document.documentElement.scrollTop || 0;
	}

	function restorePageScrollPosition() {
		var y = pageScrollY;
		var root = document.documentElement;
		var previous = root.style.scrollBehavior;
		root.style.scrollBehavior = 'auto';
		window.scrollTo(0, y);
		root.style.scrollBehavior = previous;
		requestAnimationFrame(function () {
			window.scrollTo(0, y);
			requestAnimationFrame(function () {
				window.scrollTo(0, y);
			});
		});
	}

	function lockPageScroll() {
		if (pageScrollIsLocked())
			return;
		pageScrollY = readPageScrollY();
		if ('scrollRestoration' in history) {
			scrollRestorationBackup = history.scrollRestoration;
			history.scrollRestoration = 'manual';
		}
		document.body.style.top = '-' + pageScrollY + 'px';
		document.documentElement.classList.add('puzzle-open');
	}

	function unlockPageScroll() {
		if (!pageScrollIsLocked())
			return;
		var root = document.documentElement;
		root.classList.remove('puzzle-open');
		document.body.style.top = '';
		restorePageScrollPosition();
		if ('scrollRestoration' in history && scrollRestorationBackup !== null) {
			history.scrollRestoration = scrollRestorationBackup;
			scrollRestorationBackup = null;
		}
	}

	function hidePopupBanner() {
		$('#popup-banner').removeClass('is-visible');
	}

	var PUZZLE_URL = 'game.html';

	var PAGE_MODAL_PAGES = {
		technical_projects: 'technical_projects.html',
		keynote: 'keynote.html',
		publications: 'publications.html',
		volunteerism: 'volunteerism.html',
		backpacking: 'backpacking.html'
	};

	var pageModalCache = {};
	var pageModalLoading = false;

	function overlayIsVisible() {
		return pageModalLoading
			|| $('#puzzle-popup').hasClass('is-visible')
			|| $('#page-popup').hasClass('is-visible');
	}

	function parsePageModalPanel(html, id) {
		var doc = new DOMParser().parseFromString(html, 'text/html');
		return doc.querySelector('.page-modal-panel[data-page-modal-panel="' + id + '"]')
			|| doc.querySelector('.page-modal-panel');
	}

	function loadPageModalPanel(id) {
		if (pageModalCache[id])
			return $.Deferred().resolve(pageModalCache[id]).promise();

		var url = PAGE_MODAL_PAGES[id];
		if (!url)
			return $.Deferred().reject().promise();

		return $.ajax({ url: url, dataType: 'text' }).then(function (html) {
			var panel = parsePageModalPanel(html, id);
			if (!panel)
				throw new Error('Missing .page-modal-panel in ' + url);
			var markup = panel.outerHTML;
			pageModalCache[id] = markup;
			return markup;
		});
	}

	function mountPageModalPanel(id) {
		var deferred = $.Deferred();
		loadPageModalPanel(id).done(function (markup) {
			var $mount = $('#page-popup-mount');
			$mount.html(markup);
			var $panel = $mount.find('.page-modal-panel').first();
			revealPageModalContent($panel[0]);
			var titleId = $panel.find('.page-modal-title').attr('id');
			if (titleId)
				$('#page-popup').attr('aria-labelledby', titleId);
			deferred.resolve();
		}).fail(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	}

	function clearPageModalMount() {
		$('#page-popup-mount').empty();
	}

	function syncOverlayBackdrop() {
		var visible = overlayIsVisible();
		$('#popup-banner-backdrop').toggleClass('is-visible', visible);
		if (visible)
			lockPageScroll();
		else
			unlockPageScroll();
	}

	function pageModalHash(id) {
		return '#page/' + id;
	}

	function parsePageModalHash(hash) {
		if (!hash || hash.indexOf('#page/') !== 0)
			return null;
		var id = hash.slice(6).split(/[?#]/)[0];
		return PAGE_MODAL_PAGES[id] ? id : null;
	}

	function revealPageModalContent(container) {
		$(container).find('.reveal').addClass('is-visible');
	}

	function hidePageModal(opts) {
		opts = opts || {};
		var wasOpen = $('#page-popup').hasClass('is-visible');
		clearPageModalMount();
		pageModalLoading = false;
		$('#page-popup').removeClass('is-visible').attr('aria-hidden', 'true');
		if (wasOpen) {
			if (!opts.skipScrollUnlock)
				syncOverlayBackdrop();
			if (!opts.skipHashUpdate && parsePageModalHash(window.location.hash)) {
				try {
					history.replaceState({}, '', window.location.pathname + window.location.search);
				} catch (err) { /* ignore */ }
				restorePageScrollPosition();
			}
		}
	}

	function openPageModal(id, opts) {
		opts = opts || {};
		if (!PAGE_MODAL_PAGES[id] || pageModalLoading)
			return;

		if (opts.onlyIfRequested && parsePageModalHash(window.location.hash) !== id)
			return;

		if ($('#puzzle-popup').hasClass('is-visible'))
			hidePuzzle();

		pageModalLoading = true;
		syncOverlayBackdrop();

		var $popup = $('#page-popup');
		var $scroll = $('#page-popup-scroll');

		mountPageModalPanel(id).done(function () {
			if (opts.onlyIfRequested && parsePageModalHash(window.location.hash) !== id) {
				pageModalLoading = false;
				clearPageModalMount();
				syncOverlayBackdrop();
				return;
			}

			pageModalLoading = false;
			$popup.addClass('is-visible').attr('aria-hidden', 'false');
			syncOverlayBackdrop();
			$scroll.scrollTop(0);
			window.setTimeout(function () {
				var el = $scroll.get(0);
				if (el && el.focus)
					try { el.focus({ preventScroll: true }); } catch (err) { el.focus(); }
			}, 50);

			if (!opts.skipHistory && parsePageModalHash(window.location.hash) !== id) {
				try {
					history.pushState({ pageModal: id, scrollY: pageScrollY }, '', pageModalHash(id));
				} catch (err) { /* ignore */ }
			}
		}).fail(function () {
			pageModalLoading = false;
			clearPageModalMount();
			syncOverlayBackdrop();
			console.error('Could not load page modal:', id);
		});
	}

	function scrollToContactFromPageModal() {
		hidePageModal({ skipScrollUnlock: true });
		syncOverlayBackdrop();
		var $footer = $('#footer');
		if (!$footer.length)
			return;
		$('html, body').animate({ scrollTop: $footer.offset().top }, 500);
	}

	function openPageModalFromHash() {
		var id = parsePageModalHash(window.location.hash);
		if (id)
			openPageModal(id, { skipHistory: true, onlyIfRequested: true });
		else if ($('#page-popup').hasClass('is-visible'))
			hidePageModal();
	}

	function puzzleFrameLoaded(frame) {
		if (!frame || !frame.src || frame.src === 'about:blank')
			return false;
		try {
			return new URL(frame.src, window.location.href).pathname.endsWith('game.html');
		} catch (e) {
			return frame.src.indexOf('game.html') !== -1;
		}
	}

	function preloadPuzzleFrame() {
		var frame = document.getElementById('puzzle-frame');
		if (!frame || puzzleFrameLoaded(frame))
			return;
		frame.src = PUZZLE_URL;
	}

	var puzzleInfoOpen = false;

	window.addEventListener('message', function (event) {
		if (event.origin !== window.location.origin)
			return;
		var data = event.data;
		if (!data || data.source !== 'kennethhsu-game' || data.type !== 'info')
			return;
		puzzleInfoOpen = !!data.open;
		$('#puzzle-popup').toggleClass('game-help-open', puzzleInfoOpen);
	});

	function hidePuzzle() {
		if (puzzleInfoOpen)
			return;
		var wasOpen = $('#puzzle-popup').hasClass('is-visible');
		$('#puzzle-popup').removeClass('is-visible');
		puzzleInfoOpen = false;
		$('#puzzle-popup').removeClass('game-help-open');
		if (wasOpen)
			syncOverlayBackdrop();
	}

	function requestClosePuzzleInfo() {
		var frame = document.getElementById('puzzle-frame');
		if (!frame || !frame.contentWindow)
			return;
		try {
			frame.contentWindow.postMessage(
				{ source: 'kennethhsu-parent', type: 'close-info' },
				window.location.origin
			);
		} catch (err) { /* ignore */ }
	}

	$('#popup-banner-close').on('click', hidePopupBanner);
	$('#puzzle-popup-close').on('click', hidePuzzle);
	$('#page-popup-close').on('click', function () {
		hidePageModal();
	});
	$('#popup-banner-backdrop').on('click', function () {
		hidePageModal();
		hidePuzzle();
	});

	$(document).on('click', 'a[data-page-modal]', function (event) {
		var id = $(this).data('page-modal');
		if (!id || !PAGE_MODAL_PAGES[id])
			return;
		event.preventDefault();
		openPageModal(id);
	});

	$(document).on('click', '#page-popup-mount a.page-modal-contact-link', function (event) {
		event.preventDefault();
		try {
			history.replaceState({}, '', window.location.pathname + window.location.search);
		} catch (err) { /* ignore */ }
		scrollToContactFromPageModal();
	});

	$window.on('load', function () {
		var runPreload = function () {
			preloadPuzzleFrame();
		};
		if (window.requestIdleCallback)
			window.requestIdleCallback(runPreload, { timeout: 3000 });
		else
			window.setTimeout(runPreload, 500);

		window.setTimeout(function () {
			$('.puzzle-invite').addClass('is-visible');
		}, 3000);
	});

	$('.puzzle-invite').on('click', function () {
		preloadPuzzleFrame();
		puzzleInfoOpen = false;
		$('#puzzle-popup').removeClass('game-help-open');
		$('#puzzle-popup').addClass('is-visible');
		syncOverlayBackdrop();
	});

	$(document).on('keydown', function (event) {
		if (event.keyCode == 27) {
			if ($('#puzzle-popup').hasClass('is-visible') && puzzleInfoOpen) {
				event.preventDefault();
				requestClosePuzzleInfo();
				return;
			}
			hidePopupBanner();
			if ($('#page-popup').hasClass('is-visible')) {
				hidePageModal();
				return;
			}
			hidePuzzle();
		}
	});

	$(window).on('popstate', function (event) {
		var state = event.originalEvent && event.originalEvent.state;
		if (state && typeof state.scrollY === 'number')
			pageScrollY = state.scrollY;
		openPageModalFromHash();
	});

	$(function () {
		if ($('#page-popup-mount').length)
			openPageModalFromHash();
	});

})(jQuery);