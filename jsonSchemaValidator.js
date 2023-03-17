const jsonschema = require("jsonschema");
const validator = new jsonschema.Validator();
const fs = require("fs");

let jsonValidator = {};

const schemaFile = fs.readFileSync("schema.json");
const schema = JSON.parse(schemaFile);

jsonValidator.validateSchema = function (jsonObject) {

  const json = validator.validate(jsonObject, schema);

  if (json.valid) {
    console.log("The JSON is valid against the schema");
    return true;
  } else {
    console.log("The JSON is invalid against the schema");
    console.log(json.errors);
    return false;
  }
};

jsonValidator.hash = require('object-hash');

module.exports = jsonValidator;
