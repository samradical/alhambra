
import {
  IMAGE_DIR,
  TIME_ON_LOCATION_COVER,
} from '../../constants/config';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

class AboutPage extends Component {

  static propTypes = {
    browser: PropTypes.object.isRequired
  };

  componentDidMount() {
    this.show()
  }

  show() {
    this.refs.tourHome.classList.add('is-visible')
  }

  hide() {
    this.refs.tourHome.classList.remove('is-visible')
  }


  render() {
    const { browser } = this.props;
    return ( <div
      className = "o-page tour-home"
      ref="tourHome"
      >
      <img src={`${IMAGE_DIR}home.svg`}></img>
        <div className="o-page tour-home--menu">
          <span className="home-top">ALHAMBRA</span>
          <Link key={'credits'} to={`credits`}>
            <span className="home-right">Credits</span>
          </Link>
          <Link key={'walk'} to={`walk`}>
            <span className="home-bottom">Tour</span>
          </Link>
          <Link key={'about'} to={`about`}>
            <span className="home-left">About</span>
          </Link>
        </div>
      </div>
    );
  }
}


export default connect(({ browser }) => ({
  browser,
}))(AboutPage);
