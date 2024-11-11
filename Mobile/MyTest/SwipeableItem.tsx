import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const SwipeableItem = () :any => {
    const leftSwipe = () => {
        return (
            <View><Text>아아아아아하하하</Text></View>
        )
    }

  return (
    <Swipeable
      renderLeftActions={leftSwipe}
    >
      <View style={styles.container}>
        <Text>이것도 사랑이니 이것도 사랑이라면</Text>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default SwipeableItem;