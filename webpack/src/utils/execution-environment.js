/* Taken from https://github.com/facebook/fbjs/blob/master/src/core/ExecutionEnvironment.js */

export const canUseDOM = !!(
	typeof window !== 'undefined' &&
	window.document &&
	window.document.createElement
);

export const canUseEventListeners = (
	canUseDOM && !!(window.addEventListener || window.attachEvent)
);

const ExecutionEnvironment = {

	canUseDOM,

	canUseWorkers: typeof Worker !== 'undefined',

	canUseEventListeners,

	canUseViewport: canUseDOM && !!window.screen,

	// For now, this is true - might change in the future.
	isInWorker: !canUseDOM,

};
export default ExecutionEnvironment;
