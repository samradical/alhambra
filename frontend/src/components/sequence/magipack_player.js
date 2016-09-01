import _ from 'lodash'
import Q from 'bluebird'
import Loader from 'assets-loader'
import AnimationFrame from 'animation-frame';
const M = (() => {


  (function() {

    if ("performance" in window == false) {
      window.performance = {};
    }

    Date.now = (Date.now || function() { // thanks IE8
      return new Date().getTime();
    });

    if ("now" in window.performance == false) {

      var nowOffset = Date.now();

      if (performance.timing && performance.timing.navigationStart) {
        nowOffset = performance.timing.navigationStart
      }

      window.performance.now = function now() {
        return Date.now() - nowOffset;
      }
    }

  })();

  const MAGIPACK = window.Magipack
  const FPS = 30
  AnimationFrame.FRAME_RATE = FPS
  const animationFrame = new AnimationFrame({ useNative: false });

  let _loader,
    _counter = 0,
    _rId,
    _el,
    _magipack,
    _fileNames,
    _paused = false

  function _load(obj) {

    let _src = []
    _.forIn(obj, (val, name) => {
      let _type = (name === 'images') ? 'json' : 'bin'
      _src.push({ url: val, type: _type, id: name })
    })
    let _l = new Loader({
      assets: _src
    })
    _l.start()
    return new Q((resolve, reject) => {
      _l.on('complete', function(map) {
        resolve(_l)
      })
    })
  }

  function _update() {
    let _l = _fileNames.length
    if (_paused) {
      return
    }
    if (_l > 0) {
      _el.src = _magipack.getURI(_fileNames[_counter])
      _counter++;
      if (_counter >= _l) {
        _counter = 0
      }
    }
    _rId = animationFrame.request(_update);
  }

  function _stop() {}

  function _play(imageFile, packFile) {
    _magipack = new Magipack(packFile, imageFile);
    _fileNames = imageFile.map(arr => {
      return arr[0]
    })
    _counter = 0

    _rId = animationFrame.request(_update);
  }

  function loadAndPlay(obj, el) {
    _el = el
    _load(obj).then(loader => {
      _loader = loader
      _play(loader.get('images'), loader.get('pack'), el)
    })
  }

  return {
    loadAndPlay,
  }
})()

export default M
