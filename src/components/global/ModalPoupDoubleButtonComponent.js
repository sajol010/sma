import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  ImageBackground,
  ScrollView
} from 'react-native';

import { PageIndicator } from 'react-native-page-indicator';

import CustomButton from './ButtonComponent.js'
import ButtonComponentSmall from './ButtonComponentSmall.js';

import { Elegant } from '../../../styles/Theme.js';
import CONSTANTS from '../../Constants.js';

const ModalPoup = ({ visible, title, type, source, msg, onPressOk, onPressClose, theme = null }) => {
  const [showModal, setShowModal] = React.useState(visible);
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const [currentWindow, setCurrentWindow] = useState(type);

  const animation = useRef(null);
  React.useEffect(() => {
    toggleModal();
  }, [visible, type]);
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
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={() => {
        console.log('onRequestClose');
        onPressClose();
        //onBackClick();
      }}>
      <View style={styles.modalBackGround}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}
        >
          <ScrollView>
            <ImageBackground
              source={Elegant.bg.bgImg}
              resizeMode="cover"
              imageStyle={{ borderRadius: 20 }}
              style={styles.bgImage}
            >
              <View style={{}}>
                <View style={{ ...styles.mainContainer }}>
                  <View style={{ ...styles.headerDialog }}>
                    <View style={{ height: 55, width: 55, }}><Text></Text></View>

                    <TouchableOpacity
                      onPress={onPressClose}
                      style={{ ...styles.closeButton }}
                      accessibilityLabel='close setup profile'
                    >

                      <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignSelf: 'center',
                      }}>
                        {theme?.controlIcon?.cross}
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={{
                    //backgroundColor: 'red',
                    //height: 55,
                    alignContent: 'center',
                    alignItems: 'center',
                    //justifyContent: 'center',
                  }}>
                    {/* //              currentWindow === 'splash' ||
                  currentWindow === 'profile_set_intro' ||
                  currentWindow === 'shushable_btn' ||
                  currentWindow === 'shush_pricing' ||
                  currentWindow === 'shush_it_intro' ||
                  currentWindow === 'shush_recipient_info' ||
                  currentWindow === 'shush_sign_and_send' */}
                    <Text style={{
                      paddingLeft: 24,
                      paddingRight: 24,

                      color: theme?.name == 'Light' ? 'black' : 'white',

                      textAlign: 'center',

                      fontFamily: theme?.font.modalTitle.fontFamily,
                      fontWeight: currentWindow === 'ndaDescription' ? 'bold' : 'normal',
                      fontSize: theme?.font.modalTitle.fontSize
                    }}>{currentWindow === 'ndaDescription' ? 'Welcome' :
                        currentWindow === 'splash' ? 'How to create NDA using Shush Privacy APP' :
                          currentWindow === 'profile_set_intro' ? 'Setup your Profile first after finishing the tutorial' :
                          currentWindow === 'shushable_btn' ? 'Go to account from navbar & click Shushable for Purchase NDA’s Quantity' :
                          currentWindow === 'shush_pricing' ? 'Choose your preferable Plan' :
                            currentWindow === 'shush_it_intro' ? 'Click on “SHUSH IT” Button from Home page' :
                              currentWindow === 'shush_recipient_info' ? 'Fill recipient details and press the forward button ' :
                                currentWindow === 'shush_sign_and_send' ? 'From these action buttons you can view , save the draft or sign & send the NDA to recipient' :
                                  ''} </Text>
                  </View>

                  <View style={{ height: 220 }}>
                    {/* //Dialog container */}

                    {currentWindow === 'ndaDescription' && (<View>
                      <ScrollView>

                        <Text style={{
                          paddingLeft: 24,
                          paddingRight: 24,
                          //backgroundColor: 'green',
                          paddingVertical: 10,

                          color: theme?.name == 'Light' ? 'black' : 'white',

                          fontFamily: theme?.font.modalTitle.fontFamily,
                          //fontWeight: theme?.font.modalBody.fontWeight,
                          fontSize: theme?.font.fontSize.l
                        }}>{'What is NDA?'} </Text>
                        <Text style={{
                          // ...styles.msg,

                          paddingLeft: 24,
                          paddingRight: 24,
                          //fontSize: 15,
                          //fontFamily: 'Poppins-Regular',
                          //color: 'black',
                          textAlign: 'justify',

                          color: theme?.name == 'Light' ? 'black' : 'white',

                          fontFamily: theme?.font.modalBody.fontFamily,
                          fontWeight: theme?.font.modalBody.fontWeight,
                          fontSize: theme?.font.modalBody.fontSize,


                        }}>{CONSTANTS.MESSAGE.NDA_DESCRIPTION}</Text>
                      </ScrollView>
                    </View>)}

                    {currentWindow === 'splash' && (<View>

                      <Image
                        source={require('../../../assets/appDemo/splash_prev.png')}
                        style={{
                          width: 150,
                          height: 190,
                          alignSelf: 'center',
                          marginVertical: 20,

                        }}
                      />

                    </View>)}


                    {currentWindow === 'profile_set_intro' && (<View>

                      <Image
                        source={require('../../../assets/appDemo/shush_set_profile.png')}
                        style={{
                          width: 120,
                          height: 190,
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: 10,

                        }}
                      />

                    </View>)}
                    {currentWindow === 'shushable_btn' && (<View>

                      <Image
                        source={require('../../../assets/appDemo/shush_shushable.png')}
                        style={{
                          width: 100,
                          height: 205,
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: 10,

                        }}
                      />

                    </View>)}
                    {currentWindow === 'shush_pricing' && (<View>

                      <Image
                        source={require('../../../assets/appDemo/shush_pricing.png')}
                        style={{
                          width: 100,
                          height: 205,
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: 10,

                        }}
                      />

                    </View>)}
                    {currentWindow === 'shush_it_intro' && (<View>

                      <Image
                        source={require('../../../assets/appDemo/shush_shush_it.png')}
                        style={{
                          width: 100,
                          height: 205,
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: 10,

                        }}
                      />

                    </View>)}
                    {currentWindow === 'shush_recipient_info' && (<View>

                      <Image
                        source={require('../../../assets/appDemo/shush_recipient_info.png')}
                        style={{
                          width: 100,
                          height: 205,
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: 10,

                        }}
                      />

                    </View>)}
                    {currentWindow === 'shush_sign_and_send' && (<View>

                      <Image
                        source={require('../../../assets/appDemo/shush_sign_and_send.png')}
                        style={{
                          width: 100,
                          height: 205,
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: 10,

                        }}
                      />

                    </View>)}

                    {currentWindow === 'profile' && (<View >

                      <View style={{
                        alignItems: 'center',

                        marginBottom: 20,
                      }}>
                        {theme?.ModalUserIcon?.userIcon}
                      </View>

                      <Text style={{
                        ...styles.title,
                        marginBottom: 20,
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
                    </View>)}
                    {/* 
                  {currentWindow === 'appTour' && (<View>

                    <Video
                      source={appDemo}
                      style={styles.backgroundVideo}
                      muted={true}
                      repeat={false}
                      //control={false}
                      //paused={isPauseBgVideo}
                      //autoplay={true}
                      //sleep={true}
                      preventsDisplaySleepDuringVideoPlayback={false}
                      pictureInPicture={false}
                      playWhenInactive={false}
                      //playInBackground={true}

                      resizeMode={"cover"}
                    />
                  </View>)} */}
                  </View>
                </View>
              </View>

              {/* //  bototm button */}
              <View style={{
                paddingBottom: 10,
                flexDirection: 'row',
                gap: 20,
                justifyContent: 'center',
                // backgroundColor: 'pink'
              }}>
                {currentWindow === 'profile' && (
                  <View style={{ paddingBottom: 10 }}>
                    <CustomButton
                      title={'Continue'}

                      color={theme?.colors?.btnText}
                      colors={theme?.colors?.colors}
                      bordered={true}
                      borderWidth={theme?.name == 'Light' ? 0 : 3}
                      borderColor={theme?.colors?.borderColor}
                      borderColors={theme?.colors?.borderColors}
                      shadow={theme?.name == 'Light'}

                      onPress={() => {
                        //global.isSignedIn = true;
                        onPressOk();
                        console.log('Press upgrade Button');
                      }}
                    />
                  </View>)}

                {(currentWindow === 'ndaDescription' ||
                  currentWindow === 'splash' ||
                  currentWindow === 'profile_set_intro' ||
                  currentWindow === 'shushable_btn' ||
                  currentWindow === 'shush_pricing' ||
                  currentWindow === 'shush_it_intro' ||
                  currentWindow === 'shush_recipient_info' ||
                  currentWindow === 'shush_sign_and_send'

                ) && (
                    <View style={{ paddingBottom: 18, flexDirection: 'row', gap: 20 }}>
                      <ButtonComponentSmall
                        title={'Skip'}
                        color={theme?.colors?.btnText}
                        colors={theme?.colors?.colors}
                        wideRatio={0.25}
                        bordered={true}
                        borderWidth={theme?.name == 'Light' ? 0 : 3}
                        borderColor={theme?.colors?.borderColor}
                        borderColors={theme?.colors?.borderColors}
                        shadow={theme?.name == 'Light'}
                        onPress={() => {
                          // if (currentWindow === 'appTour') {
                          //   setCurrentWindow('ndaDescription');
                          // } else if (currentWindow === 'profile') {
                          //   setCurrentWindow('appTour');
                          // } else if (currentWindow === 'ndaDescription') {
                          //   onPressClose();
                          // }

                          onPressClose();
                        }}
                      />

                      <ButtonComponentSmall
                        isLoading={false}
                        // title={saveBtnDisable ? <ActivityIndicator color={theme?.name == 'Light' ? 'black' : 'white'} /> : 'Save'}
                        title={'Continue'} //currentWindow === 'profile' ? 'Continue' : 'Next'
                        color={theme?.colors?.btnText}
                        colors={theme?.colors?.colors}
                        wideRatio={0.25}
                        bordered={true}
                        borderWidth={theme?.name == 'Light' ? 0 : 3}
                        borderColor={theme?.colors?.borderColor}
                        borderColors={theme?.colors?.borderColors}
                        shadow={theme?.name == 'Light'}
                        onPress={() => {
                          //setCurrentWindow('appTour');
                          //setCurrentWindow('ndaDescription');

                          if (currentWindow === 'ndaDescription') {
                            setCurrentWindow('splash');
                          } else if (currentWindow === 'splash') {
                            setCurrentWindow('profile_set_intro');
                          } else if (currentWindow === 'profile_set_intro') {
                            setCurrentWindow('shushable_btn');
                          } else if (currentWindow === 'shushable_btn') {
                            setCurrentWindow('shush_pricing');
                          } else if (currentWindow === 'shush_pricing') {
                            setCurrentWindow('shush_it_intro');
                          } else if (currentWindow === 'shush_it_intro') {
                            setCurrentWindow('shush_recipient_info');
                          } else if (currentWindow === 'shush_recipient_info') {
                            setCurrentWindow('shush_sign_and_send');
                          } else {
                            setCurrentWindow('profile');
                          }
                          //onSave(formData)
                        }}
                      //onPress={checkPasswords}
                      />
                    </View>
                  )}
              </View>
            </ImageBackground>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal >
  );
};

const styles = StyleSheet.create({
  modalBackGround: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    maxWidth: 500,
    backgroundColor: 'transparent',
    //backgroundColor: 'white',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 20,
    elevation: 20,
  },
  bgImage: {
    borderRadius: 20,
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
    height: 200,
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
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    position: 'absolute',
  },
  closeButton: {
    zIndex: 100,
    //marginTop: 8,  
    height: 55,
    width: 55,
    alignContent: 'center',
    //justifyContent: 'center',
    tintColor: 'white',
    //backgroundColor: 'red'
  },
  backgroundVideo: {
    //position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    alignContent: 'center',
    alignSelf: 'center',
    width: '45%',
    height: '100%',

  },
  title: {
    paddingLeft: 24,
    paddingRight: 24,
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
    color: 'black',
    textAlign: 'center'
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
    //alignItems: 'space-between',
    justifyContent: 'space-between', // 'center',
    //position: 'absolute',
    flexDirection: 'row'
    // backgroundColor: 'green'
  },
});

export default ModalPoup;
