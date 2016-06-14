(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isFunction = function isFunction(obj) {
    return typeof obj == 'function' || false;
};

var EventEmitter = function () {
    function EventEmitter() {
        _classCallCheck(this, EventEmitter);

        this.listeners = new Map();
    }

    _createClass(EventEmitter, [{
        key: 'on',
        value: function on(label, callback) {
            this.listeners.has(label) || this.listeners.set(label, []);
            this.listeners.get(label).push(callback);
        }
    }, {
        key: 'off',
        value: function off(label, callback) {
            var listeners = this.listeners.get(label),
                index = void 0;

            if (listeners && listeners.length) {
                index = listeners.reduce(function (i, listener, index) {
                    return isFunction(listener) && listener === callback ? i = index : i;
                }, -1);

                if (index > -1) {
                    listeners.splice(index, 1);
                    this.listeners.set(label, listeners);
                    return true;
                }
            }
            return false;
        }
    }, {
        key: 'emit',
        value: function emit(label) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            var listeners = this.listeners.get(label);

            if (listeners && listeners.length) {
                listeners.forEach(function (listener) {
                    listener.apply(undefined, args);
                });
                return true;
            }
            return false;
        }
    }]);

    return EventEmitter;
}();

var emitter = new EventEmitter();
exports.default = emitter;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sono = require('@stinkdigital/sono');

var _sono2 = _interopRequireDefault(_sono);

var _howler = require('howler');

var _howler2 = _interopRequireDefault(_howler);

var _Emitter = require('./Emitter');

