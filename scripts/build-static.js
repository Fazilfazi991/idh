const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
const files = ["index.html", "styles.css", "script.js"];
const directories = [
  "assets",
  "architecture_placeholders_webp",
  "services_section_images_webp",
  path.join("public", "videos", "optimized")
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}

for (const directory of directories) {
  fs.cpSync(path.join(root, directory), path.join(output, directory), {
    recursive: true
  });
}

console.log(`Static deployment built at ${output}`);
