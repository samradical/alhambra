import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from '../containers/app/app';
import MapPage from '../containers/map-page/map-page';
import HomePage from '../containers/home-page/home-page';
import TourPage from '../containers/tour-page/tour-page';
import AboutPage from '../containers/about-page/about-page';
import CreditsPage from '../containers/credits-page/credits-page';

export default function configureRoutes() {
  return (
    <Route path="/" component={App}>
      <IndexRoute component={TourPage}/>
    </Route>
  );
}
