<div class="head" align="center">
  <h1>WeAnimate</h1>
  <p><b>This project is not affiliated with or endorsed by GoAnimate Inc. or their product Vyond. WeAnimate is a decentralized open source initiative developed exclusively for archival purposes. It operates on a non-profit basis and does not accept any form of donations</b></p>
  <br/>
</div>

## Downloading pre-built binaries

Every push and pull request triggers the [Build and Package](.github/workflows/build.yml) GitHub Actions workflow which compiles the app for Windows, macOS, and Linux.

To download a build:
1. Go to the [Actions tab](../../actions/workflows/build.yml) of this repository.
2. Click on any successful workflow run.
3. Scroll to the **Artifacts** section at the bottom of the run summary.
4. Download the ZIP for your platform:
   - `WeAnimate-windows-latest` — contains the Windows folder with `WeAnimate.exe`
   - `WeAnimate-macos-latest` — contains the macOS `.app` bundle
   - `WeAnimate-ubuntu-latest` — contains the Linux executable folder

## Building locally

```bash
# Install dependencies
npm install

# Build the renderer and Electron main process
npm run build

# Package for the current platform
npm run package
```

Platform-specific packaging scripts are also available:

```bash
npm run package:win    # Windows (.ico icon)
npm run package:mac    # macOS (.icns icon)
npm run package:linux  # Linux (.png icon)
```