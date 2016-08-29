export function openPopup({ url = null, width = 557, height = 400 }) {
	return window.open(
		url,
		'_blank',
		`width=${width}, height=${height}, scrollbars=0, ` +
		`top=${(window.screen.height / 2) - (height / 2)},
		 left=${(window.screen.width / 2) - (width / 2)}`
	);
}
