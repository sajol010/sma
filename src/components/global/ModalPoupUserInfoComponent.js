import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
  ImageBackground,
  Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { BlurView } from '@react-native-community/blur';
import FastImage from 'react-native-fast-image';
import ButtonComponentSmall from './ButtonComponentSmall.js';

import { Elegant } from '../../../styles/Theme.js';

const ModalPopupConfirmation = ({ visible, title, source, msg, name, email, phone, address, address_full, onPressClose, onPressOk, okText, cancelText, isLoading, theme = null, customImg = null, showCustom = false }) => {
  const [showModal, setShowModal] = React.useState(visible);
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const animation = useRef(null);
  React.useEffect(() => {
    toggleModal();
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
  return (
    <Modal transparent visible={showModal}
      hardwareAccelerated={true}
      supportedOrientations={['portrait', 'landscape']} //, 'landscape'
    >
      <View style={styles.modalBackGround}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}>
          <ScrollView>
            <ImageBackground
              source={Elegant.bg.bgImg}
              resizeMode="cover"
              imageStyle={{ borderRadius: 20 }}
              style={styles.bgImage}
            >

              <View style={styles.mainContainer}>
                {!customImg &&
                  <View style={styles.headerDialog}>
                    <TouchableOpacity onPress={onPressClose} style={{ ...styles.closeButton }}>
                      <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignSelf: 'center',
                      }}>
                        {theme?.controlIcon?.cross}
                      </View>
                    </TouchableOpacity>
                  </View>
                }

                {!customImg && !showCustom && source &&
                  <LottieView
                    autoPlay
                    ref={animation}
                    style={styles.animation}
                    source={source} //|| require('../../../assets/warning.json')
                    loop
                  />
                }
              </View>

              {customImg &&
                <View style={{ alignItems: 'center' }}>
                  <Image
                    source={{ uri: customImg }}
                    style={{ height: 72, width: 72, marginVertical: 20 }}
                  />
                </View>
              }

              {title && <Text style={{
                ...styles.title,
                color: theme?.name == 'Light' ? 'black' : 'white',

                paddingTop: 20,
                alignSelf: 'center',
                fontFamily: theme?.font.modalTitle.fontFamily,
                fontWeight: theme?.font.modalTitle.fontWeight,
                fontSize: theme?.font.modalTitle.fontSize
              }}
              >
                {title}
              </Text>}

              {msg &&
                <Text style={{
                  ...styles.msg,
                  color: theme?.name == 'Light' ? 'black' : 'white',

                  fontFamily: theme?.font.modalBody.fontFamily,
                  fontWeight: theme?.font.modalBody.fontWeight,
                  fontSize: theme?.font.modalBody.fontSize

                }}>{msg}</Text>
              }

              <View >
                <View style={[styles.profileInfo, {
                  borderColor: theme.nav.borderColor,
                }]}>
                  <BlurView
                    style={styles.absolute}
                    blurType="thinMaterialDark"
                    blurAmount={Platform.OS === 'ios' ? 15 : 15}
                    reducedTransparencyFallbackColor="white"
                  />

                  {/* Name */}
                  <View
                    style={{ ...styles.infoDiv, marginTop: 10 }}>
                    {theme?.profileIcon?.profile}
                    <View style={styles.valueDiv}>

                      <Text
                        style={{
                          ...styles.type,
                          color: 'white',

                          fontFamily: theme?.font.body.fontFamily,
                          fontWeight: theme?.font.body.fontWeight,
                          fontSize: theme?.font.fontSize.s
                        }}>
                        {name ? name : 'empty'}
                      </Text>
                    </View>
                  </View>

                  {/* Email */}
                  <View
                    style={{ ...styles.infoDiv, marginTop: 20 }}>
                    {theme?.profileIcon?.email}
                    <View style={styles.valueDiv}>

                      <Text
                        style={{
                          ...styles.type,
                          color: 'white',

                          fontFamily: theme?.font.body.fontFamily,
                          fontWeight: theme?.font.body.fontWeight,
                          fontSize: theme?.font.fontSize.s
                        }}>
                        {email ? email : 'empty'}
                      </Text>
                    </View>
                  </View>

                  {/*  Phone */}
                  <View
                    style={{ ...styles.infoDiv, marginTop: 20 }}>
                    {theme?.profileIcon?.phone}
                    <View style={styles.valueDiv}>

                      <Text
                        style={{
                          ...styles.type,
                          color: 'white',

                          fontFamily: theme?.font.body.fontFamily,
                          fontWeight: theme?.font.body.fontWeight,
                          fontSize: theme?.font.fontSize.s
                        }}>
                        {phone ? phone : 'empty'}
                      </Text>
                    </View>
                  </View>

                  {/*  Address */}
                  <View
                    style={{ ...styles.infoDiv, marginTop: 20 }}>
                    {theme?.profileIcon?.location}
                    <View style={styles.valueDiv}>

                      <Text
                        style={{
                          ...styles.type,
                          color: 'white',

                          fontFamily: theme?.font.body.fontFamily,
                          fontWeight: theme?.font.body.fontWeight,
                          fontSize: theme?.font.fontSize.s
                        }}>
                        {address ? address + '\n' + address_full : 'empty'}
                      </Text>


                      {/* <Text
                        style={{
                          ...styles.type,
                          color: 'white',

                          fontFamily: theme?.font.body.fontFamily,
                          fontWeight: theme?.font.body.fontWeight,
                          fontSize: theme?.font.fontSize.s
                        }}>
                        {address && address_full}
                      </Text> */}
                    </View>
                  </View>


                </View>
              </View>
              <View style={{ padding: 22, flexDirection: 'row', justifyContent: 'center', gap: 20 }}
              >
                <ButtonComponentSmall
                  title={cancelText || 'Close'}
                  color={theme?.colors?.btnText}
                  colors={theme?.colors?.colors}
                  bordered={true}
                  borderWidth={theme?.name == 'Light' ? 0 : 3}
                  borderColor={theme?.colors?.borderColor}
                  borderColors={theme?.colors?.borderColors}
                  shadow={theme?.name == 'Light'}
                  onPress={onPressClose}
                // colors={['#808080', '#808080', '#808080']}
                />
                {/* <View style={{ width: '45%' }}> */}
                {/* <ButtonComponentSmall
                title={okText || 'OK'}
                color={theme?.colors?.btnText}
                colors={theme?.colors?.colors}
                bordered={true}
                borderWidth={theme?.name == 'Light' ? 0 : 3}
                borderColor={theme?.colors?.borderColor}
                borderColors={theme?.colors?.borderColors}
                shadow={theme?.name == 'Light'}
                // colors={['#FD371F', '#FD371F', '#FD371F']}
                disabled={isLoading}
                isLoading={isLoading}
                onPress={onPressOk}
              /> */}
                {/* </View> */}
              </View>
            </ImageBackground>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bgImage: {
    // flex: 1,
    // justifyContent: 'center',
    // borderRadius: 20,
  },
  modalBackGround: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',


  },
  modalContainer: {
    width: '80%',
    maxWidth: 500,
    // backgroundColor: 'white',
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
  animation: {
    width: '100%',
    height: 80,
    marginTop: 20,
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
    marginTop: 20,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 10,
    //fontSize: 15,
    //fontWeight: 'bold',
    //fontFamily: 'Poppins-Regular',
    color: 'black',
    textAlign: 'center',

  },
  msg: {
    paddingLeft: 24,
    paddingRight: 24,
    //fontSize: 15,
    //fontFamily: 'Poppins-Regular',
    color: 'black',
    textAlign: 'center',
  },

  headerDialog: {
    zIndex: 1,
    width: '100%',
   // height: 10,
    //paddingHorizontal: 20,
    //paddingVertical: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'absolute',

    //backgroundColor: 'green'
  },

  avatar: {
    alignSelf: 'center',
    zIndex: 1,
  },
  absolute: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  profileInfo: {
    borderWidth: 4,
    padding: 30,
    borderRadius: 8,
    marginTop: 40,
    marginHorizontal: 20,
    // borderColor: 'gray',
    //height: ,
    //width: '100%',// Dimensions.get('window').width * 0.85,
    //backgroundColor: 'red',
    overflow: 'hidden',
  },
  infoDiv: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueDiv: {
    marginStart: 20,
  },
  type: {
    fontSize: 14,
  },
  direction: {
    marginTop: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  middleDive: {
    // paddingVertical: 250,
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 7,
  },
  buttonContainer2: {
    // width: '90%',
    // paddingRight: 10,
    // paddingVertical: 1,
  },
  // bgImage: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   // position: 'absolute',
  //   // width: '100%',
  //   // height: '100%',
  // },
  container: {
    flex: 1,
    //paddingTop: globalStyle.topPadding,
    // backgroundColor: globalStyle.statusBarColor,
    // backgroundColor: 'red',
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 6,
    height: 117,
    width: 97,
    margin: 10,
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 500,
    textAlign: 'center',
    // marginStart: 24,
    // marginTop: 16,
    // marginBottom: 16,
  },
  item: {
    marginStart: 5,
    marginTop: 16,
    marginBottom: 16,
    fontSize: 15,
    // color: '#2E476E',
  },
  line: {
    borderBottomColor: '#c0c0c0',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    paddingLeft: 20, // add left padding here
  },
  flexIt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arrowCss: {
    marginTop: 16,
    paddingRight: 50,
  },
  planDiv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },


  iconDiv: {
    // backgroundColor: '#3D50DF',
    height: 60,
    width: 60,
    borderRadius: 50,
    // padding: 5,
    marginEnd: 5,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconDiv2: {
    // backgroundColor: 'gray',
    // backgroundColor: '#3D50DF',
    height: 30,
    width: 30,
    borderRadius: 50,
  },
  editDiv: {
    flexDirection: 'row',
    marginStart: 32,
    marginBottom: 20,
    marginTop: 20,
    alignItems: 'center',
  },
});

export default ModalPopupConfirmation;
