/* global ga */

export default class GoogleAnalytics {
	constructor() {
		this.name = 'Google Analytics';
	}

	checkGa() {
		return !('ga' in window) || typeof ga === 'undefined';
	}

	pageView(...args) {
		return this.track(...args);
	}

	/* https://developers.google.com/analytics/devguides/collection/analyticsjs/events */
	eventTrack(eventName, params) {
		if (!this.checkGa) return;
		ga('send', params);
		return;
	}

	/* https://developers.google.com/analytics/devguides/collection/analyticsjs/pages */
	track(eventName, params) {
		if (!this.checkGa) return;
		if (eventName === 'pageView') {
			const { pathname, search, hash } = params;
			ga('send', {
				hitType: eventName,
				page: pathname + search + hash,
			});
			return;
		}
	}

	/* https://developers.google.com/analytics/devguides/collection/analyticsjs/social-interactions#overview */
	// socialNetwork , socialAction, socialTarget
	social(network, action, target) {
		if (!this.checkGa) return;
		ga('send', {
			hitType: 'social',
			socialNetwork: network,
			socialAction: action,
			socialTarget: target,
		});
	}
 }
