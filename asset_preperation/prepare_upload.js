require('shelljs/global')
const PATH = require('path')
const rimraf = require('rimraf')
const FS = require('fs.extra')
const Q = require('bluebird')
const argv = require('yargs').argv;
var readDir = require('readdir');

const UTILS = require('./utils')
const QUALITY = 7

const FINAL_UPLOAD = '../../www-assets'
const RAW = argv.rawDir || '_preconverted'
const CONTENT_DIR = PATH.join(__dirname, RAW)
const SPLIT_MIN = argv.smin || 60
const SPLIT_MAX = argv.smax || 600
const CONVERTED_SPLIT_DIR = ''
const CONVERTED_UPLOAD_DIR = 'assets'
const BUCKET = "gs://samrad-alhambra"
const PUBLIC_BASE = "https://storage.googleapis.com/samrad-deriveur/assets/"
const MANIFEST = "uploaded_files"

const MAPP = [
  "Location_1",
  "Location_2",
  "Location_3",
  "Location_4",
  "Location_5",
  "Location_6",
  "Location_7",
  "Location_8",
  "Location_9",
  "Location_10",
  "Location_11",
  "Location_12",
  "Location_13",
  "Location_14",
  "Location_15",
  "Location_16",
  "Location_17",
  "Location_18",
  "Location_19"
]

/*

***********
HOW TO
***********

Place the video or wav in _content.(lvel volume before)
node prepare_upload.js --convert
node prepare_upload.js --split --smin 20 --smax 40
node prepare_upload.js --convertSplited
  (if assets are in _liveContent: node prepare_upload.js --rawDir "../_liveContent" --convertSplited --dir "assets")
node prepare_upload.js --deleteWavs
<copy files into _liveContent>
node prepare_upload.js --copy --dir "../_liveContent/assets"
node prepare_upload.js --upload
node generate_json.js
*/



/*
node prepare_upload.js --rawDir "../_liveContent" --convert --dir "assets"
*/
function convert(dir = CONVERTED_UPLOAD_DIR) {
  var convertedFiles = []
  let _outBaseDir = PATH.join(CONTENT_DIR, dir)
  rimraf(_outBaseDir, () => {
    var files = readDir.readSync(CONTENT_DIR, ['**.mp4', '**.aiff', '**.wav', '**.mp3', '**.m4a'], readDir.ABSOLUTE_PATHS);
    files.forEach(path => {
      //get the video name
      //console.log(path);
      let _spacelessPath = UTILS.renameIfFileHasSpaces(path)

      let _name = PATH.parse(_spacelessPath).name
      let _dir = PATH.parse(_spacelessPath).dir


      let _structure = _dir.replace(CONTENT_DIR, "")
        //console.log(_structure);
      let _outDir = PATH.join(_outBaseDir, _structure)
      let _spacelessDir = UTILS.renameIfFileHasSpaces(_outDir)

      if (!FS.existsSync(_spacelessDir)) {
        FS.mkdirpSync(_spacelessDir);
      }
      //console.log(_spacelessDir);
      let _wavFile = `${_name}.wav`

      let _savePath = PATH.join(_spacelessDir, _wavFile)
      convertedFiles.push(_savePath)
      if (!FS.existsSync(_savePath)) {
        let _c = `ffmpeg -i ${path} ${_savePath}`
        console.log(_c);
        exec(_c)
      }
    })
  })
}

