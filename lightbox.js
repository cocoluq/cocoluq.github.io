document.addEventListener('DOMContentLoaded', function() {
    // 获取所有缩略图元素
    const galleryItems = document.querySelectorAll(".gallery-items");

    // 获取lightbox元素和lightbox内容元素
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-image");

    // 获取关闭按钮元素
    const closeButton = document.getElementById("close-button");

    // 添加点击事件处理程序来显示lightbox
    galleryItems.forEach(item => {
        item.addEventListener("click", function(event) {
            event.preventDefault();
            const img = this.querySelector("img");
            if (!img) return;
            const fullImageSrc = img.src;
            lightboxImg.src = fullImageSrc;
            lightbox.style.display = "block";
        });
    });

    if (closeButton) {
        closeButton.addEventListener("click", function() {
            lightbox.style.display = "none";
            lightboxImg.src = "";
        });
    } else {
        console.warn("close-button 未找到：请确认 index.html 中包含 id 为 close-button 的元素。");
    }

    const overlay = document.getElementById("lightbox-overlay");
    if (overlay) {
        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) {
                lightbox.style.display = "none";
                lightboxImg.src = "";
            }
        });
    }

    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            lightbox.style.display = "none";
            lightboxImg.src = "";
        }
    });
});