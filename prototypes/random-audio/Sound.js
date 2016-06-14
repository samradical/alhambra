import Sono from '@stinkdigital/sono'
import H from 'howler'
import Emitter from './Emitter'

export default class Sound {
    constructor(paths = []) {
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
        this._s = new H.Howl({
            urls: paths,
            autoplay: true,
            loop: false,
            onend: function() {
                console.log('`', 'Sound Ended');
                Emitter.emit('sound:ended')
            }
        });

    }

    destroy() {
        console.log('`', 'Sound destroyed');
        //this._s.destroy()
        this._s.unload()
    }
}