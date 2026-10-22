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

	// Play initial animations on page load.
	$window.on('load', function () {
		window.setTimeout(function () {
			$body.removeClass('is-preload');
		}, 100);
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

	function lockPageScroll() {
		pageScrollY = window.scrollY || document.documentElement.scrollTop || 0;
		document.body.style.top = '-' + pageScrollY + 'px';
		document.documentElement.classList.add('puzzle-open');
	}

	function unlockPageScroll() {
		var root = document.documentElement;
		root.classList.remove('puzzle-open');
		document.body.style.top = '';
		var previous = root.style.scrollBehavior;
		root.style.scrollBehavior = 'auto';
		window.scrollTo(0, pageScrollY);
		root.style.scrollBehavior = previous;
	}

	function hidePopupBanner() {
		$('#popup-banner').removeClass('is-visible');
	}

	var PUZZLE_URL = 'game.html';

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

	function hidePuzzle() {
		var wasOpen = $('#puzzle-popup').hasClass('is-visible');
		$('#puzzle-popup, #popup-banner-backdrop').removeClass('is-visible');
		if (wasOpen)
			unlockPageScroll();
	}

	$('#popup-banner-close').on('click', hidePopupBanner);
	$('#puzzle-popup-close, #popup-banner-backdrop').on('click', hidePuzzle);

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
		$('#puzzle-popup, #popup-banner-backdrop').addClass('is-visible');
		lockPageScroll();
	});

	$(document).on('keydown', function (event) {
		if (event.keyCode == 27) {
			hidePopupBanner();
			hidePuzzle();
		}
	});

})(jQuery);