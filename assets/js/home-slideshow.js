import {
  loadProjects,
  normalizeProjectImagePath,
  rankProjectsByRecency
} from "./data.js";

const SLIDE_LIMIT = 5;
const SLIDE_INTERVAL = 1500;
const DATA_URL = "data/projects.json";
const ILLUSTRATION_PAGE_URL = "/pages/illustration.html";
const lastModifiedCache = new Map();

async function getImageLastModifiedTimestamp(src) {
  if (lastModifiedCache.has(src)) {
    return lastModifiedCache.get(src);
  }

  const request = fetch(src, {
    method: "HEAD",
    cache: "no-store"
  })
    .then((response) => {
      if (!response.ok) {
        return 0;
      }

      const lastModified = response.headers.get("last-modified");
      const timestamp = lastModified ? Date.parse(lastModified) : 0;
      return Number.isFinite(timestamp) ? timestamp : 0;
    })
    .catch(() => 0);

  lastModifiedCache.set(src, request);
  return request;
}

async function getLatestSlides(projects, limit = SLIDE_LIMIT) {
  const projectCandidates = await Promise.all(
    projects.map(async (project) => {
      const firstImagePath = project.images[0];
      if (!firstImagePath) {
        return null;
      }

      const src = normalizeProjectImagePath(firstImagePath);
      const modifiedAt = await getImageLastModifiedTimestamp(src);

      return {
        src,
        alt: project.title,
        modifiedAt,
        year: project.year,
        originalIndex: project.originalIndex
      };
    })
  );

  return projectCandidates
    .filter(Boolean)
    .sort((a, b) => {
      if (b.modifiedAt !== a.modifiedAt) {
        return b.modifiedAt - a.modifiedAt;
      }

      if (b.year !== a.year) {
        return b.year - a.year;
      }

      return a.originalIndex - b.originalIndex;
    })
    .slice(0, limit);
}

function renderSlides(slidesEl, slides) {
  slidesEl.innerHTML = slides
    .map(
      (slide) =>
        `<div class="slide" role="link" tabindex="0" aria-label="Open illustration page"><img src="${slide.src}" alt="${slide.alt}" oncontextmenu="return false;"></div>`
    )
    .join("");
}

function setupCarousel() {
  const slidesEl = document.getElementById("slides");
  if (!slidesEl) {
    return;
  }

  const slides = Array.from(slidesEl.querySelectorAll(".slide"));
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const dotsEl = document.getElementById("dots");
  if (!prevBtn || !nextBtn || !dotsEl) {
    return;
  }

  function openIllustrationPage() {
    window.location.href = ILLUSTRATION_PAGE_URL;
  }

  slidesEl.style.transform = "translateX(0)";
  dotsEl.innerHTML = "";

  if (slides.length <= 1) {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
    dotsEl.style.display = "none";
    return;
  }

  prevBtn.style.display = "";
  nextBtn.style.display = "";
  dotsEl.style.display = "";

  let index = 0;
  let timer = null;

  slides.forEach((_, i) => {
    const slide = slides[i];
    if (slide) {
      slide.style.cursor = "pointer";
      slide.addEventListener("click", openIllustrationPage);
      slide.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openIllustrationPage();
        }
      });
    }

    const dot = document.createElement("button");
    dot.className = `dot${i === 0 ? " active" : ""}`;
    dot.setAttribute("aria-label", `Slide ${i + 1}`);
    dot.dataset.index = String(i);
    dot.addEventListener("click", () => {
      goTo(i);
      resetTimer();
    });
    dot.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goTo(i);
        resetTimer();
      }
    });
    dotsEl.appendChild(dot);
  });

  function update() {
    slidesEl.style.transform = `translateX(-${index * 100}%)`;
    Array.from(dotsEl.children).forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  }

  function next() {
    index = (index + 1) % slides.length;
    update();
  }

  function prev() {
    index = (index - 1 + slides.length) % slides.length;
    update();
  }

  function goTo(nextIndex) {
    index = ((nextIndex % slides.length) + slides.length) % slides.length;
    update();
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(next, SLIDE_INTERVAL);
  }

  function resetTimer() {
    stopTimer();
    startTimer();
  }

  prevBtn.onclick = () => {
    prev();
    resetTimer();
  };

  nextBtn.onclick = () => {
    next();
    resetTimer();
  };

  const slideshowEl = document.getElementById("slideshow");
  if (slideshowEl) {
    slideshowEl.onmouseenter = stopTimer;
    slideshowEl.onmouseleave = startTimer;
    slideshowEl.onfocusin = stopTimer;
    slideshowEl.onfocusout = startTimer;
  }

  document.onkeydown = (event) => {
    if (document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      return;
    }

    if (event.key === "ArrowLeft") {
      prev();
      resetTimer();
    }

    if (event.key === "ArrowRight") {
      next();
      resetTimer();
    }
  };

  update();
  startTimer();
}

async function initHomeSlideshow() {
  const slidesEl = document.getElementById("slides");
  if (!slidesEl) {
    return;
  }

  try {
    const projects = rankProjectsByRecency(await loadProjects(DATA_URL));
    const slides = await getLatestSlides(projects);
    if (slides.length > 0) {
      renderSlides(slidesEl, slides);
    }
  } catch (error) {
    console.error("Unable to load latest home slides.", error);
  }

  setupCarousel();
}

initHomeSlideshow();
