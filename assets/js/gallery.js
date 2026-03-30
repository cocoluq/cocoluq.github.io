const CLICKABLE_ATTRIBUTE = "data-clickable";

function createGalleryItem(item, index, onSelect) {
  const element = document.createElement("div");
  element.className = `gallery-items gallery-card${item.spanClass ? ` ${item.spanClass}` : ""}`;
  element.setAttribute("role", "button");
  element.setAttribute("tabindex", "0");
  element.setAttribute(CLICKABLE_ATTRIBUTE, "true");
  element.dataset.galleryIndex = String(index);

  const image = document.createElement("img");
  image.src = item.src;
  image.alt = item.title;
  image.loading = "lazy";
  image.decoding = "async";

  const overlay = document.createElement("div");
  overlay.className = "gallery-item-overlay";
  overlay.setAttribute("aria-hidden", "true");

  const overlayContent = document.createElement("div");
  overlayContent.className = "gallery-item-overlay-content";

  const title = document.createElement("p");
  title.className = "gallery-item-title";
  title.textContent = item.title;

  const tags = document.createElement("p");
  tags.className = "gallery-item-tags";
  tags.textContent = item.tags.join(" / ");

  overlayContent.append(title, tags);
  overlay.appendChild(overlayContent);
  element.append(image, overlay);

  const handleSelect = () => onSelect(item);
  element.addEventListener("click", handleSelect);
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  });

  return element;
}

export function renderInitialGallery(items, container, options = {}) {
  container.innerHTML = "";
  return appendGalleryItems(items, container, options);
}

export function appendGalleryItems(items, container, options = {}) {
  const { offset = 0, onSelect = () => {} } = options;
  const fragment = document.createDocumentFragment();

  items.forEach((item, localIndex) => {
    fragment.appendChild(createGalleryItem(item, offset + localIndex, onSelect));
  });

  container.appendChild(fragment);
  return items.length;
}

export function setupInfiniteScroll({ sentinel, onLoadMore }) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const hasMore = onLoadMore();
        if (!hasMore) {
          observer.disconnect();
        }
      });
    },
    {
      rootMargin: "240px 0px"
    }
  );

  observer.observe(sentinel);
  return observer;
}
