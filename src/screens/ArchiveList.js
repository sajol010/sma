import { useNavigation } from '@react-navigation/native';
import { React, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, ImageBackground, FlatList, Dimensions, RefreshControl, Platform, Alert } from 'react-native';
//Image Resource

//Assets
import NdaSmall from '../../assets/ndaSmall.svg';

//Variables
//Class
//Component
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
    SafeAreaView
} from 'react-native-safe-area-context';
import globalStyle from '../../styles/MainStyle.js';
import Url from '../Api.js';
import AsyncStorageManager from '../class/AsyncStorageManager';
import Token from '../class/TokenManager';
import Utils from '../class/Utils';
import DocumentListHeader from '../components/global/DocumentListHeaderComponent';
import DocumentTabItem from '../components/global/DocumentTabItemComponent.js';
import NoData from '../components/global/NoData';
import StepsComponent from '../components/global/StepsComponent';
import { useTheme } from '../../styles/ThemeProvider';
import ModalPopupConfirmation from '../components/global/ModalPopupConfirmation';
import ModalPoup from '../components/global/ModalPoupComponent';
import CONSTANTS from '../Constants';

export default function ArchiveList(navigation) {
    const { theme } = useTheme();
    const tabBarHeight = useBottomTabBarHeight();
    const navi = useNavigation();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageInfo, setPageInfo] = useState(null);
    const [isRefresh, setIsRefresh] = useState(false);
    const [loadMore, setLoadMore] = useState(false);
    const [userToken, setUserToken] = useState(null);

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tabSelected, setTabSelected] = useState(0);
    const [dateFormat, setDateFormat] = useState('dd/mm/yyyy');
    const [timeFormat, setTimeFormat] = useState('12-hour');

    const [visible, setVisible] = useState(false);
    const [btnLoad, setBtnLoad] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [reFetchId, setReFetchId] = useState(null);

    const [modalShow, setModalShow] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [modalMsg, setModalMsg] = useState('');

    const handlePress = () => {
        navi.goBack();
    };

    useEffect(() => {
        const asyncFunc = async () => {
            var dateFormat = await AsyncStorageManager.getData(CONSTANTS.DATE_FORMAT /*'date_format'*/);
            setDateFormat(dateFormat);
            var timeFormat = await AsyncStorageManager.getData(CONSTANTS.TIME_FORMAT /*'time_format'*/);
            setTimeFormat(timeFormat);

            let userToken = await Token.getToken();
            if (userToken) {
                setUserToken(userToken);
                getData(userToken);
            } else {
                console.log('Token not found');
                return false;
            }
        };
        asyncFunc();
    }, []);

    useEffect(() => {
        if (userToken && !isRefresh) {
            getData(userToken);
        }
    }, [tabSelected, currentPage])

    const getData = async (token, refresh = false) => {
        console.log("fetching data...");
        // setIsLoading(true);
        var api = tabSelected == 0 ? Url.ARCHIVE_LIST + `?type=sent&page=${refresh ? 1 : currentPage}&paginate=10`
            : Url.ARCHIVE_LIST + `?type=received&page=${refresh ? 1 : currentPage}&paginate=10`;
        console.log("api==>", api);
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
                    var a = JSON.stringify(responseJson);
                    var json = JSON.parse(a);
                    if (responseJson.status === 200) {
                        // var data = json.data;
                        // setIsLoading(false);
                        // setData(data);
                        // console.log("first", data);

                        var apiData = json.data;
                        var apiDataArr = apiData?.data;
                        setPageInfo({
                            total: apiData?.total,
                            current_page: apiData?.current_page,
                            last_page: apiData?.last_page,
                        })

                        console.log("isRefresh==>", refresh);

                        const newData = refresh ? apiDataArr : data.concat(apiDataArr);
                        setData(newData);

                        setIsLoading(false);

                        if (apiData?.last_page > 1 && apiData?.current_page != apiData?.last_page) {
                            setLoadMore(true);
                        } else {
                            setLoadMore(false);
                        }

                        setIsRefresh(false);
                        // setData(data?.data);

                        console.log('apiData?.current_page', apiData?.current_page);
                        console.log('apiData?.last_page', apiData?.last_page);
                        console.log("Status ==> ok");
                    } else {
                        console.log('State list error: ' + JSON.stringify(json));
                        setIsLoading(false);
                        setLoadMore(false);
                        setIsRefresh(false);
                    }
                } catch (error) {
                    console.warn(error);
                    console.log(error);
                    setIsLoading(false);
                    setLoadMore(false);
                    setIsRefresh(false);
                }
            })
            .catch(error => {
                console.warn(error);
                setIsLoading(false);
                setLoadMore(false);
                setIsRefresh(false);
            });
    };

    useEffect(() => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].id == reFetchId) {
                let index = data.indexOf(data[i])
                console.log('index==>', index);
                data.splice(index, 1)
                return
            }
        }
    }, [reFetchId]);


    const handleDelete = async () => {
        setBtnLoad(true);

        var api = Url.NDA_CREATE + '/' + selectedId;
        await fetch(api, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
            },
        })
            .then(response => response.json())
            .then(responseJson => {
                try {
                    var a = JSON.stringify(responseJson);
                    var json = JSON.parse(a);
                    if (responseJson.status === 200 || responseJson.status === 202) {
                        var data = json.data;

                        setReFetchId(selectedId)
                        setVisible(false);

                        console.log("data==>", data);

                        setIsSuccess(true)
                        setModalShow(true)
                        setModalMsg(json.message)

                        // Alert.alert('Success', `${json.message}`, [
                        //     { text: 'OK', onPress: () => { } },
                        // ]);

                        console.log('Status ==> ok');
                    } else {
                        const data = JSON.stringify(json);
                        var json = JSON.parse(data);
                        // console.log('error===>>>' + json);

                        setIsSuccess(false)
                        setModalShow(true)
                        setModalMsg(json.message)

                        // Alert.alert('Error', `${json.message}`, [
                        //     { text: 'OK', onPress: () => { } },
                        // ]);
                    }
                    setBtnLoad(false);
                } catch (error) {
                    console.warn(error);
                    setBtnLoad(false);
                }
            })
            .catch(error => {
                console.warn(error);
                setBtnLoad(false);
            });
    };

    const ItemView = ({ item }) => {
        return (
            // Flat List Item
            <TouchableOpacity
                onLongPress={() => {
                    setVisible(true)
                    setSelectedId(item?.id)
                }}
                style={Platform.OS === 'ios' ? styles.shadowIos : { ...styles.shadowAndroid, elevation: theme?.name == 'Light' ? 15 : 0 }}
                onPress={() => {
                    // navi.navigate('document_status_account', {
                    //     initial: false,
                    //     id: item.id,
                    //     name: item.nda_name,
                    // },);
                    //need to go SignAndSend

                }}
            >
                <View
                    style={{
                        ...styles.report,
                        shadowOpacity: theme?.name == 'Light' ? 1 : 0,
                        shadowRadius: theme?.name == 'Light' ? 15 : 0,
                        elevation: theme?.name == 'Light' ? 15 : 0,
                        backgroundColor: theme?.name == 'Light' ? "white" : "rgba(255, 255, 255, 0.12)",
                    }
                    }
                >
                    <View style={styles.ndaDiv}>
                        <View>
                            <NdaSmall />
                        </View>
                        <View style={{ margin: 10 }}>
                            <Text
                                style={{ ...styles.title, color: theme?.name == 'Light' ? '#2e476e' : 'white' }}
                            >
                                {item?.nda_name}
                            </Text>
                            <Text
                                style={{ ...styles.createdAt, color: theme?.name == 'Light' ? '#2e476e' : 'white' }}
                            >
                                Created at : {Utils.getDateFormat(item?.created_at, dateFormat, timeFormat)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.partyList}>
                        <StepsComponent
                            active={
                                item.status == 'invited' ? 1
                                    : item.status == 'pending' ? 2
                                        : item.status == 'completed' ? 3
                                            : item.status == 'signed' ? 3
                                                : 0
                            }
                            steps={['Invited', 'Pending', 'Completed']}
                            textFont={8}
                            theme={theme}
                        />
                    </View>
                </View>
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

    const renderHeader = () => {
        return (
            <View style={styles.tab}>
                <DocumentTabItem
                    onPress={v => {
                        setIsLoading(true);
                        setCurrentPage(1);
                        setData([]);
                        setTabSelected(0)
                    }}
                    title={'Sent'}
                    isSelected={tabSelected == 0 ? true : false}
                    theme={theme}
                />
                <DocumentTabItem
                    onPress={v => {
                        setIsLoading(true);
                        setCurrentPage(1);
                        setData([]);
                        setTabSelected(1)
                    }}
                    title={'Received'}
                    isSelected={tabSelected == 1 ? true : false}
                    theme={theme}
                />
            </View>
        );
    };


    return (
        <ImageBackground
            source={theme?.bg?.bgImg}
            resizeMode="cover"
            style={styles.bgImage}
        >

            <SafeAreaView
                style={[
                    styles.container,
                    {
                        paddingBottom: tabBarHeight + 100,
                    },
                ]}>

                <DocumentListHeader
                    title={'Archive'}
                    onPress={handlePress}

                    backIcon={theme?.header?.backIcon}
                    statusBarColor={theme?.colors?.statusBarColor}
                    dark={theme?.name == 'Light'}
                    color={theme?.colors?.text}
                />

                {/* <ThemeSelectorForTest /> */}

                {
                    isLoading ?
                        <ActivityIndicator
                            color={theme?.name != 'Light' ? theme?.colors?.text : globalStyle.colorAccent}
                            style={{
                                marginTop: 'auto',
                                marginBottom: 'auto',
                                height: 540,
                            }}
                        />
                        :
                        <View>
                            {renderHeader()}

                            {
                                data && data?.length < 1 ?
                                    <NoData />
                                    :
                                    <View
                                        style={{
                                            // height: Dimensions.get('window').height * 0.725,
                                            paddingBottom: '45%',
                                        }}
                                    >
                                        <FlatList
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
                                                        getData(userToken, true)
                                                    }}
                                                />
                                            }
                                        />

                                        <ModalPopupConfirmation
                                            visible={visible}
                                            title={'Delete NDA'}
                                            msg={'Are you sure you want to delete this NDA?'}
                                            okText={'Delete'}
                                            cancelText={'Cancel'}
                                            isLoading={btnLoad}
                                            onPressOk={handleDelete}
                                            theme={theme}
                                            onPressClose={() => {
                                                setVisible(false);
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
                                    </View>
                            }
                        </View>
                }

            </SafeAreaView >
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bgImage: {
        flex: 1,
        // justifyContent: 'center',
    },
    container: {
        // backgroundColor: "red",
        marginBottom: 80,
    },
    tab: {
        // flex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 10,
        // paddingLeft: 10,
        // paddingRight: 10,
    },
    createdAt: {
        fontSize: 10,
        lineHeight: 25,
        fontWeight: "300",
        // color: "#2e476e",
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
    partyList: {
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        flex: 1,
        gap: 10,
        marginTop: 25,
        paddingHorizontal: 50,
    },

    shadowAndroid: {
        // elevation: 16,
        // borderRadius: 20,
        //Shadow For Android
    },
    shadowIos: {
        //Shadow for ios
        shadowOpacity: 1,
        shadowRadius: 6,
        shadowColor: '#9eb5c7',

        shadowOffset: {
            width: 10,
            height: 10,
        },
    },

    report: {
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 15,
        borderRadius: 20,
        // backgroundColor: "#fff",
        shadowColor: "#9eb5c7",
        // shadowColor: "#2E476E",
        // shadowRadius: 20,
        // elevation: 15,
        // shadowOpacity: 1,
        // flex: 1,
        // width: "100%",
        // height: 205
    },

    title: {
        fontSize: 15,
        fontWeight: "600",
        // color: "#2e476e",
    },

});
