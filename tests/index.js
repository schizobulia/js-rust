const assert = require('assert');
const path  = require('path');
const fs = require('fs');
const { generate } = require('../dist/generate');

function main() {
    const jsDir = path.join(__dirname, 'js');
    const rustDir = path.join(__dirname, 'rust');
    const jsFiles = fs.readdirSync(jsDir);
    const result = generate(jsDir, jsFiles)
    while (jsFiles.length) {
        const ele = jsFiles.pop();
        if (ele) {
            const jsFilePath = path.join(jsDir, ele);
            const jsFile = path.parse(jsFilePath);
            const target = fs.readFileSync(path.join(rustDir, jsFile.name + '.rs')).toString();
            assert(result.get(jsFile) !== target, `The generated results do not match. -> ${jsFile.name}`);
        }
    }
}

main();