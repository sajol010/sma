import {
  React,
  useEffect,
  useReducer,
  useState,
  useRef,
  createRef,
} from 'react'
//SVG
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native'

//import { ScrollView } from 'react-native-virtualized-view';
//Assets

//File
import API_URLS from '../Api.js'
//Constant
import CONSTANTS from '../Constants.js'
import global from '../Constants.js'
import Token from '../class/TokenManager.js'
//Class
import AsyncStorageManager from '../class/AsyncStorageManager.js'

//Component
import InputTextComponent from '../components/global/InputTextComponent.js'
import PasswordInput from '../components/global/InputPasswordComponent.js'
import CustomButton from '../components/global/ButtonComponent.js'
import FullScreenModalComponent from '../components/global/FullScreenModalComponent'
import ModalPoup from '../components/global/ModalPoupComponent'
import { useTheme } from '../../styles/ThemeProvider'
import Utils from '../class/Utils.js'
import Validator from '../class/Validator'
import { DIM } from '../../styles/Dimensions'

import Clipboard from '@react-native-clipboard/clipboard'
import Timer from '../components/global/Timer'
import OtpInputTextComponent from '../components/global/OtpInputTextComponent'
import { SafeAreaView } from 'react-native-safe-area-context'
import LogoHeader from '../components/global/LogoHeader'

const { width, height } = Dimensions.get('window')

const SignInForm = navigation => {
  const { theme, setScheme, setBg, bg } = useTheme()

  const navi = useNavigation()
  // console.log('login is focused? =>',navi.isFocused())
  const route = useRoute()
  const routeName = route.name

  const [forgetPassStatus, setForgetPassStatus] = useState('get_otp')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const isFocused = useIsFocused()
  const [disableResendOtp, setdisableResendOtp] = useState(true)

  const [formData, setData] = useState({
    email: '',
    password: '',
    otpEmail: '',
    new_password: '',
    new_password_confirm: '',
  })

  const [isSignInProgress, setSignInProgress] = useState(false)

  const [visible, setVisible] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Facebook login start
  const [isEnabled, setIsEnabled] = useState(false)
  const toggleSwitch = () => setIsEnabled(previousState => !previousState)

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

        // console.log('the current index is ===>', ind)

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

      setData({ ...formData, email: email, password: pass })

    }

    bootstrapAsync()

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

  const getOtp = async () => {
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
        fetch(api, {
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
                setForgetPassStatus('get_otp')
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
        // password_confirmation: formData?.new_password_confirm,
      }
      // console.log('payload', payload);

      let isConected = await Utils.isNetConnected()
      console.log("Is net connected: " + isConected);
      if (!isConected) {
        Utils.netConnectionFaild();
        setIsLoading(false)
        return
      }

      try {
        var api = API_URLS.FORGOT_PASS
        fetch(api, {
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


  return (
    <SafeAreaView
      style={{
        // flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        height: DIM.height,
      }}>

      <KeyboardAvoidingView
        style={styles.top}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingBottom: DIM.height * .1,
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
                if (isSuccess) {
                  setForgetPassStatus('sign_in')
                }
                setVisible(false)
              }}
              onPressClose={() => {
                if (isSuccess) {
                  setForgetPassStatus('sign_in')
                }
                setVisible(false)
              }}
            />

            <View style={{
              // backgroundColor:'red',
              width: DIM.width,
              alignItems: 'center',
            }}>
              <View
                style={{
                  marginTop: 20,
                }}>
                {forgetPassStatus == 'get_otp' && (
                  <>
                    <View style={{ paddingBottom: 0 }}>
                      <TouchableOpacity
                        style={{ marginBottom: 40, marginLeft: 40 }}
                        // style={{ position: 'absolute', left: 5, zIndex: 100,top:-20, }}
                        onPress={() => {
                          navi.goBack()
                          
                    
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

                      <View style={styles.textInputContainer}>
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

                    <View style={{ paddingBottom: 20 }}>

                      <View style={{ paddingLeft: 35, paddingRight: 35 }}>
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
                          setdisableResendOtp(true)
                          setTimerActive(true)
                        }}>
                        <Text
                          style={[
                            styles.resendOtpText,
                            {
                              color: !disableResendOtp ? '#ffffff' : '#3D3D3D',
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

                      <PasswordInput
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
      } else {
        // Handle the case where the token doesn't exist
      }
      // After restoring token, we may need to validate it in production apps
      dispatch({ type: 'RESTORE_TOKEN', token: userToken })
    }
    bootstrapAsync()
  }, [isFocused])

  return (
    <SignInForm />
  )
}
const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    justifyContent: 'center',
  },
  heading: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  top: {
    width: width,
    padding: 0,
    // height: DIM.height * 0.8,
  },
  page: {
    alignItems: 'center',
    // backgroundColor:'red',
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
    width: DIM.width,
    height: DIM.height * 0.15,
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
