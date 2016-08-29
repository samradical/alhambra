import {
	LOAD_PROJECTS,
} from '../constants/action-types';

import { JSON_DIR } from '../constants/config';
import fetch from '../utils/fetch';

export function loadProjects() {
	return {
		type: LOAD_PROJECTS,
		payload: {
			promise: fetch(`${JSON_DIR}projects.json`)
			.then(response => response.json()),
		},
	};
}
