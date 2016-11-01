import './compass.scss';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import $ from 'jquery'
import TweenLite from 'gsap'
import {
  IMAGE_DIR
} from '../../constants/config';
import emitter from '../../utils/emitter';
import CUtil from './compass_util'

class Compass extends Component {

  static propTypes = {
    browser: PropTypes.object.isRequired,
    tour: PropTypes.object.isRequired,
    resize: PropTypes.object.isRequired,
  };

  constructor() {
    super()
    this._failC = 0
    this._bearing = 0
    this._tourState = undefined
    this._orientation = 0
    this.state = {

    }
  }

  _initComp() {
    let _self = this
    window.Compass.init((method) => {
    });

    this._cid = window.Compass.watch((heading) => {
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
      _self.rotateCompass(heading - (-_self._orientation))
    });

    window.Compass.noSupport(() => {
      console.error("NO COMP");
      this._failC += 1
    });
  }

  componentWillUnmount(){
    window.Compass.unwatch(this._cid);
  }

  shouldComponentUpdate(nextProps, nextState) {
    let _d = nextProps.tour.state !== this._tourState;
    this._tourState = nextProps.tour.state
    return _d
  }

  componentDidMount() {
    let _self = this
    setTimeout(() => {
      this.$compassArrow = $(this.refs.compassArrow)
      this._initComp()
    }, 2000)
    this.hideCompass()

    emitter.on('geoerror', ()=>{
      this.hideCompass()
    })
  }

  componentWillReceiveProps(nextProps) {
    this._bearing = nextProps.tour.bearing
    this._orientation = nextProps.resize.orientation
    if (nextProps.tour.state === 'out') {
      this.showCompass()
    } else {
      this.hideCompass()
    }
  }

  render() {
    const { browser, tour, resize } = this.props;
    return (
      <div ref="view" className="o-page compass">
        <div className="compass-ui">
          <img ref="compassArrow" src={`${IMAGE_DIR}compass_arrow.svg?z=${Math.random()}`}></img>
        </div>
      </div>
    );
  }

  /*
<div className="compass-title">next location:{tour.nextLocation.id}</div>
          <div className="compass-distance">{tour.nextLocation.distance} meters away</div>
          <div className="compass-distance">{this.state.bearing}</div>
          <div className="compass-distance">heading:{this.state.heading}</div>
          <div className="compass-distance">{resize.orientation}</div>
          <div className="compass-distance">{this.state.info}</div>
  */

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

      window.TweenLite.set(this.refs.compassArrow, { rotation: (-heading + this._bearing) });
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
