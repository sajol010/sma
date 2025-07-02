import { useNavigation } from '@react-navigation/native';
import { React, useEffect, useState } from 'react';
import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';

//Image Resource
//Assets
//Variables
//Class
import PdfEditor from '../class/PdfEditor';
//Component
import CustomButton from '../components/global/ButtonComponent.js';
import DocumentListHeader from '../components/global/DocumentListHeaderComponent';
import TextInput from '../components/global/InputTextComponent.js';
import StepsComponent from '../components/global/StepsComponent';
//Style
import globalStyle from '../../styles/MainStyle.js';
import { useTheme } from '../../styles/ThemeProvider';
import ModalPoup from '../components/global/ModalPoupComponent';

export default function CreateNdaAcceptance(navigation) {
  const { theme } = useTheme();

  const navi = useNavigation();
  const [visible, setVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { id, name, filePath, data } = navigation.route.params;
  console.log("nda-acceptance", navigation.route?.params)
  const [createdPdf, setCreatedPdf] = useState(null);
  let documentName = navigation.route?.params?.document_name || '';

  const handleDocumentName = value => {
    console.log('Document name: ' + value);
    documentName = value;
  };

  const handlePress = () => {
    navi.goBack();
  };
  useEffect(() => {
    PdfEditor.setDocumentMetadata(pdfDataUri => {
      setCreatedPdf(pdfDataUri);
    });
  }, []);

  const validate = () => {
    valid = false;

    if (documentName && documentName != '') {
      return true;
    }

    return valid;
  }

  const onPressNext = () => {
    if (validate()) {
      navi.navigate(theme?.name == 'Light' ? 'create_nda_receiver_info_old' : 'create_nda_receiver_info', {
        sample_id: id,
        sample_name: name,
        document_name: documentName,
        filePath: filePath,
        data: data,

        //Receiver
        receiver_name: navigation.route?.params?.receiver_name || '',
        receiver_email: navigation.route?.params?.receiver_email || '',
        receiver_phone_number: navigation.route?.params?.receiver_phone_number || '',
        receiver_company_name: navigation.route?.params?.receiver_company_name || '',
        receiver_address: navigation.route?.params?.receiver_address || '',
        receiver_city: navigation.route?.params?.receiver_city || '',
        receiver_state_id: navigation.route?.params?.receiver_state_id || '',
        receiver_postal_code: navigation.route?.params?.receiver_postal_code || '',
      });
    } else {
      // Alert.alert('Error', 'Document name required', [
      //   { text: 'OK', onPress: () => { } },
      // ]);
      setErrorMsg('Document name is required');
      setVisible(true);
    }
  }


  return (
    <ImageBackground
      source={theme?.bg?.bgImg}
      resizeMode="cover"
      style={styles.bgImage}
    >
      <SafeAreaView style={styles.container}>

        <DocumentListHeader
          onPress={handlePress}
          title={'Create NDA'}

          backIcon={theme?.header?.backIcon}
          statusBarColor={theme?.colors?.statusBarColor}
          dark={theme?.name == 'Light'}
          color={theme?.colors?.text}
        />

        {/* <ThemeSelectorForTest /> */}

        <ScrollView horizontal={false} nestedScrollEnabled={false}>
          <View>
            {/* Steps */}
            <View style={{ marginTop: 15, marginBottom: 30 }}>
              <StepsComponent active={1} theme={theme} />
            </View>

            <View style={styles.inputDiv}>
              <TextInput
                placeholderTitle={'Document Name'}
                // icon={<SolarDocument />}
                icon={theme?.nda?.doc}
                borderColor={theme?.textInput?.borderColor}
                backgroundColor={theme?.textInput?.backgroundColor}
                borderWidth={theme?.textInput?.borderWidth}
                darkShadowColor={theme?.textInput?.darkShadowColor}
                lightShadowColor={theme?.textInput?.lightShadowColor}
                shadowOffset={theme?.textInput?.shadowOffset}
                placeholderColor={theme?.textInput?.placeholderColor}
                inputColor={theme?.textInput?.inputColor}

                defaultValue={documentName}
                onChangeText={value => {
                  // console.log('Document ==: ' + value);
                  // setData({...formData, name: value});
                  // setDocumentName(value);
                  handleDocumentName(value);
                }}
              />
            </View>

            <View style={styles.template}>
              {/* <NdaAcceptanceSvg /> */}
              {createdPdf && (
                <Pdf
                  // minScale={1.0}
                  // maxScale={1.0}
                  scale={1.0}
                  // spacing={-50}
                  fitPolicy={0}
                  enablePaging={false}
                  nestedScrollEnabled={true}
                  source={{ uri: createdPdf }}
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
            </View>
          </View>
        </ScrollView>

        <ModalPoup
          theme={theme}
          visible={visible}
          title={errorMsg}
          source={require('../../assets/sign_in_animation.json')}
          btnTxt={'Ok'}
          onPressOk={() => setVisible(false)}
          onPressClose={() => setVisible(false)}
        />

        <View style={styles.btnDiv}>
          <CustomButton
            title={'Next'}

            color={theme?.colors?.btnText}
            colors={theme?.colors?.colors}
            bordered={true}
            borderWidth={theme?.name == 'Light' ? 0 : 3}
            borderColors={theme?.colors?.borderColors}
            borderColor={theme?.colors?.borderColor}
            shadow={theme?.name == 'Light'}

            onPress={() => {
              onPressNext();
              // navi.navigate('create_nda_receiver_info', {
              //   sample_id: id,
              //   sample_name: name,
              //   document_name: documentName,
              //   filePath: filePath,

              //   //Receiver
              //   receiver_name: navigation.route?.params?.receiver_name || '',
              //   receiver_email: navigation.route?.params?.receiver_email || '',
              //   receiver_phone_number: navigation.route?.params?.receiver_phone_number || '',
              //   receiver_company_name: navigation.route?.params?.receiver_company_name || '',
              //   receiver_address: navigation.route?.params?.receiver_address || '',
              //   receiver_city: navigation.route?.params?.receiver_city || '',
              //   receiver_state_id: navigation.route?.params?.receiver_state_id || '',
              //   receiver_postal_code: navigation.route?.params?.receiver_postal_code || '',
              // });
            }}
          />
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
    // backgroundColor: globalStyle.statusBarColor,
  },
  template: {
    flex: 1,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  inputDiv: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
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
  pdf: {
    width: Dimensions.get('window').width * 0.95,
    borderRadius: 10,
    //height: Dimensions.get('window').height,
    //height: '80%',
    height: 580,
  },
});
