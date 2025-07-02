import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Image, TextInput, ActivityIndicator, Pressable, Platform, useWindowDimensions } from 'react-native';
import { Neomorph } from 'react-native-neomorph-shadows';

//Importing SVGs ...
import CheckGold from '../../../assets/gold/addressVerifiedCheck.svg';
import CheckElegant from '../../../assets/honey/addressVerifiedCheck.svg';
import CheckRose from '../../../assets/roseGold/addressVerifiedCheck.svg';

import FailedGold from '../../../assets/gold/failedGold.svg';
import FailedRoseGold from '../../../assets/roseGold/failedRoseGold.svg';
import FailedElegant from '../../../assets/honey/failedElegant.svg';

import { useTheme } from '../../../styles/ThemeProvider';

//const { width } = Dimensions.get('window');
const InputTextComponent = ({
    refInput,
    placeholderTitle,
    placeholderColor,
    icon,
    onChangeText,
    widthRatio = 0.8,
    defaultValue,
    type = 'url',
    value,
    disabled = false,
    borderColor = '#B1C5D5',
    backgroundColor = 'white',
    borderWidth = 0.5,
    darkShadowColor = "#9eb5c7",
    lightShadowColor = null,
    shadowOffset = { width: 0, height: 0 },
    inputColor = 'black',
    isVerified = null,
    autoFocus = false,
    onKeyPress,
    returnKeyType,
    onSubmit,
    isAutoFoucus = false,
    isSubmitOnBlur = true,
    cursorCentered,
    cursorColor,
    maxLength = 1000,
}) => {
    const { theme } = useTheme();
    // console.log('My theme ==>', theme.name);
    const [isFocus, setIsFocus] = useState(false);
    const [textLength, setTextLength] = useState(0);

    const [show, setIsShow] = useState(true);
    const [isInitiate, setIsInitiate] = useState(false);

    const { height, width, scale, fontScale } = useWindowDimensions();

    const [finaldWidth, setFinalWidth] = useState(Math.floor(width * widthRatio));

    const ref_input = useRef();

    const checkIconSvg = () => {
        if (theme.name === 'Gold') {
            return <CheckGold />;
        } else if (theme.name === 'RoseGold') {
            return <CheckRose />;
        } else {
            return <CheckElegant />;
        }
    }

    const failedIconSvg = () => {
        if (theme.name === 'Gold') {
            return <FailedGold />;
        } else if (theme.name === 'RoseGold') {
            return <FailedRoseGold />;
        } else {
            return <FailedElegant />;
        }
    }

    useEffect(() => {
        console.log('Height: ' + height + " Width: " + width)

        if (Platform.OS === 'android') {
            if (isInitiate) {
                setIsShow(false)
                setTimeout(() => setIsShow(true), 10);
            }
            setIsInitiate(true);
        }


        //setFinalWidth(Math.floor(width ));
        setFinalWidth(Math.floor(width * widthRatio));
    }, [width, height])

    return (
        <View>
            {show && (
                <Neomorph
                    inner // <- enable inner shadow
                    useArt // <- set this prop to use non-native shadow on ios
                    //swapShadows
                    darkShadowColor={darkShadowColor} //"#B1C5D5" //"#FF3333" // <- set this
                    // darkShadowColor="#9eb5c7" //"#B1C5D5" //"#FF3333" // <- set this
                    lightShadowColor={lightShadowColor} // <- this
                    // lightShadowColor="#B1C5D5" // <- this
                    style={{
                        ...styles.container,

                        marginLeft: 0,
                        marginRight: 0,
                        maxWidth: 100,
                        width: finaldWidth,
                        borderColor: borderColor,
                        backgroundColor: backgroundColor,
                        borderWidth: borderWidth,
                        shadowOffset: shadowOffset,
                    }}

                >
                    <View style={{ ...styles.viewHoolder, width: width * widthRatio }}>

                        <TouchableOpacity
                            activeOpacity={1}
                            style={{
                                flex: 1,
                                alignSelf: 'center',
                                //backgroundColor: 'blue',
                                borderRadius: 20,
                            }}
                            onPress={() => {
                                console.log('On press: isFocus: ' + isFocus);
                                // if (!isFocus) {
                                //   ref_input.current.focus()
                                // }
                                ref_input.current.focus()
                            }}>

                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                // marginHorizontal: 10,
                                //backgroundColor: 'yellow'
                            }}>
                                <TextInput

                                    ref={ref_input}
                                    secureTextEntry={Platform.OS === 'android' ? true : false}

                                    //multiline={true}
                                    //multiline={Platform.OS === 'android' ? false : false}
                                    numberOfLines={1}
                                    maxLength={70}
                                    //autoFocus={true}

                                    style={{
                                        ...styles.input,
                                        color: inputColor,
                                        //backgroundColor: 'blue',
                                        height: 55,
                                        //flexGrow: Platform.OS === 'ios' ? isFocus ? 1 : 0 : 1 ,//1


                                        flexGrow: isFocus ? textLength > 1 ? 0.5 : 0.1 : 1,
                                        //flexGrow: isFocus ? 1 : 1,//1
                                        //flexDirection:'row',

                                        fontFamily: theme?.font.body.fontFamily,
                                        fontWeight: theme?.font.body.fontWeight,
                                        fontSize: theme?.font.fontSize.s,

                                    }} // {color: inputColor, width: width / divideWidthBy, }
                                    placeholder={placeholderTitle}
                                    placeholderTextColor={placeholderColor || 'gray'}

                                    //TODO New Keyboard related fix
                                    returnKeyType={returnKeyType}
                                    keyboardType="default"
                                    //textAlign={'center'}

                                    onSubmitEditing={onSubmit}
                                    //clearButtonMode="while-editing"
                                    disableFullscreenUI={true}
                                    autoFocus={isAutoFoucus}
                                    blurOnSubmit={false} //{isSubmitOnBlur}

                                    //onChangeText={onChangeText}
                                    onChangeText={(value) => {
                                        let txtLen = value.length
                                        console.log('Text Leng: ' + txtLen)
                                        setTextLength(txtLen);
                                        onChangeText(value);
                                    }}
                                    defaultValue={defaultValue}
                                    autoCapitalize={type === 'email' ? 'none' : 'sentences'}
                                    value={value}
                                    editable={!disabled}
                                    inputMode={type}

                                    // inputMode=''
                                    onKeyPress={onKeyPress}

                                    onFocus={() => {
                                        setIsFocus(true)
                                        console.log('onFocus: ')
                                    }
                                    }
                                    onBlur={() => {
                                        setIsFocus(false)
                                        console.log('onBlur: ')
                                    }}

                                    cursorColor={theme.colors.borderColor}
                                    // maxLength={maxLength}
                                    caretHidden={false}
                                />
                                {isVerified && <View style={{
                                    position: 'absolute',
                                    //top: '33%',

                                    alignSelf: 'center',
                                    right: 18,
                                    //backgroundColor: 'green',
                                }}>
                                    {isVerified === 'verified' && checkIconSvg()}
                                    {isVerified === 'failed' && failedIconSvg()}
                                    {isVerified === 'processing' && (<ActivityIndicator
                                        color={inputColor}
                                    />)}
                                </View>}
                            </View>


                        </TouchableOpacity>

                    </View>
                </Neomorph >

            )
            }
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        //shadowOffset: { width: 0, height: 0 },
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
        alignItems: 'center',
        textAlign: 'center',
        height: 55,
        overflow: 'hidden',
    },
    viewHoolder: {
        flexGrow: 1,
        flexDirection: 'row',

        //backgroundColor: 'red',
        borderRadius: 20,
        alignSelf: 'center',
    },
    iconHolder: {
        justifyContent: 'center',
        paddingRight: 10,
        position: 'absolute',
        right: 0,
        top: 14,
    },
    view: {
        flex: 1,
        flexDirection: 'row',

        // justifyContent: 'center',
        // alignItems: 'center',
        // textAlign: 'center',
        // width: '100%',
        //backgroundColor: 'red',
    },
    icon: {
        justifyContent: 'center',
        paddingLeft: 12,
        // marginRight: 10,
    },
    input: {
        //shadowColor: '#C8D4E2',
        //borderRadius: 20,
        textAlign: 'center',
        textAlignVertical: 'center',

        paddingVertical: 6,
        paddingHorizontal: 20,
        // paddingLeft: 10,
        // paddingRight: 10,

        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'center',

        //backgroundColor: 'green',
        //marginHorizontal: 10,

        //flex: 1,
        flexDirection: 'row',
        //flexGrow: 0,
        color: 'black',
        // color: 'black',
    },
});
export default InputTextComponent;