var _Emitter2 = _interopRequireDefault(_Emitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sound = function () {
    function Sound() {
        var paths = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        _classCallCheck(this, Sound);

        console.log('`', paths);
        /*this._s = Sono.createSound({ src: paths })
        this._s.on('loaded', () => {
            console.log('`', 'Sound Loaded');
        })
        this._s.on('ended', () => {
            console.log('`', 'Sound Ended');
            Emitter.emit('sound:ended')
        })
        this._s.play()
        */
        this._s = new _howler2.default.Howl({
            urls: paths,
            autoplay: true,
            loop: false,
            onend: function onend() {
                console.log('`', 'Sound Ended');
                _Emitter2.default.emit('sound:ended');
            }
        });
    }

    _createClass(Sound, [{
        key: 'destroy',
        value: function destroy() {
            console.log('`', 'Sound destroyed');
            //this._s.destroy()
            this._s.unload();
        }
    }]);

    return Sound;
}();

exports.default = Sound;

},{"./Emitter":2,"@stinkdigital/sono":33,"howler":34}],4:[function(require,module,exports){
'use strict';

var _Emitter = require('./Emitter');

var _Emitter2 = _interopRequireDefault(_Emitter);

var _Sound = require('./Sound');

var _Sound2 = _interopRequireDefault(_Sound);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var load = require('load-json-xhr');

var sound = void 0,
    cecilData = void 0,
    effectsData = void 0;
var index = 1;
console.log('`', 'HI, PRESS START!');

var G = 'https://storage.googleapis.com/samrad-alhambra/www-assets/prototype1/';

function productionAssets(data) {
    data.children.map(function (file) {
        var _p = file.path;
        file.path = '' + G + _p;
        return file;
    });
    console.log(data);
}

function loadJson() {
    load('assets/json/cecil.json', function (err, data) {
        cecilData = data;
        cecilData.index = 0;
        productionAssets(cecilData);
    });

    load('assets/json/sam.json', function (err, data) {
        effectsData = data;
        effectsData.index = 0;
        productionAssets(effectsData);
    });

    var btn = document.getElementById('btn');

    btn.addEventListener('touchend', function () {
        play();
    });
    btn.addEventListener('mouseup', function () {
        play();
    });
}

loadJson();

function play() {
    var _d = Math.random() < 0.5 ? cecilData : effectsData;
    var _i = _d.index;
    if (_i > _d.length - 2) {
        _d.index = 0;
    }
    sound = new _Sound2.default([_d.children[_i].path, _d.children[_i + 1].path]);
    _d.index += 2;
}

_Emitter2.default.on('sound:ended', function () {
    sound.destroy();
    play();
});

},{"./Emitter":2,"./Sound":3,"load-json-xhr":35}],5:[function(require,module,exports){
'use strict';

var Analyser = require('./effect/analyser.js'),
    Distortion = require('./effect/distortion.js'),
    Echo = require('./effect/echo.js'),
    FakeContext = require('./effect/fake-context.js'),
    Filter = require('./effect/filter.js'),
    Flanger = require('./effect/flanger.js'),
    Panner = require('./effect/panner.js'),
    Phaser = require('./effect/phaser.js'),
    Recorder = require('./effect/recorder.js'),
    Reverb = require('./effect/reverb.js');

function Effect(context) {
    context = context || new FakeContext();

    var api,
        destination,
        nodeList = [],
        panning = new Panner(context),
        sourceNode;

    var has = function(node) {
        if(!node) { return false; }
        return nodeList.indexOf(node) > -1;
    };

    var add = function(node) {
        if(!node) { return; }
        if(has(node)) { return node; }
        nodeList.push(node);
        updateConnections();
        return node;
    };

    var remove = function(node) {
        if(!node) { return; }
        if(!has(node)) { return node; }
        var l = nodeList.length;
        for (var i = 0; i < l; i++) {
            if(node === nodeList[i]) {
                nodeList.splice(i, 1);
                break;
            }
        }
        var output = node._output || node;
        output.disconnect();
        updateConnections();
        return node;
    };

    var toggle = function(node, force) {
      force = !!force;
      var hasNode = has(node);
      if(arguments.length > 1 && hasNode === force) {
        return api;
      }
      if(hasNode) {
        remove(node);
      } else {
        add(node);
      }
      return api;
    };

    var removeAll = function() {
        while(nodeList.length) {
            nodeList.pop().disconnect();
        }
        updateConnections();
        return api;
    };

    var destroy = function() {
        removeAll();
        context = null;
        destination = null;
        nodeList = [];
        if(sourceNode) { sourceNode.disconnect(); }
        sourceNode = null;
    };

    var connect = function(a, b) {
        //console.log('> connect', (a.name || a.constructor.name), 'to', (b.name || b.constructor.name));

        var output = a._output || a;
        //console.log('> disconnect output: ', (a.name || a.constructor.name));
        output.disconnect();
        //console.log('> connect output: ', (a.name || a.constructor.name), 'to input:', (b.name || b.constructor.name));
        output.connect(b);
    };

    var connectToDestination = function(node) {
        var l = nodeList.length,
            lastNode = l ? nodeList[l - 1] : sourceNode;

        if(lastNode) {
            connect(lastNode, node);
        }

        destination = node;
    };

    var updateConnections = function() {
        if(!sourceNode) { return; }

        //console.log('updateConnections:', nodeList.length);

        var node,
            prev;

        for (var i = 0; i < nodeList.length; i++) {
            node = nodeList[i];
            //console.log(i, node);
            prev = i === 0 ? sourceNode : nodeList[i - 1];
            connect(prev, node);
        }

        if(destination) {
            connectToDestination(destination);
        }
    };

    /*
     * Effects
     */

    var analyser = function(config) {
        return add(new Analyser(context, config));
    };

    // lowers the volume of the loudest parts of the signal and raises the volume of the softest parts
    var compressor = function(config) {
        config = config || {};

        var node = context.createDynamicsCompressor();

        node.update = function(config) {
            // min decibels to start compressing at from -100 to 0
            node.threshold.value = config.threshold !== undefined ? config.threshold : -24;
            // decibel value to start curve to compressed value from 0 to 40
            node.knee.value = config.knee !== undefined ? config.knee : 30;
            // amount of change per decibel from 1 to 20
            node.ratio.value = config.ratio !== undefined ? config.ratio : 12;
            // gain reduction currently applied by compressor from -20 to 0
            node.reduction.value = config.reduction !== undefined ? config.reduction : -10;
            // seconds to reduce gain by 10db from 0 to 1 - how quickly signal adapted when volume increased
            node.attack.value = config.attack !== undefined ? config.attack : 0.0003;
            // seconds to increase gain by 10db from 0 to 1 - how quickly signal adapted when volume redcuced
            node.release.value = config.release !== undefined ? config.release : 0.25;
        };

        node.update(config);

        return add(node);
    };

    var convolver = function(impulseResponse) {
        // impulseResponse is an audio file buffer
        var node = context.createConvolver();
        node.buffer = impulseResponse;
        return add(node);
    };

    var delay = function(time) {
        var node = context.createDelay();
        if(time !== undefined) { node.delayTime.value = time; }
        return add(node);
    };

    var echo = function(config) {
        return add(new Echo(context, config));
    };

    var distortion = function(amount) {
        // Float32Array defining curve (values are interpolated)
        //node.curve
        // up-sample before applying curve for better resolution result 'none', '2x' or '4x'
        //node.oversample = '2x';
        return add(new Distortion(context, amount));
    };

    var filter = function(type, frequency, q, gain) {
        return add(new Filter(context, type, frequency, q, gain));
    };

    var lowpass = function(frequency, peak) {
        return filter('lowpass', frequency, peak);
    };

    var highpass = function(frequency, peak) {
        return filter('highpass', frequency, peak);
    };

    var bandpass = function(frequency, width) {
        return filter('bandpass', frequency, width);
    };

    var lowshelf = function(frequency, gain) {
        return filter('lowshelf', frequency, 0, gain);
    };

    var highshelf = function(frequency, gain) {
        return filter('highshelf', frequency, 0, gain);
    };

    var peaking = function(frequency, width, gain) {
        return filter('peaking', frequency, width, gain);
    };

    var notch = function(frequency, width, gain) {
        return filter('notch', frequency, width, gain);
    };

    var allpass = function(frequency, sharpness) {
        return filter('allpass', frequency, sharpness);
    };

    var flanger = function(config) {
        return add(new Flanger(context, config));
    };

    var gain = function(value) {
        var node = context.createGain();
        if(value !== undefined) {
            node.gain.value = value;
        }
        return node;
    };

    var panner = function() {
        return add(new Panner(context));
    };

    var phaser = function(config) {
        return add(new Phaser(context, config));
    };

    var recorder = function(passThrough) {
        return add(new Recorder(context, passThrough));
    };

    var reverb = function(seconds, decay, reverse) {
        return add(new Reverb(context, seconds, decay, reverse));
    };

    var script = function(config) {
        config = config || {};
        // bufferSize 256 - 16384 (pow 2)
        var bufferSize = config.bufferSize || 1024;
        var inputChannels = config.inputChannels === undefined ? 0 : inputChannels;
        var outputChannels = config.outputChannels === undefined ? 1 : outputChannels;

        var node = context.createScriptProcessor(bufferSize, inputChannels, outputChannels);

        var thisArg = config.thisArg || config.context || node;
        var callback = config.callback || function() {};

        // available props:
        /*
        event.inputBuffer
        event.outputBuffer
        event.playbackTime
        */
        // Example: generate noise
        /*
        var output = event.outputBuffer.getChannelData(0);
        var l = output.length;
        for (var i = 0; i < l; i++) {
            output[i] = Math.random();
        }
        */
        node.onaudioprocess = callback.bind(thisArg);

        return add(node);
    };

    var setSource = function(node) {
        sourceNode = node;
        updateConnections();
        return node;
    };

    var setDestination = function(node) {
        connectToDestination(node);
        return node;
    };

    //

    api = {
        context: context,
        nodeList: nodeList,
        panning: panning,

        has: has,
        add: add,
        remove: remove,
        toggle: toggle,
        removeAll: removeAll,
        destroy: destroy,
        setSource: setSource,
        setDestination: setDestination,

        analyser: analyser,
        compressor: compressor,
        convolver: convolver,
        delay: delay,
        echo: echo,
        distortion: distortion,
        filter: filter,
        lowpass: lowpass,
        highpass: highpass,
        bandpass: bandpass,
        lowshelf: lowshelf,
        highshelf: highshelf,
        peaking: peaking,
        notch: notch,
        allpass: allpass,
        flanger: flanger,
        gain: gain,
        panner: panner,
        phaser: phaser,
        recorder: recorder,
        reverb: reverb,
        script: script
    };

    return Object.freeze(api);
}

module.exports = Effect;

},{"./effect/analyser.js":6,"./effect/distortion.js":7,"./effect/echo.js":8,"./effect/fake-context.js":9,"./effect/filter.js":10,"./effect/flanger.js":11,"./effect/panner.js":12,"./effect/phaser.js":13,"./effect/recorder.js":14,"./effect/reverb.js":15}],6:[function(require,module,exports){
'use strict';


function Analyser(context, config) {
  config = config || {};

  var fftSize = config.fftSize || 512,
    freqFloat = !!config.float,
    waveFloat = !!config.float,
    waveform,
    frequencies,
    node = context.createAnalyser();

  node.fftSize = fftSize; // frequencyBinCount will be half this value
  node.smoothingTimeConstant = config.smoothing || config.smoothingTimeConstant || node.smoothingTimeConstant;
  node.minDecibels = config.minDecibels || node.minDecibels;
  node.maxDecibels = config.maxDecibels || node.maxDecibels;

  //the worker returns a normalized value 
  //first a sum of all magnitudes devided by the byteLength, then devide  by half the fft (1channel)
  var amplitudeBlob = new Blob(["onmessage=function(e){var data=e.data;var f=new Float32Array(data.b);for(var i=0;i<f.length;i++){data.sum+=f[i]}data.sum/=f.length;postMessage(Math.max(1.0-(data.sum/data.numSamples*-1.0),0))};"]);
  var pitchBlob = new Blob(["onmessage=function(e){var data=e.data;var sampleRate=data.sampleRate;var buf=new Float32Array(data.b);var SIZE=buf.length;var MAX_SAMPLES=Math.floor(SIZE/2);var best_offset=-1;var best_correlation=0;var rms=0;var foundGoodCorrelation=false;var correlations=new Array(MAX_SAMPLES);for(var i=0;i<SIZE;i++){var val=buf[i];rms+=val*val}rms=Math.sqrt(rms/SIZE);if(rms<0.01){postMessage(-1)}else{var lastCorrelation=1;for(var offset=0;offset<MAX_SAMPLES;offset++){var correlation=0;for(var i=0;i<MAX_SAMPLES;i++){correlation+=Math.abs((buf[i])-(buf[i+offset]))}correlation=1-(correlation/MAX_SAMPLES);correlations[offset]=correlation;if((correlation>0.9)&&(correlation>lastCorrelation)){foundGoodCorrelation=true;if(correlation>best_correlation){best_correlation=correlation;best_offset=offset}}else if(foundGoodCorrelation){var shift=(correlations[best_offset+1]-correlations[best_offset-1])/correlations[best_offset];postMessage(sampleRate/(best_offset+(8*shift)))}lastCorrelation=correlation}if(best_correlation>0.01){postMessage(sampleRate/best_offset)}else{postMessage(-1)}}};"]);
  var amplitudeBlobURL = URL.createObjectURL(amplitudeBlob);
  var amplitudeWorker = new Worker(amplitudeBlobURL);
  var pitchBlobURL = URL.createObjectURL(pitchBlob);
  var pitchWorker = new Worker(pitchBlobURL);

  var amplitudeCallback;
  var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  var pitchCallback;
  var pitchCallbackObject = {
    hertz:undefined, //number
    note:undefined, //string
    noteIndex:undefined, //int
    detuneCents:undefined, //number
    detune:undefined, //string
  };

  amplitudeWorker.onmessage = function(e) {
    if (amplitudeCallback) {
      amplitudeCallback(e.data);
    }
  };

  pitchWorker.onmessage = function(e) {
    if (pitchCallback) {
      var Hz = e.data;
      if(Hz !== -1){
        var note =  noteFromPitch( Hz );
        var detune = centsOffFromPitch( Hz, note );
        pitchCallbackObject.hertz = Hz;
        pitchCallbackObject.noteIndex = note%12;
        pitchCallbackObject.note = noteStrings[note%12];
        pitchCallbackObject.detuneCents = detune;
        if (detune == 0 ) {
          pitchCallbackObject.detune = "";
        } else {
          if (detune < 0)
            pitchCallbackObject.detune = "flat";
          else
            pitchCallbackObject.detune = "sharp";
          }
      }
      pitchCallback(pitchCallbackObject);
    }
  };

  var needsUpdate = function(arr, float) {
    if (!arr) {
      return true;
    }
    if (node.fftSize !== fftSize) {
      return true;
    }
    if (float && arr instanceof Uint8Array) {
      return true;
    }
    return !float && arr instanceof Float32Array;
  };

  var createArray = function(float, length) {
    return float ? new Float32Array(length) : new Uint8Array(length);
  };

  node.getWaveform = function(float) {
    if (!arguments.length) { float = waveFloat; }

    if (needsUpdate(waveform, float)) {
      fftSize = node.fftSize;
      waveFloat = float;
      waveform = createArray(float, fftSize);
    }
    if (float && this.getFloatTimeDomainData) {
      this.getFloatTimeDomainData(waveform);
    } else {
      this.getByteTimeDomainData(waveform);
    }

    return waveform;
  };

  var noteFromPitch =  function( frequency ) {
    var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
    return Math.round( noteNum ) + 69;
  }

  var frequencyFromNoteNumber = function( note ) {
    return 440 * Math.pow(2,(note-69)/12);
  }

  var centsOffFromPitch = function( frequency, note ) {
    return Math.floor( 1200 * Math.log( frequency / frequencyFromNoteNumber( note ))/Math.log(2) );
  }

  node.getPitch = function(callback){
    pitchCallback = pitchCallback || callback;
      var f = new Float32Array(node.fftSize);
      f.set(node.getWaveform(true));
      pitchWorker.postMessage({
      sampleRate: context.sampleRate,
      b: f.buffer
    }, [f.buffer]);
  };

  node.getFrequencies = function(float) {
    if (!arguments.length) { float = freqFloat; }

    if (needsUpdate(frequencies, float)) {
      fftSize = node.fftSize;
      freqFloat = float;
      frequencies = createArray(float, node.frequencyBinCount);
    }

    if (float) {
      this.getFloatFrequencyData(frequencies);
    } else {
      this.getByteFrequencyData(frequencies);
    }

    return frequencies;
  };

  node.getAmplitude = function(callback) {
    amplitudeCallback = amplitudeCallback || callback;
    var f = new Float32Array(node.fftSize);
    f.set(node.getFrequencies(true));
    amplitudeWorker.postMessage({
      sum: 0,
      length: f.byteLength,
      numSamples: node.fftSize / 2,
      b: f.buffer
    }, [f.buffer]);
  };

  node.update = function() {
    node.getWaveform();
    node.getFrequencies();
  };

  Object.defineProperties(node, {
    smoothing: {
      get: function() {
        return node.smoothingTimeConstant;
      },
      set: function(value) { node.smoothingTimeConstant = value; }
    }
  });

  return node;
}

module.exports = Analyser;
},{}],7:[function(require,module,exports){
'use strict';

var validify = require('../utils/validify.js').number;
var n = 22050;

function Distortion(context, amount) {

    amount = validify(amount, 1);

    var node = context.createWaveShaper();
    var curve = new Float32Array(n);

    // create waveShaper distortion curve from 0 to 1
    node.update = function(value) {
        amount = value;
        if(amount <= 0) {
          amount = 0;
          this.curve = null;
          return;
        }
        var k = value * 100,
            // n = 22050,
            // curve = new Float32Array(n),
            deg = Math.PI / 180,
            x;

        for (var i = 0; i < n; i++) {
            x = i * 2 / n - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }

        this.curve = curve;
    };

    Object.defineProperties(node, {
        amount: {
            get: function() { return amount; },
            set: function(value) { this.update(value); }
        }
    });

    if(amount !== undefined) {
        node.update(amount);
    }

    return node;
}

module.exports = Distortion;

},{"../utils/validify.js":30}],8:[function(require,module,exports){
'use strict';

var validify = require('../utils/validify.js').number;

function Echo(context, config) {
    config = config || {};

    var input = context.createGain();
    var delay = context.createDelay();
    var gain = context.createGain();
    var output = context.createGain();

    delay.delayTime.value = validify(config.delayTime, 0.5);
    gain.gain.value = validify(config.feedback, 0.5);

    input.connect(delay);
    input.connect(output);
    delay.connect(gain);
    gain.connect(delay);
    gain.connect(output);

    var node = input;
    node.name = 'Echo';
    node._output = output;

    Object.defineProperties(node, {
        delay: {
            get: function() { return delay.delayTime.value; },
            set: function(value) { delay.delayTime.value = value; }
        },
        feedback: {
            get: function() { return gain.gain.value; },
            set: function(value) { gain.gain.value = value; }
        }
    });

    return node;
}

module.exports = Echo;

},{"../utils/validify.js":30}],9:[function(require,module,exports){
'use strict';

function FakeContext() {

    var startTime = Date.now();

    var fn = function(){};

    var param = function() {
        return {
            value: 1,
            defaultValue: 1,
            linearRampToValueAtTime: fn,
            setValueAtTime: fn,
            exponentialRampToValueAtTime: fn,
            setTargetAtTime: fn,
            setValueCurveAtTime: fn,
            cancelScheduledValues: fn
        };
    };

    var fakeNode = function() {
        return {
            connect:fn,
            disconnect:fn,
            // analyser
            frequencyBinCount: 0,
            smoothingTimeConstant: 0,
            fftSize: 0,
            minDecibels: 0,
            maxDecibels: 0,
            getByteTimeDomainData: fn,
            getByteFrequencyData: fn,
            getFloatTimeDomainData: fn,
            getFloatFrequencyData: fn,
            // gain
            gain: param(),
            // panner
            panningModel: 0,
            setPosition: fn,
            setOrientation: fn,
            setVelocity: fn,
            distanceModel: 0,
            refDistance: 0,
            maxDistance: 0,
            rolloffFactor: 0,
            coneInnerAngle: 360,
            coneOuterAngle: 360,
            coneOuterGain: 0,
            // filter:
            type:0,
            frequency: param(),
            Q: param(),
            detune: param(),
            // delay
            delayTime: param(),
            // convolver
            buffer: 0,
            // compressor
            threshold: param(),
            knee: param(),
            ratio: param(),
            attack: param(),
            release: param(),
            reduction: param(),
            // distortion
            oversample: 0,
            curve: 0,
            // buffer
            sampleRate: 1,
            length: 0,
            duration: 0,
            numberOfChannels: 0,
            getChannelData: function() {
                return [];
            },
            copyFromChannel: fn,
            copyToChannel: fn,
            // listener
            dopplerFactor: 0,
            speedOfSound: 0,
            // osc
            start: fn
        };
    };

    // ie9
    if(!window.Uint8Array) {
        window.Uint8Array = window.Float32Array = Array;
    }

    return {
        createAnalyser: fakeNode,
        createBuffer: fakeNode,
        createBiquadFilter: fakeNode,
        createChannelMerger: fakeNode,
        createChannelSplitter: fakeNode,
        createDynamicsCompressor: fakeNode,
        createConvolver: fakeNode,
        createDelay: fakeNode,
        createGain: fakeNode,
        createOscillator: fakeNode,
        createPanner: fakeNode,
        createScriptProcessor: fakeNode,
        createWaveShaper: fakeNode,
        listener: fakeNode(),
        get currentTime() {
            return (Date.now() - startTime) / 1000;
        }
    };
}

module.exports = FakeContext;

},{}],10:[function(require,module,exports){
'use strict';

// https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
// For lowpass and highpass Q indicates how peaked the frequency is around the cutoff.
// The greater the value is, the greater is the peak

function Filter(context, type, frequency, q, gain) {
    // Frequency between 40Hz and half of the sampling rate
    var minFrequency = 40;
    var maxFrequency = context.sampleRate / 2;

    var node = context.createBiquadFilter();
    node.type = type;

    var getFrequency = function(value) {
        // Logarithm (base 2) to compute how many octaves fall in the range.
        var numberOfOctaves = Math.log(maxFrequency / minFrequency) / Math.LN2;
        // Compute a multiplier from 0 to 1 based on an exponential scale.
        var multiplier = Math.pow(2, numberOfOctaves * (value - 1.0));
        // Get back to the frequency value between min and max.
        return maxFrequency * multiplier;
    };

    node.set = function(frequency, q, gain) {
      if (frequency !== undefined) { node.frequency.value = frequency; }
      if (q !== undefined) { node.Q.value = q; }
      if (gain !== undefined) { node.gain.value = gain; }
      return node;
    };

    // set filter frequency based on value from 0 to 1
    node.setByPercent = function(percent, q, gain) {
        return node.set(getFrequency(percent), q, gain);
    };

    return node.set(frequency, q, gain);
}

module.exports = Filter;

},{}],11:[function(require,module,exports){
'use strict';

var validify = require('../utils/validify.js').number;

function MonoFlanger(context, config) {
    var input = context.createGain();
    var delay = context.createDelay();
    var feedback = context.createGain();
    var lfo = context.createOscillator();
    var gain = context.createGain();
    var output = context.createGain();

    delay.delayTime.value = validify(config.delay, 0.005); // 5-25ms delay (0.005 > 0.025)
    feedback.gain.value = validify(config.feedback, 0.5); // 0 > 1

    lfo.type = 'sine';
    lfo.frequency.value = validify(config.gain, 0.002); // 0.05 > 5
    gain.gain.value = validify(config.frequency, 0.25); // 0.0005 > 0.005

    input.connect(output);
    input.connect(delay);
    delay.connect(output);
    delay.connect(feedback);
    feedback.connect(input);

    lfo.connect(gain);
    gain.connect(delay.delayTime);
    lfo.start(0);

    var node = input;
    node.name = 'Flanger';
    node._output = output;

    Object.defineProperties(node, {
        delay: {
            get: function() { return delay.delayTime.value; },
            set: function(value) { delay.delayTime.value = value; }
        },
        lfoFrequency: {
            get: function() { return lfo.frequency.value; },
            set: function(value) { lfo.frequency.value = value; }
        },
        lfoGain: {
            get: function() { return gain.gain.value; },
            set: function(value) { gain.gain.value = value; }
        },
        feedback: {
            get: function() { return feedback.gain.value; },
            set: function(value) { feedback.gain.value = value; }
        }
    });

    return node;
}

function StereoFlanger(context, config) {
    var input = context.createGain();
    var splitter = context.createChannelSplitter(2);
    var merger = context.createChannelMerger(2);
    var feedbackL = context.createGain();
    var feedbackR = context.createGain();
    var lfo = context.createOscillator();
    var lfoGainL = context.createGain();
    var lfoGainR = context.createGain();
    var delayL = context.createDelay();
    var delayR = context.createDelay();
    var output = context.createGain();

    feedbackL.gain.value = feedbackR.gain.value = validify(config.feedback, 0.5);
    delayL.delayTime.value = delayR.delayTime.value = validify(config.delay, 0.003);

    lfo.type = 'sine';
    lfo.frequency.value = validify(config.frequency, 0.5);
    lfoGainL.gain.value = validify(config.gain, 0.005);
    lfoGainR.gain.value = 0 - lfoGainL.gain.value;

    input.connect(splitter);

    splitter.connect(delayL, 0);
    splitter.connect(delayR, 1);

    delayL.connect(feedbackL);
    delayR.connect(feedbackR);

    feedbackL.connect(delayR);
    feedbackR.connect(delayL);

    delayL.connect(merger, 0, 0);
    delayR.connect(merger, 0, 1);

    merger.connect(output);
    input.connect(output);

    lfo.connect(lfoGainL);
    lfo.connect(lfoGainR);
    lfoGainL.connect(delayL.delayTime);
    lfoGainR.connect(delayR.delayTime);
    lfo.start(0);

    var node = input;
    node.name = 'StereoFlanger';
    node._output = output;

    Object.defineProperties(node, {
        delay: {
            get: function() { return delayL.delayTime.value; },
            set: function(value) { delayL.delayTime.value = delayR.delayTime.value = value; }
        },
        lfoFrequency: {
            get: function() { return lfo.frequency.value; },
            set: function(value) { lfo.frequency.value = value; }
        },
        lfoGain: {
            get: function() { return lfoGainL.gain.value; },
            set: function(value) { lfoGainL.gain.value = lfoGainR.gain.value = value; }
        },
        feedback: {
            get: function() { return feedbackL.gain.value; },
            set: function(value) { feedbackL.gain.value = feedbackR.gain.value = value; }
        }
    });

    return node;
}

function Flanger(context, config) {
    config = config || {};
    return config.stereo ? new StereoFlanger(context, config) : new MonoFlanger(context, config);
}

module.exports = Flanger;

},{"../utils/validify.js":30}],12:[function(require,module,exports){
'use strict';

var validify = require('../utils/validify.js').number;

function Panner(context) {
    var node = context.createPanner();

    // Default for stereo is 'HRTF' can also be 'equalpower'
    node.panningModel = Panner.defaults.panningModel;

    // Distance model and attributes
    // Can be 'linear' 'inverse' 'exponential'
    node.distanceModel = Panner.defaults.distanceModel;
    node.refDistance = Panner.defaults.refDistance;
    node.maxDistance = Panner.defaults.maxDistance;
    node.rolloffFactor = Panner.defaults.rolloffFactor;
    node.coneInnerAngle = Panner.defaults.coneInnerAngle;
    node.coneOuterAngle = Panner.defaults.coneOuterAngle;
    node.coneOuterGain = Panner.defaults.coneOuterGain;
    // set to defaults (needed in Firefox)
    node.setPosition(0, 0, 1);
    node.setOrientation(0, 0, 0);

    // simple vec3 object pool
    var vecPool = {
        pool: [],
        get: function(x, y, z) {
            var v = this.pool.length ? this.pool.pop() : { x: 0, y: 0, z: 0 };
            // check if a vector has been passed in
            if(x !== undefined && isNaN(x) && 'x' in x && 'y' in x && 'z' in x) {
                v.x = validify(x.x);
                v.y = validify(x.y);
                v.z = validify(x.z);
            }
            else {
                v.x = validify(x);
                v.y = validify(y);
                v.z = validify(z);
            }
            return v;
        },
        dispose: function(instance) {
            this.pool.push(instance);
        }
    };

    var globalUp = vecPool.get(0, 1, 0),
        angle45 = Math.PI / 4,
        angle90 = Math.PI / 2;

    // set the orientation of the source (where the audio is coming from)
    var setOrientation = function(node, fw) {
        // calculate up vec ( up = (forward cross (0, 1, 0)) cross forward )
        var up = vecPool.get(fw.x, fw.y, fw.z);
        cross(up, globalUp);
        cross(up, fw);
        normalize(up);
        normalize(fw);
        // set the audio context's listener position to match the camera position
        node.setOrientation(fw.x, fw.y, fw.z, up.x, up.y, up.z);
        // return the vecs to the pool
        vecPool.dispose(fw);
        vecPool.dispose(up);
    };

    var setPosition = function(nodeOrListener, vec) {
        nodeOrListener.setPosition(vec.x, vec.y, vec.z);
        vecPool.dispose(vec);
    };

    // cross product of 2 vectors
    var cross = function ( a, b ) {
        var ax = a.x, ay = a.y, az = a.z;
        var bx = b.x, by = b.y, bz = b.z;
        a.x = ay * bz - az * by;
        a.y = az * bx - ax * bz;
        a.z = ax * by - ay * bx;
    };

    // normalise to unit vector
    var normalize = function (vec3) {
        if(vec3.x === 0 && vec3.y === 0 && vec3.z === 0) {
            return vec3;
        }
        var length = Math.sqrt( vec3.x * vec3.x + vec3.y * vec3.y + vec3.z * vec3.z );
        var invScalar = 1 / length;
        vec3.x *= invScalar;
        vec3.y *= invScalar;
        vec3.z *= invScalar;
        return vec3;
    };

    node.set = function(x, y, z) {
        var v = vecPool.get(x, y, z);

        if(arguments.length === 1 && v.x) {
          // pan left to right with value from -1 to 1
          x = v.x;

          if(x > 1) { x = 1; }
          if(x < -1) { x = -1; }

          // creates a nice curve with z
          x = x * angle45;
          z = x + angle90;

          if (z > angle90) {
              z = Math.PI - z;
          }

          v.x = Math.sin(x);
          v.z = Math.sin(z);
        }
        setPosition(node, v);
    };

    // set the position the audio is coming from)
    node.setSourcePosition = function(x, y, z) {
        setPosition(node, vecPool.get(x, y, z));
    };

    // set the direction the audio is coming from)
    node.setSourceOrientation = function(x, y, z) {
        setOrientation(node, vecPool.get(x, y, z));
    };

    // set the position of who or what is hearing the audio (could be camera or some character)
    node.setListenerPosition = function(x, y, z) {
        setPosition(context.listener, vecPool.get(x, y, z));
    };

    // set the position of who or what is hearing the audio (could be camera or some character)
    node.setListenerOrientation = function(x, y, z) {
        setOrientation(context.listener, vecPool.get(x, y, z));
    };

    node.getDefaults = function() {
        return Panner.defaults;
    };

    node.setDefaults = function(defaults) {
        Object.keys(defaults).forEach(function(key) {
            Panner.defaults[key] = defaults[key];
        });
    };

    return node;
}

Panner.defaults = {
    panningModel: 'HRTF',
    distanceModel: 'linear',
    refDistance: 1,
    maxDistance: 1000,
    rolloffFactor: 1,
    coneInnerAngle: 360,
    coneOuterAngle: 0,
    coneOuterGain: 0
};

module.exports = Panner;

},{"../utils/validify.js":30}],13:[function(require,module,exports){
'use strict';

var validify = require('../utils/validify.js').number;

function Phaser(context, config) {
    config = config || {};
    var stages = validify(config.stages, 8),
        filters = [],
        filter;

    var input = context.createGain();
    var feedback = context.createGain();
    var lfo = context.createOscillator();
    var lfoGain = context.createGain();
    var output = context.createGain();

    feedback.gain.value = validify(config.feedback, 0.5);

    lfo.type = 'sine';
    lfo.frequency.value = validify(config.frequency, 0.5);
    lfoGain.gain.value = validify(config.gain, 300);

    for (var i = 0; i < stages; i++) {
        filter = context.createBiquadFilter();
        filter.type = 'allpass';
        filter.frequency.value = 1000 * i;
        //filter.Q.value = 10;
        if(i > 0) {
            filters[i-1].connect(filter);
        }
        lfoGain.connect(filter.frequency);

        filters.push(filter);
    }

    var first = filters[0];
    var last = filters[filters.length - 1];

    input.connect(first);
    input.connect(output);
    last.connect(output);
    last.connect(feedback);
    feedback.connect(first);
    lfo.connect(lfoGain);
    lfo.start(0);

    var node = input;
    node.name = 'Phaser';
    node._output = output;

    Object.defineProperties(node, {
        lfoFrequency: {
            get: function() { return lfo.frequency.value; },
            set: function(value) { lfo.frequency.value = value; }
        },
        lfoGain: {
            get: function() { return lfoGain.gain.value; },
            set: function(value) { lfoGain.gain.value = value; }
        },
        feedback: {
            get: function() { return feedback.gain.value; },
            set: function(value) { feedback.gain.value = value; }
        }
    });

    return node;
}

module.exports = Phaser;

},{"../utils/validify.js":30}],14:[function(require,module,exports){
'use strict';

function Recorder(context, passThrough) {
    var bufferLength = 4096,
        buffersL = [],
        buffersR = [],
        startedAt = 0,
        stoppedAt = 0;

    var input = context.createGain();
    var output = context.createGain();
    var script;

    var node = input;
    node.name = 'Recorder';
    node._output = output;

    node.isRecording = false;

    var getBuffer = function() {
        if(!buffersL.length) {
            return context.createBuffer(2, bufferLength, context.sampleRate);
        }
        var recordingLength = buffersL.length * bufferLength;
        var buffer = context.createBuffer(2, recordingLength, context.sampleRate);
        buffer.getChannelData(0).set(mergeBuffers(buffersL, recordingLength));
        buffer.getChannelData(1).set(mergeBuffers(buffersR, recordingLength));
        return buffer;
    };

    var mergeBuffers = function(buffers, length) {
        var buffer = new Float32Array(length);
        var offset = 0;
        for (var i = 0; i < buffers.length; i++) {
          buffer.set(buffers[i], offset);
          offset += buffers[i].length;
        }
        return buffer;
    };

    var createScriptProcessor = function() {
      destroyScriptProcessor();

      script = context.createScriptProcessor(bufferLength, 2, 2);
      input.connect(script);
      script.connect(context.destination);
      script.connect(output);

      script.onaudioprocess = function (event) {
          var inputL = event.inputBuffer.getChannelData(0),
              inputR = event.inputBuffer.getChannelData(1);

          if(passThrough) {
              var outputL = event.outputBuffer.getChannelData(0),
                  outputR = event.outputBuffer.getChannelData(1);
              outputL.set(inputL);
              outputR.set(inputR);
          }

          if(node.isRecording) {
              buffersL.push(new Float32Array(inputL));
              buffersR.push(new Float32Array(inputR));
          }
      };
    };

    var destroyScriptProcessor = function() {
      if (script) {
        script.onaudioprocess = null;
        input.disconnect();
        script.disconnect();
      }
    };

    node.start = function() {
        createScriptProcessor();
        buffersL.length = 0;
        buffersR.length = 0;
        startedAt = context.currentTime;
        stoppedAt = 0;
        this.isRecording = true;
    };

    node.stop = function() {
        stoppedAt = context.currentTime;
        this.isRecording = false;
        destroyScriptProcessor();
        return getBuffer();
    };

    node.getDuration = function() {
        if(!this.isRecording) {
            return stoppedAt - startedAt;
        }
        return context.currentTime - startedAt;
    };

    return node;
}

module.exports = Recorder;

},{}],15:[function(require,module,exports){
'use strict';

var validify = require('../utils/validify.js').number;

function Reverb(context, config) {
    config = config || {};

    var time = validify(config.time, 1),
        decay = validify(config.decay, 5),
        reverse = !!config.reverse,
        rate = context.sampleRate,
        length,
        impulseResponse;

    var input = context.createGain();
    var reverb = context.createConvolver();
    var output = context.createGain();

    input.connect(reverb);
    input.connect(output);
    reverb.connect(output);

    var node = input;
    node.name = 'Reverb';
    node._output = output;

    node.update = function(opt) {
        if(opt.time !== undefined) {
            time = opt.time;
            length = Math.floor(rate * time);
            impulseResponse = length ? context.createBuffer(2, length, rate) : null;
        }
        if(opt.decay !== undefined) {
            decay = opt.decay;
        }
        if(opt.reverse !== undefined) {
            reverse = opt.reverse;
        }

        if(!impulseResponse) {
          reverb.buffer = null;
          return;
        }

        var left = impulseResponse.getChannelData(0),
            right = impulseResponse.getChannelData(1),
            n, e;

        for (var i = 0; i < length; i++) {
            n = reverse ? length - i : i;
            e = Math.pow(1 - n / length, decay);
            left[i] = (Math.random() * 2 - 1) * e;
            right[i] = (Math.random() * 2 - 1) * e;
        }

        reverb.buffer = impulseResponse;
    };

    node.update({
        time: time,
        decay: decay,
        reverse: reverse
    });

    Object.defineProperties(node, {
        time: {
            get: function() { return time; },
            set: function(value) {
                console.log.call(console, '1 set time:', value);
                if(value === time) { return; }
                this.update({time: value});
            }
        },
        decay: {
            get: function() { return decay; },
            set: function(value) {
                if(value === decay) { return; }
                this.update({decay: value});
            }
        },
        reverse: {
            get: function() { return reverse; },
            set: function(value) {
                if(value === reverse) { return; }
                this.update({reverse: !!value});
            }
        }
    });

    return node;
}

module.exports = Reverb;

},{"../utils/validify.js":30}],16:[function(require,module,exports){
'use strict';

var Effect = require('./effect.js');

function Group(context, destination) {
    var sounds = [],
        effect = new Effect(context),
        gain = effect.gain(),
        preMuteVolume = 1,
        group;

    if(context) {
        effect.setSource(gain);
        effect.setDestination(destination || context.destination);
    }

    /*
     * Add / remove
     */

    var add = function(sound) {
        sound.gain.disconnect();
        sound.gain.connect(gain);

        sounds.push(sound);

        sound.once('destroy', remove);

        return group;
    };

    var find = function(soundOrId, callback) {
        var found;

        if(!soundOrId && soundOrId !== 0) {
            return found;
        }

        sounds.some(function(sound) {
            if(sound === soundOrId || sound.id === soundOrId) {
                found = sound;
                return true;
            }
        });

        if(found && callback) {
            callback(found);
        }

        return found;
    };

    var remove = function(soundOrId) {
        find(soundOrId, function(sound) {
            sounds.splice(sounds.indexOf(sound), 1);
        });
        return group;
    };

    /*
     * Controls
     */

    var play = function(delay, offset) {
        sounds.forEach(function(sound) {
            sound.play(delay, offset);
        });
        return group;
    };

    var pause = function() {
        sounds.forEach(function(sound) {
            if(sound.playing) {
                sound.pause();
            }
        });
        return group;
    };

    var resume = function() {
        sounds.forEach(function(sound) {
            if(sound.paused) {
                sound.play();
            }
        });
        return group;
    };

    var stop = function() {
        sounds.forEach(function(sound) {
            sound.stop();
        });
        return group;
    };

    var seek = function(percent) {
        sounds.forEach(function(sound) {
            sound.seek(percent);
        });
        return group;
    };

    var mute = function() {
        preMuteVolume = group.volume;
        group.volume = 0;
        return group;
    };

    var unMute = function() {
        group.volume = preMuteVolume || 1;
        return group;
    };

    var setVolume = function(value) {
        group.volume = value;
        return group;
    };

    var fade = function(volume, duration) {
        if(context) {
            var param = gain.gain;
            var time = context.currentTime;

            param.cancelScheduledValues(time);
            param.setValueAtTime(param.value, time);
            // param.setValueAtTime(volume, time + duration);
            param.linearRampToValueAtTime(volume, time + duration);
            // param.setTargetAtTime(volume, time, duration);
            // param.exponentialRampToValueAtTime(Math.max(volume, 0.0001), time + duration);
        }
        else {
            sounds.forEach(function(sound) {
                sound.fade(volume, duration);
            });
        }

        return group;
    };

    /*
     * Destroy
     */

    var destroy = function() {
        while(sounds.length) {
            sounds.pop().destroy();
        }
    };

    /*
     * Api
     */

    group = {
        add: add,
        find: find,
        remove: remove,
        play: play,
        pause: pause,
        resume: resume,
        stop: stop,
        seek: seek,
        setVolume: setVolume,
        mute: mute,
        unMute: unMute,
        fade: fade,
        destroy: destroy
    };

    /*
     * Getters & Setters
     */

    Object.defineProperties(group, {
        effect: {
            value: effect
        },
        gain: {
            value: gain
        },
        sounds: {
            value: sounds
        },
        volume: {
            get: function() {
                return gain.gain.value;
            },
            set: function(value) {
                if(isNaN(value)) { return; }

                if(context) {
                    gain.gain.cancelScheduledValues(context.currentTime);
                    gain.gain.value = value;
                    gain.gain.setValueAtTime(value, context.currentTime);
                }
                else {
                    gain.gain.value = value;
                }
                sounds.forEach(function(sound) {
                    if (!sound.context) {
                        sound.groupVolume = value;
                    }
                });
            }
        }
    });

    return group;
}

module.exports = Group;

},{"./effect.js":5}],17:[function(require,module,exports){
'use strict';

var BufferSource = require('./source/buffer-source.js'),
    Effect = require('./effect.js'),
    Emitter = require('./utils/emitter.js'),
    file = require('./utils/file.js'),
    Loader = require('./utils/loader.js'),
    MediaSource = require('./source/media-source.js'),
    MicrophoneSource = require('./source/microphone-source.js'),
    OscillatorSource = require('./source/oscillator-source.js'),
    ScriptSource = require('./source/script-source.js'),
    waveform = require('./utils/waveform.js')();

function Sound(context, destination) {
    var id,
        data,
        effect = new Effect(context),
        gain = effect.gain(),
        isTouchLocked = false,
        loader,
        loop = false,
        playbackRate = 1,
        playWhenReady,
        source,
        sound;

    if(context) {
        effect.setDestination(gain);
        gain.connect(destination || context.destination);
    }

    /*
     * Load
     */

    var load = function(config) {
        var src = file.getSupportedFile(config.src || config.url || config);

        if(source && data && data.tagName) {
            source.load(src);
        }
        else {
            loader = loader || new Loader(src);
            loader.audioContext = !!config.asMediaElement ? null : context;
            loader.isTouchLocked = isTouchLocked;
            loader.once('loaded', function(file) {
                createSource(file);
                sound.emit('loaded', sound);
            });
        }
        return sound;
    };

    /*
     * Controls
     */

    var play = function(delay, offset) {
        if(!source || isTouchLocked) {
            playWhenReady = function() {
                if (source) {
                    play(delay, offset);
                }
            };
            return sound;
        }
        playWhenReady = null;
        effect.setSource(source.sourceNode);

        // update volume needed for no webaudio
        if(!context) { sound.volume = gain.gain.value; }

        source.play(delay, offset);

        if(source.hasOwnProperty('loop')) {
            source.loop = loop;
        }

        sound.emit('play', sound);

        return sound;
    };

    var pause = function() {
        source && source.pause();
        sound.emit('pause', sound);
        return sound;
    };

    var stop = function(delay) {
        source && source.stop(delay || 0);
        sound.emit('stop', sound);
        return sound;
    };

    var seek = function(percent) {
        if(source) {
            source.stop();
            play(0, source.duration * percent);
        }
        return sound;
    };

    var fade = function(volume, duration) {
        if(!source) { return sound; }

        var param = gain.gain;

        if(context) {
            var time = context.currentTime;
            param.cancelScheduledValues(time);
            param.setValueAtTime(param.value, time);
            param.linearRampToValueAtTime(volume, time + duration);
        }
        else if(typeof source.fade === 'function') {
            source.fade(volume, duration);
            param.value = volume;
        }

        return sound;
    };

    /*
     * Destroy
     */

    var destroy = function() {
        source && source.destroy();
        effect && effect.destroy();
        gain && gain.disconnect();
        loader && loader.destroy();
        sound.off('loaded');
        sound.off('ended');
        gain = null;
        context = null;
        data = null;
        playWhenReady = null;
        source = null;
        effect = null;
        loader = null;
        sound.emit('destroy', sound);
        sound.off('destroy');
    };

    /*
     * Create source
     */

    var createSource = function(value) {
        data = value;

        if(file.isAudioBuffer(data)) {
            source = new BufferSource(data, context, function() {
                sound.emit('ended', sound);
            });
        }
        else if(file.isMediaElement(data)) {
            source = new MediaSource(data, context, function() {
                sound.emit('ended', sound);
            });
        }
        else if(file.isMediaStream(data)) {
            source = new MicrophoneSource(data, context);
        }
        else if(file.isOscillatorType((data && data.type) || data)) {
            source = new OscillatorSource(data.type || data, context);
        }
        else if(file.isScriptConfig(data)) {
            source = new ScriptSource(data, context);
        }
        else {
            throw new Error('Cannot detect data type: ' + data);
        }

        effect.setSource(source.sourceNode);

        sound.emit('ready', sound);

        if(playWhenReady) {
            playWhenReady();
        }
    };

    sound = Object.create(Emitter.prototype, {
        _events: {
            value: {}
        },
        constructor: {
            value: Sound
        },
        play: {
            value: play
        },
        pause: {
            value: pause
        },
        load: {
            value: load
        },
        seek: {
            value: seek
        },
        stop: {
            value: stop
        },
        fade: {
            value: fade
        },
        destroy: {
            value: destroy
        },
        context: {
            value: context
        },
        currentTime: {
            get: function() {
                return source ? source.currentTime : 0;
            },
            set: function(value) {
                // var silent = sound.playing;
                source && source.stop();
                // play(0, value, silent);
                play(0, value);
            }
        },
        data: {
            get: function() {
                return data;
            },
            set : function(value) {
                if(!value) { return; }
                createSource(value);
            }
        },
        duration: {
            get: function() {
                return source ? source.duration : 0;
            }
        },
        effect: {
            value: effect
        },
        ended: {
            get: function() {
                return !!source && source.ended;
            }
        },
        frequency: {
            get: function() {
                return source ? source.frequency : 0;
            },
            set: function(value) {
                if(source && source.hasOwnProperty('frequency')) {
                    source.frequency = value;
                }
            }
        },
        gain: {
            value: gain
        },
        id: {
            get: function() {
                return id;
            },
            set: function(value) {
                id = value;
            }
        },
        isTouchLocked: {
            set: function(value) {
                isTouchLocked = value;
                if(loader) {
                    loader.isTouchLocked = value;
                }
                if(!value && playWhenReady) {
                    playWhenReady();
                }
            }
        },
        loader: {
            get: function() {
                return loader;
            }
        },
        loop: {
            get: function() {
                return loop;
            },
            set: function(value) {
                loop = !!value;

                if(source && source.hasOwnProperty('loop') && source.loop !== loop) {
                  source.loop = loop;
                }
            }
        },
        paused: {
            get: function() {
                return !!source && source.paused;
            }
        },
        playing: {
            get: function() {
                return !!source && source.playing;
            }
        },
        playbackRate: {
            get: function() {
                return playbackRate;
            },
            set: function(value) {
                playbackRate = value;
                if(source) {
                  source.playbackRate = playbackRate;
                }
            }
        },
        progress: {
            get: function() {
                return source ? source.progress : 0;
            }
        },
        sourceNode: {
            get:function() {
                return source ? source.sourceNode : undefined;
            }
        },
        volume: {
            get: function() {
                if(context) {
                    return gain.gain.value;
                }
                if(source && source.hasOwnProperty('volume')) {
                    return source.volume;
                }
                return 1;
            },
            set: function(value) {
                if(isNaN(value)) { return; }

                var param = gain.gain;

                if(context) {
                    var time = context.currentTime;
                    param.cancelScheduledValues(time);
                    param.value = value;
                    param.setValueAtTime(value, time);
                }
                else {
                    param.value = value;

                    if(source && source.hasOwnProperty('volume')) {
                        source.volume = value;
                    }
                }
            }
        },
        // for media element source
        groupVolume: {
            get: function() {
                return source.groupVolume;
            },
            set: function(value) {
                if(source && source.hasOwnProperty('groupVolume')) {
                    source.groupVolume = value;
                }
            }
        },
        waveform: {
            value: function(length) {
                if(!data) {
                    sound.once('ready', function() {
                        waveform(data, length);
                    });
                }
                return waveform(data, length);
            }
        },
        userData: {
            value: {}
        }
    });

    return Object.freeze(sound);
}

module.exports = Sound;

},{"./effect.js":5,"./source/buffer-source.js":18,"./source/media-source.js":19,"./source/microphone-source.js":20,"./source/oscillator-source.js":21,"./source/script-source.js":22,"./utils/emitter.js":24,"./utils/file.js":25,"./utils/loader.js":26,"./utils/waveform.js":31}],18:[function(require,module,exports){
'use strict';

function BufferSource(buffer, context, onEnded) {
    var ended = false,
        endedCallback = onEnded,
        loop = false,
        paused = false,
        pausedAt = 0,
        playbackRate = 1,
        playing = false,
        sourceNode = null,
        startedAt = 0,
        api = {};

    var createSourceNode = function() {
        if(!sourceNode && context) {
            sourceNode = context.createBufferSource();
            sourceNode.buffer = buffer;
        }
        return sourceNode;
    };

    /*
     * Controls
     */

    var play = function(delay, offset) {
        if(playing) { return; }

        delay = delay ? context.currentTime + delay : 0;
        offset = offset || 0;
        if(offset) { pausedAt = 0; }
        if(pausedAt) { offset = pausedAt; }
        while(offset > api.duration) { offset = offset % api.duration; }

        createSourceNode();
        sourceNode.onended = endedHandler;
        sourceNode.start(delay, offset);

        sourceNode.loop = loop;
        sourceNode.playbackRate.value = playbackRate;

        startedAt = context.currentTime - offset;
        ended = false;
        paused = false;
        pausedAt = 0;
        playing = true;
    };

    var pause = function() {
        var elapsed = context.currentTime - startedAt;
        stop();
        pausedAt = elapsed;
        playing = false;
        paused = true;
    };

    var stop = function() {
        if(sourceNode) {
            sourceNode.onended = null;
            try {
                sourceNode.disconnect();
                sourceNode.stop(0);
            } catch(e) {}
            sourceNode = null;
        }

        paused = false;
        pausedAt = 0;
        playing = false;
        startedAt = 0;
    };

    /*
     * Ended handler
     */

    var endedHandler = function() {
        stop();
        ended = true;
        if(typeof endedCallback === 'function') {
            endedCallback(api);
        }
    };

    /*
     * Destroy
     */

    var destroy = function() {
        stop();
        buffer = null;
        context = null;
        endedCallback = null;
        sourceNode = null;
    };

    /*
     * Getters & Setters
     */

    Object.defineProperties(api, {
        play: {
            value: play
        },
        pause: {
            value: pause
        },
        stop: {
            value: stop
        },
        destroy: {
            value: destroy
        },
        currentTime: {
            get: function() {
                if(pausedAt) {
                    return pausedAt;
                }
                if(startedAt) {
                    var time = context.currentTime - startedAt;
                    if(time > api.duration) {
                        time = time % api.duration;
                    }
                    return time;
                }
                return 0;
            }
        },
        duration: {
            get: function() {
                return buffer ? buffer.duration : 0;
            }
        },
        ended: {
            get: function() {
                return ended;
            }
        },
        loop: {
            get: function() {
                return loop;
            },
            set: function(value) {
                loop = !!value;
                if(sourceNode) {
                    sourceNode.loop = loop;
                }
            }
        },
        paused: {
            get: function() {
                return paused;
            }
        },
        playbackRate: {
            get: function() {
                return playbackRate;
            },
            set: function(value) {
                playbackRate = value;
                if(sourceNode) {
                    sourceNode.playbackRate.value = playbackRate;
                }
            }
        },
        playing: {
            get: function() {
                return playing;
            }
        },
        progress: {
            get: function() {
                return api.duration ? api.currentTime / api.duration : 0;
            }
        },
        sourceNode: {
            get: function() {
                return createSourceNode();
            }
        }
    });

    return Object.freeze(api);
}

module.exports = BufferSource;

},{}],19:[function(require,module,exports){
'use strict';

function MediaSource(el, context, onEnded) {
    var ended = false,
        endedCallback = onEnded,
        delayTimeout,
        fadeTimeout,
        loop = false,
        paused = false,
        playbackRate = 1,
        playing = false,
        sourceNode = null,
        groupVolume = 1,
        volume = 1,
        api = {};

    var createSourceNode = function() {
        if(!sourceNode && context) {
            sourceNode = context.createMediaElementSource(el);
        }
        return sourceNode;
    };

    /*
     * Load
     */

    var load = function(url) {
        el.src = url;
        el.load();
        ended = false;
        paused = false;
        playing = false;
    };

    /*
     * Controls
     */

    var play = function(delay, offset) {
        clearTimeout(delayTimeout);

        el.volume = volume * groupVolume;
        el.playbackRate = playbackRate;

        if(offset) {
            el.currentTime = offset;
        }

        if(delay) {
            delayTimeout = setTimeout(play, delay);
        }
        else {
            // el.load();
            el.play();
        }

        ended = false;
        paused = false;
        playing = true;

        el.removeEventListener('ended', endedHandler);
        el.addEventListener('ended', endedHandler, false);

        if(el.readyState < 4) {
            el.removeEventListener('canplaythrough', readyHandler);
            el.addEventListener('canplaythrough', readyHandler, false);
            el.load();
            el.play();
        }
    };

    var readyHandler = function() {
        el.removeEventListener('canplaythrough', readyHandler);
        if(playing) {
            el.play();
        }
    };

    var pause = function() {
        clearTimeout(delayTimeout);

        if(!el) { return; }

        el.pause();
        playing = false;
        paused = true;
    };

    var stop = function() {
        clearTimeout(delayTimeout);

        if(!el) { return; }

        el.pause();

        try {
            el.currentTime = 0;
            // fixes bug where server doesn't support seek:
            if(el.currentTime > 0) { el.load(); }
        } catch(e) {}

        playing = false;
        paused = false;
    };

    /*
     * Fade for no webaudio
     */

    var fade = function(toVolume, duration) {
        if(context) { return api; }

        function ramp(value, step) {
            fadeTimeout = setTimeout(function() {
                api.volume = api.volume + ( value - api.volume ) * 0.2;
                if(Math.abs(api.volume - value) > 0.05) {
                    return ramp(value, step);
                }
                api.volume = value;
            }, step * 1000);
        }

        window.clearTimeout(fadeTimeout);
        ramp(toVolume, duration / 10);

        return api;
    };

    /*
     * Ended handler
     */

    var endedHandler = function() {
        ended = true;
        paused = false;
        playing = false;

        if(loop) {
            el.currentTime = 0;
            // fixes bug where server doesn't support seek:
            if(el.currentTime > 0) { el.load(); }
            play();
        } else if(typeof endedCallback === 'function') {
            endedCallback(api);
        }
    };

    /*
     * Destroy
     */

    var destroy = function() {
        el.removeEventListener('ended', endedHandler);
        el.removeEventListener('canplaythrough', readyHandler);
        stop();
        el = null;
        context = null;
        endedCallback = null;
        sourceNode = null;
    };

    /*
     * Getters & Setters
     */

    Object.defineProperties(api, {
        play: {
            value: play
        },
        pause: {
            value: pause
        },
        stop: {
            value: stop
        },
        load: {
            value: load
        },
        fade: {
            value: fade
        },
        destroy: {
            value: destroy
        },
        currentTime: {
            get: function() {
                return el ? el.currentTime : 0;
            }
        },
        duration: {
            get: function() {
                return el ? el.duration : 0;
            }
        },
        ended: {
            get: function() {
                return ended;
            }
        },
        loop: {
            get: function() {
                return loop;
            },
            set: function(value) {
                loop = !!value;
            }
        },
        paused: {
            get: function() {
                return paused;
            }
        },
        playbackRate: {
            get: function() {
                return playbackRate;
            },
            set: function(value) {
                playbackRate = value;
                if(el) {
                    el.playbackRate = playbackRate;
                }
            }
        },
        playing: {
            get: function() {
                return playing;
            }
        },
        progress: {
            get: function() {
                return el && el.duration ? el.currentTime / el.duration : 0;
            }
        },
        sourceNode: {
            get: function() {
                return createSourceNode();
            }
        },
        volume: {
            get: function() {
                return volume;
            },
            set: function(value) {
                window.clearTimeout(fadeTimeout);
                volume = value;
                if(el) {
                    el.volume = volume * groupVolume;
                }
            }
        },
        groupVolume: {
            get: function() {
                return groupVolume;
            },
            set: function(value) {
                groupVolume = value;
                if(el) {
                    el.volume = volume * groupVolume;
                }
            }
        }
    });

    return Object.freeze(api);
}

module.exports = MediaSource;

},{}],20:[function(require,module,exports){
'use strict';

function MicrophoneSource(stream, context) {
    var ended = false,
        paused = false,
        pausedAt = 0,
        playing = false,
        sourceNode = null, // MicrophoneSourceNode
        startedAt = 0;

    var createSourceNode = function() {
        if(!sourceNode && context) {
            sourceNode = context.createMediaStreamSource(stream);
            // HACK: stops moz garbage collection killing the stream
            // see https://support.mozilla.org/en-US/questions/984179
            if(navigator.mozGetUserMedia) {
                window.mozHack = sourceNode;
            }
        }
        return sourceNode;
    };

    /*
     * Controls
     */

    var play = function(delay) {
        delay = delay ? context.currentTime + delay : 0;

        createSourceNode();
        sourceNode.start(delay);

        startedAt = context.currentTime - pausedAt;
        ended = false;
        playing = true;
        paused = false;
        pausedAt = 0;
    };

    var pause = function() {
        var elapsed = context.currentTime - startedAt;
        stop();
        pausedAt = elapsed;
        playing = false;
        paused = true;
    };

    var stop = function() {
        if(sourceNode) {
            try {
                sourceNode.stop(0);
            } catch(e) {}
            sourceNode = null;
        }
        ended = true;
        paused = false;
        pausedAt = 0;
        playing = false;
        startedAt = 0;
    };

    /*
     * Destroy
     */

    var destroy = function() {
        stop();
        context = null;
        sourceNode = null;
        stream = null;
        window.mozHack = null;
    };

    /*
     * Api
     */

    var api = {
        play: play,
        pause: pause,
        stop: stop,
        destroy: destroy,

        duration: 0,
        progress: 0
    };

    /*
     * Getters & Setters
     */

    Object.defineProperties(api, {
        currentTime: {
            get: function() {
                if(pausedAt) {
                    return pausedAt;
                }
                if(startedAt) {
                    return context.currentTime - startedAt;
                }
                return 0;
            }
        },
        ended: {
            get: function() {
                return ended;
            }
        },
        paused: {
            get: function() {
                return paused;
            }
        },
        playing: {
            get: function() {
                return playing;
            }
        },
        sourceNode: {
            get: function() {
                return createSourceNode();
            }
        }
    });

    return Object.freeze(api);
}

module.exports = MicrophoneSource;

},{}],21:[function(require,module,exports){
'use strict';

function OscillatorSource(type, context) {
    var ended = false,
        paused = false,
        pausedAt = 0,
        playing = false,
        sourceNode = null, // OscillatorSourceNode
        startedAt = 0,
        frequency = 200,
        api;

    var createSourceNode = function() {
        if(!sourceNode && context) {
            sourceNode = context.createOscillator();
            sourceNode.type = type;
            sourceNode.frequency.value = frequency;
        }
        return sourceNode;
    };

    /*
     * Controls
     */

    var play = function(delay) {
        delay = delay || 0;
        if(delay) { delay = context.currentTime + delay; }

        createSourceNode();
        sourceNode.start(delay);

        if(pausedAt) {
            startedAt = context.currentTime - pausedAt;
        }
        else {
            startedAt = context.currentTime;
        }

        ended = false;
        playing = true;
        paused = false;
        pausedAt = 0;
    };

    var pause = function() {
        var elapsed = context.currentTime - startedAt;
        this.stop();
        pausedAt = elapsed;
        playing = false;
        paused = true;
    };

    var stop = function() {
        if(sourceNode) {
            try {
                sourceNode.stop(0);
            } catch(e) {}
            sourceNode = null;
        }
        ended = true;
        paused = false;
        pausedAt = 0;
        playing = false;
        startedAt = 0;
    };

    /*
     * Destroy
     */

    var destroy = function() {
        this.stop();
        context = null;
        sourceNode = null;
    };

    /*
     * Api
     */

    api = {
        play: play,
        pause: pause,
        stop: stop,
        destroy: destroy
    };

    /*
     * Getters & Setters
     */

    Object.defineProperties(api, {
        currentTime: {
            get: function() {
                if(pausedAt) {
                    return pausedAt;
                }
                if(startedAt) {
                    return context.currentTime - startedAt;
                }
                return 0;
            }
        },
        duration: {
            value: 0
        },
        ended: {
            get: function() {
                return ended;
            }
        },
        frequency: {
            get: function() {
                return frequency;
            },
            set: function(value) {
                frequency = value;
                if(sourceNode) {
                    sourceNode.frequency.value = value;
                }
            }
        },
        paused: {
            get: function() {
                return paused;
            }
        },
        playing: {
            get: function() {
                return playing;
            }
        },
        progress: {
            value: 0
        },
        sourceNode: {
            get: function() {
                return createSourceNode();
            }
        }
    });

    return Object.freeze(api);
}

module.exports = OscillatorSource;

},{}],22:[function(require,module,exports){
'use strict';

function ScriptSource(data, context) {
    var bufferSize = data.bufferSize || 1024,
        channels = data.channels || 1,
        ended = false,
        onProcess = data.callback.bind(data.thisArg || this),
        paused = false,
        pausedAt = 0,
        playing = false,
        sourceNode = null, // ScriptSourceNode
        startedAt = 0,
        api;

    var createSourceNode = function() {
        if(!sourceNode && context) {
            sourceNode = context.createScriptProcessor(bufferSize, 0, channels);
        }
        return sourceNode;
    };

    /*
     * Controls
     */

    var play = function(delay) {
        delay = delay ? context.currentTime + delay : 0;

        createSourceNode();
        sourceNode.onaudioprocess = onProcess;

        startedAt = context.currentTime - pausedAt;
        ended = false;
        paused = false;
        pausedAt = 0;
        playing = true;
    };

    var pause = function() {
        var elapsed = context.currentTime - startedAt;
        this.stop();
        pausedAt = elapsed;
        playing = false;
        paused = true;
    };

    var stop = function() {
        if(sourceNode) {
            sourceNode.onaudioprocess = onPaused;
        }
        ended = true;
        paused = false;
        pausedAt = 0;
        playing = false;
        startedAt = 0;
    };

    var onPaused = function(event) {
        var buffer = event.outputBuffer;
        for (var i = 0; i < buffer.numberOfChannels; i++) {
            var channel = buffer.getChannelData(i);
            for (var j = 0; j < channel.length; j++) {
                channel[j] = 0;
            }
        }
    };

    /*
     * Destroy
     */

    var destroy = function() {
        this.stop();
        context = null;
        onProcess = null;
        sourceNode = null;
    };

    /*
     * Api
     */

    api = {
        play: play,
        pause: pause,
        stop: stop,
        destroy: destroy,

        duration: 0,
        progress: 0
    };

    /*
     * Getters & Setters
     */

    Object.defineProperties(api, {
        currentTime: {
            get: function() {
                if(pausedAt) {
                    return pausedAt;
                }
                if(startedAt) {
                    return context.currentTime - startedAt;
                }
                return 0;
            }
        },
        ended: {
            get: function() {
                return ended;
            }
        },
        paused: {
            get: function() {
                return paused;
            }
        },
        playing: {
            get: function() {
                return playing;
            }
        },
        sourceNode: {
            get: function() {
                return createSourceNode();
            }
        }
    });

    return Object.freeze(api);
}

module.exports = ScriptSource;

},{}],23:[function(require,module,exports){
'use strict';

var browser = {};

browser.handlePageVisibility = function(onHidden, onShown) {
    var hidden,
        visibilityChange;

    if (typeof document.hidden !== 'undefined') {
        hidden = 'hidden';
        visibilityChange = 'visibilitychange';
    }
    else if (typeof document.mozHidden !== 'undefined') {
        hidden = 'mozHidden';
        visibilityChange = 'mozvisibilitychange';
    }
    else if (typeof document.msHidden !== 'undefined') {
        hidden = 'msHidden';
        visibilityChange = 'msvisibilitychange';
    }
    else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
    }

    function onChange() {
        if (document[hidden]) {
            onHidden();
        }
        else {
            onShown();
        }
    }

    if(visibilityChange !== undefined) {
        document.addEventListener(visibilityChange, onChange, false);
    }
};

browser.handleTouchLock = function(context, onUnlock) {
    var ua = navigator.userAgent,
        locked = !!ua.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|SymbianOS/i);

    var unlock = function() {
        if (context && context.state === 'suspended') {
            context.resume().then(function() {
                var buffer = context.createBuffer(1, 1, 22050);
                var source = context.createBufferSource();
                source.buffer = buffer;
                source.connect(context.destination);
                source.start(0);
                source.stop(0);
                source.disconnect();

                document.body.removeEventListener('touchend', unlock);
                onUnlock();
            });
        } else {
            document.body.removeEventListener('touchend', unlock);
            onUnlock();
        }
    };

    if (locked) {
        document.body.addEventListener('touchend', unlock, false);
    }

    return locked;
};

