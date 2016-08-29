import ProxyP from 'proxy-polyfill'
export default class SoundProxy {
    constructor(options, callback) {
        this._options = options
        this._p = this._createProxy(this._options,callback)
    }

    get p(){
    	return this._p
    }

    _createProxy(o, fn) {
        return new Proxy(o, {
            set(target, property, value) {
                fn(property, value);
                target[property] = value;
                return true
            },
        })
    }
}