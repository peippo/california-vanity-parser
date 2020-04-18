const AWS = require("aws-sdk");
const db = new AWS.DynamoDB({ region: "eu-north-1" });

const data = [
	/* {"PutRequest":{"Item":{"id":{"N":"0"} ... */
];

const batches = [];
const batchSize = 20;
let currentBatch = [];
let itemCount = 0;

for (let i in data) {
	itemCount++;
	currentBatch.push(data[i]);

	if (itemCount === batchSize) {
		batches.push(currentBatch);
		currentBatch = [];
		itemCount = 0;
	}
}

if (currentBatch.length > 0 && currentBatch.length !== batchSize) {
	batches.push(currentBatch);
}

function handler(request) {
	return function (err, data) {
		if (err) {
			console.error(JSON.stringify(err, null, 2));
			console.error("Request that caused error:");
			console.error(JSON.stringify(request, null, 2));
		}

		if (completedRequests == batches.length) {
			console.log("Finished");
		}
	};
}

for (i in batches) {
	let params = {
		RequestItems: {
			plates: [],
		},
	};
	params.RequestItems["plates"] = batches[i];
	db.batchWriteItem(params, handler(params));
}
