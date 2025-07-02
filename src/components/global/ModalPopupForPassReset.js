import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Text,
  ScrollView,
  TouchableOpacity,
  View,
  ImageBackground
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

import ButtonComponentSmall from './ButtonComponentSmall.js';

import { Elegant } from '../../../styles/Theme';
import InputPasswordModalComponent from '../../components/global/InputPasswordModalComponent.js';

import FailedGold from '../../../assets/gold/failedGold.svg';
import FailedRoseGold from '../../../assets/roseGold/failedRoseGold.svg';
import FailedElegant from '../../../assets/honey/failedElegant.svg';

import API_URLS from '../../Api';
import Token from '../../class/TokenManager';
import Utils from '../../class/Utils';

const ModalPopupForPassReset = ({
  visible,
  title,
  source,
  msg,
  onPressClose,
  onResetSuccess,
  onSave,
  saveBtnDisable = false,
  onCancel,
  theme = null,
  isLoading,
}) => {
  const [formData, setData] = React.useState({
    password: '',
    new_password: '',
    new_password_confirmation: '',
    is_logout_from_other_device: 0,
  });

  const [isPassFieldFocused, setIsPassFieldFocused] = useState(false)
  const [isNewPassFieldFocused, setIsNewPassFieldFocused] = useState(false)

  const [errorText, setErrorText] = useState('')
  const [isError, setIsError] = useState(false)

  const [resetPassLoading, setResetPassLoading] = useState(false);
  const [showModal, setShowModal] = React.useState(visible);

  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const animation = useRef(null);

  React.useEffect(() => {
    toggleModal();

    setData({
      password: '',
      new_password: '',
      new_password_confirmation: '',
      is_logout_from_other_device: 0,
    })

  }, [visible]);
  const toggleModal = () => {
    if (visible) {
      setShowModal(true);
      Animated.spring(scaleValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setTimeout(() => setShowModal(false), 200);
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const failedIconSvg = () => {
    if (theme.name === 'Gold') {
      return <FailedGold />;
    } else if (theme.name === 'RoseGold') {
      return <FailedRoseGold />;
    } else {
      return <FailedElegant />;
    }
  }

  const checkPasswords = async () => {
    if (formData.password !== '' && formData.new_password !== '') {
      // onSave()
      // console.log('here i am')
      if (formData.password === formData.new_password) {
        setIsError(true)
        setErrorText('Your old and new password are the same')
      } else {
        console.log("Reset Request body: " + JSON.stringify(formData));
        onResetPass(formData)
      }
    } else {
      setIsError(true)
      setErrorText('Please, fill all the fields ...')
    }
  }

  useEffect(() => {
    if (isNewPassFieldFocused && isPassFieldFocused) {
      if (formData.password.length === 0 || formData.new_password.length === 0) {
        setIsError(true)
        setErrorText('Please, fill all the fields ...')
      } else {
        setIsError(false)
      }
    }
  }, [formData, isNewPassFieldFocused, isPassFieldFocused])

  const onResetPass = async data => {
    console.log("Reset Password", data)
    let token = await Token.getToken();

    setResetPassLoading(true);

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setResetPassLoading(false);
      return
    }
    // setDisableCustomSwitch(false)
    try {
      var stateApi = API_URLS.RESET_PASS
      await fetch(stateApi, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'applicrun-androidation/json',
          Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
        },
        body: JSON.stringify(data),
      })
        .then(response => response.json())
        .then(responseJson => {
          try {
            let a = JSON.stringify(responseJson)
            let json = JSON.parse(a)

            // console.log("Reset Password resp: ", a);

            if (responseJson.status === 200) {
              onResetSuccess()

            } else {
              const msg = json.message;
              console.log('message after getting status code other than 200 ======>', msg)

              setErrorText(msg);
              setIsError(true);
            }
            setResetPassLoading(false);

          } catch (error) {
            setResetPassLoading(false)
            console.log(error)

          }
        })
        .catch(error => {

          console.warn(error)
          setResetPassLoading(false);

          Utils.netConnectionFaild();
        })
    } catch (error) {
      console.log(error)
      setResetPassLoading(false);
      Utils.netConnectionFaild();
    }
  }

  return (
    <Modal transparent visible={showModal}
      hardwareAccelerated={true}
      supportedOrientations={['portrait', 'landscape']} //, 'landscape'
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'android' ? false : true}
      >
        <View style={styles.modalBackGround}>
          <Animated.View
            style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}
          >
            <ScrollView>
              <ImageBackground
                source={Elegant.bg.bgImg}
                resizeMode="cover"
                style={styles.bgImage}
                imageStyle={{ borderRadius: 20 }}
              >
                {/* Cross Icon  */}
                <View style={styles.mainContainer}>
                  <View style={styles.headerDialog}>
                    <TouchableOpacity onPress={() => {

                      // setData({
                      //   password: '',
                      //   new_password: '',
                      //   new_password_confirmation: '',
                      //   is_logout_from_other_device: 0,
                      // })

                      onPressClose()
                      setIsError(null)
                      setErrorText('')
                      setIsPassFieldFocused(false)
                      setIsNewPassFieldFocused(false)
                    }} style={styles.closeButton}>
                      <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignSelf: 'center',
                      }}>
                        {theme?.controlIcon?.cross}
                      </View>
                    </TouchableOpacity>
                  </View>
                  <LottieView
                    autoPlay
                    ref={animation}
                    style={styles.animation}
                    source={source}
                    loop
                  />
                </View>
                <View style={{ alignItems: 'center' }}>
                </View>

                <Text style={{
                  ...styles.title,
                  color: theme?.name == 'Light' ? 'black' : 'white',

                  fontFamily: theme?.font.modalTitle.fontFamily,
                  fontWeight: theme?.font.modalTitle.fontWeight,
                  fontSize: theme?.font.modalTitle.fontSize
                }}
                >
                  {title}
                </Text>

                {msg &&
                  <Text style={{
                    ...styles.msg,
                    color: theme?.name == 'Light' ? 'black' : 'white',

                    fontFamily: theme?.font.modalBody.fontFamily,
                    fontWeight: theme?.font.modalBody.fontWeight,
                    fontSize: theme?.font.modalBody.fontSize
                  }}
                  >{msg}</Text>
                }

                <View>
                  <View style={{ paddingBottom: 20, alignItems: 'center' }}>
                    <InputPasswordModalComponent
                      onFocus={() => {
                        // setIsError(true)
                        setIsPassFieldFocused(true)
                      }}
                      placeholderTitle={'Old Password'}
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
                      customWidthRatio={0.6}
                      value={formData.password}
                      onChangeText={value => {
                        //console.log('password==: ' + value);
                        setData({ ...formData, password: value });
                      }}
                    />
                  </View>

                  <View style={{ paddingBottom: 20, alignItems: 'center' }}>
                    <InputPasswordModalComponent
                      onFocus={() => {
                        // setIsError(true)
                        setIsNewPassFieldFocused(true)
                      }}

                      placeholderTitle={'New Password'}
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
                      value={formData.new_password}
                      customWidthRatio={0.6}
                      onChangeText={value => {
                        // console.log('password==: ' + value);
                        setData({ ...formData, new_password: value, new_password_confirmation: value });
                        //setData({ ...formData, new_password_confirmation: value });
                      }}
                    />
                  </View>
                </View>

                {/* Error Fields added */}
                {isError && errorText !== '' &&
                  <View style={styles.errorFieldContainer}>
                    <View >
                      {failedIconSvg()}
                    </View>
                    <Text numberOfLines={2} style={{
                      ...styles.errorText,

                      fontFamily: theme?.font.modalBody.fontFamily,
                      fontWeight: theme?.font.modalBody.fontWeight,
                      fontSize: theme?.font.modalBody.fontSize
                    }}>{errorText}</Text>
                  </View>
                }

                <View style={styles.checkboxContainer}>
                  <CheckBox
                    disabled={false}
                    value={formData.is_logout_from_other_device === 1 ? true : false}
                    onValueChange={(newValue) => {
                      //setToggleCheckBox(newValue)
                      setData({ ...formData, is_logout_from_other_device: newValue ? 1 : 0 });
                    }}
                    tintColors={{ false: 'white', true: theme?.colors?.switch }}
                    tintColor={'white'}
                    boxType={'square'}
                    onFillColor={theme?.colors?.switch}
                    onTintColor={theme?.colors?.switch}
                    style={styles.checkbox}
                  />
                  <Text style={{
                    ...styles.label,

                    fontFamily: theme?.font.modalBody.fontFamily,
                    fontWeight: theme?.font.modalBody.fontWeight,
                    fontSize: theme?.font.modalBody.fontSize

                  }}>Logout from other devices</Text>
                </View>

                <View
                  style={{ paddingBottom: 36, paddingRight: 0, flexDirection: 'row', justifyContent: 'center', gap: 20 }}
                >

                  <View style={styles.buttonContainer}>
                    <ButtonComponentSmall
                      title={'Cancel'}
                      color={theme?.colors?.btnText}
                      colors={theme?.colors?.colors}
                      bordered={true}
                      borderWidth={theme?.name == 'Light' ? 0 : 3}
                      borderColor={theme?.colors?.borderColor}
                      borderColors={theme?.colors?.borderColors}
                      shadow={theme?.name == 'Light'}
                      onPress={() => {

                        onPressClose()
                        setErrorText('')
                        setIsError(false)
                        setIsPassFieldFocused(false)
                        setIsNewPassFieldFocused(false)

                        setData({ ...formData, is_logout_from_other_device: 0 });

                      }}
                    />
                  </View>

                  <View style={{ ...styles.buttonContainer, minWidth: 50 }}>

                    <ButtonComponentSmall
                      isLoading={resetPassLoading}
                      // title={saveBtnDisable ? <ActivityIndicator color={theme?.name == 'Light' ? 'black' : 'white'} /> : 'Save'}
                      title={'Save'}
                      color={theme?.colors?.btnText}
                      colors={theme?.colors?.colors}
                      bordered={true}
                      borderWidth={theme?.name == 'Light' ? 0 : 3}
                      borderColor={theme?.colors?.borderColor}
                      borderColors={theme?.colors?.borderColors}
                      shadow={theme?.name == 'Light'}
                      // onPress={() => { onSave(formData) }}
                      onPress={checkPasswords}
                    />
                  </View>
                </View>
              </ImageBackground>
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView >
    </Modal >
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    // marginTop: 'auto',
    marginBottom: 'auto',
    // height: 50,
    // paddingBottom: 32,
    // width: '45%',
  },
  bgImage: {
    // flex: 1,
    // justifyContent: 'center',
  },
  iconContainer: {
    // flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
  },
  modalBackGround: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 16,
  },
  modalContainer: {
    width: '80%',
    maxWidth: 500,
    //backgroundColor: 'white',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 20,
    elevation: 20,
  },
  mainContainer: {
    width: '100%',

    backgroundColor: 'transparent',
    // backgroundColor: 'white',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 20,
    elevation: 0,
  },
  checkbox: {
    alignSelf: 'center',
    height: 20,
    width: 20,

  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  label: {
    //margin: 6,
    paddingLeft: 10,
    alignContent: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: 'white',
  },
  animation: {
    width: 100,
    height: 100,
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#ffffff00',
  },
  header: {
    width: '100%',
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerImage: {
    height: 180,
    width: '100%',
    marginVertical: 0,
    // borderTopRightRadius: 20,
    // borderTopLeftRadius: 20,
    position: 'absolute',
  },
  closeButton: {
    zIndex: 100,
    //marginTop: 10,
    height: 55,
    width: 55,
    alignContent: 'center',
    justifyContent: 'center',
    tintColor: 'white',
    
    //backgroundColor: 'red'
  },
  title: {
    paddingLeft: 24,
    paddingRight: 24,
    marginBottom: 18,
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
    color: 'black',
    textAlign: 'center',
  },
  msg: {
    paddingLeft: 24,
    paddingRight: 24,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: 'black',
    textAlign: 'center',
  },
  headerDialog: {
    zIndex: 1,
    width: '100%',
    //height: 10,
    //paddingHorizontal: 20,
    //paddingVertical: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'absolute',
    
    //backgroundColor: 'green'
  },
  errorFieldContainer: {
    // backgroundColor: 'red',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 50, paddingRight: 50
    // paddingLeft: DIM.width * .069,
  },
  errorText: {
    //fontSize: 12,
    color: '#ff0000',
    marginTop: 10,
    marginLeft: 10,
  },
});

export default ModalPopupForPassReset;
