import type { Asset } from "../../main/server/models/asset";
import crypto from "crypto";
import Directories from "./directories.ts";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { Movie } from "../../main/server/models/movie";
import type { Watermark } from "../../main/server/models/watermark";

export type Folder = {
	id: string,
	title: string,
	color: string,
	parent_id: string,
};
type DatabaseJson = {
	version: string,
	assets: Asset[],
	movies: Movie[],
	movie_folders: Folder[],
	watermarks: Watermark[],
};
type ArrayKey<T> = {
	[K in keyof T]: T[K] extends any[] ? K : never
}[keyof T];
export type DBJsonArrayKey = ArrayKey<DatabaseJson>;
type DBJsonArrayProp<K extends DBJsonArrayKey> = DatabaseJson[K][number];
export class Database {
	private path = join(Directories.saved, "database.json");
	private json:DatabaseJson = {
		version: process.env.WRAPPER_VER,
		assets: [],
		movies: [],
		movie_folders: [],
		watermarks: [],
	};
	private static _instance:Database;
	constructor() {
		if (!existsSync(this.path)) {
			console.warn("Database doesn't exist! Creating...");
			this.save(this.json);

			try {
				this.refresh();
			} catch (e) {
				console.error("Something is wrong. You may be in a read-only system/admin folder");
				process.exit(1);
			}
		}
		this.refresh();
		if (!this.json.version) {
			this.json.version = "2.0.0";
		}
		if (this.json.version == "2.0.0") {
			const oldVer = this.json.version;
			this.json.version = "2.1.0";
			this.json.movie_folders = [];
			const watermarks = this.select("assets", {
				type: "watermark"
			});
			this.json.watermarks = watermarks.map(w => ({
				id: w.id
			}));
			this.save(this.json);
			console.log(`Database upgraded from ${oldVer} to v2.1.1`);
		}
	}
	static get instance() {
		if (!Database._instance) {
			Database._instance = new Database();
		}
		return Database._instance;
	}
	private refresh() {
		const data = readFileSync(this.path);
		this.json = JSON.parse(data.toString());
	}
	private save(newData:DatabaseJson) {
		try {
			writeFileSync(this.path, JSON.stringify(newData, null, "\t"));
		} catch (err) {
			console.error("Error saving DB:", err);
		}
	}
	delete(from:DBJsonArrayKey, id:string) {
		const object = this.get(from, id);
		if (object == false) {
			return false;
		}
		const index = object.index;
		this.json[from].splice(index, 1);
		this.save(this.json);
		return true;
	}
	get<K extends DBJsonArrayKey>(from:K, id:string): {
		data: DBJsonArrayProp<K>,
		index: number
	} | false {
		this.refresh();
		const category = this.json[from];
		let index:number;
		const object = category.find((i, ind) => {
			if (i.id == id) {
				index = ind;
				return true;
			}
		});
		if (!object) {
			return false;
		}
		return {
			data: object,
			index: index
		}
	}
	insert<K extends DBJsonArrayKey>(into:K, data:DBJsonArrayProp<K>) {
		this.refresh();
		this.json[into].unshift(data as Folder & Asset & Movie & Watermark);
		this.save(this.json);
	}
	select<K extends DBJsonArrayKey>(
		from:K,
		where?:Record<string, string | string[]>
	):DBJsonArrayProp<K>[] {
		this.refresh();
		const category = (this.json[from] || []) as Record<string, unknown>[];
		const filtered = (category || []).filter((val: Record<string, unknown>) => {
			for (const [key, value] of Object.entries(where || {})) {
				if (typeof value == "object") {
					if (!value.includes((val[key] || "").toString())) {
						return false;
					}
				} else if (val[key] && val[key] != value) {
					return false;
				}
			}
			return true;
		});
		return filtered;
	}
	update<K extends DBJsonArrayKey>(from:K, id:string, data:Partial<DBJsonArrayProp<K>>): boolean {
		const object = this.get(from, id);
		if (object == false) {
			return false;
		}
		const index = object.index;
		Object.assign(this.json[from][index], data);
		this.save(this.json);
		return true;
	}
};
export function generateId() {
	return crypto.randomBytes(4).toString("hex");
}

export default Database.instance;
