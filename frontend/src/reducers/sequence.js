import {
  LOAD_SEQUENCE_SUCCESS,
  LOAD_SEQUENCE_ERROR,
} from '../constants/action-types';
import {
  ASSETS_DIR
} from '../constants/config';

import _ from 'lodash';
import { Record, Map, List } from 'immutable';

/**
 * Record is like a class, but immutable and with default values.
 * https://facebook.github.io/immutable-js/docs/#/Record
 */
const InitialState = List;

const initialState = new InitialState;

function _prepPayload(json){
  json.forEach(location=>{
    location.images = `${ASSETS_DIR}${location.images}`
    location.pack = `${ASSETS_DIR}${location.pack}`
  })
  console.log("-----------");
  console.log("-----------");
  console.log(json);
  return json
}

/**
 * [projects description]
 * @param  {Record} state  =  initialState [An immutable Record defined above]
 * @param  {function} action [Redux action. Defined in '/actions/terms.js']
 * @return {Record} a new copy of the state you passed into with any changes to it
 */
export default function sequence(state = initialState, action) {
  switch (action.type) {
    case LOAD_SEQUENCE_SUCCESS:
      {
        let _s = new List([..._prepPayload(action.payload)])
        return _s
      }
    case LOAD_SEQUENCE_ERROR:
      {
        return state.set('hasFailed', true);
      }
    default:
      {
        return state;
      }
  }
}
