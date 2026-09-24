import { readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 1. Discover all version directories (v1, v2, ... vN) sorted highest first
const versionFolders = readdirSync(__dirname, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^v\d+$/.test(entry.name))
    .map(entry => ({ name: entry.name, n: Number(entry.name.slice(1)) }))
    .sort((a, b) => b.n - a.n);

const latestVersion = versionFolders[0]?.name || "v6";

let company;
let masters;
let vouchers;

const versionIndexPath = resolve(__dirname, latestVersion, "index.js");

if (existsSync(versionIndexPath)) {
    const versionModule = await import(pathToFileURL(versionIndexPath).href);
    company = versionModule.company ?? versionModule.default;
    masters = versionModule.masters;
    vouchers = versionModule.vouchers;
} else {
    const mainUrl = pathToFileURL(resolve(__dirname, latestVersion, "main.js")).href;
    const mastersUrl = pathToFileURL(resolve(__dirname, latestVersion, "masters", "index.js")).href;
    const vouchersUrl = pathToFileURL(resolve(__dirname, latestVersion, "vouchers", "index.js")).href;

    const [mainModule, mastersModule, vouchersModule] = await Promise.all([
        import(mainUrl),
        import(mastersUrl),
        import(vouchersUrl)
    ]);

    company = mainModule.company ?? mainModule.default;
    masters = mastersModule;
    vouchers = vouchersModule;
}

export { company, masters, vouchers, latestVersion as version };
export default company;