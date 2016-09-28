import dat from 'dat-gui';
import emitter from '../../utils/emitter';
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { locationChanged } from '../../actions/tour';
import { speakingChanged } from '../../actions/tour';
import { bearingChanged } from '../../actions/tour';
import { speakingPlayback } from '../../actions/tour';
import { dominantPlayback } from '../../actions/tour';
import { ambientPlayback } from '../../actions/tour';
import { nextLocation } from '../../actions/tour';
import { userCoordsChanged } from '../../actions/tour';
import { connect } from 'react-redux';

import Dervieur from '@samelie/deriveur';
import { LOCATIONS } from '@samelie/deriveur';
import {
  REMOTE_ASSETS_DIR
} from '../../constants/config';

const OUTSIDE_BARBI_NEAR = [
  { id: 'loc0', latitude: 51.518562, longitude: -0.092574, radius: 40 },
  { id: 'loc1', latitude: 51.520077, longitude: -0.095235, radius: 40 },
  { id: 'loc2', latitude: 51.519576, longitude: -0.090632, radius: 40 },
]

const PABLO = [
  { id: 'loc0', latitude: 37.849141, longitude: -122.285545, radius: 40 },
  { id: 'loc1', latitude: 37.848269, longitude: -122.285248, radius: 40 },
  { id: 'loc2', latitude: 37.847735, longitude: -122.286633, radius: 60 },
  { id: 'loc3', latitude: 37.847527, longitude: -122.288117, radius: 40 },
  { id: 'loc4', latitude: 37.847607, longitude: -122.288485, radius: 40 },
]

const PABLO2 = [
  { id: 'loc0', latitude: 37.849630, longitude: -122.285749, radius: 10 },
  { id: 'loc1', latitude: 37.849431, longitude: -122.285679, radius: 10 },
  { id: 'loc2', latitude: 37.849189, longitude: -122.285601, radius: 10 },
  { id: 'loc3', latitude: 37.848934, longitude: -122.285523, radius: 10 },
  /*{ id: 'loc4', latitude: 37.848934, longitude: -122.285235, radius: 10 },*/
]
const CCA = [
  { id: 'loc0', latitude: 37.767496, longitude: -122.399782, radius: 10 },
  { id: 'loc1', latitude: 37.767321, longitude: -122.399985, radius: 10 },
  { id: 'loc2', latitude: 37.767164, longitude: -122.399806, radius: 10 },
  { id: 'loc3', latitude: 37.767187, longitude: -122.399477, radius: 10 },
  /*{ id: 'loc4', latitude: 37.848934, longitude: -122.285235, radius: 10 },*/
]

/*const CARA = [
  { id: 'loc0', latitude: 51.575091, longitude: -0.086770, radius: 30 },
  { id: 'loc1', latitude: 51.574852, longitude: -0.086432, radius: 20 },
  { id: 'loc2', latitude: 51.575177, longitude: -0.086017, radius: 20 },
  { id: 'loc3', latitude: 51.575350, longitude: -0.086370, radius: 20 },
]*/

const CARA = [
  { id: 'loc0', latitude: 51.574840, longitude: -0.086101, radius: 10 },
  { id: 'loc1', latitude: 51.574806, longitude: -0.086753, radius: 10 },
  { id: 'loc2', latitude: 51.574756, longitude: -0.087582, radius: 20 },
  { id: 'loc3', latitude: 51.574783, longitude: -0.088020, radius: 20 },
]

const HOME_AREA = [
  { id: 'loc0', latitude: 51.584240, longitude: -0.106143, radius: 5 },
  { id: 'loc1', latitude: 51.584280, longitude: -0.105853, radius: 10 },
  { id: 'loc2', latitude: 51.584180, longitude: -0.106239, radius: 10 },
  { id: 'loc3', latitude: 51.584306, longitude: -0.105563, radius: 7 },
]
const ALHAMBRA = [
  { id: 'loc0', latitude: 37.7987, longitude: -122.42243, radius: 30 },
  { id: 'loc1', latitude: 37.79831, longitude: -122.42219, radius: 10 },
  { id: 'loc2', latitude: 37.79812, longitude: -122.42214, radius: 15 },
  { id: 'loc3', latitude: 37.7978, longitude: -122.42186, radius: 12 },
  { id: 'loc4', latitude: 37.79795, longitude: -122.42186, radius: 11 },
  { id: 'loc5', latitude: 37.79793, longitude: -122.42119, radius: 16 },
  { id: 'loc6', latitude: 37.79802, longitude: -122.42056, radius: 12 },
  { id: 'loc7', latitude: 37.79815, longitude: -122.42043, radius: 12 },
  { id: 'loc8', latitude: 37.79819, longitude: -122.42002, radius: 16 },
  { id: 'loc9', latitude: 37.79807, longitude: -122.41954, radius: 16 },
  { id: 'loc10', latitude: 37.7983, longitude: -122.41925, radius: 16 },
  { id: 'loc11', latitude: 37.79854, longitude: -122.41918, radius: 16 },
  { id: 'loc12', latitude: 37.7989, longitude: -122.41911, radius: 13 },
  { id: 'loc13', latitude: 37.79906, longitude: -122.41923, radius: 12 },
  { id: 'loc14', latitude: 37.79761, longitude: -122.41869, radius: 16 },
  { id: 'loc15', latitude: 37.79765, longitude: -122.41905, radius: 16 },
  { id: 'loc16', latitude: 37.79811, longitude: -122.41894, radius: 16 },
]
const HOME_AREA_WALK = [
  { id: 'loc0', latitude: 51.584364, longitude: -0.105178, radius: 30 },
  { id: 'loc1', latitude: 51.583858, longitude: -0.106303, radius: 30 },
  { id: 'loc2', latitude: 51.583762, longitude: -0.104612, radius: 30 },
  { id: 'loc3', latitude: 51.584331, longitude: -0.103272, radius: 60 },
]
const BAY_BRIDGE = [
  { id: 'loc0', latitude: 37.826881, longitude: -122.296759, radius: 1530 },
  { id: 'loc1', latitude: 37.812367, longitude: -122.362789, radius: 1530 },
  { id: 'loc2', latitude: 37.787170, longitude: -122.389178, radius: 1530 },
  { id: 'loc3', latitude: 37.789620, longitude: -122.422250, radius: 1600 },
]

