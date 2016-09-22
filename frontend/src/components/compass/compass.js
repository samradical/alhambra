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
    resize: PropTypes.object.isRequired,
  };

  constructor() {
    super()
    this.state = {
      bearing: 0,
      orientation: 0
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
          _self._compassRotation = heading + _self.state.bearing +
            +_self.state.orientation
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
    this.setState({ 'orientation': nextProps.resize.orientation })
    if (nextProps.tour.state === 'out') {
      this.showCompass()
    } else {
      this.hideCompass()
    }
  }

  render() {
    const { browser, tour, resize } = this.props;
    if (!tour.nextLocation) {
      return (<div ref="view" className="o-page compass"></div>)
    }
    return (
      <div ref="view" className="o-page compass">
        <div className="compass-ui">
          <img ref="compassArrow" src={`${IMAGE_DIR}compass_arrow.svg`}></img>
          <div className="compass-title">next location:{tour.nextLocation.id}</div>
          <div className="compass-distance">{tour.nextLocation.distance} meters away</div>
          <div className="compass-distance">{tour.bearing}</div>
          <div className="compass-distance">{resize.orientation}</div>
        </div>
      </div>
    );
  }

  showCompass() {
    this.refs.view.classList.remove('is-hidden')
    this._compassHidden = false
  }

  hideCompass() {
    this.refs.view.classList.add('is-hidden')
    this._compassHidden = true
  }

  rotateCompass(heading) {
    if (!isNaN(heading) &&
      !this._compassHidden) {
      TweenMax.set(this.refs.compassArrow, {
        rotation: heading,
        transformOrigin: '50% 50%'
      })
    }
  }
}

export default connect(({ browser, tour, resize }) => ({
  browser,
  tour,
  resize,
}), {})(Compass);
