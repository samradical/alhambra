import './location-cover.scss';

import {
  IMAGE_DIR,
  TIME_ON_LOCATION_COVER,
} from '../../constants/config';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import { showLocationCover } from '../../actions/tour';
import { coverLoaded } from '../../actions/location-cover';
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

  componentWillUnmount(){
    clearTimeout(this._to)
    if (this._preloader) {
      this._preloader.destroy()
      this._preloader = null
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    const { browser, tour, showLocationCover } = this.props;
    let _n = nextProps.tour.locationIndex
    if (tour.locationIndex !== _n &&
      !isNaN(_n) &&
      nextProps.tour.isIn
    ) {
      this._newLocation(nextProps.tour.locationIndex, nextProps.tour.isIn)
    }

    if(nextProps.tour.showLocationCover){
      this.show()
      setTimeout(()=>{
        showLocationCover(false)
      }, (Math.random() * 5 + 5) * 1000)
    }else if(!nextProps.tour.showLocationCover){
      this.hide()
    }

    if (nextProps.tour.isIn && nextProps.tour.dominantPlaying) {
      this.hide()
    }
    if (nextProps.locationCover.loaded !== this.props.locationCover.loaded) {
      window.LOADER_API.onCoverLoaded(nextProps.locationCover.loaded)
    }

    if (!nextProps.tour.isIn) {
      if (nextProps.tour.nextLocation !== tour.nextLocation) {
        this._setStateAndImage(nextProps.tour.nextLocation.id)
      }
    }
  }

  hide() {
    const { tour } = this.props;
    if(!tour.isIn){
      return
    }
    if(this._aNewLocation){
      return
    }
    clearTimeout(this._to)
    this.refs.locationCover.classList.remove('show')
  }

  show() {
    this.refs.locationCover.classList.add('show')
  }

  _preload(url, callback) {
    this.props.coverLoaded(false)
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
      this.props.coverLoaded(true)
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
    this.setState({ coverStyle: { backgroundImage: `url(${_url})` } })
    this.show()
  }


  render() {
    const { browser, tour } = this.props;
    return (<div ref = "locationCover" style = { this.state.coverStyle }
      className = "o-page location-cover">
      </div>
    );
  }
}

export default connect(({ browser, locationCover, tour }) => ({
  browser,
  locationCover,
  tour,
}), {
  showLocationCover,
  coverLoaded
})(LocationCover);
