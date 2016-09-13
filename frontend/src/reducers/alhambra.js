import {
  LOAD_ALHAMBRA_SUCCESS,
  LOAD_ALHAMBRA_ERROR,
} from '../constants/action-types';

import _ from 'lodash';
import { Record, Map, List } from 'immutable';

/**
 * Record is like a class, but immutable and with default values.
 * https://facebook.github.io/immutable-js/docs/#/Record
 */

let _vo = {
  speaking: {
    id: 'speaking',
    options: {
      sound: {
        fadeDownBeforeEnding: 0.4,
        howler: {
          volume: 1
        }
      }
    }
  },
  effects: {
    id: 'effects',
    options: {
      sound: {
        fadeDownBeforeEnding: 0.4,
        howler: {
          volume: 0.1
        }
      }
    }
  },
  music: {
    id: 'music',
    options: {
      sound: {
        fadeDownBeforeEnding: 0.4,
        howler: {
          volume: 0.07
        }
      }
    }
  }
}
const InitialState = List;

const initialState = new InitialState;

function _findFilesRecursive(location, layerId) {
  let _files = []

  function __re(children) {
    return children.map(child => {
      if (child.type === 'folder') {
        if (child.children) {
          return __re(child.children)
        }
        return child
      } else if(child.name !== '.DS_Store'){
        let url = process.env.REMOTE_ASSETS_DIR + 'tour/' + location.name + '/' + child.path.substring(child.path.indexOf(layerId), child.path.length)
        child.url = url
        _files.push(child)
        return child
      }
    })
  }

  let _correctType = location.children.filter(folder => {
    return folder.name === layerId
  })

  if (location.name === 'transitions') {
    __re(location.children)
  } else {
    __re(_correctType)
  }

  let _fileGroups = []
  for (var i = 0; i < _files.length; i += 2) {
    _fileGroups.push([_files[i], _files[i + 1]])
  }

  return {
    id: location.name,
    files: _fileGroups
  }
}

function parseJsonToLocation(json, layerId) {
  //speaking, music
  let _locations = []
  _.each(json.children, location => {
    if (location.type === 'folder') {
      _locations.push(_findFilesRecursive(location, layerId))
    }
  })
  return _locations
}

/**
 * [projects description]
 * @param  {Record} state  =  initialState [An immutable Record defined above]
 * @param  {function} action [Redux action. Defined in '/actions/terms.js']
 * @return {Record} a new copy of the state you passed into with any changes to it
 */
export default function alhambra(state = initialState, action) {
  switch (action.type) {
    case LOAD_ALHAMBRA_SUCCESS:
      {
        let _values = _.values(_vo)
        let _locations = _values.map(layer => {
          layer.locations = parseJsonToLocation(action.payload, layer.id)
          return layer
        })
        let _s = new List([..._locations])
        return _s
      }
    case LOAD_ALHAMBRA_ERROR:
      {
        return state.set('hasFailed', true);
      }
    default:
      {
        return state;
      }
  }
}
