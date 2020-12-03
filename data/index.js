const csvToJson = require("convert-csv-to-json");

function compress() {
  const values = [];
  const sources = {};

  const sigles = [];

  const fs = require("fs");
  const data = csvToJson
    .fieldDelimiter(",")
    .getJsonFromCsv("./data/sigles.csv");

  data.forEach((line) => {
    const { source, url_source, term, definition } = line;
    const id = source + url_source;
    if (values.indexOf(id) === -1) {
      values.push(id);
      sources[values.length] = [source, url_source];
    }
    sigles.push([term, definition, values.indexOf(id)]);
  });

  fs.writeFileSync("./data/sigles.json", JSON.stringify({ sources, sigles }), {
    encoding: "utf8",
    flag: "w",
  });
}

compress();
