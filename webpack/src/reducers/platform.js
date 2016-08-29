import { Record } from 'immutable';
const Detector = process.env.IS_BROWSER ? require('@stinkdigital/detector') : null;

const InitialState = Record({ ...Detector });
const initialState = new InitialState;

export default function platform(state = initialState) {
	return state;
}
