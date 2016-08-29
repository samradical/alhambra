import React from 'react';
import {  Route, IndexRoute } from 'react-router';

import App from '../containers/app/app';

export default function configureRoutes() {
	return (
		<Route>
      <IndexRoute component={App}>
      </IndexRoute>
		</Route>
	);
}
