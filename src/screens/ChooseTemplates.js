import { useNavigation } from '@react-navigation/native';
import { React, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View, ImageBackground } from 'react-native';
import Pdf from 'react-native-pdf';
import { decode as atob, encode as btoa } from 'base-64';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

//Image Resource
//Assets
//Variables
import Url from '../Api.js';
const RNFS = require('react-native-fs');

//Class
//Component
import DocumentListHeader from '../components/global/DocumentListHeaderComponent';
import CustomButton from '../components/global/ButtonComponent.js';
import globalStyle from '../../styles/MainStyle.js';
import { useTheme } from '../../styles/ThemeProvider.js';

export default function ChooseTemplates(navigation) {
    const { theme } = useTheme();

    // const { id, name } = route.params;
    const { id, name, link } = navigation.route.params;
    const data = navigation?.route?.params?.data;
    const [fileDownloaded, setFileDownloaded] = useState(false); //Default false
    const [pdfBase64, setPdfBase64] = useState(null);
    const [pdfArrayBuffer, setPdfArrayBuffer] = useState(null);
    const [isLoad, setIsLoad] = useState(true);
    const [filePath, setFilePath] = useState(
        `${RNFS.DocumentDirectoryPath}/react-native.pdf`,
    );

    const navi = useNavigation();
    const handlePress = () => {
        navi.goBack();
    };

    useEffect(() => {
        downloadFile();
    }, []);

    const _base64ToArrayBuffer = base64 => {
        const binary_string = atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    };

    const downloadFile = async () => {
        if (!fileDownloaded) {
            console.log('Downloaded file start');
            console.log('Downloaded file url end: ' + link);
            console.log('Downloaded file url: ' + Url.FILE_URL + link);

            RNFS.downloadFile({
                fromUrl: Url.FILE_URL + link,
                toFile: filePath,
                //background: true, // Enable downloading in the background (iOS only)
                //discretionary: true, // Allow the OS to control the timing and speed (iOS only)
                progress: res => {
                    // Handle download progress updates if needed
                    const progress = (res.bytesWritten / res.contentLength) * 100;
                    // if (progress >= 100) {
                    //   setIsLoad(false)
                    // }
                    console.log(`Progress: ${progress.toFixed(2)}%`);
                },
            }).promise.then(async res => {
                console.log('Downloaded file end');
                setFileDownloaded(true);
                await readFile();
                // navi.navigate('create_nda_acceptance');
                // setIsLoad(false);
            });
        }
    };

    const readFile = async () => {
        console.log('PDF read ');
        await RNFS.readFile(filePath, 'base64').then(contents => {
            setPdfBase64(contents);
            setPdfArrayBuffer(_base64ToArrayBuffer(contents));
        });
        setIsLoad(false);
    };

    // console.log("FILE_URL==><", Url.FILE_URL);
    // console.log("link==><", link);

    return (
        <ImageBackground
            source={theme?.bg?.bgImg}
            resizeMode="cover"
            style={styles.bgImage}
        >
            <SafeAreaView style={styles.container}>
                <DocumentListHeader
                    onPress={handlePress}
                    title={data?.nda_name || name}

                    backIcon={theme?.header?.backIcon}
                    statusBarColor={theme?.colors?.statusBarColor}
                    dark={theme?.name == 'Light'}
                    color={theme?.colors?.text}
                />
                <View style={styles.template}>
                    {isLoad ? (
                        <ActivityIndicator
                            color={theme?.name == 'Light' ? globalStyle.colorAccent : theme?.colors?.text}
                            style={{
                                marginTop: 'auto',
                                marginBottom: 'auto',
                                height: 540,
                            }}
                        />
                    ) : (
                        <Pdf
                            // minScale={1.0}
                            // maxScale={1.0}
                            scale={1.0}
                            // spacing={-50}
                            fitPolicy={0}
                            enablePaging={true}
                            source={{ uri: filePath }}
                            // source={{ uri: Url.FILE_URL + link }}
                            usePDFKit={false}
                            // onLoadComplete={(
                            //   numberOfPages,
                            //   filePath,
                            //   { width, height },
                            // ) => {
                            //   setPageWidth(width);
                            //   setPageHeight(height);
                            // }}
                            // onPageSingleTap={(page, x, y) => {
                            //   handleSingleTap(page, x, y);
                            // }}
                            style={styles.pdf}
                        />
                    )}
                    <View style={styles.btnContainer}>
                        {!isLoad && !data && (
                            <View style={styles.btnDiv}>
                                <CustomButton
                                    title={'Continue with this Template'}
                                    // title={btnLoad ? <ActivityIndicator color={'white'} /> : 'Continue with this Template'}

                                    color={theme?.colors?.btnText}
                                    colors={theme?.colors?.colors}
                                    bordered={true}
                                    borderWidth={theme?.name == 'Light' ? 0 : 3}
                                    borderColors={theme?.colors?.borderColors}
                                    borderColor={theme?.colors?.borderColor}
                                    shadow={theme?.name == 'Light'}

                                    onPress={() => {
                                        //navi.navigate('create_nda_acceptance');
                                        // downloadFile()
                                        navi.navigate('create_nda_acceptance', {
                                            id: id,
                                            name: name,
                                            filePath: filePath,
                                            data: data,
                                        });
                                    }}
                                />
                            </View>
                        )}

                        {data && !isLoad && (
                            <View style={styles.btnDiv}>
                                <CustomButton
                                    title={'Continue'}

                                    color={theme?.colors?.btnText}
                                    colors={theme?.colors?.colors}
                                    bordered={true}
                                    borderWidth={theme?.name == 'Light' ? 0 : 3}
                                    borderColors={theme?.colors?.borderColors}
                                    borderColor={theme?.colors?.borderColor}
                                    shadow={theme?.name == 'Light'}

                                    onPress={() => {
                                        // downloadFile()
                                        navi.navigate('create_nda_acceptance', {
                                            id: id,
                                            name: name,
                                            filePath: filePath,
                                            data: data,

                                            document_name: data?.nda_name,
                                            //Receiver
                                            receiver_name: data?.receiver_name,
                                            receiver_email: data?.receiver_email,
                                            receiver_phone_number: data?.receiver_phone_number,
                                            receiver_company_name: data?.receiver_company_name,
                                            receiver_address: data?.receiver_address,
                                            receiver_city: data?.receiver_city,
                                            receiver_state_id: +data?.receiver_state,
                                            receiver_postal_code: data?.receiver_postal_code,
                                            receiver_country: data?.receiver_country || 'USA',
                                        });
                                    }}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bgImage: {
        flex: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        //paddingTop: globalStyle.topPadding,
        paddingBottom: globalStyle.bottomPadding + 80,
        // backgroundColor: globalStyle.statusBarColor,
    },
    pdf: {
        width: Dimensions.get('window').width,
        // height: Dimensions.get('window').height * 0.7,
        height: '86%',
        //height: 550,
        //height: 550,
    },
    template: {
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 20,
    },
    btnDiv: {
        marginTop: 5,
        paddingHorizontal: 35,
        paddingBottom: globalStyle.bottomPadding,
    },
    btnContainer: {
        paddingTop: 5,
        //paddingBottom: globalStyle.bottomPadding,
        bottom: 0,
    },
});
