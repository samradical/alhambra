import './app.scss';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadAlhambra } from '../../actions/alhambra';
import { loadBodymovin,bodymovinLoaded } from '../../actions/bodymovin';
import { loadSequence } from '../../actions/sequence';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class App extends Component {
  static propTypes = {
    // own props
    children: PropTypes.node.isRequired,
    // router props
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,

    //redux
    loadAlhambra: PropTypes.func.isRequired,
    loadBodymovin: PropTypes.func.isRequired,
    loadSequence: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { loadAlhambra, loadBodymovin, loadSequence } = this.props;
    setTimeout(() => {
      loadAlhambra()
      loadBodymovin()
      loadSequence()
    }, 500)

  }

  render() {
    return (
      <div className="app">
        {this.props.children}
      </div>
    );
  }
}

export default connect(state => ({}), {
  loadAlhambra,
  loadBodymovin,
  loadSequence,
})(App);
