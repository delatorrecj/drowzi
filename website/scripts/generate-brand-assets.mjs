import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const publicDir = resolve(root, "public");
const iconSvg = await readFile(resolve(publicDir, "drowzi-icon.svg"));
const mascot = await readFile(resolve(root, "..", "apps", "mobile", "assets", "images", "mascot", "mascot-excited.png"));
const iconSource = iconSvg.toString();
const iconInner = iconSource
  .slice(iconSource.indexOf(">") + 1, iconSource.lastIndexOf("</svg>"))
  .replace("<title>Drowzi alarm icon</title>", "");

const iconCanvas = await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#1A1209" },
})
  .composite([{ input: await sharp(mascot).resize(450, 450, { fit: "contain" }).png().toBuffer(), top: 31, left: 31 }])
  .png()
  .toBuffer();
const faviconPng = await sharp(iconCanvas).resize(64, 64).png().toBuffer();
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);
icoHeader.writeUInt8(64, 6);
icoHeader.writeUInt8(64, 7);
icoHeader.writeUInt16LE(1, 10);
icoHeader.writeUInt16LE(32, 12);
icoHeader.writeUInt32LE(faviconPng.length, 14);
icoHeader.writeUInt32LE(22, 18);

await Promise.all([
  sharp(iconCanvas).resize(192, 192).png().toFile(resolve(publicDir, "icon-192.png")),
  sharp(iconCanvas).resize(512, 512).png().toFile(resolve(publicDir, "icon-512.png")),
  sharp(iconCanvas).resize(180, 180).png().toFile(resolve(publicDir, "apple-touch-icon.png")),
  writeFile(resolve(root, "app", "favicon.ico"), Buffer.concat([icoHeader, faviconPng])),
]);

const socialCard = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#1A1209"/>
  <circle cx="970" cy="315" r="340" fill="#F4C430" opacity=".12"/>
  <circle cx="970" cy="315" r="270" fill="#F4C430" opacity=".16"/>
  <text x="88" y="132" fill="#F4C430" font-family="Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="6">DROWZI</text>
  <text x="88" y="248" fill="#F5E6C8" font-family="Arial, sans-serif" font-size="76" font-weight="800">Your alarm</text>
  <text x="88" y="338" fill="#F5E6C8" font-family="Arial, sans-serif" font-size="76" font-weight="800">won't stop.</text>
  <text x="88" y="438" fill="#F4C430" font-family="Arial, sans-serif" font-size="76" font-weight="800">Until you do.</text>
  <text x="90" y="520" fill="#9A7A50" font-family="Arial, sans-serif" font-size="26">The habit-gated alarm app</text>
</svg>`;

await sharp(Buffer.from(socialCard))
  .composite([{ input: await sharp(mascot).resize(500, 500, { fit: "contain" }).png().toBuffer(), top: 68, left: 680 }])
  .png()
  .toFile(resolve(publicDir, "og-image.png"));
