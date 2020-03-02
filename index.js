const fs = require("fs");
const path = require("path");
const readline = require("readline");

if (!process.argv[2]) {
	console.log("Missing filename argument");
	process.exit(9);
}

const filename = process.argv[2];
const filepath = path.join(__dirname, filename);

const formattedLines = [];
const rl = readline.createInterface({
	input: fs.createReadStream(filepath)
});

rl.on("line", line => {
	const formattedLine = formatLine(line);

	if (formattedLine) {
		formattedLines.push(formattedLine);
	}
});

rl.on("close", () => {
	if (formattedLines.length === 0) {
		console.log("No lines to format");
		process.exit(1);
	}

	const output = fs.createWriteStream(`${filename}.json`);

	output.on("error", err => {
		console.log("Error: ", err);
	});

	output.write(`[${formattedLines.join()}]`);
	output.end();
});

const capitalCase = string => {
	return string.charAt(0).toUpperCase() + string.substr(1).toLowerCase();
};

const formatLine = line => {
	if (line === "" || (line.match(/,/g) || []).length !== 4) {
		return null;
	}

	const lineParts = line.split(",");
	const plate = lineParts[0];
	const reviewReasonCode = lineParts[1];
	const customerMeaning =
		lineParts[2] === "NO MICRO AVAILABLE" || lineParts[2] === ""
			? null
			: capitalCase(lineParts[2]);
	const reviewerComments = capitalCase(lineParts[3]);
	const isApproved = lineParts[4] === "Y" ? true : false;

	return JSON.stringify({
		plate,
		reviewReasonCode,
		customerMeaning,
		reviewerComments,
		isApproved
	});
};
