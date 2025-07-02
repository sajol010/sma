import { useNavigation } from '@react-navigation/native';
import { React, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import Pdf from 'react-native-pdf';
import { SafeAreaView } from 'react-native-safe-area-context';
const RNFS = require('react-native-fs');

//Variables
//Class
import Token from '../class/TokenManager.js';
import { makeNDAPdf, makeNDAPdfForView, signOnPdf } from '../class/PdfEditorPro.js';
import Utils from '../class/Utils.js';
import CustomButton from '../components/global/ButtonComponent.js';
import ModalPoupSingle from '../components/global/ModalPoupComponent';
import API_URLS from '../Api.js';
import { apiErrorCheck } from '../class/AuthManager.js';

//Component
import LogoHeader from '../components/global/LogoHeader.js'
import ModalPoupUserInfoComponent from '../components/global/ModalPoupUserInfoComponent.js';
//Style
import globalStyle from '../../styles/MainStyle.js';
//API
import Url from '../Api.js';
import { get, post } from '../class/ApiManager.js';

import { useTheme } from '../../styles/ThemeProvider';
import ModalPoup from '../components/global/ModalPoupComponent';
import CONSTANTS from '../Constants.js';
import CreateNdaSuccess from './CreateNdaSuccess.js';


export default function CreateNdaSigning(navigation) {
  const { theme } = useTheme();

  const navi = useNavigation();
  const test = false;

  let sampleNdaId = CONSTANTS.SAMPLE_PDF_ID;

  var isDraft = true;

  const [createdPdf, setCreatedPdf] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [btnLoad, setBtnLoad] = useState(false); //Sign and send
  const [btnLoad2, setBtnLoad2] = useState(false); //Draft 
  const [loaderForLottieInfo, setLoaderForLottieInfo] = useState({
    load: false,
    type: 'sender',
    status: 'pending',
    isShowSucess: true
  }); //Draft 

  const [dateFormat, setDateFormat] = useState('dd/mm/yyyy');

  const [showDraftBtn, setShowDraftBtn] = useState(true);
  const [showRecipientBtn, setShowRecipientBtn] = useState(false);
  const [showSignNSendBtn, setshowSignNSendBtn] = useState(true);

  const [myProfileForm, setMyProfileData] = useState({});

  const [isVisibleSignWarning, setSignWarning] = useState(false);

  const [isVisibleReceipentDetails, setVisibleReceipentDetails] = useState(false);

  const [modalShow, setModalShow] = useState(false);
  const [modalMsg, setModalMsg] = useState('');

  //Sample file download
  const [filePath, setFilePath] = useState(
    `${RNFS.DocumentDirectoryPath}/react-native.pdf`,
  );

  const [signaturePath, setSignaturePath] = useState(
    `${RNFS.DocumentDirectoryPath}/signature.png`,
  );

  const [fileDownloaded, setFileDownloaded] = useState(false); //Default false

  const { height, width, scale, fontScale } = useWindowDimensions();

  const {
    id,
    n_d_a_sample_id,

    document_name,
    type,
    data,

    isEdit,
    status,
    displayAs,
    fileUrl,

    receiver_name,
    receiver_email,
    receiver_phone_number,
    receiver_address,
    receiver_city,
    receiver_state_id,
    receiver_country_code,
    receiver_postal_code,
    sender_address_status,

    custom_section
  } = navigation.route.params;

  console.log("navigation.route.params createNDASignin================================", navigation.route.params)

  useEffect(() => {
    console.log('Create NDA Sign UseEffect');

    const asyncFunc = async () => {
      let userToken = await Token.getToken();
      if (userToken) {
        buttonState(displayAs, status);

        setLoaderForLottieInfo({
          ...loaderForLottieInfo,
          type: displayAs,
          status: status,
          isShowSucess: true
        })

        getProfileInfo();
      } else {
        console.log('Token not found');
        return false;
      }
    };

    asyncFunc();
  }, [status, displayAs]);

  const buttonState = async (displayAs, status) => {
    if (displayAs === 'receiver') {

      if (status === 'completed') {
        setshowSignNSendBtn(false);
        setShowDraftBtn(false);
        //Only View button will show
      } else if (status === 'pending') {
        setShowDraftBtn(false);
        setshowSignNSendBtn(true);
        //view and sign and send btn show
      }

      setShowRecipientBtn(false);
    } else if (displayAs === 'sender') {

      if (status === 'completed') {
        setshowSignNSendBtn(false);
        setShowDraftBtn(false);
      } else if (status === 'draft') {
        setshowSignNSendBtn(true);
        setShowDraftBtn(false);
      } else if (status === 'pending') {
        if (isEdit) {
          setShowDraftBtn(true);
          setshowSignNSendBtn(true);
        } else {
          setShowDraftBtn(false);
          setshowSignNSendBtn(false);
        }
      } else if (status === 'invited') {
        setShowDraftBtn(false);
        setshowSignNSendBtn(false);
      }

      setShowRecipientBtn(true);
    }
  }

  //Get Profile data sender info + signature
  const getProfileInfo = async () => {

    var profileApi_ = API_URLS.PROFILE_;
    get(profileApi_)
      .then(data => {
        try {
          console.log("-Profile-" + JSON.stringify(data))
          var a = JSON.stringify(data);
          var json = JSON.parse(a);

          var profileInfo = json.data;
          console.log("profileInfo==>", profileInfo)

          RNFS.downloadFile({
            fromUrl: Url.FILE_URL + profileInfo.signature,
            toFile: signaturePath,
            //background: true, // Enable downloading in the background (iOS only)
            //discretionary: true, // Allow the OS to control the timing and speed (iOS only)
            progress: res => {
              // Handle download progress updates if needed
              const progress = (res.bytesWritten / res.contentLength) * 100;
              console.log(`Signature Progress: ${progress.toFixed(2)}%`);
            },
          }).promise.then(async res => {
            console.log('Signature Downloaded file end');

            setIsLoading(false);
          });
          setMyProfileData(profileInfo);
        } catch (error) {
          console.log(error);
          console.log("Couldnot load signature");
          setIsLoading(false);
        }
      })
      .catch(error => {
        //console.warn("Error got: " + error)
        console.log(error);
        setIsLoading(false);
        apiErrorCheck(error, navi);
      }
      );
  };

  const checkNDACreditAndSend = async (isNdaCreditCheck, sendType, link, pdfEditConfig) => {
    console.log('Nda Check')

    if (isNdaCreditCheck) {
      let isConected = await Utils.isNetConnected()
      console.log("Is net connected: " + isConected);
      if (!isConected) {
        Utils.netConnectionFaild();
        //setBtnLoad(false);
        return
      }

      let api = API_URLS.MY_SUBSCRIPTION;
      let token = await Token.getToken();

      await fetch(api, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
        },
      }).then(response => response.json())
        .then(responseJson => {
          try {
            let a = JSON.stringify(responseJson);
            let json = JSON.parse(a);

            if (responseJson.status === 200) {
              let info = json.data;
              //setBtnLoad(false);
              //setSubscriptionInfo(info);
              console.log('Status ==> ok ==> getSubscriptionInfo');
              if (info?.nda_limit > 0) {

                console.log("NDA send type: " + sendType);

                if (sendType === "draft") {

                  saveNdaAsDraft(link, pdfEditConfig, 'draft');
                  if (test) {

                  } else {
                    setLoaderForLottieInfo({
                      ...loaderForLottieInfo,
                      load: true,
                      status: 'draft',
                      type: 'sender',
                      isShowSucess: true
                    })
                  }
                } else if (sendType === 'create_send') {

                  if (test) {
                    signAndSendNda(link, pdfEditConfig, 'pending')
                  } else {
                    signAndSendNda(link, pdfEditConfig, 'pending')

                    setLoaderForLottieInfo({
                      ...loaderForLottieInfo,
                      load: true,
                      status: 'pending',
                      type: 'sender',
                      isShowSucess: true
                    })
                  }
                } else if (sendType === 'receive_send') {

                  if (test) {
                    signAndSendNda(link, pdfEditConfig, 'receiver')
                  } else {

                    signAndSendNda(link, pdfEditConfig, 'receiver')

                    setLoaderForLottieInfo({
                      ...loaderForLottieInfo,
                      load: true,
                      status: 'pending',
                      type: 'receiver',
                      isShowSucess: true
                    })
                  }

                }

              } else {

                setBtnLoad(false);
                setBtnLoad2(false);

                navi.navigate('pricing-plan-home', {
                  isGoChooseNda: true,
                });
              }
            } else {
              console.log('Error: ' + JSON.stringify(json));
              //setBtnLoad(false);

              setBtnLoad(false);
              setBtnLoad2(false);


              if (json.message == 'You never subscribed here.') {
                navi.navigate('pricing-plan-home', {
                  isGoChooseNda: true,
                });
              }
            }
          } catch (error) {
            //console.warn(error);
            console.log(error);
            //setBtnLoad(false);

            //Net response faild 
            Utils.netConnectionFaild();
          }
        })
        .catch(error => {
          console.warn(error);
          //setBtnLoad(false);
          //Net response faild 
          Utils.netConnectionFaild();
        });

    } else {
      if (sendType === "draft") {

        saveNdaAsDraft(link, pdfEditConfig, 'draft');
        if (test) {
        } else {
          setLoaderForLottieInfo({
            ...loaderForLottieInfo,
            load: true,
            status: 'draft',
            type: 'sender',
            isShowSucess: true
          })
        }
      } else if (sendType === 'create_send') {

        if (test) {
          signAndSendNda(link, pdfEditConfig, 'pending')
        } else {
          signAndSendNda(link, pdfEditConfig, 'pending')

          setLoaderForLottieInfo({
            ...loaderForLottieInfo,
            load: true,
            status: 'pending',
            type: 'sender',
            isShowSucess: true
          })
        }
      } else if (sendType === 'receive_send') {

        if (test) {
          signAndSendNda(link, pdfEditConfig, 'receiver')
        } else {

          signAndSendNda(link, pdfEditConfig, 'receiver')

          setLoaderForLottieInfo({
            ...loaderForLottieInfo,
            load: true,
            status: 'pending',
            type: 'receiver',
            isShowSucess: true
          })
        }
      }

    }
  }

  const getSamplePdfDoNext = async (sendType) => {

    const routeData = data;

    switch (sendType) {
      case 'create_send':
        showLoading('send', true);
        break;
      case 'receive_send':
        showLoading('send', true);
        break;
      case 'draft':
        showLoading('draft', true);
        break;
      default:
    }

    let smplNdaId = sampleNdaId;
    if (sendType === 'receive_send') {
      smplNdaId = n_d_a_sample_id
    }
    let samplePdfEndPoint = API_URLS.NDA_SAMPLE_LIST_ + "/" + smplNdaId;

    //Need to loading
    console.log('Smaple NDA api: ' + samplePdfEndPoint);

    get(samplePdfEndPoint)
      .then(data => {
        try {
          console.log("-Sample PDF-" + JSON.stringify(data))
          let a = JSON.stringify(data);
          let json = JSON.parse(a);
          let link = json.data.link;
          console.log("PDF Link: " + link);

          let pdfEditConfig = json.data.pdf_edit_config;

          console.log("PDF Edit config " + JSON.stringify(pdfEditConfig));

          console.log("Send type: " + sendType);
          if (sendType === 'view') {

            console.log("File url type: " + sendType);

            if (fileUrl === null || fileUrl === undefined) {
              console.log("View file link: " + fileUrl);

              ndaAsView(link, pdfEditConfig, 'view');
              setLoaderForLottieInfo({
                ...loaderForLottieInfo,
                load: true,
                //status: 'draft',
                //type: 'sender',
                isShowSucess: false
              })

            } else {

              navi.navigate('nda_pdf_preview', {
                id: 1,
                name: receiver_name,
                link: fileUrl,
                isShareable: status === 'completed' ? true : false,
                isDownloadable: true,
              });
            }
          } else if (sendType === 'receive_send') {
            checkNDACreditAndSend(false, sendType, fileUrl, pdfEditConfig);
          } else {
            //Sender send
            let isNetCheck = true;
         
            if (routeData) {
              if (routeData.status === 'draft') {
                isNetCheck = false;
              }
            }
            checkNDACreditAndSend(isNetCheck, sendType, link, pdfEditConfig);
          }
        } catch (error) {
          console.log(error);
        }
      })
      .catch(error => {
        //console.warn("Error got: " + error)
        console.log(error);
        apiErrorCheck(error, navi)

        showLoading('send', false);
        showLoading('draft', false);
      }
      );
  };

  const handlePressBackBtn = () => {
    navi.goBack();
  };


  const ndaAsView = async (link, pdfEditConfig, status) => {
    await downloadFileForView(link, pdfEditConfig, status, 'draft');
  }

  const saveNdaAsDraft = async (link, pdfEditConfig, status) => {
    await downloadFile(link, pdfEditConfig, status, 'draft');
  }

  const signAndSendNda = async (link, pdfEditConfig, status) => {
    await downloadFile(link, pdfEditConfig, status, 'send');
  }

  const showLoading = (draftOrsend, isEnable) => {
    switch (draftOrsend) {
      case 'draft':
        setBtnLoad2(isEnable);
        break;
      case 'send':
        setBtnLoad(isEnable);
        break;
    }
  }
  //Download sample pdf
  //Sample or predefine file download
  const downloadFile = async (link, pdfEditConfig, status, draftOrsend) => {
    showLoading(draftOrsend, true);

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

        if (test) {
          getPdf(filePath, pdfEditConfig, status, draftOrsend);
        } else {
          setFileDownloaded(true);
          showLoading(draftOrsend, false);
          getPdf(filePath, pdfEditConfig, status, draftOrsend);
        }
      });
    }
  };

  const downloadFileForView = async (link, pdfEditConfig, status, draftOrsend) => {
    showLoading(draftOrsend, true);

    console.log("Is file Downloaded: " + fileDownloaded)
    if (true) { //!fileDownloaded
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

        // if (test) {
        //   getPdf(filePath, pdfEditConfig, status, draftOrsend);
        // } else {
        //setFileDownloaded(true);
        showLoading(draftOrsend, false);
        getPdfViewLink(filePath, pdfEditConfig, status, draftOrsend);
        //}
      });
    }
  };

  const getPdfViewLink = async (filePath_, pdfEditConfig, status, draftOrsend) => {
    var signature;
    await RNFS.readFile(signaturePath, 'base64')
      .then(res => {
        //console.log('Signature_', res);
        signature = res;
      });

    //SENDER SIGNATURE
    //setIsLoading(true);
    showLoading(draftOrsend, true);

    await makeNDAPdf(
      filePath_,
      pdfEditConfig,

      myProfileForm.full_name,
      myProfileForm.email,
      myProfileForm.address,
      myProfileForm.city + ', ' + myProfileForm.state_id + ', ' + myProfileForm.country_code + ', ' + myProfileForm.postal_code,

      receiver_name,
      receiver_email,
      receiver_address,
      receiver_city + ', ' + receiver_state_id + ', ' + receiver_country_code + ', ' + receiver_postal_code,

      custom_section,

      type,
      signature,
      (isSuccess, signedPdf) => {
        setCreatedPdf(signedPdf);
        console.log('CreateNdaSigning source: ' + signedPdf);
        //setIsLoading(false);
        showLoading(draftOrsend, false);


        navi.navigate('nda_pdf_preview', {
          id: 1,
          name: receiver_name,
          link: signedPdf,
          isShareable: status === 'completed' ? true : false,
          isDownloadable: false,
        });

        setLoaderForLottieInfo({
          ...loaderForLottieInfo,
          load: false,
          //status: 'draft',
          //type: 'sender',
          isShowSucess: false
        })
        // if (!test) {
        //   createNda(status, signedPdf, draftOrsend);
        // }
      },
    )
      .then(value => {
        console.log('Done done: ');
        //setIsLoading(false);
        showLoading(draftOrsend, false);
      })
      .catch(error => {
        console.warn('Error:', error);
        //setIsLoading(false);
        showLoading(draftOrsend, false);
      });

  };
  //Combined pdf
  const getPdf = async (filePath_, pdfEditConfig, status, draftOrsend) => {

    let signature;
    console.log('Signature path: ', signaturePath);
    await RNFS.readFile(signaturePath, 'base64')
      .then(res => {
        console.log('Signature_', res);
        signature = res;
      }).catch(error => {
        console.log('readFile: error: ', error);
      });

    //CONSTANTS.NDA_STATUS.COMPLETED
    //RECEIVER SIGNATURE
    if (status === 'receiver') {
      //setIsLoading(true);
      showLoading(draftOrsend, true);

      await signOnPdf(
        filePath_, //createdPdf,
        pdfEditConfig,
        signature,
        (isSuccess, signedPdf) => {
          if (isSuccess) {
            setCreatedPdf(signedPdf); //Upload on ui
            console.log('Signed Nda path ' + signedPdf);
            signedNda(signedPdf, draftOrsend);
          } else {
            console.log('Signed pdf failed ');
          }
          //setIsLoading(false);
          showLoading(draftOrsend, false);
        },
      ).then(value => {
        console.log('Pdf Signed done');
        //Visible Right side button
        //setIsLoading(false);
        showLoading(draftOrsend, false);
      });

    } else {
      //SENDER SIGNATURE
      //setIsLoading(true);
      showLoading(draftOrsend, true);

      await makeNDAPdf(
        filePath_,
        pdfEditConfig,

        myProfileForm.full_name,
        myProfileForm.email,
        myProfileForm.address,
        myProfileForm.city + ', ' + myProfileForm.state_id + ', ' + myProfileForm.country_code + ', ' + myProfileForm.postal_code,

        receiver_name,
        receiver_email,
        receiver_address,
        receiver_city + ', ' + receiver_state_id + ', ' + receiver_country_code + ', ' + receiver_postal_code,

        custom_section,

        type,
        signature,
        (isSuccess, signedPdf) => {
          setCreatedPdf(signedPdf);
          console.log('CreateNdaSigning source: ' + signedPdf);
          //setIsLoading(false);
          showLoading(draftOrsend, false);

          if (!test) {
            createNda(status, signedPdf, draftOrsend);
          }
        },
      )
        .then(value => {
          console.log('Done done: ');
          //setIsLoading(false);
          showLoading(draftOrsend, false);
        })
        .catch(error => {
          console.warn('Error:', error);
          //setIsLoading(false);
          showLoading(draftOrsend, false);
        });
    }
  };

  //Sender Create nda
  const createNda = async (status, createdPdf, draftOrsend) => {
    if (status === 'pending') {
      setBtnLoad(true);
    } else {
      setBtnLoad2(true);
    }

    console.log('create nda current status : ' + status);

    //Send data to draft
    if (status === 'draft') {
      isDraft = true;
      // setIsDraft(true)
    } else {
      isDraft = false;
      // setIsDraft(false)
    }

    var formDataN = new FormData();
    //Nda Name and status

    formDataN.append('nda_name', myProfileForm?.full_name + '_' + receiver_name + '_' + Date.now());
    // formDataN.append('nda_name', document_name);
    var api = Url.NDA_CREATE;

    if (id && status === 'draft') {
      formDataN.append('_method', 'PUT');
      api = Url.NDA_CREATE + '/' + id;
    } else if (id && status === 'pending') {
      formDataN.append('_method', 'PUT');
      api = Url.NDA_CREATE + '/' + id;
    }
    //If already drafted
    if (draftOrsend === 'draft') {
      //formDataN.append('_method', 'PUT');
      formDataN.append('status', status);
    } else {
      //formDataN.append('_method', 'PUT');
      formDataN.append('status', 'pending');
    }

    //Sender
    const sender_name = myProfileForm.full_name
    const sender_email = myProfileForm.email
    const sender_phone_number = myProfileForm.phone_number
    //const sender_company_name= myProfileForm.company_name
    const sender_address = myProfileForm.address
    const sender_city = myProfileForm.city
    const sender_state_id = myProfileForm.state_id
    const sender_country_code = myProfileForm.country_code
    const sender_postal_code = myProfileForm.postal_code

    formDataN.append('n_d_a_sample_id', sampleNdaId);
    //Nda sender
    formDataN.append('sender_name', sender_name ?? '');
    formDataN.append('sender_email', sender_email ?? '');
    formDataN.append('sender_phone_number', sender_phone_number ?? '');
    // formDataN.append('sender_company_name', sender_company_name);
    formDataN.append('sender_address', sender_address ?? '');
    formDataN.append('sender_city', sender_city ?? '');
    formDataN.append('sender_state', sender_state_id ?? '');
    formDataN.append('sender_country', sender_country_code ?? '');
    formDataN.append('sender_postal_code', sender_postal_code ?? '');
    formDataN.append('sender_address_status', 2);
    //formDataN.append('sender_country', sender_country ?? '');

    //Nda Receiver
    formDataN.append('receiver_name', receiver_name ?? '');
    formDataN.append('receiver_email', receiver_email ?? '');
    formDataN.append('receiver_phone_number', receiver_phone_number ?? '');
    // formDataN.append('receiver_company_name', receiver_company_name);
    formDataN.append('receiver_address', receiver_address ?? '');
    formDataN.append('receiver_city', receiver_city ?? '');
    formDataN.append('receiver_state', receiver_state_id ?? '');
    formDataN.append('receiver_country', receiver_country_code ?? '');
    formDataN.append('receiver_postal_code', receiver_postal_code ?? '');
    formDataN.append('receiver_address_status', sender_address_status ?? 2)

    formDataN.append('additional_information', custom_section ? custom_section : '')

    // Append the PDF file
    const pdfFile = {
      uri: Platform.OS === 'android' ? 'file://' + createdPdf : createdPdf, // Replace with the actual path of the PDF file
      name: 'file.pdf', // Replace with the desired file name
      type: 'application/pdf',
    };
    formDataN.append('file_url', pdfFile);

    console.log("API: " + JSON.stringify(formDataN));

    let userToken = await Token.getToken();
    if (userToken) {
      postNda(userToken, api, formDataN, draftOrsend);
    } else {
      console.log('Token not found in Create Nda SignIn ');
    }
  };

  //Receiver
  const signedNda = async (createdPdf, draftOrsend) => {
    //setBtnLoad(true);
    showLoading(draftOrsend, true);

    var formDataN = new FormData();
    //Nda Name and status
    formDataN.append('id', id);
    formDataN.append('nda_name', document_name);

    formDataN.append('draftOrsend', draftOrsend);


    // Append the PDF file
    const pdfFile = {
      uri: Platform.OS === 'android' ? 'file://' + createdPdf : createdPdf, // Replace with the actual path of the PDF file
      name: 'file.pdf', // Replace with the desired file name
      type: 'application/pdf',
    };
    formDataN.append('file_url', pdfFile);
    var api = Url.NDA_SIGNED; //Receiver
    let userToken = await Token.getToken();
    if (userToken) {
      postNda(userToken, api, formDataN, draftOrsend);
    } else {
      console.log('Token not found in Create Nda SignIn ');
    }
  };

  //Post to API
  const postNda = async (userToken, api, formData, draftOrsend) => {
    console.log('called ==> ====>', formData);

    //Service to get the data from the server to render

    //howLoading(draftOrsend, false);
    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      return
    }

    if (!btnLoad && !btnLoad2) {
      console.log('Post NDA: ' + api);
      await fetch(api, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          //'Accept-Encoding': Platform.OS === 'ios' ? 'gzip' : '',
          //'Content-Type': 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`, // notice the Bearer before your token
        },
        body: formData,
      })
        //Sending the currect offset with get request
        .then(async response => await response.json())
        .then(async responseJson => {
          //Increasing the offset for the next API call
          try {
            var a = JSON.stringify(responseJson);
            var json = JSON.parse(a);
            console.log(
              'NDA Create post api response:  ' + JSON.stringify(json),
            );

            if (responseJson !== null && responseJson.status === 200) {
              //console.log('NDA List:  ' + JSON.stringify(json));
              // onSendNdaBtnPress();
              console.log('isDraft==>', isDraft);
              // navi.navigate('create_nda_signing_success', {
              //   type: type,
              //   isDraft: isDraft,
              // });
            } else {
              console.log('NDA Create post status: ' + json);
              setModalShow(true)
              setModalMsg(json.message)
              setLoaderForLottieInfo({
                ...loaderForLottieInfo,
                load: false,
                isShowSucess: true
              })
              // Alert.alert('Error', `${json?.message}`, [
              //   { text: 'OK', onPress: () => { } },
              // ]);
            }
            setBtnLoad(false);
            setBtnLoad2(false);
          } catch (error) {
            console.warn(error);
            console.log(error);
            setBtnLoad(false);
            setBtnLoad2(false);
            // setLoaderForLottieInfo({
            //   ...loaderForLottieInfo,
            //   load: false,
            // })
          }
          setBtnLoad(false);
          setBtnLoad2(false);
          // setLoaderForLottieInfo({
          //   ...loaderForLottieInfo,
          //   load: false,
          // })
        })
        .catch(error => {
          console.warn(error);
          setBtnLoad(false);
          setBtnLoad2(false);
          // setLoaderForLottieInfo({
          //   ...loaderForLottieInfo,
          //   load: false,
          // })

          Utils.netConnectionFaild();

        })
        .finally(() => { });
    }
  };

  const isEmpty = async (value) => {
    console.log("Value of receiver : " + value);
    let result = (typeof value === 'undefined' || value === 'null' || value === undefined || value == null || value.trim() === '');

    console.log("Result: " + result);
    return result;
  }
  //############ unused functions start ##########################

  //############ unused functions end ##########################

  return (
    <>
      {
        loaderForLottieInfo?.load ?
          <CreateNdaSuccess
            type={loaderForLottieInfo?.type}
            isDraft={loaderForLottieInfo?.status == 'draft'}
            isShowSuccess={loaderForLottieInfo?.isShowSucess}
          />
          :
          <View style={{
            flex: 1,
            backgroundColor: 'transparent',
          }}>
            <SafeAreaView style={styles.container}>

              <LogoHeader />

              <ModalPoupSingle
                theme={theme}
                visible={isVisibleSignWarning}
                title={
                  'Please place your signature'
                }
                source={require('../../assets/warning.json')}
                btnTxt={'Ok'}
                onPressOk={() => {
                  setSignWarning(false);
                }}
                onPressClose={() => setSignWarning(false)}
              />

              <ModalPoup
                theme={theme}
                visible={modalShow}
                title={modalMsg}
                source={require('../../assets/sign_in_animation.json')}
                btnTxt={'Ok'}
                onPressOk={() => setModalShow(false)}
                onPressClose={() => setModalShow(false)}
              />

              <ModalPoupUserInfoComponent
                visible={isVisibleReceipentDetails}
                theme={theme}
                title={'View Recipient'}

                name={receiver_name}
                email={receiver_email}
                phone={receiver_phone_number}
                address={receiver_address}
                address_full={receiver_city + ', ' + receiver_state_id + ', ' + receiver_country_code + ', ' + receiver_postal_code}
                // msg={'Save your details Information & Signature for using later.'}
                // /source={require('../../assets/profile_anim.json')}
                onPressOk={() => {
                  //setProfileUpdateModalVisible(false);
                  // navi.navigate('my_profile_home', {
                  //   from: 'home',
                  // });

                  setVisibleReceipentDetails(false)
                }}
                onPressClose={() => { setVisibleReceipentDetails(false) }}
              />

              {isLoading ? (
                <ActivityIndicator
                  color={theme?.name == 'Light' ? globalStyle.colorAccent : theme?.colors?.text}
                  style={{
                    //flexGrow: 1,
                    //marginTop: 'auto',
                    //marginBottom: 'auto',
                    //height: Dimensions.get('window').height * 0.7,
                    height: height * .7,
                    //paddingBottom: 20
                  }}
                />
              ) :
                (
                  <ScrollView
                    contentContainerStyle={{
                      flexGrow: 1,
                      justifyContent: 'center',
                      paddingBottom: 70,
                    }}>
                    <View style={{

                      // backgroundColor: 'red',
                      flexDirection: 'column',
                      paddingBottom: 70
                    }}>

                      <View style={{ marginBottom: 40, alignSelf: 'flex-start' }}>
                        <TouchableOpacity
                          style={{
                            marginStart: 40,
                          }}
                          onPress={handlePressBackBtn}
                        >
                          {theme?.header?.backIcon}
                        </TouchableOpacity>
                      </View>



                      <View style={styles.buttonContainer}>
                        <CustomButton
                          title={'VIEW'}
                          color={theme?.colors?.btnText}
                          colors={theme?.colors?.colors}
                          bordered={true}
                          borderWidth={theme?.name === 'Light' ? 0 : 3}
                          borderColor={theme?.colors?.borderColor}
                          borderColors={theme?.colors?.borderColors}
                          shadow={theme?.name === 'Light'}
                          disabled={btnLoad || btnLoad2}

                          onPress={() => {
                            getSamplePdfDoNext('view')
                          }}
                        />
                      </View>

                      {showRecipientBtn ? (
                        <View style={styles.buttonContainer}>
                          <CustomButton
                            title={'View Recipient'}

                            color={theme?.colors?.btnText}
                            colors={theme?.colors?.colors}
                            bordered={true}
                            borderWidth={theme?.name == 'Light' ? 0 : 3}
                            borderColor={theme?.colors?.borderColor}
                            borderColors={theme?.colors?.borderColors}
                            shadow={theme?.name == 'Light'}

                            onPress={() => {
                              //getSamplePdfDoNext('draft');
                              setVisibleReceipentDetails(true);
                            }}
                          />
                        </View>
                      ) : null}

                      {showDraftBtn ? (
                        <View style={styles.buttonContainer}>
                          <CustomButton
                            title={'SAVE AS DRAFT'}
                            isLoading={btnLoad2}
                            color={theme?.colors?.btnText}
                            colors={theme?.colors?.colors}
                            bordered={true}
                            borderWidth={theme?.name == 'Light' ? 0 : 3}
                            borderColor={theme?.colors?.borderColor}
                            borderColors={theme?.colors?.borderColors}
                            shadow={theme?.name == 'Light'}
                            disabled={btnLoad || btnLoad2}

                            onPress={() => {
                              getSamplePdfDoNext('draft');
                            }}
                          />
                        </View>
                      ) : null}

                      {showSignNSendBtn ? (
                        <View style={styles.buttonContainer}>
                          <CustomButton
                            title={status !== "pending" ? 'EDIT' : 'SIGN & SEND'}
                            color={theme?.colors?.btnText}
                            colors={theme?.colors?.colors}
                            isLoading={btnLoad}
                            bordered={true}
                            borderWidth={theme?.name === 'Light' ? 0 : 3}
                            borderColor={theme?.colors?.borderColor}
                            borderColors={theme?.colors?.borderColors}
                            shadow={theme?.name === 'Light'}
                            disabled={btnLoad || btnLoad2}

                            onPress={async () => {

                              if (status == 'draft') { //Edit as Sender

                                console.log('From Draft')
                                navi.navigate('create_nda_receiver_info', {
                                  receiver_name: data?.receiver_name,
                                  receiver_email: data?.receiver_email,
                                  receiver_phone_number: data?.receiver_phone_number,
                                  receiver_company_name: data?.receiver_company_name,
                                  receiver_address: data?.receiver_address,
                                  receiver_city: data?.receiver_city,
                                  receiver_state_id: data?.receiver_state,
                                  receiver_postal_code: data?.receiver_postal_code,

                                  custom_section: custom_section,

                                  data: data,
                                  isEdit: true,
                                },)
                              } else { // Signed and Send as Receiver
                                console.log("Display as: " + displayAs);
                                if (displayAs === 'receiver') {
                                  //downloadFile(fileUrl, 'receiver');
                                  getSamplePdfDoNext('receive_send');
                                } else { // as sender

                                  console.log('Receiver name: ' + receiver_name);

                                  console.log(' receiver_name: ' + receiver_name +
                                    ' receiver_email: ' + receiver_email +
                                    ' receiver_phone_number: ' + receiver_phone_number +
                                    ' receiver_address: ' + receiver_address +
                                    ' receiver_city: ' + receiver_city +
                                    ' receiver_state_id: ' + receiver_state_id +
                                    ' receiver_country_code: ' + receiver_country_code +
                                    ' receiver_postal_code: ' + receiver_postal_code)

                                  if (await isEmpty(receiver_name) ||
                                    await isEmpty(receiver_email) ||
                                    await isEmpty(receiver_phone_number) ||
                                    await isEmpty(receiver_address) ||
                                    await isEmpty(receiver_city) ||
                                    await isEmpty(receiver_state_id) ||
                                    await isEmpty(receiver_country_code) ||
                                    await isEmpty(receiver_postal_code)
                                  ) {

                                    console.log("Receiver info: undefined ");
                                    setModalShow(true)
                                    setModalMsg("Receiver information missing");

                                  } else {
                                    console.log("Receiver info: found ");
                                    //Signe and Send as sender
                                    getSamplePdfDoNext('create_send');
                                    return
                                  }
                                }
                              }
                            }}
                          />
                        </View>) : null}

                    </View>
                  </ScrollView>
                )}

              {test &&
                <ScrollView>
                  <Pdf
                    // minScale={1.0}
                    // maxScale={1.0}
                    scale={1.0}
                    // spacing={-50}
                    fitPolicy={0}
                    enablePaging={true}
                    source={{ uri: createdPdf }}
                    // source={{ uri: Url.FILE_URL + link }}
                    usePDFKit={true}
                    // onLoadComplete={(
                    //   numberOfPages,
                    //   filePath,
                    //   { width, height },
                    // ) => {
                    //   setPageWidth(width);
                    //   setPageHeight(height);
                    // }}
                    onPageSingleTap={(page, x, y) => {
                      //handleSingleTap(page, x, y);
                      console.log("Page: " + page + " x: " + x + " y: " + y);
                    }}
                    style={{
                      ...styles.pdf,
                      width: width * 0.5,
                      height: height * 0.5
                    }}
                  />
                </ScrollView>}

            </SafeAreaView>
          </View>
      }
    </>
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
    //paddingBottom: globalStyle.bottomPadding,
    // backgroundColor: globalStyle.statusBarColor,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  btnDiv: {
    marginTop: 5,
    paddingBottom: globalStyle.bottomPadding,
    //paddingHorizontal: 35,
  },
  btnText: {
    color: 'white',
    fontSize: 18,
  },
  template: {
    flex: 1,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 500,
    textAlign: 'center',
  },
  row: {
    flex: 1,
    zIndex: 1,
    flexDirection: 'row',
    position: 'absolute',
    //height: Dimensions.get('window').height / 2,
    // justifyContent: 'flex-start',
    // alignItems: 'center',
    // alignSelf: 'center',
    // alignContent: 'center',
  },
  icon: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  bottomControlBtnContainer: {
    //flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 0,
    //gap: 15,
    //bottom: 0,
    //zIndex: 1,
    width: '100%',
    position: 'absolute',
    alignSelf: 'center',
    // paddingHorizontal: 5,
    backgroundColor: 'white',
  },
  bottomBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 60,
  },
  bottomTxt: {
    fontSize: 10,
    lineHeight: 24,
    // color: '#334669',
    justifyContent: 'center',
    opacity: 0.6,
  },
  pdf: {
    alignSelf: 'center',
    //paddingBottom: 50,
    //height: '90%',
    //height: 'auto',
    //height: 580,
  },
});
