const fs = require("fs")
const path = require("path")
const validator = require("jsonschema").validate

let data

try {
    data = fs.readFileSync(path.resolve(__dirname, "..", "templates", "azure-log-ingestion.json"), "utf8")
} catch (err) {
    console.error(err)
    process.exit(1)
}

let schema

try {
    schema = JSON.parse(data)
} catch (err) {
    console.error(err)
    process.exit(1)
}

const v = new validator()

console.log(v.validate("4", schema))
