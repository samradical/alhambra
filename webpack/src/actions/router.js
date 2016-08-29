import { push } from 'react-router-redux';
import { toggleSidebarAuto } from './ui';

let _routerTimer;

export function pushRouter(url) {
	return (dispatch, getState) => {
		/* go to this url */
		dispatch(push(url));

		/* close siderbar after a timeout */
		if (!getState().ui.sidebarVisibility) return;
		if (_routerTimer) {
			clearTimeout();
			_routerTimer = null;
		}
		_routerTimer = setTimeout(() => {
			dispatch(toggleSidebarAuto(false));
		}, 50);
	};
}

export function changeLocale(locale) {
	return () => {
		document.location = locale;
	};
}
