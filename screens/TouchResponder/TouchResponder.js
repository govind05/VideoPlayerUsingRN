import React from 'react';
import { Text, View, StyleSheet, Animated, PanResponder, Button } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

export default class TouchResponder extends React.Component {
  static navigationOptions = {
    title: 'Home',
    headerStyle: {
      display: 'none',
    }
  };

  constructor(props) {
    super(props);
    this._translateXY = new Animated.ValueXY({ x: 0, y: 0 });
    this._translateDeleteX = new Animated.Value(0);
    this._lastOffset = { x: 0, y: 0 };
    console.log(this._translateX);
    this._onGestureEventHandler = Animated.event(
      [
        {
          nativeEvent: {
            translationX: this._translateXY.x,
            translationY: this._translateXY.y,
          },
        },
      ],
      { useNativeDriver: true }
    );
  }
  _panHandler = (e) => {
    if (e.nativeEvent.oldState === State.ACTIVE) {
      Animated.parallel([
        Animated.spring(this._translateXY, {
          toValue: { x: 0, y: 0 },
          tension: 10,
          friction: 2,
          useNativeDriver: true
        })
      ]).start();

      
    }
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flex: 10, }}>
          <PanGestureHandler
            {...this.props}
            id='pan'
            onGestureEvent={this._onGestureEventHandler}
            onHandlerStateChange={this._panHandler}            
            onEnded={this._translateDeleteX.setOffset(-100)}
          >
            <Animated.View style={{
              backgroundColor: 'plum', height: 100, width: 100, top: '50%',
              transform: [
                { translateX: this._translateXY.x },
                { translateY: this._translateXY.y },
              ],
              alignSelf: 'center',
            }}>
            </Animated.View>

          </PanGestureHandler>
        </View>
        <Animated.View style={{
          transform: [
            { translateY: this._translateDeleteX }
          ],
          flex: 1,
          alignSelf: 'center',
          // top: 300
        }}>
          <Text style={{ fontSize: 30 }} >&times;</Text>
        </Animated.View>
      </View>
    )
  }
}