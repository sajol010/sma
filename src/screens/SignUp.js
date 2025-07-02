import { useNavigation, StackActions } from '@react-navigation/native';
import {
  React,
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useRef,
} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { AppleButton, appleAuth, appleAuthAndroid } from '@invertase/react-native-apple-authentication';
import LottieView from 'lottie-react-native';
import { Neomorph } from 'react-native-neomorph-shadows';
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  GoogleSignin,
} from '@react-native-google-signin/google-signin';
import messaging from '@react-native-firebase/messaging';

//Constant
import API_URLS from '../Api.js';
import CONSTANTS from '../Constants.js';
//Class
import Token from '../class/TokenManager.js';
import Utils from '../class/Utils.js';
import AuthManager from '../class/AuthManager.js';
//Component
import ModalPoup from '../components/global/ModalPoupComponent';
import TextInput from '../components/global/InputTextComponent.js';
import PasswordInput from '../components/global/InputPasswordComponent.js';

import AsyncStorageManager from '../class/AsyncStorageManager.js';
//SVG
import AppleLogoSVG from '../../assets/apple_logo.svg';
import GoogleLogoSVG from '../../assets/google_logo.svg';
import CustomButton from '../components/global/ButtonComponent.js';
import { useTheme } from '../../styles/ThemeProvider.js';
import Validator from '../class/Validator.js';
import LogoHeader from '../components/global/LogoHeader.js';

const AuthContext = createContext(' ');
//Variables
//const { width, height } = Dimensions.get('window');

