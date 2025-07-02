// SplashScreen.js

import { StackActions, useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Text, Image, StyleSheet, View, ImageBackground, ActivityIndicator, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import Token from '../class/TokenManager.js';
import { useTheme } from '../../styles/ThemeProvider.js';
import FastImage from 'react-native-fast-image'
import { DIM } from '../../styles/Dimensions'
import Utils from '../class/Utils.js'

import AsyncStorageManager from '../class/AsyncStorageManager.js';
import CONSTANTS, { CURRENT_BG_NAME } from '../Constants.js';


const SplashScreen = ({ navigation }) => {

  const navi = useNavigation();
  const { theme, setScheme, setBg, unread, setUnread } = useTheme();


  useEffect(() => {
    // Check for authentication token in AsyncStorage or wherever you store it
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = await Token.getToken();

      var currentThemeName = await AsyncStorageManager.getData(CONSTANTS.CURRENT_THEME_NAME /*'currentThemeName'*/);

      var currentBgName = await AsyncStorageManager.getData(CONSTANTS.CURRENT_BG_NAME /*'currentBgName'*/);
      var currentBgType = await AsyncStorageManager.getData(CONSTANTS.CURRENT_BG_TYPE /*'currentBgType'*/);
      var unreadCountFromStorage = await AsyncStorageManager.getData(CONSTANTS.UNREAD_COUNT);

      console.log('currentThemeName splash ==>', currentThemeName);

      var prevBgTime = await Utils.getPrevBgTime();
      console.log("previous activetime: " + prevBgTime);

      if (token && prevBgTime > 0) {
        // User is authenticated, navigate to the main app screen
        //navigation.navigate('MainAppScreen'); // Replace 'MainAppScreen' with your actual main screen name

        if (currentThemeName !== undefined || currentThemeName !== null || currentThemeName != "") {

          if (currentThemeName === 'Elegent') {
            setScheme(CONSTANTS.UI.DEFAULT);
          } else {
            setScheme(currentThemeName); /*'honeycomb'*/ /*'honeycomb'*/
          }

        } else {
          setScheme(CONSTANTS.UI.DEFAULT); /*'honeycomb'*/
        }

        if (!CONSTANTS.IS_BACKGROUND_HIDE) {
          if (currentBgName && currentBgType) {
            setBg(currentBgName)
          } else {
            setBg(CONSTANTS.BG_IMG.ELEGENT /*'ElegantBg'*/);
          }
        }

        if (unreadCountFromStorage) {
          if (unreadCountFromStorage == null || unreadCountFromStorage == undefined || unreadCountFromStorage == "null") {
            setUnread(0);
          } else {
            setUnread(unreadCountFromStorage);
          }
        }

        navi.dispatch(StackActions.replace('tab', { screen: 'tab_home' }));

      } else {
        // User is not authenticated, navigate to the login screen

        // setScheme(CONSTANTS.UI.DEFAULT /*'elegant'*/) // honeycomb
        // if (!CONSTANTS.IS_BACKGROUND_HIDE) {
        //   setBg(CONSTANTS.BG_IMG.ELEGENT /*'ElegantBg'*/);
        // }

        if (!CONSTANTS.IS_BACKGROUND_HIDE) {
          if (currentBgName && currentBgType) {
            setBg(currentBgName)
          } else {
            setBg(CONSTANTS.BG_IMG.ELEGENT /*'ElegantBg'*/);
          }
        }

        if (Platform.OS === 'android') {
          setTimeout(() => navi.dispatch(StackActions.replace('sign_in')), 0);
        }
      }
    } catch (error) {
      console.warn('Error checking authentication:', error);
    }
  };

  return (
    <View>

      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
      }}>
        <View style={styles.container}>

          <FastImage
            source={
              theme?.name == 'Gold' ? require(`../../assets/gold/ShushGoldLogo.webp`)
                : theme?.name == 'Elegant' ? require(`../../assets/honey/ShushSilverLogo.webp`)
                  : theme?.name == 'RoseGold' ? require(`../../assets/roseGold/ShushRoseGoldLogo.webp`)
                    : require(`../../assets/honey/ShushSilverLogo.webp`)
            }
            resizeMode='contain'
            style={{

              justifyContent: 'center',
              height: 82,
              width: 240,
            }}

          />
        </View>
        {/* </ImageBackground> */}
      </View>

    </View>
  );
};
const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  container: {
    height: DIM.height,
    width: DIM.width,
    justifyContent: 'center',
    alignItems: 'center',
    // You can set the background color as needed
  },
  linearGradient: {
    paddingLeft: 15,
    paddingRight: 15,

    width: '100%',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
  },
  image: {
    width: 200, // Set the width of your image
    height: 100, // Set the height of your image
  },
});

export default SplashScreen;
