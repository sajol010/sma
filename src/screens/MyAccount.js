import messaging from '@react-native-firebase/messaging';
import { StackActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//Class
import AsyncStorageManager from '../class/AsyncStorageManager.js';
import AuthManager from '../class/AuthManager.js';
import { useTheme } from '../../styles/ThemeProvider';
import Url from '../Api.js';
import Token from '../class/TokenManager';

//Component 
import ModalPopupConfirmation from '../components/global/ModalPopupConfirmation';
import InputButtonComponent from '../components/global/InputButtonComponent.js';
import LogoHeader from '../components/global/LogoHeader.js';

//helper
import CONSTANTS from '../Constants.js';
import Utils from '../class/Utils.js';


export default function MyAccount() {
  const navi = useNavigation();
  const { theme, setScheme, bg, setBg } = useTheme();
  const [deviceToken, setDeviceToken] = useState();
  const [isSaveBtnDisable, setDeleteBtnDisable] = useState(false);
  const [isLoadingLogoutBtn, setIsLoadingLogoutBtn] = useState(false);
  const [token, setToken] = useState('');
  const [isDeleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);

  const insets = useSafeAreaInsets();

  useEffect(() => {

    const asyncFunc = async () => {
      let userToken = await Token.getToken();
      if (userToken) {
        setToken(userToken);
        // getStateList(userToken);
      } else {
        console.log('Token not found');
        return false;
      }
    };

    requestUserPermission();
    asyncFunc();
  }, []);


  //Get Device token for log out
  const requestUserPermission = async () => {
    try {
      await messaging().requestPermission();
      const token = await messaging().getToken();
      console.log('Device Token:', token);
      setDeviceToken(token);
    } catch (error) {
      console.log('Permission or Token retrieval error:', error);
    }
  };

  const handleDeleteAccout = async () => {
    var signInMethod = await AsyncStorageManager.getData(CONSTANTS.SIGN_IN_METHOD /*'sign_in_method'*/)
    console.log("Sign Out method: " + signInMethod);
    switch (signInMethod) {
      case CONSTANTS.SIGN_IN_WITH_FACEBOOK:
        deleteAccount();
        break;
      case CONSTANTS.SING_IN_WITH_APPLE:

        await AuthManager.signOutApple((status) => {
          if (status === 'success') {
            console.log("Logout success");
            deleteAccount();
          } else {
            console.log("Logout faild");
            return;
          }
        })
        break;
      case CONSTANTS.SING_IN_WITH_GOOGLE:
        await AuthManager.signOutGoogle();
        await AuthManager.revokeAccessGoogle();
        deleteAccount();
        break;
      case CONSTANTS.SING_IN_WITH_BIOMETRIC:
        console.log("Sign Out method: " + signInMethod);
        deleteAccount();
      default:
        console.log("Sign Out method: " + signInMethod);
        deleteAccount();
    }

  }

  const handleLogout = async () => {
    setIsLoadingLogoutBtn(true);
    var signInMethod = await AsyncStorageManager.getData(CONSTANTS.SIGN_IN_METHOD /*'sign_in_method'*/)
    console.log("Sign Out method: " + signInMethod);
    switch (signInMethod) {
      case CONSTANTS.SIGN_IN_WITH_FACEBOOK:
        removeLoginCredential();
        break;
      case CONSTANTS.SING_IN_WITH_APPLE:
        await AuthManager.signOutApple((status) => {
          if (status === 'success') {
            console.log("Logout success");
            removeLoginCredential(); //because some problem
          } else {
            console.log("Logout faild");
            setIsLoadingLogoutBtn(false);
            return;
          }
        })
        break;
      case CONSTANTS.SING_IN_WITH_GOOGLE:
        await AuthManager.signOutGoogle();
        await AuthManager.revokeAccessGoogle();
        removeLoginCredential()
        break;
      case CONSTANTS.SING_IN_WITH_BIOMETRIC:
        console.log("Sign Out method: " + signInMethod);
        removeLoginCredential();
      default:
        console.log("Sign Out method: " + signInMethod);
        removeLoginCredential();
    }
  }

  const removeLoginCredential = async () => {

    Utils.setProfileUpdateShowOnce(false);
    await Token.clearToken();
    await AsyncStorageManager.removeAllItemValue();

    try {

      await messaging().requestPermission();

      let isRegister = messaging().isDeviceRegisteredForRemoteMessages

      if (isRegister) {
        await messaging().deleteToken(undefined, '*').then(value => {
          console.log("Delete token: " + value);

        }).catch(error => {
          console.log("Delete token error: " + error);
        })

        console.log('Device Token delete: ', token);
      }

    } catch (error) {
      console.log('Device Token delete retrieval error:', error);
    }

    setIsLoadingLogoutBtn(false);

    navi.dispatch(StackActions.replace('sign_in'));
    if (
      deviceToken === undefined ||
      deviceToken === null ||
      deviceToken === ''
    ) {
      console.log('Device token is empty');
    } else {
      logout(deviceToken);
    }
  }

  const deleteAccount = async () => {

    setDeleteBtnDisable(true);

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setDeleteBtnDisable(false);
      return
    }

    try {
      var deleteApi = Url.DELETE_ACCOUNT;
      await fetch(deleteApi, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
        },
      })
        .then(response => response.json())
        .then(async responseJson => {
          try {
            var a = JSON.stringify(responseJson);
            var json = JSON.parse(a);

            console.log("Delete: response: " + JSON.stringify(json));
            console.log('Account delete Error==>', json?.message);


            if (responseJson.status === 200) {

              console.log('Account delete => success');
              //Data Delete
              Utils.setProfileUpdateShowOnce(false);
              await Token.clearToken();
              await AsyncStorageManager.removeAcountDeleteValues();
              navi.dispatch(StackActions.replace('sign_in'));

              setDeleteAccountModalVisible(true);
              //setScheme(CONSTANTS.UI.ELEGENT /*'elegant'*/);
              //setBg(CONSTANTS.BG_IMG.ELEGENT /*'ElegantBg'*/);

            } else {
              console.log('Error==>', json?.message);
              Utils.showAlertDialog("Unable to account delete", json?.message)
              // console.log('Error==>', JSON.stringify(json).message);
            }

          } catch (error) {
            console.warn(error);
            console.log(error);
            Utils.showAlertDialog("Unable to account delete", error)
            setDeleteAccountModalVisible(false);
          }
          setDeleteBtnDisable(false);
        })
        .catch(error => {
          console.warn(error);

          setDeleteBtnDisable(false);
          setDeleteAccountModalVisible(false);
          Utils.netConnectionFaild();
        });
    } catch (error) {
      console.warn(error);
      console.log(error);

      setDeleteBtnDisable(false);
      setDeleteAccountModalVisible(false);
      Utils.netConnectionFaild();
    }
  };

  const logout = async deviceToken => {
    console.log('Logout device token: ' + deviceToken);

    var isBioLoginEnabledStr = await AsyncStorageManager.getData(CONSTANTS.IS_BIO_EANBLED /*'is_bio_login_enabled',*/);

    console.log('Previous settings bioLogin: ' + isBioLoginEnabledStr);
    var isBioLoginEnabledNumber = isBioLoginEnabledStr === 'YES' ? '1' : '0';
    console.log(
      'Previous settings bioLogin in 0 n 1: ' + isBioLoginEnabledNumber,
    );

    try {
      var stateApi = Url.LOGOUT;
      fetch(stateApi, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
        },
        body: JSON.stringify({
          device_token: deviceToken,
          bio_log: isBioLoginEnabledNumber,
        }),
      })
        .then(response => response.json())
        .then(responseJson => {
          try {
            var a = JSON.stringify(responseJson);
            var json = JSON.parse(a);
            if (responseJson.status === 200) {
              console.log('Logout success => ok', json);
            } else {
              console.log('Error==>', json?.message);
            }
          } catch (error) {
            console.warn(error);
            console.log(error);
          }
        })
        .catch(error => {
          console.warn(error);
        });
    } catch (error) {
      console.warn(error);
      console.log(error);;
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'transparent',
      }}>
      {/* {bg?.type == 'lottie' && <LottieBackground file={bg.file} />} */}

      <SafeAreaView
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <LogoHeader />

        <ModalPopupConfirmation
          visible={isDeleteAccountModalVisible }
          title={'Delete Account?'}
          msg={'Are you sure you want to delete your account? This action is permanent and cannot be undone.'}
          okText={'Delete'}
          cancelText={'Cancel'}
          isLoading={isSaveBtnDisable}
          onPressOk={handleDeleteAccout}
          theme={theme}
          onPressClose={() => {
            setDeleteAccountModalVisible(false);
          }}
        />

        <ScrollView
          horizontal={false}
          //style={styles.categoryListContainer}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingBottom: 70,
            //backgroundColor: 'red'
          }}>
          <View style={styles.buttonContainer}>

            <TouchableOpacity
              onPress={() => {
                navi.navigate('pricing-plan', {
                  isGoChooseNda: false,
                });
              }}>
              <InputButtonComponent
                text={'Shushable'}
                rightIcon={theme?.accountIcon?.rightIcon}
                borderColor={theme?.textInput?.borderColor}
                backgroundColor={theme?.textInput?.backgroundColor}
                borderWidth={theme?.textInput?.borderWidth}
                darkShadowColor={theme?.textInput?.darkShadowColor}
                lightShadowColor={theme?.textInput?.lightShadowColor}
                shadowOffset={theme?.textInput?.shadowOffset}
                inputColor={theme?.textInput?.inputColor}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {

                navi.navigate('my_profile');

              }}>
              <InputButtonComponent
                text={'Profile'}
                rightIcon={theme?.accountIcon?.rightIcon}
                borderColor={theme?.textInput?.borderColor}
                backgroundColor={theme?.textInput?.backgroundColor}
                borderWidth={theme?.textInput?.borderWidth}
                darkShadowColor={theme?.textInput?.darkShadowColor}
                lightShadowColor={theme?.textInput?.lightShadowColor}
                shadowOffset={theme?.textInput?.shadowOffset}
                inputColor={theme?.textInput?.inputColor}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setDeleteAccountModalVisible(true);
              }}>
              <InputButtonComponent
                text={'Delete Account'}
                rightIcon={theme?.accountIcon?.rightIcon}
                borderColor={theme?.textInput?.borderColor}
                backgroundColor={theme?.textInput?.backgroundColor}
                borderWidth={theme?.textInput?.borderWidth}
                darkShadowColor={theme?.textInput?.darkShadowColor}
                lightShadowColor={theme?.textInput?.lightShadowColor}
                shadowOffset={theme?.textInput?.shadowOffset}
                inputColor={theme?.textInput?.inputColor}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              disabled={isLoadingLogoutBtn}
            >
              <InputButtonComponent
                text={'Log Out'}
                rightIcon={theme?.accountIcon?.rightIcon}
                borderColor={theme?.textInput?.borderColor}
                backgroundColor={theme?.textInput?.backgroundColor}
                borderWidth={theme?.textInput?.borderWidth}
                darkShadowColor={theme?.textInput?.darkShadowColor}
                lightShadowColor={theme?.textInput?.lightShadowColor}
                shadowOffset={theme?.textInput?.shadowOffset}
                inputColor={theme?.textInput?.inputColor}
                isLoading={isLoadingLogoutBtn}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'column',
    gap: 30,
    //height: 450,
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    // borderWidth: 2,
    //backgroundColor: 'green',
    // borderColor: 'white'
  },
  bgImage: {
    flex: 1,
    // justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontSize: 24,
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: 30,
  },
  container: {
    flex: 1,
    paddingTop: 40,
    //backgroundColor: 'yellow',
  },
  categoryListContainer: {
    paddingHorizontal: 20,
  },
  item: {
    marginStart: 24,
    marginTop: 16,
    marginBottom: 16,
    fontSize: 15,
    fontWeight: '500',
    // color: '#2E476E',
  },
  line: {
    // borderBottomColor: '#c0c0c0',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  flexIt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrowCss: {
    marginRight: 10,
    // marginTop: 16,
    // paddingRight: 50,
  },
  planDiv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 7,
  },
  planInfoText: {
    fontSize: 15,
    // color: '#2E476E',
  },
  logoutInfo: {
    flexDirection: 'row',
  },
  logoutIcon: {
    // marginStart: 24,
    marginTop: 16,
  },
});
