const env = Object.assign(process.env, require("../../env.json"), require("../../config.json"));
import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from "electron";
import { createWriteStream } from "fs";
import { spawn } from "child_process";
import Directories from "./storage/directories";
import { join } from "path";
import { rmdirSync, existsSync, readFileSync } from "fs";
import settings from "./storage/settings";
import { startAll } from "./server/index";
import ExportService from "./server/services/ExportService";
import { writeFileSync } from "fs";
const customTempPath = join(__dirname, "temp");
app.setPath("userData", customTempPath);
(() => {
	try {
		const appName = app.getName(); 
		const defaultPath = join(app.getPath("appData"), appName);

		if (existsSync(defaultPath) && defaultPath !== customTempPath) {
			rmdirSync(defaultPath, { recursive: true });
			console.log(`\n${appName} default temp folder removed successfully`);
		}
	} catch (e: any) {
		console.log(`\n${appName} default temp folder could not be removed`)
	}
})();
const IS_DEV = app.commandLine.getSwitchValue("dev").length > 0;
startAll();
const PRELOAD_SOURCE = `const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("appWindow", {
	goHome: () => ipcRenderer.send("go-home"),
	openDiscord: () => ipcRenderer.send("open-discord"),
	openFAQ: () => ipcRenderer.send("open-faq"),
	openGitHub: () => ipcRenderer.send("open-github"),
	openDataFolder: () => ipcRenderer.send("open-data-folder"),
	confirmQuit: (message, subtext) => ipcRenderer.invoke("show-quit-dialog", message, subtext),
	showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
	exportMovie: (data) => ipcRenderer.invoke("export-movie", data),
});`;
const getPreloadPath = () => {
    const localPath = join(__dirname, "preload.js");
    if (existsSync(localPath)) return localPath;
    return join(__dirname, "preload.js");
};
const preloadPath = join(__dirname, "preload.js"); 
writeFileSync(preloadPath, PRELOAD_SOURCE, "utf8");
if (settings.saveLogFiles) {
	const filePath = join(Directories.log, new Date().valueOf() + ".txt");
	const writeStream = createWriteStream(filePath);
	console.log = console.error = console.warn = function (c) {
		writeStream.write(c + "\n");
		process.stdout.write(c + "\n");
	};
	process.on("exit", () => {
		console.log("Exiting");
		writeStream.close();
	});
}
let pluginName:string;
switch (process.platform) {
	case "win32": {
		pluginName = "extensions/pepflashplayer.dll";
		break;
	}
	case "darwin": {
		pluginName = "extensions/PepperFlashPlayer.plugin";
		break;
	}
	case "linux": {
		pluginName = "extensions/libpepflashplayer.so";
		app.commandLine.appendSwitch("no-sandbox");
		break;
	}
	default: {
		throw new Error("You are running WeAnimate on an unsupported platform");
	}
}
app.commandLine.appendSwitch("ppapi-flash-path", join(__dirname, pluginName));
app.commandLine.appendSwitch("ppapi-flash-version", "34.0.0.118");
app.commandLine.appendSwitch("disable-http-cache");
let mainWindow:BrowserWindow;
let root:string;
const createWindow = () => {
	let iconPath: string;
	if (process.platform === 'win32') {iconPath = join(__dirname, 'favicon.ico');} else if (process.platform === 'darwin') {iconPath = join(__dirname, 'favicon.icns');} else {iconPath = join(__dirname, 'favicon.png');}
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		title: "WeAnimate",
		autoHideMenuBar: true,
		show: false,
		icon: iconPath,
		webPreferences: {
			preload: getPreloadPath(),
			plugins: true,
			contextIsolation: true
		}
	});
    ipcMain.handle("show-quit-dialog", async (event, message, subtext) => {
    const displayMsg = message || "Are you sure you want to exit the LVM?";
    const displaySub = subtext || "Unsaved changes will be lost";
    let iconPath: string;
	if (process.platform === 'win32') {iconPath = join(__dirname, 'favicon.ico');} else if (process.platform === 'darwin') {iconPath = join(__dirname, 'favicon.icns');} else {iconPath = join(__dirname, 'favicon.png');}
    const innerIconPath = (process.platform === 'darwin' || process.platform === 'linux') ? join(__dirname, 'favicon.png') : join(__dirname, 'favicon.ico');
    let iconDataUrl = "";
    try {
        const iconBase64 = readFileSync(innerIconPath).toString('base64');
        const mimeType = innerIconPath.endsWith('.ico') ? 'image/x-icon' : 'image/png';
        iconDataUrl = `data:${mimeType};base64,${iconBase64}`;
    } catch (e) {
        console.log("Could not load icon, using fallback");
    }
    let confirmWin = new BrowserWindow({
        width: 500,
        height: 150,
        parent: mainWindow,
        modal: true,
        icon: iconPath,
        title: "WeAnimate",
        resizable: false,
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    let result = false;
    const handleResponse = (event, response) => {
        result = response;
        confirmWin.close();
    };
    ipcMain.once("confirm-response", handleResponse);
    setTimeout(() => {
        if (!confirmWin.isDestroyed()) {
            confirmWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
            confirmWin.show();
        }
    }, 150);
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { 
                    background: #222222; 
                    color: #e0e0e0; 
                    font-family: system-ui, sans-serif; 
                    margin: 0; 
                    padding: 25px; 
                    user-select: none; 
                    overflow: hidden; 
                }
                .top-section { 
                    display: flex; 
                    align-items: flex-start; 
                    margin-bottom: 25px; 
                }
                .logo { 
                    width: 50px; 
                    height: 50px; 
                    margin-right: 20px; 
                    flex-shrink: 0; 
                }
                .text-container {
					flex-grow: 1; 
					text-align: center;
					display: flex;
					flex-direction: column;
					justify-content: center;
				}
                p { 
                    margin: 0; 
                    font-size: 13.5px; 
                    line-height: 1.5; 
                }
                .button-group { 
                    display: flex; 
                    width: 100%; 
                    align-items: center; 
                }
                .spacer { 
                    flex-grow: 1; 
                }
                button { 
                    background: #222222; 
                    color: #ffffff; 
                    border: 1px solid #444444; 
                    padding: 7px 30px; 
                    cursor: pointer; 
                    border-radius: 10px; 
                    font-size: 12px; 
                    font-weight: bold; 
                    outline: none; 
                    transition: background 0.2s;
                }
                button:hover { 
                    background: #444; 
                }
            </style>
        </head>
        <body>
            <div class="top-section">
                <img src="${iconDataUrl}" class="logo">
                <div class="text-container">
					<p><b>${displayMsg}</b></p>
					<p style="opacity:0.6; font-size:12px;">${displaySub}</p>
				</div>
            </div>
            <div class="button-group">
                <button id="yes">Yes</button>
                <div class="spacer"></div> 
                <button id="no">No</button>
            </div>
            <script>
                const { ipcRenderer } = require('electron');
                const y = document.getElementById('yes');
                const n = document.getElementById('no');
                y.onclick = () => ipcRenderer.send('confirm-response', true);
                n.onclick = () => ipcRenderer.send('confirm-response', false);
            </script>
        </body>
        </html>
    `;
    confirmWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    return new Promise((resolve) => {
        confirmWin.on('closed', () => {
            ipcMain.removeListener("confirm-response", handleResponse);
            resolve(result);
        });
    });
});
	ipcMain.handle("show-save-dialog", async (event, options) => {
		return await dialog.showSaveDialog(mainWindow, options);
	});

	ipcMain.handle("export-movie", async (event, data) => {
		const nocturnePath = ExportService.getNocturnePath();
		const args = ExportService.getExportArgs(data);
		const logPath = join(Directories.log, `nocturne-${Date.now()}.log`);
		const logStream = createWriteStream(logPath, { flags: "a" });
		console.log("Nocturne log path:", logPath);

		console.log("Launching Nocturne with args:", args);
		logStream.write(`Nocturne path: ${nocturnePath}\n`);
		logStream.write(`Nocturne args: ${JSON.stringify(args)}\n`);
		
		const process_exec = spawn(nocturnePath, args, {
			stdio: ["ignore", "pipe", "pipe"],
			shell: false,
			windowsHide: false,
		});

		process_exec.stdout?.on("data", (chunk) => {
			logStream.write(`[stdout] ${chunk.toString()}`);
		});

		process_exec.stderr?.on("data", (chunk) => {
			logStream.write(`[stderr] ${chunk.toString()}`);
		});
		
		process_exec.on("error", (err) => {
			console.error("Failed to launch Nocturne:", err);
			logStream.write(`[error] ${err.message}\n`);
			logStream.end();
		});

		process_exec.on("exit", (code) => {
			console.log("Nocturne exited with code:", code);
			logStream.write(`[exit] code=${code ?? "null"}\n`);
			logStream.end();
		});

		return { success: true, logPath };
	});

	ipcMain.on("exit", () => process.exit(0));
	ipcMain.on("open-discord", openDiscord);
	ipcMain.on("open-faq", openFaq);
	ipcMain.on("open-github", openGitHub);
	ipcMain.on("open-data-folder", openDataFolder);
	ipcMain.on("go-home", () => {
    mainWindow.loadURL(root);
    });
	let host:string, port:string;
	if (IS_DEV) {
		host = app.commandLine.getSwitchValue("host");
		port = app.commandLine.getSwitchValue("port");
	} else {
		host = process.env.API_SERVER_HOST;
		port = process.env.API_SERVER_PORT;
	}
	root = `${host}:${port}`;
	mainWindow.loadURL(root);
	mainWindow.maximize();
    	mainWindow.show();
	mainWindow.on("closed", () => process.exit(0));
};
async function openDiscord() {
	await shell.openExternal("https://discord.gg/Kf7BzSw");
}
async function openFaq() {
	await shell.openExternal("https://github.com/weanimate/weanimate/wiki/FAQ");
}
async function openGitHub() {
	await shell.openExternal("https://github.com/GoExport/WeAnimate");
}
async function openDataFolder() {
	await shell.openPath(Directories.userData);
}
app.whenReady().then(() => {
	setTimeout(createWindow, 2000);

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
function setMenuBar(mainWindow:BrowserWindow) {
	mainWindow.setAutoHideMenuBar(settings.hideNavbar);
	Menu.setApplicationMenu(Menu.buildFromTemplate([
		{
			label: "Home",
			click: () => {
				mainWindow.loadURL(root);
			}
		},
		{
			label: "View",
			submenu: [
				{ type: "separator" },
				{ role: "zoomIn" },
				{ role: "zoomOut" },
				{ role: "resetZoom" },
				{ type: "separator" },
				{ role: "toggleDevTools" },
				{ role: "reload" },
				{ role: "forceReload" },
				{ type: "separator" },
				{ role: "minimize" },
				...(process.platform == "darwin" ? 
					[
						{ role: "front" },
						{ type: "separator" },
						{ role: "window" }
					] as ({ role: "front" } |
						{ type: "separator" } |
						{ role: "window" })[] : 
					[
						{ role: "close" } as { role: "close" }
					]),
			]
		},
		{
			role: "help",
			submenu: [
				{
					label: "Discord",
					click: openDiscord
				},
				{
					label: "FAQ",
					click: openFaq
				},
				{
					label: "GitHub",
					click: openGitHub
				}
			]
		}
	]));
}
