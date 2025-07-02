import { useIsFocused } from '@react-navigation/native'
import { React, useEffect, useState } from 'react'
import {
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View,
  useWindowDimensions
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

//Component
import NotificationListItem from '../components/global/NotificationListItemComponent.js'
//Class
import Token from '../class/TokenManager.js'
import Utils from '../class/Utils.js'
//Styles
import globalStyle from '../../styles/MainStyle.js'
//SVG
//UTils
import { useTheme } from '../../styles/ThemeProvider'
import Url from '../Api.js'
import AsyncStorageManager from '../class/AsyncStorageManager.js'
import ModalPopupConfirmation from '../components/global/ModalPopupConfirmation.js'
import ModalPoup from '../components/global/ModalPoupComponent.js'
import NoData from '../components/global/NoData.js'
import CONSTANTS from '../Constants.js'
import LogoHeader from '../components/global/LogoHeader.js'

export default function Inbox() {
  const { dark, theme, bg } = useTheme()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageInfo, setPageInfo] = useState(null)
  const [isRefresh, setIsRefresh] = useState(false)
  const [loadMore, setLoadMore] = useState(false)

  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState([])
  const [isDataEmpty, setDataListEmpty] = useState(false)
  const [token, setToken] = useState([])
  const [eventLoading, setEventLoading] = useState(true)
  const [offset, setOffset] = useState(1)
  const isFocused = useIsFocused()


  const insets = useSafeAreaInsets()
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [btnLoad, setBtnLoad] = useState(false)
  const [reFetchId, setRefetchId] = useState(null)
  // const [reFetch, setRefetch] = useState(false);
  const [visible, setVisible] = useState(false)
  const [userToken, setUserToken] = useState(null)
  const [userId, setUserId] = useState(null)

  const [modalShow, setModalShow] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [modalMsg, setModalMsg] = useState('')
  const [dateFormat, setDateFormat] = useState('dd/mm/yyyy')
  const [timeFormat, setTimeFormat] = useState('12-hour')

  const { height, width, scale, fontScale } = useWindowDimensions();

  useEffect(() => {
    const asyncFunc = async () => {
      let userToken = await Token.getToken()

      let user_id = await AsyncStorageManager.getData(CONSTANTS.USER_ID /*'user_id'*/)
      setUserId(user_id)

      var dateFormat = await AsyncStorageManager.getData(CONSTANTS.DATE_FORMAT /*'date_format'*/)
      setDateFormat(dateFormat)
      var timeFormat = await AsyncStorageManager.getData(CONSTANTS.TIME_FORMAT /*'time_format'*/)
      setTimeFormat(timeFormat)

      if (userToken) {
        setUserId(user_id)
        setUserToken(userToken)
        getData(userToken)
      } else {
        console.log('Token not found')
        return false
      }
    }
    asyncFunc()
  }, [])
  // }, [reFetch]);

  useEffect(() => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id == reFetchId) {
        let index = data.indexOf(data[i])
        console.log('index==>', index)
        data.splice(index, 1)
        return
      }
    }
  }, [reFetchId])

  useEffect(() => {
    if (userToken && !isRefresh) {
      getData(userToken)
    }
  }, [currentPage])

  const getData = async (token, refresh = false) => {
    console.log('fetching data...')
    // setIsLoading(true);

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      return
    }

    var api =
      Url.NOTIFICATION + `?page=${refresh ? 1 : currentPage}&paginate=15`
    console.log('api==>', api)
    await fetch(api, {
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
          var a = JSON.stringify(responseJson)
          var json = JSON.parse(a)
          if (responseJson.status === 200) {
            // var data = json.data;
            // setIsLoading(false);
            // setData(data?.data);

            var apiData = json.data
            var apiDataArr = apiData?.data
            setPageInfo({
              total: apiData?.total,
              current_page: apiData?.current_page,
              last_page: apiData?.last_page,
            })

            console.log('isRefresh==>', refresh)

            const newData = refresh ? apiDataArr : data.concat(apiDataArr)
            setData(newData)

            setIsLoading(false)

            if (
              apiData?.last_page > 1 &&
              apiData?.current_page != apiData?.last_page
            ) {
              setLoadMore(true)
            } else {
              setLoadMore(false)
            }

            setIsRefresh(false)
            // setData(data?.data);

            console.log('apiData?.current_page', apiData?.current_page)
            console.log('apiData?.last_page', apiData?.last_page)
            console.log('Status ==> ok')
          } else {
            console.log('error: ' + JSON.stringify(json))
            setIsLoading(false)
            setLoadMore(false)
            setIsRefresh(false)
          }
        } catch (error) {
          console.warn(error)
          console.log(error)
          setIsLoading(false)
          setLoadMore(false)
          setIsRefresh(false)
        }
      })
      .catch(error => {
        console.warn(error)
        setIsLoading(false)
        setLoadMore(false)
        setIsRefresh(false)

        Utils.netConnectionFaild();

      })
  }

  const ItemView = ({ item }) => {
    return (
      // Flat List Item
      <NotificationListItem
        setRefetchId={setRefetchId}
        dateFormat={dateFormat}
        timeFormat={timeFormat}
        item={item}
        userId={userId}
        theme={theme}
      />
    )
  }

  const renderFooter = () => {
    return (
      //Footer View with Load More button
      <>
        {loadMore && (
          <ActivityIndicator
            color={
              theme?.name != 'Light'
                ? theme?.colors?.text
                : globalStyle.colorAccent
            }
          />
        )}
      </>
    )
  }


  const handleDeleteAll = async () => {
    setBtnLoad(true)


    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setBtnLoad(false)
      return
    }
    // return
    var api = Url.NOTIFICATION + '/delete-all'
    await fetch(api, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        try {
          var a = JSON.stringify(responseJson)
          var json = JSON.parse(a)
          if (responseJson.status === 200 || responseJson.status === 202) {
            var data = json.data
            // getData(userToken);
            setData([])
            setBtnLoad(false)
            setVisible(false)

            // console.log("data==>", data?.data);

            setIsSuccess(true)
            setModalShow(true)
            setModalMsg(json.message)

            // Alert.alert('Success', `${json.message}`, [
            //   { text: 'OK', onPress: () => { } },
            // ]);

            console.log('Status ==> ok')
          } else {
            const data = JSON.stringify(json)
            var json = JSON.parse(data)
            // console.log('error===>>>' + json);

            setIsSuccess(false)
            setModalShow(true)
            setModalMsg(json.message)

            // Alert.alert('Error', `${json.message}`, [
            //   { text: 'OK', onPress: () => { } },
            // ]);

            setBtnLoad(false)
          }
        } catch (error) {
          console.warn(error)
          console.log(error)
          setBtnLoad(false)
        }
      })
      .catch(error => {
        console.warn(error)
        setBtnLoad(false)

        Utils.netConnectionFaild();
      })
  }

  // console.log("theme==>",theme)

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}>
        <LogoHeader extraStyles={{
          // backgroundColor: 'red',
        }} />
        <View style={styles.top}>
          <View style={styles.page}>
            <View style={{ alignSelf: 'center', marginStart: -30 }}>
            </View>

            <ModalPopupConfirmation
              visible={visible}
              title={'Delete All'}
              msg={'Are you sure you want to delete all ?'}
              okText={'Delete'}
              cancelText={'Cancel'}
              isLoading={btnLoad}
              onPressOk={handleDeleteAll}
              theme={theme}
              onPressClose={() => {
                setVisible(false)
              }}
            />

            <ModalPoup
              theme={theme}
              visible={modalShow}
              title={modalMsg}
              source={
                isSuccess
                  ? require('../../assets/done.json')
                  : require('../../assets/sign_in_animation.json')
              }
              btnTxt={'Ok'}
              onPressOk={() => setModalShow(false)}
              onPressClose={() => setModalShow(false)}
            />

            {isLoading? (
              <View style={{
               // marginTop: '50%', 
                height: height * 0.6,
                width: width,
                // backgroundColor: 'violet',
                justifyContent: 'center',
              }}>

                <ActivityIndicator
                  color={
                    theme?.name != 'Light'
                      ? theme?.colors?.text
                      : globalStyle.colorAccent
                  }
                />
              </View>
            ) : (
              <>
                {data && data?.length < 1 ? (
                  <View style={{
                    height: height * 0.6,
                    width: width,
                    // backgroundColor: 'violet',
                    justifyContent: 'center',
                  }}>
                    {/* <NoData /> */}
                    <Text style={{
                      color: theme?.colors?.textContrast,
                      textAlign: 'center',
                      fontSize: 17,   
                    }}>No Data Available</Text>
                  </View>
                ) : (
                  <View
                    style={{
                      // height: Dimensions.get('window').height * 0.83,
                      paddingBottom: '20%', //'82%', //'63%',
                    }}>
                    {/* <Text style={{ ...styles.title, color: theme?.colors?.text }}>Notifications</Text> */}

                    <FlatList
                      data={data}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={ItemView}
                      // ListHeaderComponent={renderHeader}
                      ListFooterComponent={renderFooter}
                      onEndReachedThreshold={0.2}
                      onEndReached={() => {
                        console.log('end reached ...')
                        if (pageInfo?.current_page != pageInfo?.last_page) {
                          setCurrentPage(currentPage + 1)
                        } else {
                          console.log('Limit data reached ...')
                        }
                      }}
                      refreshControl={
                        <RefreshControl
                          refreshing={isRefresh}
                          onRefresh={() => {
                            console.log('onRefresh')
                            setIsRefresh(true)
                            setCurrentPage(1)
                            getData(userToken, true)
                          }}
                        />
                      }
                      contentContainerStyle={{
                        paddingBottom: height * .2,
                        //backgroundColor: 'red'
                      }}
                    />
                  </View>

                  // <ScrollView
                  //   horizontal={false}
                  //   showsHorizontalScrollIndicator={false}
                  //   contentContainerStyle={styles.list}
                  //   >
                  //   {data &&
                  //     data?.length > 0 &&
                  //     data.map((item, index) => {
                  //       return (
                  //         <NotificationListItem
                  //           setRefetch={data => setRefetch(data)}
                  //           key={index}
                  //           item={item}
                  //           theme={theme}
                  //         />
                  //       );
                  //     })}
                  // </ScrollView>
                )}
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    // justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },
  list: {
    flexDirection: 'column',
    paddingBottom: '100%', // TODO need to remove this
  },
  title: {
    fontSize: 24,
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: 40,
  },
  safeArea: {
    flex: 1,
    //paddingTop: globalStyle.topPadding,
    // backgroundColor: globalStyle.statusBarColor,
  },
  top: { paddingBottom: 0, marginBottom: 0 },
  page: {
    marginBottom: 0,
    paddingBottom: 0,
    // backgroundColor: globalStyle.backgroundColor,
  },
  container: {
    paddingTop: 4,
    paddingLeft: 4,
    paddingEnd: 4,
    paddingBottom: 0,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    top: 10,
    padding: 10,
    borderRadius: 100,
  },
  catTitle: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    flex: 1,
    paddingLeft: 24, // add left padding here
  },
  textButtonContainer: {
    marginTop: 4,
    marginEnd: 8,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 8,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadMoreBtn: {
    padding: 8,
    borderRadius: 32,
    borderWidth: 0.5,
    borderColor: globalStyle.colorAccent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'gray',
    fontSize: 15,
    textAlign: 'center',
  },
  noItem: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
