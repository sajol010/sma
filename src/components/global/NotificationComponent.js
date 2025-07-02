import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
} from 'react-native';
import { useTheme } from '../../../styles/ThemeProvider';

import { Elegant } from '../../../styles/Theme.js';
import { DIM } from '../../../styles/Dimensions';


// title, onPress, isLoading = false, colors = null, borderColors = null, 
// color = '#ffffff', bordered = false, borderWidth = 0, shadow = true, borderColor = '#3D43DF', 
// backgroundColor = 'white', shadowColor = 'gray', disabled = false 


const NotificationComponent = ({ title, msg, iconName}) => {
  const { theme } = useTheme()

  color = theme?.colors?.btnText
  colors = theme?.colors?.colors
  const bordered = true
  const borderWidth = theme?.name == 'Light' ? 0 : 3
  const borderColor = theme?.colors?.borderColor
  const borderColors = theme?.colors?.borderColors
  const backgroundColor = 'white'
  const shadow = true
  const shadowColor = 'gray'
  const disabled = false
  //console.log("Theme name: " + theme.name)


  //TODO need to get from thme directly
  const wifiIcon = () => {
    switch (iconName) {
      case 'Offline':
        return theme.notificationIcon.internetDisconnected;
      case 'Online':
        return theme.notificationIcon.internetConnected;
      default:
        // Handle unexpected iconName values (optional)
        return null; // Or any default value you want
    }
  }

  return (
    // Used TouchableOpacity previously ...
    <ImageBackground
      // disabled={disabled}
      disabled={false}
      source={Elegant.bg.bgImg}
      //onPress={onPress}
      // style={[
      //   shadow ? Platform.OS === 'ios' ? { ...styles.shadowIos, backgroundColor: backgroundColor, shadowColor: shadowColor }
      //     : { ...styles.shadowAndroid, backgroundColor: backgroundColor, shadowColor: shadowColor }
      //     : null,
      // ]}
      style={styles.customToastBackground}
    >
      <View>
        {wifiIcon()}
      </View>
      <View>
        <Text style={{ color: '#fff', marginLeft: 10, fontWeight: 'bold' }}>{title}</Text>
        <Text style={{ color: '#fff', marginLeft: 10, }}>{msg}</Text>
      </View>

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  borderLinearGradient: {
    // padding: 4,
    // borderColor: '#AEAEAE',
    // borderColor: '#3D43DF',
    // paddingVertical: 3,
    padding: 3,
    height: 68,
    justifyContent: 'center',
    borderRadius: 30,
  },
  linearGradient: {
    // padding: 4,
    // borderColor: '#AEAEAE',
    // borderColor: '#3D43DF',
    paddingLeft: 15,
    paddingRight: 15,
    height: 60,
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
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    margin: 10,
    // color: '#ffffff',
    backgroundColor: 'transparent',
    fontWeight: 'normal',
    textTransform: 'uppercase',
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
  customToastBackground: {
    flexDirection: 'row',
    height: 68,
    width: DIM.width * .8,
    borderRadius: 12,
    overflow: 'hidden',
    // borderWidth: 2,
    // borderColor: theme.nav.borderColor,
    shadowColor: 'rgba(0,0,0,.3)',
    shadowOffset: { width: DIM.width * .8, height: 60, },
    shadowRadius: 5,
    // elevation: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default NotificationComponent;
