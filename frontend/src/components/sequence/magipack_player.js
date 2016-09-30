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
    _loaderQ,
    _counter = 0,
    _rId,
    _el,
    _animationCallback,
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
    if (_loaderQ) {
      _loaderQ.cancel()
      _loaderQ = null
    }
    _fileNames = null
  }

  function _load(obj, cb) {
    let _src = []
    _.forIn(obj, (val, name) => {
      let _type = (name === 'images') ? 'json' : 'bin'
      _src.push({ url: val, type: _type, id: name })
    })
    if (_loader) {
      _loader.destroy()
      _loader = null
    }
    _loader = new Loader({
      assets: _src
    })
    _loader.start()
    _loader.on('complete', ()=>{
      cb(_loader)
    })
  }

  function _update() {
    if (!_paused && !_loading && _el && _magipack) {
      let _l = _fileNames.length
      if (_l > 0) {
        _el.src = _magipack.getURI(_fileNames[_counter])
        _counter++;
        if (_counter >= _l) {
          _counter = 0
          _animationCallback()
        }
      }
    }
    _rId = animationFrame.request(_update);
  }

  function _stop() {}

  function play() {
    _paused = false
    _counter = 0
  }

  function pause() {
    _paused = true
  }

  function pauseAndHide() {
    _paused = true
  }

  function resume() {
    if (!_paused) {
      return
    }
    if (_paused) {
      _paused = false
    } else {
      play()
    }
  }

  function loadAndPlay(obj, el) {
    if (el) {
      _el = el
    }
    load(obj, el, ()=>{
      play()
    })
  }

  function load(obj, el, cb) {
    if (el) {
      _el = el
    }
    _destroy()
    _paused = true
    _loading = true
    _el.src = ""
    _load(obj, (loader) => {
      let imageFile = loader.get('images')
      _magipack = new Magipack(loader.get('pack'), imageFile);
      _fileNames = imageFile.map(arr => {
        return arr[0]
      })
      _loading = false
      if(cb){
        cb()
      }
    })
  }

  function setAnimationCompleteCallback(cb) {
    _animationCallback = cb
  }

  _update()

  return {
    pause,
    resume,
    play,
    pauseAndHide,
    load,
    destroy: _destroy,
    loadAndPlay,
    setAnimationCompleteCallback,
  }
})()

export default M
