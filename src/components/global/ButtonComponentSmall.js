import { React } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Platform,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../styles/ThemeProvider';

const ButtonComponentSmall = ({ title, onPress, isLoading = false, wideRatio = 0.18, colors = null, borderColors = null, color = '#ffffff', bordered = false, borderWidth = 1, shadow = true, borderColor = '#3D43DF', backgroundColor = '#3D50DF', shadowColor = 'gray', disabled = false }) => {


  const { height, width, scale, fontScale } = useWindowDimensions();
  const { theme } = useTheme()
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        //backgroundColor: 'red',
        paddingTop: 5,
        paddingBottom: 5
        // shadow ? Platform.OS === 'ios' ? { ...styles.shadowIos, backgroundColor: backgroundColor, shadowColor: shadowColor}
        //   : { ...styles.shadowAndroid, backgroundColor: backgroundColor, shadowColor: shadowColor,  }
        //   : null
      }}
    >
      <LinearGradient
        // colors={['#3D43DF', '#3D43DF']}
        colors={borderColors ? borderColors : ['#3D43DF', '#3D43DF']}
        // colors={['#bb52aa', '#63ff85']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.borderLinearGradient}
      >
        <LinearGradient
          // colors={colors ? colors : ['#FD371F', '#FD371F', '#FD371F']}
          colors={colors ? colors : ['#3D43DF', '#3D50DF', '#3D6eDF']}
          style={{
            ...styles.linearGradient, width: width * wideRatio,//DIM.width*.18,
            maxWidth: 200,
            // borderWidth: bordered ? borderWidth : 0, borderColor: borderColor 
          }}>
          {!isLoading ?
            <Text
              //minimumFontScale={0.6}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              style={{
                ...styles.buttonText,
                color: color,
                fontFamily: theme?.font.buttonSmall.fontFamily,
                fontWeight: theme?.font.buttonSmall.fontWeight,
                fontSize: theme?.font.buttonSmall.fontSize,
              }}>
              {title}
            </Text>
            :
            <ActivityIndicator
              color={color}
            />}
          {/* )} */}
        </LinearGradient>
      </LinearGradient>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  borderLinearGradient: {
    // padding: 4,
    // borderColor: '#AEAEAE',
    // borderColor: '#3D43DF',
    // paddingVertical: 3,
    padding: 3,
    // height: 38,
    justifyContent: 'center',
    borderRadius: 30,
    alignItems: 'center',
  },
  linearGradient: {
    // padding: 4,
    // borderColor: '#AEAEAE',
    // borderColor: '#3D43DF',
    paddingLeft: 7,
    paddingRight: 7,
    height: 38,
    alignItems: 'center',
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
    // shadowOffset: {
    //   width: 5,
    //   height: 5,
    // },
    // shadowOpacity: 0.6,
    // shadowRadius: 10,
    //elevation: 100, //50,

    borderRadius: 30,
    //elevation: 8,
  },
  buttonText: {
    minWidth: 65,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    margin: 5,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: 'transparent',
    fontWeight: 'normal',
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
export default ButtonComponentSmall;
