import './home-page.scss';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

class HomePage extends Component {

  static propTypes = {
    browser: PropTypes.object.isRequired
  };


  render() {
    const { browser } = this.props;
    return (
      <div className="o-page">
        <Link key={'tour'} to={`tour`}>
            <h1>Tour</h1>
        </Link>
        <Link key={'map'} to={`map`}>
            <h1>Map</h1>
        </Link>
        <Link key={'about'} to={`about`}>
            <h1>About</h1>
        </Link>
        <Link key={'credits'} to={`credits`}>
            <h1>Credits</h1>
        </Link>
      </div>
    );
  }
}


export default connect(({ browser }) => ({
  browser,
}))(HomePage);
