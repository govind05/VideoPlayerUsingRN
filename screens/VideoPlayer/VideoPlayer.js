import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, TouchableWithoutFeedback, Dimensions, StatusBar } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import ProgressBar from 'react-native-progress/Bar';

import SeekVideo from '../TouchResponder/SeekVideo';

export default class VideoPlayer extends React.Component {
  PAUSE_BUTTON = <Icon name='md-pause' size={50} style={{ color: '#ccc', marginRight: '10%', }} />
  PLAY_BUTTON = <Icon name='md-play' size={50} style={{ color: '#ccc', marginRight: '10%', }} />
  MUTE_BUTTON = <Icon name='md-volume-off' size={50} style={{ color: '#ccc', marginLeft: '10%', }} />
  UNMUTE_BUTTON = <Icon name='md-volume-up' size={50} style={{ color: '#ccc', marginLeft: '10%', }} />

  static navigationOptions = {
    title: 'Home',
    headerStyle: {
      display: 'none',
    }
  };

  state = {
    viewmode: Dimensions.get('window').height > Dimensions.get('window').width ? 'portrait' : 'landscape',
    muted: false,
    paused: false,
    progress: 0.0,
    progress1: 0.0,
    duration: 0.0,
    currentTime: 0.0,
    screenControlsVisible: false,
    totalDuration: {},
    timeLeft: {},
    seek: '',
    seekTimeValue: 0
  }

  constructor(props) {
    super(props);
    Dimensions.addEventListener("change", this.updateStyles);
  }
  componentWillMount() {
    this.props.navigation.state.params.func();
  }

  componentWillUnmount() {
    Dimensions.removeEventListener("change", this.updateStyles)
  }

  updateStyles = (dims) => {
    this.setState({
      viewmode: Dimensions.get("window").height > 500 ? "portrait" : "landscape"
    })
  }

  screenControlsHandler = () => {
    this.setState(prevState => {
      return {
        screenControlsVisible: !prevState.screenControlsVisible
      }
    }, () => {
      if (this.state.screenControlsVisible) {
        setTimeout(() => {
          this.setState({
            screenControlsVisible: false
          })
        }, 1500);
      }
    });

  }
  changePlaybackHandler = () => {
    this.setState(prevState => {
      return {
        paused: !prevState.paused
      }
    })
  }
  changeMuteHandler = () => {
    this.setState(prevState => {
      return {
        muted: !prevState.muted
      }
    })
  }

