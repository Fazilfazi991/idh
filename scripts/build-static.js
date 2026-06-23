const fs = require("fs");
const path = require("path");
require("./generate-pages");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
const files = [
  "index.html",
  "about.html",
  "services.html",
  "projects.html",
  "process.html",
  "insights.html",
  "careers.html",
  "contact.html",
  "privacy-policy.html",
  "styles.css",
  "script.js",
  path.join("public", "IDH-studio-overview.pdf")
];
const directories = [
  "assets",
  "data",
  "architecture_placeholders_webp",
  "services_section_images_webp",
  path.join("public", "videos", "optimized")
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of files) {
  const target = path.join(output, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, file), target);
}

for (const directory of directories) {
  fs.cpSync(path.join(root, directory), path.join(output, directory), {
    recursive: true
  });
}

console.log(`Static deployment built at ${output}`);
