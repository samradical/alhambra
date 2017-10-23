import {
  COVER_LOADED,
} from "../constants/action-types"

import _ from "lodash"
import { Record, Map, List } from "immutable"

const InitialState = Record({
  loaded: false,
})

const initialState = new InitialState()

export default function locationCover(state = initialState, action) {
  switch (action.type) {
    case COVER_LOADED: {
      return state.set("loaded", action.payload)
    }
    default: {
      return state
    }
  }
}
