import {
  React,
  useEffect,
  createContext,
  useMemo,
  useReducer,
  useState,
  useRef,
  createRef,
} from 'react'
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics'
//SVG
import {
  useIsFocused,
  useNavigation,
  useRoute,
  StackActions,
} from '@react-navigation/native'
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  BackHandler,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions
} from 'react-native'
import LottieView from 'lottie-react-native'
import { Neomorph } from 'react-native-neomorph-shadows'
import messaging from '@react-native-firebase/messaging'
import {
  GoogleSignin,
} from '@react-native-google-signin/google-signin'
import {
  appleAuth,
} from '@invertase/react-native-apple-authentication'

//import { ScrollView } from 'react-native-virtualized-view';
//Assets
import FacebbokLogoSVG from '../../assets/facebook_logo.svg'
import AppleLogoSVG from '../../assets/apple_logo.svg'
import GoogleLogoSVG from '../../assets/google_logo.svg'

//File
import API_URLS from '../Api.js'
//Constant
import CONSTANTS from '../Constants.js'
import global from '../Constants.js'
import Token from '../class/TokenManager.js'
//Class
import AsyncStorageManager from '../class/AsyncStorageManager.js'
import AuthManager, { removeFCMCredential} from '../class/AuthManager.js'
//Component
import InputTextComponent from '../components/global/InputTextComponent.js'
import InputPasswordComponent from '../components/global/InputPasswordComponent.js'
import CustomButton from '../components/global/ButtonComponent.js'
import FullScreenModalComponent from '../components/global/FullScreenModalComponent'
import ModalPoup from '../components/global/ModalPoupComponent'
import { useTheme } from '../../styles/ThemeProvider'
import Utils from '../class/Utils.js'
import Validator from '../class/Validator'
import CustomSwitch from '../components/global/CustomSwitch'

import Clipboard from '@react-native-clipboard/clipboard'
import Timer from '../components/global/Timer'
import OtpInputTextComponent from '../components/global/OtpInputTextComponent'
import { SafeAreaView } from 'react-native-safe-area-context'
import LogoHeader from '../components/global/LogoHeader'

const AuthContext = createContext(' ');

