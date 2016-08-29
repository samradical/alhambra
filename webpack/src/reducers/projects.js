import {
	LOAD_PROJECTS_SUCCESS,
	LOAD_PROJECTS_ERROR,
} from '../constants/action-types';

import { Record } from 'immutable';

/**
 * Record is like a class, but immutable and with default values.
 * https://facebook.github.io/immutable-js/docs/#/Record
 */
const InitialState = Record({
	hasFailed: false,
	list: [],
});
const initialState = new InitialState;

/**
 * [projects description]
 * @param  {Record} state  =  initialState [An immutable Record defined above]
 * @param  {function} action [Redux action. Defined in '/actions/terms.js']
 * @return {Record} a new copy of the state you passed into with any changes to it
 */
export default function projects(state = initialState, action) {
	switch (action.type) {
		case LOAD_PROJECTS_SUCCESS: {
			const _list = action.payload;
			return state
				.set('hasFailed', false)
				.set('list', _list);
		}
		case LOAD_PROJECTS_ERROR: {
			return state.set('hasFailed', true);
		}
		default: {
			return state;
		}
	}
}