/*
node prepare_upload.js --rawDir "../_liveContent" --split --smin 60 --smax 180 --dir "assets"
*/
function split(files, dir = '') {
  let _splitDir = PATH.join(CONTENT_DIR, dir, CONVERTED_SPLIT_DIR)
  rimraf(_splitDir, () => {
    FS.mkdirSync(_splitDir)
    files.forEach(path => {
      let o = exec(`ffprobe -i ${path} -show_entries format=duration -v quiet -of csv="p=0"`)
      let _dur = parseFloat(o.stdout)
      let _dir = PATH.parse(path).dir
      let _structure = _dir.replace(PATH.join(CONTENT_DIR, dir), "")
      let _outDir = PATH.join(_splitDir, _structure)

      let _wavName = PATH.parse(path).name
      let _wavDir = PATH.join(_outDir, _wavName)

      if (!FS.existsSync(_wavDir)) {
        FS.mkdirpSync(_wavDir);
      }
      cd(_wavDir)

      let _startTime = 0
      let _trimName = _wavName + '_trim'
      let _c = 0
      while (_startTime < _dur) {
        let _trimDur = Math.floor(Math.random() * (SPLIT_MAX - SPLIT_MIN)) + SPLIT_MIN
        let _name = _trimName + _c
        exec(`sox ${path} ${_name}.wav trim ${_startTime} ${_trimDur}`)
        _startTime += _trimDur
        _c++
      }
    })
  })

  cd(CONTENT_DIR)
}

/*
node prepare_upload.js --rawDir "../_liveContent" --deleteWavs --dir "assets"
*/
function deleteWavs(dir = CONVERTED_SPLIT_DIR) {
  let _splitDir = PATH.join(CONTENT_DIR, dir)
  var files = readDir.readSync(_splitDir, ['**.wav', '**.aif', '**.aiff', '**.m4a'], readDir.ABSOLUTE_PATHS);
  files.forEach(path => {
    FS.unlinkSync(path)
  })
}


/*
node prepare_upload.js --rawDir "../_liveContent" --convertSplited --dir "assets"
*/
function convertSplited(q, dir = CONVERTED_SPLIT_DIR, withMp3 = false) {
  let _splitDir = PATH.join(CONTENT_DIR, dir)
  let _formats = ['**.m4a', '**.wav', '**.aiff', '**.aif', '**.mp3']
  if (withMp3) {
    _formats.push('**.mp3')
  }
  var files = readDir.readSync(_splitDir, _formats, readDir.ABSOLUTE_PATHS);
  files.forEach(path => {
    let _s = path.split('/')
    _s.forEach(folder => {
      console.log(folder);
    })
    console.log("\n");
  })
  files.forEach(path => {
    let _dir = PATH.parse(path).dir
    let _name = PATH.parse(path).name
    let _base = PATH.parse(path).base
    let _temp = _name
    if (PATH.parse(path).ext === '.mp3') {
      _temp = `${Math.random()}${_name}`
    }
    let _outFile = PATH.join(_dir, `${_temp}`)
    let _c = `ffmpeg -i ${path} -q:a ${q} -acodec libmp3lame -y ${_outFile}.mp3`
    exec(_c)
    exec(`ffmpeg -i ${path} -q:a ${q} -y ${_outFile}.ogg`)
    if (PATH.parse(path).ext === '.mp3') {
      FS.unlinkSync(path)
      FS.renameSync(`${_outFile}.mp3`, PATH.join(_dir, `${_base}.mp3`))
      FS.renameSync(`${_outFile}.ogg`, PATH.join(_dir, `${_base}.ogg`))
    }
  })
}

/*
node prepare_upload.js --rawDir "../_liveContent" --manifest --dir "assets"
*/

