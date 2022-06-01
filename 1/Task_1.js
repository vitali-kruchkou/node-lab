const { Transform } = require("stream");
const fs = require("fs");
var process = require("process");

let sourceFile = process.argv[2];
let resultFile = process.argv[3];
let separator = process.argv[4];

const CSVToJSON = (csv) => {
  const lines = csv.split("\n");
  const keys = lines[0].split(",");
  return lines.slice(1).map((line) => {
    return line.split(",").reduce((acc, cur, i) => {
      const toAdd = {};
      toAdd[keys[i]] = cur;
      return { ...acc, ...toAdd };
    }, {});
  });
};

// const ToJSONStream = new Transform({
//   objectMode: true,
//   transform(chunk, encoding, callback) {
// if (encoding !== "utf8") {
//   this.emit("error", new Error("Only UTF-8 sources are supported"));
// }
//     console.log(chunk);
//     console.log("End chunk");

//     callback(null, chunk);
//   },
// });

class ToJsonStream extends Transform {
  constructor(options = {}) {
    options = Object.assign({}, options, {
      objectMode: true,
    });
    super(options);
  }

  _transform(chunk, encoding, callback) {
    if (encoding !== "utf8") {
      this.emit("error", new Error("Only UTF-8 sources are supported"));
      return callback();
    }
    const chunkJSON = CSVToJSON(chunk);

    this.push(JSON.stringify(chunkJSON, null, 2));
    callback();
  }
}

for (const [key, value] of Object.entries(process.memoryUsage())) {
  console.log(`Memory usage by ${key}, ${value / 1000000}MB `);
}

fs.createReadStream("./test.csv", "utf8")
  .pipe(new ToJsonStream())
  .pipe(fs.createWriteStream("./file22.json"));
