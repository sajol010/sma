import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, useWindowDimensions } from 'react-native'; //  ScrollView
import { SafeAreaView } from 'react-native-safe-area-context';
//import { ScrollView } from 'react-native-virtualized-view';
import DocumentListHeader from '../components/global/DocumentListHeaderComponent.js';
import { useTheme } from '../../styles/ThemeProvider.js';
import CustomButton from '../components/global/ButtonComponent.js';

import CheckBox from '@react-native-community/checkbox';
import Toast from 'react-native-toast-message';
import WebView from 'react-native-webview';
import API_URLS from '../Api.js';
import LogoHeader from '../components/global/LogoHeader.js';


const TermsCondition = ({ onSave, onBackClick, loading }) => {
    const [toggleCheckBox, setToggleCheckBox] = useState(false)


    const { height, width, scale, fontScale } = useWindowDimensions();
    const { theme } = useTheme();

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: 'transparent',
        }}>
            <LogoHeader />
            <View style={[styles.container]}>
                <DocumentListHeader
                    onPress={onBackClick}
                    title={''}
                    backIcon={theme?.header?.backIcon}
                    statusBarColor={theme?.colors?.statusBarColor}
                    dark={theme?.name == 'Light'}
                    color={theme?.colors?.text}
                />

                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 70 }}>
                    <View
                        style={{
                            paddingHorizontal: 30,
                        }}>
                        {/* <Text style={{ ...styles.title, color: theme?.colors?.text }}>Terms & Conditions</Text> */}

                        <View
                            style={{
                                alignItems: 'center',
                                marginVertical: 20,
                                width: width * 0.8,
                                height: height * 0.3,
                                backgroundColor: 'white',
                                borderRadius: 8,
                                borderWidth: 0,
                                paddingVertical: 5,
                                borderColor: (theme?.name == 'Elegant' || theme?.name == 'Honeycomb') ? 'gray' : theme?.name == 'Gold' ? 'gold' : theme?.colors?.text,
                                alignSelf: 'center',

                            }}
                        >
                            {/* <DummyTC /> */}

                            <WebView
                                source={{ uri: API_URLS.TERM_AND_CONDITION }} // Replace with your desired URL
                                style={{
                                    ...styles.webview,
                                    width: width * 0.8,
                                    height: height * 0.3,

                                }}
                                nestedScrollEnabled
                                allowFileAccess
                                mediaPlaybackRequiresUserAction={false}
                                cacheEnabled={true}
                                bounces={false}
                                scrollEnabled={true}
                            />

                        </View>

                        <View style={styles.checkboxContainer}>
                            <CheckBox
                                disabled={false}
                                value={toggleCheckBox}
                                onValueChange={(newValue) => setToggleCheckBox(newValue)}
                                tintColors={{ false: 'white', true: theme?.colors?.switch }}
                                tintColor={'white'}
                                boxType={'square'}
                                onFillColor={theme?.colors?.switch}
                                onTintColor={theme?.colors?.switch}
                                style={styles.checkbox}


                            />
                            <Text style={{
                                ...styles.label, 
                                color: theme?.colors?.textContrast,
                            }}>Accept Terms & Conditions</Text>
                        </View>

                        <View style={styles.buttonContainer}>
                            <CustomButton
                                title={'SAVE PROFILE'}
                                color={theme?.colors?.btnText}
                                colors={theme?.colors?.colors}
                                bordered={true}
                                isLoading={loading}
                                borderWidth={theme?.name == 'Light' ? 0 : 3}
                                borderColor={theme?.colors?.borderColor}
                                borderColors={theme?.colors?.borderColors}
                                shadow={theme?.name == 'Light'}
                                onPress={() => {
                                    if (toggleCheckBox) {
                                        onSave();
                                    } else {
                                        Toast.show({
                                            type: 'warning',
                                            text1: 'Accept our terms and conditions',
                                            onPress: () => {
                                                closeToast();
                                            }
                                        })
                                    }
                                }}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    bgImage: {
        flex: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
    },
    buttonContainer: {
        paddingBottom: 32,
        width: '100%',
    },
    checkboxContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    checkbox: {
        alignSelf: 'center',
        height: 20,
        width: 20,
    },
    label: {
        //margin: 6,
        paddingLeft: 10,

        alignContent: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        flexDirection: 'column',

    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 600
    },
    webview: {
        flex: 1
    },
});

export default TermsCondition;