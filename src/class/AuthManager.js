import {
  Platform,
} from 'react-native';
import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager,
} from 'react-native-fbsdk';
import { appleAuth, appleAuthAndroid } from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import 'react-native-get-random-values';
import messaging from '@react-native-firebase/messaging';
import { StackActions } from '@react-navigation/native';
import { v4 as uuid } from 'uuid';
import { jwtDecode } from 'jwt-decode';
import "core-js/stable/atob";

import Utils from './Utils';
import CONSTANTS from '../Constants';
import Token from './TokenManager';
import AsyncStorageManager from './AsyncStorageManager';

class AuthManager {
  constructor() {
    // Initialize the utility with any necessary configuration or state
    this.someValue = 42;
    //this.navi = useNavigation();
  }

  static handleFacebookSignIn = async (callback) => {
    // Attempt a login using the Facebook login dialog asking for default permissions.  'public_profile'
    LoginManager.logInWithPermissions(['public_profile']).then(login => {
      console.log('fb login result:' + JSON.stringify(login));
      if (login.isCancelled) {
        console.log('Login cancelled');
      } else {
        console.log('fb login result:');
        AccessToken.getCurrentAccessToken().then(data => {
          const accessToken = data.accessToken.toString();
          //console.log('fb login result:', JSON.stringify(accessToken));

          this.getInfoFromToken(accessToken, callback)
            .then(result => {
              //console.log('result:', result);
            })
            .catch(error => {
              console.log('Login fail with error: ' + error);
            });
        });
        //console.log('Login fail with error: ' + error);
      }
    });
  };

  static handleAppleLogin = async (callback) => {

    if (Platform.OS === 'ios') {
      // performs login request
      try {
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          // Note: it appears putting FULL_NAME first is important, see issue #293
          requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        });

        console.log('appleAuthRequestResponse', appleAuthRequestResponse);

        const {
          user: newUser,
          email,
          fullName,
          nonce,
          identityToken,
          realUserStatus /* etc */,
        } = appleAuthRequestResponse;

        user = newUser;

        let proxyEmail = null;
        let subUser = null;

        let firstName = fullName?.givenName;
        let lastName = fullName?.familyName
        let name = fullName?.givenName + " " + fullName?.familyName;

        // fetchAndUpdateCredentialState(updateCredentialStateForUser).catch(error =>
        //   updateCredentialStateForUser(`Error: ${error.code}`),
        // );

        if (identityToken) {
          // e.g. sign in with Firebase Auth using `nonce` & `identityToken`
          //console.log("Nonce: " + nonce);
          console.log('Identity: ' + identityToken);
          let jwt = jwtDecode(identityToken, { body: true });
          console.log('Email: ' + JSON.stringify(jwt));
          proxyEmail = jwt.email;
          subUser = jwt.sub;

          console.log("User:  " + user + " Proxy+Email: " + jwt.email);
        } else {
          // no token - failed sign-in?
        }

        if (realUserStatus === appleAuth.UserStatus.LIKELY_REAL) {
          console.log("I'm a real person!");
        }

        let finalEmail = null;
        let finalUserId = null;


        if (email !== null) {
          finalEmail = email;
          finalUserId = user;
        } else {
          finalEmail = proxyEmail;
          finalUserId = subUser;
        }

        const token = user;
        const username = name;
        const providerName = CONSTANTS.SING_IN_WITH_APPLE /*'apple'*/;
        const providerId = finalUserId;

        //console.log(userInfo);
        //Apple Sign In
        //Api Call need to return in call back

        //socialLoginApi(providerId, providerName, finalEmail, username, token);

        callback(providerId, providerName, finalEmail, username, token);
        console.log(`Apple Authentication Completed, ${user}, ${email}`);

      } catch (error) {
        if (error.code === appleAuth.Error.CANCELED) {
          console.warn('User canceled Apple Sign in.');
        } else {
          console.warn(error);
        }
      }

    } else if (Platform.OS === 'android') {
      // Generate secure, random values for state and nonce
      const rawNonce = uuid();
      const state = uuid();

      // Configure the request
      appleAuthAndroid.configure({
        // The Service ID you registered with Apple
        clientId: '89DL9C7GTS',

        // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
        // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
        redirectUri: 'https://example.com/auth/callback',

        // The type of response requested - code, id_token, or both.
        responseType: appleAuthAndroid.ResponseType.ALL,

        // The amount of user information requested from Apple.
        scope: appleAuthAndroid.Scope.ALL,

        // Random nonce value that will be SHA256 hashed before sending to Apple.
        nonce: rawNonce,

        // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
        state,
      });

      // Open the browser window for user sign in
      const response = await appleAuthAndroid.signIn();

    }
  }

  static handleGoogleSignIn = async (callback) => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const token = userInfo.idToken;
      const user = userInfo.user;
      const email = user.email;
      const username = user.name;
      const providerName = CONSTANTS.SING_IN_WITH_GOOGLE; //'google';
      const providerId = user.id;

      console.log(userInfo);

      //Api Call 
      //Return in Call Back
      callback(providerId, providerName, email, username, token);
      //socialLoginApi(providerId, providerName, email, username, token);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User canceled the sign-in process
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Another sign-in process is in progress
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Play services are not available on the device
      } else {
        // Handle other errors
        //console.log(error);
        Utils.showAlertDialog('SHA1 ' + error);
        console.log('error occured unknow error: ' + error);
      }
      console.log('Error: ' + error);
    }
  }

  //Sign Out

  static signOutGoogle = async () => {
    try {
      await GoogleSignin.signOut();// Remember to remove the user from your app's state as well
    } catch (error) {
      console.warn(error);
    }
  };
  static revokeAccessGoogle = async () => {
    try {
      await GoogleSignin.revokeAccess();
      // Google Account disconnected from your app.
      // Perform clean-up actions, such as deleting data associated with the disconnected account.
    } catch (error) {
      console.warn(error);
    }
  };

  static signOutApple = async (callback) => {

    // return appleAuth.performRequest({
    //   requestedOperation: appleAuth.Operation.LOGOUT,
    // });

    try {
      await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGOUT
      }).then(() => {
        callback('success');
      })

    } catch (error) {
      if (error.code === appleAuth.Error.CANCELED) {
        console.warn('User canceled Apple Sign in.');
        callback('cancle');
      } else {
        console.warn(error);
      }
    }
  }

  static revokeAccessApple = async () => {
    // try {
    //   await appleAuth.onCredentialRevoked()
    // } catch (error) {
    //   console.warn(error);
    // }
  }

  static signOutFacebook = async () => {
    try {
      LoginManager.logOut()
    } catch (error) {
      console.log("signOutFacebook error:" + error)
    }
  }

  //For Facebook Login
  static getInfoFromToken = async (token, callback) => {
    const responseCallback = (error, result) => {
      if (error) {
        console.log('login info has error: ' + error);
      } else {
        //setUserInfo({ userInfo: result });

        console.log('result:', result);

        console.log('user info: ' + result);
        const username = result.name;
        const providerId = result.id;
        const email = result.email;
        const providerName = CONSTANTS.SIGN_IN_WITH_FACEBOOK; //'facebook';
        callback(providerId, providerName, email, username, token);
        //socialLoginApi(providerId, providerName, email, username, token);
      }
    };

    // the famous params object...
    const profileRequestParams = {
      fields: {
        string: 'id, name, email, first_name, last_name',
      },
    };

    const profileRequestConfig = {
      httpMethod: 'GET',
      version: 'v18.0',
      parameters: profileRequestParams,
      accessToken: token.toString(),
    };

    const profileRequest = new GraphRequest(
      '/me',
      profileRequestConfig,
      responseCallback,
    );
    new GraphRequestManager().addRequest(profileRequest).start();
  };
}
export default AuthManager;

