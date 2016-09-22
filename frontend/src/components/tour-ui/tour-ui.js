import './tour-ui.scss';

import {
  IMAGE_DIR,
  TIME_ON_LOCATION_COVER,
} from '../../constants/config';

import { showMap } from '../../actions/tour';
import { experiencePaused } from '../../actions/tour';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import { connect } from 'react-redux';
import Loader from 'assets-loader'

class TourUi extends Component {

  constructor() {
    super()
    this.state = {
      mapVisible:false,
      //return home
      experiencePaused:false
    }
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {}

  render() {
    const { browser, tour } = this.props;
    const {
      showMap,
      experiencePaused,
    } = this.props

    return ( <div
      className = "o-page tour-ui">
        <div className="tour-ui--buttons">
          <Link  key={'/'} to={`/`} className="tour-ui--btn tour-homebutton">
            <img src={`${IMAGE_DIR}home-btn.svg`} onClick={()=>{
              let _target  = !this.state.experiencePaused
              this.setState({experiencePaused:_target})
              experiencePaused(_target)
            }}></img>
          </Link>
          <div className="tour-ui--btn tour-mapbutton">
            <img src={`${IMAGE_DIR}burger-btn.svg`} onClick={()=>{
              let _target  = !this.state.mapVisible
              this.setState({mapVisible:_target})
              showMap(_target)
            }}></img>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(({ browser, tour }) => ({
  browser,
  tour,
}), {
  showMap,
  experiencePaused,
})(TourUi);
