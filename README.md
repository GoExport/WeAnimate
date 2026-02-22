<div class="head" align="center">
  <h1>Wrapper offline</h1>
  <p><b>This project is not affiliated with or endorsed by GoAnimate Inc. or their product Vyond. Wrapper offline is a decentralized open source initiative developed exclusively for archival purposes. It operates on a non-profit basis and does not accept any form of donations</b></p>
  <br/>
</div>

Wrapper offline is a software designed to provide readily obtainable, irrevocable access to GoAnimate's retired assets in the modern era    
It achieves this by replicating the original API and asset servers entirely on the user's computer while providing a simplistic frontend to interact with them    
This project is important for archival purposes, as the ability to use the legacy GoAnimate editor and themes would be far trickier without it

### 🚀 Wrapper offline 2.1.4 (The ultimate bugfix)  
This version is a complete overhaul of the original 2.1.0 source code. Over 40+ critical bugs have been fixed, unnecessary dependencies removed, and the core packages swapped for maximum compatibility and portability
### 🛠️ Major architectural changes
- Sharp → FFmpeg migration: Replaced the binary-heavy Sharp with FFmpeg as that is a Wrapper offline dependency anyways. This enables 100% native Windows 7 support without needing VxKex or any kernel extensions
- Pure portability: Separated temp and userdata from %APPDATA%. All data now stays within the program’s resources folder, leaving ZERO footprint in your appdata folder
- Nodezip → AdmZip: Swapped the unreliable nodezip for AdmZip for stable ZIP compression and metadata handling
- Automated build process: Fully automated the build script that handles asset relocation, icon selection (ICO/PNG/ICNS) and multi-arch packaging in a single go
### 🐛 Critical bugfixes (The "fixed" list)
- The "No head" glitch with two female characters: Fixed the infamous Comedy world animation bug where the character's head would disappear or detach when selecting blow kiss, or make fun of animations
- Cache lock fixed: Fixed a bug where the scene would get stuck on "This character already has a voice" after creating a new scene
- Resource simplification: Eliminated the redundant `resources/resources` folder structure that bloated the original build
- Import fixes: Fully restored character and video import functionality by fixing broken path logic in the source code
- Microphone fix: Resolved issues with native microphone recording
- Ghost errors purged: Removed fake/misleading error messages that appeared during normal operation on the console
### 💻 Compatibility and performance
- Native x86 support: First-ever stable build for Windows x86 and Linux x86 architectures
- Flash 34 integration: Upgraded to Clean Flash 34.0.0.1118 (from 32.0.0.371) for better stability and performance
- Dependency purge: Removed heavy and unnecessary dev-tools like mocha, supertest, nodemon, and brotli to reduce package size and overhead
- FFprobe upgrade: Updated from 1.4.1 to 2.1.1 for better asset handling
### UI polish:
- Responsive settings panel with rounded corners, that look nice even on small screens
- Dark mode is now the default
- Removed the annoying flickering glitch of the sidebar
- Centered video titles, IDs, and dates
### 📝 User experience (UX)
- Better TTS: Enhanced error handling for text-to-speech; removed broken/non-functional voice engines
- Sentence casing: Replaced "Title Case" with the natural "Sentence case" across the UI and LVM
- Readable dates: New format: Day [st/nd/rd/th] of Month YYYY - HH:MM:SS
- Locked video player aspect ratio: Disabled window resizing for the player to prevent Flash distortion and maintain pixel-perfect rendering, as Flash is not a responsive technology
### 💡 Why choose the THIS version?
This version is built for longevity and stability. It runs on Windows 7 natively, consumes fewer resources, and fixes the most annoying bugs that occured in the previous Wrapper offline versions

### Downloads / Installation
To install Wrapper offline, you need to download it through the [releases page](https://github.com/GTAManRCRX/wrapper-offline-fixed/releases/)

### Updates and support
For support, the first thing you should do is to [read through the Wrapper offline wiki](https://github.com/wrapper-offline/wrapper-offline/wiki) as it most likely has what you want to know    
Alternatively if you can't find what you need, you can join the [Discord server](https://discord.gg/Kf7BzSw)
Joining the server is recommended, as there is a whole community that can help you out

### Building and testing
To run Wrapper offline with a development server, first run this command
```
npm install
```
Then create a build
```
npm run build
```
And now you can run the development server with
```
npm run dev
```
### Packaging
To build a full copy of Wrapper offline
```
npm run package
```

### License
Most of this project is free/libre software under the MIT license. You have the freedom to run, change, and share this as much as you want
FFmpeg is under the GNU GPLv2 license, which grants similar rights, but has some differences from MIT. Flash player (`resources/extensions`) and GoAnimate's original assets (`resources/static`) are proprietary and do not grant you these rights, but if they did, this project wouldn't need to exist

### Credits
| Contributor | Contribution |
| --------- | ------- |
| Benson | The original developer of Wrapper offline|
| DanielBitten | Upgraded TTS endpoints and voices |
| It'sJay | Saving every asset |
| Octanuary | The main developer. Rewriting the source code in Vue and TypeScript |
| VisualPlugin | The developer of GoAnimate wrapper |
| [Vyond](https://www.vyond.com) | The creators of GoAnimate |
| [Whispery](https://www.youtube.com/channel/UCVgwK9guSmcb3GkYLBzAbgA) | Fixing issues with Windows 11 and macOS |

[Whispery's Discord page](https://discord.com/users/1440498123997843607)

No members of the original GoAnimate wrapper team are officially working on Wrapper offline, even if they have contributed. Some members of the original team have asked to not be given credit, and they have been removed