class Deriveur extends Component {

  static propTypes = {
    alhambra: PropTypes.object.isRequired,
    browser: PropTypes.object.isRequired,
    tour: PropTypes.object.isRequired,
    locationChanged: PropTypes.func.isRequired,
    bearingChanged: PropTypes.func.isRequired,
    speakingChanged: PropTypes.func.isRequired,
  };


  constructor() {
    super()
    this.state = {
      experiencePaused: false
    };
  }

  componentDidMount() {
    emitter.on('tour:start', () => {
      this._initDeriveur()
    })
  }

  componentWillUnmount() {
    //this._devriveur.destroy()
    //this._devriveur = null
  }

  componentWillReceiveProps(nextProps) {
    let _t = nextProps.tour
    if (this.state.experiencePaused !== _t.experiencePaused) {
      if (_t.experiencePaused) {
        this._devriveur.pause()
      } else {
        this._devriveur.resume()
      }
      this.setState({ experiencePaused: _t.experiencePaused })
    }
  }

  _initDeriveur() {
    const {
      browser,
      alhambra,
      locationChanged,
      speakingChanged,
      dominantPlayback,
      bearingChanged,
      ambientPlayback,
      speakingPlayback,
      nextLocation,
      userCoordsChanged,
    } = this.props;

    if (this._devriveur) {
      return
    }
    this._devriveur = new Dervieur(alhambra.toArray(),
      ALHAMBRA, {
        noVisualMap: true,
        noGeo: false,
        mapUpdateSpeed: 2000,
        filterOnlyAudioFormats: Detector.IS_IOS ? 'mp3' : 'ogg',
        assetsUrl: REMOTE_ASSETS_DIR
      })
    this._devriveur.on('tour:nextlocation', (l) => {
      nextLocation(l)
    })
    this._devriveur.on('map:entering', (loc, index) => {
      locationChanged({
        location: loc,
        locationIndex: index,
        state: 'in'
      })
    })
    this._devriveur.on('map:leaving', (loc, index) => {
      locationChanged({
        location: loc,
        locationIndex: index,
        state: 'out'
      })
    })
    this._devriveur.on('map:bearing', (bearing) => {
      bearingChanged(bearing)
    })
    this._devriveur.on('map:update:user', (coords) => {
      userCoordsChanged(coords)
    })
    this._devriveur.on('sound:speaking:playing', () => {
      speakingPlayback(true)
    })
    this._devriveur.on('sound:speaking:ended', () => {
      speakingPlayback(false)
    })
    this._devriveur.on('sound:dominant:playing', () => {
      dominantPlayback(true)
    })
    this._devriveur.on('sound:dominant:ended', () => {
      dominantPlayback(false)
    })
    this._devriveur.on('sound:ambient:playing', () => {
      ambientPlayback(true)
    })
    this._devriveur.on('sound:ambient:ended', () => {
      ambientPlayback(false)
    })

    let O = {
      activeSounds: () => {
        let _sounds = this._devriveur.layers.layerSounds
        console.log(this._devriveur.layers.layerSounds);
      }
    }

    let GUI = new dat.GUI()
    GUI.add(O, 'activeSounds')
      //GUI.close()

  }

  render() {
    const { browser, alhambra, tour } = this.props;
    if (!alhambra.size) {
      return (
        <div></div>
      );
    }

    return (
      <div ref="deriveur" className="deriveur"></div>
    );
  }
}

export default connect(({ alhambra, browser, tour }) => ({
  alhambra,
  browser,
  tour,
}), {
  nextLocation,
  locationChanged,
  bearingChanged,
  speakingChanged,
  speakingPlayback,
  dominantPlayback,
  ambientPlayback,
  userCoordsChanged,
})(Deriveur);
