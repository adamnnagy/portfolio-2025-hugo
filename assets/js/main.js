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

// get navbar height

const nav = document.querySelector(".site-nav");
const root = document.documentElement;

function updateNavHeight() {
	const height = nav.offsetHeight;
	root.style.setProperty("--nav-height", `${height}px`);
}

window.addEventListener("resize", updateNavHeight);
updateNavHeight();



