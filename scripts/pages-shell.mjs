import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "dist", "client");
const assets = readdirSync(join(root, "assets"));
const css = assets.find((name) => name.endsWith(".css"));
if (!css) throw new Error("No CSS asset in dist/client/assets");

let html = readFileSync(join(root, "_shell.html"), "utf8");
html = html.replace(/\/assets\/styles-[^"]+\.css/g, `/assets/${css}`);
writeFileSync(join(root, "index.html"), html);
writeFileSync(join(root, "404.html"), html);
writeFileSync(join(root, ".nojekyll"), "");
