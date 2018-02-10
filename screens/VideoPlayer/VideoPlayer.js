import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import Video from 'react-native-video';
import * as RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/Ionicons';
import ProgressBar from 'react-native-progress/Bar';

export default class VideoPlayer extends React.Component {
  PAUSE_BUTTON = <Icon name='md-pause' size={50} style={{ color: '#ccc', marginRight: '10%',  }} />
  PLAY_BUTTON = <Icon name='md-play' size={50} style={{ color: '#ccc', marginRight: '10%', }} />
  MUTE_BUTTON = <Icon name='md-volume-off' size={50} style={{ color: '#ccc', marginLeft: '10%', }} />
  UNMUTE_BUTTON = <Icon name='md-volume-up' size={50} style={{ color: '#ccc', marginLeft: '10%',}} />
  static navigationOptions = {
    title: 'Home',
    headerStyle: {
      display: 'none',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
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
    timeLeft: {}
  }

  constructor(props) {
    super(props);
    Dimensions.addEventListener("change", this.updateStyles);
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
    });
    if (this.state.screenControlsVisible) {
      setTimeout(() => {
        this.setState({
          screenControlsVisible: false
        })
      }, 1500);
    }
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
    console.log(totalTime)
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

  // onTouchHandler = (data) => {
  //   console.log(data);
  // }

  render() {
    let color = this.state.viewmode === 'portrait' ? 'white' : 'black';
    let fontsize = this.state.viewmode === 'portrait' ? 25 : 35;
    let PAUSE_ICON = <Icon name='md-pause' size={50} style={{ padding: 2, color: color }} />
    let MUTE_ICON = <Icon name='md-volume-off' size={40} style={{ color: color, }} />
    let playback = !this.state.paused ? this.PAUSE_BUTTON : this.PLAY_BUTTON;
    let mute = !this.state.muted ? this.UNMUTE_BUTTON : this.MUTE_BUTTON;
    let text = null;
    let display = this.state.viewmode === 'landscape' ?
      <TouchableOpacity onPress={this.changeMuteHandler}>
        {this.state.muted ? MUTE_ICON : null}
      </TouchableOpacity> : null;

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
    }
    let onScreenControls = null;
    let activeOpacity = 1;
    if (this.state.viewmode === 'landscape') {
      onScreenControls = this.screenControlsHandler;
    }
    let player;
    const regex = /^[a-zA-Z0-9.]+\.(mp4|mkv)?$/i;
    const video = regex.exec(this.props.navigation.state.params.name);
    console.log(this.state.totalDuration, this.state.timeLeft)
    return (
      <View style={styles.container} >
        <StatusBar hidden
        />
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
        </TouchableOpacity>
        {playbackButton}
      </View>
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
  }
});
