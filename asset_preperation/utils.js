const FS = require('fs')
const PATH = require('path')
module.exports = {

  renameIfFileHasSpaces: (path, specialChars = true) => {
    let _name = PATH.parse(path).name
    let _returnPath = path
    _name = _name.replace(/ /g, "_")
    if (specialChars) {
      _name = _name.replace(/[^a-zA-Z ]/g, "")
    }
    let _newPath = PATH.join(PATH.parse(path).dir, _name)
    _newPath += PATH.parse(path).ext
    return _newPath
  }
}
