import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    Text,
    TouchableOpacity,
    View,
    ImageBackground,
    ScrollView,
} from 'react-native';

import ButtonComponentSmall from './ButtonComponentSmall.js';

import { Elegant } from '../../../styles/Theme.js';
import InputTextModalComponent from './InputTextModalComponent.js';

import FailedGold from '../../../assets/gold/failedGold.svg';
import FailedRoseGold from '../../../assets/roseGold/failedRoseGold.svg';
import FailedElegant from '../../../assets/honey/failedElegant.svg';

const ModalPopupManualAddress = ({
    visible,
    title,
    msg,
    onPressClose,
    onResetSuccess,
    saveBtnDisable = false,
    addressData,
    onCancel,
    theme = null,
}) => {
    const [formData, setData] = React.useState({
        address: '',
        city: '',
        country: '',
        pc: '',
    });

    const [isPassFieldFocused, setIsPassFieldFocused] = useState(false)
    const [isNewPassFieldFocused, setIsNewPassFieldFocused] = useState(false)

    const [errorText, setErrorText] = useState('')
    const [isError, setIsError] = useState(false)

    const [resetPassLoading, setResetPassLoading] = useState(false);
    const [showModal, setShowModal] = React.useState(visible);
    const scaleValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        toggleModal();

        setData({})
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

    const failedIconSvg = () => {
        if (theme.name === 'Gold') {
            return <FailedGold />;
        } else if (theme.name === 'RoseGold') {
            return <FailedRoseGold />;
        } else {
            return <FailedElegant />;
        }
    }

    const checkPasswords = async () => {
        if (!formData.address) {
            setIsError(true)
            setErrorText('Your address field is empty')
            return
        } else if (!formData.city) {
            setIsError(true)
            setErrorText('Your city field is empty')
            return
        } else if (!formData.country) {
            setIsError(true)
            setErrorText('Your country field is empty')
            return
        } else if (!formData.pc) {
            setIsError(true)
            setErrorText('Your post code field is empty')
            return
        } else if (!formData.state) {
            setIsError(true)
            setErrorText('Your state field is empty')
            return
        } else {
            setIsError(false)
            //setErrorText('Your post code field is empty')
        }

        addressData(formData)

    }

    useEffect(() => {
        if (isNewPassFieldFocused && isPassFieldFocused) {
            if (formData.password.length === 0 || formData.new_password.length === 0) {
                setIsError(true)
                setErrorText('Please, fill all the fields ...')
            } else {
                setIsError(false)
            }
        }
    }, [formData, isNewPassFieldFocused, isPassFieldFocused])

    return (
        <Modal transparent visible={showModal}
            hardwareAccelerated={true}
            supportedOrientations={['portrait', 'landscape']} //'landscape'
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                enabled={Platform.OS === 'android' ? false : true}
            >
                {/* <ScrollView contentContainerStyle={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}> */}
                <View style={styles.modalBackGround}>
                    <Animated.View
                        style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}
                    >
                        <ScrollView>
                            <ImageBackground
                                source={Elegant.bg.bgImg}
                                resizeMode="cover"
                                style={styles.bgImage}
                                imageStyle={{ borderRadius: 20 }}
                            >
                                <View>
                                    {/* Cross Icon  */}
                                    <View style={styles.mainContainer}>
                                        <View style={{ ...styles.headerDialog, }}>

                                            <TouchableOpacity onPress={() => {
                                                console.log('Press Cross btn of modal');
                                                onPressClose()
                                                setIsError(null)
                                                setErrorText('')
                                                setIsPassFieldFocused(false)
                                                setIsNewPassFieldFocused(false)
                                            }} style={styles.closeButton}>
                                                <View style={{
                                                    flex: 1,
                                                    justifyContent: 'center',
                                                    alignSelf: 'center',
                                                }}>
                                                    {theme?.controlIcon?.cross}
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <Text style={{
                                        ...styles.title,

                                        color: theme?.name == 'Light' ? 'black' : 'white',

                                        fontFamily: theme?.font.modalTitle.fontFamily,
                                        fontWeight: theme?.font.modalTitle.fontWeight,
                                        fontSize: theme?.font.modalTitle.fontSize
                                    }}
                                    >
                                        {title}
                                    </Text>

                                    {msg &&
                                        <Text style={{
                                            ...styles.msg,
                                            color: theme?.name == 'Light' ? 'black' : 'white',

                                            fontFamily: theme?.font.modalBody.fontFamily,
                                            fontWeight: theme?.font.modalBody.fontWeight,
                                            fontSize: theme?.font.modalBody.fontSize
                                        }}
                                        >{msg}</Text>
                                    }

                                    <View>
                                        <View style={{ paddingBottom: 20, alignItems: 'center' }}>
                                            <InputTextModalComponent
                                                placeholderTitle={'Address'}
                                                icon={theme?.profileIcon?.profile}
                                                borderColor={theme?.textInput?.borderColor}
                                                backgroundColor={theme?.textInput?.backgroundColor}
                                                borderWidth={theme?.textInput?.borderWidth}
                                                darkShadowColor={theme?.textInput?.darkShadowColor}
                                                lightShadowColor={theme?.textInput?.lightShadowColor}
                                                shadowOffset={theme?.textInput?.shadowOffset}
                                                placeholderColor={theme?.textInput?.placeholderColor}
                                                inputColor={theme?.textInput?.inputColor}
                                                widthRatio={0.6}
                                                value={formData?.address}
                                                cursorColor={theme.colors.borderColor}
                                                onChangeText={value => {
                                                    console.log('Address==: ' + value);
                                                    setData({ ...formData, address: value });
                                                }}
                                                type={Platform.OS === 'ios' ? 'text' : 'url'}
                                            />
                                        </View>

                                        <View style={{ paddingBottom: 20, alignItems: 'center' }}>
                                            <InputTextModalComponent
                                                placeholderTitle={'City'}
                                                icon={theme?.profileIcon?.profile}
                                                borderColor={theme?.textInput?.borderColor}
                                                backgroundColor={theme?.textInput?.backgroundColor}
                                                borderWidth={theme?.textInput?.borderWidth}
                                                darkShadowColor={theme?.textInput?.darkShadowColor}
                                                lightShadowColor={theme?.textInput?.lightShadowColor}
                                                shadowOffset={theme?.textInput?.shadowOffset}
                                                placeholderColor={theme?.textInput?.placeholderColor}
                                                inputColor={theme?.textInput?.inputColor}
                                                widthRatio={0.6}
                                                cursorColor={theme.colors.borderColor}
                                                value={formData?.city}
                                                onChangeText={value => {
                                                    console.log('City==: ' + value);

                                                    setData({ ...formData, city: value });

                                                }}
                                                type={Platform.OS === 'ios' ? 'text' : 'url'}
                                            />
                                        </View>

                                        <View style={{ paddingBottom: 20, alignItems: 'center' }}>
                                            <InputTextModalComponent
                                                placeholderTitle={'Country'}
                                                icon={theme?.profileIcon?.profile}
                                                borderColor={theme?.textInput?.borderColor}
                                                backgroundColor={theme?.textInput?.backgroundColor}
                                                borderWidth={theme?.textInput?.borderWidth}
                                                darkShadowColor={theme?.textInput?.darkShadowColor}
                                                lightShadowColor={theme?.textInput?.lightShadowColor}
                                                shadowOffset={theme?.textInput?.shadowOffset}
                                                placeholderColor={theme?.textInput?.placeholderColor}
                                                inputColor={theme?.textInput?.inputColor}
                                                widthRatio={0.6}
                                                cursorColor={theme.colors.borderColor}
                                                value={formData?.country}
                                                onChangeText={value => {
                                                    console.log('Country==: ' + value);

                                                    setData({ ...formData, country: value });

                                                }}
                                                type={Platform.OS === 'ios' ? 'text' : 'url'}
                                            />
                                        </View>

                                        {/* <View style={{ paddingBottom: 20, flexDirection: 'row', gap: 4, alignItems: 'center', alignContent: 'center', alignSelf: 'center' }}> */}
                                        <View style={{ paddingBottom: 20, alignItems: 'center' }}>
                                            <InputTextModalComponent
                                                placeholderTitle={'State'}
                                                icon={theme?.profileIcon?.profile}
                                                borderColor={theme?.textInput?.borderColor}
                                                backgroundColor={theme?.textInput?.backgroundColor}
                                                borderWidth={theme?.textInput?.borderWidth}
                                                darkShadowColor={theme?.textInput?.darkShadowColor}
                                                lightShadowColor={theme?.textInput?.lightShadowColor}
                                                shadowOffset={theme?.textInput?.shadowOffset}
                                                placeholderColor={theme?.textInput?.placeholderColor}
                                                inputColor={theme?.textInput?.inputColor}
                                                widthRatio={0.6}
                                                value={formData?.state}
                                                cursorColor={theme.colors.borderColor}
                                                onChangeText={value => {
                                                    console.log('State==: ' + value);

                                                    setData({ ...formData, state: value });

                                                }}
                                                type={Platform.OS === 'ios' ? 'text' : 'url'}
                                            />
                                        </View>

                                        <View style={{ paddingBottom: 20, alignItems: 'center' }}>
                                            <InputTextModalComponent
                                                placeholderTitle={"Post Code"}
                                                placeholderColor={theme?.textInput?.placeholderColor}
                                                icon={theme?.profileIcon?.profile}
                                                borderColor={theme?.textInput?.borderColor}
                                                backgroundColor={theme?.textInput?.backgroundColor}
                                                borderWidth={theme?.textInput?.borderWidth}
                                                darkShadowColor={theme?.textInput?.darkShadowColor}
                                                lightShadowColor={theme?.textInput?.lightShadowColor}
                                                shadowOffset={theme?.textInput?.shadowOffset}
                                                inputColor={theme?.textInput?.inputColor}
                                                widthRatio={0.6}
                                                cursorColor={theme.colors.borderColor}
                                                value={formData?.pc}
                                                onChangeText={value => {
                                                    console.log('Post code==: ' + value);

                                                    setData({ ...formData, pc: value });

                                                }}
                                                type={Platform.OS === 'ios' ? 'text' : 'url'}
                                            />
                                        </View>

                                    </View>

                                    {/* Error Fields added */}
                                    {isError && errorText !== '' &&
                                        <View style={styles.errorFieldContainer}>
                                            <View style={styles.iconContainer}>
                                                {failedIconSvg()}
                                            </View>
                                            <Text style={{
                                                ...styles.errorText,

                                                fontFamily: theme?.font.modalBody.fontFamily,
                                                fontWeight: theme?.font.modalBody.fontWeight,
                                                fontSize: theme?.font.modalBody.fontSize
                                            }}>{errorText}</Text>
                                        </View>
                                    }

                                    <View
                                        style={{ padding: 36, flexDirection: 'row', justifyContent: 'center', gap: 20 }}
                                    >
                                        {/* Cancel Button */}
                                        <View style={styles.buttonContainer}>
                                            <ButtonComponentSmall
                                                title={'Cancel'}
                                                color={theme?.colors?.btnText}
                                                colors={theme?.colors?.colors}
                                                bordered={true}
                                                borderWidth={theme?.name == 'Light' ? 0 : 3}
                                                borderColor={theme?.colors?.borderColor}
                                                borderColors={theme?.colors?.borderColors}
                                                shadow={theme?.name == 'Light'}
                                                onPress={() => {
                                                    onPressClose()
                                                    setErrorText('')
                                                    setIsError(false)
                                                    setIsPassFieldFocused(false)
                                                    setIsNewPassFieldFocused(false)
                                                }}
                                            />
                                        </View>

                                        <View style={{ ...styles.buttonContainer, minWidth: 50 }}>

                                            <ButtonComponentSmall
                                                isLoading={resetPassLoading}
                                                title={'Save'}
                                                color={theme?.colors?.btnText}
                                                colors={theme?.colors?.colors}
                                                bordered={true}
                                                borderWidth={theme?.name == 'Light' ? 0 : 3}
                                                borderColor={theme?.colors?.borderColor}
                                                borderColors={theme?.colors?.borderColors}
                                                shadow={theme?.name == 'Light'}
                                                onPress={checkPasswords}
                                            />
                                            {/* } */}
                                        </View>
                                    </View>
                                </View>
                            </ImageBackground>
                        </ScrollView>
                    </Animated.View>
                </View>
                {/* </ScrollView> */}
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: 'auto',
        marginBottom: 'auto',
        // height: 50,
        // paddingBottom: 32,
        // width: '45%',
    },
    bgImage: {
        // flex: 1,
        // justifyContent: 'center',
    },
    modalBackGround: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',

    },
    btnText: {
        color: 'white',
        fontSize: 16,
    },
    modalContainer: {
        width: '80%',
        maxWidth: 500,
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        paddingVertical: 0,
        borderRadius: 20,
        elevation: 20,
    },
    iconContainer: {
        // flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
    },
    mainContainer: {
        width: '100%',
        backgroundColor: 'transparent',
        // \backgroundColor: 'white',
        paddingHorizontal: 0,
        paddingVertical: 0,
        paddingBottom: 20,
        borderRadius: 20,
        elevation: 0,
    },
    animation: {
        width: '100%',
        height: 170,
        backgroundColor: '#ffffff00',
    },
    header: {
        width: '100%',
        height: 40,
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    headerImage: {
        height: 180,
        width: '100%',
        marginVertical: 0,
        // borderTopRightRadius: 20,
        // borderTopLeftRadius: 20,
        position: 'absolute',
    },
    closeButton: {
        zIndex: 100,
        //marginTop: 10,
        height: 55,
        width: 55,
        tintColor: 'white',
        alignContent: 'center',

        // backgroundColor: 'red'
    },
    //closeButton: { paddingTop: 50, height: 50, width: 30, alignContent: 'center', backgroundColor: 'red', justifyContent: 'center', tintColor: 'white' },
    title: {
        paddingLeft: 24,
        paddingRight: 24,

        paddingBottom: 24,
        marginTop: 35,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Regular',
        color: 'black',
        textAlign: 'center',
    },
    msg: {
        paddingLeft: 24,
        paddingRight: 24,
        fontSize: 15,
        fontFamily: 'Poppins-Regular',
        color: 'black',
        textAlign: 'center',
    },
    headerDialog: {
        zIndex: 1,
        width: '100%',
        //height: 50,
        // /paddingHorizontal: 20,
        //paddingVertical: 30,
        alignItems: 'flex-end',
        justifyContent: 'center',
        position: 'absolute',

        //backgroundColor: 'green'
    },
    errorFieldContainer: {
        // backgroundColor: 'red',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // paddingLeft: DIM.width * .069,
    },
    errorText: {
        fontSize: 12,
        color: '#ff0000',
        marginLeft: 10,
    },
});

export default ModalPopupManualAddress;
