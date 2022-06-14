const { Transform } = require("stream");
const fs = require("fs");
var process = require("process");

let keys;

let sourceFile = process.argv[2];
let resultFile = process.argv[3];
let separator = process.argv[4];

function splitComponentsByComma(str) {
  var ret = [];
  var arr = str.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
  for (let i in arr) {
    let element = arr[i];
    if ('"' === element[0]) {
      element = element.substr(1, element.length - 2);
    } else {
      element = arr[i].trim();
    }
    ret.push(element);
  }
  return ret;
}

const CSVToJSON = (csv) => {
  const lines = csv.split("\r\n");
  const result = [];

  keys = keys || lines[0].split(",");
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const obj = {};
    const currentline = splitComponentsByComma(lines[i]);

    for (let j = 0; j < keys.length; j++) {
      obj[keys[j]] = currentline[j];
    }
    result.push(obj);
  }
  return result;
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
  .pipe(fs.createWriteStream("./file.json"));
