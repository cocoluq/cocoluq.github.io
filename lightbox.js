document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll(".gallery-items");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-image");

    function openLightbox(src) {
        lightboxImg.src = src;
        // 用 flex 以启用 CSS 的居中效果
        lightbox.style.display = "flex";
    }

    function closeLightbox() {
        lightbox.style.display = "none";
        lightboxImg.src = "";
    }

    galleryItems.forEach(item => {
        item.addEventListener("click", function(event) {
            const img = this.querySelector("img");
            if (!img) return; // 没有图片的格子（如“Books”链接）不弹出
            event.preventDefault();
            openLightbox(img.src);
        });
    });

    // 点击遮罩（图片外区域）关闭
    lightbox.addEventListener("click", function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Esc 关闭
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            closeLightbox();
        }
    });
});