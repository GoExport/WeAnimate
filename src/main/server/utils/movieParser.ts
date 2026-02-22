import AssetModel, { Asset } from "../models/asset";
import type { Char } from "../models/char";
import CharModel from "../models/char";
import database from "../../storage/database";
import Directories from "../../storage/directories";
import fileUtil from "./fileUtil";
import fs from "fs";
import AdmZip from "adm-zip";
import path from "path";
import { Readable } from "stream";
import { XmlDocument } from "xmldoc";

const source = path.join(Directories.static, process.env.CLIENT_URL);
const store = path.join(Directories.static, process.env.STORE_URL);
const header = process.env.XML_HEADER;

function fontId2File(font:string) {
	switch (font) {
		case "Blambot Casual":
			return "FontFileCasual";
		case "BadaBoom BB":
			return "FontFileBoom";
		case "Entrails BB":
			return "FontFileEntrails";
		case "Tokyo Robot Intl BB":
			return "FontFileTokyo";
		case "Accidental Presidency":
			return "FontFileAccidental";
		case "Budmo Jiggler":
			return "FontFileBJiggler";
		case "Budmo Jigglish":
			return "FontFileBJigglish";
		case "Existence Light":
			return "FontFileExistence";
		case "HeartlandRegular":
			return "FontFileHeartland";
		case "Honey Script":
			return "FontFileHoney";
		case "I hate Comic Sans":
			return "FontFileIHate";
		case "loco tv":
			return "FontFileLocotv";
		case "Mail Ray Stuff":
			return "FontFileMailRay";
		case "Mia\'s Scribblings ~":
			return "FontFileMia";
		case "Coming Soon":
			return "FontFileCSoon";
		case "Lilita One":
			return "FontFileLOne";
		case "Telex Regular":
			return "FontFileTelex";
		case "":
		case null:
			return '';
		default:
			return `FontFile${font.replace(/\s/g, '')}`;
	}
}
function stream2Buffer(readStream:Readable): Promise<Buffer> {
	return new Promise((res, rej) => {
		let buffers = [];
		readStream.on("data", (c) => buffers.push(c));
		readStream.on("end", () => res(Buffer.concat(buffers)));
	});
}
export default {
	async pack(xmlBuffer:Buffer, thumbBuffer?:Buffer): Promise<Buffer> {
		if (xmlBuffer.length == 0) throw null;
		const zip = new AdmZip();
		const themes:Record<string, boolean> = { common: true };
		let ugc = `${header}<theme id="ugc" name="ugc">`;
		let changesMade = false;
		async function basicParse(file:string, type:string, subtype?:string) {
			const pieces = file.split(".");
			const themeId = pieces[0];
			const ext = pieces.pop();
			pieces[pieces.length - 1] += "." + ext;
			pieces.splice(1, 0, type);
			const filename = pieces.join(".");
			let buffer:Buffer;
			try {
				if (themeId == "ugc") {
					const id = pieces[2];
					buffer = AssetModel.load(id, true);

					const assetMeta = database.get("assets", id);
					if (!assetMeta) {
						throw new Error(`Asset #${id} is in the XML`);
					}
					ugc += AssetModel.meta2Xml(assetMeta.data);
					if (type == "prop" && subtype == "video") {
						pieces[2] = pieces[2].slice(0, -3) + "png";
						const filename = pieces.join(".")
						const buffer = AssetModel.load(pieces[2], true);
						fileUtil.addToZip(zip, filename, buffer);
					}
				} else {
					if (type == "prop" && pieces.indexOf("head") > -1) {
						pieces[1] = "char";
					}	
					const filepath = `${store}/${pieces.join("/")}`;
					buffer = fs.readFileSync(filepath);
				}
			} catch (e) {
				console.error(`WARNING: Asset failed to load`);
				return false;
			}
			fileUtil.addToZip(zip, filename, buffer);	
			themes[themeId] = true;
			return true;
		}
		const film = new XmlDocument(xmlBuffer.toString());
		for (const eI in film.children) {
			const elem = film.children[eI];
			switch (elem.name) {
				case "sound": {
					const file = elem.childNamed("sfile")?.val;
					if (!file) continue;
					const success = await basicParse(file, elem.name);
					if (!success) {
						film.children[eI].name = "ELEMENT";
						film.children[eI].attr = {};
						changesMade = true;
					}
					break;
				}
				case "scene": {
					for (const e2I in elem.children) {
						const elem2 = elem.children[e2I];
						let tag = elem2.name;
						if (tag == "effectAsset") tag = "effect";
						switch (tag) {
							case "durationSetting":
							case "trans":
								break;
							case "bg":
							case "effect":
							case "prop": {
								const file = elem2.childNamed("file")?.val;
								if (!file) continue;
								
								const success = await basicParse(file, tag, elem2.attr.subtype);
								if (!success) {
									elem.children[e2I].name = "ELEMENT";
									elem.children[e2I].attr = {};
									changesMade = true;
								}
								break;
							}
							case "char": {
								let file = elem2.childNamed("action")?.val;
								if (!file) continue;
								const pieces = file.split(".");
								const themeId = pieces[0];
								const ext = pieces.pop();
								pieces[pieces.length - 1] += "." + ext;
								pieces.splice(1, 0, elem2.name);
								if (themeId == "ugc") {
									pieces.splice(3, 1);
									const id = pieces[2];
									try {
										const charXml = CharModel.charXml(id);
										const filename = pieces.join(".");
										ugc += AssetModel.meta2Xml({
											id: id,
											type: "char",
											themeId: CharModel.getThemeId(charXml)
										} as Char);
										fileUtil.addToZip(zip, filename + ".xml", charXml);
									} catch (e) {
										elem.children[e2I].name = "ELEMENT";
										elem.children[e2I].attr = {};
										changesMade = true;
									}
								} else {
									const filepath = `${store}/${pieces.join("/")}`;
									const filename = pieces.join(".");
									try {
										fileUtil.addToZip(zip, filename, fs.readFileSync(filepath));
									} catch (e) {
										elem.children[e2I].name = "ELEMENT";
										elem.children[e2I].attr = {};
										changesMade = true;
									}
								}
								for (const e3I in elem2.children) {
									const elem3 = elem2.children[e3I];
									if (!elem3.children) continue;
									file = elem3.childNamed("file")?.val;
									if (!file) continue;
									const pieces2 = file.split(".");
									if (elem3.name != "head") {
										const success = await basicParse(file, "prop");
										if (!success) {
											elem2.children[e3I].name = "ELEMENT";
											elem2.children[e3I].attr = {};
											changesMade = true;
										}
									} else {
										if (pieces2[0] == "ugc") continue;
										pieces2.pop(), pieces2.splice(1, 0, "char");
										const filepath = `${store}/${pieces2.join("/")}.swf`;
										pieces2.splice(1, 1, "prop");
										const filename = `${pieces2.join(".")}.swf`;
										try {	
											fileUtil.addToZip(zip, filename, fs.readFileSync(filepath));
										} catch (e) {
											elem2.children[e3I].name = "ELEMENT";
											elem2.children[e3I].attr = {};
											changesMade = true;
										}
									}
									themes[pieces2[0]] = true;
								}
								themes[themeId] = true;
								break;
							}
							case 'bubbleAsset': {
								const bubble = elem2.childNamed("bubble");
								const text = bubble.childNamed("text");
								if (text.attr.font == "Arial") continue;
	
								const filename = `${fontId2File(text.attr.font)}.swf`;
								const filepath = `${source}/go/font/${filename}`;
								fileUtil.addToZip(zip, filename, fs.readFileSync(filepath));
								break;
							}
						}
					}
					break;
				}
			}
		}
		if (themes.family) {
			delete themes.family;
			themes.custom = true;
		}
		if (themes.cc2) {
			delete themes.cc2;
			themes.action = true;
		}
		const themeKs = Object.keys(themes);
		themeKs.forEach((themeId) => {
			if (themeId == "ugc") return;
			const xmlPath = `${store}/${themeId}/theme.xml`;
			const file = fs.readFileSync(xmlPath);
			fileUtil.addToZip(zip, `${themeId}.xml`, file);
		});
		fileUtil.addToZip(zip, "themelist.xml", Buffer.from(
			`${header}<themes>${themeKs.map((t) => `<theme>${t}</theme>`).join("")}</themes>`
		));
		fileUtil.addToZip(zip, "ugc.xml", Buffer.from(ugc + "</theme>"));
		if (thumbBuffer) {
			fileUtil.addToZip(zip, "thumbnail.png", thumbBuffer);
		}
		if (changesMade) {
			xmlBuffer = Buffer.from(film.toString());
		}
		fileUtil.addToZip(zip, "movie.xml", xmlBuffer);
		return zip.toBuffer();
	},
	async extractAudioTimes(xmlBuffer:Buffer) {
		const film = new XmlDocument(xmlBuffer.toString());
		let audios = [];
		for (const eI in film.children) {
			const elem = film.children[eI];
			if (elem.name !== "sound") continue;
			audios.push(elem);
		}
		return audios.map((v) => {
			const pieces = v.childNamed("sfile").val.split(".");
			const themeId = pieces[0];
			const ext = pieces.pop();
			pieces[pieces.length - 1] += "." + ext;
			pieces.splice(1, 0, "sound");
			let filepath;
			if (themeId == "ugc") {
				filepath = path.join(AssetModel.folder, pieces[pieces.length - 1]);
			} else {
				filepath = path.join(store, pieces.join("/"));
			}
			return {
				filepath: filepath,
				start: +v.childNamed("start").val,
				stop: +v.childNamed("stop").val,
				trimStart: +v.childNamed("trimStart")?.val || 0,
				trimEnd: +v.childNamed("trimEnd")?.val || 0,
				fadeIn: {
					duration: +v.childNamed("fadein").attr.duration,
					vol: +v.childNamed("fadein").attr.vol
				},
				fadeOut: {
					duration: +v.childNamed("fadeout").attr.duration,
					vol: +v.childNamed("fadeout").attr.vol
				}
			}
		});
	},
	async unpack(body: Buffer): Promise<[Buffer, Buffer]> {
		const zip = new AdmZip(body);
		const ugcBuffer = zip.readFile("ugc.xml");
		if (!ugcBuffer) throw new Error("ugc.xml not found");
		const ugc = new XmlDocument(ugcBuffer.toString());
		for (const eI in ugc.children) {
			const elem = ugc.children[eI];
			switch (elem.name) {
				case "background": {
					if (!AssetModel.exists(elem.attr.id)) {
						const buffer = zip.readFile(`ugc.bg.${elem.attr.id}`);
						if (buffer) {
							AssetModel.save(buffer, elem.attr.id, {
								type: "bg",
								subtype: "0",
								title: elem.attr.name,
								id: elem.attr.id
							});
						}
					}
					break;
				}
				case "prop": {
					if (!AssetModel.exists(elem.attr.id)) {
						const buffer = zip.readFile(`ugc.prop.${elem.attr.id}`);
						if (buffer) {
							if (elem.attr.subtype == "video") {
								AssetModel.save(buffer, elem.attr.id, {
									type: "prop",
									subtype: "video",
									title: elem.attr.name,
									width: +elem.attr.width,
									height: +elem.attr.height,
									id: elem.attr.id
								} as Asset);
								const thumbName = `ugc.prop.${elem.attr.id.slice(0, -4)}.png`;
								const buffer2 = zip.readFile(thumbName);
								if (buffer2) {
									fs.writeFileSync(path.join(
										AssetModel.folder,
										elem.attr.id.slice(0, -4) + ".png"
									), buffer2);
								}
							} else {
								AssetModel.save(buffer, elem.attr.id, {
									type: "prop",
									subtype: "0",
									title: elem.attr.name,
									ptype: elem.attr.wearable == "1" ? "wearable" :
										elem.attr.holdable == "1" ? "holdable" :
										"placeable",
									id: elem.attr.id
								});
							}
						}
					}
					break;
				}
				case "char": {
					if (!CharModel.exists(elem.attr.id)) {
						const buffer = zip.readFile(`ugc.char.${elem.attr.id}.xml`);
						if (buffer) {
							CharModel.save(buffer, {
								type: "char",
								subtype: "0",
								title: elem.attr.name,
								themeId: CharModel.getThemeId(buffer),
								id: elem.attr.id
							});
						}
					}
					break;
				}
				case "sound": {
					switch (elem.attr.subtype) {
						case "bgmusic":
						case "soundeffect":
						case "voiceover":
						case "tts":
							break;
						default: continue;
					}
					if (!AssetModel.exists(elem.attr.id)) {
						const buffer = zip.readFile(`ugc.${elem.name}.${elem.attr.id}`);
						if (buffer) {
							AssetModel.save(buffer, elem.attr.id, {
								duration: +elem.attr.duration,
								type: elem.name,
								subtype: elem.attr.subtype,
								title: elem.attr.name,
								id: elem.attr.id
							});
						}
					}
					break;
				}
			}
		}
		const movieXml = zip.readFile("movie.xml") || Buffer.alloc(0);
		const thumbnail = zip.readFile("thumbnail.png") || Buffer.alloc(0);

		return [movieXml, thumbnail];
	}
};
