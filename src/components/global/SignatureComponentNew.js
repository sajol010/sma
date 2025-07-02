import { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  useWindowDimensions,
  Platform
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas'; //Signature 
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../styles/ThemeProvider';
import Toast from 'react-native-toast-message';
import LogoHeader from './LogoHeader';


const SignatureComponentNew = ({
  signatureValue,
  onBackClick,
  getSignature,
  setRotateSign,
  descriptionText,
  clearText,
  confirmText,
}) => {
  const ref = useRef();
  const { theme } = useTheme();
  const [btnLoad, setBtnLoad] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const { height, width, scale, fontScale } = useWindowDimensions();
  const [isRotate, setIsRotate] = useState(false);


  const [isSigReload, setSigReload] = useState(true);
  // console.log("called ===>", signatureValue+ ' <<<<<<<<<<<<<<<<<<<< ====');

  useEffect(() => {
    if (signatureValue) {
      setShowSignaturePad(false)
    } else {
      setShowSignaturePad(true)
    }
  }, [signatureValue])


  useEffect(() => {
    if (showSignaturePad) {
      if (Platform.OS === 'ios') {
        setIsRotate(true);
        console.log('Use effect: isSaveCurrent: ' + isRotate);
        ref.current?.readSignature();
      } else if (Platform.OS === 'android') {
        setIsRotate(true);
        console.log('Use effect: isSaveCurrent: ' + isRotate);
        ref.current?.readSignature();
      }
    }

    console.log('Height: ' + height + " Width: " + width)

  }, [width, height])

  const handleOnSave = () => {
    console.log('signature save ==>: ');
    if (showSignaturePad) {
      ref.current?.readSignature();
    } else {
      handleSignature()
    }
    //setBtnLoad(true);
  };

  const handleSignature = signature => {
    console.log('handleSignature signature==>: ' + isRotate);
    if (isRotate) {
      setRotateSign(signature).then(() => {
        setBtnLoad(false);
      });
    } else {
      setBtnLoad(true);
      getSignature(signature).then(() => {
        setBtnLoad(false);
      });
    }

    // setBtnLoad(true);
    // getSignature(signature).then(() => {
    //   setBtnLoad(false);
    // });
    setIsRotate(false);
  };

  const style = `
  // .m-signature-pad--footer {display: none; margin: 0px;}

  .m-signature-pad--footer{display: none;}
  .save {
      display: none;
  }
  .clear {
      display: none;
  }
  .description {
    font-size: 18px !important;
    margin: auto;
    margin-top: 0px;
    color: black !important;
    font-weight: bold !important;
  }
  
  .m-signature-pad {
    //position: absolute;
    font-size: 10px;
    //width: 100%;
    //height: 900px;

    //width: 355px;
    //height: 100px;

    //width: 100%;
    height: ${height > width ? height * 0.23 : height < 500 ? height * 0.6 : height * 0.3}px;

    // top: 50%;
    // left: 50%;
    //margin-left: -350px;
    //margin-right: -350px;
    margin-left: 0px;
    margin-top:  0px;
    //margin-right: 50px;

    //margin-top: 200px;
    //border: 1px dashed ${theme?.name == 'Light' ? "black" : 'transparent'};
    //border: 10px solid #e8e8e8;
    background-color: white;
    box-shadow: none;
    // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.27), 0 0 40px rgba(0, 0, 0, 0.08) inset;
  }

  .m-signature-pad--body {
    border-bottom: 1px dashed gray;
  }
  `;

  return (
    <SafeAreaView style={{
      flex: (height > 500) ? 1 : 0,
      // justifyContent: 'center',
      backgroundColor: 'transparent',
    }}>
      {width < height && (<LogoHeader />)}

      {/* <ScrollView
          horizontal={false}
          style={styles.categoryListContainer}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingBottom: 70,
            //backgroundColor: 'red'
          }}> */}
      <View style={{
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: 70,

        marginTop: 'auto',
        marginBottom: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',

        //backgroundColor: 'red'
      }}>
        <Text
          style={{
            //fontSize: 25,
            color: theme?.colors?.textContrast,
            textAlign: "center",
            marginTop: 0,
            marginBottom: (height < width && height < 500) ? 0 : 40,
            fontFamily: theme?.font.body.fontFamily,
            fontWeight: theme?.font.body.fontWeight,
            fontSize: theme?.font.fontSize.xxl,

          }}
        >
          Add Signature
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {height < width && height < 500 && (
            <TouchableOpacity
              onPress={() => onBackClick()}
              style={{
                zIndex: 1,
                alignSelf: 'flex-end',
                bottom: 0,

              }}>
              {theme?.profileIcon?.backward}
            </TouchableOpacity>
          )}

          {!showSignaturePad && signatureValue ?
            <View style={{
              ...styles.container,
              //width: height > width ? width * 0.3: width * 0.3,
              // height: height > width ? height * 0.2 : height * 0.3
            }}>
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: signatureValue,
                  }}
                  fallbackSource={{
                    uri: 'https://www.w3schools.com/css/img_lights.jpg',
                  }}
                  style={{
                    ...styles.profilePic,
                    // width: height > width ? width * 0.8: width * 0.3,
                    // height: height > width ? height * 0.2 : height * 0.3
                    width: height > width ? height * 0.23 * 1.755 : height < 500 ? height * 0.6 * 1.755 : height * 0.3 * 1.755,
                    height: height > width ? height * 0.23 : height < 500 ? height * 0.6 : height * 0.3,
                    //maxHeight: 300,

                  }}
                  //maxWidth: 500,
                  //aspectRatio={1.775}
                  //aspectRatio={2}
                  alt=""

                  //size="xl"
                  //resizeMode="cover"
                  //resizeMethod='scale'
                  resizeMode='stretch'

                //resizeMethod='resize'
                />
                <TouchableOpacity
                  style={{
                    zIndex: 1,
                    alignSelf: 'center',
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                  }}
                  onPress={() => {
                    if (showSignaturePad) {
                      ref.current.clearSignature();
                    } else {
                      setShowSignaturePad(true);
                    }
                  }}
                >
                  {theme?.profileIcon?.refresh}
                </TouchableOpacity>
              </View>
            </View>
            :
            <View style={{
              ...styles.signatureContainer,
              justifyContent: 'center',
              alignContent: 'center',
              alignSelf: 'center',
              width: height > width ? height * 0.23 * 1.755 : height < 500 ? height * 0.6 * 1.755 : height * 0.3 * 1.755,
              height: height > width ? height * 0.23 : height < 500 ? height * 0.6 : height * 0.3,

              //width: 800,
              //height: 400,//  > width ? height * 0.23 : height * 0.3
              //maxHeight: 300,
            }}>{isSigReload && (
              <View
                style={{
                  ...styles.signatureContainer,
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignSelf: 'center',
                  width: height > width ? height * 0.23 * 1.755 : height < 500 ? height * 0.6 * 1.755 : height * 0.3 * 1.755,
                  height: height > width ? height * 0.23 : height < 500 ? height * 0.6 : height * 0.3,

                  //width: 800,
                  //height: 400,//  > width ? height * 0.23 : height * 0.3
                  //maxHeight: 300,
                }}
              >
                <SignatureScreen
                  ref={ref}
                  style={{
                    //paddingHorizontal: 25,
                    paddingBottom: 2,
                    //backgroundColor: 'red',
                    // height: height * 0.6,
                    //width: width * 0.7,

                    //width: height * 0.4 * 1.755,
                    //height: height * 0.4,
                    //maxWidth: 500,
                  }}
                  onOK={sig => handleSignature(sig)}
                  onEmpty={async () => {

                    if (isRotate) {
                      setRotateSign(null).then(() => {
                        setBtnLoad(false);

                        setSigReload(false);
                        setTimeout(() => {
                          setSigReload(true);
                          setIsRotate(false);
                        }, 100)

                      });

                    } else {
                      Toast.show({
                        type: 'warning',
                        text1: 'Signature required',
                        text2: 'Please sign in the designated area below',
                        onPress: () => {
                          //closeToast();
                        }
                      })
                    }

                    // setSignatureLocal(false)
                    console.log('___onEmpty');
                  }}

                  onClear={() => {
                    console.log('___onClear');
                  }
                  }

                  descriptionText={descriptionText || ''}
                  //descriptionText="Please sign above"
                  clearText={clearText || ''}
                  //autoClear={true}
                  confirmText={confirmText || ''}
                  webStyle={style}
                //rotated={height > width ? false : true}
                />

                <TouchableOpacity
                  style={{
                    zIndex: 1,
                    alignSelf: 'center',

                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                  }}
                  onPress={() => {

                    if (showSignaturePad) {
                      ref.current.clearSignature();
                    } else {
                      setShowSignaturePad(true);
                    }
                  }}
                >
                  {theme?.profileIcon?.refresh}
                </TouchableOpacity>
              </View>
            )}
            </View>
          }

          {height < width && height < 500 && (
            <TouchableOpacity
              onPress={() => handleOnSave()}
              style={{
                zIndex: 1,
                zIndex: 1,
                alignSelf: 'flex-end',
                bottom: 0,
              }}>
              {theme?.profileIcon?.forward}
            </TouchableOpacity>)}
        </View>

        {height > 500 && (
          <View
            style={{ ...styles.direction, marginTop: height < width ? height <= 500 ? 0 : 40 : 40, gap: height < width ? height <= 500 ? 400 : 0 : 0 }}>
            <TouchableOpacity
              onPress={() => onBackClick()}
              style={{ zIndex: 1 }}>
              {theme?.profileIcon?.backward}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleOnSave()}
              style={{ zIndex: 1 }}>
              {theme?.profileIcon?.forward}
            </TouchableOpacity>
          </View>)}
        {/* </ScrollView> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    justifyContent: 'center',
  },
  direction: {
    //marginVertical: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    //flex: 1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: 'center',
    //backgroundColor: 'red',
    // maxHeight: "30%",
    marginHorizontal: 20,
    // marginVertical: 30,
    //backgroundColor: 'red',
  },
  imageContainer: {
    //width: '100%',
    ///alignItems: 'center',
    borderRadius: 8,
    //padding: 20,
    //borderWidth: 5,
    //backgroundColor: 'black',
    backgroundColor: '#FFFFFF',
    //backgroundColor: 'yellow',
    // borderWidth: 2,
    // borderColor: 'red',
  },

  signatureContainer: {
    alignItems: "center",
    justifyContent: "center",
    //backgroundColor: 'red',
    // maxHeight: "30%",
    marginHorizontal: 20,
    //marginVertical: 30,
    //backgroundColor: 'pink',
  },

  profilePic: {
    // borderWidth: 1,
    // borderColor: 'red',
    borderRadius: 8,
    // overflow: "hidden",
    //backgroundColor: 'white',
    //backgroundColor: 'green',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    // justifyContent: "flex-start",
    justifyContent: 'space-between',
    // alignItems: "center",
    // width: "100%",
    // alignItems: "center",
    // borderWidth: 1,
    paddingHorizontal: 25,
  },
  modeTheme: {
    flexDirection: 'row',
    // justifyContent: 'flex-start',
    // marginVertical: 20,
    gap: 10,
  },
  modeText: {
    alignSelf: 'center',
    fontWeight: 500,
    marginVertical: 10,
  },
  circleOutside: {
    alignSelf: 'center',
    // borderColor: 'gray',
    borderRadius: 50,
    height: 25,
    width: 25,
    padding: 1.5,
  },
  circleInside: {
    height: 20,
    width: 20,
    borderRadius: 50,
  },
  iconDiv2: {
    height: 30,
    width: 30,
    borderRadius: 50,
  },
  icon: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
});

export default SignatureComponentNew;
