import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { aboutPage, homePage, navigationItems, siteMeta } from "../src/data/site.mjs";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const aboutCommentBlock = `		
<!-- Upcoming contact form
        <div class="contact-form">    
  		<form action="https://formspree.io/cocoluq@gmail.com" method="post">
    	<input type="text" required placeholder="Anything that you want...">
   		<button type="submit">Send</button>
 		</form>
        </div> 
-->`;

function escapeControlCharactersInStrings(rawText) {
  let result = "";
  let inString = false;
  let isEscaping = false;

  for (const char of rawText) {
    if (isEscaping) {
      result += char;
      isEscaping = false;
      continue;
    }

    if (char === "\\") {
      result += char;
      if (inString) {
        isEscaping = true;
      }
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString) {
      if (char === "\n") {
        result += "\\n";
        continue;
      }

      if (char === "\r") {
        result += "\\r";
        continue;
      }

      if (char === "\t") {
        result += "\\t";
        continue;
      }
    }

    result += char;
  }

  return result;
}

function parseProjectsText(rawText) {
  const withoutLineComments = rawText
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");

  const escapedControlCharacters = escapeControlCharactersInStrings(withoutLineComments);
  const withoutTrailingCommas = escapedControlCharacters.replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(withoutTrailingCommas);
}