const SignInForm = navigation => {
  const { theme, setScheme, setBg, bg } = useTheme()
  const emailRef = useRef()

  const navi = useNavigation()
  // console.log('login is focused? =>',navi.isFocused())
  const route = useRoute()
  const routeName = route.name

  const [forgetPassStatus, setForgetPassStatus] = useState('sign_in')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const isFocused = useIsFocused()
  const [disableResendOtp, setdisableResendOtp] = useState(true)

  const [deviceToken, setDeviceToken] = useState()
  const [isBioLoginEnabled, setBioLoginEnabled] = useState(false)

  const [isAnimOn, setIsAnimOn] = useState(false) //False is to hide lottie in top of page

  const [formData, setData] = useState({
    email: '',
    password: '',
    otpEmail: '',
    new_password: '',
    new_password_confirm: '',
  })
  const animation = useRef(null)

  const [isSignInProgress, setSignInProgress] = useState(false)

  const [visible, setVisible] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Facebook login start
  const [isEnabled, setIsEnabled] = useState(false)
  const toggleSwitch = () => setIsEnabled(previousState => !previousState)

  //Biometric
  const [isBiometricSupported, setBiometricSupport] = useState(false)
  const [biometricType, setBiometricType] = useState(BiometryTypes.Biometrics)

  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  })

  const [verificationLoading, setVerificationLoading] = useState(false)
  const [verifyButtonEnable, setVerifyButtonEnable] = useState(false)

  const [otpPin, setOtpPin] = useState(['', '', '', '', '', ''])

  const [editable, setEditable] = useState(
    Array.from({ length: 6 }, (v, i) => {
      if (i === 0) {
        return false
      } else {
        return true
      }
    }),
  )

  const pinRefArray = useRef([...Array(6)].map(() => createRef()))
  const [copiedText, setCopiedText] = useState('')
  const [firstIndex, setFirstIndex] = useState(false)

  //New code on branch fix-otp-timer-issue ...
  const [timerActive, setTimerActive] = useState(true)
  // const backKeyPressed = useRef(false)
  const [backKeyPressed, setBackKeyPressed] = useState(false)

  const { height, width, scale, fontScale } = useWindowDimensions();

  const getCopiedText = async () => {
    const copyText = await Clipboard.getString()
    // console.log('copyText =>', copyText)
    setCopiedText(copyText)
  }

  useEffect(() => {
    Clipboard.addListener(() => {
      // console.log('getting copied text ...')
      getCopiedText()
    })
  }, [])

  useEffect(() => {

    //Back button listen
    const backAction = () => {
      console.log(' ----Back pressed');
      const isFocused = navi.isFocused();
      console.log(' --> ' + route.name + ' l:' + isFocused);

      if (isFocused) {
        //setExitVisible(true);

        console.log('current screen: ' + forgetPassStatus);

        switch (forgetPassStatus) {
          case 'sign_in':
            //Utils.setPrevBgTime(932434893489439)
            BackHandler.exitApp();
            break;
          case 'get_otp':
            setOtpPin(['', '', '', '', '', '']);
            setForgetPassStatus('get_email');
            break;
          case 'get_email':
            setForgetPassStatus('sign_in');

            break;
          case 'otp_verified':
            setOtpPin(['', '', '', '', '', '']);
            setForgetPassStatus('get_email');
            break;
          default:
            console.log('Back listener: ' + forgetPassStatus)
        }

        setData({ ...formData, otpEmail: '' })
        //setForgetPassStatus('sign_in');

      } else {
        navi.goBack();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
      // gestureHandler.remove();
    }

  }, [forgetPassStatus])

  useEffect(() => {
    console.log('The text I copied was ================>', copiedText)
  }, [copiedText])

  const handleChangingText = (text, ind) => {
    // console.log('onChangeText Event of => TextInput')

    if (copiedText?.length === 6) {
      let tmp = copiedText.match(/[0-9]{6}/)
      // console.log('matched_length =>',tmp[0].length);
      // console.log(tmp[0][0]);
      // 100200
      let tmp_arr = []

      if (tmp[0]?.length === 6) {
        for (let i = 0; i < 6; ++i) {
          tmp_arr.push(tmp[0][i])
        }

        setEditable(Array.from({ length: 6 }, (v, i) => {
          if (i === 0) {
            return false
          } else {
            return true
          }
        }))
        setOtpPin(tmp_arr)
      }
    } else {
      if (backKeyPressed) {
        // console.log('Back Key Pressed')
      } else {
        // enabling the next textinput field ...
        const current_otp_array = [...otpPin]
        current_otp_array[ind] = text
        setOtpPin(current_otp_array)

        //console.log('the current ind===>', ind)

        if (ind < 5) {
          console.log('inside if ladder ====>')

          const editableArrMutable = [...editable]
          editableArrMutable[ind + 1] = false
          setEditable(editableArrMutable)

          setTimeout(() => {
            if (otpPin[ind - 1] === '' || firstIndex) {
              pinRefArray.current[0].current.focus()
              setFirstIndex(false)
            } else {
              pinRefArray.current[ind + 1].current.focus()
            }
          }, 0)
        }
      }
    }
  }

  useEffect(() => {
    // console.log(timer);
    if (
      otpPin[0] != '' &&
      otpPin[1] != '' &&
      otpPin[2] != '' &&
      otpPin[3] != '' &&
      otpPin[4] != '' &&
      otpPin[5] !== ''
    ) {
      setVerifyButtonEnable(true)
      // pinRefArray.current[0].current.focus()
    }
    console.log(otpPin)
  }, [otpPin])

  const backKeyPress = (nativeEvent, ind) => {
    if (nativeEvent.key === 'Backspace') {
      // console.log('Back Key Press Event of => TextInput')
      console.log('backspace => ind =>', ind)

      if (ind === 0) {
        setFirstIndex(true)
      }
      setBackKeyPressed(true)
    }
  }

  useEffect(() => {
    if (backKeyPressed) {
      setOtpPin(['', '', '', '', '', ''])
      setBackKeyPressed(false)

      setCopiedText('')

      setEditable(
        Array.from({ length: 6 }, (v, i) => {
          if (i === 0) {
            return false
          } else {
            return true
          }
        }),
      )
      pinRefArray.current[0].current.focus()

    }
  }, [backKeyPressed])

  useEffect(() => {
    console.log(editable)
  }, [editable])

  useEffect(() => {
    const bootstrapAsync = async () => {
      const email = await AsyncStorageManager.getData(CONSTANTS.LOGIN_METHOD)
      const pass = await AsyncStorageManager.getData(CONSTANTS.LOGIN_PASS)
      if (email && pass) {
        setIsEnabled(true)
      }

      setData({ ...formData, email: email, password: pass })


      //GoogleSignin.configure();
      GoogleSignin.configure({
        scopes: ['profile', 'email'],
        // scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
        webClientId: CONSTANTS.WEB_CLIENT_ID, // client ID of type WEB for your server. Required to get the idToken on the user object, and for offline access.
        offlineAccess: false, // if you want to access Google API on behalf of the user FROM YOUR SERVER
        //hostedDomain: '', // specifies a hosted domain restriction
        forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
        //accountName: '', // [Android] specifies an account name on the device that should be used
        androidClientId: CONSTANTS.ANDROID_ID, //WEB_CLIENT_ID, //
        iosClientId: CONSTANTS.IOS_ID, // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
        //googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
        //openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
        profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
      })
    }

    getIsBiometricLocked()
    requestUserPermission()
    bootstrapAsync()
    getBiometric()

    if (Platform.OS === 'ios') {
      return appleAuth.onCredentialRevoked(async () => {
        console.warn(
          'If this function executes, User Credentials have been Revoked',
        )
      })
    }

    // console.log('Is ShowOnce: ' + Utils.getProfileUpdateShowOnce());
    // Utils.setProfileUpdateShowOnce(true);
    // console.log('After set showOnce: ' + Utils.getProfileUpdateShowOnce());
    // Utils.setProfileUpdateShowOnce(false);
    // console.log('After set false showOnce: ' + Utils.getProfileUpdateShowOnce());
  }, [])

  const onVerify = async () => {
    setVerificationLoading(true)
    console.log(otpPin)

    let bodyData = {
      otp: `${otpPin[0]}${otpPin[1]}${otpPin[2]}${otpPin[3]}${otpPin[4]}${otpPin[5]}`,
      email: formData.otpEmail,
    }
    // console.log(API_URLS.FORGOT_PASS_VERIFY_OTP);

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setVerificationLoading(false)
      return
    }

    try {
      const response = await fetch(API_URLS.FORGOT_PASS_VERIFY_OTP, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(bodyData),
      })

      const response_json = await response.json()

      if (response.status === 200) {
        setVerificationLoading(false)
        setForgetPassStatus('otp_verified')
      } else {
        setVerificationLoading(false)
        setVisible(true)
        setErrorMsg(response_json?.message)
      }

      console.log('from_onVerify_Method =>', response_json)
    } catch (e) {
      console.log('onVerify_SignIn =>', e)

      Utils.netConnectionFaild();
    }
  }

  //Biometric Related code start
  const getBiometric = async () => {
    //const rnBiometrics = new ReactNativeBiometrics();
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
      setBiometricType(BiometryTypes.TouchID)

    } else if (available && biometryType === BiometryTypes.FaceID) {
      //ios only
      console.log('FaceID is supported')
      setBiometricSupport(true)
      setBiometricType(BiometryTypes.FaceID)
    } else if (available && biometryType === BiometryTypes.Biometrics) {
      //Android only
      console.log('Biometrics is supported')
      setBiometricSupport(true)
      setBiometricType(BiometryTypes.Biometrics)
    } else {
      console.log('Biometrics not supported')
      setBiometricSupport(false)
    }
  }

  const getBiometricData = async () => {

    var userToken = await AsyncStorageManager.getData(
      CONSTANTS.USER_TOKEN /*'user_token'*/,
    )
    console.log('User token: ' + userToken)
    getVerifyBiometric(userToken)
  }

  const getVerifyBiometric = async userToken => {
    if (isBiometricSupported) {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirmation',
      })
      if (success) {
        biometricLoginApi(userToken)
      }
    } else {
      console.log('Biometric is not supported on this device')
      Utils.showAlertDialog('Biometric is not supported on this device')
    }
  }

  async function getIsBiometricLocked() {
    var isBioLoginEnabledStr = await AsyncStorageManager.getData(
      CONSTANTS.IS_BIO_EANBLED
    )
    console.log('Previous settings bioLogin: ' + isBioLoginEnabledStr)
    var isBioLoginEnabledBool = isBioLoginEnabledStr === 'YES' ? true : false
    console.log('Previous settings bioLogin: ' + isBioLoginEnabledBool)
    setBioLoginEnabled(isBioLoginEnabledBool)
  }

  //Biometric Related code end

  //TODO need to add progress bar here
  //Get Device token
  const requestUserPermission = async () => {
    try {
      await messaging().requestPermdission()
      let deviceToken = await messaging().getToken()
      console.log('Device Token:', deviceToken)
      setDeviceToken(deviceToken)
    } catch (error) {
      console.log('Sing In Permission or Token retrieval error:', error)
    }
  }
  //FB sign in
  const onFacebookSignInPress = async () => {
    AuthManager.handleFacebookSignIn(
      (providerId, providerName, email, username, token) => {
        socialLoginApi(providerId, providerName, email, username, token, deviceToken)
      },
    )
  }

  //Google sign in
  async function onGoogleSignInPress() {

    await AuthManager.signOutGoogle();
    //await AuthManager.revokeAccessGoogle();

    AuthManager.handleGoogleSignIn(
      (providerId, providerName, email, username, token) => {
        socialLoginApi(providerId, providerName, email, username, token, deviceToken)
      },
    )
  }

  //Apple sign in
  async function onAppleSignInPress() {
    await AuthManager.handleAppleLogin(
      (providerId, providerName, finalEmail, username, token) => {
        console.log('Apple login Return call back')
        socialLoginApi(providerId, providerName, finalEmail, username, token, deviceToken)
      },
    )
  }

  const socialLoginApi = async (
    providerId,
    providerName,
    email,
    username,
    token,
    deviceToken,
  ) => {
    setIsLoading(true)

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setIsLoading(false)
      return
    }

    const bodyData = JSON.stringify({
      provider_id: providerId,
      provider_name: providerName,
      full_name: username,
      email: email,
      token: token,
      //...(deviceToken !== null && deviceToken !== '' && { device_token: deviceToken }),
      ...(deviceToken && { device_token: deviceToken }),
    });


    console.log(
      `providerId: ${providerId}, providerName: ${providerName}, email: ${email}, username: ${username}, token: ${token}`,
    )
    console.log('social login api: ' + API_URLS.SOCIAL_LOGIN)
    try {
      const response = await fetch(API_URLS.SOCIAL_LOGIN, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: bodyData,
      })
      const json = await response.json()
      if (response.status === 200) {
        console.log('Social Login Response: ' + JSON.stringify(json))
        const token = json.data.token
        const user = json.data.user
        const id = user.id

        const setting = user?.setting
        const currentThemeName = user?.setting?.current_theme
        const currentBgName = user?.setting?.background_value
        const currentBgType = user?.setting?.background_type
        const date_format = user?.setting?.date_format

        AsyncStorageManager.storeData(
          CONSTANTS.SETTING,
          JSON.stringify(setting),
        )
        AsyncStorageManager.storeData(CONSTANTS.DATE_FORMAT, date_format)

        console.log("Current theme name: " + currentThemeName);
        currentThemeName ? setScheme(currentThemeName) : setScheme(CONSTANTS.UI.ELEGENT)

        if (!CONSTANTS.IS_BACKGROUND_HIDE) {
          console.log("Social login current Bg Name from api ==>", currentBgName);
          if (currentBgName && currentBgType) {
            setBg(currentBgName)
          } else {
            setBg(CONSTANTS.BG_IMG.ELEGENT /*'ElegantBg'*/);
          }
        }

        AsyncStorageManager.storeData(CONSTANTS.USER_ID, id + '')
        AsyncStorageManager.storeData(CONSTANTS.USER_EMAIL, email + '')

        AsyncStorageManager.storeData(
          CONSTANTS.SIGN_IN_METHOD,
          providerName + '',
        )

        // const profileStatus = user.profile_status
        // AsyncStorageManager.storeData(
        //   CONSTANTS.PROFILE_STATUS,
        //   profileStatus + '',
        // )

        if (user.is_new_user == 1) {
          await AsyncStorageManager.storeData(CONSTANTS.PROFILE_STATUS, 'not_completed');
        }

        if (deviceToken) {
          console.log("Device token save to async: " + deviceToken);
          await AsyncStorageManager.storeData(
            CONSTANTS.IS_DEVICE_TOKEN_UPLOAD,
            deviceToken,
          );
        }

        console.log('ok==>')
        if (token != null) {
          goToHome(token)
        }

        // console.log(json);
        setIsLoading(false)
      } else {
        console.log('Status: ' + response.status)
        console.log(json)
        // const msg = json.message;
        // setVisible(true);
        // setErrorMsg(msg);
        setIsLoading(false)

        setErrorMsg(json.message)
        setVisible(true)
      }
    } catch (error) {
      // console.warn(error);
      // console.log(error);
      setIsLoading(false)

      //Utils.netConnectionFaild();
    }
  }

  const loginApi = async (email, pass, deviceToken_) => {

    console.log("Sign In method: password: " + email + " pass: " + pass + " deviceToken: " + deviceToken_)
    if (email === undefined || email === null || formData?.email == '') {
      setErrorMsg('Email is required')
      setVisible(true)
      return
    }
    if (pass === undefined || pass === null || formData?.pass == '') {
      setErrorMsg('Password is required')
      setVisible(true)
      return
    }

    if (Validator.Validate('email', email)) {
      //navi.dispatch(StackActions.replace('tab', {screen: 'home'}));
      setIsLoading(true)

      console.log('Email-: ' + email + ' Pass: ' + pass)

      let isConected = await Utils.isNetConnected()
      console.log("Is net connected: " + isConected);
      if (!isConected) {
        Utils.netConnectionFaild();
        setIsLoading(false)
        return
      }

      const bodyData = JSON.stringify({
        email: email,
        password: pass,
        ...(deviceToken_ && { device_token: deviceToken_ }),
      });

      console.log('login api: ' + API_URLS.LOGIN)
      try {
        const response = await fetch(API_URLS.LOGIN, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: bodyData,
        })
        const json = await response.json()
        if (response.status === 200) {
          // console.log('Login Response: ' + JSON.stringify(json));
          const token = json.data.token
          const user = json.data.user
          const id = user.id

          const setting = user?.setting
          const currentThemeName = user?.setting?.current_theme
          const currentBgName = user?.setting?.background_value
          const currentBgType = user?.setting?.background_type
          const date_format = user?.setting?.date_format

          AsyncStorageManager.storeData(
            CONSTANTS.SETTING,
            JSON.stringify(setting),
          )
          AsyncStorageManager.storeData(CONSTANTS.DATE_FORMAT, date_format)

          console.log("Current theme name: " + currentThemeName);
          currentThemeName ? setScheme(currentThemeName) : setScheme(CONSTANTS.UI.ELEGENT)
          console.log("current Bg Name from api ==>", currentBgName);

          if (!CONSTANTS.IS_BACKGROUND_HIDE) {
            if (currentBgName && currentBgType) {
              setBg(currentBgName)
            } else {
              setBg(CONSTANTS.BG_IMG.ELEGENT /*'ElegantBg'*/);
            }
          }
          // console.log('currentBgName && currentBgType', currentBgName, currentBgType);
          // return
          AsyncStorageManager.storeData(CONSTANTS.USER_ID, id + '')
          AsyncStorageManager.storeData(CONSTANTS.USER_EMAIL, email + '')


          AsyncStorageManager.storeData(CONSTANTS.SIGN_IN_METHOD, CONSTANTS.SING_IN_WITH_PASSWORD /*'password'*/)


          //Remember Password
          if (isEnabled) {
            AsyncStorageManager.storeData(CONSTANTS.LOGIN_METHOD, email)
            AsyncStorageManager.storeData(CONSTANTS.LOGIN_PASS, pass)
          } else {
            AsyncStorageManager.storeData(CONSTANTS.LOGIN_METHOD, '')
            AsyncStorageManager.storeData(CONSTANTS.LOGIN_PASS, '')
          }

          if (deviceToken_) {
            await AsyncStorageManager.storeData(
              CONSTANTS.IS_DEVICE_TOKEN_UPLOAD,
              deviceToken_,
            );
          }

          console.log('ok==>')
          // console.log('token' + token);
          if (token != null) {
            goToHome(token)
          }
          setIsLoading(false)
        } else {
          console.log(json)
          const msg = json.message
          setVisible(true)
          setErrorMsg(msg)
          setIsLoading(false)
        }
      } catch (error) {
        console.warn(error)
        console.log(error)
        setIsLoading(false)

        Utils.netConnectionFaild();
      }
    } else {
      const msg = 'Invalid email address'
      setErrorMsg(msg)
      setVisible(true)
    }
  }

  const biometricLoginApi = async (userToken) => {
    setIsLoading(true)

    //console.log('Email-: ' + email + ' Pass: ' + pass)

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setIsLoading(false)
      return
    }

    console.log('profile api for biometric ' + API_URLS.PROFILE)
    try {
      const response = await fetch(API_URLS.PROFILE, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      })
      const json = await response.json()
      if (response.status === 200) {
        console.log('Login Response: ' + JSON.stringify(json));
        let token = json.data.token
        let user = json.data
        let id = user.id

        let email = user?.email;

        let setting = user?.setting
        let currentThemeName = user?.setting?.current_theme
        let currentBgName = user?.setting?.background_value
        let currentBgType = user?.setting?.background_type
        let date_format = user?.setting?.date_format

        AsyncStorageManager.storeData(
          CONSTANTS.SETTING,
          JSON.stringify(setting),
        )
        AsyncStorageManager.storeData(CONSTANTS.DATE_FORMAT, date_format)

        console.log("Current theme name: " + currentThemeName);
        currentThemeName ? setScheme(currentThemeName) : setScheme(CONSTANTS.UI.ELEGENT)
        console.log("current Bg Name from api ==>", currentBgName);

        if (!CONSTANTS.IS_BACKGROUND_HIDE) {
          if (currentBgName && currentBgType) {
            setBg(currentBgName)
          } else {
            setBg(CONSTANTS.BG_IMG.ELEGENT /*'ElegantBg'*/);
          }
        }
        // console.log('currentBgName && currentBgType', currentBgName, currentBgType);
        // return
        AsyncStorageManager.storeData(CONSTANTS.USER_ID, id + '')
        AsyncStorageManager.storeData(CONSTANTS.USER_EMAIL, email + '')

        AsyncStorageManager.storeData(CONSTANTS.SIGN_IN_METHOD, CONSTANTS.SING_IN_WITH_BIOMETRIC)

        console.log('ok==>')
        // console.log('token' + token);
        // if (token != null) {
        //   goToHome(token)
        // }

        if (deviceToken) {
          updateDeviceToken(userToken, deviceToken)
        } else {
          goToHome(userToken)

        }


        setIsLoading(false)
      } else {
        console.log(json)
        let msg = json.message
        setVisible(true)
        setErrorMsg(msg)
        setIsLoading(false)
      }
    } catch (error) {
      console.warn(error)
      console.log(error)
      setIsLoading(false)

      Utils.netConnectionFaild();
    }

  }

  const getOtp = async (isResend) => {
    if (
      formData?.otpEmail === undefined ||
      formData?.otpEmail === null ||
      formData?.otpEmail == ''
    ) {
      setErrorMsg('Email is required')
      setVisible(true)
      return
    }

    if (Validator.Validate('email', formData?.otpEmail)) {
      setIsLoading(true)

      let isConected = await Utils.isNetConnected()
      console.log("Is net connected: " + isConected);
      if (!isConected) {
        Utils.netConnectionFaild();
        setIsLoading(false)
        return
      }

      try {
        var api = API_URLS.GET_OTP
        await fetch(api, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
          },
          body: JSON.stringify({ email: formData?.otpEmail }),
        })
          .then(response => response.json())
          .then(responseJson => {
            try {
              var a = JSON.stringify(responseJson)
              var json = JSON.parse(a)
              if (responseJson.status === 200) {
                setIsLoading(false)
                console.log('Status==> ok', json)
                // setSystemTime(new Date())
                // setMsg(json?.message)
                if (!isResend) {
                  setForgetPassStatus('get_otp')
                }
              } else {
                console.log('Error==>', json?.message)
                // console.log('Error==>', JSON.stringify(json).message);
                setErrorMsg(json?.message)
                setVisible(true)
                setIsLoading(false)
              }
            } catch (error) {
              // console.warn(error);
              console.log(error)
              setIsLoading(false)
            }
          })
          .catch(error => {
            console.warn(error)
            setIsLoading(false)

            Utils.netConnectionFaild();
          })
      } catch (error) {
        console.warn(error)
        console.log(error)
        setIsLoading(false)

        Utils.netConnectionFaild();
      }
    } else {
      const msg = 'Invalid email address'
      setErrorMsg(msg)
      setVisible(true)
    }
  }

  const setNewPass = async () => {
    if (
      formData?.new_password === undefined ||
      formData?.new_password === null ||
      formData?.new_password == ''
    ) {
      setErrorMsg('Password is required')
      setVisible(true)

      return
    }

    if (Validator.Validate('email', formData?.otpEmail)) {
      setIsLoading(true)

      const payload = {
        email: formData?.otpEmail,
        // otp: formData?.otp,
        otp: `${otpPin[0]}${otpPin[1]}${otpPin[2]}${otpPin[3]}${otpPin[4]}${otpPin[5]}`,
        password: formData?.new_password,
        is_logout_from_other_device: 0,
        // password_confirmation: formData?.new_password_confirm,
      }

      let isConected = await Utils.isNetConnected()
      console.log("Is net connected: " + isConected);
      if (!isConected) {
        Utils.netConnectionFaild();
        setIsLoading(false)
        return
      }

      try {
        var api = API_URLS.FORGOT_PASS
        await fetch(api, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
          },
          body: JSON.stringify(payload),
        })
          .then(response => response.json())
          .then(responseJson => {
            try {
              var a = JSON.stringify(responseJson)
              var json = JSON.parse(a)
              if (responseJson.status === 200) {
                setIsLoading(false)
                console.log('Status==> ok', json)
                setErrorMsg(json?.message)
                setIsSuccess(true)

                setVisible(true)
                setForgetPassStatus('sign_in')

                setData({
                  email: '',
                  password: '',
                  otpEmail: '',
                  new_password: '',
                  new_password_confirm: '',
                })

              } else {
                console.log('Error==>', json?.message)
                // console.log('Error==>', JSON.stringify(json).message);
                setErrorMsg(json?.message)
                setVisible(true)
                setIsLoading(false)
              }
            } catch (error) {
              console.warn(error)
              console.log(error)
              setIsLoading(false)
            }

            setOtpPin(Array.from({ length: 6 }, () => ''))
          })
          .catch(error => {
            console.warn(error)
            setIsLoading(false)

            Utils.netConnectionFaild();

            setOtpPin(Array.from({ length: 6 }, () => ''))
          })
      } catch (error) {
        console.warn(error)
        console.log(error)
        setIsLoading(false)

        Utils.netConnectionFaild();

        setOtpPin(Array.from({ length: 6 }, () => ''))
      }
    } else {
      const msg = 'Invalid email address'
      setErrorMsg(msg)
      setVisible(true)
    }
  }

  const updateDeviceToken = async (userToken, deviceToken_) => {
    //navi.dispatch(StackActions.replace('tab', {screen: 'home'}));
    setIsLoading(true)

    const api = API_URLS.UPDATE_DEVICE_TOKEN
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
      const json = await response.json()
      if (response.status === 200) {
        // console.log('Login Response: ' + JSON.stringify(json));

        console.log('Touch id success: ')
        console.log('ok==>')
        // console.log('token' + token);
        if (userToken != null) {
          goToHome(userToken)
        }
        setIsLoading(false)
      } else {
        console.log(json)
        const msg = json.message
        setVisible(true)
        setErrorMsg(msg)
        setIsLoading(false)
        console.log('Cannot Login with previous biometric data')
        //TODO need to show a dialog
      }
    } catch (error) {
      console.warn(error)
      console.log(error)
      setIsLoading(false)
      console.log('Cannot Login with previous biometric data')

      Utils.netConnectionFaild();
      //TODO need to show a dialog
    }
  }

  const goToHome =  async (userToken) =>  {
    //navi.navigate('tab', {screen: 'home'});
    Token.storeToken(userToken)

    let IS_ANIMATION_ON = false;
    if (IS_ANIMATION_ON) {
      //Animation turn off
      setSignInProgress(true)
      setTimeout(async () => {
        //tab_home home
        await removeFCMCredential()
        navi.dispatch(StackActions.replace('tab', { screen: 'tab_home' }));
        setSignInProgress(false)
      }, 1800)
    } else {
      await removeFCMCredential()
      navi.dispatch(StackActions.replace('tab', { screen: 'tab_home' }));
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        //flexGrow: 1,
        // justifyContent: 'center',
        height: height,
        alignItems: 'center',
        backgroundColor: 'transparent',

      }}>

      {/* 'height' */}
      <KeyboardAvoidingView
        style={{ ...styles.top, flex: 1, width: width }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'android' ? false : true}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            //flexGrow: 1,
            justifyContent: 'center',
            //backgroundColor: 'transparent',
            paddingTop: 10,
            paddingBottom: height * 0.1,
          }}
        // contentContainerStyle={styles.contentContainerStyle
        >
          <LogoHeader />
          <View style={styles.page}>
            {/*Modal Start */}
            <FullScreenModalComponent
              visible={isSignInProgress}
              title={'Sign in'}
              onPress={() => setSignInProgress(false)}
              source={require('../../assets/sign_in_progress_anim.json')}
              theme={theme}
              bg={bg}
            />

            <ModalPoup
              theme={theme}
              visible={visible}
              title={errorMsg}
              source={
                isSuccess
                  ? require('../../assets/done.json')
                  : require('../../assets/sign_in_animation.json')
              }
              btnTxt={'Ok'}
              onPressOk={() => {
                console.log("Password reset success: " + isSuccess)
                if (isSuccess) {
                  //setForgetPassStatus('sign_in')
                  console.log("Password reset success: " + isSuccess)
                }
                setVisible(false)
              }}
              onPressClose={() => {
                console.log("Password reset success: " + isSuccess)
                if (isSuccess) {
                  //setForgetPassStatus('sign_in')
                  console.log("Password reset success: " + isSuccess)
                }
                setVisible(false)
              }}
            />

            {/*Modal End */}
            <View style={styles.header}>
              {isAnimOn && (
                <LottieView
                  autoPlay
                  ref={animation}
                  style={{
                    ...styles.animation,
                    position: theme?.name == 'Light' ? 'absolute' : 'static',
                  }}
                  source={
                    forgetPassStatus == 'get_email'
                      ? require('../../assets/forgetPass.json')
                      : require('../../assets/sign_in_transparent.json')
                  }
                  loop
                />
              )}
            </View>

            {/* <ThemeSelectorForTest /> */}

            <View style={{
              //backgroundColor: 'red',
              width: width,
              alignItems: 'center',
            }}>
              <View
                style={{
                  marginTop: 20,
                  //backgroundColor: 'red',
                }}>
                {forgetPassStatus == 'sign_in' && (
                  <>
                    <View style={{ paddingBottom: 32, alignItems: 'center' }}>
                      <InputTextComponent
                        refInput={emailRef}
                        placeholderTitle={'Email'}
                        icon={theme?.profileIcon?.email}
                        borderColor={theme?.textInput?.borderColor}
                        backgroundColor={theme?.textInput?.backgroundColor}
                        borderWidth={theme?.textInput?.borderWidth}
                        darkShadowColor={theme?.textInput?.darkShadowColor}
                        lightShadowColor={theme?.textInput?.lightShadowColor}
                        shadowOffset={theme?.textInput?.shadowOffset}
                        placeholderColor={theme?.textInput?.placeholderColor}
                        inputColor={theme?.textInput?.inputColor}
                        //widthRatio={0.83}
                        value={formData.email}
                        type="email"
                        onChangeText={value => {
                          // console.log('Email==: ' + value);
                          setData({ ...formData, email: value })
                        }}
                        cursorColor={theme.colors.borderColor}
                      />

                    </View>

                    <View style={{ paddingBottom: 20, alignItems: 'center' }}>
                      <InputPasswordComponent
                        placeholderTitle={'Password'}
                        value={formData.password}

                        // icon={<PasswordSVG />}
                        icon={theme?.profileIcon?.password}
                        eyeOn={theme?.profileIcon?.eyeOn}
                        eyeOff={theme?.profileIcon?.eyeOff}
                        borderColor={theme?.textInput?.borderColor}
                        backgroundColor={theme?.textInput?.backgroundColor}
                        borderWidth={theme?.textInput?.borderWidth}
                        darkShadowColor={theme?.textInput?.darkShadowColor}
                        lightShadowColor={theme?.textInput?.lightShadowColor}
                        shadowOffset={theme?.textInput?.shadowOffset}
                        placeholderColor={theme?.textInput?.placeholderColor}
                        inputColor={theme?.textInput?.inputColor}
                        onChangeText={value => {
                          // console.log('password==: ' + value);
                          setData({ ...formData, password: value })
                        }}
                        cursorColor={theme.colors.borderColor}
                        onFocus={() => {
                          console.log('Focused on Password!')
                        }}
                      />
                    </View>
                  </>
                )}

                {forgetPassStatus == 'get_email' && (
                  <View style={{ paddingBottom: 0 }}>
                    <TouchableOpacity
                      style={{ marginBottom: 40, alignSelf: 'flex-start' }}

                      onPress={() => {

                        setForgetPassStatus('sign_in')
                        // setData({
                        //   email: '',
                        //   password: '',
                        //   otpEmail: '',
                        //   new_password: '',
                        //   new_password_confirm: '',
                        // })

                      }}>
                      {theme?.header?.backIcon}
                    </TouchableOpacity>
                    <InputTextComponent
                      // refInput={}
                      placeholderTitle={'Email'}
                      // icon={<EmailSVG />}
                      icon={theme?.profileIcon?.email}
                      borderColor={theme?.textInput?.borderColor}
                      backgroundColor={theme?.textInput?.backgroundColor}
                      borderWidth={theme?.textInput?.borderWidth}
                      darkShadowColor={theme?.textInput?.darkShadowColor}
                      lightShadowColor={theme?.textInput?.lightShadowColor}
                      shadowOffset={theme?.textInput?.shadowOffset}
                      placeholderColor={theme?.textInput?.placeholderColor}
                      inputColor={theme?.textInput?.inputColor}
                      value={formData.otpEmail}
                      type="email"
                      onChangeText={value => {
                        // console.log('Email==: ' + value);
                        setData({ ...formData, otpEmail: value })
                      }}
                      cursorColor={theme.colors.borderColor}
                    />
                  </View>
                )}

                {forgetPassStatus == 'get_otp' && (
                  <>
                    <View style={{ paddingBottom: 0 }}>
                      <TouchableOpacity
                        style={{ marginBottom: 40, marginLeft: 40, alignSelf: 'flex-start' }}
                        // style={{ position: 'absolute', left: 5, zIndex: 100,top:-20, }}
                        onPress={() => {
                          setForgetPassStatus('get_email')
                          setOtpPin(Array.from({ length: 6 }, () => ''))
                          setData({
                            email: '',
                            password: '',
                            otpEmail: '',
                            new_password: '',
                            new_password_confirm: '',
                          })
                        }}>
                        {theme?.header?.backIcon}
                      </TouchableOpacity>

                      <View style={{
                        ...styles.textInputContainer, width: width,
                        height: height * 0.15,
                      }}>
                        {editable.map((item, ind) => {
                          return (
                            <OtpInputTextComponent
                              key={`item${ind}`}
                              value={otpPin[ind]}
                              refInput={pinRefArray.current[ind]}
                              placeholderTitle={''}
                              // icon={<Otp />}
                              cursorCentered={true}
                              cursorColor={'#000'}
                              maxLength={1}
                              disabled={item}
                              icon={theme?.settingsIcon?.otp}
                              borderColor={theme?.textInput?.borderColor}
                              backgroundColor={
                                theme?.textInput?.backgroundColor
                              }
                              borderWidth={theme?.textInput?.borderWidth}
                              darkShadowColor={
                                theme?.textInput?.darkShadowColor
                              }
                              lightShadowColor={
                                theme?.textInput?.lightShadowColor
                              }
                              shadowOffset={theme?.textInput?.shadowOffset}
                              placeholderColor={
                                theme?.textInput?.placeholderColor
                              }
                              inputColor={theme?.textInput?.inputColor}
                              type="numeric"
                              divideWidthBy={9}
                              onChangeText={text => {
                                handleChangingText(text, ind)
                              }}
                              onKeyPress={({ nativeEvent }) => {
                                backKeyPress(nativeEvent, ind)
                              }}
                            // pointerEvents={ind === 0 || otpPin[ind - 1] !== '' ? 'auto' : 'none'}
                            />
                          )
                        })}
                      </View>
                    </View>

                    <View style={{ paddingTop: 10, paddingBottom: 20 }}>

                      <View style={{ paddingLeft: 35, paddingRight: 35, }}>
                        <CustomButton
                          title={'Verify'}
                          isLoading={verificationLoading}
                          onPress={() => {
                            onVerify()
                            // setForgetPassStatus('otp_verified');
                          }}
                          color={theme?.colors?.btnText}
                          colors={theme?.colors?.colors}
                          bordered={true}
                          borderWidth={theme?.name == 'Light' ? 0 : 3}
                          borderColors={theme?.colors?.borderColors}
                          borderColor={theme?.colors?.borderColor}
                          shadow={theme?.name == 'Light'}
                          disabled={!verifyButtonEnable}
                        />
                      </View>
                    </View>
                    <View style={styles.resendOtpContainer}>
                      <TouchableOpacity

                        disabled={disableResendOtp}
                        onPress={() => {
                          getOtp(true);

                          setdisableResendOtp(true)
                          setTimerActive(true)

                        }}>
                        <Text
                          style={[
                            {
                              color: !disableResendOtp ? theme?.colors?.textContrast : '#3D3D3D',
                              fontFamily: theme?.font.body.fontFamily,
                              fontWeight: theme?.font.body.fontWeight,
                              fontSize: theme?.font.fontSize.s,
                            },
                          ]}>
                          Resend OTP
                        </Text>
                      </TouchableOpacity>
                      <Timer
                        time={300}
                        timerActive={timerActive}
                        theme={theme}
                        onTimeout={() => {
                          console.log('onTimeout listener ===>')
                          setdisableResendOtp(false)
                          setTimerActive(false)
                        }}
                      />
                    </View>
                  </>
                )}

                {/* Is Rendered after the OTP is verified  */}
                {forgetPassStatus === 'otp_verified' ? (
                  <View>

                    <TouchableOpacity
                      style={{ marginBottom: 40, marginLeft: 0 }}
                      // style={{ position: 'absolute', left: 5, zIndex: 100,top:-20, }}
                      onPress={() => {
                        //setForgetPassStatus('get_otp')
                        setForgetPassStatus('get_email')
                        setOtpPin(Array.from({ length: 6 }, () => ''))
                        setData({
                          email: '',
                          password: '',
                          otpEmail: '',
                          new_password: '',
                          new_password_confirm: '',
                        })
                      }}>
                      {theme?.header?.backIcon}
                    </TouchableOpacity>
                    <View style={{ paddingBottom: 20, alignItems: 'center' }}>

                      <InputPasswordComponent
                        placeholderTitle={'Enter New Password'}
                        // icon={<PasswordSVG />}
                        icon={theme?.profileIcon?.password}
                        eyeOn={theme?.profileIcon?.eyeOn}
                        eyeOff={theme?.profileIcon?.eyeOff}
                        borderColor={theme?.textInput?.borderColor}
                        backgroundColor={theme?.textInput?.backgroundColor}
                        borderWidth={theme?.textInput?.borderWidth}
                        darkShadowColor={theme?.textInput?.darkShadowColor}
                        lightShadowColor={theme?.textInput?.lightShadowColor}
                        shadowOffset={theme?.textInput?.shadowOffset}
                        placeholderColor={theme?.textInput?.placeholderColor}
                        value={formData.new_password}
                        inputColor={theme?.textInput?.inputColor}
                        onChangeText={value => {
                          // console.log('password==: ' + value);
                          setData({ ...formData, new_password: value })
                        }}
                        onFocus={() => {
                          console.log('Focused on New Password!')
                        }}

                      />
                    </View>
                    <View style={{}}>
                      <View style={{ marginTop: 15 }}>
                        <CustomButton
                          title={'Reset Password'}
                          isLoading={isLoading}
                          onPress={() => {
                            // setForgetPassStatus('sign_in')
                            setNewPass()
                          }}
                          color={theme?.colors?.btnText}
                          colors={theme?.colors?.colors}
                          bordered={true}
                          borderWidth={theme?.name == 'Light' ? 0 : 3}
                          borderColors={theme?.colors?.borderColors}
                          borderColor={theme?.colors?.borderColor}
                          shadow={theme?.name == 'Light'}
                        />
                      </View>
                    </View>
                  </View>
                ) : null}

                <View style={styles.forgatePassContaner}>
                  {forgetPassStatus == 'sign_in' ? (
                    <View style={{ ...styles.rememberPass, width: width / 3 }}>
                      <CustomSwitch
                        value={isEnabled}
                        onValueChange={toggleSwitch}
                      />
                      <Text
                        style={{
                          paddingLeft: 8,
                          color: theme?.colors?.textContrast,
                          fontFamily: theme?.font.body.fontFamily,
                          fontWeight: theme?.font.body.fontWeight,
                          fontSize: theme?.font.fontSize.s,

                        }}>
                        Remember me
                      </Text>
                    </View>
                  ) : null}

                 { forgetPassStatus == 'sign_in' && <View
                    style={{
                      flex: 1,
                      width: width / 3,
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        if (
                          forgetPassStatus == 'get_email' ||
                          forgetPassStatus == 'get_otp'
                        ) {
                          setForgetPassStatus('sign_in')
                        } else {
                          setForgetPassStatus('get_email')
                        }
                      }}
                      style={{height: 48, justifyContent: 'center'}}
                      >
                      <Text
                        style={{
                          textAlign: 'right',
                          width: width / 3,
                          //backgroundColor: 'red',
                          color: theme?.colors?.textContrast,
                          fontFamily: theme?.font.body.fontFamily,
                          fontWeight: theme?.font.body.fontWeight,
                          fontSize: theme?.font.fontSize.s,
                        }}>
                        {
                          forgetPassStatus == 'sign_in'
                            ? 'Forgot Password?'
                            : null // 'Sign in'
                        }
                      </Text>
                    </TouchableOpacity>
                  </View>}
                </View>

                <View style={{ paddingBottom: 15 }}>
                  {isBioLoginEnabled && forgetPassStatus == 'sign_in' && (
                    <View
                      style={{ alignSelf: 'center' }}>
                      <TouchableOpacity
                        onPress={() => {
                          getBiometricData()
                        }}>
                        <Neomorph
                          darkShadowColor="#9eb5c7"
                          //darkShadowColor="gray" // <- set this
                          //lightShadowColor="#3344FF" // <- this
                          style={
                            theme?.name == 'Light'
                              ? styles.input
                              : {
                                ...styles.inputDark,
                                borderColor: theme?.textInput?.borderColor,
                              }
                          }>
                          <View style={styles.centeredContent}>
                            {/* <FingerPrintSVG /> */}
                            {biometricType === BiometryTypes.FaceID ? (theme?.settingsIcon?.faceId) : (theme?.settingsIcon?.fingerprint)}
                            {/* {theme?.settingsIcon?.fingerprint} */}
                          </View>
                        </Neomorph>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {(forgetPassStatus === 'get_email' ||
                  forgetPassStatus === 'sign_in') && (
                    <View style={{ paddingBottom: 15 }}>
                      <CustomButton
                        title={
                          forgetPassStatus == 'get_email'
                            ? 'Send OTP'
                            : forgetPassStatus == 'get_otp'
                              ? 'Save'
                              : 'Sign In'
                        }
                        isLoading={isLoading}
                        onPress={() => {
                          if (forgetPassStatus == 'get_email') {
                            getOtp(false)

                            //for go otp page
                            //setForgetPassStatus('get_otp')

                            setTimerActive(true)
                            setdisableResendOtp(true)
                          } else {
                            // TODO need to move in a function
                            global.isSignedIn = true
                            console.log('Press Sign In Button')
                            console.log('Email: ' + formData.email)
                            console.log('Password: ' + formData.password)

                            loginApi(
                              formData.email,
                              formData.password,
                              deviceToken,
                            )
                          }
                        }}
                        color={theme?.colors?.btnText}
                        colors={theme?.colors?.colors}
                        bordered={true}
                        borderWidth={theme?.name == 'Light' ? 0 : 3}
                        borderColors={theme?.colors?.borderColors}
                        borderColor={theme?.colors?.borderColor}
                        shadow={theme?.name == 'Light'}
                      />
                    </View>
                  )}

                {forgetPassStatus == 'sign_in' ? (
                  <>
                    <Text
                      style={{
                        textAlign: 'center',
                        //marginVertical: 10,
                        marginTop: 40,
                        marginBottom: 10,

                        color: theme?.colors?.textContrast,
                        fontFamily: theme?.font.body.fontFamily,
                        fontWeight: theme?.font.body.fontWeight,
                        fontSize: theme?.font.fontSize.m,

                      }}>
                      {' '}
                      Or Continue With
                    </Text>

                    <View
                      style={{ flexDirection: 'row', marginTop: 0, justifyContent: 'center' }}>
                      <TouchableOpacity
                        onPress={() => onGoogleSignInPress()}
                        accessibilityLabel='Login with google'
                      >
                        <Neomorph
                          darkShadowColor="#9eb5c7"
                          //darkShadowColor="gray" // <- set this
                          //lightShadowColor="#3344FF" // <- this
                          // style={styles.input}
                          style={
                            theme?.name === 'Light'
                              ? styles.input
                              : {
                                ...styles.inputDark,
                                borderColor: theme?.textInput?.borderColor,
                              }
                          }>
                          <GoogleLogoSVG />
                        </Neomorph>
                      </TouchableOpacity>

                      <View>
                        {/* appleAuthAndroid.isSupported */}
                        {Platform.OS == 'ios' && (
                          <TouchableOpacity
                            onPress={() => {
                              onAppleSignInPress()
                            }}
                            accessibilityLabel='Login with apple'
                            >
                            <Neomorph
                              darkShadowColor="#9eb5c7"
                              //darkShadowColor="gray" // <- set this
                              //lightShadowColor="#3344FF" // <- this
                              // style={styles.input}
                              style={
                                theme?.name == 'Light'
                                  ? styles.input
                                  : {
                                    ...styles.inputDark,
                                    borderColor: theme?.textInput?.borderColor,
                                  }
                              }>
                              <View
                                style={{
                                  flex: 1,
                                  justifyContent: 'center',
                                  alignContent: 'center',
                                  marginLeft: -5,
                                }}>
                                <AppleLogoSVG />
                                {/* <FacebbokLogoSVG /> */}
                              </View>
                            </Neomorph>
                          </TouchableOpacity>
                        )}
                      </View>

                      <View>
                        {/* appleAuthAndroid.isSupported */}
                        {false && (
                          <TouchableOpacity
                            onPress={() => {
                              onFacebookSignInPress()
                            }}>
                            <Neomorph
                              darkShadowColor="#9eb5c7"
                              //darkShadowColor="gray" // <- set this
                              //lightShadowColor="#3344FF" // <- this
                              // style={styles.input}
                              style={
                                theme?.name == 'Light'
                                  ? styles.input
                                  : {
                                    ...styles.inputDark,
                                    borderColor: theme?.textInput?.borderColor,
                                  }
                              }>
                              <View
                                style={{
                                  flex: 1,
                                  justifyContent: 'center',
                                  alignContent: 'center',
                                  //marginLeft: -5,
                                }}>
                                <FacebbokLogoSVG />
                              </View>
                            </Neomorph>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <View
                      style={{ marginTop: 10, flexDirection: 'row', justifyContent: "center" }}>
                      <Text
                        style={{
                          textAlign: 'center',
                          color: theme?.colors?.textContrast,
                          fontFamily: theme?.font.body.fontFamily,
                          fontWeight: theme?.font.body.fontWeight,
                          fontSize: theme?.font.fontSize.m,
                        }}
                      >
                        Don't have an account?{' '}
                      </Text>

                      <TouchableOpacity
                        onPress={() => {
                          navi.navigate('sign_up')
                        }}
                        style={{ height: 48}}
                        >
                        <Text
                          style={{
                            textAlign: 'center',
                            color: theme?.colors?.textContrast,
                            fontFamily: theme?.font.body.fontFamily,
                            fontWeight: theme?.font.body.fontWeight,
                            fontSize: theme?.font.fontSize.m,
                          }}>
                          Sign up{' '}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={{ marginBottom: 0 }} />
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* </ImageBackground> */}
    </SafeAreaView>
  )
}

export default ({ navigation }) => {
  const isFocused = useIsFocused()
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          }
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          }
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          }
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    },
  )

  useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken
      //const navi = useNavigation();
      userToken = await Token.getToken()
      if (userToken) {
        // Use the token in your application
        //navi.dispatch(StackActions.replace('tab', {screen: 'home'}));
        navigation.navigate('tab', { screen: 'home' })
      } else {
        // Handle the case where the token doesn't exist
      }
      // After restoring token, we may need to validate it in production apps
      dispatch({ type: 'RESTORE_TOKEN', token: userToken })
    }
    bootstrapAsync()
  }, [isFocused])

  const authContext = useMemo(
    () => ({
      signIn: async data => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `SecureStore` or any other encrypted storage
        // In the example, we'll use a dummy token

        dispatch({ type: 'SIGN_IN', token: 'dummy-auth-token' });
      },
      signOut: () => dispatch({ type: 'SIGN_OUT' }),
      signUp: async data => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `SecureStore` or any other encrypted storage
        // In the example, we'll use a dummy token

        dispatch({ type: 'SIGN_IN', token: 'dummy-auth-token' });
      },
    }),
    [],
  );

  return (
    <AuthContext.Provider value={authContext}>
      <SignInForm />
    </AuthContext.Provider>
  )
}
const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  top: {
    padding: 0,
  },
  page: {
    alignItems: 'center',
  },
  rectangle1: {
    borderRadius: 20,
    backgroundColor: '#fff',
    flex: 1,
    width: '100%',
    height: 56,
  },
  header: { alignItems: 'center' },
  headerDialog: {
    width: '100%',
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  forgatePassContaner: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingTop: 10,
    gap: 10,
    paddingBottom: 20,
  },
  rememberPass: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 500,
    textAlign: 'center',
    marginTop: 10,
  },
  input: {
    shadowOpacity: 1, // <- and this or yours opacity
    shadowRadius: 10,
    borderRadius: 20,
    backgroundColor: '#ECF0F3',
    margin: 10,
    width: 65,
    height: 65,
  },
  inputDark: {
    padding: 15,
    borderRadius: 20,
    backgroundColor: 'black',
    borderWidth: 2,
    margin: 10,
    width: 65,
    height: 65,
  },
  animation: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff00',
    // position: 'absolute',
  },
  bg1: {
    borderRadius: 20,
    backgroundColor: '#3d50df',
    shadowColor: 'rgba(255, 255, 255, 0.27)',
    shadowOffset: {
      width: -11,
      height: -11,
    },
    shadowRadius: 20,
    elevation: 20,
    shadowOpacity: 1,
    justifyContent: 'center',
    width: '100%',
    height: 60,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  contentContainerStyle: {
    flex: 1,
    paddingTop: 30,
    justifyContent: 'center',
  },
  textInputContainer: {
    flexDirection: 'row',
    gap: 10,

    justifyContent: 'center',
    // backgroundColor:'red',
  },
  resendOtpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 40,
    paddingRight: 50,
  },
  resendOtpText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
})
