import expect from 'expect';
import { UI_SIDEBAR_HIDE, UI_SIDEBAR_SHOW, UI_SIDEBAR_TOGGLE } from '../constants/action-types';

import { hideSidebar, showSidebar, toggleSidebar } from './ui';

describe('actions/ui', () => {
	it('should export action types of UI_SIDEBAR_HIDE UI_SIDEBAR_SHOW UI_SIDEBAR_TOGGLE', () => {
		expect(UI_SIDEBAR_HIDE).toEqual('UI_SIDEBAR_HIDE');
		expect(UI_SIDEBAR_SHOW).toEqual('UI_SIDEBAR_SHOW');
		expect(UI_SIDEBAR_TOGGLE).toEqual('UI_SIDEBAR_TOGGLE');
	});

	it('should create an action to hide sidebar', () => {
		const expectedAction = {
			type: UI_SIDEBAR_HIDE,
		};
		expect(hideSidebar()).toEqual(expectedAction);
	});

	it('should create an action to show sidebar', () => {
		const expectedAction = {
			type: UI_SIDEBAR_SHOW,
		};
		expect(showSidebar()).toEqual(expectedAction);
	});

	it('should create an action to toggle sidebar', () => {
		const status = true;
		const expectedAction = {
			type: UI_SIDEBAR_TOGGLE,
			status,
		};
		expect(toggleSidebar(status)).toEqual(expectedAction);
	});
});
