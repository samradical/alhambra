import './app.scss';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { loadTerms } from '../../actions/terms';

class App extends Component {

  componentDidMount() {}

  render() {
    return (
      <div className="app">
      </div>
    );
  }
}

export default connect(state => ({
  platform: state.platform,
}), {
  loadTerms,
})(App);