const SignUpForm = () => {

  const { theme, setScheme, setBg } = useTheme();

  const navi = useNavigation();
  const [formData, setData] = useState({
    name: '',
    email: '',
    pass: '',
  });
  const [isLoading, setLoading] = useState(false);
  const [deviceToken, setDeviceToken] = useState();

  const [isSignInProgress, setSignInProgress] = useState(false);

  const [visible2, setVisible2] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [isAnimOn, setIsAnimOn] = useState(false);


  const { height, width, scale, fontScale } = useWindowDimensions();

  const handlePress = () => {
    navi.goBack();
    console.log('Button pressed!');
  };

  const animation = useRef(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      // const email = await AsyncStorageManager.getData('Login_Email');
      // const pass = await AsyncStorageManager.getData('Login_Pass');

      //setData({...formData, email: email, password: pass});

      //Should come from unique place
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
      });
    };
    bootstrapAsync();

    requestUserPermission();

    if (Platform.OS === 'ios') {
      return appleAuth.onCredentialRevoked(async () => {
        console.warn('If this function executes, User Credentials have been Revoked');
      });
    }
    return () => {
      // console.log('unfocusing =================================>')
      setData({
        name: '',
        email: '',
        pass: '',
      })
    }
  }, []);

  //Get Device token
  const requestUserPermission = async () => {
    try {
      await messaging().requestPermission();
      let token = await messaging().getToken();
      console.log('Device Token:', token);

      setDeviceToken(token);
    } catch (error) {
      console.log('Sign Up Permission or Token retrieval error:', error);
    }
  };

  //FB sign in 
  const onFacebookSignInPress = async () => {
    AuthManager.handleFacebookSignIn((providerId, providerName, email, username, token) => {
      socialLoginApi(providerId, providerName, email, username, token, deviceToken);
    })
  };

  //Google sign in
  async function onGoogleSignInPress() {

    await AuthManager.signOutGoogle();

    AuthManager.handleGoogleSignIn((providerId, providerName, email, username, token) => {
      socialLoginApi(providerId, providerName, email, username, token, deviceToken);
    })
  }

  //Apple sign in
  async function onAppleSignInPress() {
    await AuthManager.handleAppleLogin((providerId, providerName, finalEmail, username, token) => {
      console.log("Apple login Return call back");
      socialLoginApi(providerId, providerName, finalEmail, username, token, deviceToken);
    });
  }

  const requestForSignUp = async (
    name,
    email,
    pass,
    passConfirmation,
    deviceToken_,
  ) => {
    console.log(
      'Signup name: ' +
      name +
      ' email: ' +
      email +
      ' pass: ' +
      pass +
      'pass confirm: ' +
      passConfirmation +
      'DeviceToken: ' +
      deviceToken_,
    );
    if (!name || !email || !pass) {
      // if (!name || !email || !pass || !passConfirmation) {
      // Check if any of the fields is empty or undefined
      setErrorMsg('All fields are required');
      setVisible2(true);
      // Alert.alert('Validation Error', 'Please fill in all fields');
    }
    else if (!Validator.Validate('email', email)) {
      setErrorMsg('Invalid email');
      setVisible2(true);
    }
    // else if (pass !== passConfirmation) {
    //   // Check if passwords match
    //   setErrorMsg('Passwords do not match');
    //   setVisible2(true);
    //   // Alert.alert('Validation Error', 'Passwords do not match');
    // }
    else {
      // All fields are filled, and passwords match, you can proceed with form submission
      // Add your submission logic here
      //Alert.alert('Success', 'Form submitted successfully');
      setLoading(true);

      const bodyData = JSON.stringify({
        full_name: name,
        email: email,
        password: pass,
        password_confirmation: passConfirmation,
        ...(deviceToken_ && { device_token: deviceToken_ }),
      });

      let isConected = await Utils.isNetConnected()
      console.log("Is net connected: " + isConected);
      if (!isConected) {
        Utils.netConnectionFaild();
        setLoading(false)
        return
      }

      await fetch(API_URLS.REGISTER, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${token}`, // notice the Bearer before your token
        },
        body: bodyData,
      })
        //Sending the currect offset with get request
        .then(response => response.json())
        .then(async responseJson => {
          //Successful response
          //Increasing the offset for the next API call
          try {
            //const json = await response.json();
            var a = JSON.stringify(responseJson);
            var json = JSON.parse(a);

            var status = json.status;
            console.log(' Status: ' + status);
            // console.log(' Register resp ==> ' + json?.message);

            if (status === 200) {
              // const json = response.json();
              console.log(' Register resp: ' + JSON.stringify(json));
              if (json.data.token != null) {
                var token = json.data.token;
                Token.storeToken(token);

                const user = json.data.user;
                const id = user.id;
                //const currentTheme = user?.setting?.current_theme
                setScheme(CONSTANTS.UI.DEFAULT) /*'elegant'*/

                if (!CONSTANTS.IS_BACKGROUND_HIDE) {
                  setBg(CONSTANTS.BG_IMG.ELEGENT /*'ElegantBg'*/);
                }

                await AsyncStorageManager.storeData(CONSTANTS.USER_ID, id + '');
                await AsyncStorageManager.storeData(CONSTANTS.USER_EMAIL, email + '');

                await AsyncStorageManager.storeData(CONSTANTS.SIGN_IN_METHOD, CONSTANTS.SING_IN_WITH_PASSWORD /*'password'*/);
                Utils.setProfileUpdateShowOnce(false);
                await AsyncStorageManager.storeData(CONSTANTS.PROFILE_STATUS, 'not_completed');

                if (user.is_new_user == 1) {
                  await AsyncStorageManager.storeData(CONSTANTS.PROFILE_STATUS, 'not_completed');
                }

                if (deviceToken_) {
                  console.log("Device token saved to async: " + deviceToken_);
                  await AsyncStorageManager.storeData(CONSTANTS.IS_DEVICE_TOKEN_UPLOAD, deviceToken_);
                }

                setData({
                  name: '',
                  email: '',
                  pass: '',
                })

                navi.navigate('tab', { screen: 'home' });
                console.log('store token' + token);
              } else {
                // Utils.showAlertDialog('Registration Failed', json?.message);
                setErrorMsg(json?.message)
                setVisible2(true)
                // Utils.showAlertDialog('Registration Failed', '');
              }
            } else {
              // Utils.showAlertDialog('Registration Failed', json?.message);
              setErrorMsg(json?.message)
              setVisible2(true)
              // Utils.showAlertDialog('Registration Failed', '');
            }
            setLoading(false);

            console.log('Signup JSON ' + JSON.stringify(json));
          } catch (error) {
            console.warn(error);
            console.log(error);
            Utils.showAlertDialog('Otp request Failed', error);
            setLoading(false);
          }
        }).catch(error => {
          console.warn(error);
          setLoading(false);

          Utils.netConnectionFaild();
        });
    }
  };

  const socialLoginApi = async (
    providerId,
    providerName,
    email,
    username,
    token,
    deviceToken_
  ) => {
    //navi.dispatch(StackActions.replace('tab', {screen: 'home'}));
    setLoading(true);
    console.log(
      `providerId: ${providerId}, providerName: ${providerName}, email: ${email}, username: ${username}, token: ${token}`,
    );
    console.log('social login api: ' + API_URLS.SOCIAL_LOGIN);


    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setLoading(false)
      return
    }

    try {
      const bodyData = JSON.stringify({
        provider_id: providerId,
        provider_name: providerName,
        full_name: username,
        email: email,
        token: token,
        //...(deviceToken !== null && deviceToken !== '' && { device_token: deviceToken }),
        ...(deviceToken_ && { device_token: deviceToken_ }),
      });

      const response = await fetch(API_URLS.SOCIAL_LOGIN, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: bodyData,
      });
      const json = await response.json();

      console.log('Social Login Response: ' + JSON.stringify(json));
      if (response.status === 200) {
        console.log('Login Response: ' + JSON.stringify(json));
        const token = json.data.token;
        const user = json.data.user;
        const id = user.id;

        const setting = user?.setting;
        const currentThemeName = user?.setting?.current_theme; //UI
        const currentBgName = user?.setting?.background_value;
        const currentBgType = user?.setting?.background_type;
        const date_format = user?.setting?.date_format;

        AsyncStorageManager.storeData(CONSTANTS.SETTING, JSON.stringify(setting));
        AsyncStorageManager.storeData(CONSTANTS.DATE_FORMAT, date_format);

        console.log("Current theme: " + currentThemeName);
        currentThemeName ? setScheme(currentThemeName) : setScheme(CONSTANTS.UI.ELEGENT)

        if (!CONSTANTS.IS_BACKGROUND_HIDE) {
          console.log("current Bg Name from api ==>", currentBgName);
          if (currentBgName && currentBgType) {
            setBg(currentBgName)
          } else {
            setBg(CONSTANTS.BG_IMG.ELEGENT /*'ElegantBg'*/);
          }
        }

        AsyncStorageManager.storeData(CONSTANTS.USER_ID, id + '');
        AsyncStorageManager.storeData(CONSTANTS.USER_EMAIL, email + '');

        AsyncStorageManager.storeData(CONSTANTS.SIGN_IN_METHOD, providerName + '');

        // const profileStatus = user.profile_status;
        // AsyncStorageManager.storeData(CONSTANTS.PROFILE_STATUS, profileStatus + '');

        if (deviceToken_) {
          console.log("Device token saved to async: " + deviceToken_);
          await AsyncStorageManager.storeData(CONSTANTS.IS_DEVICE_TOKEN_UPLOAD, deviceToken_);
        }

        console.log('ok==>');
        if (token != null) {
          gotToHome(token);
        }

        // console.log(json);
        setLoading(false);
      } else {
        console.log('Status: ' + response.status);
        console.log(json);
        const msg = json.message;

        Utils.showAlertDialog('Sign In failed ', JSON.stringify(msg));
        // const msg = json.message;
        // setVisible(true);
        // setErrorMsg(msg);
        setLoading(false);
      }
    } catch (error) {
      // console.warn(error);
      // console.log(error);
      setLoading(false);

      Utils.netConnectionFaild();
    }
  };

  const gotToHome = token => {
    Token.storeToken(token);

    setSignInProgress(true);
    setTimeout(() => {
      //navi.navigate('tab', { screen: 'tab_home' });
      navi.dispatch(StackActions.replace('tab', { screen: 'tab_home' }));
      setSignInProgress(false);
    }, 1800);
  }

  return (
    <SafeAreaView style={{
      flex: 1,
      //justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      height: height,
    }}>

      <KeyboardAvoidingView
        style={{ ...styles.top, width: width }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'android' ? false : true}
      >
        <ScrollView showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            //flexGrow: 1,
            justifyContent: 'center',
            paddingTop: 10,
            paddingBottom: height * .1,
            backgroundColor: 'transparent',
          }}
        >
          <>
            <LogoHeader
              extraStyles={{
                marginBottom: height * .02,
                // backgroundColor: 'red',
              }}
            />
            <View style={styles.page}>
              <View style={{ alignItems: 'center' }}>
                {isAnimOn && (
                  <LottieView
                    autoPlay
                    ref={animation}
                    style={{
                      ...styles.animation,
                      position: theme?.name == 'Light' ? 'absolute' : 'static',
                    }}
                    // style={styles.animation}
                    source={require('../../assets/sign_up_animation.json')}
                    loop
                  />
                )}
              </View>

              <View>

                <ModalPoup
                  theme={theme}
                  visible={visible2}
                  title={errorMsg}
                  source={require('../../assets/sign_in_animation.json')}
                  btnTxt={'Ok'}
                  onPressOk={() => {
                    setVisible2(false);
                  }}
                  onPressClose={() => {
                    setVisible2(false);
                  }}
                />

                <View>
                  <View style={{
                    marginTop: 20,
                    //backgroundColor: 'red',
                  }}>
                    <View style={{ paddingBottom: 32, alignItems: 'center' }}>
                      <TextInput
                        value={formData.name}
                        placeholderTitle={'Full name'}
                        // icon={<EmailSVG />}
                        icon={theme?.profileIcon?.profile}
                        borderColor={theme?.textInput?.borderColor}
                        backgroundColor={theme?.textInput?.backgroundColor}
                        borderWidth={theme?.textInput?.borderWidth}
                        darkShadowColor={theme?.textInput?.darkShadowColor}
                        lightShadowColor={theme?.textInput?.lightShadowColor}
                        shadowOffset={theme?.textInput?.shadowOffset}
                        placeholderColor={theme?.textInput?.placeholderColor}
                        inputColor={theme?.textInput?.inputColor}
                        type={Platform.OS === 'ios' ? 'text' : 'url'}
                        onChangeText={value => {
                          console.log('name==: ' + value);
                          setData({ ...formData, name: value });
                        }}
                        cursorColor={theme.colors.borderColor}
                      />
                    </View>
                    <View style={{ paddingBottom: 32, alignItems: 'center' }}>
                      <TextInput
                        placeholderTitle={'Email'}
                        value={formData.email}
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
                        type='email'
                        onChangeText={value => {
                          console.log('email==: ' + value);
                          setData({ ...formData, email: value });
                        }}
                        cursorColor={theme.colors.borderColor}
                      />
                    </View>
                    <View style={{ paddingBottom: 37, alignItems: 'center' }}>
                      <PasswordInput
                        placeholderTitle={'Password'}
                        value={formData.pass}
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
                          console.log('password==: ' + value);
                          setData({ ...formData, pass: value });
                        }}
                        cursorColor={theme.colors.borderColor}
                        onFocus={() => {
                          console.log('Focused on Password in SignUp!')
                        }}
                      />
                    </View>

                  </View>
                  {/* {isLoading ? (
                <ActivityIndicator style={{ backgroundColor: 'coolGray.600' }} />
              ) : null} */}
                  <CustomButton
                    title={'Sign up'}
                    isLoading={isLoading}
                    disabled={isLoading}
                    onPress={() => {
                      global.isSignedIn = true;
                      console.log('Press Sign Up Button');
                      console.log('Name: ' + formData.name);
                      console.log('Email: ' + formData.email);
                      console.log('Password: ' + formData.pass);
                      console.log('Password Confirm: ' + formData.passConfirm);

                      requestForSignUp(
                        formData.name,
                        formData.email,
                        formData.pass,
                        formData.passConfirm,
                        deviceToken
                      );
                    }}
                    color={theme?.colors?.btnText}
                    colors={theme?.colors?.colors}
                    bordered={true}
                    borderWidth={theme?.name == 'Light' ? 0 : 3}
                    borderColors={theme?.colors?.borderColors}
                    borderColor={theme?.colors?.borderColor}
                    shadow={theme?.name == 'Light'}
                  />

                  <Text
                    style={{
                      textAlign: 'center',
                      paddingTop: 55,
                      marginBottom: 10,
                      color: theme?.colors?.textContrast,

                      fontFamily: theme?.font.body.fontFamily,
                      fontWeight: theme?.font.body.fontWeight,
                      fontSize: theme?.font.fontSize.m,
                    }}>
                    {' '}
                    Or Continue With
                  </Text>
                  <View style={{ flexDirection: 'row', marginBottom: 0, marginTop: 0, justifyContent: 'center' }}>
                    <TouchableOpacity
                      onPress={() => onGoogleSignInPress()}
                      accessibilityLabel='Login with google'
                    >
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
                        <GoogleLogoSVG />
                      </Neomorph>
                    </TouchableOpacity>
                    <View>
                      {Platform.OS == 'ios' && (

                        <TouchableOpacity
                          onPress={() => onAppleSignInPress()}
                          accessibilityLabel='Login with apple'
                        >
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
                  </View>
                  <View style={{ marginTop: 10, flexDirection: 'row', alignSelf: 'center' }}>
                    <Text
                      style={{
                        textAlign: 'center',
                        color: theme?.colors?.textContrast,
                        fontFamily: theme?.font.body.fontFamily,
                        fontWeight: theme?.font.body.fontWeight,
                        fontSize: theme?.font.fontSize.m,
                      }}>
                      {/* I'm already a user.{' '} */}
                      Already have an account?{' '}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        handlePress();
                      }}
                      style={{height: 48}}
                      >
                      <Text
                        style={{
                          textAlign: 'center',
                          color: theme?.colors?.textContrast,
                          fontFamily: theme?.font.body.fontFamily,
                          fontWeight: theme?.font.body.fontWeight,
                          fontSize: theme?.font.fontSize.m,
                        }}>
                        Signin{' '}
                      </Text>

                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* </ImageBackground> */}
    </SafeAreaView>
  );
};

export default ({ navigation }) => {
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    },
  );

  useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        // Restore token stored in `SecureStore` or any other encrypted storage
        // userToken = await SecureStore.getItemAsync('userToken');
      } catch (e) {
        // Restoring token failed
      }

      // After restoring token, we may need to validate it in production apps
      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };

    bootstrapAsync();
  }, []);
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
      <SignUpForm />
    </AuthContext.Provider>
  );
};
const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    justifyContent: 'center',
  },
  top: {
    padding: 0,
  },
  heading: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    paddingBottom: 25,
  },
  page: { alignItems: 'center' },
  animation: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff00',
    position: 'absolute',
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
});
