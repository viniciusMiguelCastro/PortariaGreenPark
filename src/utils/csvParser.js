const fs = require("fs");
const csv = require("csv-parser");

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ",", mapHeaders: ({ header }) => header.trim(), mapValues: ({ value }) => value.trim() }))
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
};

module.exports = parseCSV;
