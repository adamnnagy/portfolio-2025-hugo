console.log("Asset pipeline JavaScript loaded!");

const gallery = document.querySelector(".auto-scroll-gallery");

let isUserInteracting = false;
let scrollSpeed = 0.7; // pixels per frame

// Stop auto scroll on user scroll
gallery.addEventListener("wheel", () => (isUserInteracting = true));
gallery.addEventListener("touchstart", () => (isUserInteracting = true));
gallery.addEventListener("mouseenter", () => (isUserInteracting = true));

function autoScroll() {
	if (!isUserInteracting) {
		gallery.scrollLeft += scrollSpeed;
		// Reset scroll when reaching end
		if (gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth) {
			gallery.scrollLeft = 0;
		}
	}
	requestAnimationFrame(autoScroll);
}

autoScroll();