async function getLatestHomeSlides() {
  const rawProjects = await readFile(resolve(rootDir, "data/projects.json"), "utf8");
  const projects = parseProjectsText(rawProjects);

  const latestPerProject = await Promise.all(
    projects.map(async (project) => {
      const images = Array.isArray(project.images) ? project.images : [];
      if (!project?.title || images.length === 0) {
        return null;
      }

      const normalizedPath = String(images[0]).replace(/^\.\.\//, "");
      const fullPath = resolve(rootDir, normalizedPath);
      const fileStat = await stat(fullPath);
      return {
        src: normalizedPath.replace(/\\/g, "/"),
        alt: project.title,
        modifiedAt: fileStat.mtimeMs
      };
    })
  );

  return latestPerProject
    .filter(Boolean)
    .sort((a, b) => b.modifiedAt - a.modifiedAt)
    .slice(0, 5)
    .map(({ src, alt }) => ({ src, alt }));
}

function renderNavigation(activePageType = "") {
  const items = navigationItems
    .map((item) => {
      const subtitle = item.subtitle
        ? `
				<ul class="subtitle">
${item.subtitle
  .map(
    (entry) =>
      `		  			<li><a href="${entry.href}"><span class="slash">//</span>${entry.label}</a></li>`
  )
  .join("\n")}
		  		</ul>`
        : "";

      const activeClass = item.className === activePageType ? " nav-active" : "";
      return `		  	<li><a href="${item.href}" class="${item.className}${activeClass}">${item.label}${item.suffix ?? ""}</a>${subtitle}
		 	</li>`;
    })
    .join("\n");

  return `<nav class="navigation-bar">
      <ul>
${items}
	  </ul>		
	</nav>`;
}

function renderHead({ stylesheetPath, faviconPath }) {
  return `<head>
<meta charset="utf-8">
	<title>${siteMeta.title}</title>
	<link href="${stylesheetPath}" rel="stylesheet" type="text/css" media="screen">
	<link href="${siteMeta.fontStylesheet}" rel="stylesheet" type="text/css">
	<link rel="shortcut icon" href="${faviconPath}" type="image/x-icon" />
	<meta name="viewport" content="width=device-width,initial-scale=1" />
	<script>
		document.addEventListener('contextmenu', event => event.preventDefault());
	</script>
</head>`;
}

function renderFooter() {
  return `<footer>
	<div class="footer"><p class="copyright">&copy; Tantangent. All rights reserved. <br>${siteMeta.email}</p></div>
</footer>`;
}

function renderInnerHeader(activePageType = "") {
  return `<header>
	<!--Navigation Bar-->
	${renderNavigation(activePageType)}  	
    <!--Logo&title-->
        <a href="${siteMeta.siteUrl}"><img src="../assets/logo/logowithredeye.svg" class="logo-but-smaller" alt="logo but smaller"></a>
		<h1 class="title-but-smaller" onselectstart="return false;">${siteMeta.title}</h1>
</header>`;
}

function renderPortfolioBootstrap() {
  return `<script type="module" src="../assets/js/portfolio-page.js"></script>`;
}

async function renderHomePage() {
  const slideshowItems = await getLatestHomeSlides();
  const introLines = Array.isArray(homePage.introLines) && homePage.introLines.length > 0
    ? homePage.introLines
    : [homePage.intro].filter(Boolean);
  const slides = slideshowItems
    .map(
      (slide) =>
        `            <div class="slide"><img src="${slide.src}" alt="${slide.alt}" oncontextmenu="return false;"></div>`
    )
    .join("\n");
  const introMarkup = introLines
    .map(
      (line, index) =>
        `\t\t<p class="typewriter typewriter-line-${index + 1}">${line}</p>`
    )
    .join("\n");

  return `<!doctype html>
<html>
${renderHead({
  stylesheetPath: "main css.css",
  faviconPath: "../cocoluq.github.io/assets/logo/tantangent.ico"
})}

<body>
<header>
	<!--Navigation Bar-->
	${renderNavigation()}  		
</header>

	
	<!--main structure-->
		<a href="${siteMeta.siteUrl}"><img src="assets/logo/logowithredeye.svg" class="logo" alt="logo"></a>
		<h1 id="title" onselectstart="return false;">${siteMeta.title}</h1>
		<div class="intro">
${introMarkup}
		</div>
		<br>
	<!--few big fine illustrations here-->	
		<!-- Slideshow -->
    <div class="slideshow" id="slideshow" aria-roledescription="carousel">
        <div class="slides" id="slides">
${slides}
        </div>
        <button class="nav-btn prev" id="prev" aria-label="Previous slide">&lsaquo;</button>
        <button class="nav-btn next" id="next" aria-label="Next slide">&rsaquo;</button>
        <div class="dots" id="dots" aria-hidden="false"></div>
    </div>

    <!-- lightbox -->
    <div id="lightbox" style="display:none;">
      <div class="lightbox-overlay" id="lightbox-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:1000;">
        <button id="close-button" aria-label="Close" style="position:absolute;top:20px;right:20px;font-size:28px;color:#fff;background:transparent;border:none;cursor:pointer;">&times;</button>
        <img id="lightbox-image" src="" alt="" style="max-width:90%;max-height:90%;box-shadow:0 0 20px rgba(0,0,0,0.5);">
      </div>
    </div>
<script type="module" src="assets/js/home-slideshow.js"></script>
${renderFooter()}
</body>
</html>
`;
}

function renderAboutPage() {
  const aboutText = aboutPage.about.join("<br>\n\t\t\t");
  const socialLinks = aboutPage.socialLinks
    .map(
      (link) =>
        `			<li><a href="${link.href}"><img src="${link.icon}" class="icon" alt="${link.alt}"></a></li>`
    )
    .join("\n");

  return `<!doctype html>
<html>
${renderHead({
  stylesheetPath: "../main css.css",
  faviconPath: "../assets/logo/tantangent.ico"
})}
<body data-page-type="about">
${renderInnerHeader("about")}
        <!--main structure-->
        <div class="right-bottom-box">
            <ul class="generic-page-title">
            <li><h1>${aboutPage.heading[0]}</h1></li>
            <li><h1>${aboutPage.heading[1]}</h1></li>
            </ul>
        </div>
    <section class="container">
		<div class="avatar-me"><img src="${aboutPage.avatar.src}" class="avatar-image" alt="${aboutPage.avatar.alt}"></div>
		<div class="title-of-page">About me
		<hr>
		<p class="inside-about-me">${aboutText}<br>
			</p>
		</div>
		
        <div class="title-of-page">Contact
			<hr>
			<p class="inside-about-me">${aboutPage.contact}</p>
        <ul class="follow">
${socialLinks}
        </ul>
        </div>
${aboutCommentBlock}
    </section>
${renderFooter()}
</body>
</html>
`;
}

function renderGenericPage({ pageTitle, heading, pageType }) {
  return `<!doctype html>
<html>
${renderHead({
  stylesheetPath: "../main css.css",
  faviconPath: "../assets/logo/tantangent.ico"
})}
<body data-page-type="${pageType}">
${renderInnerHeader(pageType)}
        <!--main structure-->
        <div class="right-bottom-box">
            <ul class="generic-page-title">
            <li><h1>${heading}</h1></li>
            </ul>
        </div>
		<section class="container">
			<div class="title-of-page">${pageTitle}
			<hr>
			</div>
		</section>
${renderFooter()}
</body>
</html>
`;
}

function renderPortfolioPage({ pageTitle, heading, pageType }) {
  const gallerySection =
    pageType === "illustration"
      ? `				<div class="gallery" data-gallery></div>
				<p class="gallery-empty-state" data-gallery-empty hidden></p>
				<div class="gallery-sentinel" data-gallery-sentinel hidden></div>
				<p class="gallery-loading-note" data-gallery-loading hidden>Scroll for more</p>`
      : `			<div class="title-of-page">${pageTitle}
			<hr>
				<div class="gallery" data-gallery></div>
				<p class="gallery-empty-state" data-gallery-empty hidden></p>
				<div class="gallery-sentinel" data-gallery-sentinel hidden></div>
				<p class="gallery-loading-note" data-gallery-loading hidden>Scroll for more</p>
			</div>`;

  return `<!doctype html>
<html>
${renderHead({
  stylesheetPath: "../main css.css",
  faviconPath: "../assets/logo/tantangent.ico"
})}
<body data-page-type="${pageType}" data-projects-url="../data/projects.json">
${renderInnerHeader(pageType)}
        <!--main structure-->
        <div class="right-bottom-box">
            <ul class="generic-page-title">
            <li><h1>${heading}</h1></li>
            </ul>
        </div>
		<section class="container">
${gallerySection}
			<div class="lightbox" id="lightbox" aria-hidden="true" hidden>
				<div class="lightbox-panel" data-lightbox-panel>
					<button class="lightbox-close" type="button" aria-label="Close lightbox" data-lightbox-close>&times;</button>
					<div class="lightbox-body">
						<div class="lightbox-gallery-column" data-lightbox-scroll>
							<div class="lightbox-inline-meta" data-lightbox-inline-meta hidden>
								<h2 class="lightbox-title" data-lightbox-inline-title></h2>
								<p class="lightbox-tags" data-lightbox-inline-tags></p>
								<p class="lightbox-description" data-lightbox-inline-description></p>
							</div>
							<div class="lightbox-gallery" data-lightbox-gallery></div>
						</div>
						<div class="lightbox-meta">
							<h2 class="lightbox-title" data-lightbox-title></h2>
							<p class="lightbox-tags" data-lightbox-tags></p>
							<p class="lightbox-description" data-lightbox-description></p>
						</div>
					</div>
				</div>
			</div>
${renderPortfolioBootstrap()}
		</section>
${renderFooter()}
</body>
</html>
`;
}

async function writePage(relativePath, contents) {
  const filePath = resolve(rootDir, relativePath);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, "utf8");
}

await writePage("index.html", await renderHomePage());
await writePage("pages/about.html", renderAboutPage());
await writePage(
  "pages/illustration.html",
  renderPortfolioPage({
    pageTitle: "Illustration",
    heading: "ILLUSTRATION",
    pageType: "illustration"
  })
);
await writePage(
  "pages/other_works.html",
  renderPortfolioPage({
    pageTitle: "Other Works",
    heading: "OTHER WORKS",
    pageType: "other-works"
  })
);
await writePage(
  "pages/playground.html",
  renderGenericPage({
    pageTitle: "Playground",
    heading: "PLAYGROUND",
    pageType: "playground"
  })
);

console.log("Rendered index.html and all subpages.");
