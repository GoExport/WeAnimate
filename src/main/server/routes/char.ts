import { Char } from "../models/char.ts";
import CharModel from "../models/char.ts";
import Database from "../../storage/database";
import fs from "fs";
import httpz from "@octanuary/httpz";
import path from "path";

const base = Buffer.alloc(1, "0");
const defaultTypes = {
	anime: "guy",
	cctoonadventure: "default",
	family: "adam",
};

const thumbUrl = process.env.THUMB_BASE_URL;
const group = new httpz.Group();

group.route("GET", "/api/char/list", (req, res) => {
	res.log("Retrieving character list...")
	let filter = { type: "char" };
	for (const key in req.query) {
		filter[key] = req.query[key];
	}
	return res.json(Database.select("assets", filter));
});
group.route("POST", "/goapi/getCcCharCompositionXml/", (req, res) => {
	const id = req.body.assetId;
	if (typeof id == "undefined") {
		return res.status(400).end("Missing one or more fields");
	}

	console.log(`Loading character #${id}...`);
	try {
		const buf = CharModel.charXml(id);
		res.setHeader("Content-Type", "application/xml");
		res.end(Buffer.concat([base, buf]));
	} catch (err) {
		if (err == "404") {
			return res.status(404).end("1");
		}
		console.log(req.parsedUrl.pathname, "failed. Error:", err);
		res.status(500).end("1");
	}
});
group.route("GET", /\/stock_thumbs\/([\S]+)/, (req, res) => {
	const filepath = path.join(__dirname, "../../", thumbUrl, req.matches[1]);
	if (fs.existsSync(filepath)) {
		fs.createReadStream(filepath).pipe(res);
	} else {
		console.warn(req.parsedUrl.pathname, "Attempted on nonexistent asset");
		res.status(404).end();
	}
});
group.route("GET", /\/go\/character_creator\/(\w+)(\/\w+)?(\/.+)?$/, (req, res) => {
	let [, theme, mode, id] = req.matches;

	let redirect, external = "";
	if (req.headers.referer?.indexOf("external=true") != -1) {
		external = "&external=true";
	}
	switch (mode) {
		case "/copy": {
			redirect = `/cc?themeId=${theme}&original_asset_id=${id.substring(1)}${external}`;
			break;
		} default: {
			redirect = `/cc?themeId=${theme}&bs=${type}${external}`;
			break;
		}
	}
	res.redirect(redirect);
});
group.route("POST", "/goapi/saveCCCharacter/", (req, res) => {
    if (!req.body.body || !req.body.thumbdata || !req.body.themeId) {
        return res.status(400).end("Missing one or more fields");
    }
    const body = Buffer.from(req.body.body);
    const thumb = Buffer.from(req.body.thumbdata, "base64");

    const meta:Partial<Char> = {
		type: "char",
		subtype: "0",
		title: req.body.title,
		themeId: req.body.themeId
	};
	const id = CharModel.save(body, meta);
	CharModel.saveThumb(id, thumb);
	res.end("0" + id);
});
group.route("POST", "/goapi/saveCCThumbs/", (req, res) => {
	const id = req.body.assetId;
	if (typeof id == "undefined" || !req.body.thumbdata) {
		return res.status(400).end("1");
	}
	const thumb = Buffer.from(req.body.thumbdata, "base64");

	if (CharModel.exists(id)) {
		CharModel.saveThumb(id, thumb);
		res.end("0" + id);
	} else {
		res.end("1");
	}
});
group.route("*", "/api/char/upload", (req, res) => {
	const charFile = req.files.import;
	if (!charFile) {
		console.error("No file imported");
		return res.status(400).json({ status: "error" });
	}
	const charPath = charFile.filepath;
	try {
		const buffer = fs.readFileSync(charPath);
		const content = buffer.toString().trim();
		const isValidChar = content.includes("<cc_char") || content.includes("<character");
		const isPolicyFile = content.includes("<cross-domain-policy");
		if (!isValidChar || isPolicyFile) {
			console.error(`Character upload blocked! Reason: ${isPolicyFile ? "Crossdomain file" : "Not a Wrapper offline character"}`);
			if (fs.existsSync(charPath)) fs.unlinkSync(charPath);
			return res.status(400).json({ status: "error" });
		}
		const charTitle = path.parse(charFile.originalFilename || "").name || "Imported character";
		const meta: Partial<Char> = {
			type: "char",
			subtype: "0",
			title: charTitle,
			themeId: CharModel.getThemeId(buffer)
		};
		const id = CharModel.save(buffer, meta);
		console.log(`Character imported: ${charTitle} (ID: ${id})`);
		res.json({ 
			status: "ok", 
			id: id, 
			themeId: meta.themeId
		});
	} catch (e) {
		console.error("Character processing failed:", e);
		res.status(500).json({ status: "error" });
	} finally {
		if (fs.existsSync(charPath)) fs.unlinkSync(charPath);
	}
});

export default group;
