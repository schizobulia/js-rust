import { generate } from './generate'
import * as path from 'path'
import * as fs from 'fs'

const res = generate(path.join(__dirname, '..', 'tests', 'js'), ['variable.js'])
if (res.size) {
    const key = res.keys().next().value
    if (key && res.has(key)) {
        // @ts-ignore
        fs.writeFileSync(path.join(__dirname, '..', 'tests', 'tmp.rs'), res.get(key))
    }
}
