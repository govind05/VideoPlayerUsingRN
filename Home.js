import React from 'react';
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
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
    touched: false,
    loading: true
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

  componentDidMount() {
    this.findAll(RNFS.ExternalStorageDirectoryPath)
      .then(() => this.setState({
        loading: false
      }))
  }

  componentWillUnmount() {
    Dimensions.removeEventListener("change", this.updateStyles);
    this.setState({
      touched: false
    })
  }

  updateStyles = (dims) => {
    this.setState({
      viewmode: Dimensions.get("window").height > 500 ? "portrait" : "landscape"
    })

  }
  findAll = (path) => {
    return new Promise((resolve, reject) => {
      this.findAllVideos(path)
        .then(() => setTimeout(() => resolve('finsi'), 2000))
    })
  }

  findAllVideos =  (path) => {
    return RNFS.readDir(path)
      .then(res => {
        // return(RNFS.readDir(res[0].path));
        // console.log(res);
        const regex = /^[a-zA-Z0-9.]+\.(mp4|mkv|m4a|fmp4|webm|wav|mpeg-ts|mpeg-ps|flv|adts)?$/i;
        let download = res.filter(r => (regex.test(r.name)));
        // console.log(download);
        download = download.map(dl => {
          return {
            ...dl,
            key: dl.path
          }
        })
        let videos = this.state.videos;
        videos = videos.concat(download);
        console.log(videos, this.state.loading)
        this.setState({ videos });

        res.map((r, i) => {
          if (r.isDirectory()) {
            const reg = /^\.[A-Z0-9a-z_[\]{}()]+$/i;
            if (!(reg.test(r.name))) {
              this.findAllVideos(r.path)
            }
          }
        })
      })
      .catch(err => { });
  }
  stopLoad = () => {
    this.setState({
      touched: false
    })
  }
  startVideoPlayer = (path, name) => {
    this.setState({
      touched: true
    })
    let func = this.stopLoad;
    const { navigate } = this.props.navigation;
    navigate(
      'Video', { path, name, func }
    )
  }

  render() {
    let videoList = <ActivityIndicator size="large" color="#0000ff" />
    if (!this.state.loading) {
      console.log(this.state.loading)
      videoList = <FlatList
        data={this.state.videos}
        renderItem={
          (video) => (
            <TouchableOpacity onPress={() => this.startVideoPlayer(video.item.path, video.item.name)}>
              <View style={styles.list}>
                <Text style={{ fontSize: 15, color: '#333' }}>{video.item.name}</Text>
                <Text style={{ fontSize: 10, color: '#aaa' }}>{video.item.path}</Text>
              </View>
            </TouchableOpacity>
          )}
      />
    } else {
      videoList = <ActivityIndicator size={80} color="#333"/>
    }

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
    height: 65,
    padding: 10,
    marginBottom: 10
  }

});
