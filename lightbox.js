// Get the lightbox and close button elements
const lightbox = document.getElementById("lightbox");
const closeButton = document.getElementById("close-button");

// Get all the lightbox-trigger elements
const lightboxTriggers = document.querySelectorAll(".lightbox-trigger");

// Function to open the lightbox
function openLightbox(event) {
    const imgSrc = event.currentTarget.getAttribute("href");
    const lightboxImg = document.getElementById("lightbox-img");
    lightboxImg.setAttribute("src", imgSrc);
    lightbox.style.display = "block";
    event.preventDefault();
}

// Function to close the lightbox
function closeLightbox() {
    lightbox.style.display = "none";
}

// Add click event listeners to open the lightbox
lightboxTriggers.forEach(trigger => {
    trigger.addEventListener("click", openLightbox);
});

// Add click event listener to close the lightbox
closeButton.addEventListener("click", closeLightbox);
