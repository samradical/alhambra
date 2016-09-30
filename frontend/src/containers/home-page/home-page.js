import './home-page.scss';

import {
  IMAGE_DIR,
  TIME_ON_LOCATION_COVER,
} from '../../constants/config';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

class HomePage extends Component {

  static propTypes = {
    browser: PropTypes.object.isRequired
  };

  componentDidMount() {
    this.show()
  }

  show() {
    this.refs.tourHome.classList.add('is-visible')
  }

  hide() {
    this.refs.tourHome.classList.remove('is-visible')
  }


  render() {
    const { browser } = this.props;
    return ( <div
      className = "o-page u-overlay tour-home"
      ref="tourHome"
      >
      <img src={`${IMAGE_DIR}home.svg`}></img>
        <div className="o-page tour-home--menu">
          <span className="home--title home-text home-top"><strong>THE ALHAMBRA PROJECT</strong></span>
          <Link key={'credits'} to={`credits`}>
            <span className="home-text home-right"><strong>CREDITS</strong></span>
          </Link>
          <Link key={'walk'} to={`walk`}>
            <span className="home-text home-bottom"><strong>TOUR</strong></span>
          </Link>
          <Link key={'map'} to={`map`}>
            <span className="home-text home-left"><strong>MAP</strong></span>
          </Link>
        </div>
      </div>
    );
  }
}


export default connect(({ browser }) => ({
  browser,
}))(HomePage);
