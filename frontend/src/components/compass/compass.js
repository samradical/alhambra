import './compass.scss';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import $ from 'jquery'
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
      heading: 0,
      orientation: 0,
      info: "Info..."
    };
    this._failC = 0
  }

  _initComp() {
    let _self = this
    window.Compass.init((method) => {
      this.setState({ 'info': 'window.Compass heading by ' + method })
    });

    window.Compass.watch((heading) => {
     /* if (heading > 180) {
        heading -= 360;
      }
      if (heading < -180) {
        heading += 360;
      }*/
      //_self._compassRotation = heading
     /* console.log(heading + _self.state.bearing +
        +_self.state.orientation);*/
        //console.log(_self.state.bearing);
      _self.rotateCompass(heading - (-_self.state.orientation))
    });

    window.Compass.noSupport(() => {
      console.error("NO COMP");
      this.setState({ 'info': "NO COMP" })
      this._failC += 1
    });
  }

  componentDidMount() {
    let _self = this
    setTimeout(() => {
        this.$compassArrow = $(this.refs.compassArrow)
        this._initComp()
      }, 2000)
      //this.hideCompass()

  }

  componentWillReceiveProps(nextProps) {
    this.setState({ 'bearing': nextProps.tour.bearing})
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
          <div className="compass-distance">{this.state.bearing}</div>
          <div className="compass-distance">heading:{this.state.heading}</div>
          <div className="compass-distance">{resize.orientation}</div>
          <div className="compass-distance">{this.state.info}</div>
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
    //this.setState({ 'heading': heading})

    if (!isNaN(heading) &&
      this.$compassArrow &&
      !this._compassHidden) {

      /*this.setState({ 'info': `_compassHidden:${this._compassHidden}...
      ${(-heading + this.state.bearing)}...
      this.$compassArrow: ${!!this.$compassArrow}` })*/

      TweenMax.set(this.refs.compassArrow, {rotation:(-heading + this.state.bearing)});
      //this.$compassArrow.css('-webkit-transform', 'rotate('(-heading + this.state.bearing) + 'deg)');
      //this.$compassArrow.css('transformOrigin', '50% 50%');
      /*TweenMax.set(this.refs.compassArrow, {
        rotation: heading,
        transformOrigin: '50% 50%'
      })*/
    }
  }
}

export default connect(({ browser, tour, resize }) => ({
  browser,
  tour,
  resize,
}), {})(Compass);
