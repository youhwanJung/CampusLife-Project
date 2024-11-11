import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen'
import DetailScreen from './DetailScreen'
import { useNavigation } from '@react-navigation/native';
import {BottomNavigation} from './BottomNaviation'
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SecondDetailScreen from './SecondDetailScreen';
import LoginScreen from './LoginScreen';

const HomeStackNavigation = createStackNavigator();

export const HomeScreenStack = () => {
    return(
        <HomeStackNavigation.Navigator initialRouteName='LoginScreen'>
            <HomeStackNavigation.Screen name = "LoginScreen" component = {LoginScreen}/> 
            <HomeStackNavigation.Screen name = "BottomNavigation" component = {BottomNavigation}/>
            <HomeStackNavigation.Screen name = "SecondDetailScreen" component={SecondDetailScreen} />
            <HomeStackNavigation.Screen name = "DetailScreen" component = {DetailScreen}  />
        </HomeStackNavigation.Navigator>
    );
};