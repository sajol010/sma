import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  ImageBackground,
} from 'react-native';
import LottieView from 'lottie-react-native';
import ButtonComponentSmall from './ButtonComponentSmall.js';

import { Elegant } from '../../../styles/Theme.js';


const ModalPopupNewNda = ({ visible, title, source, msg, onPressClose, onPressOk, okText, cancelText, isLoading, theme = null, customImg = null, showCustom = false }) => {
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
    >
      <View style={styles.modalBackGround}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}>
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
                fontSize: theme?.font.modalBody.fontSize,
                fontWeight: 'bold'

              }}>{msg}</Text>
            }

            <View style={{ padding: 22, flexDirection: 'row', justifyContent: 'center', gap: 20 }}
            >
              {cancelText && <ButtonComponentSmall
                title={cancelText || 'Cancel'}
                color={theme?.colors?.btnText}
                colors={theme?.colors?.colors}
                bordered={true}
                borderWidth={theme?.name == 'Light' ? 0 : 3}
                borderColor={theme?.colors?.borderColor}
                borderColors={theme?.colors?.borderColors}
                shadow={theme?.name == 'Light'}
                onPress={onPressClose}
              // colors={['#808080', '#808080', '#808080']}
              />}
              {/* <View style={{ width: '45%' }}> */}
              <ButtonComponentSmall
                title={okText || 'Delete'}
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
              />
              {/* </View> */}
            </View>
          </ImageBackground>
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
    backgroundColor: 'transparent',
    //backgroundColor: 'white',
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
    //paddingTop: 30,
    height: 55,
    width: 55,
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
    paddingBottom: 8,
    //fontSize: 15,
    //fontFamily: 'Poppins-Regular',
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
});

export default ModalPopupNewNda;
