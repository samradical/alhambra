import './bodymovin.scss';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import _ from 'lodash';

import {
  ASSETS_DIR,
  REMOTE_ASSETS_DIR,
} from '../../constants/config';

class Bodymovin extends Component {

  constructor() {
    super()
    this.state = {
      speakingPlaying: 0,
      dominantPlaying: 0,
      orientation: -1
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tour.dominantPlaying) {
      this._playShort()
    } else if (nextProps.tour.speakingPlaying) {
      this._playLong()
    }

    if (nextProps.tour.isIn) {
      if (nextProps.resize.orientation !== this.state.orientation) {
        this._shortAnimation(nextProps.tour.location.id, { autoplay: true })
        this._longAnimation(nextProps.tour.location.id, { autoplay: true })
      }
    } else if (nextProps.tour.nextLocation) {
      this._shortAnimation(nextProps.tour.nextLocation.id, { autoplay: true })
      this._longAnimation(nextProps.tour.nextLocation.id, { autoplay: true })
    }

    this.setState({ 'orientation': nextProps.resize.orientation })

  }

  _playShort() {
    if (!this._isPlayingLong) {
      return
    }
    this._isPlayingLong = false
    this.refs.bodymovinLong.classList.add('is-hidden')
    this.refs.bodymovinShort.classList.remove('is-hidden')
    if (this._bodyAnimShort) {
      this._bodyAnimShort.goToAndPlay(0, false)
    }
  }

  _playLong() {
    if (this._isPlayingLong) {
      return
    }
    this._isPlayingLong = true
    this.refs.bodymovinShort.classList.add('is-hidden')
    this.refs.bodymovinLong.classList.remove('is-hidden')
    if (this._bodyAnimLong) {
      this._bodyAnimLong.goToAndPlay(0, false)
    }
  }

  _newLocationAnimation() {
    const { tour } = this.props;
    const { bodymovin } = this.props;

    if (!isNaN(tour.locationIndex) &&
      this._locationIndex !== tour.locationIndex) {

      this._shortAnimation(tour.location.id)
      this._longAnimation(tour.location.id)

    }
    this._locationIndex = tour.locationIndex
  }

  _destroyShort() {
    if (this._bodyAnimShort) {
      this._bodyAnimShort.destroy()
      this._bodyAnimShort = null
    }
  }

  _shortAnimation(locationId, options = {}) {
    const BM = window.bodymovin
    var animData = {
      wrapper: this.refs.bodymovinShort,
      renderer: 'canvas',
      animType: 'canvas',
      loop: true,
      prerender: true,
      autoplay: false,
      path: `${REMOTE_ASSETS_DIR}bodymovin/${locationId}/visuals/color_long/data.json`,
      rendererSettings: {
        scaleMode: 'noScale',
      }
    };
    this._destroyShort()
    this._bodyAnimShort = BM.loadAnimation(_.assign({}, animData, options));
  }

  _longAnimation(locationId, options = {}) {
    const BM = window.bodymovin
    var animData = {
      wrapper: this.refs.bodymovinLong,
      renderer: 'canvas',
      animType: 'canvas',
      loop: true,
      prerender: true,
      autoplay: false,
      path: `${REMOTE_ASSETS_DIR}bodymovin/${locationId}/visuals/color_short/data.json`,
      rendererSettings: {
        scaleMode: 'scale',
      }
    };
    if (this._bodyAnimLong) {
      this._bodyAnimLong.destroy()
      this._bodyAnimLong = null
    }
    this._bodyAnimLong = BM.loadAnimation(_.assign({}, animData, options));
  }

  render() {
    const { browser, bodymovin, tour } = this.props;
    if (!bodymovin.size) {
      return (
        <div></div>
      );
    }

    //this._newLocationAnimation()
      //this._onNewSpeaking()

    return (
      <div>
        <div id="shortDom" ref="bodymovinShort" className="o-page bodymovin"></div>
        <div id="longAmb" ref="bodymovinLong" className="o-page bodymovin"></div>
      </div>
    );
  }
}

export default connect(({ bodymovin, browser, resize, tour }) => ({
  bodymovin,
  browser,
  resize,
  tour,
}), {})(Bodymovin);
