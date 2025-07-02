import { useNavigation } from '@react-navigation/native';
import { React, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import globalStyle from '../../styles/MainStyle.js';
import Utils from '../class/Utils.js';
import AsyncStorageManager from '../class/AsyncStorageManager.js';
import CONSTANTS from '../Constants.js';
//SVG

export default function DocDetailsHistory({ navigation, data, setRefetch, theme }) {
    // console.log("data==>", data.activities)
    const [dateFormat, setDateFormat] = useState('dd/mm/yyyy');
    const [timeFormat, setTimeFormat] = useState('12-hour');

    useEffect(() => {
        const asyncFunc = async () => {
            var dateFormat = await AsyncStorageManager.getData(CONSTANTS.DATE_FORMAT /*'date_format'*/);
            setDateFormat(dateFormat);
            var timeFormat = await AsyncStorageManager.getData(CONSTANTS.TIME_FORMAT /*'time_format'*/);
            setTimeFormat(timeFormat);
        };
        asyncFunc();
    }, []);

    return (
        // <SafeAreaView style={styles.container}>
        <ScrollView>
            <View style={{ paddingVertical: 20, paddingTop: 5, marginBottom: 100 }}>
                {/*  Header */}
                <View style={styles.headerDiv}>
                    <Text
                        style={{ ...styles.header, color: theme?.name == 'Light' ? '#2E476E' : 'white' }}
                    >
                        Time</Text>
                    <Text
                        style={{ ...styles.header, color: theme?.name == 'Light' ? '#2E476E' : 'white' }}
                    >
                        Action</Text>
                    <Text
                        style={{ ...styles.header, color: theme?.name == 'Light' ? '#2E476E' : 'white' }}
                    >
                        User</Text>
                </View>

                {/* Rows */}
                {data?.activities && data?.activities?.length > 0 && data?.activities.map((item, index) => {
                    return <View View style={styles.row} key={index}>
                        <Text
                            style={{ ...styles.cell, color: theme?.name == 'Light' ? '#2E476E' : 'white' }}
                        >
                            {Utils.getDateFormat(item?.created_at, dateFormat, timeFormat)}</Text>
                        <Text
                            style={{ ...styles.cell, color: theme?.name == 'Light' ? '#2E476E' : 'white' }}
                        >
                            {item?.action}</Text>
                        <Text
                            style={{ ...styles.cell, color: theme?.name == 'Light' ? '#2E476E' : 'white' }}
                        >
                            ({data?.sender_id == item?.user_id ? "Sender" : "Receiver"})</Text>
                    </View>
                })
                }

            </View>
        </ScrollView>
        // </SafeAreaView > 
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: globalStyle.statusBarColor,
    },
    title: {
        color: '#2E476E',
        fontSize: 15,
        textAlign: 'center'
    },
    headerDiv: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // backgroundColor: "#fff",
    },
    header: {
        // color: '#2E476E',
        fontSize: 15,
        fontWeight: 300,
        lineHeight: 25,
        textTransform: 'capitalize',

        flex: 1,
        // padding: 7,
        paddingVertical: 7,
        // width: 200,
        // height: 200,
        textAlign: "center",
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        paddingHorizontal: 10
    },
    cell: {
        flex: 1,
        paddingVertical: 7,
        // borderWidth: 1,
        // width: 200,
        // height: 200,
        textAlign: "center",
        fontSize: 10,
        // color: "#2E476E",
        lineHeight: 25,
        // borderColor: "black",
    },
});
