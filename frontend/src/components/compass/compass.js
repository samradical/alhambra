import './compass.scss';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import TweenLite from 'gsap'
import {
  IMAGE_DIR
} from '../../constants/config';
import CUtil from './compass_util'

class Compass extends Component {

  static propTypes = {
    browser: PropTypes.object.isRequired,
    tour: PropTypes.object.isRequired,
  };

  constructor() {
    super()
    this.state = {
      bearing: 0,
    };
  }

  componentDidMount() {
    let _self = this
    setTimeout(() => {
      window.Compass.init((method) => {
        console.log('window.Compass heading by ' + method);
      });

      window.Compass.watch((heading) => {
        if (heading > 180) {
          heading -= 360;
        }
        if (heading < -180) {
          heading += 360;
        }
        _self._compassRotation = heading + _self.state.bearing
        _self.rotateCompass(_self._compassRotation)
      });

      window.Compass.noSupport(() => {
        console.error("NO COMP");
      });
    }, 2000)
    //this.hideCompass()
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ 'bearing': nextProps.tour.bearing })
    if(nextProps.tour.state === 'out'){
      this.showCompass()
    }else{
      //this.hideCompass()
    }
  }

  render() {
    const { browser, tour } = this.props;
    return (
      <div className="o-page compass">
        <div className="compass-ui">
          <img ref="compass" src={`${IMAGE_DIR}compass_arrow.svg`}></img>
          <div className="compass-title">next location:{tour.location.id}</div>
          <div className="compass-distance">{tour.location.distance} meters away</div>
        </div>
      </div>
    );
  }

  showCompass() {
    this.refs.compass.classList.remove('is-hidden')
    this._compassHidden = false
  }

  hideCompass() {
    this.refs.compass.classList.add('is-hidden')
    this._compassHidden = true
  }

  rotateCompass(heading) {
    if (!isNaN(heading) &&
      !this._compassHidden) {
      TweenMax.set(this.refs.compass, {
        rotation: heading,
        transformOrigin: '50% 50%'
      })
    }
  }
}

export default connect(({ browser, tour }) => ({
  browser,
  tour,
}), {})(Compass);
