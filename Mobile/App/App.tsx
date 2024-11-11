import React, {useState} from 'react';
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import { StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {RootStackNavigator} from './navigation/StackNavigator.tsx';
import {HomeScreenStack} from '../MyTest/StackNavigation.tsx'
import SwipeableItem from '../MyTest/SwipeableItem.tsx'


function App(): React.JSX.Element {

  return (
    <GluestackUIProvider mode="light"><NavigationContainer>
        <RootStackNavigator>

        </RootStackNavigator>
      </NavigationContainer></GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex : 1,
    backgroundColor : 'white',
  },
});

export default App;