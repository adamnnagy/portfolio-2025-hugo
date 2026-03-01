// grain animation 

const grain = document.getElementById("grainValue");
const hero = document.querySelector(".hero-banner");
let lastUpdate = 0;
const fps = 8;
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