  timeToString(duration, totalTime) {
    if (!totalTime) {
      totalTime = {
        hours: 0,
        minutes: 0,
        seconds: 0
      }
    }
    let time = duration;
    let hours = Math.floor(time / 3600);
    time = time - hours * 3600;
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time - minutes * 60);
    let stringTime = hours === 0 && totalTime.hours === 0 ? '' : hours < 10 ? '0' + hours + ':' : hours + ':';
    stringTime += minutes === 0 && totalTime.minutes === 0 && hours === 0 && totalTime.hours === 0 ? '' : minutes < 10 ? '0' + minutes + ':' : minutes + ':';
    stringTime += seconds === 0 && hours === 0 && minutes === 0 && totalTime.seconds === 0 && totalTime.hours === 0 && totalTime.minutes === 0 ? '' : seconds < 10 ? '0' + seconds : seconds;
    let totalDuration = {
      hours,
      minutes,
      seconds,
      stringTime
    }
    // console.log(totalTime)
    return totalDuration;
  }

  onLoadHandler = (data) => {
    let totalDuration = this.timeToString(data.duration);

    this.setState({
      duration: data.duration,
      totalDuration: totalDuration
    });

  }

  onProgressHandler = (data) => {
    let currentTime = data.currentTime;
    const timeLeft = this.timeToString(currentTime, this.state.totalDuration);
    this.setState({
      currentTime,
      timeLeft
    });
    let progress = this.getProgressPercentage();
    this.setState({
      progress
    })
  }

  getProgressPercentage = () => {
    if (this.state.currentTime > 0) {
      return parseFloat(this.state.currentTime) / parseFloat(this.state.duration);
    }
    return 0;
  }

  onEndHandler = (data) => {
    const { goBack } = this.props.navigation;
    goBack();
  }

  seekChangeHandler = (seekTime) => {

    const seekTimeValue = (((seekTime) / Dimensions.get('window').width) * 60);
    if (seekTime > 0) {
      this.setState({
        seek: 'forward',
        seekTimeValue: parseInt(seekTimeValue) + 's'
      })
    } else {
      this.setState({
        seek: 'rewind',
        seekTimeValue: parseInt(seekTimeValue) + 's'
      })
    }
    // console.log(seekTimeValue, this.state.duration);
    // if (0 > this.state.currentTime + seekTimeValue) {
    // seekTime = this.state.currentTime - this.state.currentTime;
    // } else if (this.state.currentTime + seekTimeValue > this.state.duration) {
    //   seekTime = this.state.duration + 0;
    // } else {
    seekTime = this.state.currentTime + seekTimeValue;

    // }
    const timeLeft = this.timeToString(seekTime, this.state.totalDuration);

    this.setState({
      currentTime: seekTime,
      timeLeft,
    }, () => {
      this.player.seek(seekTime)
      let progress = this.getProgressPercentage();
      setTimeout(() => {
        this.setState({
          seek: '',
          progress
        })
      }, 500)
    });
  }

  backHandler = () => {
    this.props.navigation.goBack();
  }

  render() {
    let color = this.state.viewmode === 'portrait' ? 'white' : 'black';
    let fontsize = this.state.viewmode === 'portrait' ? 25 : 35;
    let titleRight = this.state.viewmode === 'portrait' ? '130%' : '500%';
    let pauseIconTop = this.state.screenControlsVisible ? '13%' : 0;
    let muteIconTop = this.state.screenControlsVisible ? '43%' : 0;
    let PAUSE_ICON = <Icon name='md-pause' size={50} style={{ padding: 2, color: color, top: pauseIconTop }} />
    let MUTE_ICON = <Icon name='md-volume-off' size={40} style={{ color: color }} />
    let FASTFORWARD_ICON = <Icon name='md-fastforward' size={70} style={{ color: '#fff', }} />
    let REWIND_ICON = <Icon name='md-rewind' size={70} style={{ color: '#fff', }} />
    let playback = !this.state.paused ? this.PAUSE_BUTTON : this.PLAY_BUTTON;
    let mute = !this.state.muted ? this.UNMUTE_BUTTON : this.MUTE_BUTTON;
    let text = null;
    let display = this.state.viewmode === 'landscape' ?
      <View style={{ top: pauseIconTop }}>
        <TouchableOpacity onPress={this.changeMuteHandler}>
          {this.state.muted ? MUTE_ICON : null}
        </TouchableOpacity></View> : null;

    if (this.state.paused) {
      text = <View style={{ zIndex: 3, flex: 1, alignItems: 'flex-end', marginRight: '3%' }}>
        {PAUSE_ICON}
        {display}
      </View>
    }
    if (this.state.muted) {
      text = <View style={{ zIndex: 3, flex: 1, alignItems: 'flex-end', marginRight: '3%' }}>
        {this.state.paused ? PAUSE_ICON : null}
        {this.state.viewmode === 'landscape' ? display : null}
      </View>
    }
    let playbackButton = null;
    let upperBar = null;
    const regex = /^[a-zA-Z0-9.]+\.(mp4|mkv|m4a|fmp4|webm|wav|mpeg-ts|mpeg-ps|flv|adts)?$/i;
    const video = regex.exec(this.props.navigation.state.params.name);
    let videoName = this.props.navigation.state.params.name.split('.' + video[1])
    console.log(videoName[0])
    if (this.state.screenControlsVisible || this.state.viewmode === 'portrait') {
      playbackButton = (
        <View style={styles.playbackBtnControl}>
          <View style={styles.playbackBtn}>
            <View >
              <Text style={{ fontSize: fontsize, color: '#ccc' }}>{this.state.timeLeft.stringTime}</Text>
            </View>
            <View style={{ marginLeft: '20%' }} >
              <TouchableOpacity onPress={this.changePlaybackHandler}>
                {playback}
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity onPress={this.changeMuteHandler}>
                {mute}
              </TouchableOpacity>
            </View>
            <View>
              <Text style={{ fontSize: fontsize, color: '#ccc' }}>{this.state.totalDuration.stringTime}</Text>
            </View>
          </View>
          <ProgressBar progress={this.state.progress} color='#cccccc' width={Dimensions.get('window').width} />
        </View>);
      upperBar =
        <View style={styles.upperBar}>
          <TouchableOpacity onPress={this.backHandler}>
            <Icon name="md-arrow-round-back" color="#ccc" size={50} />
          </TouchableOpacity>
          <View style={{ right: titleRight, top: '1%' }} >
            <Text style={{ fontSize: 25, color: '#ccc' }}>{videoName[0]}</Text>
          </View>
        </View>
    }
    let onScreenControls = null;
    let activeOpacity = 1;
    if (this.state.viewmode === 'landscape') {
      onScreenControls = this.screenControlsHandler;
    }
    let player;

    let bottom = this.state.viewmode === 'portrait' ? '38%' : '30%';
    let showSeek = this.state.seek === 'forward'
      ? <View style={[styles.seek, { right: '25%', bottom: bottom }]} >{FASTFORWARD_ICON}<Text style={{ fontSize: 30, color: '#fff' }} >{this.state.seekTimeValue}</Text></View>
      : this.state.seek === 'rewind' ? <View style={[styles.seek, { left: '25%', bottom: bottom }]} >{REWIND_ICON}<Text style={{ fontSize: 30, color: '#fff' }}>{this.state.seekTimeValue}</Text></View> : null
    // console.log(this.state.totalDuration, this.state.timeLeft)
    return (
      <SeekVideo seekChange={this.seekChangeHandler}>
        <View style={styles.container} >
          <StatusBar hidden
          />
          {upperBar}
          <TouchableOpacity
            activeOpacity={activeOpacity}
            style={styles.backgroundVideo}
            onPress={onScreenControls}
          >
            <Video source={{ uri: this.props.navigation.state.params.path }}
              ref={(video) => {
                this.player = video;
              }}
              rate={1.0}
              volume={1.0}
              muted={this.state.muted}
              paused={this.state.paused}
              resizeMode='contain'
              repeat={false}
              playInBackground={false}
              // Callback when video cannot be loaded
              style={styles.backgroundVideo}
              onLoad={this.onLoadHandler}
              onProgress={this.onProgressHandler}
              onEnd={this.onEndHandler}
            />
            {text}
            {showSeek}
          </TouchableOpacity>
          {playbackButton}
        </View>
      </SeekVideo>

    );

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black'
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
    zIndex: 2,
  },
  playbackBtn: {
    flex: 1,
    flexDirection: 'row',
    zIndex: 2,
  },
  playbackBtnControl: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    bottom: '0%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 4
  },
  upperBar: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    position: 'absolute',
    justifyContent: 'space-between',
    top: '0%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 4,
    height: '15%',
    paddingRight: 25,
    paddingLeft: 10
  },
  seek: {
    flex: 1,
    position: 'absolute',

    zIndex: 4
  }

});
