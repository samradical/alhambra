import {
  TOUR_LOCATION_CHANGED,
  TOUR_BEARING_CHANGED,
  TOUR_SPEAKING_CHANGED,
  TOUR_SPEAKING_PLAYBACK,
  TOUR_DOMINANT_PLAYBACK,
  TOUR_AMBIENT_PLAYBACK,
  TOUR_NEXT_LOCATION,
  TOUR_SHOW_MAP,
  TOUR_USER_COORDS_CHANGED,
  TOUR_PAUSE_EXPERIENCE,
} from '../constants/action-types';

import { Record } from 'immutable';

/**
 * Record is like a class, but immutable and with default values.
 * https://facebook.github.io/immutable-js/docs/#/Record
 */
const InitialState = Record({
  location: {
    distance: 1
  },
  experiencePaused:false,
  userCoords:null,
  mapVisible: false,
  locationIndex: NaN,
  speakingCounter: 0,
  isIn: false,
  state: 'out',
  bearing: 0,
  speakingPlaying: false,
  dominantPlaying: false,
  ambientPlaying: false,
  nextLocation: null,
});

const initialState = new InitialState;

/**
 * [projects description]
 * @param  {Record} state  =  initialState [An immutable Record defined above]
 * @param  {function} action [Redux action. Defined in '/actions/terms.js']
 * @return {Record} a new copy of the state you passed into with any changes to it
 */
export default function tour(state = initialState, action) {
  switch (action.type) {
    case TOUR_LOCATION_CHANGED:
      {
        return state.set('location', action.payload.location)
          .set('locationIndex', action.payload.locationIndex)
          .set('state', action.payload.state)
          .set('isIn', (action.payload.state === 'in'))
      }
    case TOUR_SPEAKING_CHANGED:
      {
        let _c = state.get('speakingCounter')
        return state.set('speakingCounter', _c + 1)
      }
    case TOUR_BEARING_CHANGED:
      {
        return state.set('bearing', action.payload)
      }
    case TOUR_SPEAKING_PLAYBACK:
      {
        return state.set('speakingPlaying', action.payload)
      }
    case TOUR_DOMINANT_PLAYBACK:
      {
        return state.set('dominantPlaying', action.payload)
      }
      case TOUR_AMBIENT_PLAYBACK:
      {
        return state.set('ambientPlaying', action.payload)
      }
      case TOUR_NEXT_LOCATION:
      {
        return state.set('nextLocation', action.payload)
      }
      case TOUR_SHOW_MAP:
      {
        return state.set('mapVisible', action.payload)
      }
      case TOUR_USER_COORDS_CHANGED:
      {
        return state.set('userCoords', action.payload)
      }
      case TOUR_PAUSE_EXPERIENCE:
      {
        return state.set('experiencePaused', action.payload)
      }
    default:
      {
        return state;
      }
  }
}
