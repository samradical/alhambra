var load = require('load-json-xhr');

import Q from 'bluebird'
import _ from 'lodash'
import dat from 'dat-gui';

import Emitter from './Emitter'
import Layer from './Layer'

const LOADJSON = Q.promisify(load)
const JSONS = [
    'assets/json/cecil.json',
    `assets/json/sam.json`,
    `assets/json/water.json`
]

const SOUND_LAYERS_DATA = {
    speaking: {
        cecil: {
            json: 'assets/json/cecil.json'
        },
        options: {
            sound: {
                volume: 1
            }
        }
    },
    effects: {
        water: {
            json: `assets/json/water.json`
        },
        sam: {
            json: `assets/json/sam.json`,
        },
        options: {
            sound: {
                volume: 0.3
            }
        }
    },
    music: {
        plants: {
            json: `assets/json/music.json`
        },
        options: {
            sound: {
                volume: 0.3
            }
        }
    }
}

const SOUND_LAYERS = {

}

let sound, cecilData, effectsData
let index = 1
console.log('`', 'HI, PRESS START!');

const G = 'https://storage.googleapis.com/samrad-alhambra/www-assets/prototype2/'

function productionAssets(data) {
    let _f = data.children.filter(file => {
        let _p = file.path
        return (/\.(ogg|mp3)$/i).test(_p)
    })
    _f.map(file => {
        let _p = file.path
        file.path = `${G}${_p}`
        return file
    })
    data.children = _f
}

function loadJson() {
    let _values = _.values(SOUND_LAYERS_DATA)
    Q.map(_values, layer => {
        let _promises = []
        _.forIn(layer, src => {
            if (src.json) {
                let _p = LOADJSON(src.json)
                _p.then(json => {
                    src.index = 0
                    productionAssets(json)
                    src.data = json
                    return json
                })
                _promises.push(_p)
            }
        })
        return Q.all(_promises)
    }, {
        concurrency: 1
    }).then(results => {
        createSoundLayers(SOUND_LAYERS_DATA)
    })

    let btn = document.getElementById('btn')

    btn.addEventListener('touchend', () => {
        start()
    })
    btn.addEventListener('mouseup', () => {
        start()
    })
}


function createSoundLayers(soundLayerData = SOUND_LAYERS_DATA) {
    _.forIn(soundLayerData, (layer, key) => {
        SOUND_LAYERS[key] = new Layer(layer)
    })
}

function start() {
    _.forIn(SOUND_LAYERS, (layer) => {
        layer.start()
    })
}

loadJson()


var obj = {
    increaseEffects: () => {
        SOUND_LAYERS['effects'].rampUp()
        console.log('`', 'increaseEffects');
    },
    reduceEffects: () => {
        SOUND_LAYERS['effects'].rampDown()
        console.log('`', 'reduceEffects');
    },
    increaseMusic: () => {
        SOUND_LAYERS['music'].rampUp()
        console.log('`', 'increaseMusic');
    },
    reduceMusic: () => {
        SOUND_LAYERS['music'].rampDown()
        console.log('`', 'reduceMusic');
    },
    pauseVoice: () => {
        SOUND_LAYERS['speaking'].rampDown()
        SOUND_LAYERS['effects'].rampUp(1,{volume:0.5})
        SOUND_LAYERS['music'].rampUp(1,{volume:0.5})
        console.log('`', 'pauseVoice');
    },
    resumeVoice: () => {
        SOUND_LAYERS['speaking'].rampUp()
        SOUND_LAYERS['effects'].rampDown(1,{volume:0.15})
        SOUND_LAYERS['music'].rampDown(1,{volume:0.15})
        console.log('`', 'resumeVoice');
    },
}
let GUI = new dat.GUI()
GUI.add(obj, 'increaseEffects')
GUI.add(obj, 'reduceEffects')
GUI.add(obj, 'increaseMusic')
GUI.add(obj, 'reduceMusic')
GUI.add(obj, 'pauseVoice')
GUI.add(obj, 'resumeVoice')