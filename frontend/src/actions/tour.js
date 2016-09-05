import {
  TOUR_LOCATION_CHANGED,
  TOUR_SPEAKING_CHANGED,
  TOUR_BEARING_CHANGED,
  TOUR_SPEAKING_PLAYBACK,
  TOUR_DOMINANT_PLAYBACK,
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