export const apiErrorCheck = async (error, navi) => {

  switch (error) {
    case CONSTANTS.HTTP_STATUS_CODE.UNAUTHORIZED:
      //console.log("Error got==: " + error.status)
      removeLoginCredential(navi)
      break;
    default:
      console.log('Error Code:' + error);
  }
}

export const removeLoginCredential = async (navi, isRemoveFcmToken = true) => {

  //return new Promise(async (resolve, reject) => { }
  Utils.setProfileUpdateShowOnce(false);
  await Token.clearToken();
  await AsyncStorageManager.removeAllItemValue();
  try {
    await messaging().requestPermission();
    let isRegister = messaging().isDeviceRegisteredForRemoteMessages;

    if (isRegister && isRemoveFcmToken) {
      await messaging().deleteToken(undefined, '*').then(value => {
        console.log("Delete token: " + value);

      }).catch(error => {
        console.log("Delete token error: " + error);
      })

      //console.log('Device Token delete: ', token);
    }

  } catch (error) {
    console.log('Device Token delete retrieval error:', error);
  }

  if (Platform.OS === 'android') {

    navi.dispatch(StackActions.replace('sign_in'));
  } else if (Platform.OS === 'ios') {

    //Need to fix that
    navi.navigate('sign_in');
  }
  //navi.dispatch(StackActions.replace('sign_in'));

}

export const removeFCMCredential = async () => {

  //return new Promise(async (resolve, reject) => { }
  // Utils.setProfileUpdateShowOnce(false);
  // await Token.clearToken();
  // await AsyncStorageManager.removeAllItemValue();
  try {
    await messaging().requestPermission();
    let isRegister = messaging().isDeviceRegisteredForRemoteMessages;

    if (isRegister) {
      await messaging().deleteToken(undefined, '*').then(value => {
        console.log("Delete token: " + value);

      }).catch(error => {
        console.log("Delete token error: " + error);
      })

      //console.log('Device Token delete: ', token);
    }

  } catch (error) {
    console.log('Device Token delete retrieval error:', error);
  }

}
