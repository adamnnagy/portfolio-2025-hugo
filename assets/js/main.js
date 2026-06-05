// fade-in-page

window.addEventListener("load", () => {
	document.querySelector(".fade-in-page").classList.add("loaded");
});

// scroll-fade-in
const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("visible");
				entry.target.classList.remove("faded-out");
				// After it becomes visible, ensure no future animation has a delay
				// by *removing* the custom property.
				// This will make 'var(--initial-delay, 0s)' resolve to 0s.
				entry.target.style.removeProperty("--initial-delay");
			} else {

                // TURN THESE ON FOR EFFECT APPLIED WHEN SCROLLING UP

				// entry.target.classList.remove("visible");
				// entry.target.classList.add("faded-out");


				// When fading out, we don't re-apply the initial delay.
				// It should still have '--initial-delay' removed.
			}
		});
	},
	{
		rootMargin: "0px 0px 100px 0px", // Adjust this as needed for earlier trigger
		threshold: 0,
	},
);

const transitionDelayBase = 200;

document.querySelectorAll(".scroll-fade-in").forEach((el, i) => {
	// Set the custom property for the initial delay
	el.style.setProperty("--initial-delay", `${i * transitionDelayBase}ms`);
	observer.observe(el);
});
// get variables

function getCSSVariable(name) {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();
}

function hexToRgb(hex) {
	const parsed = hex.replace("#", "");
	return [
		parseInt(parsed.substring(0, 2), 16),
		parseInt(parsed.substring(2, 4), 16),
		parseInt(parsed.substring(4, 6), 16),
	];
}

// text-fade-in

document.addEventListener("DOMContentLoaded", () => {
	const elements = document.querySelectorAll(".scroll-color-text");

	function updateTextColor() {
		const windowHeight = window.innerHeight;
		const fadeUntilRatio = 0.9;

		elements.forEach((el) => {
			const rect = el.getBoundingClientRect();
			let progress =
				1 - Math.min(Math.max(rect.top / windowHeight, 0), 1);

			// Normalize to 0–1 based on fadeUntilRatio
			let ratio = Math.min(progress / fadeUntilRatio, 1);

			const startColor = hexToRgb(
				getCSSVariable("--scroll-primary-color"),
			);
			const endColor = hexToRgb(
				getCSSVariable("--scroll-secondary-color"),
			);

			const interpolated = startColor.map((start, i) =>
				Math.round(start + (endColor[i] - start) * ratio),
			);

			el.style.color = `rgb(${interpolated.join(",")})`;
		});
	}

	// Initial update
	updateTextColor();

	// Smooth scroll update using requestAnimationFrame
	let ticking = false;
	window.addEventListener("scroll", () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				updateTextColor();
				ticking = false;
			});
			ticking = true;
		}
	});
});

// scene heading scramble on title hover

(function () {
	const title = document.querySelector(".hero-banner .title");
	if (!title) return;

	const scenes = JSON.parse(title.dataset.scenes || "[]") || [];
	if (!scenes.length) return;

	const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ. -";
	const SCRAMBLE_MS = 350;
	const HOLD_MS = 750;

	const originalHTML = title.innerHTML;
	const originalText = title.textContent;

	let isHovered = false;
	let rafId = null;
	let timerId = null;
	let sceneIndex = 0;

	function cancel() {
		if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
		if (timerId) { clearTimeout(timerId); timerId = null; }
	}

	function scrambleTo(target, onDone) {
		const start = performance.now();
		function frame(now) {
			const progress = Math.min((now - start) / SCRAMBLE_MS, 1);
			const settled = Math.floor(progress * target.length);
			let out = "";
			for (let i = 0; i < target.length; i++) {
				if (i < settled) {
					out += target[i];
				} else if (target[i] === " ") {
					out += " ";
				} else {
					out += CHARS[Math.floor(Math.random() * CHARS.length)];
				}
			}
			title.textContent = out;
			if (progress < 1) {
				rafId = requestAnimationFrame(frame);
			} else {
				title.textContent = target;
				if (onDone) onDone();
			}
		}
		rafId = requestAnimationFrame(frame);
	}

	function showNextScene() {
		if (!isHovered) return;
		title.classList.add("is-scene");
		const next = scenes[sceneIndex % scenes.length];
		sceneIndex++;
		scrambleTo(next, () => {
			if (!isHovered) { restoreTitle(); return; }
			timerId = setTimeout(showNextScene, HOLD_MS);
		});
	}

	function restoreTitle() {
		scrambleTo(originalText, () => {
			title.innerHTML = originalHTML;
			title.classList.remove("is-scene");
		});
	}

	title.addEventListener("mouseenter", () => {
		isHovered = true;
		sceneIndex = 0;
		cancel();
		showNextScene();
	});

	title.addEventListener("mouseleave", () => {
		isHovered = false;
		cancel();
		restoreTitle();
	});
})();

