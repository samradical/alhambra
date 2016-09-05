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
    _loading = true,
    _paused = false

  function _destroy() {
    if (_loader) {
      _loader.destroy()
    }
    if (_magipack) {
      _magipack = null
    }
  }

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
    if(!_paused && !_loading){
      let _l = _fileNames.length
      if (_l > 0) {
        _el.src = _magipack.getURI(_fileNames[_counter])
        _counter++;
        if (_counter >= _l) {
          _counter = 0
        }
      }
    }
    _rId = animationFrame.request(_update);
  }

  function _stop() {}

  function play() {
    _show()
    _paused = false
    _counter = 0
  }

  function _hide() {
    if (_el) {
      _el.classList.add('is-hidden')
    }
  }

  function _show() {
    if (_el) {
      _el.classList.remove('is-hidden')
    }
  }

  function pauseAndHide() {
    _paused = true
    _hide()
  }

  function resume() {
    if (_paused) {
      _paused = false
    } else {
      play()
    }
  }

  function loadAndPlay(obj, el) {
    _el = el
    load(obj).then(loader => {
      play()
    }).finally()
  }

  function load(obj, el) {
    _el = el
    _destroy()
    _loading = true
    return _load(obj).then(loader => {
      _loader = loader
      let imageFile = loader.get('images')
      _magipack = new Magipack(loader.get('pack'), imageFile);
      _fileNames = imageFile.map(arr => {
        return arr[0]
      })
      _loading = false
      return _loader
    })
  }

  _update()

  return {
    play,
    pauseAndHide,
    load,
    loadAndPlay,
  }
})()

export default M
