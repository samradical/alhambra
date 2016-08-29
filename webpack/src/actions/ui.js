import {
	UI_SIDEBAR_HIDE,
	UI_SIDEBAR_SHOW,
	UI_SIDEBAR_TOGGLE,
	UI_SIDEBAR_AUTO,
	UI_SOUND_MUTE,
	UI_SOUND_UNMUTE,
	UI_SOUND_TOGGLE,
	UI_SHARE,
} from '../constants/action-types';

export function hideSidebar() {
	return {
		type: UI_SIDEBAR_HIDE,
	};
}

export function showSidebar() {
	return {
		type: UI_SIDEBAR_SHOW,
	};
}

export function toggleSidebar(status) {
	return {
		type: UI_SIDEBAR_TOGGLE,
		status,
	};
}

export function toggleSidebarAuto(status) {
	return {
		type: UI_SIDEBAR_AUTO,
		status,
	};
}

export function muteSound() {
	return {
		type: UI_SOUND_MUTE,
	};
}

export function unmuteSound() {
	return {
		type: UI_SOUND_UNMUTE,
	};
}

export function toggleSound(status) {
	return {
		type: UI_SOUND_TOGGLE,
		status,
	};
}

export function share(network, url) {
	return {
		type: UI_SHARE,
		payload: {
			network,
			url,
		},
	};
}
