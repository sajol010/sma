import { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Alert,
  View,
  BackHandler,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Signature from 'react-native-signature-canvas';
import Delete from '../../../assets/delete.svg';
import Edit from '../../../assets/edit.svg';
import Eraser from '../../../assets/eraser.svg';
import DocumentListHeader from '../../components/global/DocumentListHeaderComponent';

const SignatureComponent = ({
  visible,
  onBackClick,
  getSignature,
  descriptionText,
  clearText,
  confirmText,
  theme = null,
  rightIcon = null,
}) => {
  const ref = useRef();
  const [active, setActive] = useState(0);
  const [isErase, setIsErase] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);


  const scaleValue = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = useState(visible);

  const modes = ['black', 'blue', 'red'];

  const handleOnSave = () => {
    console.log('signature save ==>: ');
    ref.current?.readSignature();
    //setBtnLoad(true);
  };

  const handleSignature = signature => {
    console.log('signature==>: ' + signature);

    setBtnLoad(true);
    getSignature(signature).then(() => {
      setBtnLoad(false);
    });

    // getSignature(signature);
    // setBtnLoad(false);
  };

  const style = `
  // .m-signature-pad--footer {display: none; margin: 0px;}

  .m-signature-pad--footer
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
      // position: absolute;
      font-size: 10px;
      // width: 100%;
      // height: 400px;
      // width: 700px;
      // height: 300px;
      // top: 50%;
      // left: 50%;
      // margin-left: -350px;
      // margin-top: -200px;
      border: 1px dashed ${theme?.name == 'Light' ? "black" : 'transparent'};
      // border: 1px solid #e8e8e8;
      background-color: white;
      box-shadow: none;
      // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.27), 0 0 40px rgba(0, 0, 0, 0.08) inset;
    }

    .m-signature-pad--body {
      border-bottom: 1px dashed gray;
    }
    `;

  useEffect(() => {
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
    <Modal
      visible={showModal}
      onRequestClose={() => {
        console.log('onRequestClose');
        onBackClick();
      }}>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={theme?.bg?.bgImg}
          resizeMode="cover"
          style={styles.bgImage}
        >
          <DocumentListHeader
            onPress={onBackClick}
            title={'Add Signature'}
            isRightBtn={true}
            onPressRight={handleOnSave}
            rightBtnLoad={btnLoad}

            rightIcon={rightIcon}

            backIcon={theme?.header?.backIcon}
            statusBarColor={theme?.colors?.statusBarColor}
            dark={theme?.name == 'Light'}
            color={theme?.colors?.text}
          />
          <View style={styles.container}>
            <Signature
              ref={ref}
              style={{
                paddingHorizontal: 25,
                paddingVertical: 65,
              }}
              onOK={sig => handleSignature(sig)}
              onEmpty={async () => {
                console.log('___onEmpty');
                //type, title, body, receivedData
                //await showToast('error', 'Signature empty', 'Please add signature');
              }}
              descriptionText={descriptionText}
              clearText={clearText}
              confirmText={confirmText}
              webStyle={style}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.modeTheme}>
              <Text style={{ color: theme?.name == 'Light' ? '#2e476e' : 'white' }}>Color:</Text>
              {modes?.map((item, index) => {
                return (
                  <View key={item + index}>
                    <TouchableOpacity
                      onPress={() => {
                        setActive(index);
                        ref.current.changePenColor(
                          index == 0 ? 'black' : index == 1 ? '#3D50DF' : 'red',
                        );
                      }}>
                      <View
                        style={{
                          ...styles.circleOutside,
                          borderWidth: index == active ? 1 : 0,
                          borderColor: theme?.name == 'Light' ? 'gray' : theme?.colors?.text,
                        }}>
                        <View
                          style={{
                            ...styles.circleInside,
                            backgroundColor:
                              index == 0
                                ? 'black'
                                : index == 1
                                  ? '#3D50DF'
                                  : 'red',
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* Erase */}
              <TouchableOpacity
                onPress={() => {
                  setIsErase(true),
                    ref.current.erase(),
                    ref.current.changePenSize(1, 5);
                }}
                style={{
                  ...styles.iconDiv2,
                  backgroundColor: theme?.name == 'Light' ? isErase ? '#3D50DF' : 'gray'
                    : isErase ? 'black' : 'gray',
                  borderColor: theme?.name == 'Light' ? 0
                    : isErase ? theme?.colors?.text : 'transparent',
                  borderWidth: theme?.name == 'Light' ? 0 : 1,
                }}>
                <Eraser style={styles.icon} />
              </TouchableOpacity>

              {/* Draw */}
              <TouchableOpacity
                onPress={() => {
                  setIsErase(false),
                    ref.current.changePenSize(1, 1),
                    ref.current.draw();
                }}
                style={{
                  ...styles.iconDiv2,
                  // backgroundColor: !isErase ? '#3D50DF' : 'gray',
                  backgroundColor: theme?.name == 'Light' ? !isErase ? '#3D50DF' : 'gray'
                    : !isErase ? 'black' : 'gray',
                  borderColor: theme?.name == 'Light' ? 0
                    : !isErase ? theme?.colors?.text : 'transparent',
                  borderWidth: theme?.name == 'Light' ? 0 : 1,
                }}>
                <View style={styles.iconDiv2}>
                  <Edit style={styles.icon} />
                </View>
              </TouchableOpacity>

              {/* Clear */}
              <TouchableOpacity
                onPress={() => {
                  ref.current.clearSignature();
                }}
                style={{
                  ...styles.iconDiv2,
                  backgroundColor: theme?.name == 'Light' ? '#FD371F' : 'black',
                }}>
                {theme?.name == 'Light' ?
                  <View style={styles.iconDiv2}>
                    <Delete style={styles.icon} />
                  </View>
                  :
                  theme?.header?.delete
                }
              </TouchableOpacity>
            </View>
          </View>
          {/* </View> */}
        </ImageBackground>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    // alignItems: "center",
    // justifyContent: "center",
    // maxHeight: "77%",
    // padding: 20,
    // margin: 20,
    // backgroundColor: 'transparent',
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

export default SignatureComponent;
