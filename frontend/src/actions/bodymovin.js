import {
  LOAD_BODYMOVIN,
  BODYMOVIN_LOADED,
} from "../constants/action-types"

import { JSON_DIR } from "../constants/config"
import fetch from "../utils/fetch"

export function loadBodymovin() {
  return {
    type: LOAD_BODYMOVIN,
    payload: {
      promise: fetch(`${JSON_DIR}bodymovin.json`).then(response => {
        let _r = response.json()
        return _r
      }),
    },
  }
}

export function bodymovinLoaded(payload) {
  return {
    type: BODYMOVIN_LOADED,
    payload: payload,
  }
}
