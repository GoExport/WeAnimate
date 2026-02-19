import AssetModel, { Asset } from "../models/asset";
import Directories from "../../storage/directories";
import fs from "fs";
import httpz from "@octanuary/httpz";
import info from "../data/voices.json";
import Ffmpeg, { ffprobe, FfprobeData } from "fluent-ffmpeg";
import path from "path";
import processVoice from "../models/tts";
import { randomBytes } from "crypto";
import { Readable } from "stream";
import { promisify } from "util";

const group = new httpz.Group();
const asyncFfprobe = promisify(ffprobe);
const voices = info.voices, langs = {};
Object.keys(voices).forEach((i) => {
	const v = voices[i], l = v.language;
	langs[l] = langs[l] || [];
	langs[l].push(`<voice id="${i}" desc="${v.desc}" sex="${v.gender}" demo-url="" country="${v.country}" plus="N"/>`);
});
const xml = `${process.env.XML_HEADER}<voices>${
	Object.keys(langs).sort().map(i => {
		const v = langs[i], l = info.languages[i];
		return `<language id="${i}" desc="${l}">${v.join("")}</language>`;
	}).join("")}</voices>`;
group.route("POST", "/goapi/getTextToSpeechVoices/", (req, res) => {
	res.setHeader("Content-Type", "text/html; charset=UTF-8");
	res.end(xml);
});
group.route("POST", "/goapi/convertTextToSoundAsset/", async (req, res) => {
	const { voice, text: rawText } = req.body;
	if (!voice || !rawText) {
		return res.status(400).end();
	}
	const filename = `${randomBytes(16).toString("hex")}.mp3`;
	const filepath = path.join(Directories.asset, filename);
	const writeStream = fs.createWriteStream(filepath);
	const text = rawText.substring(0, 320);
	try {
		await processVoice(voice, text).then((data: any) => {
			return new Promise((resolve, reject) => {
				if (data instanceof Readable || (data && typeof data.on === 'function')) {
					data.pipe(writeStream);
				} else {
					writeStream.end(data);
				}
				writeStream.on("finish", resolve);
				writeStream.on("error", reject);
			});
		});
		try {
			const ffdata = await asyncFfprobe(filepath) as FfprobeData;
			const duration = Math.floor(ffdata.format.duration * 1000);
			const meta: Partial<Asset> = {
				duration,
				type: "sound",
				subtype: "tts",
				title: `[${voices[voice].desc}] ${text}`
			};
			const id = await AssetModel.save(filepath, "mp3", meta);
			
			process.nextTick(() => {
				if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
			});
			const safeTitle = meta.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
			const responseXml = `<asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${safeTitle}</title><published>0</published><tags></tags><duration>${duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset>`;
			res.setHeader("Content-Type", "text/html; charset=UTF-8");
			res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
			res.setHeader("Pragma", "no-cache");
			res.setHeader("Expires", "0");
			res.setHeader("Surrogate-Control", "content=\"no-store\"");
			res.end(`0${responseXml}`);
		} catch (err) {
			console.error("TTS post-processing error:", err);
			if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
			res.end(`1<error><code>ERR_ASSET_500</code><message>Post-processing failed</message></error>`);
		}
	} catch (e) {
		console.error("Error generating TTS:", e);
		if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
		res.end(`1<error><code>ERR_ASSET_404</code><message>Generation failed</message></error>`);
	}
});

export default group;
