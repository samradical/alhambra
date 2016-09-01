import './bodymovin.scss';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import {
  ASSETS_DIR
} from '../../constants/config';

class Bodymovin extends Component {

  constructor() {
    super()
    this.state = {
      locationIndex: false,
    };
  }

  componentDidMount() {

  }

  _onNewSpeaking() {
    const { bodymovin } = this.props;
    const locIndex = this._locationIndex
    if (this._bodyAnim && !isNaN(locIndex)) {
      let _roll = Math.floor(Math.random() * 3)
      let l_ = this._bodyAnim.getAnimationLayers()
      if (l_.length) {
        let _arr = bodymovin.toArray()
        let _ll1 = _arr[locIndex].layers[1].colors[_roll]
        let _ll2 = _arr[locIndex].layers[2].colors[_roll]
        l_[1].stylesList[0].co = `rgb(${_ll1[0]},${_ll1[1]},${_ll1[2]})`
        l_[2].stylesList[0].co = `rgb(${_ll2[0]},${_ll2[1]},${_ll2[2]})`
      }
    }
  }

  _newLocationAnimation() {
    const { tour } = this.props;
    const { bodymovin } = this.props;
    const BM = window.bodymovin
    if (!isNaN(tour.locationIndex) &&
        this._locationIndex !== tour.locationIndex) {
      var animData = {
        wrapper: this.refs.bodymovin,
        renderer: 'canvas',
        animType: 'canvas',
        loop: true,
        prerender: true,
        autoplay: true,
        path: `${ASSETS_DIR}bodymovin/${tour.locationIndex}/data.json`,
        rendererSettings: {
        }
      };
      if(this._bodyAnim){
        this._bodyAnim.destroy()
        this._bodyAnim = null
      }
      this._bodyAnim = BM.loadAnimation(animData);
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
      <div ref="bodymovin" className="o-page bodymovin"></div>
    );
  }
}

export default connect(({ bodymovin, browser, tour }) => ({
  bodymovin,
  browser,
  tour,
}), {})(Bodymovin);
