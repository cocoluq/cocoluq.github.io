const ILLUSTRATION_TAG = "illustration";

function normalizeTags(tags) {
  return tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
}

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

function validateProject(project, index, seenTitles) {
  if (!project || typeof project !== "object") {
    throw new Error(`Project at index ${index} must be an object.`);
  }

  const title = String(project.title ?? "").trim();
  if (!title) {
    throw new Error(`Project at index ${index} is missing a valid "title".`);
  }

  if (seenTitles.has(title)) {
    console.warn(`Duplicate project title found: "${title}". Using index-based internal id.`);
  }
  seenTitles.add(title);

  if (!Array.isArray(project.tags)) {
    throw new Error(`Project "${title}" must include a "tags" array.`);
  }

  if (!Array.isArray(project.images)) {
    throw new Error(`Project "${title}" must include an "images" array.`);
  }

  return {
    ...project,
    id: `project-${index + 1}`,
    originalIndex: index,
    title,
    year: Number(project.year) || new Date().getFullYear(),
    description: String(project.description ?? "").trim(),
    tags: normalizeTags(project.tags),
    images: project.images.map((image) => String(image).trim()).filter(Boolean),
    imageLayouts: Array.isArray(project.imageLayouts) ? project.imageLayouts : []
  };
}

export async function loadProjects(dataUrl) {
  const response = await fetch(dataUrl, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to load project data from ${dataUrl}.`);
  }

  const rawText = await response.text();
  const rawProjects = parseProjectsText(rawText);
  if (!Array.isArray(rawProjects)) {
    throw new Error("projects.json must contain an array.");
  }

  const seenTitles = new Set();
  return rawProjects
    .map((project, index) => validateProject(project, index, seenTitles))
    .filter((project) => {
      if (project.images.length === 0) {
        console.warn(`Project "${project.title}" has no images and will be skipped.`);
        return false;
      }
      return true;
    });
}

export function filterProjectsByPage(projects, pageType) {
  return projects.filter((project) => {
    const hasIllustrationTag = project.tags.includes(ILLUSTRATION_TAG);
    return pageType === "illustration" ? hasIllustrationTag : !hasIllustrationTag;
  });
}

export function getProjectPreviewItems(projects) {
  return projects.map((project) => ({
    src: project.images[0],
    projectImages: project.images,
    title: project.title,
    projectTitle: project.title,
    tags: project.tags,
    description: project.description,
    imageIndex: 0,
    year: project.year,
    spanClass: project.imageLayouts[0] || ""
  }));
}

export function flattenProjects(projects) {
  return projects.flatMap((project) =>
    project.images.map((src, imageIndex) => ({
      src,
      projectImages: project.images,
      title: project.title,
      projectTitle: project.title,
      tags: project.tags,
      description: project.description,
      imageIndex,
      year: project.year,
      spanClass: project.imageLayouts[imageIndex] || ""
    }))
  );
}

export function normalizeProjectImagePath(imagePath) {
  return String(imagePath).trim().replace(/^\.\.\//, "");
}

export function rankProjectsByRecency(projects) {
  return [...projects].sort((a, b) => {
    if (b.year !== a.year) {
      return b.year - a.year;
    }

    return a.originalIndex - b.originalIndex;
  });
}
