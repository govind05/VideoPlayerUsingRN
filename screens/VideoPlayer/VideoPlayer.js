import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import Video from 'react-native-video';
import * as RNFS from 'react-native-fs';

export default class VideoPlayer extends React.Component {
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
    paused: false
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
    this.toggleFullscreen();

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

  toggleFullscreen(){
    this.player.presentFullscreenPlayer()
  }

  render() {
    console.log(this.props.navigation.state.params.path)
    let playback = 'pause';
    let mute = this.state.muted ? 'Unmute' : 'Mute';
    let text = null;
    let left = this.state.viewmode === 'portrait' ? '36%' : '80%';
    let top = this.state.viewmode === 'portrait' ? '47%' : '0%';
    let display = this.state.viewmode === 'landscape' ? <View style={{
      backgroundColor: 'rgba(255,255,255,0.5)',
      width: 100,
      top: '10%',
      left: '80%',
      paddingVertical: 10,
      paddingHorizontal: 5,
      borderRadius: 25,
      display: display
    }}>
      <TouchableOpacity onPress={this.changeMuteHandler}><Text style={{
        fontSize: 20,
        textAlign: 'center'
      }}> {mute}
      </Text></TouchableOpacity></View> : null;
    if (this.state.paused) {
      playback = 'play';
      this.player.presentFullscreenPlayer();
      text = <View style={{ zIndex: 3, flex: 1 }}><View style={{
        backgroundColor: 'rgba(255,255,255,0.5)',
        width: 100,
        top: top,
        left: left,
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 25,
      }}>
        <Text style={{ fontSize: 20, textAlign: 'center' }}> Paused </Text></View>
        {display}
      </View>
    }
    let playbackButton = (<View style={styles.playbackBtn}>
      <Button title={playback} onPress={this.changePlaybackHandler} />
      <Button title={mute} onPress={this.changeMuteHandler} />
      {/* <Button title='Fullscreen' onPress={this.toggleFullscreen}/> */}
    </View>);
    let changePlayback = null;
    let activeOpacity = 1;
    if (this.state.viewmode === 'landscape') {
      playbackButton = null;
      changePlayback = this.changePlaybackHandler;
      activeOpacity = 0.2;
    }
    let player;
    const regex = /^[a-zA-Z0-9.]+\.(mp4|avi)?$/i;
    const video = regex.exec(this.props.navigation.state.params.name);
    return (

      <View style={styles.container} >
      <StatusBar hidden
      />
        <TouchableOpacity
          activeOpacity={activeOpacity}
          style={styles.backgroundVideo}
          onPress={changePlayback}
        >
          <Video source={{ uri: this.props.navigation.state.params.path, type: 'avi' }}
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
            onLoadStart = {() => this.player.presentFullscreenPlayer()}

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
    height:'100%',
    width:'100%',
    zIndex: 2,
  },
  playbackBtn: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    bottom: '20%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',

    zIndex: 2,
  }
});
