import H from 'howler'
import Signals from 'signals'
import _ from 'lodash'
import SoundProxy from './SoundProxy'
import TweenLite from 'gsap';

export default class Sound {
    constructor(options = {}) {
        this._options = options
        this._sProxy = new SoundProxy(this._options, (prop, val) => { this.onPropertyChanged(prop, val) })
        this.endedSignal = new Signals()
    }

    onPropertyChanged(prop, val) {
        if (this._s[prop]) {
            this._s[prop](val)
        }
    }

    newSound(paths) {
        this._s = new H.Howl(_.merge({
            urls: paths,
            autoplay: true,
            loop: false,
            onend: () => {
                console.log('`', 'Sound Ended');
                this.endedSignal.dispatch()
            }
        }, this._options));
        this._isPaused = false
    }

    rampUp(duration, options) {
        this.play()
        TweenLite.to(this._sProxy.p, duration,
            _.merge(options, {
                overwrite: 1,
                onComplete: () => {

                }
            })
        )
    }

    play() {
        if (this._isPaused) {
            this._isPaused = false
            this._s.play()
        }
    }

    pause() {
        this._isPaused = true
        this._s.pause()
    }

    rampDown(duration, options) {
        TweenLite.to(this._sProxy.p, duration,
            _.merge(options, {
                overwrite: 1,
                onComplete: () => {
                    if (options.pause || this._options === 0) {
                        this.pause()
                    }
                }
            })
        )
    }

    destroy() {
        console.log('`', 'Sound destroyed');
        this._s.unload()
        this._s = null
    }
}