import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions, TextInput, Text, useWindowDimensions } from 'react-native';
import { Neomorph } from 'react-native-neomorph-shadows';

import { useTheme } from '../../../styles/ThemeProvider';

const InputButtonComponent = ({
  placeholderTitle,
  placeholderColor,
  icon = null,
  rightIcon = null,
  onChangeText,
  //width,
  defaultValue,
  type = 'text',
  value,
  text,
  widthRatio = 0.8,
  disabled = false,
  borderColor = '#B1C5D5',
  backgroundColor = 'white',
  borderWidth = 0.5,
  darkShadowColor = "#9eb5c7",
  lightShadowColor = null,
  shadowOffset = { width: 0, height: 0 },
  inputColor = 'black',
  isLoading = false,
}) => {
  const { height, width, scale, fontScale } = useWindowDimensions();

  const [finaldWidth, setFinalWidth] = useState(Math.floor(width * widthRatio));
  const [isView, setIsView] = useState(true);
  const { theme } = useTheme()


  useEffect(() => {
    console.log('Height: ' + height + " Width: " + width)

    setIsView(false)
    setTimeout(() => setIsView(true), 2);

    //setFinalWidth(Math.floor(width ));
    setFinalWidth(Math.floor(width *  widthRatio));
  }, [width, height])

  return (
    <View>
      {isView && (
        <Neomorph
          inner // <- enable inner shadow
          useArt // <- set this prop to use non-native shadow on ios
          //swapShadows
          darkShadowColor={darkShadowColor} //"#B1C5D5" //"#FF3333" // <- set this
          //darkShadowColor="#9eb5c7" //"#B1C5D5" //"#FF3333" // <- set this
          lightShadowColor={lightShadowColor} // <- this
          //lightShadowColor="#B1C5D5" // <- this
          style={{
            ...styles.container,
            width: finaldWidth,//dimensions.screen.width * 0.8, //> 300 ? DIM.width * 0.8: width,
            //marginHorizontal: 20,
            borderColor: borderColor,
            backgroundColor: backgroundColor,
            borderWidth: borderWidth,
            shadowOffset: shadowOffset,
          }}
        //style={{style.borderLinearGradient:}}
        >
          <View style={styles.view}>
            {icon && <View style={styles.icon}>{icon}</View>}
            {!isLoading && <Text
              minimumFontScale={0.5}
              adjustsFontSizeToFit={true}
              numberOfLines={1}

              style={{
                ...styles.input,
                color: inputColor,

                fontFamily: theme?.font.input.fontFamily,
                fontWeight: theme?.font.input.fontWeight,
                fontSize: theme?.font.input.fontSize,
              }}>{text} </Text>}
            {isLoading && (
              <ActivityIndicator color={borderColor} style={{ flex: 1, alignContent: 'center' }} />
            )}
            {rightIcon && !isLoading && <View style={styles.icon}>{rightIcon}</View>}
          </View>
        </Neomorph>
      )}
    </View>
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
    borderRadius: 34,
  },
  container: {
    // shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    // shadowColor: '#060606',
    // shadowColor: 'white',
    shadowRadius: 3.5,//5,
    borderRadius: 50, //20,
    // backgroundColor: '#272727',
    // backgroundColor: 'white',
    // borderWidth: 2,
    // borderWidth: 0.5,
    // borderColor: 'silver',
    // borderColor: '#B1C5D5',
    // width: width / divideWidthBy,
    height: 55,
  },
  view: {
    flex: 1,
    flexDirection: 'row',
    //marginTop: 'auto',
    //marginBottom: 'auto',
    justifyContent: 'space-between',
    paddingHorizontal: 40,

  },
  icon: {
    justifyContent: 'center',
    paddingLeft: 12,
    // marginRight: 10,
  },
  input: {
    flex: 1,
    //height: 50, //40,
    //shadowColor: '#C8D4E2',
    //margin: 8,
    //marginRight: 1,
    //backgroundColor: 'red',

    // paddingLeft: 12,

    textAlign: 'left',
    //justifyContent: 'center',
    //alignItems: 'center',
    alignSelf: 'center',

    // textAlign: 'center',
  },
});
export default InputButtonComponent;
