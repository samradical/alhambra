import './tour-page.scss';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import Dervieur from '../../components/deriveur/deriveur';
import Bodymovin from '../../components/bodymovin/bodymovin';
import Sequence from '../../components/sequence/sequence';
import Compass from '../../components/compass/compass';
import LocationCover from '../../components/location-cover/location-cover';
import TourMap from '../../components/tour-map/tour-map';
import TourHome from '../../components/tour-home/tour-home';
import TourUi from '../../components/tour-ui/tour-ui';

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
    if (!alhambra.size) {
      return (
        <h1>Loading</h1>
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

