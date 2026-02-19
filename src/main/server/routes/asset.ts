import type { Asset } from "../models/asset";
import AssetModel from "../models/asset";
import { extensions, FileExtension, fromFile, mimeTypes } from "file-type";
import Directories from "../../storage/directories";
import Ffmpeg, { FfprobeData, ffprobe } from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";
import fileTypes from "../data/allowed_file_types.json";
import fileUtil from "../utils/fileUtil";
import fs from "fs";
import httpz from "@octanuary/httpz";
import MovieModel, { Starter } from "../models/movie";
import path from "path";
import { promisify } from "util";
import Jimp from "jimp";
import { randomBytes } from "crypto";
import { Readable } from "stream";

const asyncFfprobe = promisify(ffprobe); 
const getAssetPath = (ext: string) => path.join(Directories.asset, `${randomBytes(16).toString("hex")}.${ext}`);

Ffmpeg.setFfmpegPath(ffmpegPath);
Ffmpeg.setFfprobePath(ffprobePath);
const group = new httpz.Group();

group.route("POST", "/api_v2/asset/delete/", (req, res) => {
	const id = req.body.data.id || req.body.data.starter_id;
	if (typeof id == "undefined") {
		return res.status(400).json({ status:"error" });
	}
	try {
		const asset = AssetModel.getInfo(id) as Asset | Starter;
		if (asset.type == "movie") {
			MovieModel.delete(id);
		} else {
			AssetModel.delete(id);
		}
		res.json({ status:"ok" });
	} catch (e) {
		if (e == "404") {
			return res.status(404).json({ status:"error" });
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({ status:"error" });
	}
});
group.route("GET", "/api/asset/list", (req, res) => {
	const filter = {
		type: ["bg", "prop", "sound"] as any as Asset["type"]
	};
	const list = AssetModel.list(filter, false) || [];
	res.json(list);
});
group.route("POST", "/api_v2/assets/imported", (req, res) => {
	if (!req.body.data.type) {
		return res.status(400).json({msg:"Expected data.type on request body."});
	}
	if (req.body.data.type == "prop") {
		req.body.data.subtype ||= "0";
	}

	const filters:Partial<Asset> = {
		type: req.body.data.type
	};
	if (req.body.data.subtype) filters.subtype = req.body.data.subtype;

	res.json({
		status: "ok",
		data: {
			xml: AssetModel.list(filters, true)
		}
	});
});
group.route("POST", "/goapi/getUserAssetsXml/", (req, res) => {
	if (req.body.type !== "char") {
		res.status(307).setHeader("Location", "/api_v2/assets/imported")
		return res.end();
	} else if (!req.body.themeId) {
		return res.status(400).end("1<error><code>malformed</code><message/></error>");
	}
	let themeId:string;
	switch (req.body.themeId) {
		case "custom":
			themeId = "family";
			break;
		case "action":
		case "animal":
		case "space":
		case "vietnam":
			themeId = "cc2";
			break;
		default:
			themeId = req.body.themeId;
	}
	const filters:Partial<Asset> = {
		themeId,
		type: "char"
	};
	if (req.body.assetId && req.body.assetId !== "null") filters.id = req.body.assetId;

	res.setHeader("Content-Type", "application/xml");
	res.end(AssetModel.list(filters, true));
});
group.route("*", /^\/(assets|goapi\/getAsset)\/([\S]*)$/, (req, res, next) => {
	let id = req.method === "GET" ? req.matches[2] : req.body.assetId;
	if (!id) return res.status(400).end();
	try {
		const ext = path.extname(id).toLowerCase();
		const mimeTypes = {
			".png": "image/png",
			".jpg": "image/jpeg",
			".swf": "application/x-shockwave-flash",
			".mp3": "audio/mpeg"
		};
		const mime = mimeTypes[ext] || "application/octet-stream";
		res.writeHead(200, {
			"Content-Type": mime,
			"X-Content-Type-Options": "nosniff",
			"Cache-Control": "no-cache"
		});
		const readStream = AssetModel.load(id, false);
		readStream.pipe(res);
	} catch (e) {
		if (!res.writableEnded) res.status(404).end();
	}
});
group.route("POST", "/api_v2/asset/get", (req, res) => {
	const id = req.body.data?.id ?? req.body.data?.starter_id;
	if (!id) {
		return res.status(404).json({status:"error"});
	}
	try {
		const info = AssetModel.getInfo(id);
		const extraInfo = {
			share: {type:"none"},
			published: ""
		}
		res.json({
			status: "ok",
			data: Object.assign(info, extraInfo),
		});
	} catch (e) {
		if (e == "404") {
			return res.status(404).json({status:"error"});
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({status:"error"});
	}
});
group.route("POST", "/goapi/getAssetTags", (_, r) => r.json([]));
group.route("POST", "/goapi/getLatestAssetId", (_, r) => r.end(0));
group.route("POST", "/api_v2/asset/update/", (req, res) => {
	const id = req.body.data?.id ?? req.body.data?.starter_id ?? null;
	const title = req.body.data?.title ?? null;
	const tags = req.body.data?.tags ?? null;
	if (!id || title === null) {
		return res.status(400).json({status:"error"});
	}
	const update:Partial<Asset> = {
		title: title
	};
	if (tags) {
		update.tags = tags;
	}
	try {
		AssetModel.updateInfo(id, update);
		res.json({status:"ok"});
	} catch (e) {
		if (e == "404") {
			return res.status(404).json({status:"error"});
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({status:"error"});
	}
});
group.route("POST", "/api/asset/upload", async (req, res) => {
	const file = req.files.import;
	if (typeof file === "undefined" || !req.body.type || !req.body.subtype) {
		return res.status(400).json({msg:"Missing required parameters"});
	}
	const { filepath } = file;
	const filename = path.parse(file.originalFilename).name;
	const ext = (await fromFile(filepath))?.ext;
	if (typeof ext === "undefined") {
		return res.status(400).json({msg:"File type could not be determined"});
	}
	let info:Partial<Asset> = {
		type: req.body.type,
		subtype: req.body.subtype,
		title: req.body.name || filename
	}, stream;

	const ok = info.subtype == "video" ? "video" : info.type;
	if ((fileTypes[ok] || []).indexOf(ext) < 0) {
		return res.status(400).json({msg:"Invalid file type"});
	}
	try {
		switch (info.type) {
			case "bg": {
				if (info.type == "bg" && ext != "swf") {
					const image = await Jimp.read(filepath);
						const buffer = await image
            						.resize(550, 354) 
            						.getBufferAsync(Jimp.MIME_PNG);
						stream = Readable.from(buffer);
				} else {
					stream = fs.createReadStream(filepath);
				}

				if (stream instanceof fs.ReadStream) {
        				stream.pause();
    				}
				info.id = await AssetModel.save(stream, ext == "swf" ? ext : "png", info);
				break;
			}
			case "sound": {
				if (ext != "mp3") {
					stream = await fileUtil.convertToMp3(filepath, ext);
				} else {
					stream = fs.createReadStream(filepath);
				}
				const temppath = path.join(Directories.asset, `${randomBytes(16).toString("hex")}.mp3`);
				const writeStream = fs.createWriteStream(temppath);
				await new Promise(async (resolve, reject) => {
					setTimeout(() => {
						writeStream.close();
						fs.unlinkSync(temppath);
						return reject("read stream timed out");
					}, 1.2e+6);
					stream.on("end", resolve).pipe(writeStream)
				});
				const ffdata = await asyncFfprobe(temppath) as FfprobeData;
				info.duration = Math.floor(ffdata.format.duration * 1e3);
				info.id = await AssetModel.save(temppath, "mp3", info);
				if (fs.existsSync(temppath)) fs.unlinkSync(temppath);
			}
			case "prop": {
				if (info.subtype == "video") {
					const asyncFfprobe = promisify(ffprobe);
					const data = await asyncFfprobe(filepath) as FfprobeData;
					info.width = data.streams[0].width || data.streams[1].width;
					info.height = data.streams[0].height || data.streams[1].width;

					const temppath = path.join(Directories.asset, `${randomBytes(16).toString("hex")}.flv`);
					await new Promise(async (resolve, rej) => {	
						Ffmpeg(filepath)
							.output(temppath)
							.on("end", resolve)
							.on("error", rej)
							.run();
					});
					info.id = await AssetModel.save(temppath, "flv", info);
					if (fs.existsSync(temppath)) fs.unlinkSync(temppath); 

					const command = Ffmpeg(filepath)
						.seek("0:00")
						.output(path.join(AssetModel.folder, info.id.slice(0, -3) + "png"))
						.outputOptions("-frames", "1");
					await new Promise(async (resolve, rej) => {
						command
							.on("end", resolve)
							.on("error", rej)
							.run();
					});
				} else if (info.subtype == "0") {
					let { ptype } = req.body;
					switch (ptype) {
						case "placeable":
						case "wearable":
						case "holdable":
							info.ptype = ptype;
							break;
						default:
							info.ptype = "placeable";
					}
					if (ext == "webp" || ext == "tif" || ext == "avif") {
						const image = await Jimp.read(filepath);
        					const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
        					stream = Readable.from(buffer);
						var finalExt = "png";
					} else {
						stream = fs.createReadStream(filepath);
						var finalExt = ext;
					}
					if (stream instanceof fs.ReadStream) {
        					stream.pause();
    					}
					info.id = await AssetModel.save(stream, ext, info);
				}
				break;
			}
			default: {
				return res.status(400).json({msg:"Invalid asset type"});
			}
		}
		res.json(info);
	} catch (e) {
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({status:"error"});
		return;
	}
})
group.route("POST", "/goapi/saveSound/", async (req, res) => {
	let isRecord = req.body.bytes ? true : false;

	let filepath: string, ext: string, stream: any;
	if (isRecord) {
		ext = "ogg";
		filepath = path.join(Directories.asset, `${randomBytes(16).toString("hex")}.${ext}`);
		const buffer = Buffer.from(req.body.bytes, "base64");
		fs.writeFileSync(filepath, buffer);
	} else {
		filepath = req.files.Filedata.filepath;
		ext = (await fromFile(filepath))?.ext;
		if (!ext) {
			return res.status(400).json({msg:"File type could not be determined"});
		}
	}
	let info:Partial<Asset> = {
		type: "sound",
		subtype: req.body.subtype,
		title: req.body.title
	};
	try {
		let tempToUnlink = null;
		if (ext != "mp3") {
			stream = await fileUtil.convertToMp3(filepath, ext);
			const temppath = path.join(Directories.asset, `${randomBytes(16).toString("hex")}.mp3`);
			tempToUnlink = temppath;
			const writeStream = fs.createWriteStream(temppath);
			await new Promise((resolve, reject) => {
				stream.pipe(writeStream)
					.on("finish", resolve)
					.on("error", reject);
			});
			if (isRecord && fs.existsSync(filepath)) {
				fs.unlinkSync(filepath);
			}
			filepath = temppath;
		}
		const ffdata = await asyncFfprobe(filepath);
		const duration = Math.floor(ffdata.format.duration * 1000);
		const meta = {
			duration: duration,
			type: "sound",
			subtype: info.subtype || "voiceover",
			title: info.title || "Mic recording"
		};
		const id = await AssetModel.save(filepath, "mp3", meta);
		if (tempToUnlink && fs.existsSync(tempToUnlink)) {
			fs.unlinkSync(tempToUnlink);
		}
		if (isRecord && ext == "mp3" && fs.existsSync(filepath)) {
			fs.unlinkSync(filepath);
		}
		const safeTitle = (meta.title || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		const responseXml = `<asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>voiceover</subtype><title>${safeTitle}</title><published>1</published><tags>speech</tags><duration>${duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset>`;
		res.setHeader("Content-Type", "text/html; charset=UTF-8");
		res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
		res.setHeader("Pragma", "no-cache");
		res.setHeader("Expires", "0");
		res.setHeader("Surrogate-Control", "content=\"no-store\"");
		res.end(`0${responseXml}`);
	} catch (e) {
		console.error("Mic save post-processing error:", e);
		if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
			res.end(`1<error><code>ERR_ASSET_500</code><message>Mic processing failed</message></error>`);
	}
});

export default group;
