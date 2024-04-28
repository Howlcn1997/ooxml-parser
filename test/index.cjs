const fs = require('fs');
const path = require('path');
const OOXMLParaser = require('../dist/ooxml-parser.cjs.js');

const file = fs.readFileSync(path.join(__dirname, '../assets/ppt/simple.pptx'));

const parser = new OOXMLParaser();
parser.parse(file).then(result => {
  console.log(result);
});
