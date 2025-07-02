import { useNavigation } from '@react-navigation/native';
import { React, useEffect, useState, useRef } from 'react';
import {
  StyleSheet, ImageBackground, Text, View, ScrollView, BackHandler
} from 'react-native';
import { useTheme } from '../../styles/ThemeProvider';
import LottieView from 'lottie-react-native';
import CustomButton from '../components/global/ButtonComponent.js';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateNdaSuccess({ type, isDraft, isShowSuccess = true }) {
  // export default function CreateNdaSuccess(navigation) {

  // const { type, isDraft } = navigation.route.params;
  console.log("isDraft==>", isDraft);
  console.log("type==>", type);
  const { theme } = useTheme();
  const navi = useNavigation();
  const animation = useRef(null);

  const [showModal_1, setShowModal_1] = useState(true);
  const [showModal_2, setShowModal_2] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      // console.log("setTimeout==> called");

      setShowModal_1(false);
 
      // setShowModal_2(true);
    }, 3000);
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => backHandler.remove()
  }, [])


  const onBtnPress = () => {
    // console.log("btnPress==> called");
    navi.navigate('tab_home', { screen: 'home' });
  };

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'transparent',
    }}>
      <SafeAreaView>
        <ScrollView>
          <>
            {!isShowSuccess ? (<LottieView
              autoPlay
              ref={animation}
              style={styles.animation}
              source={type == 'sender' ? require('../../assets/creatingNda.json') : require('../../assets/sendingNda.json')}
              loop
            />)
            :
            <View>
              {showModal_1 ?
                <LottieView
                  autoPlay
                  ref={animation}
                  style={styles.animation}
                  source={type == 'sender' ? require('../../assets/creatingNda.json') : require('../../assets/sendingNda.json')}
                  loop
                />
                :
                <View style={styles?.container}>
                  {type == 'sender' ?
                    <LottieView
                      autoPlay
                      ref={animation}
                      style={styles.animation}
                      source={require('../../assets/mailSent.json')}
                      loop
                    />
                    :
                    <LottieView
                      autoPlay
                      ref={animation}
                      style={styles.animation}
                      source={require('../../assets/nda_complete.json')}
                      loop
                    />
                  }

                  <Text
                    style={{
                      ...styles.titleText,
                      color: theme?.colors?.textContrast,
                      paddingHorizontal: 30,
                      lineHeight: 40,
                    }}
                  >
                    {type == 'sender' ? isDraft ? 'Saved as draft Successfully' : 'Shushing' : 'Signed Successfully'}
                  </Text>

                  <Text
                    style={{
                      ...styles.text,
                      color: theme?.colors?.textContrast,
                    }}
                  >
                    {type == 'sender' ? isDraft ? '' : 'We will notify you once it’s signed' : 'We will notify Sender'}
                  </Text>

                  <View style={{ marginBottom: 30, zIndex: 10000 }}>
                    <CustomButton
                      title={'Home'}
                      // title={'Back To Home'}

                      color={theme?.colors?.btnText}
                      colors={theme?.colors?.colors}
                      bordered={true}
                      borderWidth={theme?.name == 'Light' ? 0 : 3}
                      borderColor={theme?.colors?.borderColor}
                      borderColors={theme?.colors?.borderColors}
                      shadow={theme?.name == 'Light'}

                      onPress={onBtnPress}
                    />
                  </View>

                </View>
              }
            </View>}
          </>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: 300,
    backgroundColor: '#ffffff00',
  },
  container: {
    flex: 1,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
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
