import { useNavigation } from '@react-navigation/native';
import { React, useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, Image, ActivityIndicator, Dimensions, } from 'react-native';
import { ScrollView } from 'react-native-virtualized-view';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
//Image Resource

//Assets
import NdaSmall from '../../assets/ndaSmall.svg';
import UserFill from '../../assets/userFill.svg';

//Variables
//Class
//Component
import LottieView from 'lottie-react-native';
import DocumentListHeader from '../components/global/DocumentListHeaderComponent';
import StepsComponent from '../components/global/StepsComponent';
import CustomButton from '../components/global/ButtonComponent.js';
//Style
import globalStyle from '../../styles/MainStyle.js';
import { useTheme } from '../../styles/ThemeProvider';
import Url from '../Api.js';
import Token from '../class/TokenManager';


export default function CreateNdaPartyCustomize(navigation) {
  const { theme } = useTheme();

  const navi = useNavigation();
  const animation = useRef(null);
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const [myProfileForm, setMyProfileData] = useState({});
  const [receiverData, setReceiverData] = useState({});

  // Access the variables passed through the navigation route
  const {
    sample_id,
    sample_name,
    document_name,
    filePath,

    data,
    // senderInfo,
    // sender_name,
    // sender_email,
    // sender_phone_number,
    // sender_company_name,
    // sender_address,
    // sender_city,
    // sender_state_id,
    // sender_postal_code,
    // sender_country,

    receiver_name,
    receiver_email,
    receiver_phone_number,
    receiver_company_name,
    receiver_address,
    receiver_city,
    receiver_state_id,
    receiver_country_code,
    receiver_postal_code,
    receiver_country,
  } = navigation.route.params;

  // console.log("senderInfo==?", senderInfo.avatar);

  useEffect(() => {
    console.log(
      'CreateNdaPartyList: ' + JSON.stringify(navigation.route.params),
    );
    const asyncFunc = async () => {
      let userToken = await Token.getToken();
      if (userToken) {
        //getStateList(userToken);
        getUserDetails(userToken, receiver_email);
        getProfileInfo(userToken);
      } else {
        console.log('Token not found');
        return false;
      }
    };

    asyncFunc();
  }, []);

  const getUserDetails = async (token, email) => {
    setIsLoading(true);
    var userDetailsApi = Url.USER_SEARCH + '/' + email;
    console.log('Get User details Api: ' + userDetailsApi);
    await fetch(userDetailsApi, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        try {
          var a = JSON.stringify(responseJson);
          var json = JSON.parse(a);
          if (responseJson.status === 200) {
            console.log('User details received ==> ok');
            console.log('User details' + JSON.stringify(json));
            //setIsRightBtn(true)
            var receiverInfo = json.data;
            setReceiverData(receiverInfo);
          } else {
            console.log('User details error: ' + JSON.stringify(json));
          }
          setIsLoading(false);
        } catch (error) {
          console.warn(error);
          console.log(error);
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.warn(error);
        setIsLoading(false);
      });
  };

  const getProfileInfo = async token => {
    setIsLoading2(true);
    var stateApi = Url.PROFILE;
    await fetch(stateApi, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        try {
          var a = JSON.stringify(responseJson);
          var json = JSON.parse(a);
          if (responseJson.status === 200) {
            var profileInfo = json.data;
            // console.log("profileInfo==>", profileInfo)
            setMyProfileData(profileInfo);
          } else {
            console.log('Error:==>' + JSON.stringify(json));
          }
          setIsLoading2(false);
        } catch (error) {
          console.warn(error);
          console.log(error);
          setIsLoading2(false);
        }
      })
      .catch(error => {
        console.warn(error);
        setIsLoading2(false);
      });
  };


  const handlePress = () => {
    navi.goBack();
  };

  return (
    <ImageBackground
      source={theme?.bg?.bgImg}
      resizeMode="cover"
      style={styles.bgImage}
    >
      <SafeAreaView style={styles.container}>
        <View>
          <DocumentListHeader
            onPress={handlePress}
            title={'Create NDA'}

            backIcon={theme?.header?.backIcon}
            statusBarColor={theme?.colors?.statusBarColor}
            dark={theme?.name == 'Light'}
            color={theme?.colors?.text}
          />

          {/* <ThemeSelectorForTest /> */}

          <ScrollView // Category List
            horizontal={false}
            // style={styles.categoryListContainer}
            showsHorizontalScrollIndicator={true}
          >
            {(isLoading || isLoading2) ?
              <ActivityIndicator
                color={theme?.name == 'Light' ? globalStyle.colorAccent : theme?.colors?.text}
                style={{
                  marginTop: 'auto',
                  marginBottom: 'auto',
                  height: Dimensions.get('window').height * 0.88,
                }}
              />
              :
              <View style={{ marginTop: 15 }}>
                {/* Steps */}
                <View>
                  <StepsComponent active={2} theme={theme} />
                </View>

                <View style={{ padding: 24, marginBottom: 40 }}>
                  {/* Loader */}
                  <LottieView
                    autoPlay
                    ref={animation}
                    style={styles.animation}
                    source={require('../../assets/processing.json')}
                    loop
                  />

                  <View
                    style={{
                      ...styles.report,
                      shadowOpacity: theme?.name == 'Light' ? 1 : 0,
                      shadowRadius: theme?.name == 'Light' ? 10 : 0,
                      backgroundColor: theme?.name == 'Light' ? 'white' : 'rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <View style={styles.ndaDiv}>
                      <View>
                        <NdaSmall />
                      </View>
                      <View style={{ margin: 10 }}>
                        <Text
                          style={{ ...styles.title, color: theme?.name == 'Light' ? '#2E476E' : theme?.colors?.text }}
                        >
                          {document_name}
                        </Text>
                        {/* <Text style={styles.createdAt}>
                        Created at : 9 Nov 2023 9:00 AM
                      </Text> */}
                      </View>
                    </View>

                    <View style={styles.partyStatusDiv}>
                      <View
                        style={{
                          ...styles.disclosing,
                          backgroundColor: theme?.name == 'Light' ? '#6E81A0' : theme?.colors?.text
                        }}
                      >
                        <Text
                          style={{ ...styles.status, color: theme?.name == 'Light' ? 'white' : 'black' }}
                        >Party Disclosing</Text>
                      </View>

                      <View
                        style={{
                          ...styles.receiving,
                          backgroundColor: theme?.name == 'Light' ? '#2E476E' : theme?.colors?.text
                        }}
                      >
                        <Text
                          style={{ ...styles.status, color: theme?.name == 'Light' ? 'white' : 'black' }}
                        >Party Receiving</Text>
                      </View>
                    </View>

                    <View style={styles.partyList}>
                      <View style={{ width: '45%' }}>
                        <View style={styles.party}>
                          {myProfileForm?.avatar ?
                            // {senderInfo?.avatar ?
                            <Image
                              source={{
                                uri: Url.IMAGE_URL + myProfileForm?.avatar,
                                // uri: Url.IMAGE_URL + '/' + senderInfo?.avatar,
                              }}
                              fallbackSource={{
                                uri: 'https://www.w3schools.com/css/img_lights.jpg',
                              }}
                              style={{ ...styles.profilePic, borderColor: theme?.name == 'Light' ? '#2E476E' : 'white' }}
                              aspectRatio={1}
                              alt=""
                              // size="2xl"
                              resizeMode="cover"
                            />
                            :
                            <View style={styles.iconDiv}>
                              <UserFill style={styles.icon} />
                            </View>
                          }
                          {/* <View style={styles.iconDiv}>
                          <UserFill style={styles.icon} />
                        </View> */}
                          <View
                            style={{ marginStart: 5 }}>
                            <Text style={{ ...styles.userName, color: theme?.name == 'Light' ? '#2E476E' : theme?.colors?.text }}
                            >
                              {myProfileForm?.full_name}</Text>
                            {/* {sender_name}</Text> */}
                            <Text
                              style={{
                                ...styles.userEmail,
                                color: theme?.name == 'Light' ? '#2E476E' : 'white',
                              }}
                            >
                              {myProfileForm?.email}</Text>
                            {/* {sender_email}</Text> */}
                          </View>
                        </View>
                      </View>

                      <View style={{ width: '45%' }}>
                        <View style={styles.party}>
                          {receiverData?.avatar ?
                            <Image
                              source={{
                                uri: Url.IMAGE_URL + receiverData?.avatar,
                              }}
                              fallbackSource={{
                                uri: 'https://www.w3schools.com/css/img_lights.jpg',
                              }}
                              style={{ ...styles.profilePic, borderColor: theme?.name == 'Light' ? '#2E476E' : 'white' }}
                              aspectRatio={1}
                              alt=""
                              // size="2xl"
                              resizeMode="cover"
                            />
                            :
                            <View style={styles.iconDiv}>
                              <UserFill style={styles.icon} />
                            </View>
                          }

                          <View
                            style={{ marginStart: 5 }}>
                            <Text style={{ ...styles.userName, color: theme?.name == 'Light' ? '#2E476E' : theme?.colors?.text }}
                            >
                              {receiver_name}</Text>
                            <Text
                              style={{
                                ...styles.userEmail,
                                color: theme?.name == 'Light' ? '#2E476E' : 'white',
                              }}
                            >
                              {receiver_email}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.btnDiv}>
                  <CustomButton
                    title={'Customize'}

                    color={theme?.colors?.btnText}
                    colors={theme?.colors?.colors}
                    bordered={true}
                    borderWidth={theme?.name == 'Light' ? 0 : 3}
                    borderColors={theme?.colors?.borderColors}
                    borderColor={theme?.colors?.borderColor}
                    shadow={theme?.name == 'Light'}

                    onPress={() => {
                      // navi.navigate('create_nda_acceptance');
                      navi.navigate('create_nda_acceptance', {
                        id: sample_id,
                        name: sample_name,
                        filePath: filePath,
                        document_name: document_name,
                        data: data,
                        
                        sender_name: 'NN',
                        //Receiver
                        receiver_name: receiver_name,
                        receiver_email: receiver_email,
                        receiver_phone_number: receiver_phone_number || navigation.route?.params?.receiver_phone_number,
                        receiver_company_name: receiver_company_name || '',
                        receiver_address: receiver_address,
                        receiver_city: receiver_city,
                        receiver_state_id: receiver_state_id,
                        receiver_postal_code: receiver_postal_code,
                        receiver_country: receiver_country_code,
                      });
                    }}
                  />
                </View>

                <View style={styles.btnDiv}>
                  <CustomButton
                    title={'Proceed to sign'}

                    color={theme?.colors?.btnText}
                    colors={theme?.colors?.colors}
                    bordered={true}
                    borderWidth={theme?.name == 'Light' ? 0 : 3}
                    borderColors={theme?.colors?.borderColors}
                    borderColor={theme?.colors?.borderColor}
                    shadow={theme?.name == 'Light'}

                    onPress={() => {
                      //navi.navigate('create_nda_signing');
                      // navi.navigate('create_nda_signing', {
                      //   sample_id: sample_id,
                      //   sample_name: sample_name,
                      //   document_name: document_name,

                      //   type: 'sender',
                      //   filePath: filePath,
                      //   data: data,

                      //   //Sender
                      //   senderInfo: myProfileForm,
                      //   sender_name: myProfileForm.full_name,
                      //   sender_email: myProfileForm.email,
                      //   sender_phone_number: myProfileForm.phone_number,
                      //   // sender_company_name: myProfileForm.company_name,
                      //   sender_address: myProfileForm.address,
                      //   sender_city: myProfileForm.city,
                      //   sender_state_id: myProfileForm.state_id,
                      //   sender_country_code: myProfileForm.country_code,
                      //   sender_postal_code: myProfileForm.postal_code,
                      //   //sender_country: 'USA',

                      //   //Receiver
                      //   receiver_name: receiver_name,
                      //   receiver_email: receiver_email,
                      //   receiver_phone_number: receiver_phone_number,
                      //   // receiver_company_name: receiver_company_name,
                      //   receiver_address: receiver_address,
                      //   receiver_city: receiver_city,
                      //   receiver_state_id: receiver_state_id,
                      //   receiver_country_code: receiver_country_code,
                      //   receiver_postal_code: receiver_postal_code,
                      //   //receiver_country: 'USA',
                      // });

                      // console.log('Sample ID:', sample_id);
                      // console.log('Sample Name:', sample_name);
                      // console.log('Document Name:', document_name);
                      // console.log('File Path:', filePath);
                      // console.log('Sender Name:', sender_name);
                      // console.log('Sender Email:', sender_email);
                      // console.log('Sender Phone Number:', sender_phone_number);
                      // console.log('Sender Company Name:', sender_company_name);
                      // console.log('Sender Address:', sender_address);
                      // console.log('Sender City:', sender_city);
                      // console.log('Sender State:', sender_state_id);
                      // console.log('Sender Postal Code:', sender_postal_code);
                      // console.log('Sender Country:', sender_country);
                      // console.log('Receiver Name:', receiver_name);
                      // console.log('Receiver Email:', receiver_email);
                      // console.log('Receiver Phone:', receiver_phone_number);
                      // console.log('Receiver Company Name:', receiver_company_name);
                      // console.log('Receiver Address:', receiver_address);
                      // console.log('Receiver City:', receiver_city);
                      // console.log('Receiver State ID:', receiver_state_id);
                      // console.log('Receiver Postal Code:', receiver_postal_code);
                      // console.log('Receiver Country:', receiver_country);
                    }}
                  />
                </View>
              </View>
            }
            {/* <ThemeSelectorForTest /> */}

          </ScrollView>
        </View>
      </SafeAreaView>
    </ImageBackground >
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    justifyContent: 'center',
  },
  profilePic: {
    height: 40,
    width: 40,
    borderRadius: 50,
    marginEnd: 5,
    borderWidth: 1,
    // borderColor: '#2E476E',
  },
  container: {
    flex: 1,
    // backgroundColor: globalStyle.statusBarColor,
    paddingBottom: globalStyle.bottomPadding + 30,
  },
  animation: {
    flex: 1,
    height: 134,
  },
  createdAt: {
    fontSize: 10,
    lineHeight: 25,
    fontWeight: '300',
    color: '#2e476e',
  },
  party: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    // width: '50%',
    // gap: 5,
    paddingTop: 5,
  },
  ndaDiv: {
    flexDirection: 'row',
  },
  ndaStatus: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
  },
  partyStatusDiv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },

  partyList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // gap: 10,
    marginTop: 5,
  },

  report: {
    marginTop: 15,

    padding: 15,
    borderRadius: 20,
    // backgroundColor: '#fff',
    shadowColor: '#2E476E',
    // shadowRadius: 20,
    // elevation: 20,
    // shadowOpacity: 1,
    // flex: 1,
    // width: "100%",
    // height: 205
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
    // color: '#2e476e',
  },
  btnDiv: {
    marginTop: 5,
    //paddingBottom: 5,
    paddingHorizontal: 35,
    paddingBottom: globalStyle.bottomPadding,
    // top: 190,
    // bottom: 0,
  },
  btnText: {
    color: 'white',
    fontSize: 18,
  },
  receiver: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 20,
    backgroundColor: 'white',

    shadowColor: '#2E476E',
    shadowRadius: 20,
    elevation: 20,
    shadowOpacity: 1,
  },
  disclosing: {
    // backgroundColor: '#6E81A0',
    borderRadius: 30,
    // minWidth: 125,
    height: 25,
    marginTop: 'auto',
    marginBottom: 'auto',
    width: '45%',
  },
  receiving: {
    backgroundColor: '#2E476E',
    borderRadius: 30,
    // minWidth: 125,
    height: 25,
    marginTop: 'auto',
    marginBottom: 'auto',
    width: '45%',
  },
  status: {
    color: 'white',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    fontSize: 12,
  },
  date: {
    color: '#2E476E',
    fontSize: 10,
    fontWeight: 300,
    marginTop: 7,
  },
  topSec: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconSec: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
  },
  iconDiv: {
    backgroundColor: '#F0F0F0',
    height: 40,
    width: 40,
    borderRadius: 50,
    marginEnd: 5,
  },
  icon: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  userName: {
    fontWeight: 400,
    fontSize: 12,
    lineHeight: 25,
    // color: '#2e476e',
  },
  userEmail: {
    // color: '#2E476E',
    fontSize: 10,
    fontWeight: 300,
    paddingEnd: 30,

    // flex: 1,
    // flexWrap: 'wrap',
  },
  completeDiv: {
    marginTop: 50,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  complete: {
    color: '#2E476E',
    fontSize: 24,
    fontWeight: 700,
  },
});
