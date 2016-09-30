import './tour-ui.scss';

import {
  IMAGE_DIR,
  TIME_ON_LOCATION_COVER,
} from '../../constants/config';

import { showMap } from '../../actions/tour';
import { experiencePaused } from '../../actions/tour';
import emitter from '../../utils/emitter';
import TourHome from '../tour-home/tour-home';

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
      homeVisible:false,
      //return home
      experiencePaused:false,
      showInstruction:true,

      mapText:'MAP',
      homeText:'HOME'
    }
  }

  componentWillUnmount() {
    emitter.o('tour:home:close')
  }

  componentDidMount() {
    const {
      showMap,
      experiencePaused,
    } = this.props
  }

  componentWillReceiveProps(nextProps) {
    const {
      tour,
    } = this.props
    let _n = nextProps.tour.experiencePaused
    if(_n !== tour.experiencePaused){
      this.setState({experiencePaused:_n})
      this.setState({homeText: (_n) ? 'BACK' : 'HOME'})
      this.refs.homeBtn.classList.remove('is-hidden')
      this.refs.mapBtn.classList.remove('is-hidden')
    }
  }

  _renderInstructions(){
    if(!this.state.showInstruction){
      return (<div></div>)
    }
    return(<div ref="instruction"className="instruc-wrapper">
            <h3>Welcome to the Alhambra Walking Tour</h3>
            <p>The <span className="map">MAP</span> shows points of interest; let the arrow be your guide around the neighbourhood.</p>
            <hr></hr>
            <p className="ins-tech">The experience requires your phone to be awake at all times. Please disable the auto-lock.</p>
            <p className="ins-tech"><i>iOS</i>: Settings > General > Auto-lock > Never</p>
            <p className="ins-tech"><i>Android</i>: Menu > Settings > Screen/Display > Timeout > Never</p>
            <br></br>
            <button ref="startButton" className="tourstart-btn" onTouchEnd={()=>{
              this.refs.tour.classList.add('hide')
              this.refs.instruction.classList.add('is-hidden')
              this.setState({showInstruction:false})
              emitter.emit('tour:start')
            }}>START THE TOUR</button>
   </div>)
  }

  _renderUi(){
    const {
      showMap,
      experiencePaused,
    } = this.props

    if(this.state.showInstruction){
      return (<div></div>)
    }

    return(<div className="tour-ui--buttons">
          <div ref="homeBtn" className="tour-ui--btn tour-mapbutton">
            <span  onClick={()=>{
              let _target  = !this.state.experiencePaused
              this.setState({experiencePaused:_target})
              this.setState({homeText: (_target) ? 'BACK' : 'HOME'})
              this.refs.mapBtn.classList[(
                _target ? 'add' : 'remove'
                )]('is-hidden')
              experiencePaused(_target)
            }}>{this.state.homeText}</span>
          </div>
          <div ref="mapBtn" className="tour-ui--btn tour-mapbutton">
            <span onClick={()=>{
              let _target  = !this.state.mapVisible
              this.setState({mapText: (_target) ? 'BACK' : 'MAP'})
              this.setState({mapVisible:_target})
              this.refs.homeBtn.classList[(
                _target ? 'add' : 'remove'
                )]('is-hidden')
              showMap(_target)
            }}>{this.state.mapText}</span>

          </div>
      </div>)
  }

  /*

  <img src={`${IMAGE_DIR}home-btn.svg`} onClick={()=>{
              let _target  = !this.state.experiencePaused
              this.setState({experiencePaused:_target})
              experiencePaused(_target)
            }}></img>

  <img src={`${IMAGE_DIR}burger-btn.svg`} onClick={()=>{
              let _target  = !this.state.mapVisible
              this.setState({mapVisible:_target})
              showMap(_target)
            }}></img>
  */

  _renderHome(){
    if(this.state.experiencePaused){
      return(<TourHome/>)
    }
  }

  render() {
    const { browser, tour } = this.props;
    const {
      showMap,
      experiencePaused,
    } = this.props

    return ( <div
      ref="tour"
      className = "o-page tour-ui">
          {this._renderUi()}
          {this._renderInstructions()}
          {this._renderHome()}
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
