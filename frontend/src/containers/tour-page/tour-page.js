import './tour-page.scss';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import Bodymovin from '../../components/bodymovin/bodymovin';
import Sequence from '../../components/sequence/sequence';
import Compass from '../../components/compass/compass';
import LocationCover from '../../components/location-cover/location-cover';
import TourMap from '../../components/tour-map/tour-map';
import TourHome from '../../components/tour-home/tour-home';
import TourUi from '../../components/tour-ui/tour-ui';
import Dervieur from '../../components/deriveur/deriveur';
import NotFound from '../notfound-page/notfound-page';
class TourPage extends Component {

  static propTypes = {
    alhambra: PropTypes.object.isRequired,
    bodymovin: PropTypes.object.isRequired,
    browser: PropTypes.object.isRequired,
    tour: PropTypes.object.isRequired,
  };

  componentDidMount() {}

  render() {
    const { browser, alhambra, bodymovin, tour } = this.props;

    let _pass = true
    if (Detector.IS_DESKTOP) {
      _pass = false
    } else {
      if (Detector.IS_MOBILE) {
        if (Detector.IS_IPHONE) {
          if (Detector.IOS_VERSION < 7) {
            _pass = false
          }
        } else if (Detector.IS_ANDROID) {
          if (Detector.ANDROID_VERSION < 4) {
            _pass = false
          }
        } else {
          _pass = false
        }
      }
    }
    if (!_pass) {
      return (<NotFound/>)
    }

    if (!alhambra.size) {
      return (
      <div className="o-page tour-page">
          <p><i>Loading...</i></p>
        </div>
      );
    }

    return (
      <div className="o-page">
        <Dervieur/>
        <Bodymovin/>
        <Sequence/>
        <LocationCover/>
        <Compass/>
        <TourMap/>
        <TourUi/>
      </div>
    );
  }
}

export default connect(({ alhambra, bodymovin, browser, tour }) => ({
  alhambra,
  bodymovin,
  browser,
  tour,
}), {
})(TourPage);

