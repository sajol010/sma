import { useNavigation } from '@react-navigation/native';
import { React, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import Pdf from 'react-native-pdf';
import Share from 'react-native-share';
import { decode as atob, encode as btoa } from 'base-64';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReactNativeBlobUtil from 'react-native-blob-util';
import LinearGradient from 'react-native-linear-gradient';

//Image Resource
//Assets
//Variables
import Url from '../Api.js';
const RNFS = require('react-native-fs');

//Class
import DocumentListHeader from '../components/global/DocumentListHeaderComponent.js';
import CustomButton from '../components/global/ButtonComponent.js';
import ButtonComponentSmall from '../components/global/ButtonComponentSmall.js';
import globalStyle from '../../styles/MainStyle.js';
import { useTheme } from '../../styles/ThemeProvider.js';
import { ScrollView } from 'react-native-virtualized-view';
import { DIM } from '../../styles/Dimensions.js';

export default function NdaPdfPreView(navigation) {
  const { theme } = useTheme();

  // const { id, name } = route.params;
  const { id, name, link, data, isShareable, isDownloadable } = navigation.route.params;
  const [fileDownloaded, setFileDownloaded] = useState(false); //Default false
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState(null);
  const [isLoad, setIsLoad] = useState(false);
  const [filePath, setFilePath] = useState(
    `${RNFS.DocumentDirectoryPath}/Shush-${name}.pdf`,
  );

  const [isDownLoading, setIsDownLoading] = useState(false);

  const [isShareButtonLoading, setShareButtonLoading] = useState(true);


  const navi = useNavigation();
  const { height, width, scale, fontScale } = useWindowDimensions();

  const handlePress = () => {
    navi.goBack();
  };

  useEffect(() => {
    console.log('File: ' + isDownloadable);
    if (isDownloadable) {
      downloadFile();
    } else {
      //readPdf(localFile)
      setFilePath(link);
    }

  }, [isDownLoading]);

  const readPdf = async localFile => {
    await readFile(localFile);
  }

  const _base64ToArrayBuffer = base64 => {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const downloadPDF = async () => {

    setShareButtonLoading(true);
    //setIsDownLoading(true);

    const time = new Date().getTime();
    const url = Url.FILE_URL + link; // Replace with the actual URL of the PDF file
    console.log('Download url: ' + url);
    //DownloadDirectoryPath
    const downloadDest = `${RNFS.DocumentDirectoryPath}/pdf-${time}.pdf`; // Save the PDF file to the device's download folder
    console.log('Downlload uri: ' + downloadDest);

    try {
      if (Platform.OS === 'ios') {
        ReactNativeBlobUtil.ios.previewDocument(filePath);
      } else if (Platform.OS === 'android') {

        const shareOptions = {
          title: 'Share nda PDF',
          message: 'Check out this PDF file!',
          url: `file://${filePath}`,
          type: 'application/pdf',
        };

        await Share.open(shareOptions);

      }
      setShareButtonLoading(false);
    } catch (error) {
      console.log('Error downloading PDF:', error);
      setIsDownLoading(false);

      setShareButtonLoading(false);
    }
  };

  const downloadFile = async () => {
    setIsLoad(true);
    if (!fileDownloaded) {
      console.log('Downloaded file start');

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
        await readFile(filePath);
        // navi.navigate('create_nda_acceptance');
        setIsLoad(false);
      });
    }
  };

  const readFile = async filePath => {
    console.log('PDF read ');
    await RNFS.readFile(filePath, 'base64').then(contents => {
      setPdfBase64(contents);
      setPdfArrayBuffer(_base64ToArrayBuffer(contents));
    });
    setIsLoad(false);
  };

  return (
    <View style={{
      flex: 1,
      //backgroundColor: 'transparent',

    }}>
      <SafeAreaView style={{ ...styles.container }}>

        <View style={{ height: height * 1 }}>
          <View style={{
            //paddingTop: height * 0.02, //45,
            paddingStart: 40,
            //paddingBottom: height * 0.02, //50
            height: height * 0.10,
            width: 100,
            //hight: 100, //DIM.height,//* 0.2, 
            justifyContent: 'center',
            //backgroundColor: 'red',
          }}>
            <TouchableOpacity
              onPress={handlePress}>
              {theme?.header?.backIcon}
            </TouchableOpacity>
          </View>

          <View style={{ ...styles.template }}>
            {isLoad ? (
              <ActivityIndicator
                color={theme?.name == 'Light' ? globalStyle.colorAccent : theme?.colors?.text}
                style={{
                  height: height * 0.70,
                  //backgroundColor: 'black'
                }}
              />
            ) : (
              //<ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={{ paddingBottom: 0, alignContent: 'center', alignSelf: 'center', }}>
                <LinearGradient
                  colors={theme?.colors?.borderColors ? theme?.colors?.borderColors : ['#bb52aa', '#63ff85']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ ...styles.borderLinearGradient, width: width - 20 }}
                >
                  <LinearGradient
                    colors={theme?.colors?.colors ? theme?.colors?.colors : ['#3D43DF', '#3D50DF', '#3D6eDF']}
                    style={{
                      ...styles.linearGradient,
                      // borderWidth: bordered ? borderWidth : 0, borderColor: borderColor 
                    }}>
                    <Pdf
                      //minScale={1.0}
                      //maxScale={1.0}
                      scale={1.0}
                      spacing={Platform.OS === 'ios' ? 10 : 10}
                      fitPolicy={2}
                      //enablePaging={true}
                      source={{ uri: filePath }}
                      // source={{ uri: Url.FILE_URL + link }}
                      usePDFKit={Platform.OS === 'ios' ? true : false}
                      horizontal={false}
                      

                      onLoadComplete={(
                        numberOfPages,
                        filePath,
                        { width, height },
                      ) => {
                        //setPageWidth(width);
                        //setPageHeight(height);
                        setShareButtonLoading(false);

                      }}

                      // onPageSingleTap={(page, x, y) => {
                      //   handleSingleTap(page, x, y);
                      // }}

                      style={{
                        ...styles.pdf, 
                        width: width -25,
                   
                        
                        height: height * 0.7  //
                      }}
                    />
                  </LinearGradient>
                </LinearGradient>
              </View>
              // </ScrollView>
            )}
          </View>

          <View style={{ flexShrink: 1, marginTop: 10, paddingHorizontal: 30, height: height * 0.10 }}>
            <View style={{ marginLeft: 10, marginRight: 10, }}>
              {isShareable && (
                <CustomButton
                  title={'SHARE'}
                  color={theme?.colors?.btnText}
                  colors={theme?.colors?.colors}
                  bordered={true}
                  height={height * 0.08}
                  borderWidth={theme?.name == 'Light' ? 0 : 3}
                  borderColor={theme?.colors?.borderColor}
                  borderColors={theme?.colors?.borderColors}
                  shadow={theme?.name == 'Light'}
                  isLoading={isShareButtonLoading}
                  disabled={isShareButtonLoading}
                  onPress={() => {
                    console.log("Press Download");
                    downloadPDF();
                  }}
                />)}
            </View>

          </View>
          {/* <ThemeSelectorForTest /> */}

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    // justifyContent: 'center',
  },
  container: {

    //paddingTop: globalStyle.topPadding,
    //paddingBottom: globalStyle.bottomPadding,
    // backgroundColor: globalStyle.statusBarColor,
  },

  borderLinearGradient: {
    // padding: 4,
    // borderColor: '#AEAEAE',
    // borderColor: '#3D43DF',
    // paddingVertical: 3,
    //padding: 12,

    //height: 68,
    justifyContent: 'center',
    borderRadius: 10,
  },
  linearGradient: {
    // padding: 4,
    // borderColor: '#AEAEAE',
    // borderColor: '#3D43DF',
    // paddingLeft: 0,
    // paddingRight: 0,
    margin: 3,
    //height: 60,
    justifyContent: 'center',
    borderRadius: 8,

  },
  pdf: {

    alignSelf: 'center',

    borderWidth: 0,
    borderRadius: 8,

    // backgroundColor: 'red',
    paddingLeft: 5,
    paddingRight: 5,

  },
  template: {
    marginLeft: 10, //'auto',
    marginRight: 10, //'auto',

    //backgroundColor: 'orange',
    //height: '80%',
    //backgroundColor: 'red',
    //paddingTop: 20,
  },
  btnDiv: {
    flex: 1,
    marginTop: 5,
    width: '100%',
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  bottomControlBtnContainer: {
    //flexDirection: 'row',
    //justifyContent: 'space-between',
    marginBottom: 0,
    //gap: 15,
    //bottom: 0,
    //zIndex: 1,
    width: '100%',
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 5,
    // backgroundColor: 'white',
  },
});
