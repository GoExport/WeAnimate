import { createReadStream, ReadStream } from "fs";
import Database from "../../storage/database";
import fileTypes from "../data/allowed_file_types.json";
import { extensions, FileExtension, fromFile, mimeTypes } from "file-type";
import { Group } from "@octanuary/httpz";
import { Readable } from "stream";
import { execSync } from "child_process";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";
import MovieModel from "../models/movie.js";
import Settings from "../../storage/settings";
import WatermarkModel from "../models/watermark";

type S = ReadStream | Readable;

const url = `${process.env.API_SERVER_HOST}:${process.env.API_SERVER_PORT}`;
const XML_HEADER = process.env.XML_HEADER;
const group = new Group();

group.route("POST", /\/goapi\/assignwatermark\/movie\/([\S]+)\/([\S]+)/, (req, res) => {
	const mId = req.matches[1];
	let wId = req.matches[2];

	if (wId == "0dhteqDBt5nY" || wId == "none") {
		wId = "none";
	}
	if (mId === "0") {
		Settings.defaultWatermark = wId;
		return res.end("0");
	}
	if (MovieModel.setWatermark(mId, wId)) {
		res.end("0");
	} else {
		res.status(404).end("Movie does not exist");
	}
});
group.route("POST", "/api/watermark/set_default", (req, res) => {
	let id = req.body.id;

	if (typeof id == "undefined") {
		id = "none";
	} else if (id != "0vTLbQy9hG7k" && !WatermarkModel.exists(id)) {
		return res.status(404).json({ msg:"Watermark does not exist" });
	}

	Settings.defaultWatermark = id;
	res.end();
	res.log("Default watermark set to " + id);
});

group.route("GET", "/api/watermark/list", (req, res) => {
	const list = WatermarkModel.list().map((w:any) => {
		w.thumbnail = `${url}/watermarks/${w.id}`;
		return w;
	});
	res.json(list);
});
group.route("POST", "/goapi/getUserWatermarks/", (req, res) => {
	let wId = null;
	const mId = req.body.movieId;
	if (mId) {
		const movie = Database.get("movies", mId);
		if (!movie) {
			return res.status(404).end();
		}
		wId = movie.data.watermark;
	} else {
		const { defaultWatermark } = Settings;
		wId = defaultWatermark ? defaultWatermark : null;
	}

	const list = WatermarkModel.list();
	res.setHeader("Content-Type", "application/xml");
	res.end(`${XML_HEADER}<watermarks>${
		list.map((w) => `<watermark id="${w.id}" thumbnail="${url}/watermarks/${w.id}"/>`).join("")
	}${wId !== null ? `<preview>${wId}</preview>` : ""}</watermarks>`);
});
group.route("GET", /^\/watermarks\/([\S]*)$/, (req, res) => {
	let id = req.matches[1];
	if (!id) {
		return res.status(400).end();
	}
	try {
		const ext = (id.split(".")[1] || "xml") as FileExtension;
		const extensionIndex = [...extensions].indexOf(ext);
		if (extensionIndex < 0) {
			return res.status(400).end();
		}
		const mime = [...mimeTypes][extensionIndex];
		const readStream = WatermarkModel.load(id);
		res.setHeader("Content-Type", mime);
		readStream.pipe(res);
	} catch (e) {
		if (e == "404") {
			return res.status(404).end();
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).end();
	}
});
group.route("POST", "/goapi/getMovieInfo/", (req, res) => {
	const mId = req.body.movieId;
	const movie = Database.get("movies", mId);
	if (!movie) {
		return res.status(400).end("Movie not found");
	}
	const wId = movie.data.watermark;
	res.setHeader("Content-Type", "application/xml");
	res.end(`${XML_HEADER}<watermarks>${
    (typeof wId == "undefined" || wId == "none") ?
        `<watermark style=""/>` : 
        (wId == "0vTLbQy9hG7k") ?
            "" :
            `<watermark>${url}/watermarks/${wId}</watermark>`
}</watermarks>`);

});
group.route("POST", "/api/watermark/save", async (req, res) => {
	if (WatermarkModel.list().length >= 20) {
		return res.status(400).json({msg:"Maximum number of watermarks reached"});
	}
	const file = req.files.image;
	if (typeof file === "undefined") {
		return res.status(400).json({msg:"Missing required parameters"});
	}
	let id = req.body.id;
	const { filepath } = file;
	let ext = (await fromFile(filepath))?.ext;
	let finalExt = ext;
	if (typeof ext === "undefined") {
		return res.status(400).json({msg:"File type could not be determined"});
	}
	if (fileTypes["watermark"].indexOf(ext) < 0) {
		return res.status(400).json({msg:"Invalid file type"});
	}
	let stream:S;
	if (ext == "webp" || ext == "tif" || ext == "avif") {
		try {
			const buffer = execSync(`"${ffmpegPath}" -hide_banner -loglevel error -i "${filepath}" -f image2pipe -vcodec png -`);
			stream = Readable.from(buffer);
			finalExt = "png";
		} catch (err) {
			console.error("FFmpeg conversion error:", err);
			return res.status(500).json({msg:"Conversion failed"});
		}
	} else {
		stream = createReadStream(filepath);
		finalExt = ext;
	}
	if (stream instanceof ReadStream) {
		stream.pause();
	}
	id = await WatermarkModel.save(stream, finalExt, id);
	res.json({
		id,
		thumbnail: `${url}/watermarks/${id}`
	});
});
group.route("POST", "/api/watermark/delete", (req, res) => {
	const id = req.body.id;
	if (typeof id == "undefined") {
		return res.status(404).json({ msg:"Missing required fields" });
	}
	if (Settings.defaultWatermark == id) {
		Settings.defaultWatermark = "none";
	}
	WatermarkModel.delete(id);
	res.end();
	res.log("Deleted watermark " + id);
});

export default group;
