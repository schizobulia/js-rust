import { generate } from './generate';
import * as path from 'path'

generate(path.join(__dirname, '..', 'tests', 'js'), ['variable.js'])