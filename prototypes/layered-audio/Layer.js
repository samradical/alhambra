import Emitter from './Emitter'
import Sound from './Sound'
import _ from 'lodash'

export default class Layer {
    constructor(data) {
        this._data = data
            //clone
        this._options = _.clone(this._data.options)
        delete this._data.options

        this._dataKeys = _.keys(this._data)
        this._sound = new Sound(this._options.sound)
        this._sound.endedSignal.add(() => {
            this._sound.destroy()
            this.playNext()
        })
    }

    start() {
        this.playNext()
    }

    pause() {
        this._sound.pause()
    }

    rampDown(duration = 1, options = { volume: 0, pause:true }) {
        this._sound.rampDown(duration,options)
    }

    rampUp(duration = 1, options = { volume: 1 }) {
        this._sound.rampUp(duration,options)
    }

    playNext() {
        let dataObj = this._data[this.getRandomDataKey()]
        let _data = dataObj.data
        let _i = dataObj.index
        if (_i > _data.length - 2) {
            dataObj.index = 0
        }

        this._sound.newSound([
            _data.children[_i].path,
            _data.children[_i + 1].path
        ])

        dataObj.index += 2
    }

    getRandomDataKey() {
        let _r = Math.floor(Math.random() * this._dataKeys.length)
        return this._dataKeys[_r]
    }
}