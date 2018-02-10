import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import * as RNFS from 'react-native-fs';
import * as UUID from 'uuid';
import { StackNavigator } from 'react-navigation';

export default class Home extends React.Component {
  static navigationOptions = {
    title: 'Home'
  };

  state = {
    viewmode: Dimensions.get('window').height > Dimensions.get('window').width ? 'portrait' : 'landscape',
    videos: [],
    touched: false
  }

  constructor(props) {
    super(props);
    Dimensions.addEventListener("change", this.updateStyles);
    setTimeout(() => {
      this.setState({
        touched: false
      })
    }, 1)
  }

  componentWillMount() {
    this.findAllVideos(RNFS.ExternalStorageDirectoryPath);
  }

  componentWillUnmount() {
    Dimensions.removeEventListener("change", this.updateStyles);
  }

  updateStyles = (dims) => {
    this.setState({
      viewmode: Dimensions.get("window").height > 500 ? "portrait" : "landscape"
    })

  }

  findAllVideos = (path) => {
    RNFS.readDir(path)
      .then(res => {
        // return(RNFS.readDir(res[0].path));
        const regex = /^[a-zA-Z0-9.]+\.(mp4|mkv)?$/i;
        const download = res.filter(r => (regex.test(r.name)));
        let videos = this.state.videos;
        videos = videos.concat(download);
        this.setState({ videos });
        res.map(r => {
          if (r.isDirectory) {
            const reg = /^.[A-Z0-9a-z]+$/i;
            if (!(reg.test(r.name))) {
              return this.findAllVideos(r.path);
            }
          }
        })
        // console.log(this.state.videos)
      })
      .catch(err => { });
  }

  startVideoPlayer = (path, name) => {
    this.setState({
      touched: true
    })
    setTimeout(() => {
      this.setState({
        touched: false
      })
    }, 0)
    const { navigate } = this.props.navigation;
    navigate(
      'Video', { path, name }
    )
  }

  render() {
    let videoList = this.state.videos.map(video => (
      <TouchableOpacity key={video.path} onPress={() => this.startVideoPlayer(video.path, video.name)}>
        <View style={styles.list}>
          <Text>{video.name}</Text>
          <Text style={{ fontSize: 10 }}>{video.path}</Text>
        </View>
      </TouchableOpacity>
    ))
    if (this.state.touched) {
      videoList = <ActivityIndicator />
      
    }

    return (
      <View style={styles.container}>
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 20, borderBottomWidth: 2 }} >Videos</Text>
        </View>
        <View >
          {videoList}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: 'white',
    padding: 10
  },
  list: {
    borderWidth: 2,
    height: 55,
    padding: 10,
    marginBottom: 10
  }

});