// timecode glitch on roles hover

(function () {
	const roles = document.querySelector(".hero-banner .roles");
	if (!roles) return;

	const codes = Array.from(roles.querySelectorAll("code"));
	if (!codes.length) return;

	function parseSecs(str) {
		const [h, m, s] = str.split(":").map(Number);
		return h * 3600 + m * 60 + s;
	}

	function formatSecs(total) {
		const t = Math.max(0, Math.floor(total));
		const h = Math.floor(t / 3600);
		const m = Math.floor((t % 3600) / 60);
		const s = t % 60;
		return [h, m, s].map(n => String(n).padStart(2, "0")).join(":");
	}

	// seconds-per-second: mix of fast-forward, slow, and reverse
	const SPEEDS = [-25, -12, -4, 3, 8, 18, 30, 50];

	const originals = codes.map(c => c.textContent.trim());
	const originSecs = originals.map(parseSecs);

	let isHovered = false;
	let rafId = null;
	let lastTime = null;

	const state = codes.map((_, i) => ({
		secs: originSecs[i],
		speed: 8,
		nextChange: 0,
	}));

	function tick(now) {
		if (!lastTime) lastTime = now;
		const dt = (now - lastTime) / 1000;
		lastTime = now;

		state.forEach((s, i) => {
			if (now >= s.nextChange) {
				s.speed = SPEEDS[Math.floor(Math.random() * SPEEDS.length)];
				// each code gets its own random interval so they stay out of sync
				s.nextChange = now + 80 + Math.random() * 320;
			}
			s.secs += s.speed * dt;
			if (s.secs < 0) s.secs = 0;
			codes[i].textContent = formatSecs(s.secs);
		});

		if (isHovered) rafId = requestAnimationFrame(tick);
	}

	roles.addEventListener("mouseenter", () => {
		isHovered = true;
		lastTime = null;
		state.forEach((s, i) => {
			s.secs = originSecs[i];
			s.speed = SPEEDS[Math.floor(Math.random() * SPEEDS.length)];
			s.nextChange = 0;
		});
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(tick);
	});

	roles.addEventListener("mouseleave", () => {
		isHovered = false;
		if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
		codes.forEach((code, i) => { code.textContent = originals[i]; });
	});
})();

// clapperboard cursor

