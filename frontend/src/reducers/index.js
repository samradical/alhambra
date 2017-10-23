import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import { createResponsiveStateReducer } from 'redux-responsive';

import alhambra from './alhambra';
import bodymovin from './bodymovin';
import locationCover from './location-cover';
import sequence from './sequence';
import tour from './tour';
import resize from './resize';
/*import terms from './terms';
import ui from './ui';
import projects from './projects';
import platform from './platform';*/

// Combine all reducers with routeReducer named `routing` into a single rootReducer
// See _media-queries.scss for media query sizes
export default combineReducers({
  routing,
  tour,
  alhambra,
  locationCover,
  bodymovin,
  sequence,
  resize,
  browser: createResponsiveStateReducer({
    mobile: 360,
    phablet: 540,
    tablet: 768,
    tabletH: 1024,
    desktop: 1280,
    desktopM: 1440,
    desktopL: 1680,
    desktopXL: 1920,
  }),
});

