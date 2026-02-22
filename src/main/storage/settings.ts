import DirUtil from "./directories";
import fs from "fs";
import { join } from "path";

class Settings {
	private path = join(DirUtil.saved, "settings.json");
	private json = {
		TRUNCATED_THEMELIST: false,
		SHOW_WAVEFORMS: true,
		IS_WIDE: "1",
		SAVE_LOG_FILES: false,
		HIDE_NAVBAR: true,
		DEFAULT_WATERMARK: "none",
	};
	private static _instance:Settings;
	constructor() {
		const defaultVals = this.json;
		if (!fs.existsSync(this.path)) {
			console.error("Settings doesn't exist! Creating...");
			this.save(defaultVals);

			try {
				this.refresh();
			} catch (e) {
				throw new Error("Something is very wrong. You may be in a read-only system or admin folder");
			}
		}
		this.refresh();
		if (Object.keys(this.json).length !== Object.keys(defaultVals).length) {
			for (let key in this.json) {
				if (defaultVals[key] != null) {
					defaultVals[key] = this.json[key];
				}
			}
			this.save(defaultVals);
		}
	}
	static get instance() {
		if (!Settings._instance) {
			Settings._instance = new Settings();
		}
		return Settings._instance;
	}
	private refresh() {
		const data = fs.readFileSync(this.path);
		this.json = JSON.parse(data.toString());
	}
	private save(newData:typeof Settings.prototype.json) {
		try {
			fs.writeFileSync(this.path, JSON.stringify(newData, null, "\t"));
		} catch (err) {
			console.error("Error saving DB:", err);
		}
	}
	getAllSettings() {
		return {
			truncatedThemeList: this.truncatedThemeList,
			showWaveforms: this.showWaveforms,
			isWide: this.isWide,
			saveLogFiles: this.saveLogFiles,
			hideNavbar: this.hideNavbar,
			defaultWatermark: this.defaultWatermark
		};
	}
	get truncatedThemeList() {
		return this.json["TRUNCATED_THEMELIST"];
	}
	set truncatedThemeList(newValue:boolean) {
		this.json["TRUNCATED_THEMELIST"] = newValue;
		this.save(this.json);
	}
	get showWaveforms() {
		return this.json["SHOW_WAVEFORMS"];
	}
	set showWaveforms(newValue:boolean) {
		this.json["SHOW_WAVEFORMS"] = newValue;
		this.save(this.json);
	}
	get isWide() {
		return this.json["IS_WIDE"] == "1";
	}
	set isWide(newValue:boolean) {
		const whythefuckdididothis_sob = newValue == true ? "1" : "0";
		this.json["IS_WIDE"] = whythefuckdididothis_sob;
		this.save(this.json);
	}
	get saveLogFiles() {
		return this.json["SAVE_LOG_FILES"];
	}
	set saveLogFiles(newValue:boolean) {
		this.json["SAVE_LOG_FILES"] = newValue;
		this.save(this.json);
	}
	get hideNavbar() {
		return this.json["HIDE_NAVBAR"];
	}
	set hideNavbar(newValue:boolean) {
		this.json["HIDE_NAVBAR"] = newValue;
		this.save(this.json);
	}
	get defaultWatermark() {
		return this.json["DEFAULT_WATERMARK"];
	}
	set defaultWatermark(newValue) {
		this.json["DEFAULT_WATERMARK"] = newValue;
		this.save(this.json);
	}
}
export default Settings.instance;