module.exports = browser;

},{}],24:[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;

function Emitter() {
    EventEmitter.call(this);
    this.setMaxListeners(20);
}

Emitter.prototype = Object.create(EventEmitter.prototype);
Emitter.prototype.constructor = Emitter;

Emitter.prototype.off = function(type, listener) {
    if (listener) {
        return this.removeListener(type, listener);
    }
    if (type) {
        return this.removeAllListeners(type);
    }
    return this.removeAllListeners();
};

module.exports = Emitter;

},{"events":1}],25:[function(require,module,exports){
'use strict';

var File = {
    extensions: [],
    canPlay: {}
};

/*
 * Initial tests
 */

var tests = [
    { ext: 'ogg', type: 'audio/ogg; codecs="vorbis"' },
    { ext: 'mp3', type: 'audio/mpeg;' },
    { ext: 'opus', type: 'audio/ogg; codecs="opus"' },
    { ext: 'wav', type: 'audio/wav; codecs="1"' },
    { ext: 'm4a', type: 'audio/x-m4a;' },
    { ext: 'm4a', type: 'audio/aac;' }
];

var el = document.createElement('audio');
if(el) {
    tests.forEach(function(test) {
        var canPlayType = !!el.canPlayType(test.type);
        if(canPlayType && File.extensions.indexOf(test.ext) === -1) {
            File.extensions.push(test.ext);
        }
        File.canPlay[test.ext] = canPlayType;
    });
    el = null;
}

/*
 * find a supported file
 */

File.getFileExtension = function(url) {
    // from DataURL
    if(url.slice(0, 5) === 'data:') {
        var match = url.match(/data:audio\/(ogg|mp3|opus|wav|m4a)/i);
        if(match && match.length > 1) {
            return match[1].toLowerCase();
        }
    }
    // from Standard URL
    url = url.split('?')[0];
    url = url.slice(url.lastIndexOf('/') + 1);

    var a = url.split('.');
    if(a.length === 1 || (a[0] === '' && a.length === 2)) {
        return '';
    }
    return a.pop().toLowerCase();
};

File.getSupportedFile = function(fileNames) {
    var name;

    if(Array.isArray(fileNames)) {
        // if array get the first one that works
        fileNames.some(function(item) {
            name = item;
            var ext = this.getFileExtension(item);
            return this.extensions.indexOf(ext) > -1;
        }, this);
    }
    else if(typeof fileNames === 'object') {
        // if not array and is object
        Object.keys(fileNames).some(function(key) {
            name = fileNames[key];
            var ext = this.getFileExtension(name);
            return this.extensions.indexOf(ext) > -1;
        }, this);
    }
    // if string just return
    return name || fileNames;
};

/*
 * infer file types
 */

File.isAudioBuffer = function(data) {
    return !!(data &&
              window.AudioBuffer &&
              data instanceof window.AudioBuffer);
};

File.isMediaElement = function(data) {
    return !!(data &&
              window.HTMLMediaElement &&
              data instanceof window.HTMLMediaElement);
};

File.isMediaStream = function(data) {
    return !!(data &&
              typeof data.getAudioTracks === 'function' &&
              data.getAudioTracks().length &&
              window.MediaStreamTrack &&
              data.getAudioTracks()[0] instanceof window.MediaStreamTrack);
};

File.isOscillatorType = function(data) {
    return !!(data && typeof data === 'string' &&
             (data === 'sine' || data === 'square' ||
              data === 'sawtooth' || data === 'triangle'));
};

File.isScriptConfig = function(data) {
    return !!(data && typeof data === 'object' &&
              data.bufferSize && data.channels && data.callback);
};

File.isURL = function(data) {
    return !!(data && typeof data === 'string' &&
             (data.indexOf('.') > -1 || data.slice(0, 5) === 'data:'));
};

File.containsURL = function(config) {
    if(!config || this.isMediaElement(config)) { return false; }
    // string, array or object with src property that is string or array
    var src = config.src || config.url || config;
    return this.isURL(src) || (Array.isArray(src) && this.isURL(src[0]));
};

module.exports = File;

},{}],26:[function(require,module,exports){
'use strict';

var Emitter = require('./emitter.js');

function Loader(url) {
    var emitter = new Emitter(),
        progress = 0,
        audioContext,
        isTouchLocked,
        request,
        timeout,
        data,
        ERROR_STATE = ['', 'ABORTED', 'NETWORK', 'DECODE', 'SRC_NOT_SUPPORTED'];

    var start = function() {
        if(audioContext) {
            loadArrayBuffer();
        } else {
            loadAudioElement();
        }
    };

    var dispatchComplete = function(buffer) {
        emitter.emit('progress', 1);
        emitter.emit('loaded', buffer);
        emitter.emit('complete', buffer);

        removeListeners();
    };

    // audio buffer

    var loadArrayBuffer = function() {
        request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.addEventListener('progress', progressHandler);
        request.addEventListener('load', loadHandler);
        request.addEventListener('error', errorHandler);
        request.send();
    };

    var progressHandler = function(event) {
        if (event.lengthComputable) {
            progress = event.loaded / event.total;
            emitter.emit('progress', progress);
        }
    };

    var loadHandler = function() {
        audioContext.decodeAudioData(
            request.response,
            function(buffer) {
                data = buffer;
                request = null;
                progress = 1;
                dispatchComplete(buffer);
            },
            errorHandler
        );
    };

    // audio element

    var loadAudioElement = function() {
        if(!data || !data.tagName) {
            data = document.createElement('audio');
        }

        if(!isTouchLocked) {
            // timeout because sometimes canplaythrough doesn't fire
            window.clearTimeout(timeout);
            timeout = window.setTimeout(readyHandler, 2000);
            data.addEventListener('canplaythrough', readyHandler, false);
        }

        data.addEventListener('error', errorHandler, false);
        data.preload = 'auto';
        data.src = url;
        data.load();

        if (isTouchLocked) {
            dispatchComplete(data);
        }
    };

    var readyHandler = function() {
        window.clearTimeout(timeout);
        if(!data) { return; }
        progress = 1;
        dispatchComplete(data);
    };

    // error

    var errorHandler = function(event) {
        window.clearTimeout(timeout);

        var message = event;

        if(data && data.error) {
            message = 'Media Error: ' + ERROR_STATE[data.error.code] + ' ' + url;
        }

        if(request) {
            message = 'XHR Error: ' + request.status + ' ' + request.statusText + ' ' + url;
        }

        emitter.emit('error', message);

        removeListeners();
    };

    // clean up

    var removeListeners = function() {
        emitter.off('error');
        emitter.off('progress');
        emitter.off('complete');
        emitter.off('loaded');

        if(data && typeof data.removeEventListener === 'function') {
            data.removeEventListener('canplaythrough', readyHandler);
            data.removeEventListener('error', errorHandler);
        }

        if(request) {
            request.removeEventListener('progress', progressHandler);
            request.removeEventListener('load', loadHandler);
            request.removeEventListener('error', errorHandler);
        }
    };

    var cancel = function() {
        removeListeners();

        if(request && request.readyState !== 4) {
          request.abort();
        }
        request = null;

        window.clearTimeout(timeout);
    };

    var destroy = function() {
        cancel();
        request = null;
        data = null;
        audioContext = null;
    };

    // reload

    var load = function(newUrl) {
        url = newUrl;
        start();
    };

    var api = {
        on: emitter.on.bind(emitter),
        once: emitter.once.bind(emitter),
        off: emitter.off.bind(emitter),
        load: load,
        start: start,
        cancel: cancel,
        destroy: destroy
    };

    Object.defineProperties(api, {
        data: {
            get: function() {
                return data;
            }
        },
        progress: {
            get: function() {
                return progress;
            }
        },
        audioContext: {
            set: function(value) {
                audioContext = value;
            }
        },
        isTouchLocked: {
            set: function(value) {
                isTouchLocked = value;
            }
        }
    });

    return Object.freeze(api);
}

Loader.Group = function() {
    var emitter = new Emitter(),
        queue = [],
        numLoaded = 0,
        numTotal = 0,
        loader;

    var add = function(loader) {
        queue.push(loader);
        numTotal++;
        return loader;
    };

    var start = function() {
        numTotal = queue.length;
        next();
    };

    var next = function() {
        if(queue.length === 0) {
            loader = null;
            emitter.emit('complete');
            return;
        }

        loader = queue.pop();
        loader.on('progress', progressHandler);
        loader.once('loaded', completeHandler);
        loader.once('error', errorHandler);
        loader.start();
    };

    var progressHandler = function(progress) {
        var loaded = numLoaded + progress;
        emitter.emit('progress', loaded / numTotal);
    };

    var completeHandler = function() {
        numLoaded++;
        removeListeners();
        emitter.emit('progress', numLoaded / numTotal);
        next();
    };

    var errorHandler = function(e) {
        console.error.call(console, e);
        removeListeners();
        emitter.emit('error', e);
        next();
    };

    var removeListeners = function() {
        loader.off('progress', progressHandler);
        loader.off('loaded', completeHandler);
        loader.off('error', errorHandler);
    };

    return Object.freeze({
        on: emitter.on.bind(emitter),
        once: emitter.once.bind(emitter),
        off: emitter.off.bind(emitter),
        add: add,
        start: start
    });
};

module.exports = Loader;

},{"./emitter.js":24}],27:[function(require,module,exports){
'use strict';

function Microphone(connected, denied, error) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    error = error || function() {};

    var isSupported = !!navigator.getUserMedia,
        stream = null,
        api = {};

    var connect = function() {
        if(!isSupported) { return; }

        navigator.getUserMedia({audio:true}, function(micStream) {
            stream = micStream;
            connected(stream);
        }, function(e) {
            if(denied && e.name === 'PermissionDeniedError' || e === 'PERMISSION_DENIED') {
                // console.log('Permission denied. Reset by clicking the camera icon with the red cross in the address bar');
                denied();
            }
            else {
                error(e.message || e);
            }
        });
        return api;
    };

    var disconnect = function() {
        if(stream) {
            stream.stop();
            stream = null;
        }
        return api;
    };

    Object.defineProperties(api, {
        connect: {
            value: connect
        },
        disconnect: {
            value: disconnect
        },
        isSupported: {
            value: isSupported
        },
        stream: {
            get: function() {
                return stream;
            }
        }
    });

    return Object.freeze(api);
}


module.exports = Microphone;

},{}],28:[function(require,module,exports){
'use strict';

var Group = require('../group.js');

function SoundGroup(context, destination) {
    var group = new Group(context, destination),
        sounds = group.sounds,
        playbackRate = 1,
        loop = false,
        src;

    var getSource = function() {
        if(!sounds.length) { return; }

        src = sounds.slice(0).sort(function(a, b) {
            return b.duration - a.duration;
        })[0];
    };

    var add = group.add;
    group.add = function(sound) {
        add(sound);
        getSource();
        return group;
    };

    var remove = group.rmeove;
    group.remove = function(soundOrId) {
        remove(soundOrId);
        getSource();
        return group;
    };

    Object.defineProperties(group, {
        currentTime: {
            get: function() {
                return src ? src.currentTime : 0;
            },
            set: function(value) {
                this.stop();
                this.play(0, value);
            }
        },
        duration: {
            get: function() {
                return src ? src.duration : 0;
            }
        },
        // ended: {
        //     get: function() {
        //         return src ? src.ended : false;
        //     }
        // },
        loop: {
            get: function() {
                return loop;
            },
            set: function(value) {
                loop = !!value;
                sounds.forEach(function(sound) {
                    sound.loop = loop;
                });
            }
        },
        paused: {
            get: function() {
                // return src ? src.paused : false;
                return !!src && src.paused;
            }
        },
        progress: {
            get: function() {
                return src ? src.progress : 0;
            }
        },
        playbackRate: {
            get: function() {
                return playbackRate;
            },
            set: function(value) {
                playbackRate = value;
                sounds.forEach(function(sound) {
                    sound.playbackRate = playbackRate;
                });
            }
        },
        playing: {
            get: function() {
                // return src ? src.playing : false;
                return !!src && src.playing;
            }
        }
    });

    return group;

}

module.exports = SoundGroup;

},{"../group.js":16}],29:[function(require,module,exports){
'use strict';

var Microphone = require('./microphone.js');
var waveformer = require('./waveformer.js');

/*
 * audio ctx
 */
var ctx;
var offlineCtx;

var getContext = function() {
    if (ctx) { return ctx; }

    var Ctx = window.AudioContext || window.webkitAudioContext;

    ctx = (Ctx ? new Ctx() : null);

    // Handles bug in Safari 9 OSX where AudioContext instance starts in 'suspended' state

    var isSuspended = ctx && ctx.state === 'suspended';

    if (isSuspended && typeof ctx.resume === 'function') {
        window.setTimeout(function() {
            ctx.resume();
        }, 1000);
    }

    return ctx;
};

/*
In contrast with a standard AudioContext, an OfflineAudioContext doesn't render
the audio to the device hardware;
instead, it generates it, as fast as it can, and outputs the result to an AudioBuffer.
*/
var getOfflineContext = function(numOfChannels, length, sampleRate) {
    if (offlineCtx) { return offlineCtx; }
    numOfChannels = numOfChannels || 2;
    sampleRate = sampleRate || 44100;
    length = sampleRate || numOfChannels;

    var OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;

    offlineCtx = (OfflineCtx ? new OfflineCtx(numOfChannels, length, sampleRate) : null);

    return offlineCtx;
};


/*
 * clone audio buffer
 */

var cloneBuffer = function(buffer) {
    if (!ctx) { return buffer; }

    var numChannels = buffer.numberOfChannels,
        cloned = ctx.createBuffer(numChannels, buffer.length, buffer.sampleRate);
    for (var i = 0; i < numChannels; i++) {
        cloned.getChannelData(i).set(buffer.getChannelData(i));
    }
    return cloned;
};

/*
 * reverse audio buffer
 */

var reverseBuffer = function(buffer) {
    var numChannels = buffer.numberOfChannels;
    for (var i = 0; i < numChannels; i++) {
        Array.prototype.reverse.call(buffer.getChannelData(i));
    }
    return buffer;
};

/*
 * ramp audio param
 */

var ramp = function(param, fromValue, toValue, duration, linear) {
    if (!ctx) { return; }

    param.setValueAtTime(fromValue, ctx.currentTime);

    if (linear) {
        param.linearRampToValueAtTime(toValue, ctx.currentTime + duration);
    } else {
        param.exponentialRampToValueAtTime(toValue, ctx.currentTime + duration);
    }
};

/*
 * get frequency from min to max by passing 0 to 1
 */

var getFrequency = function(value) {
    if (!ctx) { return 0; }
    // get frequency by passing number from 0 to 1
    // Clamp the frequency between the minimum value (40 Hz) and half of the
    // sampling rate.
    var minValue = 40;
    var maxValue = ctx.sampleRate / 2;
    // Logarithm (base 2) to compute how many octaves fall in the range.
    var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
    // Compute a multiplier from 0 to 1 based on an exponential scale.
    var multiplier = Math.pow(2, numberOfOctaves * (value - 1.0));
    // Get back to the frequency value between min and max.
    return maxValue * multiplier;
};

/*
 * microphone util
 */

var microphone = function(connected, denied, error) {
    return new Microphone(connected, denied, error);
};

/*
 * Format seconds as timecode string
 */

var timeCode = function(seconds, delim) {
    if (delim === undefined) { delim = ':'; }
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.floor((seconds % 3600) % 60);
    var hr = (h === 0 ? '' : (h < 10 ? '0' + h + delim : h + delim));
    var mn = (m < 10 ? '0' + m : m) + delim;
    var sc = (s < 10 ? '0' + s : s);
    return hr + mn + sc;
};

module.exports = Object.freeze({
    getContext: getContext,
    getOfflineContext: getOfflineContext,
    cloneBuffer: cloneBuffer,
    reverseBuffer: reverseBuffer,
    ramp: ramp,
    getFrequency: getFrequency,
    microphone: microphone,
    timeCode: timeCode,
    waveformer: waveformer
});

},{"./microphone.js":27,"./waveformer.js":32}],30:[function(require,module,exports){
'use strict';

module.exports = Object.freeze({
  number: function(value, defaultValue) {
    if(arguments.length < 2) { defaultValue = 0; }
    if(typeof value !== 'number' || isNaN(value)) { return defaultValue; }
    return value;
  }
});

},{}],31:[function(require,module,exports){
'use strict';

function waveform() {

    var buffer,
        wave;

    return function(audioBuffer, length) {
        if(!window.Float32Array || !window.AudioBuffer) { return []; }

        var sameBuffer = buffer === audioBuffer;
        var sameLength = wave && wave.length === length;
        if(sameBuffer && sameLength) { return wave; }

        //console.time('waveData');
        if(!wave || wave.length !== length) {
            wave = new Float32Array(length);
        }

        if(!audioBuffer) { return wave; }

        // cache for repeated calls
        buffer = audioBuffer;

        var chunk = Math.floor(buffer.length / length),
            resolution = 5, // 10
            incr = Math.max(Math.floor(chunk / resolution), 1),
            greatest = 0;

        for(var i = 0; i < buffer.numberOfChannels; i++) {
            // check each channel
            var channel = buffer.getChannelData(i);
            for(var j = 0; j < length; j++) {
                // get highest value within the chunk
                for(var k = j * chunk, l = k + chunk; k < l; k += incr) {
                    // select highest value from channels
                    var a = channel[k];
                    if(a < 0) { a = -a; }
                    if(a > wave[j]) {
                        wave[j] = a;
                    }
                    // update highest overall for scaling
                    if(a > greatest) {
                        greatest = a;
                    }
                }
            }
        }
        // scale up
        var scale = 1 / greatest;
        for(i = 0; i < wave.length; i++) {
            wave[i] *= scale;
        }
        //console.timeEnd('waveData');

        return wave;
    };
}

module.exports = waveform;

},{}],32:[function(require,module,exports){
'use strict';

var halfPI = Math.PI / 2;
var twoPI = Math.PI * 2;

module.exports = function waveformer(config) {

    var style = config.style || 'fill', // 'fill' or 'line'
        shape = config.shape || 'linear', // 'circular' or 'linear'
        color = config.color || 0,
        bgColor = config.bgColor,
        lineWidth = config.lineWidth || 1,
        percent = config.percent || 1,
        originX = config.x || 0,
        originY = config.y || 0,
        transform = config.transform,
        canvas = config.canvas,
        width = config.width || (canvas && canvas.width),
        height = config.height || (canvas && canvas.height),
        ctx, currentColor, waveform, length, i, value, x, y,
        radius, innerRadius, centerX, centerY;

    if(!canvas && !config.context) {
      canvas = document.createElement('canvas');
      width = width || canvas.width;
      height = height || canvas.height;
      canvas.width = height;
      canvas.height = height;
    }

    if(shape === 'circular') {
      radius = config.radius || Math.min(height / 2, width / 2),
      innerRadius = config.innerRadius || radius / 2;
      centerX = originX + width / 2;
      centerY = originY + height / 2;
    }

    ctx = config.context || canvas.getContext('2d');

    var clear = function() {
      if(bgColor) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(originX, originY, width, height);
      } else {
          ctx.clearRect(originX, originY, width, height);
      }

      ctx.lineWidth = lineWidth;

      currentColor = null;

      if(typeof color !== 'function') {
        ctx.strokeStyle = color;
        ctx.beginPath();
      }
    };

    var updateColor = function(position, length, value) {
      if(typeof color === 'function') {
        var newColor = color(position, length, value);
        if(newColor !== currentColor) {
          currentColor = newColor;
          ctx.stroke();
          ctx.strokeStyle = currentColor;
          ctx.beginPath();
        }
      }
    };

    var getValue = function(value, position, length) {
      if(typeof transform === 'function') {
        return transform(value, position, length);
      }
      return value;
    };

    var getWaveform = function(value, length) {
      if(value && typeof value.waveform === 'function') {
        return value.waveform(length);
      }
      if(value) {
        return value;
      }
      if(config.waveform) {
        return config.waveform;
      }
      if(config.sound) {
        return config.sound.waveform(length);
      }
      return null;
    };

    var update = function(wave) {

      clear();

      if(shape === 'circular') {

        waveform = getWaveform(wave, 360);
        length = Math.floor(waveform.length * percent);

        var step = twoPI / length,
            angle, magnitude, sine, cosine;

        for (i = 0; i < length; i++) {
          value = getValue(waveform[i], i, length);
          updateColor(i, length, value);

          angle = i * step - halfPI;
          cosine = Math.cos(angle);
          sine = Math.sin(angle);

          if(style === 'fill') {
            x = centerX + innerRadius * cosine;
            y = centerY + innerRadius * sine;
            ctx.moveTo(x, y);
          }

          magnitude = innerRadius + (radius - innerRadius) * value;
          x = centerX + magnitude * cosine;
          y = centerY + magnitude * sine;

          if(style === 'line' && i === 0) {
            ctx.moveTo(x, y);
          }

          ctx.lineTo(x, y);
        }

        if(style === 'line') {
          ctx.closePath();
        }
      }
      else {

        waveform = getWaveform(wave, width);
        length = Math.min(waveform.length, width - lineWidth / 2);
        length = Math.floor(length * percent);

        for(i = 0; i < length; i++) {
          value = getValue(waveform[i], i, length);
          updateColor(i, length, value);

          if(style === 'line' && i > 0) {
            ctx.lineTo(x, y);
          }

          x = originX + i;
          y = originY + height - Math.round(height * value);
          y = Math.floor(Math.min(y, originY + height - lineWidth / 2));

          if(style === 'fill') {
            ctx.moveTo(x, y);
            ctx.lineTo(x, originY + height);
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    };

    update.canvas = canvas;

    if(config.waveform || config.sound) {
      update();
    }

    return update;
};

},{}],33:[function(require,module,exports){
'use strict';

var browser = require('./lib/utils/browser.js'),
    file = require('./lib/utils/file.js'),
    Group = require('./lib/group.js'),
    Loader = require('./lib/utils/loader.js'),
    Sound = require('./lib/sound.js'),
    SoundGroup = require('./lib/utils/sound-group.js'),
    utils = require('./lib/utils/utils.js');

function Sono() {
    var VERSION = '0.1.6',
        context = utils.getContext(),
        destination = (context ? context.destination : null),
        group = new Group(context, destination),
        api;

    /*
     * Create Sound
     *
     * Accepted values for param config:
     * Object config e.g. { id:'foo', url:['foo.ogg', 'foo.mp3'] }
     * Array (of files e.g. ['foo.ogg', 'foo.mp3'])
     * ArrayBuffer
     * HTMLMediaElement
     * Filename string (e.g. 'foo.ogg')
     * Oscillator type string (i.e. 'sine', 'square', 'sawtooth', 'triangle')
     * ScriptProcessor config object (e.g. { bufferSize: 1024, channels: 1, callback: fn })
     */

    var createSound = function(config) {
        // try to load if config contains URLs
        if(file.containsURL(config)) {
            return load(config);
        }

        var sound = add(config);
        sound.data = config.data || config;

        return sound;
    };

    /*
     * Destroy
     */

    var destroySound = function(soundOrId) {
        group.find(soundOrId, function(sound) {
            sound.destroy();
        });
        return api;
    };

    var destroyAll = function() {
        group.destroy();
        return api;
    };

    /*
     * Get Sound by id
     */

    var getSound = function(id) {
        return group.find(id);
    };

    /*
     * Create group
     */

    var createGroup = function(sounds) {
        var soundGroup = new SoundGroup(context, group.gain);
        if(sounds) {
            sounds.forEach(function(sound) {
                soundGroup.add(sound);
            });
        }
        return soundGroup;
    };

    /*
     * Loading
     */

    var load = function(config) {
        var src = config.src || config.url || config,
            sound, loader;

        if(file.containsURL(src)) {
            sound = queue(config);
            loader = sound.loader;
        } else if(Array.isArray(src) && file.containsURL(src[0].src || src[0].url)) {
            sound = [];
            loader = new Loader.Group();
            src.forEach(function(file) {
                sound.push(queue(file, loader));
            });
        } else {
            var errorMessage = 'sono.load: No audio file URLs found in config.';
            if (config.onError) {
              config.onError('[ERROR] ' + errorMessage);
            } else {
              throw new Error(errorMessage);
            }
            return null;
        }
        if (config.onProgress) {
            loader.on('progress', function(progress) {
                config.onProgress(progress);
            });
        }
        if (config.onComplete) {
            loader.once('complete', function() {
                loader.off('progress');
                config.onComplete(sound);
            });
        }
        loader.once('error', function(err) {
            loader.off('error');
            if (config.onError) {
                config.onError(err);
            } else {
                console.error.call(console, '[ERROR] sono.load: ' + err);
            }
        });
        loader.start();

        return sound;
    };

    var queue = function(config, loaderGroup) {
        var sound = add(config).load(config);

        if(loaderGroup) {
            loaderGroup.add(sound.loader);
        }
        return sound;
    };

    var add = function(config) {
        var soundContext = config && config.webAudio === false ? null : context;
        var sound = new Sound(soundContext, group.gain);
        sound.isTouchLocked = isTouchLocked;
        if(config) {
            sound.id = config.id || '';
            sound.loop = !!config.loop;
            sound.volume = config.volume;
        }
        group.add(sound);
        return sound;
    };

    /*
     * Controls
     */

    var mute = function() {
        group.mute();
        return api;
    };

    var unMute = function() {
        group.unMute();
        return api;
    };

    var fade = function(volume, duration) {
        group.fade(volume, duration);
        return api;
    };

    var pauseAll = function() {
        group.pause();
        return api;
    };

    var resumeAll = function() {
        group.resume();
        return api;
    };

    var stopAll = function() {
        group.stop();
        return api;
    };

    var play = function(id, delay, offset) {
        group.find(id, function(sound) {
            sound.play(delay, offset);
        });
        return api;
    };

    var pause = function(id) {
        group.find(id, function(sound) {
            sound.pause();
        });
        return api;
    };

    var stop = function(id) {
        group.find(id, function(sound) {
            sound.stop();
        });
        return api;
    };

    /*
     * Mobile touch lock
     */

    var isTouchLocked = browser.handleTouchLock(context, function() {
        isTouchLocked = false;
        group.sounds.forEach(function(sound) {
            sound.isTouchLocked = false;
        });
    });

    /*
     * Page visibility events
     */

    (function() {
        var pageHiddenPaused = [];

        // pause currently playing sounds and store refs
        function onHidden() {
            group.sounds.forEach(function(sound) {
                if(sound.playing) {
                    sound.pause();
                    pageHiddenPaused.push(sound);
                }
            });
        }

        // play sounds that got paused when page was hidden
        function onShown() {
            while(pageHiddenPaused.length) {
                pageHiddenPaused.pop().play();
            }
        }

        browser.handlePageVisibility(onHidden, onShown);
    }());

    /*
     * Log version & device support info
     */

    var log = function() {
        var title = 'sono ' + VERSION,
            info = 'Supported:' + api.isSupported +
                   ' WebAudioAPI:' + api.hasWebAudio +
                   ' TouchLocked:' + isTouchLocked +
                   ' State:' + (context && context.state) +
                   ' Extensions:' + file.extensions;

        if(navigator.userAgent.indexOf('Chrome') > -1) {
            var args = [
                    '%c ♫ ' + title +
                    ' ♫ %c ' + info + ' ',
                    'color: #FFFFFF; background: #379F7A',
                    'color: #1F1C0D; background: #E0FBAC'
                ];
            console.log.apply(console, args);
        }
        else if (window.console && window.console.log.call) {
            console.log.call(console, title + ' ' + info);
        }
    };

    api = {
        createSound: createSound,
        destroySound: destroySound,
        destroyAll: destroyAll,
        getSound: getSound,
        createGroup: createGroup,
        load: load,
        mute: mute,
        unMute: unMute,
        fade: fade,
        pauseAll: pauseAll,
        resumeAll: resumeAll,
        stopAll: stopAll,
        play: play,
        pause: pause,
        stop: stop,
        log: log,

        canPlay: file.canPlay,
        context: context,
        getOfflineContext: utils.getOfflineContext,
        effect: group.effect,
        extensions: file.extensions,
        hasWebAudio: !!context,
        isSupported: file.extensions.length > 0,
        gain: group.gain,
        utils: utils,
        VERSION: VERSION
    };

    /*
     * Getters & Setters
     */

    Object.defineProperties(api, {
        isTouchLocked: {
            get: function() {
                return isTouchLocked;
            }
        },
        sounds: {
            get: function() {
                return group.sounds.slice(0);
            }
        },
        volume: {
            get: function() {
                return group.volume;
            },
            set: function(value) {
                group.volume = value;
            }
        }
    });

    return Object.freeze(api);
}

module.exports = new Sono();

},{"./lib/group.js":16,"./lib/sound.js":17,"./lib/utils/browser.js":23,"./lib/utils/file.js":25,"./lib/utils/loader.js":26,"./lib/utils/sound-group.js":28,"./lib/utils/utils.js":29}],34:[function(require,module,exports){
/*!
 *  howler.js v1.1.29
 *  howlerjs.com
 *
 *  (c) 2013-2016, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {
  // setup
  var cache = {};

  // setup the audio context
  var ctx = null,
    usingWebAudio = true,
    noAudio = false;
  try {
    if (typeof AudioContext !== 'undefined') {
      ctx = new AudioContext();
    } else if (typeof webkitAudioContext !== 'undefined') {
      ctx = new webkitAudioContext();
    } else {
      usingWebAudio = false;
    }
  } catch(e) {
    usingWebAudio = false;
  }

  if (!usingWebAudio) {
    if (typeof Audio !== 'undefined') {
      try {
        new Audio();
      } catch(e) {
        noAudio = true;
      }
    } else {
      noAudio = true;
    }
  }

  // create a master gain node
  if (usingWebAudio) {
    var masterGain = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }

  // create global controller
  var HowlerGlobal = function(codecs) {
    this._volume = 1;
    this._muted = false;
    this.usingWebAudio = usingWebAudio;
    this.ctx = ctx;
    this.noAudio = noAudio;
    this._howls = [];
    this._codecs = codecs;
    this.iOSAutoEnable = true;
  };
  HowlerGlobal.prototype = {
    /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */
    volume: function(vol) {
      var self = this;

      // make sure volume is a number
      vol = parseFloat(vol);

      if (vol >= 0 && vol <= 1) {
        self._volume = vol;

        if (usingWebAudio) {
          masterGain.gain.value = vol;
        }

        // loop through cache and change volume of all nodes that are using HTML5 Audio
        for (var key in self._howls) {
          if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
            // loop through the audio nodes
            for (var i=0; i<self._howls[key]._audioNode.length; i++) {
              self._howls[key]._audioNode[i].volume = self._howls[key]._volume * self._volume;
            }
          }
        }

        return self;
      }

      // return the current global volume
      return (usingWebAudio) ? masterGain.gain.value : self._volume;
    },

    /**
     * Mute all sounds.
     * @return {Howler}
     */
    mute: function() {
      this._setMuted(true);

      return this;
    },

    /**
     * Unmute all sounds.
     * @return {Howler}
     */
    unmute: function() {
      this._setMuted(false);

      return this;
    },

    /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */
    _setMuted: function(muted) {
      var self = this;

      self._muted = muted;

      if (usingWebAudio) {
        masterGain.gain.value = muted ? 0 : self._volume;
      }

      for (var key in self._howls) {
        if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
          // loop through the audio nodes
          for (var i=0; i<self._howls[key]._audioNode.length; i++) {
            self._howls[key]._audioNode[i].muted = muted;
          }
        }
      }
    },

    /**
     * Check for codec support.
     * @param  {String} ext Audio file extension.
     * @return {Boolean}
     */
    codecs: function(ext) {
      return this._codecs[ext];
    },

    /**
     * iOS will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */
    _enableiOSAudio: function() {
      var self = this;

      // only run this on iOS if audio isn't already eanbled
      if (ctx && (self._iOSEnabled || !/iPhone|iPad|iPod/i.test(navigator.userAgent))) {
        return;
      }

      self._iOSEnabled = false;

      // call this method on touch start to create and play a buffer,
      // then check if the audio actually played to determine if
      // audio has now been unlocked on iOS
      var unlock = function() {
        // create an empty buffer
        var buffer = ctx.createBuffer(1, 1, 22050);
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        // play the empty buffer
        if (typeof source.start === 'undefined') {
          source.noteOn(0);
        } else {
          source.start(0);
        }

        // setup a timeout to check that we are unlocked on the next event loop
        setTimeout(function() {
          if ((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
            // update the unlocked state and prevent this check from happening again
            self._iOSEnabled = true;
            self.iOSAutoEnable = false;

            // remove the touch start listener
            window.removeEventListener('touchend', unlock, false);
          }
        }, 0);
      };

      // setup a touch start listener to attempt an unlock in
      window.addEventListener('touchend', unlock, false);

      return self;
    }
  };

  // check for browser codec support
  var audioTest = null;
  var codecs = {};
  if (!noAudio) {
    audioTest = new Audio();
    codecs = {
      mp3: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/, ''),
      opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
      ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
      wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
      aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
      m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
      mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
      weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')
    };
  }

  // allow access to the global audio controls
  var Howler = new HowlerGlobal(codecs);

  // setup the audio object
  var Howl = function(o) {
    var self = this;

    // setup the defaults
    self._autoplay = o.autoplay || false;
    self._buffer = o.buffer || false;
    self._duration = o.duration || 0;
    self._format = o.format || null;
    self._loop = o.loop || false;
    self._loaded = false;
    self._sprite = o.sprite || {};
    self._src = o.src || '';
    self._pos3d = o.pos3d || [0, 0, -0.5];
    self._volume = o.volume !== undefined ? o.volume : 1;
    self._urls = o.urls || [];
    self._rate = o.rate || 1;

    // allow forcing of a specific panningModel ('equalpower' or 'HRTF'),
    // if none is specified, defaults to 'equalpower' and switches to 'HRTF'
    // if 3d sound is used
    self._model = o.model || null;

    // setup event functions
    self._onload = [o.onload || function() {}];
    self._onloaderror = [o.onloaderror || function() {}];
    self._onend = [o.onend || function() {}];
    self._onpause = [o.onpause || function() {}];
    self._onplay = [o.onplay || function() {}];

    self._onendTimer = [];

    // Web Audio or HTML5 Audio?
    self._webAudio = usingWebAudio && !self._buffer;

    // check if we need to fall back to HTML5 Audio
    self._audioNode = [];
    if (self._webAudio) {
      self._setupAudioNode();
    }

    // automatically try to enable audio on iOS
    if (typeof ctx !== 'undefined' && ctx && Howler.iOSAutoEnable) {
      Howler._enableiOSAudio();
    }

    // add this to an array of Howl's to allow global control
    Howler._howls.push(self);

    // load the track
    self.load();
  };

  // setup all of the methods
  Howl.prototype = {
    /**
     * Load an audio file.
     * @return {Howl}
     */
    load: function() {
      var self = this,
        url = null;

      // if no audio is available, quit immediately
      if (noAudio) {
        self.on('loaderror', new Error('No audio support.'));
        return;
      }

      // loop through source URLs and pick the first one that is compatible
      for (var i=0; i<self._urls.length; i++) {
        var ext, urlItem;

        if (self._format) {
          // use specified audio format if available
          ext = self._format;
        } else {
          // figure out the filetype (whether an extension or base64 data)
          urlItem = self._urls[i];
          ext = /^data:audio\/([^;,]+);/i.exec(urlItem);
          if (!ext) {
            ext = /\.([^.]+)$/.exec(urlItem.split('?', 1)[0]);
          }

          if (ext) {
            ext = ext[1].toLowerCase();
          } else {
            self.on('loaderror', new Error('Could not extract format from passed URLs, please add format parameter.'));
            return;
          }
        }

        if (codecs[ext]) {
          url = self._urls[i];
          break;
        }
      }

      if (!url) {
        self.on('loaderror', new Error('No codec support for selected audio sources.'));
        return;
      }

      self._src = url;

      if (self._webAudio) {
        loadBuffer(self, url);
      } else {
        var newNode = new Audio();

        // listen for errors with HTML5 audio (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror)
        newNode.addEventListener('error', function () {
          if (newNode.error && newNode.error.code === 4) {
            HowlerGlobal.noAudio = true;
          }

          self.on('loaderror', {type: newNode.error ? newNode.error.code : 0});
        }, false);

        self._audioNode.push(newNode);

        // setup the new audio node
        newNode.src = url;
        newNode._pos = 0;
        newNode.preload = 'auto';
        newNode.volume = (Howler._muted) ? 0 : self._volume * Howler.volume();

        // setup the event listener to start playing the sound
        // as soon as it has buffered enough
        var listener = function() {
          // round up the duration when using HTML5 Audio to account for the lower precision
          self._duration = Math.ceil(newNode.duration * 10) / 10;

          // setup a sprite if none is defined
          if (Object.getOwnPropertyNames(self._sprite).length === 0) {
            self._sprite = {_default: [0, self._duration * 1000]};
          }

          if (!self._loaded) {
            self._loaded = true;
            self.on('load');
          }

          if (self._autoplay) {
            self.play();
          }

          // clear the event listener
          newNode.removeEventListener('canplaythrough', listener, false);
        };
        newNode.addEventListener('canplaythrough', listener, false);
        newNode.load();
      }

      return self;
    },

    /**
     * Get/set the URLs to be pulled from to play in this source.
     * @param  {Array} urls  Arry of URLs to load from
     * @return {Howl}        Returns self or the current URLs
     */
    urls: function(urls) {
      var self = this;

      if (urls) {
        self.stop();
        self._urls = (typeof urls === 'string') ? [urls] : urls;
        self._loaded = false;
        self.load();

        return self;
      } else {
        return self._urls;
      }
    },

    /**
     * Play a sound from the current time (0 by default).
     * @param  {String}   sprite   (optional) Plays from the specified position in the sound sprite definition.
     * @param  {Function} callback (optional) Returns the unique playback id for this sound instance.
     * @return {Howl}
     */
    play: function(sprite, callback) {
      var self = this;

      // if no sprite was passed but a callback was, update the variables
      if (typeof sprite === 'function') {
        callback = sprite;
      }

      // use the default sprite if none is passed
      if (!sprite || typeof sprite === 'function') {
        sprite = '_default';
      }

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.play(sprite, callback);
        });

        return self;
      }

      // if the sprite doesn't exist, play nothing
      if (!self._sprite[sprite]) {
        if (typeof callback === 'function') callback();
        return self;
      }

      // get the node to playback
      self._inactiveNode(function(node) {
        // persist the sprite being played
        node._sprite = sprite;

        // determine where to start playing from
        var pos = (node._pos > 0) ? node._pos : self._sprite[sprite][0] / 1000;

        // determine how long to play for
        var duration = 0;
        if (self._webAudio) {
          duration = self._sprite[sprite][1] / 1000 - node._pos;
          if (node._pos > 0) {
            pos = self._sprite[sprite][0] / 1000 + pos;
          }
        } else {
          duration = self._sprite[sprite][1] / 1000 - (pos - self._sprite[sprite][0] / 1000);
        }

        // determine if this sound should be looped
        var loop = !!(self._loop || self._sprite[sprite][2]);

        // set timer to fire the 'onend' event
        var soundId = (typeof callback === 'string') ? callback : Math.round(Date.now() * Math.random()) + '',
          timerId;
        (function() {
          var data = {
            id: soundId,
            sprite: sprite,
            loop: loop
          };
          timerId = setTimeout(function() {
            // if looping, restart the track
            if (!self._webAudio && loop) {
              self.stop(data.id).play(sprite, data.id);
            }

            // set web audio node to paused at end
            if (self._webAudio && !loop) {
              self._nodeById(data.id).paused = true;
              self._nodeById(data.id)._pos = 0;

              // clear the end timer
              self._clearEndTimer(data.id);
            }

            // end the track if it is HTML audio and a sprite
            if (!self._webAudio && !loop) {
              self.stop(data.id);
            }

            // fire ended event
            self.on('end', soundId);
          }, (duration / self._rate) * 1000);

          // store the reference to the timer
          self._onendTimer.push({timer: timerId, id: data.id});
        })();

        if (self._webAudio) {
          var loopStart = self._sprite[sprite][0] / 1000,
            loopEnd = self._sprite[sprite][1] / 1000;

          // set the play id to this node and load into context
          node.id = soundId;
          node.paused = false;
          refreshBuffer(self, [loop, loopStart, loopEnd], soundId);
          self._playStart = ctx.currentTime;
          node.gain.value = self._volume;

          if (typeof node.bufferSource.start === 'undefined') {
            loop ? node.bufferSource.noteGrainOn(0, pos, 86400) : node.bufferSource.noteGrainOn(0, pos, duration);
          } else {
            loop ? node.bufferSource.start(0, pos, 86400) : node.bufferSource.start(0, pos, duration);
          }
        } else {
          if (node.readyState === 4 || !node.readyState && navigator.isCocoonJS) {
            node.readyState = 4;
            node.id = soundId;
            node.currentTime = pos;
            node.muted = Howler._muted || node.muted;
            node.volume = self._volume * Howler.volume();
            setTimeout(function() { node.play(); }, 0);
          } else {
            self._clearEndTimer(soundId);

            (function(){
              var sound = self,
                playSprite = sprite,
                fn = callback,
                newNode = node;
              var listener = function() {
                sound.play(playSprite, fn);

                // clear the event listener
                newNode.removeEventListener('canplaythrough', listener, false);
              };
              newNode.addEventListener('canplaythrough', listener, false);
            })();

            return self;
          }
        }

        // fire the play event and send the soundId back in the callback
        self.on('play');
        if (typeof callback === 'function') callback(soundId);

        return self;
      });

      return self;
    },

    /**
     * Pause playback and save the current position.
     * @param {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    pause: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.pause(id);
        });

        return self;
      }

      // clear 'onend' timer
      self._clearEndTimer(id);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        activeNode._pos = self.pos(null, id);

        if (self._webAudio) {
          // make sure the sound has been created
          if (!activeNode.bufferSource || activeNode.paused) {
            return self;
          }

          activeNode.paused = true;
          if (typeof activeNode.bufferSource.stop === 'undefined') {
            activeNode.bufferSource.noteOff(0);
          } else {
            activeNode.bufferSource.stop(0);
          }
        } else {
          activeNode.pause();
        }
      }

      self.on('pause');

      return self;
    },

    /**
     * Stop playback and reset to start.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl}
     */
    stop: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.stop(id);
        });

        return self;
      }

      // clear 'onend' timer
      self._clearEndTimer(id);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        activeNode._pos = 0;

        if (self._webAudio) {
          // make sure the sound has been created
          if (!activeNode.bufferSource || activeNode.paused) {
            return self;
          }

          activeNode.paused = true;

          if (typeof activeNode.bufferSource.stop === 'undefined') {
            activeNode.bufferSource.noteOff(0);
          } else {
            activeNode.bufferSource.stop(0);
          }
        } else if (!isNaN(activeNode.duration)) {
          activeNode.pause();
          activeNode.currentTime = 0;
        }
      }

      return self;
    },

    /**
     * Mute this sound.
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    mute: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.mute(id);
        });

        return self;
      }

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (self._webAudio) {
          activeNode.gain.value = 0;
        } else {
          activeNode.muted = true;
        }
      }

      return self;
    },

    /**
     * Unmute this sound.
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    unmute: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.unmute(id);
        });

        return self;
      }

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (self._webAudio) {
          activeNode.gain.value = self._volume;
        } else {
          activeNode.muted = false;
        }
      }

      return self;
    },

    /**
     * Get/set volume of this sound.
     * @param  {Float}  vol Volume from 0.0 to 1.0.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl/Float}     Returns self or current volume.
     */
    volume: function(vol, id) {
      var self = this;

      // make sure volume is a number
      vol = parseFloat(vol);

      if (vol >= 0 && vol <= 1) {
        self._volume = vol;

        // if the sound hasn't been loaded, add it to the event queue
        if (!self._loaded) {
          self.on('play', function() {
            self.volume(vol, id);
          });

          return self;
        }

        var activeNode = (id) ? self._nodeById(id) : self._activeNode();
        if (activeNode) {
          if (self._webAudio) {
            activeNode.gain.value = vol;
          } else {
            activeNode.volume = vol * Howler.volume();
          }
        }

        return self;
      } else {
        return self._volume;
      }
    },

    /**
     * Get/set whether to loop the sound.
     * @param  {Boolean} loop To loop or not to loop, that is the question.
     * @return {Howl/Boolean}      Returns self or current looping value.
     */
    loop: function(loop) {
      var self = this;

      if (typeof loop === 'boolean') {
        self._loop = loop;

        return self;
      } else {
        return self._loop;
      }
    },

    /**
     * Get/set sound sprite definition.
     * @param  {Object} sprite Example: {spriteName: [offset, duration, loop]}
     *                @param {Integer} offset   Where to begin playback in milliseconds
     *                @param {Integer} duration How long to play in milliseconds
     *                @param {Boolean} loop     (optional) Set true to loop this sprite
     * @return {Howl}        Returns current sprite sheet or self.
     */
    sprite: function(sprite) {
      var self = this;

      if (typeof sprite === 'object') {
        self._sprite = sprite;

        return self;
      } else {
        return self._sprite;
      }
    },

    /**
     * Get/set the position of playback.
     * @param  {Float}  pos The position to move current playback to.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl/Float}      Returns self or current playback position.
     */
    pos: function(pos, id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.pos(pos);
        });

        return typeof pos === 'number' ? self : self._pos || 0;
      }

      // make sure we are dealing with a number for pos
      pos = parseFloat(pos);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (pos >= 0) {
          self.pause(id);
          activeNode._pos = pos;
          self.play(activeNode._sprite, id);

          return self;
        } else {
          return self._webAudio ? activeNode._pos + (ctx.currentTime - self._playStart) : activeNode.currentTime;
        }
      } else if (pos >= 0) {
        return self;
      } else {
        // find the first inactive node to return the pos for
        for (var i=0; i<self._audioNode.length; i++) {
          if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
            return (self._webAudio) ? self._audioNode[i]._pos : self._audioNode[i].currentTime;
          }
        }
      }
    },

    /**
     * Get/set the 3D position of the audio source.
     * The most common usage is to set the 'x' position
     * to affect the left/right ear panning. Setting any value higher than
     * 1.0 will begin to decrease the volume of the sound as it moves further away.
     * NOTE: This only works with Web Audio API, HTML5 Audio playback
     * will not be affected.
     * @param  {Float}  x  The x-position of the playback from -1000.0 to 1000.0
     * @param  {Float}  y  The y-position of the playback from -1000.0 to 1000.0
     * @param  {Float}  z  The z-position of the playback from -1000.0 to 1000.0
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl/Array}   Returns self or the current 3D position: [x, y, z]
     */
    pos3d: function(x, y, z, id) {
      var self = this;

      // set a default for the optional 'y' & 'z'
      y = (typeof y === 'undefined' || !y) ? 0 : y;
      z = (typeof z === 'undefined' || !z) ? -0.5 : z;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.pos3d(x, y, z, id);
        });

        return self;
      }

      if (x >= 0 || x < 0) {
        if (self._webAudio) {
          var activeNode = (id) ? self._nodeById(id) : self._activeNode();
          if (activeNode) {
            self._pos3d = [x, y, z];
            activeNode.panner.setPosition(x, y, z);
            activeNode.panner.panningModel = self._model || 'HRTF';
          }
        }
      } else {
        return self._pos3d;
      }

      return self;
    },

    /**
     * Fade a currently playing sound between two volumes.
     * @param  {Number}   from     The volume to fade from (0.0 to 1.0).
     * @param  {Number}   to       The volume to fade to (0.0 to 1.0).
     * @param  {Number}   len      Time in milliseconds to fade.
     * @param  {Function} callback (optional) Fired when the fade is complete.
     * @param  {String}   id       (optional) The play instance ID.
     * @return {Howl}
     */
    fade: function(from, to, len, callback, id) {
      var self = this,
        diff = Math.abs(from - to),
        dir = from > to ? 'down' : 'up',
        steps = diff / 0.01,
        stepTime = len / steps;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.fade(from, to, len, callback, id);
        });

        return self;
      }

      // set the volume to the start position
      self.volume(from, id);

      for (var i=1; i<=steps; i++) {
        (function() {
          var change = self._volume + (dir === 'up' ? 0.01 : -0.01) * i,
            vol = Math.round(1000 * change) / 1000,
            toVol = to;

          setTimeout(function() {
            self.volume(vol, id);

            if (vol === toVol) {
              if (callback) callback();
            }
          }, stepTime * i);
        })();
      }
    },

    /**
     * [DEPRECATED] Fade in the current sound.
     * @param  {Float}    to      Volume to fade to (0.0 to 1.0).
     * @param  {Number}   len     Time in milliseconds to fade.
     * @param  {Function} callback
     * @return {Howl}
     */
    fadeIn: function(to, len, callback) {
      return this.volume(0).play().fade(0, to, len, callback);
    },

    /**
     * [DEPRECATED] Fade out the current sound and pause when finished.
     * @param  {Float}    to       Volume to fade to (0.0 to 1.0).
     * @param  {Number}   len      Time in milliseconds to fade.
     * @param  {Function} callback
     * @param  {String}   id       (optional) The play instance ID.
     * @return {Howl}
     */
    fadeOut: function(to, len, callback, id) {
      var self = this;

      return self.fade(self._volume, to, len, function() {
        if (callback) callback();
        self.pause(id);

        // fire ended event
        self.on('end');
      }, id);
    },

    /**
     * Get an audio node by ID.
     * @return {Howl} Audio node.
     */
    _nodeById: function(id) {
      var self = this,
        node = self._audioNode[0];

      // find the node with this ID
      for (var i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].id === id) {
          node = self._audioNode[i];
          break;
        }
      }

      return node;
    },

    /**
     * Get the first active audio node.
     * @return {Howl} Audio node.
     */
    _activeNode: function() {
      var self = this,
        node = null;

      // find the first playing node
      for (var i=0; i<self._audioNode.length; i++) {
        if (!self._audioNode[i].paused) {
          node = self._audioNode[i];
          break;
        }
      }

      // remove excess inactive nodes
      self._drainPool();

      return node;
    },

    /**
     * Get the first inactive audio node.
     * If there is none, create a new one and add it to the pool.
     * @param  {Function} callback Function to call when the audio node is ready.
     */
    _inactiveNode: function(callback) {
      var self = this,
        node = null;

      // find first inactive node to recycle
      for (var i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
          // send the node back for use by the new play instance
          callback(self._audioNode[i]);
          node = true;
          break;
        }
      }

      // remove excess inactive nodes
      self._drainPool();

      if (node) {
        return;
      }

      // create new node if there are no inactives
      var newNode;
      if (self._webAudio) {
        newNode = self._setupAudioNode();
        callback(newNode);
      } else {
        self.load();
        newNode = self._audioNode[self._audioNode.length - 1];

        // listen for the correct load event and fire the callback
        var listenerEvent = navigator.isCocoonJS ? 'canplaythrough' : 'loadedmetadata';
        var listener = function() {
          newNode.removeEventListener(listenerEvent, listener, false);
          callback(newNode);
        };
        newNode.addEventListener(listenerEvent, listener, false);
      }
    },

    /**
     * If there are more than 5 inactive audio nodes in the pool, clear out the rest.
     */
    _drainPool: function() {
      var self = this,
        inactive = 0,
        i;

      // count the number of inactive nodes
      for (i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].paused) {
          inactive++;
        }
      }

      // remove excess inactive nodes
      for (i=self._audioNode.length-1; i>=0; i--) {
        if (inactive <= 5) {
          break;
        }

        if (self._audioNode[i].paused) {
          // disconnect the audio source if using Web Audio
          if (self._webAudio) {
            self._audioNode[i].disconnect(0);
          }

          inactive--;
          self._audioNode.splice(i, 1);
        }
      }
    },

    /**
     * Clear 'onend' timeout before it ends.
     * @param  {String} soundId  The play instance ID.
     */
    _clearEndTimer: function(soundId) {
      var self = this,
        index = -1;

      // loop through the timers to find the one associated with this sound
      for (var i=0; i<self._onendTimer.length; i++) {
        if (self._onendTimer[i].id === soundId) {
          index = i;
          break;
        }
      }

      var timer = self._onendTimer[index];
      if (timer) {
        clearTimeout(timer.timer);
        self._onendTimer.splice(index, 1);
      }
    },

    /**
     * Setup the gain node and panner for a Web Audio instance.
     * @return {Object} The new audio node.
     */
    _setupAudioNode: function() {
      var self = this,
        node = self._audioNode,
        index = self._audioNode.length;

      // create gain node
      node[index] = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
      node[index].gain.value = self._volume;
      node[index].paused = true;
      node[index]._pos = 0;
      node[index].readyState = 4;
      node[index].connect(masterGain);

      // create the panner
      node[index].panner = ctx.createPanner();
      node[index].panner.panningModel = self._model || 'equalpower';
      node[index].panner.setPosition(self._pos3d[0], self._pos3d[1], self._pos3d[2]);
      node[index].panner.connect(node[index]);

      return node[index];
    },

    /**
     * Call/set custom events.
     * @param  {String}   event Event type.
     * @param  {Function} fn    Function to call.
     * @return {Howl}
     */
    on: function(event, fn) {
      var self = this,
        events = self['_on' + event];

      if (typeof fn === 'function') {
        events.push(fn);
      } else {
        for (var i=0; i<events.length; i++) {
          if (fn) {
            events[i].call(self, fn);
          } else {
            events[i].call(self);
          }
        }
      }

      return self;
    },

    /**
     * Remove a custom event.
     * @param  {String}   event Event type.
     * @param  {Function} fn    Listener to remove.
     * @return {Howl}
     */
    off: function(event, fn) {
      var self = this,
        events = self['_on' + event];

      if (fn) {
        // loop through functions in the event for comparison
        for (var i=0; i<events.length; i++) {
          if (fn === events[i]) {
            events.splice(i, 1);
            break;
          }
        }
      } else {
        self['_on' + event] = [];
      }

      return self;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all play instances attached to this sound.
     */
    unload: function() {
      var self = this;

      // stop playing any active nodes
      var nodes = self._audioNode;
      for (var i=0; i<self._audioNode.length; i++) {
        // stop the sound if it is currently playing
        if (!nodes[i].paused) {
          self.stop(nodes[i].id);
          self.on('end', nodes[i].id);
        }

        if (!self._webAudio) {
          // remove the source if using HTML5 Audio
          nodes[i].src = '';
        } else {
          // disconnect the output from the master gain
          nodes[i].disconnect(0);
        }
      }

      // make sure all timeouts are cleared
      for (i=0; i<self._onendTimer.length; i++) {
        clearTimeout(self._onendTimer[i].timer);
      }

      // remove the reference in the global Howler object
      var index = Howler._howls.indexOf(self);
      if (index !== null && index >= 0) {
        Howler._howls.splice(index, 1);
      }

      // delete this sound from the cache
      delete cache[self._src];
      self = null;
    }

  };

  // only define these functions when using WebAudio
  if (usingWebAudio) {

    /**
     * Buffer a sound from URL (or from cache) and decode to audio source (Web Audio API).
     * @param  {Object} obj The Howl object for the sound to load.
     * @param  {String} url The path to the sound file.
     */
    var loadBuffer = function(obj, url) {
      // check if the buffer has already been cached
      if (url in cache) {
        // set the duration from the cache
        obj._duration = cache[url].duration;

        // load the sound into this object
        loadSound(obj);
        return;
      }
      
      if (/^data:[^;]+;base64,/.test(url)) {
        // Decode base64 data-URIs because some browsers cannot load data-URIs with XMLHttpRequest.
        var data = atob(url.split(',')[1]);
        var dataView = new Uint8Array(data.length);
        for (var i=0; i<data.length; ++i) {
          dataView[i] = data.charCodeAt(i);
        }
        
        decodeAudioData(dataView.buffer, obj, url);
      } else {
        // load the buffer from the URL
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          decodeAudioData(xhr.response, obj, url);
        };
        xhr.onerror = function() {
          // if there is an error, switch the sound to HTML Audio
          if (obj._webAudio) {
            obj._buffer = true;
            obj._webAudio = false;
            obj._audioNode = [];
            delete obj._gainNode;
            delete cache[url];
            obj.load();
          }
        };
        try {
          xhr.send();
        } catch (e) {
          xhr.onerror();
        }
      }
    };

    /**
     * Decode audio data from an array buffer.
     * @param  {ArrayBuffer} arraybuffer The audio data.
     * @param  {Object} obj The Howl object for the sound to load.
     * @param  {String} url The path to the sound file.
     */
    var decodeAudioData = function(arraybuffer, obj, url) {
      // decode the buffer into an audio source
      ctx.decodeAudioData(
        arraybuffer,
        function(buffer) {
          if (buffer) {
            cache[url] = buffer;
            loadSound(obj, buffer);
          }
        },
        function(err) {
          obj.on('loaderror', err);
        }
      );
    };

    /**
     * Finishes loading the Web Audio API sound and fires the loaded event
     * @param  {Object}  obj    The Howl object for the sound to load.
     * @param  {Objecct} buffer The decoded buffer sound source.
     */
    var loadSound = function(obj, buffer) {
      // set the duration
      obj._duration = (buffer) ? buffer.duration : obj._duration;

      // setup a sprite if none is defined
      if (Object.getOwnPropertyNames(obj._sprite).length === 0) {
        obj._sprite = {_default: [0, obj._duration * 1000]};
      }

      // fire the loaded event
      if (!obj._loaded) {
        obj._loaded = true;
        obj.on('load');
      }

      if (obj._autoplay) {
        obj.play();
      }
    };

    /**
     * Load the sound back into the buffer source.
     * @param  {Object} obj   The sound to load.
     * @param  {Array}  loop  Loop boolean, pos, and duration.
     * @param  {String} id    (optional) The play instance ID.
     */
    var refreshBuffer = function(obj, loop, id) {
      // determine which node to connect to
      var node = obj._nodeById(id);

      // setup the buffer source for playback
      node.bufferSource = ctx.createBufferSource();
      node.bufferSource.buffer = cache[obj._src];
      node.bufferSource.connect(node.panner);
      node.bufferSource.loop = loop[0];
      if (loop[0]) {
        node.bufferSource.loopStart = loop[1];
        node.bufferSource.loopEnd = loop[1] + loop[2];
      }
      node.bufferSource.playbackRate.value = obj._rate;
    };

  }

  /**
   * Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
   */
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return {
        Howler: Howler,
        Howl: Howl
      };
    });
  }

  /**
   * Add support for CommonJS libraries such as browserify.
   */
  if (typeof exports !== 'undefined') {
    exports.Howler = Howler;
    exports.Howl = Howl;
  }

  // define globally in case AMD is not available or available but not used

  if (typeof window !== 'undefined') {
    window.Howler = Howler;
    window.Howl = Howl;
  }

})();

},{}],35:[function(require,module,exports){
var xhr = require("xhr");

module.exports = function getJSON(opt, cb) {
  cb = typeof cb === 'function' ? cb : noop;

  if (typeof opt === 'string')
    opt = { uri: opt };
  else if (!opt)
    opt = { };

  // if (!opt.headers)
  //   opt.headers = { "Content-Type": "application/json" };

  var jsonResponse = /^json$/i.test(opt.responseType);
  return xhr(opt, function(err, res, body) {
    if (err)
      return cb(err);
    if (!/^2/.test(res.statusCode))
      return cb(new Error('http status code: ' + res.statusCode));

    if (jsonResponse) { 
      cb(null, body);
    } else {
      var data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        cb(new Error('cannot parse json: ' + e));
      }
      if(data) cb(null, data);
    }
  })
}

function noop() {}
},{"xhr":36}],36:[function(require,module,exports){
"use strict";
var window = require("global/window")
var once = require("once")
var isFunction = require("is-function")
var parseHeaders = require("parse-headers")
var xtend = require("xtend")

module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    var callback = options.callback
    if(typeof callback === "undefined"){
        throw new Error("callback argument missing")
    }
    callback = once(callback)

    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === "text" || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    var failureResponse = {
                body: undefined,
                headers: {},
                statusCode: 0,
                method: method,
                url: uri,
                rawRequest: xhr
            }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        callback(err, response, response.body)

    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data || null
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer

    if ("json" in options) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            aborted=true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr


}

function noop() {}

},{"global/window":37,"is-function":38,"once":39,"parse-headers":42,"xtend":43}],37:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],38:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],39:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],40:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":38}],41:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],42:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":40,"trim":41}],43:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[4]);
