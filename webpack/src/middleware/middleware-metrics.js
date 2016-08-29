/* middleware for Redux */

import { createMetrics } from 'react-metrics';
import GoogleAnalytics from '../utils/analytics/google-analytics';
import {
	LOCATION_CHANGE,
} from 'react-router-redux';
import {
	UI_SIDEBAR_HIDE,
	UI_SIDEBAR_SHOW,
	UI_SIDEBAR_TOGGLE,
	UI_SOUND_MUTE,
	UI_SOUND_UNMUTE,
	UI_SOUND_TOGGLE,
	UI_SHARE,
} from '../constants/action-types';

// google tag manager

// TODO move this config?
// TODO is pageDefaults needed?
const config = {
	vendors: [{
		api: new GoogleAnalytics(),
	}],
	pageDefaults: () => {
		const timestamp = new Date();
		return {
			timestamp,
			build: process.env.VERSION,
			siteName: 'REACT TEST',
		};
	},
	pageViewEvent: 'pageView',
	debug: false,
};

const metrics = createMetrics(config);

export default function middlewareMetrics({ getState }) {
	return next => action => {
		const returnValue = next(action);
		const state = getState();
		switch (action.type) {
			case LOCATION_CHANGE:
				metrics.setRouteState(action.payload);
				metrics.api.pageView(action.payload);
				break;
			case UI_SIDEBAR_HIDE:
			case UI_SIDEBAR_SHOW:
			case UI_SIDEBAR_TOGGLE:
				metrics.api.eventTrack(action.type, {
					hitType: 'event',
					eventCategory: 'UI',
					eventAction: 'click',
					eventLabel: action.type,
					eventValue: state.ui.sidebarVisibility ? 1 : 0,
				});
				break;
			case UI_SOUND_MUTE:
			case UI_SOUND_UNMUTE:
			case UI_SOUND_TOGGLE:
				metrics.api.eventTrack(action.type, {
					hitType: 'event',
					eventCategory: 'UI',
					eventAction: 'click',
					eventLabel: action.type,
					eventValue: state.ui.soundAudibility ? 1 : 0,
				});
				break;
			case UI_SHARE:
				metrics.api.eventTrack(action.type, {
					hitType: 'social',
					socialNetwork: action.payload.network,
					socialAction: 'share',
					socialTarget: action.payload.url,
				});
				break;
		}
		return returnValue;
	};
}
