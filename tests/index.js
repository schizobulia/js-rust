const assert = require('assert')
const path  = require('path')
const fs = require('fs')
const { generate } = require('../dist/generate')

function main() {
    const jsDir = path.join(__dirname, 'js')
    const rustDir = path.join(__dirname, 'rust')
    const jsFiles = fs.readdirSync(jsDir)
    const result = generate(jsDir, jsFiles)
    while (jsFiles.length) {
        const ele = jsFiles.pop()
        if (ele) {
            const jsFilePath = path.join(jsDir, ele)
            const jsFile = path.parse(jsFilePath)
            const target = fs.readFileSync(path.join(rustDir, jsFile.name + '.rs')).toString()
            if (result.get(jsFilePath) !== target) {
                console.error(`Test failed for ${jsFile.name}`)
                console.log(result.get(jsFilePath))
                console.log('----------------------')
                console.log(target)
            }
        }
    }
}

main()