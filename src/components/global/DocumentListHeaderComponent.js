import { React } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Check from '../../../assets/check.svg';
import BackLight from '../../../assets/back_button_icon.svg';
//Style
import globalStyle from '../../../styles/MainStyle.js';

export default function DocumentListComponent({
  onPress,
  title,
  isRightBtn = false,
  onPressRight,
  rightBtnLoad,
  color = '#2e476e',
  statusBarColor = "white",
  backIcon = null,
  rightIcon = null,
  dark = false
}) {
  // const [searchKeyword, setSearchKeyWord] = useState('');
  // const handleSearchPress = () => {
  //   // Pass the parameter to the callback function
  //   onSearchPress(searchKeyword);
  // };

  return (
    <View>
      {/* <StatusBar
        translucent
        animated={true}
        // backgroundColor="#79B45D"
        // barStyle={'dark-content'}
        backgroundColor={statusBarColor}
        barStyle={dark ? 'dark-content' : 'light-content'}
      //showHideTransition={'fade'}
      /> */}
      <View
        style={{
          ...styles.toolBar,
          flexDirection: backIcon ? 'row' : null,
          alignSelf: backIcon ? null : 'center',
          justifyContent: isRightBtn ? 'space-between' : 'flex-start',
          width: isRightBtn ? null : '85%',
        }}>

        {backIcon &&
          <TouchableOpacity onPress={onPress}>
            {!dark ?
              backIcon
              :
              <View style={styles.shadowAndroid}>
                <View style={styles.input}>
                  <View style={styles.icon}>
                    <BackLight />
                  </View>
                </View>
              </View>
            }
          </TouchableOpacity>
        }

        <View style={styles.titleContainer}>
          <Text style={{ ...styles.title, color: color, paddingLeft: isRightBtn ? 0 : 30, marginLeft: isRightBtn ? rightIcon ? 0 : backIcon ? -40 : 0 : 0 }}>
            {title}
          </Text>
        </View>

        {isRightBtn && (
          <TouchableOpacity
            onPress={() => {
              !rightBtnLoad && onPressRight();
            }}>
            {!rightBtnLoad ? (
              <>
                {!dark ?
                  rightIcon
                  :
                  <View style={styles.input2}>
                    <View style={styles.icon2}>
                      <Check />
                    </View>
                  </View>
                }
              </>
            ) : (
              <ActivityIndicator
                color={!dark ? 'white' : globalStyle.colorAccent}
                style={{ ...styles.input2, backgroundColor: !dark ? 'black' : '#3D50DF' }}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
      {/* <View style={globalStyle.line} /> */}
    </View>
  );
}

var styles = StyleSheet.create({
  toolBar: {
    // height: 50,
    // width: '85%',
    // backgroundColor: globalStyle.toolBarColor,
    // flexDirection: 'row',
    // alignSelf: 'center',
    alignContent: 'center',
    // paddingTop: 6,
    paddingHorizontal: 20,
    opacity: 0.95,
    paddingVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    // justifyContent: 'center',
    // alignContent: 'center',
    // color: '#2e476e',
    // paddingLeft: 30,
    // textAlign: 'left',
    // textAlignVertical: 'center',
    textAlign: 'center',
    // borderWidth: 1,
    // borderColor: 'red',
  },
  shadowAndroid: {
    elevation: 16,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  titleContainer: {
    // fontSize: 24,
    // justifyContent: 'center',
    // color: '#2e476e',
    // textAlign: 'left',
    // textAlignVertical: 'center',
    // alignItems: 'center',
  },
  icon: {
    justifyContent: 'center',
    alignSelf: 'center',
    paddingLeft: 2,
    width: 30,
    height: 30,
  },
  icon2: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: 20,
    height: 20,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  input: {
    borderRadius: 20,
    backgroundColor: '#ECF0F3',
    justifyContent: 'center',
    alignContent: 'center',
    width: 40,
    height: 40,

    //Shadow for ios
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowColor: '#9eb5c7',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    elevation: 20,
  },
  input2: {
    borderRadius: 20,
    justifyContent: 'center',
    width: 35,
    height: 35,
    backgroundColor: '#3D50DF',

    // marginRight: 30,

    //Shadow
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowColor: '#3d50df',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    elevation: 20,
  },
});
