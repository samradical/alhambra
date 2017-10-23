import {
  LOAD_SEQUENCE,
  SEQUENCE_LOADED,
} from '../constants/action-types';

import { JSON_DIR } from '../constants/config';
import fetch from '../utils/fetch';

export function loadSequence() {
  return {
    type: LOAD_SEQUENCE,
    payload: {
      promise: fetch(`${JSON_DIR}magipack_manifest.json`)
        .then(response => {
          let _r = response.json()
          return _r;
        })
    },
  };
}

export function sequenceLoaded(payload) {
  return {
    type: SEQUENCE_LOADED,
    payload:payload
  };
}