(function () {
	// Open: stick raised diagonally (tip near cursor origin 4,4). Stick uses \\ stripes, strip uses // stripes.
	var OPEN_SVG =
		'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">' +
		'<defs>' +
		'<clipPath id="c1"><rect x="3" y="14" width="26" height="2"/></clipPath>' +
		'<clipPath id="c2"><polygon points="30.5,10 29.5,14 3.5,6.5 4.5,2"/></clipPath>' +
		'</defs>' +
		// Board body
		'<rect x="2" y="13" width="28" height="18" rx="1" fill="#fff" stroke="#111" stroke-width="1.5"/>' +
		// Ruled lines
		'<line x1="5" y1="20" x2="27" y2="20" stroke="#ccc" stroke-width="0.75"/>' +
		'<line x1="5" y1="24" x2="27" y2="24" stroke="#ccc" stroke-width="0.75"/>' +
		'<line x1="5" y1="28" x2="27" y2="28" stroke="#ccc" stroke-width="0.75"/>' +
		// Top strip with // stripes
		'<rect x="2" y="13" width="28" height="4" fill="#111"/>' +
		'<g clip-path="url(#c1)">' +
		'<line x1="3" y1="11" x2="-1" y2="19" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="9" y1="11" x2="5" y2="19" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="15" y1="11" x2="11" y2="19" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="21" y1="11" x2="17" y2="19" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="27" y1="11" x2="23" y2="19" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="33" y1="11" x2="29" y2="19" stroke="#fff" stroke-width="2.5"/>' +
		'</g>' +
		'<rect x="2" y="13" width="28" height="4" fill="none" stroke="#111" stroke-width="1"/>' +
		// Open stick with \\ stripes
		'<polygon points="30.5,10 29.5,14 3.5,6.5 4.5,2" fill="#111" stroke="#111" stroke-width="1.5"/>' +
		'<g clip-path="url(#c2)">' +
		'<line x1="3" y1="6" x2="7" y2="14" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="9" y1="6" x2="13" y2="14" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="15" y1="6" x2="19" y2="14" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="21" y1="6" x2="25" y2="14" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="27" y1="6" x2="31" y2="14" stroke="#fff" stroke-width="2.5"/>' +
		'</g>' +
		// Hinge dot
		'<circle cx="30" cy="12" r="2" fill="#333"/>' +
		'</svg>';

	// Closed: stick flat on top. Stick \\ stripes, strip // stripes — opposing directions create the classic pattern.
	var CLOSED_SVG =
		'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">' +
		'<defs>' +
		'<clipPath id="c3"><rect x="3" y="14" width="26" height="2"/></clipPath>' +
		'<clipPath id="c4"><rect x="2.5" y="8.5" width="27" height="4"/></clipPath>' +
		'</defs>' +
		// Board body
		'<rect x="2" y="13" width="28" height="18" rx="1" fill="#fff" stroke="#111" stroke-width="1.5"/>' +
		// Ruled lines
		'<line x1="5" y1="20" x2="27" y2="20" stroke="#ccc" stroke-width="0.75"/>' +
		'<line x1="5" y1="24" x2="27" y2="24" stroke="#ccc" stroke-width="0.75"/>' +
		'<line x1="5" y1="28" x2="27" y2="28" stroke="#ccc" stroke-width="0.75"/>' +
		// Flat stick with \\ stripes (drawn before top strip)
		'<rect x="2" y="8" width="28" height="5" rx="1" fill="#111" stroke="#111" stroke-width="1.5"/>' +
		'<g clip-path="url(#c4)">' +
		'<line x1="3" y1="6" x2="7" y2="14" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="9" y1="6" x2="13" y2="14" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="15" y1="6" x2="19" y2="14" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="21" y1="6" x2="25" y2="14" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="27" y1="6" x2="31" y2="14" stroke="#fff" stroke-width="2.5"/>' +
		'</g>' +
		// Top strip with // stripes (drawn over stick junction)
		'<rect x="2" y="13" width="28" height="4" fill="#111"/>' +
		'<g clip-path="url(#c3)">' +
		'<line x1="3" y1="11" x2="-1" y2="19" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="9" y1="11" x2="5" y2="19" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="15" y1="11" x2="11" y2="19" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="21" y1="11" x2="17" y2="19" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="27" y1="11" x2="23" y2="19" stroke="#fff" stroke-width="2.5"/>' +
		'<line x1="33" y1="11" x2="29" y2="19" stroke="#fff" stroke-width="2.5"/>' +
		'</g>' +
		'<rect x="2" y="13" width="28" height="4" fill="none" stroke="#111" stroke-width="1"/>' +
		// Hinge dot
		'<circle cx="30" cy="12" r="2" fill="#333"/>' +
		'</svg>';

	function makeCursor(svg) {
		return 'url("data:image/svg+xml;base64,' + btoa(svg) + '") 4 4, pointer';
	}

	var CURSOR_OPEN = makeCursor(OPEN_SVG);
	var CURSOR_CLOSED = makeCursor(CLOSED_SVG);
	var CLAP_MS = 120;

	// Inject a <style> tag so !important overrides UA-stylesheet cursor on <a>, <button>, etc.
	var styleEl = null;
	var curSelector = '*';
	var closeTimer = null;

	function applyStyle(cursorValue) {
		if (!styleEl) {
			styleEl = document.createElement('style');
			document.head.appendChild(styleEl);
		}
		styleEl.textContent = curSelector + '{cursor:' + cursorValue + '!important}';
	}

	function setOpen() { applyStyle(CURSOR_OPEN); }

	function onDown() {
		if (closeTimer) clearTimeout(closeTimer);
		applyStyle(CURSOR_CLOSED);
		closeTimer = setTimeout(setOpen, CLAP_MS);
	}

	function init(selector) {
		destroy();
		curSelector = (selector === '*' || selector === 'body' || selector === 'html') ? '*' : selector;
		applyStyle(CURSOR_OPEN);
		window.addEventListener('mousedown', onDown);
	}

	function destroy() {
		if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
		window.removeEventListener('mousedown', onDown);
		if (styleEl) { styleEl.remove(); styleEl = null; }
	}

	window.clapCursor = { init: init, destroy: destroy };

	init('*');
})();

// toggle-text

document.querySelectorAll('.toggle-text').forEach(function (el) {
    el.addEventListener('click', function () {
        el.classList.toggle('toggle-text--alt');
    });
});

// get navbar height

const nav = document.querySelector(".site-nav");
const root = document.documentElement;

function updateNavHeight() {
	const height = nav.offsetHeight;
	root.style.setProperty("--nav-height", `${height}px`);
}

window.addEventListener("resize", updateNavHeight);
updateNavHeight();



