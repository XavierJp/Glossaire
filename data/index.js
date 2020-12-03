const csv = require("csv-parser");
const fs = require("fs");

function compress() {
  const values = [];
  const sources = {};

  const sigles = [];

  fs.createReadStream("./data/sigles.csv")
    .pipe(csv())
    .on("data", (data) => {
      const { source, url_source, term, definition } = data;
      const id = source + url_source;
      if (values.indexOf(id) === -1) {
        values.push(id);
        sources[values.length] = [source, url_source];
      }
      sigles.push([term, definition, values.indexOf(id)]);
    })
    .on("end", () => {
      fs.writeFileSync(
        "./data/sigles.json",
        JSON.stringify({ sources, sigles }),
        {
          encoding: "utf8",
          flag: "w",
        }
      );
    });
}

compress();
