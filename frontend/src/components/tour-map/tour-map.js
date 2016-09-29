import './tour-map.scss';

import {
  IMAGE_DIR,
  TIME_ON_LOCATION_COVER,
} from '../../constants/config';

import { showMap } from '../../actions/tour';
import Utils from '../../utils/utils';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import { connect } from 'react-redux';
import Loader from 'assets-loader'
import geolib from 'geolib'
import $ from 'jquery'

const MARKER_SIZE = 5
const BOUNDS = {
  tr: {
    latitude: 37.799961,
    longitude: -122.417489
  },
  tl: {
    latitude: 37.799104,
    longitude: -122.423969
  },
  br: {
    latitude: 37.796243,
    longitude: -122.423392,
  },
  bl: {
    latitude: 37.797024,
    longitude: -122.416850,
  }
}

class TourMap extends Component {

  constructor() {
    super()
    this.state = {
      positionX: 0,
      positionY: 0,
    }
  }

  componentDidMount() {

    this.setState({ coverStyle: { backgroundImage: `url(${IMAGE_DIR}map.svg)` } })

    this._distanceTopLeftBottomLeft = geolib.getDistance(
      BOUNDS.tl,
      BOUNDS.bl,
    )
    this._distanceTopLeftTopRight = geolib.getDistance(
      BOUNDS.tl,
      BOUNDS.tr,
    )
    this.setState({ userStyle: { left: 0, top: 0 } })
  }

  _latLngObj(pos) {
    return { latitude: pos.latitude, longitude: pos.longitude }
  }

  componentWillReceiveProps(nextProps) {
    let _t = nextProps.tour
    if (_t.mapVisible) {
      this.show()
    } else {
      this.hide()
    }

    if (_t.userCoords) {
      return
      this._calculateDistance(_t.userCoords)
    }
  }

  _calculateDistance(coords) {
    const { resize } = this.props;
    let _top = {
      latitude: BOUNDS.tl.latitude,
      longitude: coords.longitude
    }

    let _left = {
      longitude: BOUNDS.tl.longitude,
      latitude: coords.latitude
    }

    let _distanceTop = geolib.getDistance(BOUNDS.tl, _top)
    let _distanceLeft = geolib.getDistance(BOUNDS.tl, _left)

    let _w = $(this.refs.mapImg).width()
    let _h = $(this.refs.mapImg).height()

    //console.log(_w, _h);

    let _pW = Utils.clamp(_distanceLeft / this._distanceTopLeftTopRight, 0, 1)
    let _pH = Utils.clamp(_distanceTop / this._distanceTopLeftBottomLeft, 0, 1)

    //console.log(_pW, _pH);

    let __pW = (resize.orientation === 90) ? _pH : _pW
    let __pH = (resize.orientation === 90) ? _pW : _pH

    /*_pW = __pW
    _pH = __pH*/

    _pH -= MARKER_SIZE / 2
    _pW -= MARKER_SIZE / 2

    this.setState({ positionY: _pH })
    this.setState({ positionX: _pW })
    this.setState({ userStyle: { left: `${_pW}px`, top: `${_pH}px` } })
  }

  show() {
    this.refs.tourMap.classList.add('show')
  }

  hide() {
    this.refs.tourMap.classList.remove('show')
  }

  render() {
    const { browser, tour } = this.props;
    const {
      showMap,
    } = this.props

    return (<div
      className = "o-page tour-map"
      ref="tourMap"
      style = { this.state.coverStyle }>
      </div>);
    /*
    <div className="map-info">
          <div>{this.state.positionX}</div>
          <div>{this.state.positionY}</div>
        </div>
    */
  }
}

export default connect(({ browser, tour, resize }) => ({
  browser,
  tour,
  resize,
}), {
  showMap
})(TourMap);
