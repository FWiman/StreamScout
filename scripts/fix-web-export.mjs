// Runs after `expo export --platform web`, before uploading to Cloudflare Pages.
//
// Expo puts assets that come from packages under dist/assets/node_modules/… – e.g. the
// Ionicons font from @expo/vector-icons. Wrangler never uploads folders named
// node_modules, so on Cloudflare those files are missing and the icons break.
// We rename the folder to dist/assets/vendor and update the paths in the built files.
import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const FROM = join(DIST, "assets", "node_modules");
const TO = join(DIST, "assets", "vendor");

if (!existsSync(FROM)) {
  console.log("fix-web-export: no dist/assets/node_modules – nothing to do.");
  process.exit(0);
}

renameSync(FROM, TO);

const TEXT_FILES = /\.(js|mjs|css|html|json|map)$/;
let changed = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (TEXT_FILES.test(name)) {
      const text = readFileSync(path, "utf8");
      const updated = text.replaceAll("assets/node_modules/", "assets/vendor/");
      if (updated !== text) {
        writeFileSync(path, updated);
        changed++;
      }
    }
  }
}

walk(DIST);
console.log(`fix-web-export: moved package assets to dist/assets/vendor and updated ${changed} file(s).`);
