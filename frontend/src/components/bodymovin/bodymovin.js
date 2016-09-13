import './bodymovin.scss';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

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
    const BM = window.bodymovin
    if (!isNaN(tour.locationIndex) &&
      this._locationIndex !== tour.locationIndex) {
      var animData = {
        wrapper: this.refs.bodymovinShort,
        renderer: 'canvas',
        animType: 'canvas',
        loop: true,
        prerender: true,
        autoplay: false,
        path: `${REMOTE_ASSETS_DIR}bodymovin/loc${tour.locationIndex}/visuals/color_short/data.json`,
        rendererSettings: {}
      };
      if (this._bodyAnimShort) {
        this._bodyAnimShort.destroy()
        this._bodyAnimShort = null
      }
      this._bodyAnimShort = BM.loadAnimation(animData);


      var animData = {
        wrapper: this.refs.bodymovinLong,
        renderer: 'canvas',
        animType: 'canvas',
        loop: true,
        prerender: true,
        autoplay: false,
        path: `${REMOTE_ASSETS_DIR}bodymovin/loc${tour.locationIndex}/visuals/color_long/data.json`,
        rendererSettings: {}
      };
      if (this._bodyAnimLong) {
        this._bodyAnimLong.destroy()
        this._bodyAnimLong = null
      }
      this._bodyAnimLong = BM.loadAnimation(animData);

    }
    this._locationIndex = tour.locationIndex
  }

  render() {
    const { browser, bodymovin, tour } = this.props;
    if (!bodymovin.size) {
      return (
        <div></div>
      );
    }

    this._newLocationAnimation()
      //this._onNewSpeaking()

    return (
      <div>
        <div id="shortDom" ref="bodymovinShort" className="o-page bodymovin"></div>
        <div id="longAmb" ref="bodymovinLong" className="o-page bodymovin"></div>
      </div>
    );
  }
}

export default connect(({ bodymovin, browser, tour }) => ({
  bodymovin,
  browser,
  tour,
}), {})(Bodymovin);
