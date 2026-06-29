const fs = require("fs");
const path = require("path");
const { downloadArtifact } = require("@electron/get");
const extract = require("extract-zip");

const electronRoot = path.join(__dirname, "..", "node_modules", "electron");
const electronPkgPath = path.join(electronRoot, "package.json");

if (!fs.existsSync(electronPkgPath)) {
  process.exit(0);
}

const electronPkg = require(electronPkgPath);
const version = electronPkg.version;
const platform = process.env.npm_config_platform || process.platform;
const arch = process.env.npm_config_arch || process.arch;
const platformPath = getPlatformPath(platform);

const distDir = process.env.ELECTRON_OVERRIDE_DIST_PATH || path.join(electronRoot, "dist");
const pathTxtPath = path.join(electronRoot, "path.txt");
const versionFilePath = path.join(distDir, "version");
const binaryPath = path.join(distDir, platformPath);

main().catch((err) => {
  console.error("Failed to ensure Electron install:");
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});

async function main() {
  if (isElectronInstalled()) {
    return;
  }

  console.log("Electron install is incomplete; repairing download/extraction...");

  const zipPath = await downloadArtifact({
    version,
    artifactName: "electron",
    force: process.env.force_no_cache === "true",
    cacheRoot: process.env.electron_config_cache,
    platform,
    arch
  });

  // Ensure we start from a clean extraction target to avoid mixed/partial states.
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  await extract(zipPath, { dir: distDir });

  if (!fs.existsSync(versionFilePath)) {
    throw new Error(`Electron archive extracted but ${versionFilePath} is missing`);
  }

  const extractedVersion = fs.readFileSync(versionFilePath, "utf-8").trim().replace(/^v/, "");
  if (extractedVersion !== version) {
    throw new Error(`Electron version mismatch after extract: expected ${version}, got ${extractedVersion}`);
  }

  if (!fs.existsSync(binaryPath)) {
    throw new Error(`Electron binary is missing after extract: ${binaryPath}`);
  }

  fs.writeFileSync(pathTxtPath, platformPath, "utf-8");
  console.log("Electron install repair completed successfully.");
}

function isElectronInstalled() {
  try {
    const installedVersion = fs.readFileSync(versionFilePath, "utf-8").trim().replace(/^v/, "");
    const installedPath = fs.readFileSync(pathTxtPath, "utf-8").trim();
    return installedVersion === version && installedPath === platformPath && fs.existsSync(binaryPath);
  } catch {
    return false;
  }
}

function getPlatformPath(targetPlatform) {
  switch (targetPlatform) {
    case "mas":
    case "darwin":
      return "Electron.app/Contents/MacOS/Electron";
    case "freebsd":
    case "openbsd":
    case "linux":
      return "electron";
    case "win32":
      return "electron.exe";
    default:
      throw new Error(`Electron builds are not available on platform: ${targetPlatform}`);
  }
}
