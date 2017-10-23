import {
  LOAD_BODYMOVIN,
  BODYMOVIN_LOADED,
  LOAD_BODYMOVIN_SUCCESS,
  LOAD_BODYMOVIN_ERROR,
} from "../constants/action-types"

import _ from "lodash"
import { Record, Map, List } from "immutable"

/**
 * Record is like a class, but immutable and with default values.
 * https://facebook.github.io/immutable-js/docs/#/Record
 */
const InitialState = Record({
  list: null,
  loaded: false,
})

const initialState = new InitialState()

/**
 * [projects description]
 * @param  {Record} state  =  initialState [An immutable Record defined above]
 * @param  {function} action [Redux action. Defined in '/actions/terms.js']
 * @return {Record} a new copy of the state you passed into with any changes to it
 */
export default function bodymovin(state = initialState, action) {
  switch (action.type) {
    case LOAD_BODYMOVIN: {
      return state.set("loaded", false)
    }
    case BODYMOVIN_LOADED: {
      return state.set("loaded", action.payload)
    }
    case LOAD_BODYMOVIN_SUCCESS: {
      return state.set("list", new List([...action.payload]))
    }
    case LOAD_BODYMOVIN_ERROR: {
      return state.set("loaded", false)
    }
    default: {
      return state
    }
  }
}
