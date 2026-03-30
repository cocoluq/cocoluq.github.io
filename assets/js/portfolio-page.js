import { loadProjects, filterProjectsByPage, flattenProjects, getProjectPreviewItems } from "./data.js";
import { renderInitialGallery, appendGalleryItems, setupInfiniteScroll } from "./gallery.js";
import { createLightboxController } from "./lightbox.js";

const INITIAL_BATCH_SIZE = 15;
const LOAD_MORE_BATCH_SIZE = 10;

function setEmptyState(emptyState, message, visible) {
  if (!emptyState) {
    return;
  }

  emptyState.textContent = message;
  emptyState.hidden = !visible;
}

export async function initPortfolioPage({
  pageType,
  dataUrl,
  gallerySelector = "[data-gallery]",
  emptySelector = "[data-gallery-empty]",
  sentinelSelector = "[data-gallery-sentinel]",
  loadingSelector = "[data-gallery-loading]"
}) {
  const gallery = document.querySelector(gallerySelector);
  const emptyState = document.querySelector(emptySelector);
  const sentinel = document.querySelector(sentinelSelector);
  const loadingNote = document.querySelector(loadingSelector);
  const lightboxRoot = document.getElementById("lightbox");

  if (!gallery || !sentinel || !lightboxRoot) {
    return;
  }

  const lightbox = createLightboxController(lightboxRoot);

  try {
    const projects = await loadProjects(dataUrl);
    const filteredProjects = filterProjectsByPage(projects, pageType);
    const items = pageType === "other-works"
      ? getProjectPreviewItems(filteredProjects)
      : flattenProjects(filteredProjects);

    if (items.length === 0) {
      gallery.innerHTML = "";
      sentinel.hidden = true;
      if (loadingNote) {
        loadingNote.hidden = true;
      }
      setEmptyState(emptyState, "No projects available yet.", true);
      return;
    }

    setEmptyState(emptyState, "", false);

    let currentIndex = 0;
    const handleSelect = (item) => lightbox.open(item);

    function loadBatch(batchSize) {
      const nextItems = items.slice(currentIndex, currentIndex + batchSize);
      if (nextItems.length === 0) {
        return false;
      }

      appendGalleryItems(nextItems, gallery, {
        offset: currentIndex,
        onSelect: handleSelect
      });
      currentIndex += nextItems.length;
      return currentIndex < items.length;
    }

    renderInitialGallery([], gallery);
    loadBatch(INITIAL_BATCH_SIZE);

    if (currentIndex >= items.length) {
      sentinel.hidden = true;
      if (loadingNote) {
        loadingNote.hidden = true;
      }
      return;
    }

    sentinel.hidden = false;
    if (loadingNote) {
      loadingNote.hidden = false;
    }
    setupInfiniteScroll({
      sentinel,
      onLoadMore: () => {
        const hasMore = loadBatch(LOAD_MORE_BATCH_SIZE);
        if (!hasMore && loadingNote) {
          loadingNote.hidden = true;
        }
        return hasMore;
      }
    });
  } catch (error) {
    console.error(error);
    gallery.innerHTML = "";
    sentinel.hidden = true;
    if (loadingNote) {
      loadingNote.hidden = true;
    }
    setEmptyState(emptyState, "Unable to load projects right now.", true);
  }
}

const autoPageType = document.body.dataset.pageType;
const autoDataUrl = document.body.dataset.projectsUrl;

if (autoPageType && autoDataUrl) {
  initPortfolioPage({
    pageType: autoPageType,
    dataUrl: autoDataUrl
  });
}
