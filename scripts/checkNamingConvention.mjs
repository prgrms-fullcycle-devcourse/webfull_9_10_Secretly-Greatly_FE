import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_DIRECTORY = fileURLToPath(new URL("../src", import.meta.url));
const CAMEL_CASE_PATTERN = /^[a-z][a-zA-Z0-9]*$/;
const ALLOWED_SUFFIXES = new Set(["module", "spec", "stories", "test", "handler"]);
const NEXT_FILE_NAMES = new Set([
  "default.tsx",
  "error.tsx",
  "favicon.ico",
  "global-error.tsx",
  "layout.tsx",
  "loading.tsx",
  "manifest.ts",
  "not-found.tsx",
  "opengraph-image.tsx",
  "page.tsx",
  "robots.ts",
  "route.ts",
  "sitemap.ts",
  "template.tsx",
  "twitter-image.tsx",
]);
const NEXT_DIRECTORY_PATTERN = /^(\(.+\)|\[.+\]|@.+)$/;

const violations = [];

function addViolation(path, expected) {
  violations.push(`${relative(SOURCE_DIRECTORY, path)}: ${expected}`);
}

function checkDirectoryName(name, path) {
  if (!CAMEL_CASE_PATTERN.test(name) && !NEXT_DIRECTORY_PATTERN.test(name)) {
    addViolation(path, "folder names must use camelCase");
  }
}

function checkFileName(name, path) {
  if (NEXT_FILE_NAMES.has(name)) {
    return;
  }

  const segments = name.split(".");
  const stem = segments.shift();
  const suffixes = segments.slice(0, -1);

  if (!CAMEL_CASE_PATTERN.test(stem)) {
    addViolation(path, "file names must use camelCase");
    return;
  }

  for (const suffix of suffixes) {
    if (!ALLOWED_SUFFIXES.has(suffix)) {
      addViolation(path, `unsupported file suffix "${suffix}"`);
    }
  }
}

async function checkDirectory(directory) {
  if (directory.includes(join("shared", "api", "generated"))) {
    return;
  }
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      checkDirectoryName(entry.name, path);
      await checkDirectory(path);
      continue;
    }

    if (entry.isFile()) {
      checkFileName(entry.name, path);
    }
  }
}

await checkDirectory(SOURCE_DIRECTORY);

if (violations.length > 0) {
  console.error("Naming convention violations:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exitCode = 1;
}
