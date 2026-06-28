import { join } from "path";
import Directories from "../../storage/directories";

export default class ExportService {
	static getNocturnePath(): string {
		// Try both potential paths
		const paths = [
			join(__dirname, "..", "bin", "GoExport-Nocturne", "nocturne.exe"),
			join(__dirname, "..", "bin", "nocturne.exe")
		];
		// In a real app we'd verify existence, but for now we follow the pattern
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
		
		const apiPort = process.env.API_SERVER_PORT;
		const staticPort = process.env.STATIC_SERVER_PORT;
		
		const args = [
			"export",
			"-r", resolution,
			"-u", `http://localhost:${apiPort}/movies/play/${movieId}`,
			"-api", `http://localhost:${apiPort}`,
			"-swf", `http://localhost:${staticPort}${process.env.SWF_URL}/player.swf`,
			"-store", Directories.store,
			"-theme", join(Directories.static, process.env.CLIENT_URL),
			"-id", movieId,
			"-xml", join(Directories.saved, `${movieId}.xml`),
			"-ugc", join(Directories.static, "animation"),
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
