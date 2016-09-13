require('shelljs/global')
var readDir = require('readdir');
const FS = require('fs.extra')
const PATH = require('path')
const ROOT = '_preconverted'
let files = ['color_long', 'color_short']

var bodymovinfiles = readDir.readSync(ROOT, ['*/**'], readDir.ABSOLUTE_PATHS)
  .filter(p => {
    let _f = false
    for (var i = 0; i < files.length; i++) {
      if (p.includes(files[i])) {
        _f = true
      }
    }
    return _f
  })

bodymovinfiles.forEach(p => {
  let _p = PATH.parse(p)
  let _goodPart = _p.dir.replace(PATH.resolve(ROOT), "")
  let _dest = PATH.join(__dirname, '../www-assets/assets/bodymovin', _goodPart)
  if (!FS.existsSync(_dest)) {
    FS.mkdirpSync(_dest)
  }
  exec(`cp ${p} ${PATH.join(_dest, _p.base)}` )
})
