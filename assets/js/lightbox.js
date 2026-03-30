function getTagsText(tags, year) {
  const parts = [...tags];
  if (year) {
    parts.push(String(year));
  }
  return parts.join(" / ");
}

export function createLightboxController(root) {
  if (!root) {
    throw new Error("Lightbox root element was not found.");
  }

  const panel = root.querySelector("[data-lightbox-panel]");
  const gallery = root.querySelector("[data-lightbox-gallery]");
  const title = root.querySelector("[data-lightbox-title]");
  const tags = root.querySelector("[data-lightbox-tags]");
  const description = root.querySelector("[data-lightbox-description]");
  const closeButton = root.querySelector("[data-lightbox-close]");

  function renderImages(item) {
    gallery.innerHTML = "";

    const fragment = document.createDocumentFragment();
    const projectImages = Array.isArray(item.projectImages) && item.projectImages.length > 0
      ? item.projectImages
      : [item.src];

    projectImages.forEach((src) => {
      const figure = document.createElement("figure");
      figure.className = "lightbox-image-frame";

      const image = document.createElement("img");
      image.className = "lightbox-content";
      image.src = src;
      image.alt = item.title;
      image.loading = "lazy";
      image.decoding = "async";

      figure.appendChild(image);
      fragment.appendChild(figure);
    });

    gallery.appendChild(fragment);
  }

  function close() {
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("hidden", "");
    document.body.classList.remove("lightbox-open");
  }

  function open(item) {
    renderImages(item);
    title.textContent = item.title;
    tags.textContent = getTagsText(item.tags, item.year);
    description.textContent = item.description;
    root.removeAttribute("hidden");
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  }

  root.addEventListener("click", (event) => {
    if (!panel.contains(event.target)) {
      close();
    }
  });

  closeButton.addEventListener("click", close);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && root.classList.contains("is-open")) {
      close();
    }
  });

  return {
    open,
    close
  };
}
