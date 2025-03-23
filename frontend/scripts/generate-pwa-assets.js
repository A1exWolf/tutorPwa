import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, "../public");
const SCREENSHOTS_DIR = path.resolve(PUBLIC_DIR, "screenshots");

// Ensure directories exist
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Generate a simple colored square icon
async function generateIcon(size, outputPath, color = "#4F46E5") {
  try {
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: color,
      },
    })
      .png()
      .toFile(outputPath);
    console.log(`Generated icon: ${outputPath}`);
  } catch (error) {
    console.error(`Error generating icon ${outputPath}:`, error);
  }
}

// Generate a simple screenshot
async function generateScreenshot(
  width,
  height,
  outputPath,
  color = "#FFFFFF"
) {
  try {
    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: color,
      },
    })
      .png()
      .toFile(outputPath);
    console.log(`Generated screenshot: ${outputPath}`);
  } catch (error) {
    console.error(`Error generating screenshot ${outputPath}:`, error);
  }
}

async function main() {
  // Generate icons
  const iconSizes = [192, 512];
  for (const size of iconSizes) {
    await generateIcon(
      size,
      path.resolve(PUBLIC_DIR, `pwa-${size}x${size}.png`)
    );
  }

  // Generate maskable icon (with a different color to distinguish it)
  await generateIcon(
    512,
    path.resolve(PUBLIC_DIR, "pwa-maskable-512x512.png"),
    "#3730A3"
  );

  // Generate screenshots for different form factors

  // Desktop wide form factor (16:9 aspect ratio)
  // For wide form factor, we'll use 16:9 ratio for all screenshots
  await generateScreenshot(
    1920,
    1080,
    path.resolve(SCREENSHOTS_DIR, "desktop-wide.png")
  );

  await generateScreenshot(
    1280,
    720, // Changed from 800 to 720 to maintain 16:9 aspect ratio
    path.resolve(SCREENSHOTS_DIR, "desktop.png")
  );

  // Mobile narrow form factor (9:19.5 aspect ratio - iPhone 12)
  // For narrow form factor, we'll use 9:19.5 ratio for all screenshots
  await generateScreenshot(
    390,
    844,
    path.resolve(SCREENSHOTS_DIR, "mobile.png")
  );

  // iPad - adjusted to match mobile aspect ratio
  await generateScreenshot(
    390, // Using same width as mobile
    844, // Using same height as mobile
    path.resolve(SCREENSHOTS_DIR, "tablet.png")
  );
}

main().catch(console.error);
