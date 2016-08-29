function getFacebookUrl({ url = window.location }) {
	return `http://www.facebook.com/sharer/sharer.php?u=${url}`;
}

/**
 * [Return Twitter Sharer URL string]
 * @param String url [the URL to share]
 * @param Object twitter [{text (String), via (String), hashtags (Array)}]
 */
function getTwitterUrl({ url = window.location, twitter = {} }) {
	if (url.slice(-1) !== '/') url += '/';
	let path = `https://twitter.com/share?url=${url}&text=${window.encodeURIComponent(twitter.text)}`;
	if (twitter.via) path += `&via=${twitter.via}`;
	if (twitter.hashtags) path += `&hashtags=${twitter.hashtags.join()}`;
	return path;
}

function getGooglePlusUrl({ url = window.location }) {
	return `https://plus.google.com/share?url=${url}`;
}

/**
 * [Return Tumblr Sharer URL string]
 * @param String url [the URL to share]
 * @param Object twitter [{type (String), source (String), caption (String), tags (Array)}]
 */
function getTumblrUrl({ url = window.location, tumblr = {} }) {
	let path = `https://www.tumblr.com/share/${tumblr.type}?url=${url}`;
	if (tumblr.source) path += `&source=${tumblr.source}`;
	if (tumblr.caption) path += `&caption${window.encodeURIComponent(tumblr.caption)}`;
	if (tumblr.tags) path += `&tags=${tumblr.tags.join()}`;
	return path;
}

/**
 * [Return Pinterest Sharer URL string]
 * @param String url [the URL to share]
 * @param Object twitter [{media (String), description (String)}]
 */
function getPinterestUrl({ url = window.location, pinterest = {} }) {
	let path = `https://www.pinterest.com/pin/create/button/?url=${url}&media=${pinterest.media}`;
	if (pinterest.description) path +=
		`&description=${window.encodeURIComponent(pinterest.description)}`;
	return path;
}

/**
 * [Share a URL via a Social Network]
 * @param String network [One among 'facebook', 'twitter', 'google']
 * @param Object options [{url, text, via, hashtags}]
 */
export function getShareUrl(network, options) {
	if (!network) {
		console.error(`A "network" value must be defined. Pick one among "facebook", "twitter" or "google".`); // eslint-disable-line
		return false;
	}

	switch (network) {
		case 'facebook':
			return getFacebookUrl(options);
		case 'twitter':
			if (!options.twitter.text) {
				console.error(`A "text" value must be defined when sharing on Twitter.`); // eslint-disable-line
				return false;
			}
			return getTwitterUrl(options);
		case 'google':
			return getGooglePlusUrl(options);
		case 'tumblr':
			if (!options.tumblr.type) {
				console.error(`A "type" value must be defined for the post when sharing on Tumblr.`); // eslint-disable-line
				return false;
			}
			return getTumblrUrl(options);
		case 'pinterest':
			if (!options.pinterest.media) {
				console.error(`A "media" value must be defined when sharing on Pinterest.`); // eslint-disable-line
				return false;
			}
			return getPinterestUrl(options);
	}

	return false;
}
