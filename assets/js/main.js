console.log("Asset pipeline JavaScript loaded!");

// fade-in-page

window.addEventListener("load", () => {
	document.querySelector(".fade-in-page").classList.add("loaded");
});

// scroll-fade-in

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.classList.remove('faded-out'); // Ensure it's not faded out
    } else {
      // Element is no longer intersecting
      entry.target.classList.remove('visible');
      entry.target.classList.add('faded-out'); // Add a class to fade it out
    }
  });
}, {
  // Use a smaller rootMargin or no rootMargin for more immediate fade-out
  // Consider adjusting threshold to trigger fade-out when it's still somewhat visible
  rootMargin: '0px 0px -10% 0px', // Example: fades out when 10% of element is out of view from bottom
  threshold: [0, 0.5, 1] // Multiple thresholds to get more precise intersection data
});

const transitionDelayBase = 200;

document.querySelectorAll('.scroll-fade-in').forEach((el, i) => {
  el.style.transitionDelay = `${i * transitionDelayBase}ms`;
  observer.observe(el);
});

// get variables

function getCSSVariable(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function hexToRgb(hex) {
  const parsed = hex.replace('#', '');
  return [
    parseInt(parsed.substring(0, 2), 16),
    parseInt(parsed.substring(2, 4), 16),
    parseInt(parsed.substring(4, 6), 16)
  ];
}

// text-fade-in

document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.scroll-color-text');

  function updateTextColor() {
    const windowHeight = window.innerHeight;
    const fadeUntilRatio = 0.8;

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      let progress = 1 - Math.min(Math.max(rect.top / windowHeight, 0), 1);

      // Normalize to 0–1 based on fadeUntilRatio
      let ratio = Math.min(progress / fadeUntilRatio, 1);

      const startColor = hexToRgb(getCSSVariable('--scroll-primary-color'));
      const endColor = hexToRgb(getCSSVariable('--scroll-secondary-color'));

      const interpolated = startColor.map((start, i) =>
        Math.round(start + (endColor[i] - start) * ratio)
      );

      el.style.color = `rgb(${interpolated.join(',')})`;
    });
  }

  // Initial update
  updateTextColor();

  // Smooth scroll update using requestAnimationFrame
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateTextColor();
        ticking = false;
      });
      ticking = true;
    }
  });
});
