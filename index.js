import {AppRegistry} from 'react-native';
import Home from './Home';
import VideoPlayer from './screens/VideoPlayer/VideoPlayer';
import {StackNavigator} from 'react-navigation';

const App = StackNavigator({
  Home: {screen: Home},
  Video: {screen: VideoPlayer}
});

AppRegistry.registerComponent('VideoPlayer', () => App);