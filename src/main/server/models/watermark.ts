import Database, { generateId } from "../../storage/database";
import Directories from "../../storage/directories";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

type S = fs.ReadStream | Readable;
export type Watermark = {
	id: string,
};

export default class WatermarkModel {
	static folder = Directories.asset;

	static list(): Watermark[] {
		const list = Database.select("watermarks");
		return list;
	}

	static load(id:string) {
		const filepath = path.join(this.folder, id);
		const exists = fs.existsSync(filepath);
		if (!exists) {
			throw new Error("404");
		}
		return fs.createReadStream(filepath);
	}

	static exists(id:string) {
		const filepath = path.join(this.folder, id);
		const exists = fs.existsSync(filepath);
		return exists;
	}

	static save(data:S, ext:string, id:string): Promise<string> {
		if (typeof id == "undefined") {
			id = `${generateId()}.${ext}`;
		}
		return new Promise((res, rej) => {
			const filepath = path.join(this.folder, id);
			const readStream = fs.createWriteStream(filepath);
			data.pipe(readStream);
			data.on("end", () => {
				readStream.close();
				if (!Database.get("watermarks", id)) {
					Database.insert("watermarks", {
						id
					});
				}
				res(id);
			});
			data.on("error", () => {
				rej();
			});
		});
	}

	static delete(id:string) {
		const filepath = path.join(this.folder, id);
		const exists = fs.existsSync(filepath);
		if (exists) {
			fs.unlinkSync(filepath);
		}
		Database.delete("watermarks", id);
	}	
};
