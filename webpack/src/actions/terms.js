import {
	LOAD_TERMS,
} from '../constants/action-types';

import { JSON_DIR } from '../constants/config';
import fetch from '../utils/fetch';

export function loadTerms(locale) {
	return {
		type: LOAD_TERMS,
		payload: {
			promise: fetch(`${JSON_DIR}locale/${locale}.json`)
			.then(response => response.json()),
			data: locale,
		},
	};
}
