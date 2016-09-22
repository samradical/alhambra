import {
  TOUR_LOCATION_CHANGED,
  TOUR_SPEAKING_CHANGED,
  TOUR_BEARING_CHANGED,
  TOUR_SPEAKING_PLAYBACK,
  TOUR_DOMINANT_PLAYBACK,
  TOUR_AMBIENT_PLAYBACK,
  TOUR_NEXT_LOCATION,
} from '../constants/action-types';

export function locationChanged(payload = {}) {
  return {
    type: TOUR_LOCATION_CHANGED,
    payload: payload
  };
}

export function speakingChanged(payload = {}) {
  return {
    type: TOUR_SPEAKING_CHANGED,
    payload: payload
  };
}

export function bearingChanged(payload = {}) {
  return {
    type: TOUR_BEARING_CHANGED,
    payload: payload
  };
}

export function speakingPlaying(payload = {}) {
  return {
    type: TOUR_SPEAKING_PLAYING,
    payload: payload
  };
}

export function speakingPlayback(payload = {}) {
  return {
    type: TOUR_SPEAKING_PLAYBACK,
    payload: payload
  };
}

export function dominantPlayback(payload = {}) {
  return {
    type: TOUR_DOMINANT_PLAYBACK,
    payload: payload
  };
}
export function ambientPlayback(payload = {}) {
  return {
    type: TOUR_AMBIENT_PLAYBACK,
    payload: payload
  };
}
export function nextLocation(payload = {}) {
  return {
    type: TOUR_NEXT_LOCATION,
    payload: payload
  };
}
