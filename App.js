import React from 'react';
import { registerRootComponent } from 'expo';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from "react-navigation-stack";
import {createAppContainer} from 'react-navigation'

import AuthScreen from './screens/AuthScreen';
import FeedScreen from './screens/FeedScreen';
import ForgotScreen from './screens/ForgotScreen';
import ProfileScreen from './screens/ProfileScreen';
import AccountScreen from './screens/AccountScreen';
import ReactionHistoryScreen from './screens/ReactionHistoryScreen';


export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}

const AppNavigator = createStackNavigator({
  Auth: {
    screen: AuthScreen,
    navigationOptions: {
      headerShown:false,
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  Feed: {
    screen: FeedScreen,
    navigationOptions: {
      headerShown:true,
      title:'Mirrr ',
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  Forgot:{
    screen: ForgotScreen,
    navigationOptions: {
      headerShown:false,
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  Profile:{
    screen: ProfileScreen,
    navigationOptions: {
      headerShown:true,
      title:'',
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  Account:{
    screen: AccountScreen,
    navigationOptions: {
      headerShown:true,
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  ReactionHistory:{
    screen: ReactionHistoryScreen,
    navigationOptions: {
      headerShown:true,
      title:'REACTIONS',
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  }
});

const AppContainer = createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

registerRootComponent(App);