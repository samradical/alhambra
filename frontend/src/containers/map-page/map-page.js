import './map-page.scss';
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
       coverStyle: { backgroundImage: `url(${IMAGE_DIR}map.svg)`}
    }
  }

  componentDidMount() {
    this.show()
  }

  show() {
    this.refs.tourMap.classList.add('is-visible')
  }

  hide() {
    this.refs.tourMap.classList.remove('is-visible')
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
        className = "o-page map-page"
        ref="tourMap"
        style = { this.state.coverStyle }>
        </div>
      </div>
    );
  }
}


export default connect(({ browser }) => ({
  browser,
}))(MapPage);
