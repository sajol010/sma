import { useNavigation } from '@react-navigation/native';
import { React, useState, useEffect } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    Platform,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    useWindowDimensions
} from 'react-native';
import { AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';
import { AutoCompleteDropDown } from '../components/global/AutoCompleteDropdownComp';
//import { ScrollView } from 'react-native-virtualized-view';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

//Image Resource
//Variables
//Class
import Url from '../Api.js';
import Token from '../class/TokenManager.js';
//Component
import TextInput from '../components/global/InputTextComponent.js';
import TextInputDetails from '../components/global/InputTextDetailsComponent.js';
import LogoHeader from '../components/global/LogoHeader.js';
import ModalPopupManualAddress from '../components/global/ModalPopupManualAddress';

//Style
import globalStyle from '../../styles/MainStyle.js';
import { useTheme } from '../../styles/ThemeProvider';
import Validator from '../class/Validator';
import ModalPoup from '../components/global/ModalPoupComponent';
import AsyncStorageManager from '../class/AsyncStorageManager';
import CONSTANTS from '../Constants';
import Utils from '../class/Utils';
import InputTextComponent from '../components/global/InputTextComponent.js';

export default function CreateNdaReceiverInfo(navigation) {
    const { theme } = useTheme();

    const navi = useNavigation();

    const [isLoading, setIsLoading] = useState(false);

    const [screen, setScreen] = useState('name');
    const [formData, setData] = useState({});


    const [visible, setVisible] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [userEmail, setUserEmail] = useState(null);

    const [isShowAddress, setIsShowAddress] = useState(true);

    const [token, setToken] = useState(null);
    const [address, setAddress] = useState(null);

    const [isVerifyRequire, setIsVerifyRequire] = useState(false);
    const [addVeriStat, setAddVeriStat] = useState(null);

    const [initialValue, setInitialValue] = useState('');

    const [visiblemanualAddInputModal, setVisiblemanualAddInputModal] = useState(false);

    const { height, width, scale, fontScale } = useWindowDimensions();


    const { data, isEdit } = navigation.route.params;
    console.log("receiver_Info:", navigation.route?.params);

    var errMsg = 'Error';

    useEffect(() => {
        // console.log('Sample ID:', sample_id);
        // console.log('Sample Name:', sample_name);
        // console.log('Document Name:', document_name);
        console.log('navigation:', navigation?.route?.params?.data);

        const ndaData = navigation?.route?.params?.data;
        const formattedAddress = ndaData && ndaData?.receiver_country ?
            ndaData?.receiver_city + ', ' + ndaData?.receiver_state + ', ' + ndaData?.receiver_postal_code + ', ' + ndaData?.receiver_country
            :
            '';

        setData({
            ...navigation.route?.params,
            searchAddress: navigation?.route?.params?.receiver_address || null,
            receiver_address: formattedAddress,
        });

        setAddress({
            ...address,
            address: ndaData?.receiver_address,
            city: ndaData?.receiver_city,
            prov: ndaData?.receiver_state,
            country: ndaData?.receiver_country,
            pc: ndaData?.receiver_postal_code,
        })

        navigation?.route?.params?.receiver_address && setInitialValue(navigation?.route?.params?.receiver_address)

        const asyncFunc = async () => {
            let userToken = await Token.getToken();
            let userEmail = await AsyncStorageManager.getData(CONSTANTS.USER_EMAIL /*'user_email'*/);
            setUserEmail(userEmail)
            if (userToken) {
                //getStateList(userToken);
                setToken(userToken);
            } else {
                console.log('Token not found');
                return false;
            }
        };

        asyncFunc();

        const gestureHandler = navi.addListener('beforeRemove', (e) => {

            console.log("Gesture listen");

            //BackHandler.exitApp();
            //e.preventDefault();
            //e.preventDefault();
            //return;
        });

        // return () => {
        //   //gestureHandle
        // }

    }, []);

    // useEffect(
    //   () => navi.getParent()?.setOptions({ gestureEnabled: true }),
    //   [],
    // );

    useEffect(() => {

        console.log('address: ' + address + " is Verify Require: " + isVerifyRequire)
        token && address && isVerifyRequire && addressVerify(token, address);
    }, [formData?.receiver_address && initialValue])

    useEffect(() => {
        console.log("Initial value: ")

        setIsShowAddress(false);
        setTimeout(() => setIsShowAddress(true), 10);

        console.log('Receiver address: ' + formData?.receiver_address);

        console.log('Search address: ' + formData?.searchAddress);

        formData?.searchAddress && !formData?.receiver_address && setInitialValue(formData?.searchAddress)

    }, [height, width])

    const addressVerify = async (token, address_) => {

        let isConected = await Utils.isNetConnected()
        console.log("Is net connected: " + isConected);
        if (!isConected) {
            Utils.netConnectionFaild();
            return
        }
        setAddVeriStat('processing');
        var stateApi = Url.VERIFY_ADDRESS;
        await fetch(stateApi, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
            },
            body: JSON.stringify({
                address_line1: address_.address,
                city: address_.city,
                state: address_.prov,
                country: address_.country,
                postal_code: address_.pc,

            }),
        })
            .then(response => response.json())
            .then(responseJson => {
                try {
                    var a = JSON.stringify(responseJson);
                    var json = JSON.parse(a);
                    if (responseJson.status === 200) {

                        console.log('Address verified => : ' + JSON.stringify(json));
                        const status = responseJson.data.status;
                        console.log('Address verify status: ' + status);

                        setAddVeriStat(status)

                        if (status === 'verified') {
                            setAddress({ ...address, address_status: 1 }) //Verifed
                        } else {
                            setAddress({ ...address, address_status: 2 }) //faild
                        }
                        //setIsLoading(false);
                    } else {
                        console.log('Address verifiy error: ' + JSON.stringify(json));

                        setAddress({ ...address, address_status: 0 }) //faild
                    }

                    //setIsLoading(false);
                } catch (error) {
                    console.warn(error);
                    console.log(error);
                    //setIsLoading(false);
                }
            })
            .catch(error => {
                console.warn(error);

                Utils.netConnectionFaild();
                //setIsLoading(false);
            });
    };

    const validate = () => {
        var valid = true;
        return valid;
    };

    const onPressNext = () => {

        if (formData?.searchAddress && formData?.searchAddress != '') {
            if (formData?.receiver_address && formData?.receiver_address != '') {
                goNextPage()
            } else {
                setErrorMsg('Enter a valid address');
                setVisible(true);
            }
        } else {
            goNextPage();
        }
    };

    const goNextPage = () => {

        if (validate()) {
            navi.navigate('create_nda_signing', {
                type: 'sender',
                id: data?.id,
                data: data,
                receiver_name: formData?.receiver_name,
                receiver_email: formData?.receiver_email,
                receiver_phone_number: formData?.receiver_phone_number,
                // receiver_company_name: formData?.receiver_company_name,
                receiver_address: address?.address,
                receiver_city: address?.city,
                receiver_state_id: address?.prov,
                receiver_country_code: address?.country,
                receiver_postal_code: address?.pc,
                receiver_address_status: isVerifyRequire ? address?.address_status : 2,

                custom_section: formData?.custom_section,

                displayAs: 'sender',

                isEdit: isEdit,
                status: 'pending' ///draft formData?.status,// 
            });
        } else {
            // Alert.alert('Error', `${errMsg}`, [{ text: 'OK', onPress: () => { } }]);
            setErrorMsg(errMsg);
            setVisible(true);
        }
    }

    const onPreviousClick = () => {
        if (screen == 'full') {
            navi.goBack();
        }
        if (screen == 'name') {
            // setScreen('full');
            navi.goBack();
        }
        if (screen == 'email') {
            setScreen('name');
        }
        if (screen == 'phone') {
            setScreen('email');
        }
        if (screen == 'others') {
            setScreen('phone');
        }

        if (screen == 'custom_section') {
            setScreen('others');
        }


    };

    const onNextClick = () => {
        console.log('clicked', screen);
        if (screen == 'full') {
            setScreen('name');
        }
        if (screen == 'name') {

            if (formData?.receiver_name) {

                const regexExp = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;

                let isEmojiContain = regexExp.test(formData?.receiver_name);
                if (isEmojiContain) {

                    console.log("text Contain emoji");

                    setErrorMsg('Names can only contain letters, numbers, periods (.), and underscores (_). \n Please remove any emojis from name. \n ' + formData?.receiver_name);

                    setVisible(true);

                    return;
                }
            }

            setScreen('email');
        }
        if (screen == 'email') {
            if (formData?.receiver_email?.trim() == userEmail) {
                setErrorMsg("You can't send NDA to yourself");
                setVisible(true);
                return;
            }
            //setScreen('phone');

            console.log('Receiver Email: ' + formData?.receiver_email);

            if (formData?.receiver_email === null || formData?.receiver_email === '' || formData?.receiver_email === undefined || Validator.Validate('email', formData?.receiver_email)) {
                setScreen('phone');
            } else {
                setErrorMsg('Invalid Email');
                setVisible(true);
            }
        }
        if (screen == 'phone') {
            setScreen('others');
        }

        if (screen == 'others') {
            setScreen('custom_section');
            //onPressNext();
        }

        if (screen == 'custom_section') {

            if (formData?.custom_section) {

                const regexExp = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;

                let isEmojiContain = regexExp.test(formData?.custom_section);
                if (isEmojiContain) {

                    console.log("text Contain emoji");

                    setErrorMsg('Custom section can only contain letters, numbers, periods (.), and underscores (_). \n Please remove any emojis from custom section. \n ' + formData?.custom_section);

                    setVisible(true);

                    return;
                }
            }

            onPressNext();
        }
    };

    return (
        <View style={{
            flex: 1,
            backgroundColor: 'transparent',
        }}>
            <SafeAreaView style={styles.container}>

                {height > 500 && (<LogoHeader />)}

                <AutocompleteDropdownContextProvider>
                    <KeyboardAvoidingView
                        style={{ flex: 1, width: width }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        enabled={Platform.OS === 'android' ? false : true}
                    >
                        <View style={{
                            flexGrow: 1,
                            justifyContent: 'center', marginTop: 15, paddingBottom: 0
                        }}>
                            <ScrollView
                                horizontal={false}
                                // style={styles.categoryListContainer}
                                contentContainerStyle={{
                                    flexGrow: 1,
                                    justifyContent: 'center',
                                    // paddingBottom: 70,
                                    //backgroundColor: 'red',
                                }}
                                showsHorizontalScrollIndicator={false}
                                keyboardShouldPersistTaps={'handled'}
                            //keyboardShouldPersistTaps={'always'}
                            >
                                {isLoading ? (
                                    <ActivityIndicator
                                        color={
                                            theme?.name == 'Light'
                                                ? globalStyle.colorAccent
                                                : theme?.colors?.text
                                        }
                                    />
                                ) : (

                                    <View style={{ ...styles.middleDive }}>
                                        {/* <Text style={{ ...styles.title, color: theme?.colors?.text, marginBottom: 50 }}>Shush It</Text> */}

                                        <Text
                                            style={{
                                                marginBottom: 40,
                                                textAlign: 'center',
                                                color: theme?.colors?.textContrast,
                                                textTransform: 'capitalize',

                                                fontFamily: theme?.font.body.fontFamily,
                                                fontWeight: theme?.font.body.fontWeight,
                                                fontSize: theme?.font.fontSize.xxl,
                                            }}>
                                            {screen == 'name' ? 'Recipient Name' : screen == 'others' ? 'Address' : screen == 'custom_section' ? 'Custom section (optional)' : screen}

                                            {/* Receiver Information */}
                                        </Text>

                                        {screen == 'name' && (
                                            <TextInput
                                                placeholderTitle={'Name'}
                                                // icon={<ProfileName />}

                                                icon={theme?.profileIcon?.profile}
                                                borderColor={theme?.textInput?.borderColor}
                                                backgroundColor={theme?.textInput?.backgroundColor}
                                                borderWidth={theme?.textInput?.borderWidth}
                                                darkShadowColor={theme?.textInput?.darkShadowColor}
                                                lightShadowColor={theme?.textInput?.lightShadowColor}
                                                shadowOffset={theme?.textInput?.shadowOffset}
                                                placeholderColor={theme?.textInput?.placeholderColor}
                                                inputColor={theme?.textInput?.inputColor}
                                                // defaultValue={receiver_name}

                                                value={formData?.receiver_name}
                                                onChangeText={value => {
                                                    console.log('Name==: ' + value);
                                                    setData({ ...formData, receiver_name: value });
                                                    // handleInput('name', value);
                                                }}
                                                isAutoFoucus={false}
                                                returnKeyType={'next'}
                                                onSubmit={() => onNextClick()}
                                                isSubmitOnBlur={false}
                                                type={Platform.OS === 'ios' ? 'text' : 'url'}
                                            />
                                        )}

                                        {screen == 'email' && (
                                            <TextInput
                                                placeholderTitle={'Email'}
                                                // icon={<EmailSVG />}
                                                icon={theme?.profileIcon?.email}
                                                borderColor={theme?.textInput?.borderColor}
                                                backgroundColor={theme?.textInput?.backgroundColor}
                                                borderWidth={theme?.textInput?.borderWidth}
                                                darkShadowColor={theme?.textInput?.darkShadowColor}
                                                lightShadowColor={theme?.textInput?.lightShadowColor}
                                                shadowOffset={theme?.textInput?.shadowOffset}
                                                placeholderColor={theme?.textInput?.placeholderColor}
                                                inputColor={theme?.textInput?.inputColor}
                                                value={formData?.receiver_email}
                                                type='email'
                                                // defaultValue={receiver_email}
                                                onChangeText={value => {
                                                    console.log('Email==: ' + value);
                                                    setData({ ...formData, receiver_email: value });
                                                }}
                                                isAutoFoucus={false}
                                                returnKeyType={'next'}
                                                onSubmit={() => onNextClick()}
                                                isSubmitOnBlur={false}
                                            />
                                        )}

                                        {screen == 'phone' && (
                                            <TextInput
                                                placeholderTitle={'Phone no.'}
                                                // icon={<Phone />}
                                                icon={theme?.profileIcon?.phone}
                                                borderColor={theme?.textInput?.borderColor}
                                                backgroundColor={theme?.textInput?.backgroundColor}
                                                borderWidth={theme?.textInput?.borderWidth}
                                                darkShadowColor={theme?.textInput?.darkShadowColor}
                                                lightShadowColor={theme?.textInput?.lightShadowColor}
                                                shadowOffset={theme?.textInput?.shadowOffset}
                                                placeholderColor={theme?.textInput?.placeholderColor}
                                                inputColor={theme?.textInput?.inputColor}
                                                value={formData?.receiver_phone_number}
                                                type='tel'
                                                // defaultValue={receiver_phone_number}
                                                onChangeText={value => {
                                                    console.log('Phone==: ' + value);
                                                    setData({ ...formData, receiver_phone_number: value });
                                                }}
                                                isAutoFoucus={false}
                                                returnKeyType={'next'}
                                                onSubmit={() => onNextClick()}
                                                isSubmitOnBlur={false}
                                            />
                                        )}

                                        {!visiblemanualAddInputModal && screen == 'others' && (
                                            <>
                                                {/* <View>
                                                    {isShowAddress && (
                                                        <AutoCompleteDropDown
                                                            initialValue={initialValue ? initialValue : ''}
                                                            url={Url.ADDRESS_AUTO_SUGG_}
                                                            onChangeInput={(text) => {
                                                                console.log("onChangeInput ==>", text);
                                                                setData({
                                                                    ...formData,
                                                                    searchAddress: text,
                                                                })
                                                            }}

                                                            onSelectItemL={(item) => {

                                                                setIsVerifyRequire(true);
                                                                console.log('Selected' + JSON.stringify(item));

                                                                if (address?.obj != item?.obj) {
                                                                    setAddVeriStat(null);
                                                                }

                                                                if (item != null && item?.obj) {
                                                                    setData({ ...formData, receiver_address: item?.address });
                                                                    setInitialValue(item?.obj?.address)
                                                                    console.log('Selected address: ' + JSON.stringify(item.obj));
                                                                    setAddress(item.obj)
                                                                }
                                                            }
                                                            }

                                                            onPressAddManualAddress={() => {
                                                                console.log("On Press")
                                                                setVisiblemanualAddInputModal(true);
                                                            }}

                                                            onClear={(isFocus = false) => {
                                                                setAddress(null);


                                                                console.log('On Clere on focus: ' + isFocus);
                                                                console.log('On Clere on focus: address ' + JSON.stringify(address));
                                                                if (isFocus) {
                                                                    address && setInitialValue(address ? address?.address : 'blank');
                                                                } else {
                                                                    setInitialValue('');
                                                                }
                                                                setData({ ...formData, searchAddress: '', receiver_address: '' });
                                                                setAddVeriStat(null);
                                                            }}

                                                            placeholderTitle={'Select State'}
                                                            divideWidthBy={1.2}
                                                            borderColor={theme?.textInput?.borderColor}
                                                            backgroundColor={
                                                                theme?.textInput?.backgroundColor
                                                            }
                                                            borderWidth={theme?.textInput?.borderWidth}
                                                            darkShadowColor={
                                                                theme?.textInput?.darkShadowColor
                                                            }
                                                            lightShadowColor={
                                                                theme?.textInput?.lightShadowColor
                                                            }
                                                            shadowOffset={theme?.textInput?.shadowOffset}
                                                            placeholderColor={
                                                                theme?.textInput?.placeholderColor
                                                            }
                                                            inputColor={theme?.textInput?.inputColor}
                                                            theme={theme}
                                                        />)}
                                                </View>

                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        paddingVertical: 20,
                                                        gap: 10,
                                                    }}>
                                                    <TextInput
                                                        placeholderTitle={'City, State Postal code'}
                                                        icon={theme?.profileIcon?.location}
                                                        borderColor={theme?.textInput?.borderColor}
                                                        backgroundColor={theme?.textInput?.backgroundColor}
                                                        borderWidth={theme?.textInput?.borderWidth}
                                                        darkShadowColor={theme?.textInput?.darkShadowColor}
                                                        lightShadowColor={theme?.textInput?.lightShadowColor}
                                                        shadowOffset={theme?.textInput?.shadowOffset}
                                                        placeholderColor={theme?.textInput?.placeholderColor}
                                                        inputColor={theme?.textInput?.inputColor}
                                                        value={formData?.receiver_address}
                                                        disabled={true}
                                                        onChangeText={value => {
                                                            console.log('Address==: ' + value);
                                                            setData({ ...formData, receiver_address: value });
                                                        }}
                                                        isVerified={addVeriStat}
                                                    />
                                                </View> */}
                                                <View style={{ marginBottom: 20 }}>
                                                    <InputTextComponent
                                                        placeholderTitle={'Address'}
                                                        borderColor={theme?.textInput?.borderColor}
                                                        backgroundColor={theme?.textInput?.backgroundColor}
                                                        borderWidth={theme?.textInput?.borderWidth}
                                                        darkShadowColor={theme?.textInput?.darkShadowColor}
                                                        lightShadowColor={theme?.textInput?.lightShadowColor}
                                                        shadowOffset={theme?.textInput?.shadowOffset}
                                                        placeholderColor={theme?.textInput?.placeholderColor}
                                                        inputColor={theme?.textInput?.inputColor}
                                                        value={formData?.searchAddress}
                                                        onChangeText={value => {
                                                            setData({ ...formData, searchAddress: value, receiver_address: value });
                                                            setAddress({ ...address, address: value });
                                                        }}
                                                        isAutoFoucus={false}
                                                        type='text'
                                                    />
                                                </View>
                                                <View style={{ marginBottom: 20 }}>

                                                    <InputTextComponent
                                                        placeholderTitle={'City'}
                                                        borderColor={theme?.textInput?.borderColor}
                                                        backgroundColor={theme?.textInput?.backgroundColor}
                                                        borderWidth={theme?.textInput?.borderWidth}
                                                        darkShadowColor={theme?.textInput?.darkShadowColor}
                                                        lightShadowColor={theme?.textInput?.lightShadowColor}
                                                        shadowOffset={theme?.textInput?.shadowOffset}
                                                        placeholderColor={theme?.textInput?.placeholderColor}
                                                        inputColor={theme?.textInput?.inputColor}
                                                        value={address?.city}
                                                        onChangeText={value => {
                                                            setAddress({ ...address, city: value });
                                                        }}
                                                        isAutoFoucus={false}
                                                        type='text'
                                                    />
                                                </View>
                                                <View style={{ marginBottom: 20 }}>
                                                    <InputTextComponent
                                                        placeholderTitle={'State'}
                                                        borderColor={theme?.textInput?.borderColor}
                                                        backgroundColor={theme?.textInput?.backgroundColor}
                                                        borderWidth={theme?.textInput?.borderWidth}
                                                        darkShadowColor={theme?.textInput?.darkShadowColor}
                                                        lightShadowColor={theme?.textInput?.lightShadowColor}
                                                        shadowOffset={theme?.textInput?.shadowOffset}
                                                        placeholderColor={theme?.textInput?.placeholderColor}
                                                        inputColor={theme?.textInput?.inputColor}
                                                        value={address?.prov}
                                                        onChangeText={value => {
                                                            setAddress({ ...address, prov: value });
                                                        }}
                                                        isAutoFoucus={false}
                                                        type='text'
                                                    />
                                                </View>
                                                <View style={{ marginBottom: 20 }}>
                                                    <InputTextComponent
                                                        placeholderTitle={'Postal code'}
                                                        borderColor={theme?.textInput?.borderColor}
                                                        backgroundColor={theme?.textInput?.backgroundColor}
                                                        borderWidth={theme?.textInput?.borderWidth}
                                                        darkShadowColor={theme?.textInput?.darkShadowColor}
                                                        lightShadowColor={theme?.textInput?.lightShadowColor}
                                                        shadowOffset={theme?.textInput?.shadowOffset}
                                                        placeholderColor={theme?.textInput?.placeholderColor}
                                                        inputColor={theme?.textInput?.inputColor}
                                                        value={address?.pc}
                                                        onChangeText={value => {
                                                            setAddress({ ...address, pc: value });
                                                        }}
                                                        isAutoFoucus={false}
                                                        type='text'
                                                    />
                                                </View>
                                                <View style={{ marginBottom: 20 }}>
                                                    <InputTextComponent
                                                        placeholderTitle={'Country'}
                                                        borderColor={theme?.textInput?.borderColor}
                                                        backgroundColor={theme?.textInput?.backgroundColor}
                                                        borderWidth={theme?.textInput?.borderWidth}
                                                        darkShadowColor={theme?.textInput?.darkShadowColor}
                                                        lightShadowColor={theme?.textInput?.lightShadowColor}
                                                        shadowOffset={theme?.textInput?.shadowOffset}
                                                        placeholderColor={theme?.textInput?.placeholderColor}
                                                        inputColor={theme?.textInput?.inputColor}
                                                        value={address?.country}
                                                        onChangeText={value => {
                                                            setAddress({ ...address, country: value });
                                                        }}
                                                        isAutoFoucus={false}
                                                        type='text'
                                                    />
                                                </View>
                                            </>
                                        )}

                                        {screen == 'custom_section' && (
                                            <TextInputDetails
                                                placeholderTitle={'Custom section'}
                                                // icon={<ProfileName />}

                                                icon={theme?.profileIcon?.profile}
                                                borderColor={theme?.textInput?.borderColor}
                                                backgroundColor={theme?.textInput?.backgroundColor}
                                                borderWidth={theme?.textInput?.borderWidth}
                                                darkShadowColor={theme?.textInput?.darkShadowColor}
                                                lightShadowColor={theme?.textInput?.lightShadowColor}
                                                shadowOffset={theme?.textInput?.shadowOffset}
                                                placeholderColor={theme?.textInput?.placeholderColor}
                                                inputColor={theme?.textInput?.inputColor}

                                                value={formData?.custom_section}
                                                onChangeText={value => {
                                                    console.log('Nda details==: ' + value);
                                                    setData({ ...formData, custom_section: value });

                                                }}
                                                isAutoFoucus={false}
                                                returnKeyType={'next'}
                                                onSubmit={() => onNextClick()}
                                                isSubmitOnBlur={false}
                                                type={Platform.OS === 'ios' ? 'text' : 'url'}
                                            />
                                        )}

                                        {screen != 'full' && (
                                            <View
                                                style={{
                                                    ...styles.direction,
                                                    // justifyContent: screen != 'name' ? 'space-between' : 'center',
                                                    marginTop: screen == 'others' ? 50 : 100,
                                                    marginBottom: screen == 'others' ? 50 : 0,
                                                    zIndex: 1000
                                                }}>
                                                {/* {screen != 'name' && ( */}
                                                <TouchableOpacity
                                                    onPress={() => onPreviousClick()}
                                                    style={{ zIndex: 1000 }}
                                                    accessibilityLabel={'previous'}
                                                >
                                                    {theme?.profileIcon?.backward}
                                                </TouchableOpacity>
                                                {/* )} */}

                                                <TouchableOpacity
                                                    onPress={() => onNextClick()}
                                                    style={{ zIndex: 1000 }}
                                                    accessibilityLabel={'next'}
                                                >
                                                    {theme?.profileIcon?.forward}
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>

                                )}
                            </ScrollView>
                        </View>

                        <ModalPoup
                            theme={theme}
                            visible={visible}
                            title={errorMsg}
                            source={require('../../assets/sign_in_animation.json')}
                            btnTxt={'Ok'}
                            onPressOk={() => setVisible(false)}
                            onPressClose={() => setVisible(false)}
                        />

                        <ModalPopupManualAddress
                            theme={theme}
                            visible={visiblemanualAddInputModal}
                            title={'Manual Address Input'}
                            //source={require('../../assets/resetPass.json')}
                            onPressClose={() => {
                                // console.log('pressing_cancel')
                                //setShowResetPassModal(false)
                                setVisiblemanualAddInputModal(false)
                            }}
                            onResetSuccess={async () => {
                                console.log("OnReset Success got")

                            }}
                            addressData={async (data) => {
                                console.log("Address Success got " + JSON.stringify(data))

                                let da = {
                                    "id": 0,
                                    "title": data.address,
                                    "dropDown": data.address,
                                    "house_road": data.address,
                                    "address": data.city + ', ' + data.pc + ', ' + data.country,
                                    "obj": {
                                        "address": data.address,
                                        "city": data.city,
                                        "prov": data.state,
                                        "pc": data.pc,
                                        "country": data.country,
                                        "address_status": 0, //unverified
                                    }
                                };

                                setIsVerifyRequire(false);

                                console.log('Selected' + JSON.stringify(data));

                                setData({ ...formData, searchAddress: data?.address });
                                setInitialValue(data?.address)

                                if (da != null && da?.obj) {
                                    setData({ ...formData, receiver_address: da?.address });//,searchAddress: item?.obj?.address 
                                    console.log('Selected address: ' + JSON.stringify(da?.obj));
                                    setAddress(da.obj)
                                }
                                setVisiblemanualAddInputModal(false)
                            }
                            }
                            saveBtnDisable={true} />
                    </KeyboardAvoidingView>
                </AutocompleteDropdownContextProvider>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    infoDiv: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueDiv: {
        marginStart: 20,
    },
    type: {
        fontSize: 14,
    },
    direction: {
        marginTop: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    middleDive: {
        //paddingVertical: 250,

        flexGrow: 1,
        justifyContent: 'center',

        //width: '90%',

        // backgroundColor: 'green',
        //marginTop: 'auto',

        alignContent: 'center',

        paddingTop: 'auto',
        marginBottom: 'auto',

        marginLeft: 'auto',
        marginRight: 'auto',

        //backgroundColor: 'red',

    },

    bgImage: {
        flex: 1,
        position: 'absolute',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        //paddingTop: globalStyle.topPadding,
        // backgroundColor: globalStyle.statusBarColor,
    },
    title: {
        fontSize: 24,
        fontWeight: 500,
        textAlign: 'center',

        // color: '#2E476E',
        // fontSize: 15,
        // fontWeight: 300,
        // lineHeight: 25,
        // textTransform: 'uppercase',
        // paddingVertical: 30,
        // paddingHorizontal: 40,
    },
    btnDiv: {
        marginTop: 5,
        paddingHorizontal: 35,
        paddingBottom: globalStyle.bottomPadding,
    },
    btnText: {
        color: 'white',
        fontSize: 18,
    },
});
