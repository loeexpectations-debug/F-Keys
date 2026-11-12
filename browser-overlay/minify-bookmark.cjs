// The extension keeps its desktop stylesheet. Only the bookmark needs to fit
// in Android's single-line URL editor. Both distributions use the same key handlers.
const fs = require("node:fs");
const path = require("node:path");
const { minify } = require("terser");

async function main() {
  const overlay = fs.readFileSync(path.join(__dirname, "extension/overlay.js"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "mobile-toolbar.css"), "utf8")
    .replace(/\s+/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").replace(/;}/g, "}").trim();
  const sheet = /sheet\.replaceSync\(`[^\x60]*`\);/;
  if (!sheet.test(overlay)) throw Error("Cannot locate the toolbar stylesheet");
  const mobile = overlay.replace(sheet, () => "sheet.replaceSync(" + JSON.stringify(css) + ");");
  const { code } = await minify(mobile, {
    compress: { passes: 3 },
    mangle: true,
    format: { quote_style: 1, ascii_only: true }
  });
  process.stdout.write(code);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
