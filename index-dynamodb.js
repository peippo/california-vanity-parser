const fs = require("fs");
const path = require("path");
const readline = require("readline");

if (!process.argv[2]) {
	console.log("Missing filename argument");
	process.exit(9);
}

const filename = process.argv[2];
const filepath = path.join(__dirname, filename);

let totalLines = 0;
let skippedLines = 0;
let currentSuccessfulIndex = 0;

const formattedLines = [];
const rl = readline.createInterface({
	input: fs.createReadStream(filepath),
});

rl.on("line", (line) => {
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

	output.on("error", (err) => {
		console.log("Error: ", err);
	});

	const exportedLines = totalLines - skippedLines;
	const percentageLines = ((skippedLines / totalLines) * 100).toFixed(2);
	console.log(
		`${exportedLines} lines exported. Skipped ${skippedLines} out of ${totalLines} lines (${percentageLines}%).`
	);

	output.write(`{"plates":[${formattedLines.join()}]}`);
	output.end();
});

const capitalCase = (string) => {
	return string.charAt(0).toUpperCase() + string.substr(1).toLowerCase();
};

const formatLine = (line) => {
	totalLines += 1;
	if (line === "" || (line.match(/,/g) || []).length !== 4) {
		skippedLines += 1;
		return null;
	}

	const id = { N: currentSuccessfulIndex.toString() };
	const lineParts = line.split(",");

	if (
		lineParts[1] === "6" ||
		!/\b[0-9]\b/.test(capitalCase(lineParts[1].charAt(0).toString())) ||
		lineParts[2].includes("NO MICRO") ||
		lineParts[2] === "" ||
		lineParts[3].includes("AREA CODE") ||
		lineParts[3].includes("13 GANG") ||
		lineParts[3].includes("13-GANG")
	) {
		skippedLines += 1;
		return null;
	}

	const plate = { S: lineParts[0] };
	const reviewReasonCode = { N: lineParts[1].charAt(0).toString() || "0" };
	const customerMeaning = { S: capitalCase(lineParts[2]) || "0" };
	const reviewerComments = { S: capitalCase(lineParts[3]) || "No comment" };
	const isApproved = lineParts[4] === "Y" ? { BOOL: true } : { BOOL: false };

	currentSuccessfulIndex += 1;

	return JSON.stringify({
		PutRequest: {
			Item: {
				id,
				plate,
				reviewReasonCode,
				customerMeaning,
				reviewerComments,
				isApproved,
			},
		},
	});
};
