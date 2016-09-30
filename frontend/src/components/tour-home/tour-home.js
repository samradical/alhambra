import './tour-home.scss';

import {
  IMAGE_DIR,
  TIME_ON_LOCATION_COVER,
} from '../../constants/config';
import { experiencePaused } from '../../actions/tour';
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import { connect } from 'react-redux';
import Loader from 'assets-loader'
import emitter from '../../utils/emitter';

class TourMap extends Component {

  constructor() {
    super()
  }

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
    const {
      showMap,
      experiencePaused,
    } = this.props

    return ( <div
      className = "o-page u-overlay tour-home"
      ref="tourHome"
      >
      <img src={`${IMAGE_DIR}home.svg`}></img>
        <div className="o-page tour-home--menu">
          <span className="home--title home-text home-top"><strong>THE ALHAMBRA PROJECT</strong></span>
            <a href={"http://"+window.location.host + process.env.APP_DOMAIN+"/credits"} className="home-text home-right"><strong>CREDITS</strong></a>
            <a href={"http://"+window.location.host +process.env.APP_DOMAIN+"/map"}className="home-text home-left"><strong>MAP</strong></a>
            <span className="home-text home-bottom" onClick={()=>{
              experiencePaused(false)
            }}><strong>BACK</strong></span>
        </div>
      </div>
    );
  }
}

export default connect(({ browser, tour }) => ({
  browser,
  tour,
}), {
  experiencePaused,
})(TourMap);
