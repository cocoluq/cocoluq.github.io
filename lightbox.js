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
        // 获取点击的缩略图的原图URL
        const fullImageSrc = this.querySelector("img").src;
        // 设置lightbox中的<img>的src属性为原图URL
        lightboxImg.src = fullImageSrc;
        // 显示lightbox
        lightbox.style.display = "block";
    });
});

// 添加点击事件处理程序来关闭lightbox
closeButton.addEventListener("click", function() {
    // 隐藏lightbox
    lightbox.style.display = "none";
});