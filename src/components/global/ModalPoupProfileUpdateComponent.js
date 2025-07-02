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


const ModalPoupProfileUpdateComponent = ({ visible, title, source, msg, onPressOk, onPressClose, theme = null }) => {
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
                  <View style={{
                    //backgroundColor: 'red',
                    height: 55,
                    justifyContent: 'center',
                  }}>
                    <Text style={{
                      paddingLeft: 24,
                      paddingRight: 24,
                      //backgroundColor: 'green',

                      color: theme?.name == 'Light' ? 'black' : 'white',

                      fontFamily: theme?.font.modalTitle.fontFamily,
                      fontWeight: theme?.font.modalTitle.fontWeight,
                      fontSize: theme?.font.modalTitle.fontSize
                    }}>
                    </Text>
                  </View>
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

                {/* //Dialog container */}

                <View>

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
              </View>
            </View>
          </ImageBackground>
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
    justifyContent: 'center',
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
    //alignItems: 'flex-end',
    alignItems: 'space-between',
    justifyContent: 'space-between', // 'center',
    //position: 'absolute',
    flexDirection: 'row'
    // backgroundColor: 'green'
  },
});

export default ModalPoupProfileUpdateComponent;
