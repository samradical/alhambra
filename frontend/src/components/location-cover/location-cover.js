import './location-cover.scss';

import {
  IMAGE_DIR,
  TIME_ON_LOCATION_COVER,
} from '../../constants/config';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import { connect } from 'react-redux';

class LocationCover extends Component {

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    const { browser, tour } = this.props;
    let _n = nextProps.tour.locationIndex
    if (tour.locationIndex !== _n &&
      !isNaN(_n)
    ) {
      this._newLocation(nextProps.tour.locationIndex)
    }
  }

  _newLocation(index) {
    const { browser, tour } = this.props;
    if (!isNaN(tour.locationIndex)) {
      clearTimeout(this._to)
      this.refs.locationCover.classList.add('show')
      this.refs.locationCover.style.backgroundImage = `url(${IMAGE_DIR}tour/loc${tour.locationIndex}/cover.jpg)`
      this._to = setTimeout(() => {
        this.refs.locationCover.classList.remove('show')
      }, TIME_ON_LOCATION_COVER)
    }
  }

  render() {
    const { browser, tour } = this.props;
    return (
      <div ref="locationCover" className="o-page location-cover">
      </div>
    );
  }
}

export default connect(({ browser, tour }) => ({
  browser,
  tour,
}), {})(LocationCover);
