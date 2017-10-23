import "./bodymovin.scss"

import React, { Component, PropTypes } from "react"
import { Link } from "react-router"
import { connect } from "react-redux"
import { bodymovinLoaded } from "../../actions/bodymovin"

import _ from "lodash"

import { ASSETS_DIR, REMOTE_ASSETS_DIR } from "../../constants/config"

class Bodymovin extends Component {
  constructor() {
    super()
    this.state = {
      speakingPlaying: 0,
      dominantPlaying: 0,
      orientation: -1,
    }
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    this._destroyShort()
    this._destroyLong()
  }

  componentWillReceiveProps(nextProps) {
    let { tour } = this.props
    let _n = nextProps.tour.locationIndex
    console.log(
      "nextProps.tour.dominantPlaying",
      nextProps.tour.dominantPlaying
    )
    console.log(
      "nextProps.tour.ambientPlaying",
      nextProps.tour.ambientPlaying
    )
    if (nextProps.tour.dominantPlaying) {
      this._playShort()
    } else if (nextProps.tour.speakingPlaying) {
      this._playLong()
    }

    console.log("nextProps.tour.dominantPlaying")

    if (nextProps.tour.isIn) {
      console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{")
      console.log("tour.locationIndex", tour.locationIndex, _n)
      console.log(
        "tour.isIn",
        tour.isIn,
        "nextProps.tour.isIn",
        nextProps.tour.isIn
      )
      console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{")
      if (nextProps.resize.orientation !== this.state.orientation) {
        this._shortAnimation(nextProps.tour.location.id, {
          autoplay: true,
        })
        this._longAnimation(nextProps.tour.location.id, {
          autoplay: true,
        })
      } else if (
        nextProps.tour.nextLocation &&
        !isNaN(_n) &&
        tour.locationIndex !== _n
      ) {
        this._shortAnimation(nextProps.tour.location.id, {
          autoplay: true,
        })
        this._longAnimation(nextProps.tour.location.id, {
          autoplay: true,
        })
      } else if (nextProps.tour.isIn && !tour.isIn) {
        this._shortAnimation(nextProps.tour.location.id, {
          autoplay: true,
        })
        this._longAnimation(nextProps.tour.location.id, {
          autoplay: true,
        })
      }
    }

    this.setState({ orientation: nextProps.resize.orientation })

    if (!nextProps.tour.dominantPlaying) {
      this._hideShort()
      if (tour.dominantPlaying !== nextProps.tour.dominantPlaying) {
        this._playLong()
      }
    }
      if (nextProps.bodymovin.loaded !== this.props.bodymovin.loaded) {
        window.LOADER_API.onBodymovinLoaded(nextProps.bodymovin.loaded)
      }

    if (!nextProps.tour.isIn) {
      //this._hideShort()
      //this._hideLong()
    }
  }

  _hideShort() {
    if (this.refs.bodymovinShort) {
      this.refs.bodymovinShort.classList.add("is-hidden")
      if (this._bodyAnimShort) {
        this._bodyAnimShort.pause()
      }
    }
  }

  _hideLong() {
    if (this.refs.bodymovinLong) {
      this.refs.bodymovinLong.classList.add("is-hidden")
      if (this._bodyAnimLong) {
        this._bodyAnimLong.pause()
      }
    }
  }

  _playShort() {
    this._hideLong()
    this.refs.bodymovinShort.classList.remove("is-hidden")
    if (this._bodyAnimShort) {
      if (this._bodyAnimShort.container) {
        this._bodyAnimShort.container.width = "100%"
        this._bodyAnimShort.container.height = "100%"
        this._bodyAnimShort.container.setAttribute("height", "100%")
        this._bodyAnimShort.container.setAttribute("width", "100%")
      }
      console.log("_playShort")
      this._bodyAnimShort.play()
    }
  }

  _playLong() {
    this._hideShort()
    this.refs.bodymovinLong.classList.remove("is-hidden")
    if (this._bodyAnimLong) {
      console.log("_playLong")
      if (this._bodyAnimLong.container) {
        this._bodyAnimLong.container.width = "100%"
        this._bodyAnimLong.container.height = "100%"
        this._bodyAnimLong.container.setAttribute("width", "100%")
        this._bodyAnimLong.container.setAttribute("height", "100%")
      }
      this._bodyAnimLong.play()
    }
  }

  _destroyShort() {
    if (this._bodyAnimShort) {
      this._bodyAnimShort.destroy()
      this._bodyAnimShort = null
    }
  }

  _destroyLong() {
    if (this._bodyAnimLong) {
      this._bodyAnimLong.destroy()
      this._bodyAnimLong = null
    }
  }

  _preload(path) {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", path, true)
    xhr.send()
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          this.props.bodymovinLoaded(true)
        }
      }
    }
  }

  _shortAnimation(locationId, options = {}) {
    this.props.bodymovinLoaded(false)
    const path = `${REMOTE_ASSETS_DIR}bodymovin/${locationId}/visuals/color_short/data.json`
    const BM = window.bodymovin
    this._preload(path)
    var animData = {
      wrapper: this.refs.bodymovinShort,
      renderer: "canvas",
      animType: "canvas",
      loop: true,
      prerender: true,
      autoplay: false,
      path: path,
      rendererSettings: {
        scaleMode: "noScale",
      },
    }
    this._destroyShort()
    this._bodyAnimShort = BM.loadAnimation(
      _.assign({}, animData, options)
    )

    console.log(this._bodyAnimShort)
  }

  _longAnimation(locationId, options = {}) {
    this.props.bodymovinLoaded(false)
    const BM = window.bodymovin
    const path = `${REMOTE_ASSETS_DIR}bodymovin/${locationId}/visuals/color_long/data.json`
    this._preload(path)
    var animData = {
      wrapper: this.refs.bodymovinLong,
      renderer: "canvas",
      animType: "canvas",
      loop: true,
      prerender: true,
      autoplay: false,
      path: path,
      rendererSettings: {
        scaleMode: "scale",
      },
    }
    if (this._bodyAnimLong) {
      this._bodyAnimLong.destroy()
      this._bodyAnimLong = null
    }
    this._bodyAnimLong = BM.loadAnimation(
      _.assign({}, animData, options)
    )
  }

  /* shouldComponentUpdate(nextProps, nextState) {
     let _d = nextProps.tour.state !== this._state;
     this._state = nextProps.tour.state
     return _d
   }*/

  render() {
    const { browser, bodymovin, tour } = this.props
    if (!bodymovin.list.size) {
      return <div />
    }
    //this._newLocationAnimation()
    //this._onNewSpeaking()
    return (
      <div className="o-page">
        <div
          id="shortDom"
          ref="bodymovinShort"
          className="o-page bodymovin"
        />
        <div
          id="longAmb"
          ref="bodymovinLong"
          className="o-page bodymovin"
        />
      </div>
    )
  }
}

export default connect(
  ({ bodymovin, browser, resize, tour }) => ({
    bodymovin,
    browser,
    resize,
    tour,
  }),
  {
    bodymovinLoaded,
  }
)(Bodymovin)
