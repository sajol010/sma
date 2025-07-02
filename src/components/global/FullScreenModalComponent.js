import { React, useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  Animated,
  ImageBackground,
} from 'react-native';
import {
  Button
} from 'native-base';
import LottieView from 'lottie-react-native';
import CustomButton from '../../components/global/ButtonComponent.js';
import LottieBackground from './LottieBackground.js';


const ModalPoup = ({ visible, title, onPress, onBtnPress, source, text = null, showBtn = false, theme = null, bg= null }) => {
  const [showModal, setShowModal] = useState(visible);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const animation = useRef(null);
  useEffect(() => {
    toggleModal();
  }, [visible]);
  const toggleModal = () => {
    if (visible) {
      setShowModal(true);
      setTimeout(() => setShowModal(false), 1800);
      Animated.spring(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else {
      setTimeout(() => setShowModal(false), 200);
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };
  return (
    <Modal visible={showModal}>
      <ImageBackground
        source={bg?.type == 'image' ? bg?.file : bg?.transparentImg}
        // source={theme?.bg?.bgImg}
        resizeMode="cover"
        style={styles.bgImage}
      >
        {bg?.type == 'lottie' && <LottieBackground file={bg.file} />}

        <View style={styles.modalBackGround}>
          <Animated.View
            style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}>
            <View style={styles.modalContainer}>
              <LottieView
                autoPlay
                ref={animation}
                style={styles.animation}
                source={source}
                loop
              />
              <Text style={{ ...styles.titleText, color: theme?.name == 'Light' ? '#2E476E' : theme?.colors?.text }}>{title}</Text>
              {text && <Text style={{ ...styles.text, color: theme?.name == 'Light' ? '#2E476E' : 'white' }}>{text}</Text>}
            </View>

            {showBtn &&
              <CustomButton
                title={'Back To Home'}

                color={theme?.colors?.btnText}
                colors={theme?.colors?.colors}
                bordered={true}
                borderWidth={theme?.name == 'Light' ? 0 : 3}
                borderColor={theme?.colors?.borderColor}
                borderColors={theme?.colors?.borderColors}
                shadow={theme?.name == 'Light'}

                onPress={onBtnPress}
              />

              // <Button
              //   mt="2"
              //   mb="2"
              //   size="lg"
              //   width="full"
              //   height="16"
              //   shadow={'6'}
              //   colorScheme="blue"
              //   borderRadius={'3xl'}
              //   onPress={onBtnPress}
              // >
              //   <Text style={styles.btnText}>Back To Home</Text>
              // </Button>
            }

          </Animated.View>
        </View>
      </ImageBackground>
    </Modal>
  );
};
const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    justifyContent: 'center',
  },
  btnDiv: {
    marginTop: 5,
    // paddingHorizontal: 35,
  },
  btnText: {
    color: 'white',
    fontSize: 18,
  },
  modalBackGround: {
    flex: 1,
    // backgroundColor: 'white', // rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    width: '100%',
    padding: 10,
    justifyContent: 'center',
    // backgroundColor: 'white',
    // paddingHorizontal: 20,
    // paddingVertical: 30,
    // borderRadius: 20,
    elevation: 0,
  },
  animation: {
    width: '100%',
    height: 300,
    backgroundColor: '#ffffff00',
  },
  container: {
    // backgroundColor: 'red',
  },
  header: {
    width: '100%',
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  titleText: {
    marginVertical: 10,
    fontSize: 28,
    textAlign: 'center',
  },
  text: {
    marginVertical: 30,
    marginHorizontal: 50,
    fontSize: 15,
    textAlign: 'center',
  },
});

export default ModalPoup;
