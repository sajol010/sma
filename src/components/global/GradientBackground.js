import { React } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GradientBackground = ({
  title,
  fontSize,
  onPress,
  textBold = false,
  isLoading = false,
  colors = null,
  borderColors = null,
  color = '#ffffff',
  bordered = false,
  borderWidth = 0,
  shadow = true,
  borderColor = '#3D43DF',
  backgroundColor = 'white',
  shadowColor = 'gray'
}) => {
  return (
    <LinearGradient
      // colors={colors ? colors : ['#FCFCFC', '#797979', '#FCFCFC']}
      // colors={colors ? colors : ['#C66960', '#F1B4AA', '#C66960']}
      colors={colors ? colors : ['#3D43DF', '#3D50DF', '#3D6eDF']}
      style={{
        ...styles.linearGradient,
        // borderWidth: bordered ? borderWidth : 0, borderColor: borderColor 
      }}
    >
      <Text style={{ ...styles.buttonText, color: color, fontWeight: textBold ? '600' : '400', fontSize: fontSize ? fontSize : null }}>{title}</Text>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  linearGradient: {
    // padding: 4,
    // borderColor: '#AEAEAE',
    // borderColor: '#3D43DF',
    // padding: 10,
    paddingLeft: 10,
    paddingRight: 10,
    height: 38,
    justifyContent: 'center',
    borderRadius: 30,
  },
  shadowAndroid: {
    elevation: 16,
    borderRadius: 30,
    // backgroundColor: '#3D50DF',
    //For Android
  },
  shadowIos: {
    //For ios
    // shadowColor: 'gray', //'#9eb5c7',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    //elevation: 100, //50,

    borderRadius: 30,
    elevation: 8,
  },
  buttonText: {
    // fontSize: 12,
    fontFamily: "Poppins-Regular",
    textTransform: "capitalize",

    // fontSize: 18,
    // fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    // margin: 10,
    // // color: '#ffffff',
    // backgroundColor: 'transparent',
    // fontWeight: 'normal',
  },
  btnShaddow: {
    shadowOpacity: 100, // <- and this or yours opacity
    shadowRadius: 14,
    shadowColor: '#9eb5c7',
    borderRadius: 30,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'white',
    height: 60,
  },
});
export default GradientBackground;
