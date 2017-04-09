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
import UI from '../../utils/sono_ui';

class TourUi extends Component {

  constructor() {
    super()
    this.state = {
      mapVisible:false,
      homeVisible:false,
      //return home
      experiencePaused:false,
      showInstruction:false,

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

    let sound = window.sono.createSound({
      src: [
        `${process.env.REMOTE_ASSETS_DIR}assets/audio/dummy.mp3`,
      ],
      volume:0,
      loop: false
    });
    let playerTop = UI.createPlayer({
      el: this.refs.startButton,
      sound: sound,
      cb:()=>{
        console.log("start");
      }
    });

    emitter.emit('tour:start')

    emitter.on('geoerror', ()=>{
      this.refs.uiButtons.classList.add('hide')
    })
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
            <p className="ins-tech bold small">The experience requires your phone to be awake at all times.</p>
            <p className="ins-tech detail small">Please disable the auto-lock:</p>
            <p className="ins-tech detail"><i>iOS</i>: Settings > General > Auto-lock > Never</p>
            <p className="ins-tech detail"><i>Android</i>: Menu > Settings > Screen/Display > Timeout > Never</p>
            <p className="ins-tech bold small">Geolocation is also needed. You might receive a prompt upon starting, if not, follow these instrcutions and refresh the page.</p>
            <p className="ins-tech detail"><i>iOS</i>: Settings > Privacy > Location Services > Safari > While Using</p>
            <p className="ins-tech detail"><i>Android</i>: <a href="https://support.google.com/accounts/answer/3467281?hl=en" target="_blank">Turn location on or off for your device</a></p>
            <br></br>
            <button ref="startButton" className="tourstart-btn" onClick={()=>{
              this.refs.tour.classList.add('hide')
              this.setState({showInstruction:false})
              this.refs.instruction.classList.add('is-hidden')
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

    return(<div  ref="uiButtons" className="tour-ui--buttons">
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
