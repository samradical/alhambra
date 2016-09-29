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

  componentDidMount() {
    const {
      showMap,
      experiencePaused,
    } = this.props
    emitter.on('tour:home:close', ()=>{
      let _target  = !this.state.experiencePaused
      this.setState({experiencePaused:_target})
        experiencePaused(_target)
    })

    /*this.refs.startButton.addEventListener(()=>{

    }, false)*/
  }

  _renderInstructions(){
    if(!this.state.showInstruction){
      return (<div></div>)
    }
    return(<div ref="instruction"className="instruc-wrapper">
            <h3>Welcome to the Alhambra walking tour</h3>
            <p>
            The experience requires your phone to be awake at all times. Please disable the auto-lock.
            On iOS: Settings > General > Auto-lock > Never
            On Android:...
            </p>
            <p>Use the compass as your guide around the neighbourhood.</p>
            <p>If you experience any page reloads, do not be alarmed, just press this button</p>
            <button ref="startButton" onTouchEnd={()=>{
              this.refs.tour.classList.add('hide')
              this.refs.instruction.classList.add('is-hidden')
              this.setState({showInstruction:false})
              emitter.emit('tour:start')
            }}>Start the tour</button>
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
          <div className="tour-ui--btn tour-mapbutton">
            <span onClick={()=>{
              let _target  = !this.state.experiencePaused
              this.setState({experiencePaused:_target})
              this.setState({homeText: (_target) ? 'BACK' : 'HOME'})
              experiencePaused(_target)
            }}>{this.state.homeText}</span>
          </div>
          <div className="tour-ui--btn tour-mapbutton">
            <span onClick={()=>{
              let _target  = !this.state.mapVisible
              this.setState({mapText: (_target) ? 'BACK' : 'MAP'})
              this.setState({mapVisible:_target})
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

  componentWillReceiveProps(nextProps) {}

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
