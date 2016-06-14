var load = require('load-json-xhr');

import Emitter from './Emitter'
import Sound from './Sound'

let sound, cecilData, effectsData
let index = 1
console.log('`', 'HI, PRESS START!');

const G = 'https://storage.googleapis.com/samrad-alhambra/www-assets/prototype1/'

function productionAssets(data){
	data.children.map(file=>{
		let _p = file.path
		file.path = `${G}${_p}`
		return file
	})
	console.log(data);
}

function loadJson() {
    load('assets/json/cecil.json', function(err, data) {
        cecilData = data
        cecilData.index = 0
        productionAssets(cecilData)
    })

    load('assets/json/sam.json', function(err, data) {
        effectsData = data
        effectsData.index = 0
        productionAssets(effectsData)
    })

    let btn = document.getElementById('btn')

    btn.addEventListener('touchend', () => {
        play()
    })
    btn.addEventListener('mouseup', () => {
        play()
    })
}

loadJson()


function play() {
    let _d = Math.random() < 0.5 ? cecilData : effectsData
    let _i = _d.index
    if (_i > _d.length - 2) {
        _d.index = 0
    }
    sound = new Sound([
        _d.children[_i].path,
        _d.children[_i + 1].path
    ])
    _d.index += 2
}

Emitter.on('sound:ended', () => {
    sound.destroy()
    play()
})