function manifest(dir = FINAL_UPLOAD) {
  exec('node generate_json.js')
  let _splitDir = PATH.join(CONTENT_DIR, dir)
  var files = readDir.readSync(_splitDir, ['**.mp3', '**.ogg'], readDir.ABSOLUTE_PATHS);
  let _out = {}
  files.forEach(path => {
    let _name = PATH.parse(path).name
    let _base = PATH.parse(path).base
      /*This is the folder group of all the clips*/
    let _file = PATH.parse(path).dir.split('/')
    _file = _file[_file.length - 1]
    let _group = (!_out[_file]) ? {} : _out[_file]
    _out[_file] = _group
      /*This is the pair of mp3 and ogg*/
    let _pair = (!_group[_name]) ? ({ src: [] }) : _group[_name]
    _group[_name] = _pair
    _pair.src.push(`${PUBLIC_BASE}${_file}/${_base}`)
  })
  FS.writeFileSync(`${MANIFEST}.json`, JSON.stringify(_out, null, 4), 'utf-8')
}
/*
node prepare_upload.js --rawDir "../_liveContent" --copy --dir "assets/split"
*/
function copy(sourceDir = '', uploadDir = FINAL_UPLOAD) {
  let _splitDir = PATH.join(CONTENT_DIR, sourceDir)
  let _uploadDir = PATH.join(CONTENT_DIR, uploadDir)
  var folders = readDir.readSync(_splitDir, ['*/'], readDir.INCLUDE_DIRECTORIES + readDir.NON_RECURSIVE)

  /*folders.forEach((p, i) => {
    FS.renameSync(PATH.join(_splitDir, p), PATH.join(_splitDir, `loc${i}`))
  })*/

  var files = readDir.readSync(_splitDir, ['**.mp3', '**.ogg'], readDir.ABSOLUTE_PATHS);
  if (!FS.existsSync(_uploadDir)) {
    FS.mkdirpSync(_uploadDir)
  }

  rimraf(_uploadDir, () => {
    FS.mkdirpSync(_uploadDir)
    files.forEach(path => {
      let _dir = PATH.parse(path).dir
      let _base = PATH.parse(path).base
        //console.log(_splitDir, _dir);
      let _structure = _dir.replace(_splitDir, "")
      let _outDir = PATH.join(_uploadDir, _structure)
      let _outFile = PATH.join(_outDir, _base)
      if (!FS.existsSync(_outDir)) {
        FS.mkdirpSync(_outDir)
      }
      exec(`cp ${path} ${_outFile}`)
    })
  })
}

/*
node prepare_upload.js --rawDir "../_upload" --upload
*/
function upload(dir = FINAL_UPLOAD) {
  let _uploadDir = PATH.join(CONTENT_DIR, dir)
    /* let _splitDir = PATH.join(CONTENT_DIR, CONVERTED_SPLIT_DIR)
     let _uploadDir = PATH.join(CONTENT_DIR, CONVERTED_UPLOAD_DIR)
     var files = readDir.readSync(_splitDir, ['**.mp3', '**.ogg'], readDir.ABSOLUTE_PATHS);

     rimraf(_uploadDir, () => {
       if (!FS.existsSync(_uploadDir)) {
         FS.mkdirSync(_uploadDir)
       }

       files.forEach(path => {
         let _file = PATH.parse(path).dir.split('/')
         _file = _file[_file.length - 1]
         let _base = PATH.parse(path).base

         let _outDir = PATH.join(_uploadDir, _file)
         if (!FS.existsSync(_outDir)) {
           FS.mkdirSync(_outDir)
         }
         let _outPath = PATH.join(_outDir, _base)
         exec(`cp ${path} ${_outPath}`)
       })
       console.log(_uploadDir);*/
    //console.log(`Copied files to ${_uploadDir}`);
  console.log(_uploadDir);
  exec(`gsutil -m cp -Rn -a public-read ${_uploadDir} ${BUCKET}`)
    //})
}

if (argv.convert) {
  convert(argv.dir)
}

if (argv.convertSplited) {
  convertSplited(argv.q || QUALITY, argv.dir, argv.mp3)
}

if (argv.split) {
  var files = readDir.readSync(CONTENT_DIR, ['**.wav'], readDir.ABSOLUTE_PATHS);
  split(files, argv.dir)
}

if (argv.upload) {
  upload(argv.dir)
}

if (argv.deleteWavs) {
  deleteWavs(argv.dir)
}

if (argv.copy) {
  copy(argv.dir)
}

if (argv.manifest) {
  manifest()
}
