const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const inputDir = path.join(root, "public", "videos", "raw");
const outputDir = path.join(root, "public", "videos", "optimized");
const supported = new Set([".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"]);
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
}

function runFfmpeg(args) {
  const result = spawnSync(ffmpeg, args, { stdio: "inherit" });
  if (result.error?.code === "ENOENT") {
    throw new Error("FFmpeg was not found. Install it and ensure `ffmpeg` is available on PATH.");
  }
  if (result.status !== 0) throw new Error(`FFmpeg exited with status ${result.status}.`);
}

fs.mkdirSync(inputDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

const inputs = fs.readdirSync(inputDir)
  .filter((name) => supported.has(path.extname(name).toLowerCase()))
  .map((name) => path.join(inputDir, name));

if (!inputs.length) {
  console.log(`No videos found in ${inputDir}`);
  process.exit(0);
}

for (const input of inputs) {
  const stem = path.parse(input).name;
  const mp4 = path.join(outputDir, `${stem}.mp4`);
  const webm = path.join(outputDir, `${stem}.webm`);
  const scale = "scale=w='min(1920,iw)':h='min(1080,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2";

  console.log(`\nOptimizing ${path.basename(input)} (${formatBytes(fs.statSync(input).size)})`);

  runFfmpeg([
    "-y", "-i", input, "-vf", scale,
    "-c:v", "libx264", "-preset", "slow", "-crf", "24",
    "-an", "-movflags", "+faststart", "-pix_fmt", "yuv420p", mp4
  ]);

  runFfmpeg([
    "-y", "-i", input, "-vf", scale,
    "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0",
    "-deadline", "good", "-cpu-used", "4", "-row-mt", "1",
    "-an", webm
  ]);

  console.log(`  MP4  ${formatBytes(fs.statSync(mp4).size)}  ${path.relative(root, mp4)}`);
  console.log(`  WebM ${formatBytes(fs.statSync(webm).size)}  ${path.relative(root, webm)}`);
}
