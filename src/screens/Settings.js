import { React, useEffect, useState, useRef } from 'react'
import {
  Dimensions,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native'
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { apiErrorCheck, removeLoginCredential } from '../class/AuthManager.js';
import AsyncStorageManager from '../../src/class/AsyncStorageManager.js'
//Component
import ModalPopupForBiometricEnable from '../components/global/ModalPopupForBioLoginEnable.js'
//Class
import Token from '../class/TokenManager.js'
//Constant
//SVG
//Styles
import { Switch } from 'react-native-switch';
import { useTheme } from '../../styles/ThemeProvider'
import Utils from '../class/Utils.js'
import CONSTANTS from '../Constants.js'
import LogoHeader from '../components/global/LogoHeader.js'

import { StackActions, useNavigation } from '@react-navigation/native'

import globalStyle from '../../styles/MainStyle.js'
import Url from '../Api.js'
import ModalPopupForPassReset from '../components/global/ModalPopupForPassReset'
import ModalPoup from '../components/global/ModalPoupComponent'
import CustomSwitch from '../components/global/CustomSwitch.js'
import { BlurView } from "@react-native-community/blur";

export default function Settings() {
  const [isBioRequired, setBioRequired] = useState(false)
  const [isBiometricSupported, setBiometricSupport] = useState(false)

  const [isBioLoginEnabled, setBioLoginEnabled] = useState(false)
  const [bioEnableDialogVisible, setBioEnableDialogVisible] = useState(false)
  const [bioDialogMsg, setBioDialogMsg] = useState('')

  //User Settings Use effects
  const navi = useNavigation()
  const insets = useSafeAreaInsets()
  const [resetPassLoading, setResetPassLoading] = useState(false);

  // console.log(MyTheme.colors.borderColors)

  const [options, setOptions] = useState([
    {
      label: 'mm/dd/yyyy',
      value: 'mm/dd/yyyy',
    },
    {
      label: 'dd/mm/yyyy',
      value: 'dd/mm/yyyy',
    },
  ])
  const [timeOptions, setTimeOptions] = useState([
    {
      label: '12-hour',
      value: '12-hour',
    },
    {
      label: '24-hour',
      value: '24-hour',
    },
  ])

  const [isAuto, setIsAuto] = useState(false)
  const [sendReminder, setSendReminder] = useState(false)
  const [isSaveBtnDisable, setIsSaveBtnDisable] = useState(false)
  const [isPassReset, setIsPassReset] = useState(false)

  const [statusModalVisible, setStatusModalVisible] = useState(false) //false
  const [msg, setMsg] = useState('')

  //New Code for Switch ...
  const [disableCustomSwitch, setDisableCustomSwitch] = useState(true)

  const updateStatus = async (isShow, msg) => {
    setStatusModalVisible(isShow)
    setMsg(msg)
    //setIsBioRequired(previousState => !previousState);
  }

  const [isOtpRequired, setIsOtpRequired] = useState(false)
  const [showResetPassModal, setShowResetPassModal] = useState(false)

  //Password Reset Option
  const [isPassResetBioEnableDialogVisible, setPassResetBioEnableDialogVisible] = useState(true)
  const toggleSwitchOtp = (isOn) => {
    setIsOtpRequired(isOn)
  }

  const [isLoading, setIsLoading] = useState(false)
  const [themeChanging, setThemeChanging] = useState(false)
  const [dateFormat, setDateFormat] = useState(null)
  const [timeFormat, setTimeFormat] = useState(null)
  const [token, setToken] = useState('')

  //User Settings use effects end

  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  })

  //Theme
  const { theme, setScheme, bg } = useTheme()

  useEffect(() => {
    getIsBiometricLocked()

    const asyncFunc = async () => {
      let userToken = await Token.getToken()
      console.log('======> Here in the setting screen <======')
      if (userToken) {
        setToken(userToken)
        getSignInMethod()
        getSettings(userToken) // Hidden for theme check

        setIsLoading(false)
      } else {
        console.log('Token not found')

        return false
      }
    }

    asyncFunc()
  }, [])

  useEffect(() => {

  }, [showResetPassModal, statusModalVisible])

  useEffect(() => {
  }, [isOtpRequired, isBioLoginEnabled])

  async function getSignInMethod() {
    var signInMethod = await AsyncStorageManager.getData(CONSTANTS.SIGN_IN_METHOD /*'sign_in_method'*/)

    console.log('Sign In method: ', signInMethod)

    if (
      signInMethod === CONSTANTS.SIGN_IN_WITH_FACEBOOK /*'facebook'*/ ||
      signInMethod === CONSTANTS.SING_IN_WITH_GOOGLE /*'google' */ ||
      signInMethod === CONSTANTS.SING_IN_WITH_APPLE /*'apple' */
    ) {
      setPassResetBioEnableDialogVisible(false)
    } else {
      setPassResetBioEnableDialogVisible(true)
    }
  }

  const getSettings = async token => {
    setIsLoading(true)

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setIsLoading(false)
      return
    }

    let api = Url.GET_SETTING
    await fetch(api, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
      },
    })
      .then(response => response.json())
      .then(async responseJson => {
        try {
          let a = JSON.stringify(responseJson)
          let json = JSON.parse(a)
          if (responseJson.status === 200) {
            let settings = json.data
            // setIsLoading(false)

            setSendReminder(settings?.auto_remainder == 0 ? false : true)

            setIsOtpRequired(settings?.otp_verification == 0 ? false : true)
            //toggleSwitchOtp(true)
            //setIsOtpRequired(true)

            // handlerToggle(settings?.otp_verification == 0 ? false : true)

            console.log("Settings Api : " + JSON.stringify(responseJson));

            console.log('otp_verification ==>', settings?.otp_verification)

            setDateFormat(settings?.date_format)
            setTimeFormat(settings?.time_format)

            console.log('date_format==>', settings?.date_format)
            console.log('time_format==>', settings?.time_format)
          } else {
            console.log('get settings list error: ' + JSON.stringify(json))
            setIsLoading(false)
          }
        } catch (error) {
          console.warn(error)
          console.log(error)
          setIsLoading(false)
        }
      })
      .catch(error => {
        console.warn(error)
        setIsLoading(false)

        Utils.netConnectionFaild();
      })
  }

  const saveSettings = async (
    auto_remainder = sendReminder,
    date_format = dateFormat,
    otp_verification = isOtpRequired,
    time_format = timeFormat,
  ) => {
    // setBtnLoad(true);

    const payload = {
      auto_remainder: auto_remainder ? 1 : 0,
      otp_verification: otp_verification ? 1 : 0,
      // date_format: date_format,
      // current_theme: current_theme == 0 ? 'Light' : current_theme == 1 ? 'Silver' : current_theme == 2 ? 'RoseGold' : current_theme == 3 ? 'Gold' : current_theme == 4 ? 'Elegant' : 'Silver',
      // time_format: time_format,
    }
    console.log("payload", payload)

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      toggleSwitchOtp(!otp_verification)
      return
    }

    try {
      var saveSettingsApi = Url.SAVE_SETTING
      await fetch(saveSettingsApi, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
        },
        body: JSON.stringify(payload),
      })
        .then(response => response.json())
        .then(responseJson => {
          try {
            var a = JSON.stringify(responseJson)
            var json = JSON.parse(a)
            if (responseJson.status === 200) {

              // setBtnLoad(false)
              // AsyncStorageManager.storeData('date_format', date_format)
              // AsyncStorageManager.storeData('time_format', time_format)


              //toggleSwitchOtp(otp_verification)
              setIsOtpRequired(otp_verification)
              console.log('Status==> ok')
              console.log('Otp require successfully updated Status==> ok')

            } else {
              console.log('Error==>', JSON.stringify(json))
              // setBtnLoad(false);
            }
          } catch (error) {
            console.warn(error)
            console.log(error)
            // setBtnLoad(false)
          }
        })
        .catch(error => {
          console.warn(error)
          // setBtnLoad(false)
          toggleSwitchOtp(!otp_verification)
          Utils.netConnectionFaild();

        })
    } catch (error) {
      console.warn(error)
      console.log(error)
      // setBtnLoad(false)

      Utils.netConnectionFaild();
    }
  }

  async function getIsBiometricLocked() {
    var isBioReq = await AsyncStorageManager.getData(CONSTANTS.IS_BIO_REQUIRED /*'is_bio_required'*/)
    var isBioLoginEnabledStr = await AsyncStorageManager.getData(CONSTANTS.IS_BIO_EANBLED /*'is_bio_login_enabled'*/)

    let userEmail = await AsyncStorageManager.getData(CONSTANTS.USER_EMAIL /*'user_email'*/);
    let bioEnabledEmail = await AsyncStorageManager.getData(CONSTANTS.BIO_ENABLED_EMAIL /*'user_email'*/);

    console.log("UserEmail-: " + userEmail + " BioEmail: " + bioEnabledEmail)

    console.log('Previous settings: ' + isBioReq)
    var isBioBool = isBioReq === 'YES' ? true : false
    console.log('Previous settings: ' + isBioBool)

    setBioRequired(isBioBool)
    getBiometric()


    console.log('Previous settings bioLogin: ' + isBioLoginEnabledStr)
    var isBioLoginEnabledBool = isBioLoginEnabledStr === 'YES' ? true : false
    console.log('Previous settings bioLogin: ' + isBioLoginEnabledBool)

    //setBioLoginEnabled(isBioLoginEnabledBool)

    if (userEmail === bioEnabledEmail) {
      setBioLoginEnabled(isBioLoginEnabledBool)
    } else {
      setBioLoginEnabled(false)
    }
  }

  const getBiometric = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
    if (rnBiometrics === null) {
      return
    }

    const { available, biometryType } = await rnBiometrics.isSensorAvailable()

    console.log('Biometric type: ' + biometryType)
    if (available && biometryType === BiometryTypes.TouchID) {
      //ios only
      console.log('TouchID is supported')
      // rnBiometrics.createKeys().then(resultObject => {
      //   const {publicKey} = resultObject;
      //   console.log('Public key: ' + publicKey);
      //   //sendPublicKeyToServer(publicKey);
      // });
      setBiometricSupport(true)
    } else if (available && biometryType === BiometryTypes.FaceID) {
      //ios only
      console.log('FaceID is supported')
      setBiometricSupport(true)
    } else if (available && biometryType === BiometryTypes.Biometrics) {
      //Android only
      console.log('Biometrics is supported')
      setBiometricSupport(true)
    } else {
      console.log('Biometrics not supported')
      setBiometricSupport(false)
    }
  }

  const getVerifyBiometric = async (isBiometricEnable, type) => {
    Utils.setAutoLockPause(true);
    if (isBiometricSupported) {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirmation',
      })

      if (success) {
        console.log('Touch id success: ' + isBiometricEnable)

        console.log('Biometric sign in enabled')


        /** Biometric Login */
        let userToken = await Token.getToken()
        if (userToken) {
          //getEventData(userToken);
        } else {
          // Handle the case where the token doesn't exist
          console.log('Token not found')
          return
        }

        await AsyncStorageManager.storeData(CONSTANTS.USER_TOKEN, userToken + '')
        const bioLoginEnable = isBiometricEnable ? 'YES' : 'NO'
        await AsyncStorageManager.storeData(CONSTANTS.IS_BIO_EANBLED, bioLoginEnable)

        let userEmail = await AsyncStorageManager.getData(CONSTANTS.USER_EMAIL /*'user_email'*/);

        if (isBiometricEnable) {
          await AsyncStorageManager.storeData(CONSTANTS.BIO_ENABLED_EMAIL, userEmail)
        } else {
          await AsyncStorageManager.storeData(CONSTANTS.BIO_ENABLED_EMAIL, "Empty")
        }
        console.log('ok==>');
        //UI Change

        setBioLoginEnabled(isBiometricEnable);

        const msg = isBiometricEnable
          ? 'Biometric enabled'
          : 'Biometric disabled'
        //showToast('success', msg, msg + 'successfully');
        // console.log('token' + token);
        setBioEnableDialogVisible(true)
        setBioDialogMsg(msg + ' successfully')

      } else {
        console.log('Biometric verification faild:');
        setBioLoginEnabled(!isBiometricEnable);
        //toggleSwitchBioLogin(!isBiometricEnable)

        Utils.setAutoLockPause(false);
      }
    } else {
      console.log('Biometric is not supported on this device')
      //Utils.showAlertDialog('Biometric is not supported on this device')


      setBioLoginEnabled(false);

      setBioEnableDialogVisible(true)
      setBioDialogMsg('Biometric is not supported on this device')
      //setBioRequired(false)
    }
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: 'transparent',
    }}>
      <ModalPopupForBiometricEnable
        theme={theme}
        visible={bioEnableDialogVisible}
        title={'Biometric Login'}
        msg={bioDialogMsg} //{'Save your details Information & Signature for using later.'}
        source={require('../../assets/resetPass.json')}
        onPressClose={() => {
          setBioEnableDialogVisible(false)
          // setIsSaveBtnDisable(false)
          if (isBiometricSupported) {
            setBioLoginEnabled(!isBioLoginEnabled);
          } else {
            setBioLoginEnabled(false);
          }
        }}
        onSave={() => {
          setBioEnableDialogVisible(false)

          if (isBiometricSupported) {
            setBioLoginEnabled(isBioLoginEnabled);
          } else {
            setBioLoginEnabled(false);
          }
          console.log('onSave')
        }}
      />

      <ModalPopupForPassReset
        isLoading={resetPassLoading}
        theme={theme}
        visible={showResetPassModal}
        title={'Password Reset'}
        source={require('../../assets/resetPass.json')}
        onPressClose={() => {
          // console.log('pressing_cancel')
          setShowResetPassModal(false)
        }}
        onResetSuccess={async () => {

          console.log("OnReset Success got")

          await Token.clearToken()
          await AsyncStorageManager.removeAllItemValue();
          if (Platform.OS === 'android') {

            removeLoginCredential(navi, true)
            navi.dispatch(StackActions.replace('sign_in'));
          } else if (Platform.OS === 'ios') {

            removeLoginCredential(navi, true)
            //Need to fix that
            navi.navigate('sign_in');
          }
          setShowResetPassModal(false);
        }}
        //onSave={async formData => onResetPass(formData)}
        saveBtnDisable={isSaveBtnDisable}
      />

      {/* Success / Error modal*/}
      <ModalPoup
        theme={theme}
        visible={statusModalVisible}
        title={msg}
        source={require('../../assets/sign_in_animation.json')}
        btnTxt={'Ok'}
        onPressOk={async () => {
          setStatusModalVisible(false)
        }}
        onPressClose={async () => {
          setStatusModalVisible(false)
        }}
      />
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

        <ScrollView
          horizontal={false}
          //style={styles.categoryListContainer}
          contentContainerStyle={{
            flexGrow: 1,

            justifyContent: 'center',
            //marginBottom: 70,
            paddingBottom: 70,
            paddingHorizontal: 20,
            //backgroundColor: 'red'
          }}
          showsHorizontalScrollIndicator={true}>
          <View style={styles.buttonContainer}>
            {isLoading ? (
              // <ActivityIndicator color={globalStyle.colorAccent} />
              <ActivityIndicator
                color={
                  theme?.name != 'Light'
                    ? theme?.colors?.text
                    : globalStyle.colorAccent
                }
              />
            ) : (

              <View style={{ justifyContent: 'center', alignContent: 'center' }}>
                <View
                  style={{
                    ...styles.containerDiv,
                    backgroundColor:
                      theme?.name == 'Light'
                        ? 'white'
                        : 'rgba(255, 255, 255, 0.35)',
                    overflow: 'hidden',
                  }}>
                  <BlurView
                    style={styles.absolute}
                    blurType="thinMaterialDark"
                    blurAmount={Platform.OS === 'ios' ? 15 : 5}
                    reducedTransparencyFallbackColor="white"
                  />

                  <View style={styles.rowContent}>
                    <Text

                      minimumFontScale={0.5}
                      adjustsFontSizeToFit={true}
                      numberOfLines={1}

                      style={{
                        ...styles.item,
                        color: theme?.colors?.text,

                        fontFamily: theme?.font.body.fontFamily,
                        fontWeight: theme?.font.body.fontWeight,
                        fontSize: theme?.font.fontSize.m
                      }}>
                      Enable Biometric Login
                    </Text>
                  </View>

                  <CustomSwitch
                    value={isBioLoginEnabled}
                    onValueChange={() => {
                      console.log('Biometric Login is enabled: ' + isBioLoginEnabled)
                      let bioBtton = !isBioLoginEnabled
                      getVerifyBiometric(bioBtton, 'bio_login')
                      setBioLoginEnabled(!isBioLoginEnabled)
                    }}
                  />
                </View>

                {false && <View
                  style={{
                    ...styles.containerDiv,
                    backgroundColor:
                      theme?.name == 'Light'
                        ? 'white'
                        : 'rgba(255, 255, 255, 0.35)',
                    overflow: 'hidden',
                  }}>
                  <BlurView
                    style={styles.absolute}
                    blurType="thinMaterialDark"
                    blurAmount={Platform.OS === 'ios' ? 15 : 5}
                    reducedTransparencyFallbackColor="white"
                  />
                  <View style={styles.rowContent}>
                    <Text
                      minimumFontScale={0.5}
                      adjustsFontSizeToFit={true}
                      numberOfLines={1}

                      style={{
                        ...styles.item,
                        color: theme?.colors?.text,

                        fontFamily: theme?.font.body.fontFamily,
                        fontWeight: theme?.font.body.fontWeight,
                        fontSize: theme?.font.fontSize.m
                      }}>
                      Required OTP Verification
                    </Text>
                  </View>
                  {/* <Switch
                  thumbColor={theme?.colors?.switch}
                  trackColor={{false: '#2D2D2D', true: '#767577'}}
                  ios_backgroundColor="#2D2D2D"
                  // onValueChange={toggleSwitchOtp}
                  onValueChange={value => {
                    setIsOtpRequired(value)
                    saveSettings(sendReminder, dateFormat, value)
                  }}
                  value={isOtpRequired}
                /> */}
                  <CustomSwitch
                    value={isOtpRequired}
                    onValueChange={() => {
                      // setIsOtpRequired(!isOtpRequired)
                      const otpRequireTmp = !isOtpRequired;
                      saveSettings(sendReminder, dateFormat, otpRequireTmp)
                      setIsOtpRequired(!isOtpRequired)
                    }}
                  />
                </View>}

                {isPassResetBioEnableDialogVisible ? (
                  <View
                    style={{
                      ...styles.containerDiv,
                      backgroundColor:
                        theme?.name == 'Light'
                          ? 'white'
                          : 'rgba(255, 255, 255, 0.35)',
                      overflow: 'hidden',
                    }}>
                    <BlurView
                      style={styles.absolute}
                      blurType="thinMaterialDark"
                      blurAmount={Platform.OS === 'ios' ? 15 : 5}
                      reducedTransparencyFallbackColor="white"
                    />
                    <View style={styles.rowContent}>
                      <Text
                        minimumFontScale={0.5}
                        adjustsFontSizeToFit={true}
                        numberOfLines={1}

                        style={{
                          ...styles.item,
                          color: theme?.colors?.text,

                          fontFamily: theme?.font.body.fontFamily,
                          fontWeight: theme?.font.body.fontWeight,
                          fontSize: theme?.font.fontSize.m
                        }}>
                        Password Reset
                      </Text>
                    </View>
                    {/* <Switch
                    thumbColor={theme?.colors?.switch}
                    trackColor={{false: '#2D2D2D', true: '#767577'}}
                    ios_backgroundColor="#2D2D2D"
                    value={showResetPassModal}
                    onValueChange={value => {
                      setShowResetPassModal(value)
                    }}
                  /> */}
                    <CustomSwitch
                      value={false}
                      // value={passReset}
                      onValueChange={() => {
                        setShowResetPassModal(true)
                      }}
                      disable={disableCustomSwitch}
                      toggleSW={showResetPassModal}
                    />
                  </View>
                ) : null}

                <TouchableOpacity
                  style={{
                    ...styles.containerDiv,
                    backgroundColor:
                      theme?.name == 'Light'
                        ? 'white'
                        : 'rgba(255, 255, 255, 0.35)',
                    overflow: 'hidden',
                  }}
                  onPress={() => {
                    navi.navigate('select_theme')
                  }}>
                  <BlurView
                    style={styles.absolute}
                    blurType="thinMaterialDark"
                    blurAmount={Platform.OS === 'ios' ? 15 : 5}
                    reducedTransparencyFallbackColor="white"
                  />
                  <View style={styles.rowContent}>
                    <Text

                      minimumFontScale={0.5}
                      adjustsFontSizeToFit={true}
                      numberOfLines={1}

                      style={{
                        ...styles.item,
                        color: theme?.colors?.text,

                        fontFamily: theme?.font.body.fontFamily,
                        fontWeight: theme?.font.body.fontWeight,
                        fontSize: theme?.font.fontSize.m
                      }}>
                      Themes
                    </Text>
                  </View>
                  {theme?.accountIcon?.rightIcon}
                </TouchableOpacity>
                {/* Controll background */}
                <View>
                  {!CONSTANTS.IS_BACKGROUND_HIDE ? (
                    <TouchableOpacity
                      style={{
                        ...styles.containerDiv,
                        backgroundColor:
                          theme?.name == 'Light'
                            ? 'white'
                            : 'rgba(255, 255, 255, 0.35)',
                        overflow: 'hidden',
                      }}
                      onPress={() => {
                        navi.navigate('select_background')
                      }}>
                      <BlurView
                        style={styles.absolute}
                        blurType="thinMaterialDark"
                        blurAmount={Platform.OS === 'ios' ? 15 : 5}
                        reducedTransparencyFallbackColor="white"
                      />
                      <View style={styles.rowContent}>
                        <Text
                          minimumFontScale={0.5}
                          adjustsFontSizeToFit={true}
                          numberOfLines={1}

                          style={{
                            ...styles.item,
                            color: theme?.colors?.text,

                            fontFamily: theme?.font.body.fontFamily,
                            fontWeight: theme?.font.body.fontWeight,
                            fontSize: theme?.font.fontSize.m
                          }}>
                          Background
                        </Text>
                      </View>
                      {theme?.accountIcon?.rightIcon}
                    </TouchableOpacity>
                  ) : null}
                </View>

              </View>

            )}
          </View>
        </ScrollView>
      </SafeAreaView >

    </View>
  )
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    justifyContent: 'center',
  },
  top: {
    flex: 1,
    //paddingTop: globalStyle.topPadding,
    //backgroundColor: globalStyle.statusBarColor,
  },
  container: { paddingBottom: 0, marginBottom: 0 },
  page: {
    marginBottom: 70,
    paddingBottom: 100,
    // backgroundColor: globalStyle.backgroundColor,
  },

  absolute: {
    width: 'auto',
    height: 'auto',
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    marginBottom: 0,
  },
  autoDiv: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTheme: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: 20,
    // marginVertical: 50,
    columnGap: 15,
    // gap: 25,
    rowGap: 35,
  },
  modeText: {
    alignSelf: 'center',
    fontWeight: 500,
    marginVertical: 10,
    width: 85,
    height: 35,
    textAlign: 'center',
  },
  circleOutside: {
    alignSelf: 'center',
    borderRadius: 50,
    borderWidth: 1,
    height: 25,
    width: 25,
    padding: 1.5,
  },
  circleInside: {
    height: 20,
    width: 20,
    borderRadius: 50,
  },
  container: {
    flex: 1,
    paddingTop: 40,
    //backgroundColor: 'yellow',
  },
  categoryListContainer: {
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    // alignItems: 'center',
    // marginTop: 'auto',
    // marginBottom: 'auto',
    //backgroundColor: 'green',
  },
  containerDiv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    height: 65,
    padding: 15,
    marginVertical: 10,
  },
  content: {
    paddingHorizontal: 27,
    paddingTop: 0,
    paddingBottom: 0,
    alignContent: 'center',
    justifyContent: 'center',
    //backgroundColor: 'red',
  },
  backgroundVideo: {
    //position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%' //DIM.height,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    marginStart: 15,
    fontSize: 15,
    color: '#2E476E',
  },
  line: {
    borderBottomColor: '#c0c0c0',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectComponent: {
    // height: 20,
    // marginTop: 12,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  title: {
    fontSize: 24,
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: 30,
  },
})
