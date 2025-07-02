import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation, useRoute } from '@react-navigation/native';
import { React, useEffect, useState, useRef } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ActionSheetIOS,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    useWindowDimensions
} from 'react-native';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

//Image Resource
//Assets

//Variables

//Class

import API_URLS from '../Api.js';
import { get, post } from '../class/ApiManager.js';
import Token from '../class/TokenManager.js';
import AsyncStorageManager from '../class/AsyncStorageManager.js';
import Utils from '../class/Utils.js';
import { apiErrorCheck } from '../class/AuthManager.js';
//Component
import globalStyle from '../../styles/MainStyle.js';
import { useTheme } from '../../styles/ThemeProvider';
import CustomButton from '../components/global/ButtonComponent.js';
import ModalPoup from '../components/global/ModalPoupComponent';
import ModalPopupConfirmation from '../components/global/ModalPopupConfirmation.js';
import ModalPopupManualAddress from '../components/global/ModalPopupManualAddress';

import Validator from '../class/Validator.js';
import SignatureComponentNew from '../components/global/SignatureComponentNew.js';
import TermsCondition from './TermsCondition.js';
import { AutoCompleteDropDown } from '../components/global/AutoCompleteDropdownComp.js';
import { AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';
import CONSTANTS from '../Constants.js';
import FastImage from 'react-native-fast-image';
import { BlurView } from '@react-native-community/blur';
import InputTextComponent from '../components/global/InputTextComponent.js';

import ActionSheet, { SheetManager, SheetProvider } from "react-native-actions-sheet";
import LogoHeader from '../components/global/LogoHeader.js';
import { DIM } from '../../styles/Dimensions.js';

export default function Profile(navigation) {
    // console.log("navigation ==>", navigation.route?.params?.from);
    const actionSheetRef = useRef()

    const navi = useNavigation();

    const route = useRoute();
    const { theme, bg } = useTheme();

    const onClose = () => {
        //actionSheetRef?.current?.hide()

        if (Platform.OS === "ios") {
            SheetManager.hideAll();
        } else if (Platform.OS === 'android') {
            actionSheetRef?.current?.hide()
        }
    }

    const [saveBtnLoad, setSaveBtnLoad] = useState(false);
    const [isSignatureLoaded, setIsSignatureLoaded] = useState(false);

    const [isSigLoadedOnRotate, setSigLoadedOnRotate] = useState(false);

    const [isTakeSig, setIsTakeSig] = useState(false);

    const [isSigReload, setSigReload] = useState(true);

    const [isSuccess, setIsSuccess] = useState(false);
    const [msg, setMsg] = useState(false);
    const [visible, setVisible] = useState(false);

    const [confirmForProfile, setConfirmForProfile] = useState(false);
    const [isImageUploaded, setIsImageUploaded] = useState(false);

    const [profileImage, setProfileImage] = useState('');


    const [uploadedImageInfo, setUploadedImageInfo] = useState({});
    const [isRightBtn, setIsRightBtn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [btnLoad, setBtnLoad] = useState(false);
    const [formData, setData] = useState({});
    const [oldPic, setOldPic] = useState(null);

    //const [token, setToken] = useState('');
    const [screen, setScreen] = useState('name'); //'full'

    const [address, setAddress] = useState(null);

    const [isAddVerify, setAddVerify] = useState(false);
    const [addVeriStat, setAddVeriStat] = useState(null);

    const [isShowAddress, setIsShowAddress] = useState(true);

    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();

    var isComeFromHome = false;

    const [visiblemanualAddInputModal, setVisiblemanualAddInputModal] = useState(false);
    const [isVerifyRequire, setIsVerifyRequire] = useState(true);
    const [initialValue, setInitialValue] = useState('');

    const [lastAddress, setLastInputAddress] = useState('');

    const { height, width, scale, fontScale } = useWindowDimensions();

    useEffect(() => {
        //console.log("OK theme  come from route: " + route.name);
        if (
            route &&
            (route.name === 'my_profile_home' || route.name === 'my_profile_inbox')
        ) {
            setScreen('name');
            isComeFromHome = true

        } else {
            setScreen('full'); //'full
        }

        getSavedProfile();

        console.log(" Navi Route: " + route);
        // const asyncFunc = async () => {
        //   let token = await Token.getToken();
        //   setToken(token);
        // };
        // asyncFunc();
        getProfileInfo();
        console.log('Bottom height: ' + tabBarHeight + 'inset: ' + insets.top);
    }, []);

    useEffect(() => {
        address && isVerifyRequire && addressVerify(address);
    }, [formData.formattedAddress]);

    useEffect(() => {

    }, [visible, formData.formattedAddress, isImageUploaded, confirmForProfile]);

    useEffect(() => {
        console.log("Height Width value change ");

        setIsShowAddress(false);
        setTimeout(() => setIsShowAddress(true), 10);

        !formData?.formattedAddress && setInitialValue(lastAddress)
        formData?.formattedAddress && setInitialValue(formData?.searchAddress)

    }, [height, width])


    const handlePress = () => {
        if (screen == 'name') {
            setScreen('full');
        } else {
            navi.goBack();
        }
    };

    const getSavedProfile = async () => {

        const fullName = await AsyncStorageManager.getData(CONSTANTS.PROFILE.NAME);
        const email = await AsyncStorageManager.getData(CONSTANTS.PROFILE.EMAIL);
        const phone = await AsyncStorageManager.getData(CONSTANTS.PROFILE.PHONE);

        const searchAddress = await AsyncStorageManager.getData(CONSTANTS.PROFILE.SEARCH_ADDRESS);
        const formatedAddress = await AsyncStorageManager.getData(CONSTANTS.PROFILE.FORMATED_ADDRESS);
        const profileAvater = await AsyncStorageManager.getData(CONSTANTS.PROFILE.AVATER);

        const city = await AsyncStorageManager.getData(CONSTANTS.PROFILE.CITY);
        const postalCode = await AsyncStorageManager.getData(CONSTANTS.PROFILE.POSTAL_CODE);
        const stateId = await AsyncStorageManager.getData(CONSTANTS.PROFILE.STATE_ID);
        const countryCode = await AsyncStorageManager.getData(CONSTANTS.PROFILE.COUNTRY_CODE);

        setData({
            ...formData,

            full_name: fullName,
            email: email,
            phone_number: phone,
            formattedAddress: formatedAddress,
            searchAddress: searchAddress,

            city: city,
            postal_code: postalCode,
            state_id: stateId,
            country_code: countryCode
        });

        setInitialValue(
            searchAddress
        );

        setProfileImage(profileAvater);

        setAddVeriStat('verified');

        setAddress({ ...address, address_status: 1 })

        console.log(' Get name, email and phone from Local: ' + fullName + " " + email + " " + phone);
        console.log(' Get Search address from Local: ' + searchAddress + " " + formatedAddress);
    }

    const getProfileInfo = async (isProfileStatus = false) => {

        setIsLoading(true);

        var profileApi_ = API_URLS.PROFILE_;
        get(profileApi_)
            .then(async (data) => {
                try {
                    console.log("Profile.js -Profile-" + JSON.stringify(data))

                    var a = JSON.stringify(data);
                    var json = JSON.parse(a);

                    var profileInfo = json.data;
                    if (!isProfileStatus) {

                        const formattedAddress =
                            profileInfo?.address && profileInfo?.country_code
                                ? profileInfo?.city +
                                ', ' +
                                profileInfo?.state_id +
                                ', ' +
                                profileInfo?.postal_code +
                                ', ' +
                                profileInfo?.country_code
                                : '';

                        setData({
                            ...profileInfo,
                            formattedAddress: formattedAddress,
                            searchAddress: profileInfo.address || null,
                        });


                        //Store Profile Info for Local

                        console.log('Profile: ' + JSON.stringify(profileInfo));

                        await AsyncStorageManager.storeData(CONSTANTS.PROFILE.NAME, profileInfo.full_name ? profileInfo.full_name : '');
                        await AsyncStorageManager.storeData(CONSTANTS.PROFILE.EMAIL, profileInfo.email ? profileInfo.email : '');
                        await AsyncStorageManager.storeData(CONSTANTS.PROFILE.PHONE, profileInfo.phone_number ? profileInfo.phone_number : '');

                        await AsyncStorageManager.storeData(CONSTANTS.PROFILE.SEARCH_ADDRESS, profileInfo.address ? profileInfo.address : '');
                        await AsyncStorageManager.storeData(CONSTANTS.PROFILE.FORMATED_ADDRESS, formattedAddress ? formattedAddress : '');

                        await AsyncStorageManager.storeData(CONSTANTS.PROFILE.AVATER, profileInfo?.avatar ? API_URLS.IMAGE_URL + profileInfo?.avatar : '');

                        await AsyncStorageManager.storeData(CONSTANTS.PROFILE.CITY, profileInfo?.city ? profileInfo?.city : '');
                        await AsyncStorageManager.storeData(CONSTANTS.PROFILE.STATE_ID, profileInfo?.state_id ? profileInfo?.state_id : '');
                        await AsyncStorageManager.storeData(CONSTANTS.PROFILE.POSTAL_CODE, profileInfo?.postal_code ? profileInfo?.postal_code : '');
                        await AsyncStorageManager.storeData(CONSTANTS.PROFILE.COUNTRY_CODE, profileInfo?.country_code ? profileInfo?.country_code : '');

                        //Store Profile Info for Local end


                        setInitialValue(profileInfo?.address ? profileInfo?.address : '')

                        setAddVeriStat(
                            profileInfo?.address ? profileInfo?.address_verification : null,
                        );

                        setAddress({ ...address, address_status: profileInfo?.address_verify_status })

                        if (profileInfo?.avatar !== null || profileInfo?.avatar !== undefined || profileInfo?.avatar !== '') {
                            setOldPic(profileInfo?.avatar);

                            console.log("Profile Image URL: " + API_URLS.IMAGE_URL + profileInfo?.avatar)
                            profileInfo?.avatar && setProfileImage(API_URLS.IMAGE_URL + profileInfo?.avatar);
                        }

                        setIsLoading(false);
                    } else {
                        const profileStatus = profileInfo.profile_status;
                        console.log('profile status==>' + profileStatus);
                        AsyncStorageManager.storeData(
                            CONSTANTS.PROFILE_STATUS,
                            profileStatus + '',
                        );
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.log("Error: ", error);
                    setIsLoading(false);
                }
            })
            .catch(error => {

                console.log('Profile == ');
                console.warn("Error got: " + error)
                setIsLoading(false);

                apiErrorCheck(error, navi)
            }
            );
    };

    //Signature upload
    const handleOnSave = async (signature = formData?.signature) => {
        setSaveBtnLoad(true);
        setBtnLoad(true);

        let isConected = await Utils.isNetConnected()
        console.log("Is net connected: " + isConected);
        if (!isConected) {
            Utils.netConnectionFaild();
            setSaveBtnLoad(false);
            setBtnLoad(false);
            return
        }

        var formDataN = new FormData();

        if (isImageUploaded) {
            formDataN.append('avatar', {
                name: uploadedImageInfo.fileName,
                type: uploadedImageInfo.type,
                uri: uploadedImageInfo.uri,
            });
        }

        console.log('Photo uri: ' + JSON.stringify(uploadedImageInfo));

        if (isSignatureLoaded || isSigLoadedOnRotate) {
            // var Base64Code = formData?.signature.replace('data:image/png;base64,', '');
            formDataN.append('signature', signature);
            // formDataN.append('signature', formData?.signature);
        }

        formDataN.append('full_name', formData.full_name || '');
        formDataN.append('email', formData.email || '');
        formDataN.append('phone_number', formData.phone_number || '');
        formDataN.append('company_name', formData.company_name || '');
        formDataN.append('address', formData.searchAddress || '');
        // formDataN.append('address', formData.address || '');
        formDataN.append('city', formData.city || '');
        formDataN.append('postal_code', formData.postal_code || '');
        formDataN.append('state_id', formData.state_id || '');
        formDataN.append('country_code', formData.country_code);
        formDataN.append('address_verification', addVeriStat);
        formDataN.append('address_verify_status', isVerifyRequire ? address?.address_status : 2);

        //formDataN.append('country_id', formData.country_id);

        console.log('formDataN==>', formDataN);

        try {
            let token = await Token.getToken();
            var api = API_URLS.PROFILE_UPDATE;
            console.log('update profile api', api);
            await fetch(api, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-Encoding': Platform.OS === 'ios' ? 'gzip' : '',
                    //'Content-Type': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
                },
                body: formDataN,
            })
                .then(response => response.json())
                .then(responseJson => {
                    try {
                        var a = JSON.stringify(responseJson);
                        var json = JSON.parse(a);
                        if (responseJson.status === 200) {
                            setBtnLoad(false);
                            setSaveBtnLoad(false);
                            console.log('Status==> ok');
                            setIsSuccess(true);

                            //Message
                            if (Platform.OS === 'ios') {
                                Utils.showAlertDialog(json?.message)

                                profileUpdateSucces(true)
                                // if (route.name == 'my_profile_home') {
                                //   // navi.navigate('home');
                                //   navi.navigate('tab_home', { screen: 'home' });
                                //   console.log("Come from home")
                                //   // navi.dispatch(StackActions.replace('home'));
                                // } else {
                                //   setScreen('full');
                                //   // navi.navigate('profile')
                                // }

                            } else {
                                setMsg(json?.message);
                                setVisible(true);
                            }


                            //Loading
                            setIsLoading(false);
                            setConfirmForProfile(false);

                            //For get profile
                            getProfileInfo(true);
                        } else {
                            console.log('Error==>', JSON.stringify(json));
                            setIsSuccess(false);

                            //Message
                            if (Platform.OS === 'ios') {
                                Utils.showAlertDialog(json?.message)

                                //setVisible(false);
                                setIsSuccess(false);

                            } else {
                                setMsg(json?.message);
                                setVisible(true);
                            }

                            //Loading
                            setBtnLoad(false);
                            setSaveBtnLoad(false);
                            setIsLoading(false);
                            setConfirmForProfile(false);
                        }
                    } catch (error) {
                        console.warn(error);
                        console.log(error);
                        setIsSuccess(false);
                        setBtnLoad(false);
                        setSaveBtnLoad(false);
                        setIsLoading(false);
                        setConfirmForProfile(false);
                    }
                })
                .catch(error => {
                    console.warn(error);
                    setIsSuccess(false);
                    setBtnLoad(false);
                    setSaveBtnLoad(false);
                    setIsLoading(false);
                    setConfirmForProfile(false);

                    Utils.netConnectionFaild();
                });
        } catch (error) {
            console.warn(error);
            console.log(error);
            setIsSuccess(false);
            setBtnLoad(false);
            setSaveBtnLoad(false);
            setIsLoading(false);

            Utils.netConnectionFaild();
        }
    };

    const getSignature = async signature => {
        console.log('profile getSignature==>', signature);
        //console.log('formData signature==>', formData?.signature);
        if (signature) {
            setData({ ...formData, signature: signature });
            setIsSignatureLoaded(true);
            setIsTakeSig(false);
            setScreen('tc');

            // setIsLoading(true);
            // handleOnSave(true, signature);
        } else {
            setIsSignatureLoaded(false);
            setIsTakeSig(false);
            setScreen('tc');
        }
    };

    const setRotateSignature = async signature => {
        console.log('profile setRotateSignature==>', signature);
        //console.log('formData signature==>', formData?.signature);
        if (signature) {
            setData({ ...formData, signature: signature });


            setSigLoadedOnRotate(true)
            //setIsTakeSig(false);
            /// setScreen('tc');

            // setIsLoading(true);
            // handleOnSave(true, signature);
        } else {

            setSigLoadedOnRotate(false)
            //setIsTakeSig(false);
            //setScreen('tc');
        }
    };

    const onBackClick = () => {
        setIsTakeSig(false);
        console.log('On back press');
    };

    const onPreviousClick = () => {
        if (screen == 'full') {
            navi.goBack();
        }
        if (screen == 'name') {
            setScreen('full');
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
        if (screen == 'tc') {
            setScreen('others');
            setIsTakeSig(true);
        }
    };

    const onNextClick = () => {

        if (screen == 'full') {
            setScreen('name');
        }

        if (screen == 'name') {
            if (formData?.full_name != '') {

                if (formData?.full_name) {

                    const regexExp = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;

                    let isEmojiContain = regexExp.test(formData?.full_name);
                    if (isEmojiContain) {

                        console.log("text Contain emoji");

                        setMsg('Names can only contain letters, numbers, periods (.), and underscores (_). \n Please remove any emojis from your name. \n ' + formData?.full_name);
                        setVisible(true);
                        return;
                    }
                }


                setScreen('email');
            } else {
                setMsg('Name is required');
                setVisible(true);
            }
        }

        if (screen == 'email') {
            setScreen('phone');
        }

        if (screen == 'phone') {
            if (formData?.phone_number != '') {
                if (Validator.Validate('phone', formData?.phone_number)) {
                    setScreen('others');
                } else {
                    setMsg('Invalid phone number');
                    setVisible(true);
                }
            } else {
                setMsg('Phone number is required');
                setVisible(true);
            }
        }

        if (screen == 'others') {
            if (addVeriStat == 'processing') {
                return;
            }

            console.log('formData?.searchAddress', formData?.searchAddress);
            if (formData?.searchAddress && formData?.searchAddress != '') {
                // if (formData?.formattedAddress && formData?.formattedAddress != '') {
                //     setIsTakeSig(true);
                // } else {
                //     setMsg('Enter a valid address');
                //     setVisible(true);
                // }
                setIsTakeSig(true);
            } else {
                setMsg('Address is required');
                setVisible(true);
            }
        }
    };

    const addressVerify = async (address) => {
        //setIsLoading(true);
        setAddVeriStat('processing');


        let addressVerifyApi = API_URLS.VERIFY_ADDRESS_;

        let body = {
            address_line1: address.address,
            city: address.city,
            state: address.prov,
            country: address.country,
            postal_code: address.pc,
        }

        post(addressVerifyApi, body).then(responseJson => {
            try {
                console.log('Address verifiy :', JSON.stringify(responseJson));

                var a = JSON.stringify(responseJson);
                var json = JSON.parse(a);

                if (responseJson.status === 200) {
                    console.log('Address verifiy : ' + JSON.stringify(json));
                    const status = responseJson.data.status;
                    // console.log('Address verifiy status: ' + status);
                    console.log('Address json status: ' + responseJson.data.status);

                    setAddVeriStat(status);

                    if (status === 'verified') {
                        setAddress({ ...address, address_status: 1 }) //Verifed
                    } else {
                        setAddress({ ...address, address_status: 2 }) //faild
                    }
                    //setIsLoading(false);
                } else {
                    console.log('Address verifiy error: ' + JSON.stringify(json));
                    setAddVeriStat(responseJson.data.status);

                    setAddress({ ...address, address_status: 0 }) //faild
                }

                setAddVerify(true);
            } catch (error) {
                console.log("Error: " + error);
                console.log(error);
                setAddVeriStat('failed');
            }
        }).catch(error => {
            console.warn("Error got: " + error)
            console.log(error);
            setAddVeriStat('failed');
        })
    };

    const captureImage = async () => {
        Utils.setAutoLockPause(true);
        var options = {
            title: 'Select Image',
            customButtons: [
                {
                    name: 'customOptionKey',
                    title: 'Choose Photo from Custom Option',
                },
            ],
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            quality: 0.1,
        };

        onClose();

        await launchCamera(options, response => {
            if (response && response.assets) {
                console.log('Response==>', response?.assets[0]);
                let asset = response?.assets[0];
                let fileSize = response?.assets[0].fileSize;

                console.log('Selected image file size: ', fileSize / 1000 + 'KB');

                setUploadedImageInfo(asset);
                setData({ ...formData, avatar_local: asset?.uri });
                setIsImageUploaded(true);

                setProfileImage(asset?.uri)

                setConfirmForProfile(true);
                onClose();
            }
        });
    };

    //Profile Image picker
    const uploadImage = async () => {
        Utils.setAutoLockPause(true);

        var options = {
            title: 'Select Image',
            customButtons: [
                {
                    name: 'customOptionKey',
                    title: 'Choose Photo from Custom Option',
                },
            ],
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            quality: 0.1,
        };

        onClose();

        await launchImageLibrary(options, response => {
            if (response && response.assets) {
                // console.log('Response>', response?.assets[0]);
                let asset = response?.assets[0];

                let fileSize = response?.assets[0].fileSize;
                console.log('Selected image file size: ', fileSize / 1000 + 'KB');

                setUploadedImageInfo(asset);
                setData({ ...formData, avatar_local: asset?.uri });
                setIsImageUploaded(true);

                setConfirmForProfile(true);

                console.log('Profile Image asset: ' + asset?.uri)

                setProfileImage(asset?.uri)
                onClose();
            }
        });
    };

    const openIosBottomSheet = () =>
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: ['Cancel', 'Camera', 'Upload Photo'],
                //destructiveButtonIndex: 2,
                cancelButtonIndex: 0,
                userInterfaceStyle: 'dark',
            },
            buttonIndex => {
                if (buttonIndex === 0) {
                    // cancel action
                } else if (buttonIndex === 1) {
                    captureImage()
                } else if (buttonIndex === 2) {
                    uploadImage()
                }
            },
        );

    const profileUpdateSucces = (isSuccess) => {
        console.log("OK theme  come from route: " + route.name);
        console.log("OK theme  Screen name: " + screen);

        if (isSuccess) {
            if (route.name === 'my_profile_home') {
                // navi.navigate('home');
                navi.navigate('tab_home', { screen: 'home' });
                console.log("Come from home")
                // navi.dispatch(StackActions.replace('home'));
            } else if (route.name === 'my_profile_inbox') {

                navi.navigate('tab_inbox', { screen: 'inbox' });
                console.log("Come from home")

            } else {
                setScreen('full');
                // navi.navigate('profile')
            }
        }
        setVisible(false);
        setIsSuccess(false);
    }

    return (
        <SheetProvider>
            {!isTakeSig && screen != 'tc' && (
                <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <SafeAreaView
                        style={[
                            styles.container,
                        ]}>
                        {/* <LogoHeader /> */}
                        {height > 500 && (<LogoHeader />)}
                        <AutocompleteDropdownContextProvider>
                            <KeyboardAvoidingView
                                style={{ flex: 1, width: width }}
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                enabled={Platform.OS === 'android' ? false : true}
                            >
                                <ScrollView

                                    horizontal={false}
                                    // style={styles.categoryListContainer}
                                    contentContainerStyle={{
                                        flexGrow: 1,
                                        justifyContent: 'center',
                                        paddingBottom: 70,
                                        //backgroundColor: 'red',
                                        // height: screen == 'full' ? null : Dimensions.get('window').height * 0.75,
                                    }}
                                    showsHorizontalScrollIndicator={false}>
                                    <View>

                                        {isLoading ? (
                                            <ActivityIndicator
                                                color={
                                                    theme?.name != 'Light'
                                                        ? theme?.colors?.text
                                                        : globalStyle.colorAccent
                                                }
                                                style={{
                                                    //marginTop: 'auto',
                                                    marginBottom: 20,
                                                    //flexGrow: 1,
                                                    height: DIM.height * .5,
                                                    //backgroundColor: 'red'
                                                }}
                                            />
                                        ) : (
                                            // <ScrollView
                                            //   horizontal={false}
                                            //   style={{ height: '100%' }}
                                            //   // style={styles.categoryListContainer}
                                            //   showsHorizontalScrollIndicator={true}>
                                            <View
                                            //style={{ backgroundColor: 'green' }}
                                            >

                                                {!isTakeSig && (
                                                    <View>
                                                        <View style={styles.middleDive}>
                                                            {screen != 'full' && (
                                                                <Text
                                                                    minimumFontScale={0.5}
                                                                    adjustsFontSizeToFit={true}
                                                                    numberOfLines={1}

                                                                    style={{
                                                                        //fontSize: 22,
                                                                        marginBottom: 50,
                                                                        textAlign: 'center',
                                                                        textTransform: 'capitalize',
                                                                        color: theme?.colors?.textContrast,

                                                                        fontFamily: theme?.font.body.fontFamily,
                                                                        fontWeight: theme?.font.body.fontWeight,
                                                                        fontSize: theme?.font.fontSize.xxl
                                                                    }}>
                                                                    {screen == 'others' ? 'Address' : screen}
                                                                    {/* Personal Information */}
                                                                </Text>
                                                            )}

                                                            {/* Full profile view */}
                                                            {screen == 'full' && (
                                                                <View>
                                                                    <View style={{ marginBottom: 30, alignSelf: 'flex-start' }}>
                                                                        <TouchableOpacity
                                                                            style={{
                                                                                marginStart: 10,
                                                                                alignSelf: 'flex-start',
                                                                                //backgroundColor: 'red',
                                                                                height: 48,
                                                                                width: 48,
                                                                                justifyContent: 'center'
                                                                            }}
                                                                            accessibilityLabel='Back'
                                                                            // style={{ position: 'absolute', left: 30, zIndex: 100 }}
                                                                            onPress={handlePress}>
                                                                            {theme?.header?.backIcon}
                                                                        </TouchableOpacity>
                                                                        {/* <Text style={{ ...styles.title, color: theme?.colors?.text }}>Profile</Text> */}
                                                                    </View>

                                                                    <View style={[styles.profileInfo, {
                                                                        borderColor: theme.nav.borderColor,
                                                                        width: Dimensions.get('window').width * 0.85,
                                                                    }]}>
                                                                        <BlurView
                                                                            style={styles.absolute}
                                                                            blurType="thinMaterialDark"
                                                                            blurAmount={Platform.OS === 'ios' ? 15 : 5}
                                                                            reducedTransparencyFallbackColor="white"
                                                                        />
                                                                        <View
                                                                            style={{
                                                                                flexDirection: 'row',
                                                                                justifyContent: 'center',
                                                                            }}>
                                                                            {/* Avatar */}
                                                                            <TouchableOpacity
                                                                                onPress={() => {
                                                                                    if (Platform.OS === 'android') {
                                                                                        //onOpen()
                                                                                        //Opening the action sheet for both Android and iOS
                                                                                        actionSheetRef.current.show()
                                                                                    } else if (Platform.OS === 'ios') {
                                                                                        openIosBottomSheet()
                                                                                        //actionSheetRef.current.show()
                                                                                    }
                                                                                }}
                                                                                accessibilityLabel={'Profile Picture Upload'}
                                                                                style={styles.avatar}>
                                                                                {formData?.avatar ||
                                                                                    formData?.avatar_local ? (
                                                                                    <FastImage
                                                                                        source={{
                                                                                            uri: profileImage
                                                                                            // isImageUploaded
                                                                                            //   ? formData?.avatar_local
                                                                                            //   : API_URLS.IMAGE_URL +
                                                                                            //   formData?.avatar,
                                                                                        }}
                                                                                        fallbackSource={{
                                                                                            uri: 'https://www.w3schools.com/css/img_lights.jpg',
                                                                                        }}
                                                                                        style={styles.profilePic}
                                                                                        aspectRatio={1}
                                                                                        alt=""
                                                                                        // size="2xl"
                                                                                        resizeMode="cover"
                                                                                    />
                                                                                ) : (
                                                                                    <View
                                                                                        style={{
                                                                                            ...styles.iconDiv,
                                                                                            backgroundColor:
                                                                                                theme?.name == 'Light'
                                                                                                    ? '#3D50DF'
                                                                                                    : 'black',
                                                                                            borderWidth:
                                                                                                theme?.name == 'Light' ? 0 : 1,
                                                                                            borderColor: theme?.colors?.text,
                                                                                        }}>
                                                                                        {theme?.profileIcon?.profile}
                                                                                    </View>
                                                                                )}
                                                                                {/* <Text style={{ ...styles.item, color: theme?.name == 'Light' ? '#2E476E' : theme?.colors?.text }}>Change Profile Photo</Text> */}
                                                                            </TouchableOpacity>

                                                                            <TouchableOpacity
                                                                                onPress={async () => {

                                                                                    let isConected = await Utils.isNetConnected()
                                                                                    console.log("Is net connected: " + isConected);
                                                                                    if (!isConected) {
                                                                                        Utils.netConnectionFaild();

                                                                                        return
                                                                                    }

                                                                                    await getProfileInfo();

                                                                                    setScreen('name')
                                                                                }}
                                                                                style={{
                                                                                    // zIndex: 1,
                                                                                    // alignSelf: 'center',
                                                                                    // marginVertical: 30,
                                                                                    position: 'absolute',
                                                                                    right: 20,
                                                                                    top: -10,
                                                                                    width: 48,
                                                                                    height: 48,
                                                                                    flex: 1,
                                                                                    justifyContent: 'center',
                                                                                    alignItems: 'center'
                                                                                }}
                                                                                accessibilityLabel={'Profile edit'}
                                                                            >
                                                                                {theme?.profileIcon?.proEdit}
                                                                                {/* {theme?.profileIcon?.proEdit} */}
                                                                            </TouchableOpacity>
                                                                        </View>

                                                                        <ModalPopupConfirmation
                                                                            showCustom={true}
                                                                            customImg={formData?.avatar_local}
                                                                            visible={confirmForProfile}
                                                                            // title={'Delete All'}
                                                                            msg={'Upload Profile Photo'}
                                                                            okText={'Upload'}
                                                                            cancelText={'Cancel'}
                                                                            isLoading={btnLoad}
                                                                            onPressOk={handleOnSave}
                                                                            theme={theme}
                                                                            onPressClose={() => {
                                                                                setData({ ...formData, avatar: oldPic });
                                                                                setIsImageUploaded(false);

                                                                                setProfileImage(API_URLS.IMAGE_URL + oldPic);

                                                                                setConfirmForProfile(false);
                                                                            }}
                                                                        />

                                                                        {/* Name */}
                                                                        <View
                                                                            style={{ ...styles.infoDiv, marginTop: 10 }}>
                                                                            {theme?.profileIcon?.profile}
                                                                            <View style={styles.valueDiv}>

                                                                                <Text
                                                                                    style={{
                                                                                        ...styles.type,
                                                                                        color: 'white',

                                                                                        fontFamily: theme?.font.body.fontFamily,
                                                                                        fontWeight: theme?.font.body.fontWeight,
                                                                                        fontSize: theme?.font.fontSize.s
                                                                                    }}>
                                                                                    {formData?.full_name}
                                                                                </Text>
                                                                            </View>
                                                                        </View>

                                                                        {/* Email */}
                                                                        <View
                                                                            style={{ ...styles.infoDiv, marginTop: 20 }}>
                                                                            {theme?.profileIcon?.email}
                                                                            <View style={styles.valueDiv}>

                                                                                <Text
                                                                                    style={{
                                                                                        ...styles.type,
                                                                                        color: 'white',

                                                                                        fontFamily: theme?.font.body.fontFamily,
                                                                                        fontWeight: theme?.font.body.fontWeight,
                                                                                        fontSize: theme?.font.fontSize.s
                                                                                    }}>
                                                                                    {formData?.email}
                                                                                </Text>
                                                                            </View>
                                                                        </View>

                                                                        {/*  Phone */}
                                                                        <View
                                                                            style={{ ...styles.infoDiv, marginTop: 20 }}>
                                                                            {theme?.profileIcon?.phone}
                                                                            <View style={styles.valueDiv}>

                                                                                <Text
                                                                                    style={{
                                                                                        ...styles.type,
                                                                                        color: 'white',

                                                                                        fontFamily: theme?.font.body.fontFamily,
                                                                                        fontWeight: theme?.font.body.fontWeight,
                                                                                        fontSize: theme?.font.fontSize.s
                                                                                    }}>
                                                                                    {formData?.phone_number}
                                                                                </Text>
                                                                            </View>
                                                                        </View>

                                                                        {/*  Address */}
                                                                        <View
                                                                            style={{ ...styles.infoDiv, marginTop: 20 }}>
                                                                            {theme?.profileIcon?.location}
                                                                            <View style={styles.valueDiv}>

                                                                                <Text
                                                                                    style={{
                                                                                        ...styles.type,
                                                                                        color: 'white',

                                                                                        fontFamily: theme?.font.body.fontFamily,
                                                                                        fontWeight: theme?.font.body.fontWeight,
                                                                                        fontSize: theme?.font.fontSize.s
                                                                                    }}>
                                                                                    {formData?.searchAddress}
                                                                                </Text>

                                                                                {formData?.formattedAddress &&
                                                                                    formData?.formattedAddress != '' && (
                                                                                        <Text
                                                                                            style={{
                                                                                                ...styles.type,
                                                                                                color: 'white',

                                                                                                fontFamily: theme?.font.body.fontFamily,
                                                                                                fontWeight: theme?.font.body.fontWeight,
                                                                                                fontSize: theme?.font.fontSize.s
                                                                                            }}>
                                                                                            {formData?.formattedAddress || ''}
                                                                                        </Text>
                                                                                    )}
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            )}

                                                            {screen == 'name' && (
                                                                <InputTextComponent
                                                                    placeholderTitle={'Name'}
                                                                    // icon={<ProfileName />}
                                                                    icon={theme?.profileIcon?.profile}
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
                                                                    value={formData?.full_name}
                                                                    onChangeText={value => {
                                                                        console.log('Name==: ' + value);
                                                                        setData({ ...formData, full_name: value });
                                                                    }}
                                                                    type={Platform.OS === 'ios' ? 'text' : 'url'}

                                                                    isAutoFoucus={false}
                                                                    returnKeyType={'next'}
                                                                    onSubmit={() => onNextClick()}
                                                                    isSubmitOnBlur={false}
                                                                />
                                                            )}

                                                            {screen == 'email' && (
                                                                <InputTextComponent
                                                                    placeholderTitle={'Email'}
                                                                    // icon={<EmailSVG />}
                                                                    icon={theme?.profileIcon?.email}
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
                                                                    value={formData?.email}
                                                                    type="email"
                                                                    disabled={true}
                                                                    onChangeText={value => {
                                                                        console.log('Email==: ' + value);
                                                                        setData({ ...formData, email: value });
                                                                    }}

                                                                    isAutoFoucus={false}
                                                                    returnKeyType={'next'}
                                                                    onSubmit={() => onNextClick()}
                                                                    isSubmitOnBlur={false}
                                                                />
                                                            )}

                                                            {screen == 'phone' && (
                                                                <InputTextComponent
                                                                    placeholderTitle={'Phone no.'}
                                                                    // icon={<Phone />}
                                                                    icon={theme?.profileIcon?.phone}
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
                                                                    value={formData?.phone_number}
                                                                    type="tel"
                                                                    onChangeText={value => {
                                                                        console.log('Phone==: ' + value);
                                                                        setData({ ...formData, phone_number: value });
                                                                    }}

                                                                    isAutoFoucus={false}
                                                                    returnKeyType={'next'}
                                                                    onSubmit={() => onNextClick()}
                                                                    isSubmitOnBlur={false}
                                                                />
                                                            )}

                                                            {!visiblemanualAddInputModal && screen == 'others' && (
                                                                <>
                                                                    {/* <View
                                                                        style={{
                                                                            flexDirection: 'row',
                                                                            paddingBottom: 20,
                                                                            justifyContent: 'space-between',
                                                                            gap: 10,
                                                                        }}>
                                                                        {isShowAddress && (
                                                                            <AutoCompleteDropDown
                                                                                initialValue={initialValue ? initialValue : ''}
                                                                                url={API_URLS.ADDRESS_AUTO_SUGG_}
                                                                                onChangeInput={text => {
                                                                                    console.log('onChangeInput ==>', text);
                                                                                    setLastInputAddress(text);
                                                                                }}
                                                                                onSelectItemL={item => {

                                                                                    console.log(
                                                                                        'Selected::' + JSON.stringify(item),
                                                                                    );

                                                                                    setIsVerifyRequire(true);

                                                                                    if (address?.obj != item?.obj) {
                                                                                        setAddVeriStat(null);
                                                                                    }

                                                                                    setAddVerify(false);
                                                                                    if (item != null && item?.obj) {
                                                                                        let formattedAddress = item.obj
                                                                                            ? item.address
                                                                                            : formData.formattedAddress;
                                                                                        console.log(
                                                                                            'formattedAddress ==>',
                                                                                            formattedAddress,
                                                                                        );

                                                                                        setData({
                                                                                            ...formData,
                                                                                            searchAddress: item?.obj?.address,
                                                                                            formattedAddress: formattedAddress,
                                                                                            city: item.obj?.city,
                                                                                            state_id: item.obj?.prov,
                                                                                            postal_code: item.obj?.pc,
                                                                                            country_code: item.obj?.country,
                                                                                        });

                                                                                        console.log(
                                                                                            'Selected address: ==>',
                                                                                            item,
                                                                                        );
                                                                                        if (item.address) {
                                                                                            setAddress(item.obj);
                                                                                        }
                                                                                    } else {
                                                                                        console.log(
                                                                                            'Selected address ELSE: ==>',
                                                                                            item,
                                                                                        );
                                                                                    }
                                                                                }}

                                                                                onPressAddManualAddress={() => {
                                                                                    console.log("On Press")
                                                                                    setVisiblemanualAddInputModal(true);
                                                                                }}
                                                                                onClear={(isFocus = false) => {
                                                                                    console.log('On Clear ');

                                                                                    setAddress(null);
                                                                                    // setData({
                                                                                    //   ...formData,
                                                                                    //   formattedAddress: '',
                                                                                    //  // searchAddress: '',
                                                                                    // });
                                                                                    setAddVeriStat(null);

                                                                                    setAddVerify(false);

                                                                                    if (isFocus) {

                                                                                        console.log('On focus : Formdata' + formData.searchAddress)
                                                                                        //setInitialValue('Hello' ) ;
                                                                                        setLastInputAddress(formData?.searchAddress ? formData?.searchAddress : lastAddress) ///  setLastInputAddress(text); //address ? address?.address : formData?.searchAddress ?formData?.searchAddress : '' ); //address ? address?.address : ''
                                                                                    } else {
                                                                                        setInitialValue('');

                                                                                    }
                                                                                    // setData({
                                                                                    //   ...formData,
                                                                                    //   formattedAddress: '',
                                                                                    //   searchAddress: '',

                                                                                    // });

                                                                                    setData({
                                                                                        ...formData,
                                                                                        searchAddress: '',
                                                                                        formattedAddress: '',
                                                                                        // address: item.address ? item.address : formData.address,
                                                                                        // address: item.address ? item.id : formData.address,

                                                                                        city: '',
                                                                                        state_id: '',
                                                                                        postal_code: '',
                                                                                        country_code: '',
                                                                                    });
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
                                                                                shadowOffset={
                                                                                    theme?.textInput?.shadowOffset
                                                                                }
                                                                                placeholderColor={
                                                                                    theme?.textInput?.placeholderColor
                                                                                }
                                                                                inputColor={theme?.textInput?.inputColor}
                                                                                theme={theme}
                                                                            />)}
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
                                                                                setData({ ...formData, searchAddress: value });
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
                                                                            value={formData?.city}
                                                                            onChangeText={value => {
                                                                                setData({ ...formData, city: value });
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
                                                                            value={formData?.state_id}
                                                                            onChangeText={value => {
                                                                                setData({ ...formData, state_id: value });
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
                                                                            value={formData?.postal_code}
                                                                            onChangeText={value => {
                                                                                setData({ ...formData, postal_code: value });
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
                                                                            value={formData?.country_code}
                                                                            onChangeText={value => {
                                                                                setData({ ...formData, country_code: value });
                                                                            }}
                                                                            isAutoFoucus={false}
                                                                            type='text'
                                                                        />
                                                                    </View>

                                                                    {/* <InputTextComponent
                                                                        placeholderTitle={'City, State  Postal code'} 
                                                                        icon={theme?.profileIcon?.location}
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
                                                                        value={formData?.formattedAddress} 
                                                                        disabled={true} 
                                                                        isVerified={addVeriStat}
                                                                    /> */}
                                                                </>
                                                            )}

                                                            {screen != 'tc' && screen != 'full' && (
                                                                <View
                                                                    style={{
                                                                        ...styles.direction,
                                                                        // justifyContent: screen == 'name' ? 'center' : 'space-between'
                                                                    }}>
                                                                    {/* {screen != 'name' && */}
                                                                    <TouchableOpacity
                                                                        onPress={() => onPreviousClick()}
                                                                        accessibilityLabel={'previous'}
                                                                        style={{ zIndex: 1 }}>
                                                                        {theme?.profileIcon?.backward}
                                                                    </TouchableOpacity>
                                                                    {/* } */}
                                                                    <TouchableOpacity
                                                                        onPress={() => onNextClick()}
                                                                        accessibilityLabel={'next'}
                                                                        style={{ zIndex: 1 }}>
                                                                        {theme?.profileIcon?.forward}
                                                                    </TouchableOpacity>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                            // </ScrollView>
                                        )}
                                    </View>
                                </ScrollView>
                            </KeyboardAvoidingView>
                        </AutocompleteDropdownContextProvider>
                    </SafeAreaView>
                </View>
            )}

            <ActionSheet ref={actionSheetRef}
                //snapPoints={[30, 60, 100]}

                initialSnapIndex={0}
                statusBarTranslucent
                drawUnderStatusBar={true}
                gestureEnabled={true}
                defaultOverlayOpacity={0.6}

                containerStyle={{
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,

                    borderColor: theme.nav.borderColor,
                    borderWidth: 3,
                    backgroundColor: theme?.name == 'Light' ? 'white' : '#000000',
                }}
            >
                <View
                    accessibilityLabel={'profile upload prop'}
                    style={{
                        // padding: 50,
                        marginLeft: 3,
                        marginRight: 3,
                        marginBottom: 10,
                        //paddingBottom: 10,

                        backgroundColor: theme?.name == 'Light' ? 'white' : '#000000',
                        alignItems: 'center',
                        borderTopStartRadius: 25,
                        borderTopEndRadius: 25,

                    }}>
                    <Text
                        style={{
                            //fontSize: 20,
                            marginVertical: 25,
                            color: theme?.colors?.text,

                            fontFamily: theme?.font.body.fontFamily,
                            fontWeight: theme?.font.body.fontWeight,
                            fontSize: theme?.font.fontSize.xl
                        }}>
                        Change Profile Photo
                    </Text>

                    <View style={styles.buttonContainer}>
                        <CustomButton
                            title={'Camera'}
                            onPress={captureImage}
                            color={theme?.colors?.btnText}
                            colors={theme?.colors?.colors}
                            bordered={true}
                            borderWidth={theme?.name == 'Light' ? 0 : 3}
                            borderColors={theme?.colors?.borderColors}
                            borderColor={theme?.colors?.borderColor}
                            shadow={theme?.name == 'Light'}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <CustomButton
                            title={'Upload'}
                            onPress={uploadImage}
                            color={theme?.colors?.btnText}
                            colors={theme?.colors?.colors}
                            bordered={true}
                            borderWidth={theme?.name == 'Light' ? 0 : 3}
                            borderColors={theme?.colors?.borderColors}
                            borderColor={theme?.colors?.borderColor}
                            shadow={theme?.name == 'Light'}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <CustomButton
                            title={'Cancel'}
                            onPress={() => {
                                //actionSheetRef.current.hide()

                                if (Platform.OS === "ios") {
                                    SheetManager.hideAll();
                                } else if (Platform.OS === 'android') {
                                    actionSheetRef?.current?.hide()
                                }
                            }}
                            color={theme?.colors?.btnText}
                            colors={theme?.colors?.colors}
                            // color={theme?.name == 'Light' ? "blue" : 'black'}
                            // colors={['white', 'white', 'white']}
                            bordered={true}
                            borderWidth={theme?.name == 'Light' ? 0 : 3}
                            borderColors={theme?.colors?.borderColors}
                            borderColor={theme?.colors?.borderColor}
                            shadow={theme?.name == 'Light'}
                        />
                    </View>
                </View>
            </ActionSheet>

            <ModalPoup
                theme={theme}
                visible={visible}
                title={msg}
                source={
                    isSuccess
                        ? require('../../assets/done.json')
                        : require('../../assets/sign_in_animation.json')
                }
                btnTxt={'Ok'}
                onPressOk={() => {
                    profileUpdateSucces(isSuccess);
                }}
                onPressClose={() => {
                    setVisible(false);
                    setIsSuccess(false);
                }}
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
                        "address": data.city + ', ' + data.country + ', ' + data.pc + ', ' + data.state,
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
                    //setAddVeriStat(null);
                    // setAddVerify(false);

                    setData({ ...formData, searchAddress: data?.address });
                    setInitialValue(data?.address)

                    if (da != null && da?.obj) {
                        setData({ ...formData, receiver_address: da?.address });//,searchAddress: item?.obj?.address 
                        console.log('Selected address: ' + JSON.stringify(da?.obj));
                        setAddress(da.obj)


                        setData({
                            ...formData,
                            searchAddress: da?.obj?.address,
                            formattedAddress: da?.address, //formattedAddress,
                            // address: item.address ? item.address : formData.address,
                            // address: item.address ? item.id : formData.address,

                            city: da.obj?.city,
                            state_id: da.obj?.prov,
                            postal_code: da.obj?.pc,
                            country_code: da.obj?.country,
                        });
                    }

                    setVisiblemanualAddInputModal(false)
                }
                }
                //onSave={async formData => onResetPass(formData)}
                saveBtnDisable={true} />

            {
                isTakeSig && isSigReload && screen != 'tc' && (
                    <SignatureComponentNew
                        signatureValue={
                            formData?.signature
                                ? formData?.signature?.startsWith('data:image')
                                    ? formData?.signature
                                    : API_URLS.IMAGE_URL + formData?.signature
                                : null
                        }

                        getSignature={async value => {
                            setIsTakeSig(false);
                            await getSignature(value);
                        }}

                        setRotateSign={
                            async value => {
                                console.log('Signature after rotate: =>' + value);
                                setIsTakeSig(true);

                                if (value) {
                                    await setRotateSignature(value);
                                } else {

                                    // setSigReload(false);


                                    // setTimeout(() => {
                                    //   setSigReload(true);
                                    //   setIsTakeSig(true);
                                    // }, 100)
                                }
                            }
                        }

                        onBackClick={value => {
                            onBackClick();
                        }}
                        theme={theme}
                    />
                )
            }

            {
                !isTakeSig && screen == 'tc' && (
                    <TermsCondition
                        onBackClick={() => {
                            onPreviousClick();
                        }}
                        onSave={() => {
                            handleOnSave();
                        }}
                        loading={saveBtnLoad}
                    />
                )
            }
        </SheetProvider >
    );
}

const styles = StyleSheet.create({
    avatar: {
        alignSelf: 'center',
        zIndex: 1,

    },
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    profileInfo: {
        borderWidth: 4,
        padding: 30,
        borderRadius: 8,
        // borderColor: 'gray',

        // backgroundColor: 'red',
        overflow: 'hidden',
    },
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
        marginTop: 70,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    middleDive: {
        // paddingVertical: 250,
        marginTop: 'auto',
        marginBottom: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 30,
        paddingVertical: 7,
    },
    buttonContainer2: {
        // width: '90%',
        // paddingRight: 10,
        // paddingVertical: 1,
    },
    bgImage: {
        flex: 1,
        justifyContent: 'center',
        // position: 'absolute',
        // width: '100%',
        // height: '100%',
    },
    container: {
        flex: 1,
        //paddingTop: globalStyle.topPadding,
        // backgroundColor: globalStyle.statusBarColor,
        // backgroundColor: 'red',
    },
    categoryCard: {
        backgroundColor: 'white',
        borderRadius: 6,
        height: 117,
        width: 97,
        margin: 10,
        padding: 10,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 500,
        textAlign: 'center',
        // marginStart: 24,
        // marginTop: 16,
        // marginBottom: 16,
    },
    item: {
        marginStart: 5,
        marginTop: 16,
        marginBottom: 16,
        fontSize: 15,
        // color: '#2E476E',
    },
    line: {
        borderBottomColor: '#c0c0c0',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    text: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
        paddingLeft: 20, // add left padding here
    },
    flexIt: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    arrowCss: {
        marginTop: 16,
        paddingRight: 50,
    },
    planDiv: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signaturePic: {
        height: 30,
        width: 60,
        // borderRadius: 50,
        // marginBottom: 25,
        borderWidth: 1,
        backgroundColor: 'white',
        borderColor: 'white',
    },
    profilePic: {
        height: 72,
        width: 72,
        borderRadius: 50,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: 'white',
    },
    iconDiv: {
        // backgroundColor: '#3D50DF',
        height: 60,
        width: 60,
        borderRadius: 50,
        // padding: 5,
        marginEnd: 5,

        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconDiv2: {
        // backgroundColor: 'gray',
        // backgroundColor: '#3D50DF',
        height: 30,
        width: 30,
        borderRadius: 50,
    },
    editDiv: {
        flexDirection: 'row',
        marginStart: 32,
        marginBottom: 20,
        marginTop: 20,
        alignItems: 'center',
    },
});
