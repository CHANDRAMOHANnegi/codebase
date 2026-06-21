import { readFile } from "node:fs/promises";

const requiredFiles = [
  "manifest.json",
  "popup/popup.html",
  "popup/popup.css",
  "popup/popup.js",
  "content/content.js"
];

for (const file of requiredFiles) {
  await readFile(new URL(`../${file}`, import.meta.url), "utf8");
}

const manifest = JSON.parse(
  await readFile(new URL("../manifest.json", import.meta.url), "utf8")
);

if (manifest.manifest_version !== 3) {
  throw new Error("Chrome extension must use Manifest V3.");
}

console.log("Profile Fill Assistant extension files are valid.");
