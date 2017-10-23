import './sequence.scss';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import { connect } from 'react-redux';
import { showLocationCover } from '../../actions/tour';
import { sequenceLoaded } from '../../actions/sequence';
import MagipackPlayer from './magipack_player'

import {
  REMOTE_ASSETS_DIR
} from '../../constants/config';

class Sequence extends Component {

  componentDidMount() {
    const { browser, sequence, tour, showLocationCover } = this.props;
    MagipackPlayer.setAnimationCompleteCallback(() => {
      showLocationCover(true)
    })
  }

  componentWillUnmount() {
    MagipackPlayer.destroy()
  }

  componentWillReceiveProps(nextProps) {
    const { browser, sequence, tour } = this.props;
    let _n = nextProps.tour.locationIndex

    if (tour.locationIndex !== _n &&
      !isNaN(_n)
    ) {
      clearTimeout(this._ccc)
      this._ccc = setTimeout(() => {
        this._newLocation(nextProps.tour.locationIndex)
      }, 5000)
    } else if (nextProps.tour.isIn && !tour.isIn) {
      clearTimeout(this._ccc)
      this._ccc = setTimeout(() => {
        this._newLocation(nextProps.tour.locationIndex)
      }, 5000)
    }

    if (nextProps.tour.showLocationCover || nextProps.tour.dominantPlaying) {
      this.hide()
    }

    if (nextProps.tour.speakingPlaying) {
      this.show()
    } else {
      this.hide()
    }


    if (!nextProps.tour.isIn) {
      this.hide()
    }
    if (tour.state === 'in' && nextProps.tour.state === 'out') {
      clearTimeout(this._ccc)
      MagipackPlayer.destroy()
    }

    if (nextProps.sequence.loaded !== this.props.sequence.loaded) {
      window.LOADER_API.onSequenceLoaded(nextProps.sequence.loaded)
    }
  }

  hide() {
    if (this.refs.magiSrc) {
      MagipackPlayer.pause()
      this.refs.magiSrc.classList.remove('is-visible')
    }
  }

  show() {
    if (this.refs.magiSrc) {
      MagipackPlayer.resume()
      this.refs.magiSrc.classList.add('is-visible')
    }
  }

  _newLocation(index) {
    const { sequence } = this.props;
    this.props.sequenceLoaded(false)
    let _l = sequence.list.toArray()
    let _o = _.assign({}, _l[index])
    _o.images += `?z=${Math.random()}`
    _o.pack += `?z=${Math.random()}`
    console.log(_o);
    MagipackPlayer.loadAndPlay(_o, this.refs.magiSrc, ()=>{
      this.props.sequenceLoaded(true)
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    let _d = nextProps.tour.state !== this._state;
    this._state = nextProps.tour.state
    return _d
  }


  render() {
    const { browser, sequence, tour } = this.props;
    if (!sequence.list.size) {
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
}), {
  showLocationCover,
  sequenceLoaded,
})(Sequence);
