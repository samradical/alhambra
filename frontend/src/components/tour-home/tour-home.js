import './tour-home.scss';

import {
  IMAGE_DIR,
  TIME_ON_LOCATION_COVER,
} from '../../constants/config';

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

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    let _t = nextProps.tour
    if (_t.experiencePaused) {
      this.show()
    } else {
      this.hide()
    }
  }

  show() {
    this.refs.tourHome.classList.add('is-visible')
  }

  hide() {
    this.refs.tourHome.classList.remove('is-visible')
  }

  render() {
    const {
    } = this.props

    return ( <div
      className = "o-page u-overlay tour-home"
      ref="tourHome"
      >
      <img src={`${IMAGE_DIR}home.svg`}></img>
        <div className="o-page">
          <span className="home-top">ALHAMBRA</span>
          <Link key={'credits'} to={`credits`}>
            <span className="home-right">Credits</span>
          </Link>
          <Link key={'walk'} to={`walk`} onClick={()=>{
            emitter.emit('tour:home:close')
          }}>
            <span className="home-bottom">Tour</span>
          </Link>
          <Link key={'about'} to={`about`}>
            <span className="home-left">About</span>
          </Link>
        </div>
      </div>
    );
  }
}

export default connect(({ browser, tour }) => ({
  browser,
  tour,
}), {
})(TourMap);
