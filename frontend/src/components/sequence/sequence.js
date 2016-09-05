import './sequence.scss';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import { connect } from 'react-redux';

import MagipackPlayer from './magipack_player'

class Sequence extends Component {

  componentDidMount() {
    const { browser, sequence, tour } = this.props;
  }

  componentWillReceiveProps(nextProps) {
    const { browser, sequence, tour } = this.props;
    let _n = nextProps.tour.locationIndex
    if (tour.locationIndex !== _n &&
      !isNaN(_n) &&
      tour.isIn
    ) {
      this._newLocation(nextProps.tour.locationIndex)
    } else {
      MagipackPlayer.hide()
    }

    if (nextProps.tour.speakingPlaying) {
      MagipackPlayer.play()
    } else {
      MagipackPlayer.pauseAndHide()
    }
  }

  _newLocation(index) {
    const { sequence } = this.props;
    let _l = sequence.toArray()
    let _o = _.assign({}, _l[index])
    MagipackPlayer.load(_o, this.refs.magiSrc).finally()
  }



  render() {
    const { browser, sequence, tour } = this.props;
    if (!sequence.size) {
      return (
        <div></div>
      );
    }
    return (
      <div ref="sequence" className="o-page sequence">
        <img ref="magiSrc"></img>
      </div>
    );
  }
}

export default connect(({ sequence, browser, tour }) => ({
  sequence,
  browser,
  tour,
}), {})(Sequence);
