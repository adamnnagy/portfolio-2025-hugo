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

// get navbar height

const nav = document.querySelector(".site-nav");
const root = document.documentElement;

function updateNavHeight() {
	const height = nav.offsetHeight;
	root.style.setProperty("--nav-height", `${height}px`);
}

window.addEventListener("resize", updateNavHeight);
updateNavHeight();



