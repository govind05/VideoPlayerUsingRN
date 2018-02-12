import React from 'react';
import { Text, View, StyleSheet, Animated, PanResponder, Button } from 'react-native';
import { PanGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';

export default class SeekVideo extends React.Component{
state={
  xBegin: 0,
  xEnd: 0,
  seekTime: 0,
}
  
  onBeganHandler =(e) => {
    // console.log(e.nativeEvent)
    this.setState({
      xBegin: e.nativeEvent.x
    })
  }
  onEndedHandler = (e) => {
    // console.log(e.nativeEvent)
    this.setState({
      xEnd: e.nativeEvent.x
    })
    seekTime =  (this.state.xEnd-this.state.xBegin);
    // console.log(seekTime);
    this.props.seekChange(seekTime);
  }

  render(){
    return(
      <PanGestureHandler
        id='pan'
        // onGestureEvent={}
        onHandlerStateChange={this.onStateChangeHandler}
        onBegan={this.onBeganHandler}
        onEnded={this.onEndedHandler}
      >
      {/* <TapGestureHandler>/ */}
        {this.props.children}
        {/* </TapGestureHandler> */}
      </PanGestureHandler>
    )
  }
}