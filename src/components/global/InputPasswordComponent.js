import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, TextInput, View, Pressable, useWindowDimensions, TouchableOpacity, Platform } from 'react-native';
import { Neomorph } from 'react-native-neomorph-shadows';

import { useTheme } from '../../../styles/ThemeProvider';

const InputPasswordComponent = ({ placeholderTitle, icon, onChangeText, customWidthRatio = 0.8, value,
  placeholderColor,
  disabled = false,
  borderColor = '#B1C5D5',
  backgroundColor = 'white',
  borderWidth = 0.5,
  darkShadowColor = "#9eb5c7",
  lightShadowColor = null,
  shadowOffset = { width: 0, height: 0 },
  inputColor = 'black',
  eyeOn = null,
  eyeOff = null,
  cursorColor,
  onFocus,
  onBlur
}) => {
  // const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [show, setShow] = useState(false);

  const [isView, setIsView] = useState(true);
  const [textLength, setTextLength] = useState(0);
  const { height, width, scale, fontScale } = useWindowDimensions();

  const [finaldWidth, setFinalWidth] = useState(Math.floor(width * customWidthRatio));

  const { theme } = useTheme()

  const ref_input = useRef();

  useEffect(() => {
    console.log('Height: ' + height + " Width: " + width)


    if (Platform.OS === 'android') {
      setIsView(false)
      setTimeout(() => setIsView(true), 2);
    }

    //setFinalWidth(Math.floor(width ));
    setFinalWidth(Math.floor(width * customWidthRatio));
  }, [width, height])

  return (
    <View>{isView && (
      <Neomorph
        inner // <- enable inner shadow
        useArt // <- set this prop to use non-native shadow on ios
        //swapShadows
        darkShadowColor={darkShadowColor} //"#B1C5D5" //"#FF3333" // <- set this
        // darkShadowColor="#9eb5c7" //"#B1C5D5" //"#FF3333" // <- set this
        lightShadowColor={lightShadowColor} // <- this
        // lightShadowColor="#B1C5D5" // <- this

        // inner // <- enable inner shadow
        // useArt // <- set this prop to use non-native shadow on ios
        // //swapShadows
        // darkShadowColor="#9eb5c7" //"#B1C5D5" //"#FF3333" // <- set this
        // //lightShadowColor="#B1C5D5" // <- this
        style={{
          ...styles.container,
          width: finaldWidth,
          borderColor: borderColor,
          backgroundColor: backgroundColor,
          borderWidth: borderWidth,
          shadowOffset: shadowOffset,
        }}
      >
        <View style={{ ...styles.viewHolder, width: finaldWidth }}>

          <TouchableOpacity
            activeOpacity={1}
            style={{
              flex: 1,
              alignSelf: 'center',
              //backgroundColor: 'blue',
              //borderTopLeftRadius: 25,
              //borderBottomLeftRadius: 25,
              borderRadius: 25,
              marginLeft: 2,
              marginRight: 2,
            }}
            onPress={() => {
              console.log('On press: isFocus: ' + isFocus);

              ref_input.current.focus()
              //setIsFocus(true)
            }}>

            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignSelf: 'center',
              marginHorizontal: 50,
              //backgroundColor: 'yellow'
            }}>
              <TextInput
                ref={ref_input}
                //multiline={true}//{multiline}

                //multiline={Platform.OS === 'android' ? false : show}
                secureTextEntry={!show}
                numberOfLines={1}
                maxLength={30}

                // onChangeText={(value) => {
                //   console.log("Pass text change: " + value.length);
                //   onChangeText(value);
                // }}

                onChangeText={(value) => {
                  let txtLen = value.length
                  console.log("Pass text change: " + txtLen);
                  setTextLength(txtLen)
                  onChangeText(value)
                }}
                value={value}
                enablesReturnKeyAutomatically={true}
                autoCapitalize={'none'}
                //clearButtonMode="while-editing"
                disableFullscreenUI={true}
                //returnKeyType={'go'}
                style={{
                  ...styles.input,
                  color: inputColor,

                  //flexGrow: Platform.OS === 'ios'? isFocus ? 1 : 0 : 1,
                  flexGrow: isFocus ? textLength > 1 ? 0.5 : 0.2 : 1,

                  fontFamily: theme?.font.input.fontFamily,
                  fontWeight: theme?.font.input.fontWeight,
                  fontSize: theme?.font.input.fontSize,
                }}

                //passwordRules={}

                placeholder={placeholderTitle}
                placeholderTextColor={placeholderColor || 'gray'}


                //clearButtonMode="always"

                editable={!disabled}

                textContentType={'password'}

                inputMode={'text'}
                //inputMode={Platform.OS === 'android'? show ? 'none': 'url' : 'text'}
                caretHidden={false}

                //autoFocus={true}
                //focusable={true}
                onFocus={() => {
                  setIsFocus(true)
                  onFocus()
                }}
                onBlur={() => {
                  setIsFocus(false)
                }}
                cursorColor={theme.nav.borderColor}
              />
            </View>

          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShow(!show)}>
            <View style={styles.iconHolder}>
              <View style={styles.icon}>
                {show === false ? eyeOff : eyeOn}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Neomorph >)}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowColor: 'white',
    shadowRadius: 5,
    borderRadius: 50, //20,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: '#dde5ed',
    // width: width / 1.2,
    height: 55,
  },
  viewHolder: {
    //flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
    //backgroundColor: 'red',

    borderRadius: 20,
    alignSelf: 'center',

  },
  view: {
    justifyContent: 'center',
    paddingLeft: 15,
  },
  input: {
    //shadowColor: '#C8D4E2',
    //borderRadius: 20,
    textAlign: 'center',
    textAlignVertical: 'center',


    paddingVertical: 6,
    //paddingHorizontal: 10,
    // paddingLeft: 10,
    // paddingRight: 10,

    alignSelf: 'center',
    justifyContent: 'center',

    //backgroundColor: 'green',
    height: 52,

    //flex: 1,
    flexDirection: 'row',
    //flexGrow: 1,
    color: 'black',
  },
  iconHolder: {
    height: 52,

    //backgroundColor: 'red',
    borderTopRightRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    paddingRight: 7,
    paddingLeft: 7,
    marginRight: 2,
    position: 'absolute',
    right: 0,
    alignSelf: 'center',
  },
  icon: { marginRight: 0 },
});
export default InputPasswordComponent;
