import {
  COVER_LOADED,
} from "../constants/action-types"

export function coverLoaded(payload) {
  return {
    type: COVER_LOADED,
    payload,
  }
}
