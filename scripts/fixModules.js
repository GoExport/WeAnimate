const fs = require("fs");
const { join } = require("path");

const searchDirs = ["@ffprobe-installer"];

searchDirs.forEach((dir) => {
	const path = join(__dirname, "../node_modules", dir);
	if (!fs.existsSync(path)) {
		return;
	}
	fs.readdirSync(
		path,
		{
			recursive: true
		}
	)
		.filter((val) => val.endsWith("js"))
		.forEach((dir) => {
			const newpath = join(path, dir);
			let contents = fs.readFileSync(newpath).toString();
			contents = contents.replaceAll("node:", "");
			let start = 0;
			while (true) {
				const startIndex = contents.indexOf("Object.hasOwn(", start);
				if (startIndex == -1) {
					break;
				}
				contents = contents.slice(0, startIndex) + contents.slice(startIndex + 14);
				const nextComma = contents.indexOf(",", startIndex);
				contents = contents.slice(0, nextComma) + ".hasOwnProperty(" + contents.slice(nextComma + 1);
			}
			fs.writeFileSync(newpath, contents);
		});
});
