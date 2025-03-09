const fs = require('fs-extra')
const path = require('path')

const visualization = path.join(__dirname, '..', 'dist', 'visualization', 'html')
if (fs.existsSync(visualization)) {
    fs.removeSync(visualization)
}
fs.copySync(path.join(__dirname, '..', 'src', 'visualization', 'html'),
    visualization)