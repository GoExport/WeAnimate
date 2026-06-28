import { app } from "electron";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";

function copyDirectoryRecursiveSync(sourceDir:string, destinationDir:string) {
	mkdirSync(destinationDir, { recursive: true });
	const entries = readdirSync(sourceDir);

	for (const entry of entries) {
		const sourcePath = join(sourceDir, entry);
		const destinationPath = join(destinationDir, entry);
		const stats = statSync(sourcePath);

		if (stats.isDirectory()) {
			copyDirectoryRecursiveSync(sourcePath, destinationPath);
		} else {
			copyFileSync(sourcePath, destinationPath);
		}
	}
}

class DirUtil {
	private static _instance:DirUtil;
	private writableRoot = app.getPath("userData");
	private appRoot = app.getAppPath();

	constructor() {
		this.seedBundledDefaults();

		const requiredPaths = [
			this.userData,
			this.asset,
			this.cache,
			this.log,
			this.saved,
			this.static,
		];
		for (const p of requiredPaths) {
			if (!existsSync(p)) {
				mkdirSync(p, { recursive: true });
			}
		}
	}

	private seedBundledDefaults() {
		const staticSource = join(this.appRoot, "static");
		if (!existsSync(this.static) && existsSync(staticSource)) {
			copyDirectoryRecursiveSync(staticSource, this.static);
		}

		const userDataSource = join(this.appRoot, "userdata");
		if (!existsSync(this.userData) && existsSync(userDataSource)) {
			copyDirectoryRecursiveSync(userDataSource, this.userData);
		}
	}

	static get instance() {
		if (!DirUtil._instance) {
			DirUtil._instance = new DirUtil();
		}
		return DirUtil._instance;
	}

	get userData() {
		return join(this.writableRoot, "userdata");
	}

	get static() {
		return join(this.writableRoot, "static");
	}

	get asset() {
		return join(this.userData, process.env.ASSET_FOLDER);
	}

	get cache() {
		return join(this.userData, process.env.CACHE_FOLDER);
	}

	get log() {
		return join(this.userData, process.env.LOG_FOLDER);
	}

	get saved() {
		return join(this.userData, process.env.SAVED_FOLDER);
	}

	get store() {
		return join(this.static, process.env.STORE_URL);
	}
}

export default DirUtil.instance;
