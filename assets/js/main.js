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
      observer.unobserve(entry.target); // optional
    }
  });
}, {
  rootMargin: '0px 0px -20% 0px', // 👈 Adjust this
  threshold: 0
});

const transitionDelayBase = 100;

document.querySelectorAll('.scroll-fade-in').forEach((el, i) => {
  el.style.transitionDelay = `${i * transitionDelayBase}ms`; // 100ms between elements
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
