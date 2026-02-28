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
				entry.target.classList.remove("visible");
				entry.target.classList.add("faded-out");
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



// grain animation 

const grain = document.getElementById("grainValue");
const hero = document.querySelector(".hero-banner");
let lastUpdate = 0;
const fps = 24;
let isVisible = false; // The master toggle

// 1. Initialize the Observer
const observerGrain = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // isIntersecting is true when the hero is on screen
        isVisible = entry.isIntersecting;
    });
}, { 
    threshold: 0.05 // Trigger as soon as 5% of the hero is visible
});

// Start watching the hero
if (hero) {
    observerGrain.observe(hero);
}

// 2. The Animation Loop
function animateGrain(timestamp) {
    // Only run the heavy math if the hero is visible
    if (isVisible && (timestamp - lastUpdate > 1000 / fps)) {
        const newSeed = Math.floor(Math.random() * 1000);
        grain.setAttribute("seed", newSeed);
        lastUpdate = timestamp;
    }
    
    // We keep the loop alive, but it does almost nothing when isVisible is false
    requestAnimationFrame(animateGrain);
}

requestAnimationFrame(animateGrain);