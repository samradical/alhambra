import './notfound.scss';
import {
  IMAGE_DIR,
  TIME_ON_LOCATION_COVER,
} from '../../constants/config';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

class MapPage extends Component {

  static propTypes = {
    browser: PropTypes.object.isRequired
  };

  constructor() {
    super()
    this.state = {
       coverStyle: { backgroundImage: `url(${IMAGE_DIR}home.svg)`}
    }
  }

  componentDidMount() {
    this.show()
  }

  render() {
    const { browser } = this.props;
    return ( <div
      className = "o-page"
      >
        <Link key={'/'} to={`/`}>
          <span className="back-btn close-btn">BACK</span>
      </Link>
        <div
        className = "o-page notfound map-page"
        ref="tourMap"
        style = { this.state.coverStyle }>
          <h1><i>SORRY THIS IS A MOBILE ONLY EXPERIENCE</i></h1>
          <h3>or you have an old OS version</h3>
        </div>
      </div>
    );
  }
}


export default connect(({ browser }) => ({
  browser,
}))(MapPage);
