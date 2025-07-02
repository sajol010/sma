import LottieView from 'lottie-react-native';
import { Button } from 'native-base';
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground
} from 'react-native';
import ButtonComponentSmall from './ButtonComponentSmall.js';

import { Elegant } from '../../../styles/Theme';

const ModalPopupForBioLoginEnable = ({
  visible,
  title,
  source,
  msg,
  onPressClose,
  onSave,
  btnLoad = false,
  onCancel,
  theme = null,
}) => {
  const [showModal, setShowModal] = React.useState(visible);
  const [password, setPassword] = React.useState(null);
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const animation = useRef(null);
  React.useEffect(() => {
    toggleModal();
  }, [visible]);
  const toggleModal = () => {
    if (visible) {
      setPassword('');
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
      supportedOrientations={['portrait', 'landscape']}>
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
              <View style={styles.mainContainer}>
                <View style={styles.headerDialog}>
                  <TouchableOpacity onPress={onPressClose} style={styles.closeButton}>
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

              <View
                style={{
                  padding: 36,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 20,
                }}>

                <View style={{ ...styles.buttonContainer, minWidth: 50, }}>
                  {btnLoad ?
                    <ActivityIndicator color={theme?.name == 'Light' ? 'black' : 'white'} />
                    :
                    <ButtonComponentSmall
                      title={'Ok'}
                      color={theme?.colors?.btnText}
                      colors={theme?.colors?.colors}
                      bordered={true}
                      borderWidth={theme?.name == 'Light' ? 0 : 3}
                      borderColor={theme?.colors?.borderColor}
                      borderColors={theme?.colors?.borderColors}
                      shadow={theme?.name == 'Light'}
                      onPress={() => { onSave(password) }}
                    />
                  }
                </View>
              </View>
            </ImageBackground>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 'auto',
    // height: 50,
    // paddingBottom: 32,
    // width: '45%',
  },
  modalBackGround: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
    // backgroundColor: 'white',
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
  animation: {
    width: '100%',
    height: 170,
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
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 10,
    marginTop: 24,
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
    // /height: 10,
    //paddingHorizontal: 20,
    //paddingVertical: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'absolute',

    //backgroundColor: 'green'
  },
});

export default ModalPopupForBioLoginEnable;
