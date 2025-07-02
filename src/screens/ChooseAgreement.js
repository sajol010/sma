import { useNavigation } from '@react-navigation/native';
import { React, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DropDown from '../components/global/StateDropDownComponent.js';
//Image Resource
//Assets
import Agreement from '../../assets/agreement.svg';
import Eyesm from '../../assets/eyesm.svg';

//Variables
//Class
//Component
import DocumentListHeader from '../components/global/DocumentListHeaderComponent';
//Class
import Token from '../class/TokenManager';
//Style
import globalStyle from '../../styles/MainStyle.js';
//Urls
import Url from '../Api.js';
import { useTheme } from '../../styles/ThemeProvider.js';

export default function ChooseAgreement(navigation) {
  const { theme } = useTheme();

  const navi = useNavigation();
  const [stateListLoading, setStateListLoading] = useState(false);
  const [stateList, setStateList] = useState([]);
  const [data, setData] = useState([]);
  // const [ndaList, setNdaList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [isRefresh, setIsRefresh] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [token, setToken] = useState(null);


  const [ndaSampleLoading, setNdaSampleLoading] = useState(true);

  const insets = useSafeAreaInsets();

  const handlePress = () => {
    navi.goBack();
    console.log('Button pressed!');
  };

  useEffect(() => {
    //setLoading(true);
    // navi.dispatch(StackActions.popToTop());

    getStateNdaSamples(null);

    const bootstrapAsync = async () => {
      let userToken = await Token.getToken();
      if (userToken) {
        setToken(userToken)
        // Use the token in your application
        getStateList(userToken);
      } else {
        // Handle the case where the token doesn't exist
        console.log('Token not found');
        return false;
      }
    };
    console.log('UseEffect');

    bootstrapAsync();
  }, []);

  useEffect(() => {
    if (token && !isRefresh) {
      getStateNdaSamples(selectedStateId);
    }
  }, [currentPage]);

  const getStateList = async token => {
    setStateListLoading(true);
    // console.log('Token: ' + token);
    var EventApi = Url.STATE_LIST;
    // console.log('Api: ' + EventApi);
    //Service to get the data from the server to render
    await fetch(EventApi, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
      },
    })
      //Sending the currect offset with get request
      .then(response => response.json())
      .then(responseJson => {
        //Successful response
        //Increasing the offset for the next API call
        try {
          var a = JSON.stringify(responseJson);
          var json = JSON.parse(a);
          // console.log('State list JSON ' + JSON.stringify(json));
          if (responseJson.status === 200) {
            var list = json.data;
            // console.log('State data  ' + JSON.stringify(json));
            //Careate  new JSON
            var newData = [];
            for (let i = 0; i < list.length; i++) {
              const item = list[i];
              const newItem = { label: item.name, value: item.id, country_id: item.country_id, country_code: item.country_code};
              newData.push(newItem);
              // console.log(item.name, item.id);
            }
            // console.log('New data state list: ' + JSON.stringify(newData));
            setStateList(newData);
            //TODO use data
          } else {
            // console.log('State list error: ' + JSON.stringify(json));
          }
          setStateListLoading(false);
        } catch (error) {
          console.warn(error);
          console.log(error);
          setStateListLoading(false);
        }
        //setDataSource([...dataSource, ...responseJson.results]);
      })
      .catch(error => {
        console.warn(error);
        setStateListLoading(false);
      });
  };

  const getStateNdaSamples = async (id = null, refresh = false) => {
    console.log('fetching data ...');

    let userToken = await Token.getToken();
    if (userToken) {
      // Use the token in your application
    } else {
      // Handle the case where the token doesn't exist
      console.log('Token not found');
      return false;
    }

    // setNdaSampleLoading(true);
    var api = Url.NDA_SAMPLE_LIST + `?page=${refresh ? 1 : currentPage}&paginate=16`
    if (id) {
      setNdaSampleLoading(true);
      api = Url.NDA_SAMPLE_LIST + `?page=${refresh ? 1 : currentPage}&paginate=16&state_id=${id}`
    }
    console.log('api=> ' + api);
    //Service to get the data from the server to render
    await fetch(api, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`, // Bearer ${token} notice the Bearer before your token
      },
    })
      //Sending the currect offset with get request
      .then(response => response.json())
      .then(responseJson => {
        //Successful response
        //Increasing the offset for the next API call
        try {
          var a = JSON.stringify(responseJson);
          var json = JSON.parse(a);
          // console.log('State list JSON ' + JSON.stringify(json));
          if (responseJson.status === 200) {
            // var list = json.data.data;
            // // console.log('list==><', list.length);
            // setData(list);

            var apiData = json.data;
            var apiDataArr = apiData?.data;
            setPageInfo({
              total: apiData?.total,
              current_page: apiData?.current_page,
              last_page: apiData?.last_page,
            })

            console.log("isRefresh==>", refresh);

            const newData = (refresh || id) ? apiDataArr : data.concat(apiDataArr);
            setData(newData);

            if (apiData?.last_page > 1 && apiData?.current_page != apiData?.last_page) {
              setLoadMore(true);
            } else {
              setLoadMore(false);
            }

            setIsRefresh(false);
            // setData(data?.data);

            console.log('apiData?.current_page', apiData?.current_page);
            console.log('apiData?.last_page', apiData?.last_page);
            console.log('Status ==> ok');
          } else {
            console.log('Error' + JSON.stringify(json));
          }
          setNdaSampleLoading(false);
        } catch (error) {
          console.warn(error);
          console.log(error);
          setNdaSampleLoading(false);
          setLoadMore(false);
          setIsRefresh(false);
        }
        //setDataSource([...dataSource, ...responseJson.results]);
      })
      .catch(error => {
        console.warn(error);
        setNdaSampleLoading(false);
        setLoadMore(false);
        setIsRefresh(false);
      });
  };


  const ItemView = ({ item }) => {
    return (
      // Flat List Item
      <TouchableOpacity
        onPress={() => {
          navi.navigate('choose_templates', {
            id: item.id,
            name: item.name,
            link: item.link,
          });
        }}
        style={[
          Platform.OS === 'ios'
            ? styles.shadowIos
            : {
              ...styles.shadowAndroid,
              elevation: theme?.name == 'Light' ? 16 : 0
            },
          {
            ...styles.listItem,
            backgroundColor: theme?.name == 'Light' ? 'white' : 'rgba(255, 255, 255, 0.15)'
          },
        ]}
      >

        <View style={styles.textDiv}>
          {/* <Agreement /> */}
          {theme?.nda?.agreement}
          <View style={{ marginStart: 8 }}>
            <Text
              style={{ ...styles.title, color: theme?.name == 'Light' ? '#2E476E' : theme?.colors?.text }}
            >
              {item?.name}
            </Text>
            <Text style={{ ...styles.subTitle, color: theme?.name == 'Light' ? '#2E476E' : 'white' }}>
              This template is used by 1098+ Users world wide.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          color={'white'}
          style={theme?.name == 'Light' ? styles.iconDiv : { alignSelf: 'flex-end' }}
          onPress={() => {
            navi.navigate('choose_templates', {
              id: item.id,
              name: item.name,
              link: item.link,
            });
          }}>
          {theme?.nda?.eye}
        </TouchableOpacity>

      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    return (
      //Footer View with Load More button
      <>
        {loadMore &&
          <ActivityIndicator
            color={theme?.name != 'Light' ? theme?.colors?.text : globalStyle.colorAccent}
          />
        }
      </>
    );
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
            title={'Choose Agreement'}

            backIcon={theme?.header?.backIcon}
            statusBarColor={theme?.colors?.statusBarColor}
            dark={theme?.name == 'Light'}
            color={theme?.colors?.text}
          />

          {/* <ThemeSelectorForTest /> */}

          <View style={styles.select}>
            {!stateListLoading ? (
              <View
                style={{
                  marginTop: 8,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}>
                {/* <Text>{JSON.stringify(eventType)}</Text> */}
                <DropDown
                  data={stateList}
                  placeholderTitle={'Select State'}

                  icon={theme?.profileIcon?.location}
                  borderColor={theme?.textInput?.borderColor}
                  backgroundColor={theme?.textInput?.backgroundColor}
                  borderWidth={theme?.textInput?.borderWidth}
                  darkShadowColor={theme?.textInput?.darkShadowColor}
                  lightShadowColor={theme?.textInput?.lightShadowColor}
                  shadowOffset={theme?.textInput?.shadowOffset}
                  placeholderColor={theme?.textInput?.placeholderColor}
                  inputColor={theme?.textInput?.inputColor}

                  onSelectItem={(id, item) => {
                    console.log('Select Sample id: ' + id);
                    setCurrentPage(1);
                    setSelectedStateId(id);
                    getStateNdaSamples(id);
                    //setData({...formData, event_type_id: id});
                  }}
                />
              </View>
            ) : (
              <ActivityIndicator color={theme?.name == 'Light' ? globalStyle.colorAccent : theme?.colors?.text} />
            )}
          </View>

          <View style={styles.ndaLoading}>
            {
              ndaSampleLoading ?
                (
                  <ActivityIndicator
                    color={theme?.name == 'Light' ? globalStyle.colorAccent : theme?.colors?.text}
                    style={{
                      marginTop: 'auto',
                      marginBottom: 'auto',
                      height: 540,
                    }}
                  />
                )
                :
                <View style={styles.lists}>
                  <FlatList
                    numColumns={2}
                    columnWrapperStyle={{ gap: 15 }}
                    ItemSeparatorComponent={<View style={{ margin: 7 }}></View>}
                    // columnWrapperStyle=
                    data={data}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={ItemView}
                    // ListHeaderComponent={renderHeader}
                    ListFooterComponent={renderFooter}

                    onEndReachedThreshold={0.2}
                    onEndReached={() => {
                      console.log('end reached ...');
                      if (pageInfo?.current_page != pageInfo?.last_page) {
                        setCurrentPage(currentPage + 1)
                      } else {
                        console.log('Limit data reached ...');
                      }
                    }}

                    refreshControl={
                      <RefreshControl
                        refreshing={isRefresh}
                        onRefresh={() => {
                          console.log('onRefresh')
                          setIsRefresh(true)
                          setCurrentPage(1)
                          getStateNdaSamples(selectedStateId, true)
                        }}
                      />
                    }
                  />
                </View>

              // <ScrollView // Category List
              //   horizontal={false}
              //   // style={styles.categoryListContainer}
              //   showsHorizontalScrollIndicator={true}>
              //   <View style={styles.lists}>
              //     {ndaList &&
              //       ndaList?.length > 0 &&
              //       ndaList.map((item, index) => {
              //         return (
              //           <TouchableOpacity
              //             onPress={() => {
              //               navi.navigate('choose_templates', {
              //                 id: item.id,
              //                 name: item.name,
              //                 link: item.link,
              //               });

              //               //navi.navigate('create_nda_acceptance');
              //             }}
              //             style={[
              //               Platform.OS === 'ios'
              //                 ? styles.shadowIos
              //                 : {
              //                   ...styles.shadowAndroid,
              //                   elevation: theme?.name == 'Light' ? 16 : 0
              //                 },
              //               {
              //                 ...styles.listItem,
              //                 backgroundColor: theme?.name == 'Light' ? 'white' : 'rgba(255, 255, 255, 0.15)'
              //               },
              //             ]}
              //             //style={styles.listItem}
              //             key={index + item.id}
              //           >
              //             {/* <View style={styles.listItem} key={index + item.id}> */}

              //             <View style={styles.textDiv}>
              //               {/* <Agreement /> */}
              //               {theme?.nda?.agreement}
              //               <View style={{ marginStart: 8 }}>
              //                 <Text
              //                   style={{ ...styles.title, color: theme?.name == 'Light' ? '#2E476E' : theme?.colors?.text }}
              //                 >
              //                   {item?.name}
              //                 </Text>
              //                 <Text style={{ ...styles.subTitle, color: theme?.name == 'Light' ? '#2E476E' : 'white' }}>
              //                   This template is used by 1098+ Users world wide.
              //                 </Text>
              //               </View>
              //             </View>

              //             {/* <View style={styles.iconDiv}> */}
              //             <TouchableOpacity
              //               color={'white'}
              //               style={theme?.name == 'Light' ? styles.iconDiv : { alignSelf: 'flex-end' }}
              //               onPress={() => {
              //                 navi.navigate('choose_templates', {
              //                   id: item.id,
              //                   name: item.name,
              //                   link: item.link,
              //                 });
              //               }}>
              //               {theme?.nda?.eye}
              //             </TouchableOpacity>

              //           </TouchableOpacity>
              //         );
              //       })}
              //   </View>
              // </ScrollView>
            }
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
    // paddingTop: insets.top,
    // paddingBottom: insets.bottom,
    // paddingLeft: insets.left,
    // paddingRight: insets.right,
    // backgroundColor: globalStyle.statusBarColor,
  },
  shadowAndroid: {
    // elevation: 16,
    borderRadius: 20,
    // backgroundColor: 'white',
    //Shadow For Android
  },
  shadowIos: {
    //Shadow for ios
    shadowOpacity: 0.6,
    shadowRadius: 6,
    //shadowColor: 'gray',
    shadowColor: '#9eb5c7',

    shadowOffset: {
      width: 5,
      height: 5,
    },
    borderRadius: 20,
  },
  ndaLoading: {
    marginVertical: 36,
    // height: 20,
  },
  selectDiv: {
    hight: 20,
  },
  select: {
    marginLeft: 16,
    marginRight: 16,
    height: 40,
  },
  title: {
    // color: '#2E476E',
    fontWeight: 500,
    fontSize: 14,
  },
  subTitle: {
    // color: '#2E476E',
    fontWeight: 400,
    fontSize: 12,
    marginRight: 18,
  },
  lists: {
    // height: Dimensions.get('window').height * 0.72,
    // height: Dimensions.get('window').height * 0.78,
    width: Dimensions.get('window').width * 0.93,
    paddingBottom: '45%',
    // paddingVertical: 30,
    // marginTop: 20,
    marginLeft: 'auto',
    marginRight: 'auto',

    // marginTop: 20,
    // paddingBottom: 40,
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    // paddingHorizontal: 15,
    // gap: 10,
  },
  textDiv: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  listItem: {
    borderRadius: 20,
    padding: 10,
    width: '48%',
    // width: 165,
    // backgroundColor: 'white',
  },
  iconDiv: {
    backgroundColor: '#3D50DF',
    height: 40,
    width: 40,
    borderRadius: 50,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',


    // flexDirection: 'row',
    // justifyContent: 'flex-end',
    // alignItems: 'center',
    // marginRight: 30,
    // marginBottom: 22,
  },
  icon: {
    height: 20,
    width: 20,
  },
});
