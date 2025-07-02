import {
  View,
  StyleSheet,
  Platform,
  AppState,
  NativeModules,
  NativeEventEmitter,
  StatusBar
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'; //useTheme,
import LottieView from 'lottie-react-native'
import messaging from '@react-native-firebase/messaging';
import remoteConfig from '@react-native-firebase/remote-config';

import { request, PERMISSIONS } from 'react-native-permissions';


//import { purchaseUpdatedListener, promotedProductListener } from 'react-native-iap';

import { useTheme } from '../../../styles/ThemeProvider'
import { apiErrorCheck, removeLoginCredential } from '../../class/AuthManager.js';

import Video from 'react-native-video'
import FastImage from 'react-native-fast-image'

//Class
import API_URL from '../../Api.js';
import AsyncStorageManager from '../../class/AsyncStorageManager';

import { useNetInfo, addEventListener } from "@react-native-community/netinfo";
import Toast from 'react-native-toast-message'
import Token from '../../class/TokenManager';

import toastConfig from './NotificationConfig'
import Utils from '../../class/Utils'
import CONSTANTS from '../../Constants'

const BackgroundProvider = ({ children }) => {
  const { type, isConnected } = useNetInfo()
  const [noWifi, setNoWifi] = useState(false)

  const [isPauseBgVideo, setIsPauseBgVideo] = useState(false);

  const { theme, setScheme, bg, unread, setUnread } = useTheme()
  console.log(bg)

  const navi = useNavigation();

  //const { RNIapIos } = NativeModules;
  //const RNIapEmitter = new NativeEventEmitter(RNIapIos);

  useEffect(() => {
    console.log('======> Inside useEffect() logic <======')
    if (isConnected) {
      showTost('Online', 'You\'re online ...', true);
    } else {
      setNoWifi(true)
      if (noWifi) {
        showTost('Offline', 'You\'re offline now!', false);
      }
    }
  }, [isConnected])

  // useEffect(() => {
  //   if (noWifi && isConnected) {
  //     setNoWifi(false)
  //     showTost('Online', 'You\'re online ...', true);
  //   }
  // }, [noWifi, isConnected])

  useEffect(() => {
    checkPrevBgTimeFirstLunch();

    requestUserPermission();

    onNotificationOpenedAppFromQuit();
    listenToBackgroundNotifications();

    let forground = listenToForegroundNotifications();
    onNotificationOpenedAppFromBackground();

    //Latest Build

    // let defult = {
    //   latest_build_ios: 1.0,
    // }
    // let latest_key = 'latest_build_ios';

    // if (Platform.OS === 'android') {
    //   defult = {
    //     latest_build_android: 1.0,
    //   }
    //   latest_key = 'latest_build_android';

    // } else if (Platform.OS === 'ios') {
    //   defult = {
    //     latest_build_ios: 1.0,
    //   }
    //   latest_key = 'latest_build_ios';

    // } else {
    //   console.log('Platform not found');
    // }

    // remoteConfig()
    //   .setDefaults(defult)
    //   .then(() => remoteConfig().fetchAndActivate())
    //   .then(fetchedRemotely => {
    //     if (fetchedRemotely) {
    //       console.log('Configs were retrieved from the backend and activated.');
    //     } else {
    //       console.log(
    //         'No configs were fetched from the backend, and the local configs were already activated',
    //       );
    //     }
    //   });

    // remoteConfig().fetch(100);
    // const latest_build = remoteConfig().getValue(latest_key);
    // console.log("Build : " + Platform.OS + " " + JSON.stringify(latest_build));

    // if (latest_build.getSource() === 'remote') {
    //   console.log('Parameter value was from the Firebase servers.');

    //   let latestBuildNo = latest_build.asNumber()
    //   console.log('Build no: '+ latestBuildNo.toString);

    //   let latestBuild = Platform.OS === 'android' ? CONSTANTS.CURRENT_BUILD_ANDROID : CONSTANTS.CURRENT_BUILD_IOS;

    //   if (latestBuildNo > latestBuild) {
    //     Toast.show({
    //       text1: "Update your app",
    //       text2: 'A new update is available',
    //       type: 'warning',
    //     })
    //   }

    // } else if (latest_build.getSource() === 'default') {
    //   console.log('Parameter value was from a default value.');
    // } else {
    //   console.log('Parameter value was from a locally cached value.');
    // }

    const appStateListener = AppState.addEventListener(
      'change',
      async nextAppState => {
        console.log('Next AppState is: ', nextAppState);

        switch (nextAppState) {
          case 'active':

            var currentTime = new Date().getTime();
            console.log("current time Active: " + currentTime);
            var prevBgTime = await Utils.getPrevBgTime();
            console.log("previous activetime: " + prevBgTime);
            var timeInMill = Math.floor(currentTime - prevBgTime);
            var timeInSec = Math.floor(timeInMill / 1000);
            console.log("Active after: " + timeInSec + 's');

            var token = Token.getToken();
            var isAutoLockPause = await Utils.getAutoLockPause();

            console.log("isAutoLockPause: " + isAutoLockPause)

            // if (prevBgTime == 0) {
            //   removeLoginCredential(navi, false)
            // }

            if (timeInSec > CONSTANTS.AUTO_LOCK_TIME && prevBgTime != 0 && token && !isAutoLockPause) {
              console.log("is Remove Credentials: ")
              removeLoginCredential(navi, false)
            }

            if (isAutoLockPause) {
              Utils.setAutoLockPause(false);
            }

            //setIsPauseBgVideo(false)
            // const id = setTimeout(() =>  setIsPauseBgVideo(true), 120*1000);
            //clearTimeout(id);

            break;
          case 'inactive':
            console.log("Went inactive");
            var currentTime = new Date().getTime();
            console.log("current time background: " + currentTime);
            Utils.setPrevBgTime(currentTime);
            //setIsPauseBgVideo(true)

            //clearTimeout(id);
            break;
          case 'background':
            console.log("Went background");
            var currentTime = new Date().getTime();
            console.log("current time background: " + currentTime);
            Utils.setPrevBgTime(currentTime);
            //setIsPauseBgVideo(true)
            //clearTimeout(id);
            break;
          default:
            console.log("Unknown Active state");
        }
        //setAppState(nextAppState);
      },
    );



    return () => {
      forground = null;
      appStateListener?.remove();

      //promProdcuct?.remove()
      // purchaseUpadteListener?.remove();
      // promoteProductListener?.remove();
    }
  }, [])

  useEffect(() => {
    console.log("Prev unread")
  }, [unread])

  const checkPrevBgTimeFirstLunch = async () => {
    var prevBgTime = await Utils.getPrevBgTime();
    console.log("first lunch useffect prevBgTime:  " + prevBgTime);
    var token = Token.getToken();
    if (prevBgTime === 0 && token) {
      removeLoginCredential(navi, false)
    }
  }

  const showTost = async (title, msg, isOnline) => {

    let prevNetStatus = await Utils.getNetworkStateShowOnce()

    let currentNetStatus = isOnline ? CONSTANTS.NET_CONNECTION_STATUS.ONLINE : CONSTANTS.NET_CONNECTION_STATUS.OFFLINE;
    console.log("Previous net state: " + prevNetStatus + " current net state: " + isOnline)

    let showTost = false;
    switch (prevNetStatus) {

      case CONSTANTS.NET_CONNECTION_STATUS.ONLINE:
        showTost = currentNetStatus === prevNetStatus ? false : true
        break;

      case CONSTANTS.NET_CONNECTION_STATUS.OFFLINE:
        showTost = currentNetStatus === prevNetStatus ? false : true
        break;
      case CONSTANTS.NET_CONNECTION_STATUS.NEVER_SHOW:
        showTost = false;
        Utils.setNetworkStateShowOnce(CONSTANTS.NET_CONNECTION_STATUS.INIT);
        return;
        break;
      case CONSTANTS.NET_CONNECTION_STATUS.INIT:
        showTost = false;
        break;
      default:
        showTost = false;
    }

    if (showTost) {
      Toast.show({
        text1: title,
        text2: msg,
        type: 'warning',
        onPress: () => {
          console.log('Press notification');
          closeToast();
        }
      })
    }

    Utils.setNetworkStateShowOnce(currentNetStatus);
  }

  const showToast = (type, title, body, receivedData) => {

    Toast.show({
      type: type,
      text1: title,
      text2: body,
      onPress: () => {
        console.log('Press notification');
        closeToast();
        try {
          const data = receivedData;
          //const senderId = data.sender_id;

          //const ndaId = data.n_d_a_id;
          //const ndaName = data.receiver_name;
          //const status = data.status;
          ///const fileUrl = data.file_url;
          //const senderId = data.sender_id;

          console.log('Nda Name: ' + ndaName + 'NDA Id: ' + ndaId);
          // openNdaPage(ndaId, ndaName, displayAs, senderId, fileUrl, status);

          const nda = data.nda;
          const ndaId = data.n_d_a_id;
          const ndaName = nda.receiver_name;
          const status = nda.status;
          const fileUrl = nda.file_url;
          console.log('Nda Name: ' + ndaName + 'NDA Id: ' + ndaId);
          const senderId = nda.sender_id;
          openNdaPage(ndaId, ndaName, senderId, fileUrl, status);
        } catch (e) {
          console.log('Quite to open app by notification error: ' + e);
        }
      },
    });
  };

  const closeToast = () => {
    Toast.hide();
  };
  const requestNotificationPermission = async () => {
    const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    return result;
  };

  //Working
  const requestUserPermission = async () => {
    try {
      let userToken = await Token.getToken();

      if (Platform.OS === 'android') {
        requestNotificationPermission();
      }
      if (userToken) {

        await messaging().requestPermission();
        let deviceToken = await messaging().getToken();
        console.log('Device Token:', deviceToken);
        updateDeviceToken(userToken, deviceToken)
      } else {
        console.log('User token not set yet', deviceToken);
      }
    } catch (error) {
      console.log('Background Permission or Token retrieval error:', error);
    }
  };

  const listenToForegroundNotifications = async () => {

    console.log("Notification Foreground Listener add: ")
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log(
        'A new message arrived! (FOREGROUND)',
        JSON.stringify(remoteMessage),
      );
      try {
        let data = remoteMessage.data.data;
        let notification = remoteMessage.notification;
        let title = notification.title;
        let body = notification.body;

        console.log('Data: ' + JSON.parse(data));
        let receivedData = JSON.parse(data);

        if (Platform.OS === 'android') {
          showToast('ndaReceived', title, body, receivedData);
        }

        let count = 0;
        //showToast('warning', title, body, receivedData);
        console.log("prev unread count forground: " + unread)

        let unreadCountFromStorage = await AsyncStorageManager.getData(CONSTANTS.UNREAD_COUNT);

        console.log("unread from async: " + unreadCountFromStorage);
        if (!isNaN(unreadCountFromStorage)) {
          count = Number(unreadCountFromStorage);
        }

        if (unread === null || unread === 0 || unread === NaN || unread === undefined || isNaN(unread)) {
          let unreadCountFromStorage = await AsyncStorageManager.getData(CONSTANTS.UNREAD_COUNT);
          console.log("unread from async: " + unreadCountFromStorage);
          // if (!isNaN(unreadCountFromStorage)) {
          //   count = Number(unreadCountFromStorage);
          // }

          console.log("unread from async: " + unreadCountFromStorage);
          if (unreadCountFromStorage && !isNaN(unreadCountFromStorage)) {
            count = Number(unreadCountFromStorage);
          }
        } else {
          count = Number(unread);
        }

        count = count + 1;
        console.log("after increment unread count for ground: " + count)
        updateUnreadCount(count);

      } catch (e) {
        console.log('Error: ' + e);
      }
    });
    return unsubscribe;
  };

  const listenToBackgroundNotifications = async () => {

    console.log("Notification Background Listener add: ")
    let unsubscribe = messaging().setBackgroundMessageHandler(
      async remoteMessage => {
        console.log(
          'A new message arrived! (BACKGROUND)',
          JSON.stringify(remoteMessage),
        );
      },
    );
    return unsubscribe;
  };

  const onNotificationOpenedAppFromBackground = async () => {
    //ios
    console.log("Notification OpenedAppFromBackground Listener add: ")
    let unsubscribe = messaging().onNotificationOpenedApp(
      async remoteMessage => {
        console.log(
          'App opened from BACKGROUND by tapping notification:',
          JSON.stringify(remoteMessage),
        );
        try {
          let data = remoteMessage.data.data;
          let notification = remoteMessage.notification;
          let title = notification.title;
          let body = notification.body;

          console.log('Data: ' + JSON.parse(data));
          let receivedData = JSON.parse(data);

          console.log('Received data: ' + receivedData);

          let nda = receivedData.nda;

          let ndaId = receivedData.n_d_a_id;

          let ndaName = nda.receiver_name;
          let status = nda.status;
          let fileUrl = nda.file_url;
          console.log('Nda Name: ' + ndaName + 'NDA Id: ' + ndaId);
          let senderId = nda.sender_id;
          openNdaPage(ndaId, ndaName, senderId, fileUrl, status);

        } catch (e) {
          console.log('Quite to open app by notification error: ' + e);
        }
      },
    );
    return unsubscribe;
  };

  const onNotificationOpenedAppFromQuit = async () => {

    console.log("Notification OpenedAppFromQuit Listener add: ")
    let remoteMessage = await messaging().getInitialNotification();

    //Can handle push from background
    if (remoteMessage) {
      console.log(
        'App opened from QUIT by tapping notification:',
        JSON.stringify(remoteMessage),
      );

      //var count = 0;
      //console.log("prev unread count forground: " + unread)
      // if(unread === null || unread === 0){
      //   var unreadCountFromStorage = await AsyncStorageManager.getData(CONSTANTS.UNREAD_COUNT);
      //   count = Number(unreadCountFromStorage);
      // } else {
      //   count = Number(unread);
      // }
      // updateUnreadCount(count);

      try {
        const data = remoteMessage.data.data;
        const notification = remoteMessage.notification;
        const title = notification.title;
        const body = notification.body;

        console.log('Data: ' + JSON.parse(data));
        const receivedData = JSON.parse(data);

        console.log('Received data: ' + receivedData);

        const nda = receivedData.nda;

        const ndaId = receivedData.n_d_a_id;

        const ndaName = nda.receiver_name;
        const status = nda.status;
        const fileUrl = nda.file_url;
        console.log('Nda Name: ' + ndaName + 'NDA Id: ' + ndaId);
        const senderId = nda.sender_id;
        openNdaPage(ndaId, ndaName, senderId, fileUrl, status);

      } catch (e) {
        console.log('Quite to open app by notification error: ' + e);
      }
    }
  };

  // const onInitialNotification = async () => {
  //   const message = await messaging()
  //     .getInitialNotification()
  //     .then(remoteMessage => {
  //       if (remoteMessage) {
  //         console.log(
  //           'Initial Notification caused app to open from quit state:',
  //           remoteMessage.notification,
  //         );
  //       }
  //     });
  // };

  const updateUnreadCount = (count) => {
    if (count < 1) {
      count = 0;
    }
    setUnread(count);
  }

  const updateDeviceToken = async (userToken, deviceToken_) => {

    if (deviceToken_ === undefined || deviceToken_ === '' || deviceToken_ === null) {
      console.log("Device token empty: " + deviceToken_);
      return
    }

    let isDeviceTokenUploaded = await AsyncStorageManager.getData(CONSTANTS.IS_DEVICE_TOKEN_UPLOAD);
    console.log("Device token async: " + isDeviceTokenUploaded);

    if (isDeviceTokenUploaded === "YES") {
      console.log("Device token already uploaded and return ")
      return;
    }

    console.log('Update device token api: ' + api)
    console.log('Device Token: ' + deviceToken_)
    let bodyData = JSON.stringify({
      device_token: deviceToken_, //Device token
    })

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setIsLoading(false)
      return
    }

    let api = API_URL.UPDATE_DEVICE_TOKEN
    try {
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: bodyData,
      })
      let json = await response.json();
      if (response.status === 200) {
        // console.log('Login Response: ' + JSON.stringify(json));

        console.log('Device token upload success: ');
        console.log('ok==>');

        await AsyncStorageManager.storeData(
          CONSTANTS.IS_DEVICE_TOKEN_UPLOAD,
          deviceToken_,
        );
      } else {
        console.log(json);
      }
    } catch (error) {
      console.warn(error)
      console.log(error)
      //setIsLoading(false)
      console.log('Cannot Login with previous biometric data')

      Utils.netConnectionFaild();
      //TODO need to show a dialog
    }
  }

  const openNdaPage = async (ndaId, ndaName, senderId, fileUrl, status) => {

    let user_id = await AsyncStorageManager.getData(CONSTANTS.USER_ID /*'user_id'*/);
    //setUserId(user_id);

    let userIdNum = Number(user_id);
    let senderIdNum = Number(senderId + '');
    var displayAs = 'sender'; // me as
    if (senderIdNum == userIdNum) {
      displayAs = 'sender';
    } else {
      displayAs = 'receiver';
    }

    getSingleNda(ndaId, displayAs)

    return
    navi.navigate('create_nda_signing', {
      id: ndaId,
      name: ndaName,
      receiver_name: ndaName,
      displayAs: displayAs,
      status: status,
      fileUrl: fileUrl,
      isEdit: false,
      ///data: item,
    });
  };

  const getSingleNda = async (id, displayAs) => {
    //setIsLoading(true);
    console.log("NDA Id: ", id);
    let token = await Token.getToken();

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      //setIsLoading(false);
      return
    }

    var singleNdaApi = API_URL.NDA_LIST + '/' + id;
    await fetch(singleNdaApi, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        try {
          var a = JSON.stringify(responseJson);
          var json = JSON.parse(a);
          if (responseJson.status === 200) {
            var resp = json.data;
            console.log('Single nda ==>' + JSON.stringify(resp));
            console.log('go to sing and send display as ==>' + displayAs);

            navi.navigate('create_nda_signing', {
              id: resp?.id,
              n_d_a_sample_id: resp?.n_d_a_sample_id,
              name: resp?.receiver_name,
              displayAs: displayAs,
              status: resp?.status,
              fileUrl: resp?.file_url,
              isEdit: false,

              // custom_section: resp?.additional_information,
              //data: item,
            });

          } else {

            //setIsLoading(false);
          }
        } catch (error) {
          console.warn(error);
          console.log(error);
          //setIsLoading(false);
        }
      })
      .catch(error => {
        console.warn(error);
        //setIsLoading(false);
        Utils.netConnectionFaild();
      });
  };

  return (
    <View style={styles.bgProvider}>
      <StatusBar
        translucent
        animated={true}
        backgroundColor={'transparent'}
        barStyle={theme?.dark ? 'light-content' : 'dark-content'}
      />
      {bg.type === 'lottie' ? (
        <LottieView
          source={bg.file}
          autoPlay
          loop
          style={styles.bg}
          resizeMode="cover"
        />
      ) : bg.type === 'video' ?
        <Video
          source={bg.file}
          style={styles.backgroundVideo}
          muted={true}
          repeat={true}
          //control={false}
          //paused={isPauseBgVideo}
          //autoplay={true}
          //sleep={true}
          preventsDisplaySleepDuringVideoPlayback={false}
          pictureInPicture={false}
          playWhenInactive={false}
          //playInBackground={true}
          resizeMode="cover"
        /> : (
          <FastImage
            source={bg.file}
            style={{
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            resizeMode="cover"
          />
        )}
      {children}
      <Toast
        position="top"
        topOffset={80}
        config={toastConfig}
        autoHide={true}
        onPress={() => {

        }}
        onHide={() => {
          console.log('Notification onHide ---  ');
        }}
        visibilityTime={2000}
        swipeable={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  bgProvider: {
    flex: 1,
  },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%' //DIM.height,
  }
})
export default BackgroundProvider;