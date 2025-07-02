import messaging from '@react-native-firebase/messaging';
import { useNavigation, StackActions, useRoute } from '@react-navigation/native'; //useTheme,
import React, { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message'
import {
  ActivityIndicator,
  Appearance,
  BackHandler,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiErrorCheck, removeLoginCredential } from '../class/AuthManager.js';

//Class
import API_URL from '../Api.js';
import AsyncStorageManager from '../class/AsyncStorageManager';
import Utils from '../class/Utils.js';
import { get, post } from '../class/ApiManager.js';
import Token from '../class/TokenManager';

// Component imports
import CustomButton from '../components/global/ButtonComponent.js';
import ModalPopupConfirmation from '../components/global/ModalPopupConfirmation';
import ModalPoup from '../components/global/ModalPoupDoubleButtonComponent.js';
import ModalPoupProfileUpdateComponent from '../components/global/ModalPoupProfileUpdateComponent.js';
// SVG import

// Styles
import globalStyle from '../../styles/MainStyle.js';
import { useTheme } from '../../styles/ThemeProvider';

import CONSTANTS from '../Constants.js';
import LogoHeader from '../components/global/LogoHeader.js';
import ModalPopupNewNda from '../components/global/ModalPopupNewNda.js';

const Home = (navigation) => {

  //Modal Visible Flag
  const [profileUpdateModalVisible, setProfileUpdateModalVisible] = useState(false);
  
  const [onlyProfileUpdateModalVisible, setOnlyProfileUpdateModalVisible] = useState(false); //false

  const [isExitVisible, setExitVisible] = useState(false);
  const [isVisibleNewNdaModal, setVisibleNewNdaModal] = useState(false);

  const [pageLoad, setPageLoad] = useState(true);
  const [btnLoad, setBtnLoad] = useState(false);


  const [visibleUpgradeModal, setUpgradeModal] = useState(false);
  const [unreadModalMsg, setUnreadModalMsg] = useState('');
  const [userId, setUserId] = useState(null);
  const [isToastAutoHide, setToastAutoHide] = useState(false);
  //Hooks
  const route = useRoute();
  const navi = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme, bg, unread, setUnread } = useTheme();
  const { height, width, scale, fontScale } = useWindowDimensions();

  //const {is_new_user} = navigation.route.params;
  console.log("navigation.route.params Home================================", route.params)

  useEffect(() => {
    // Your useEffect code
    const colorScheme = Appearance.getColorScheme();
    console.log('System Theme mode: ' + colorScheme);

    profileUpdateCheck();

    //Notification
    notificationConfig()

    //Back button listen
    const backAction = () => {
      console.log(' ----Back pressed');
      const isFocused = navi.isFocused();
      console.log(' --> ' + route.name + ' l:' + isFocused);

      if (isFocused) {
        setExitVisible(true);
      } else {
        navi.goBack();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    //updateUnreadCount(1);
    // const gastureListen = () => {
    //   console.log(' Gesture listen');
    // }

    // const gestureHandler = navi.addListener('beforeRemove', gastureListen);

    // Subscribe
    // const subscribe = NetInfo.addEventListener(state => {
    //   console.log("Connection type", state.type);
    //   console.log("Is connected?", state.isConnected);
    // });

    // Unsubscribe
    //subscribe();


    // remoteConfig()
    // .setDefaults({
    //   current_version: 1.0,
    // })
    // .then(() => {
    //   console.log('Default values set.');
    // });

    return () => {
      backHandler.remove();
      // gestureHandler.remove();
    }

  }, []);

  //Profile Update modal
  const profileUpdateCheck = async () => {
    let user_id = await AsyncStorageManager.getData(CONSTANTS.USER_ID /*'user_id'*/);
    setUserId(user_id);

    setPageLoad(false);

    var profileStatus = await AsyncStorageManager.getData(CONSTANTS.PROFILE_STATUS /*'profile_status'*/);
    console.log('Profile Status from async:  ' + profileStatus);

    var isDialogShowOnce = await Utils.getProfileUpdateShowOnce();
    console.log('Dialog show onece: ' + isDialogShowOnce);

    let checkProfileStats = false;

    if ((profileStatus === null || profileStatus === undefined || profileStatus === '' || profileStatus === 'not_completed') && !isDialogShowOnce) {
      Utils.setProfileUpdateShowOnce(true);
      //setProfileUpdateModalVisible(true);
      getProfileInfo(false);
      checkProfileStats = true;
      console.log('Profile not completed');
    } else if (profileStatus === 'not_completed') {
      
      //setProfileUpdateModalVisible(true);
      setPageLoad(false);
      console.log('Profile completed');
    } else {
      setPageLoad(false);
    }

    //Check unread count
    getProfileInfo(checkProfileStats);
  };

  const getProfileInfo = async (isCheckProfileUpdate) => {
    var profileApi_ = API_URL.PROFILE_;
    get(profileApi_)
      .then(async (data) => {

        try {
          console.log("-Profile-" + JSON.stringify(data))
          var a = JSON.stringify(data);
          var json = JSON.parse(a);

          var profileInfo = json.data;

          const profileStatus = profileInfo.profile_status;
          const unreadCount = profileInfo.unread_notifications_count

          console.log('profile status==>' + profileStatus + ' unread: ' + unreadCount);

          ///Save Profile info for local use
          const formattedAddress =
            profileInfo?.address && profileInfo?.country_code
              ? profileInfo?.city +
              ', ' +
              profileInfo?.state_id +
              ', ' +
              profileInfo?.postal_code +
              ', ' +
              profileInfo?.country_code
              : '';


          console.log('Profile: ' + JSON.stringify(profileInfo));

          await AsyncStorageManager.storeData(CONSTANTS.PROFILE.NAME, profileInfo.full_name ? profileInfo.full_name : '');
          await AsyncStorageManager.storeData(CONSTANTS.PROFILE.EMAIL, profileInfo.email ? profileInfo.email : '');
          await AsyncStorageManager.storeData(CONSTANTS.PROFILE.PHONE, profileInfo.phone_number ? profileInfo.phone_number : '');

          await AsyncStorageManager.storeData(CONSTANTS.PROFILE.SEARCH_ADDRESS, profileInfo.address ? profileInfo.address : '');
          await AsyncStorageManager.storeData(CONSTANTS.PROFILE.FORMATED_ADDRESS, formattedAddress ? formattedAddress : '');
          await AsyncStorageManager.storeData(CONSTANTS.PROFILE.AVATER, profileInfo?.avatar ? API_URL.IMAGE_URL + profileInfo?.avatar : '');

          await AsyncStorageManager.storeData(CONSTANTS.PROFILE.CITY, profileInfo?.city ? profileInfo?.city : '');
          await AsyncStorageManager.storeData(CONSTANTS.PROFILE.STATE_ID, profileInfo?.state_id ? profileInfo?.state_id : '');
          await AsyncStorageManager.storeData(CONSTANTS.PROFILE.POSTAL_CODE, profileInfo?.postal_code ? profileInfo?.postal_code : '');
          await AsyncStorageManager.storeData(CONSTANTS.PROFILE.COUNTRY_CODE, profileInfo?.country_code ? profileInfo?.country_code : '');
          ///Save Profile info for local use end

          if (isCheckProfileUpdate) {
            AsyncStorageManager.storeData(
              CONSTANTS.PROFILE_STATUS,
              profileStatus + '',
            );

            if (profileStatus === 'not_completed') {

              if (unreadCount > 0) {
                setVisibleNewNdaModal(true)
              } else {
                Utils.setProfileUpdateShowOnce(true);
                //setProfileUpdateModalVisible(true);
                setOnlyProfileUpdateModalVisible(true)
              }
              return;
            } else {
              Utils.setProfileUpdateShowOnce(true);
              
              //setProfileUpdateModalVisible(false);
            }
          }

          if (unreadCount < 1) {
            setUnread(0);
          } else {
            setUnread(unreadCount);
          }
        } catch (error) {
          console.log("Error got: " + error);
        }
      })
      .catch(error => {
        console.log("Error got: " + error)

        apiErrorCheck(error, navi)

      }
      );
  };

  //Notification Manager Code Start
  const notificationConfig = async () => {
    let isRemoteTokenRegistered = messaging().isDeviceRegisteredForRemoteMessages
    console.log("is device register for remote token: " + isRemoteTokenRegistered);
    requestUserPermission();
  }

  const requestUserPermission = async () => {
    try {
      await messaging().requestPermission();
      let deviceToken = await messaging().getToken();
      console.log('Device Token:', deviceToken);

      updateDeviceToken(deviceToken)
    } catch (error) {
      console.log('Home Permission or Token retrieval error:', error);
    }
  };

  //API Calls
  const getSubscriptionInfo = async () => {
    setBtnLoad(true);

    //Profile Updated Check
    let token = await Token.getToken();
    var profileStatus = await AsyncStorageManager.getData(CONSTANTS.PROFILE_STATUS);
    if (profileStatus === 'not_completed') {
      Utils.setProfileUpdateShowOnce(true);

      //setProfileUpdateModalVisible(true);
      setOnlyProfileUpdateModalVisible(true)
      setBtnLoad(false);
      return;
    }

    //NDA Create

    let isSubscriptionCheck = false;
    if (isSubscriptionCheck) {
      //Net connection check
      let isConected = await Utils.isNetConnected()
      console.log("Is net connected: " + isConected);
      if (!isConected) {
        Utils.netConnectionFaild();
        setBtnLoad(false);
        return
      }

      var api = API_URL.MY_SUBSCRIPTION;
      await fetch(api, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
        },
      }).then(response => response.json())
        .then(responseJson => {
          try {
            var a = JSON.stringify(responseJson);
            var json = JSON.parse(a);

            if (responseJson.status === 200) {
              var info = json.data;
              setBtnLoad(false);

              console.log('Status ==> ok ==> getSubscriptionInfo');
              if (info?.nda_limit > 0) {
                navi.navigate('create_nda_receiver_info', {
                  data: null,
                  isEdit: true,
                });
              } else {
                navi.navigate('pricing-plan-home', {
                  isGoChooseNda: true,
                });
              }
            } else {
              console.log('Error: ' + JSON.stringify(json));
              setBtnLoad(false);
              if (json.message == 'You never subscribed here.') {
                navi.navigate('pricing-plan-home', {
                  isGoChooseNda: true,
                });
              }
            }
          } catch (error) {
            //console.warn(error);
            console.log(error);
            setBtnLoad(false);

            //Net response faild 
            Utils.netConnectionFaild();
          }
        })
        .catch(error => {
          console.warn(error);
          setBtnLoad(false);
          //Net response faild 
          Utils.netConnectionFaild();
        });
    } else {
      navi.navigate('create_nda_receiver_info', {
        data: null,
        isEdit: true,
      });
      //Subscription Check
      setBtnLoad(false);
    }
  };

  const updateDeviceToken = async (deviceToken_) => {

    if (deviceToken_ === undefined || deviceToken_ === '' || deviceToken_ === null) {
      console.log("Device token empty: " + deviceToken_);
      return
    }

    let isDeviceTokenUploaded = await AsyncStorageManager.getData(CONSTANTS.IS_DEVICE_TOKEN_UPLOAD);
    console.log("Device token async: " + isDeviceTokenUploaded);

    if (isDeviceTokenUploaded === deviceToken_) {
      console.log("Same Device token already uploaded and return ")
      return;
    }

    let userToken = await Token.getToken();
    const api = API_URL.UPDATE_DEVICE_TOKEN
    console.log('Update device token api: ' + api)

    console.log('Device Token: ' + deviceToken_)
    var bodyData = JSON.stringify({
      device_token: deviceToken_, //Device token
    })

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setIsLoading(false)
      return
    }

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
      const json = await response.json();
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
      console.log('Cannot Login with previous biometric data')

      Utils.netConnectionFaild();
    }
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}>
      <LogoHeader />
      {pageLoad ? (
        <ActivityIndicator
          color={
            theme?.name != 'Light'
              ? theme?.colors?.text
              : globalStyle.colorAccent
          }
          style={{
            // marginTop: 'auto',
            // marginBottom: 'auto',
            //height: 540,
            height: height < 500 ? height * 0.5 : height * 0.6,
          }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingBottom: 70,
          }}>
          <View style={styles.page}>
            <ModalPoup
              visible={profileUpdateModalVisible}
              theme={theme}
              type={'ndaDescription'}
              title={'Setup your Profile'}
              // msg={'Save your details Information & Signature for using later.'}
              source={require('../../assets/profile_anim.json')}
              onPressOk={() => {
                setProfileUpdateModalVisible(false);
                navi.navigate('my_profile_home', {
                  from: 'home',
                });
              }}
              onPressClose={() => setProfileUpdateModalVisible(false)}
            />
            <ModalPoupProfileUpdateComponent
              visible={onlyProfileUpdateModalVisible}
              theme={theme}
              title={'Setup your Profile'}
              // msg={'Save your details Information & Signature for using later.'}
              source={require('../../assets/profile_anim.json')}
              onPressOk={() => {
                
                setOnlyProfileUpdateModalVisible(false)
                navi.navigate('my_profile_home', {
                  from: 'home',
                });
              }}
              onPressClose={() => setOnlyProfileUpdateModalVisible(false)}
            />

            <ModalPopupConfirmation
              visible={isExitVisible}
              title={'Confirm Exit'}
              msg={'Are you sure you want to close the app?'}
              okText={'Exit'}
              cancelText={'Cancel'}
              //isLoading={btnLoad}
              onPressOk={async () => {
                setExitVisible(false);
                
                await removeLoginCredential(navi, false)

                // Utils.setProfileUpdateShowOnce(false);
                // await Token.clearToken();
                // await AsyncStorageManager.removeAllItemValue();
                
                BackHandler.exitApp();
              }}
              theme={theme}
              onPressClose={() => {
                setExitVisible(false);
              }}
            />

            <ModalPopupNewNda
              visible={isVisibleNewNdaModal}
              title={' '}
              msg={'You have a pending NDA.'}
              okText={'Shush It'}
              cancelText={''}
              //isLoading={btnLoad}
              onPressOk={() => {
                navi.navigate('tab_inbox', { screen: 'inbox' });
                setVisibleNewNdaModal(false)
              }}
              theme={theme}
              onPressClose={() => {
                setVisibleNewNdaModal(false);
              }}
            />

            <View style={styles.content}>

              <View style={styles.buttonContainer}>
                <CustomButton
                  title={'SHUSH IT'} //btnLoad ? <ActivityIndicator color={theme?.colors?.text} /> :
                  isLoading={btnLoad}
                  color={theme?.colors?.btnText}
                  colors={theme?.colors?.colors}
                  bordered={true}
                  borderWidth={theme?.name == 'Light' ? 0 : 3}
                  borderColor={theme?.colors?.borderColor}
                  borderColors={theme?.colors?.borderColors}
                  shadow={theme?.name == 'Light'}
                  disabled={btnLoad}
                  onPress={async () => {
                    getSubscriptionInfo();

                    // await analytics().logEvent('select_item', {
                    //   item_id: 'a-1234',
                    // })
                  }}
                />
              </View>

              <View style={{ ...styles.buttonContainer }}>
                <CustomButton
                  title={'SHUSHING'}
                  color={theme?.colors?.btnText}
                  colors={theme?.colors?.colors}
                  bordered={true}
                  borderWidth={theme?.name == 'Light' ? 0 : 3}
                  borderColors={theme?.colors?.borderColors}
                  borderColor={theme?.colors?.borderColor}
                  shadow={theme?.name == 'Light'}
                  disabled={btnLoad}
                  onPress={async () => {

                    // //setTimeout(() => Toast.hide() , 2000);
                    // Toast.show({

                    //   type: 'warning',
                    //   text1: 'Signature required',
                    //   text2: 'Please sign in the designated area below',
                    //   autoHide: true,
                    //   //visibilityTime: 2000,
                    //   onPress: () => {
                    //     //closeToast();
                    //     console.log('Notification onPress  ');
                    //   },
                    //   onHide: () => {
                    //     console.log('Notification onHide  ');

                    //   }
                    // });


                    var profileStatus = await AsyncStorageManager.getData(CONSTANTS.PROFILE_STATUS);
                    if (profileStatus === 'not_completed') {
                      Utils.setProfileUpdateShowOnce(true);

                      //setProfileUpdateModalVisible(true)
                      
                      setOnlyProfileUpdateModalVisible(true)
                      setBtnLoad(false);
                      return;
                    }

                    navi.navigate('document_list', {
                      header: 'Shushing',
                    });
                  }}
                />
              </View>

              <View style={styles.buttonContainer}>
                <CustomButton
                  title={'SHUSHED'}
                  color={theme?.colors?.btnText}
                  colors={theme?.colors?.colors}
                  bordered={true}
                  borderWidth={theme?.name == 'Light' ? 0 : 3}
                  borderColor={theme?.colors?.borderColor}
                  borderColors={theme?.colors?.borderColors}
                  shadow={theme?.name == 'Light'}
                  disabled={btnLoad}
                  onPress={() => {
                    navi.navigate('document_list', {
                      tabSelected: 1,
                      header: 'Shushed',
                    });
                    // navi.navigate('document_list', {
                    //   tabSelected: 1,
                    // });
                  }}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //paddingTop: globalStyle.topPadding,
    //backgroundColor: globalStyle.statusBarColor,
  },
  page: {
    flex: 1,
    paddingBottom: 0,
    justifyContent: 'center',
    alignContent: 'center',
    // backgroundColor: 'green'
  },
  title: {
    fontSize: 24,
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: 50,
  },
  bgImage: {
    flex: 1,
    // justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    paddingBottom: 32,
    width: '100%',
  },
  plusButtonContainer: {
    alignSelf: 'center',
    paddingTop: 50,
    // paddingTop: 100,
  },
});

export default Home;
