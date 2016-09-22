import './location-cover.scss';

import {
  IMAGE_DIR,
  TIME_ON_LOCATION_COVER,
} from '../../constants/config';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import { connect } from 'react-redux';
import Loader from 'assets-loader'

class LocationCover extends Component {

  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    this.setState({ coverStyle: { backgroundImage: `url()` } })
  }

  componentWillReceiveProps(nextProps) {
    const { browser, tour } = this.props;
    let _n = nextProps.tour.locationIndex
    if (tour.locationIndex !== _n &&
      !isNaN(_n) &&
      nextProps.tour.isIn
    ) {
      this._newLocation(nextProps.tour.locationIndex, nextProps.tour.isIn)
    }

    if (nextProps.tour.ambientPlaying) {
      this.show()
    } else {
      this.hide()
    }

    if (!nextProps.tour.isIn) {
      if (nextProps.tour.nextLocation) {
        this._setStateAndImage(nextProps.tour.nextLocation.id)
      }
    }
  }

  hide() {
    if(this._aNewLocation){
      return
    }
    clearTimeout(this._to)
    this.refs.locationCover.classList.remove('show')
  }

  show() {
    clearTimeout(this._to)
    this.refs.locationCover.classList.add('show')
  }

  _preload(url, callback) {
    if (this._preloader) {
      this._preloader.destroy()
      this._preloader = null
    }
    this._preloader = new Loader({
      assets: [{
        url: url
      }]
    })
    this._preloader.on('complete', (map) => {
      callback()
      this._preloader.destroy()
      this._preloader = null
    })
    this._preloader.start()
  }


  _newLocation(index, isIn) {
    const { browser, tour } = this.props;
    if (!isNaN(index)) {
      clearTimeout(this._to)
      let _url = `${IMAGE_DIR}tour/loc${index}/cover.jpg`
      this._preload(
        _url,
        () => {
          if (isIn) {
            this.show()
          }
          this._aNewLocation = true
          this.setState({ coverStyle: { backgroundImage: `url(${_url})` } })
          this._to = setTimeout(() => {
            this._aNewLocation = false
            this.hide()
          }, TIME_ON_LOCATION_COVER)
        })
    }
  }

  _setStateAndImage(locationId) {
    let _url = `${IMAGE_DIR}tour/${locationId}/cover.jpg`
    console.log(_url);
    this.setState({ coverStyle: { backgroundImage: `url(${_url})` } })
    this.show()
  }


  render() {
    const { browser, tour } = this.props;
    return ( < div ref = "locationCover"
      style = { this.state.coverStyle }
      className = "o-page location-cover" >
      < /div>
    );
  }
}

export default connect(({ browser, tour }) => ({
  browser,
  tour,
}), {})(LocationCover);
