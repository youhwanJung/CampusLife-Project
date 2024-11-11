/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App/App';
import {name as appName} from './app.json';
import {StatusBar} from 'react-native';

StatusBar.setHidden(true);
AppRegistry.registerComponent(appName, () => App);
