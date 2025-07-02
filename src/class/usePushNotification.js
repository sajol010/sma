import React from 'react';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';
import firebase from '@react-native-firebase/app';
// Your secondary Firebase project credentials for Android...

//TODO need to delete
const androidCredentials = {
  clientId:
    '932238780865-943c034jv5a5n5g0g9g60coj1i8ef9sg.apps.googleusercontent.com',
  appId: '1:932238780865:android:cd8bc7b7fcab903e8ae740',
  apiKey: 'AIzaSyBdugJrxaOW-WMq7VMipx3KSPLBGuU4how',
  databaseURL: '',
  storageBucket: '',
  messagingSenderId: '932238780865',
  projectId: 'shush-4e25d',
};

// Your secondary Firebase project credentials for iOS...
const iosCredentials = {
  clientId: '',
  appId: '',
  apiKey: '',
  databaseURL: '',
  storageBucket: '',
  messagingSenderId: '',
  projectId: '',
};

// Select the relevant credentials
const credentials = Platform.select({
  android: androidCredentials,
  ios: iosCredentials,
});

const config = {
  name: 'Shush',
};

const usePushNotification = () => {
  const requestUserPermission = async () => {
    if (Platform.OS === 'ios') {
      //Request iOS permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      } else {
        console.log('Authorization status:', authStatus);
      }
    } else if (Platform.OS === 'android') {
      //Request Android permission (For API level 33+, for 32 or below is not required)
      const res = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      console.log('Authorization status:', JSON.stringify(res));
      if (res === 'granted') {
        getFCMToken();
      }
    }
  };

  const getFCMToken = async () => {
    console.log('getFCMToken app: ' + firebase.apps.length);
    // Intialize Firebase if it has not been previously initialized
    if (!firebase.apps.length) {
      await firebase.initializeApp(credentials, config).then(() => {
        console.log('created firebase app');
      });
      //firebase.initializeApp({})z
    } else {
      await firebase
        .app('Shush')
        .delete()
        .then(() => {
          // firebase.initializeApp(credentials, config).then(() => {
          //   console.log('created firebase app after delete');
          // });
        });
    }
    //await firebase.app('Shush').delete();
    //const app = await firebase.initializeApp(credentials, config);
    //await firebase.initializeApp();

    // const app = await firebase.initializeApp(
    //   // use platform specific firebase config
    //   Platform.OS === 'ios' ? iosCredentials : androidCredentials,
    //   // name of this app
    //   'Shush',
    // );
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('Your Firebase Token is:', fcmToken);
    } else {
      console.log('Failed', 'No token received');
    }

    // app.onReady().then(app_ => {
    //   // --- ready ---
    //   // use `app` arg, kittensApp var or `app('kittens')` to access modules
    //   // and their methods. e.g:
    //   // firebase.app('kittens').auth().signInAnonymously().then((user) => {
    //   //     console.log('kittensApp user ->', user.toJSON());
    //   // });
    //   //const fcmToken = firebase.app('Shush').messaging().getToken();
    //   const fcmToken = messaging().getToken();
    //   if (fcmToken) {
    //     console.log('Your Firebase Token is:', fcmToken);
    //   } else {
    //     console.log('Failed', 'No token received');
    //   }
    // });
  };

  const listenToForegroundNotifications = async () => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log(
        'A new message arrived! (FOREGROUND)',
        JSON.stringify(remoteMessage),
      );
    });
    return unsubscribe;
  };

  const listenToBackgroundNotifications = async () => {
    const unsubscribe = messaging().setBackgroundMessageHandler(
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
    const unsubscribe = messaging().onNotificationOpenedApp(
      async remoteMessage => {
        console.log(
          'App opened from BACKGROUND by tapping notification:',
          JSON.stringify(remoteMessage),
        );
      },
    );
    return unsubscribe;
  };

  const onNotificationOpenedAppFromQuit = async () => {
    const message = await messaging().getInitialNotification();

    if (message) {
      console.log(
        'App opened from QUIT by tapping notification:',
        JSON.stringify(message),
      );
    }
  };

  return {
    requestUserPermission,
    getFCMToken,
    listenToForegroundNotifications,
    listenToBackgroundNotifications,
    onNotificationOpenedAppFromBackground,
    onNotificationOpenedAppFromQuit,
  };
};

export default usePushNotification;
