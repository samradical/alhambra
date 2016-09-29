import './credits-page.scss';
import {
  IMAGE_DIR,
  TIME_ON_LOCATION_COVER,
} from '../../constants/config';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

class CreditsPage extends Component {

  static propTypes = {
    browser: PropTypes.object.isRequired
  };

  componentDidMount() {
  }

  render() {
    const { browser } = this.props;
    return ( <div
      className = "o-page credits-page"
      >
      <Link key={'/'} to={`/`}>
          <span className="back-btn close-btn">BACK</span>
      </Link>
      <div className="credits-wrapper">
        <h3>App programmed by Sam Elie with visuals by Christoph Steger.</h3>
        <p>Audio sourced from material.</p>
        <p>The Alhambra Project by Lynn Marie Kirby and Christoph Steger involving the Russian Hill community. The former Alhambra Theater, now a Crunch gym, becomes the locus for a night of site interventions including video, performative re-enactments of movement from gestures in once-screened Hollywood films, and mobile app-guided neighborhood tours. The Alhambra Project illuminates layered site-specific history, exploring cultural patterning, and visions of exoticism, while interrogating shifting demographics of the neighborhood.</p>
      </div>
      </div>
    );
  }
}


export default connect(({ browser }) => ({
  browser,
}))(CreditsPage);
