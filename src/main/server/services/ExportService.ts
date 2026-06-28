import { join } from "path";
import { existsSync } from "fs";
import Directories from "../../storage/directories";

export default class ExportService {
	static getNocturnePath(): string {
		const resourcesPath = process.resourcesPath || "";
		const paths = [
			join(__dirname, "bin", "GoExport-Nocturne", "nocturne.exe"),
			join(__dirname, "bin", "nocturne.exe"),
			join(resourcesPath, "app", "bin", "GoExport-Nocturne", "nocturne.exe"),
			join(resourcesPath, "app", "bin", "nocturne.exe"),
			join(process.cwd(), "bin", "GoExport-Nocturne", "nocturne.exe"),
			join(process.cwd(), "bin", "nocturne.exe"),
		];

		for (const p of paths) {
			if (existsSync(p)) {
				return p;
			}
		}

		return paths[0];
	}

	static getExportArgs(data: {
		movieId: string,
		resolution: string,
		format: string,
		isWidescreen: boolean,
		outputPath: string
	}): string[] {
		const { movieId, resolution, format, isWidescreen, outputPath } = data;
		
		const apiPort = process.env.API_SERVER_PORT || "";
		const staticPort = process.env.STATIC_SERVER_PORT || "";
		const swfBase = process.env.SWF_URL || "";
		const storeBase = process.env.STORE_URL || "";
		const clientThemeBase = process.env.CLIENT_URL || "";
		const apiBaseUrl = `http://localhost:${apiPort}/`;
		const playerUrl = `http://localhost:${apiPort}/`;
		const storeUrl = `http://localhost:${staticPort}${storeBase}/%3Cstore%3E`;
		const clientThemeUrl = `http://localhost:${staticPort}${clientThemeBase}/%3Cclient_theme%3E`;
		
		const args = [
			"export",
			"-r", resolution,
			"-u", playerUrl,
			"-api", apiBaseUrl,
			"-swf", `http://localhost:${staticPort}${swfBase}/player.swf`,
			"-store", storeUrl,
			"-theme", clientThemeUrl,
			"-id", movieId,
			"-xml", join(Directories.saved, `${movieId}.xml`),
			"-ugc", join(Directories.static, "store", "3a981f5cb2739137"),
			"-as", Directories.asset,
			"-f", format,
			"-out", outputPath
		];

		if (!isWidescreen) {
			args.push("--no-wide");
		}

		return args;
	}
}
