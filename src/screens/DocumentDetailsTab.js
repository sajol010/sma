import { Box, Center, NativeBaseProvider } from 'native-base';
import { React, useState } from 'react';
import { SceneMap, TabView } from 'react-native-tab-view';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

//Component
import DocDetailsHistory from './DocDetailsHistory.js';
import DocDetailsSignerStatus from './DocDetailsSignerStatus.js';


export default function DocumentDetailsTab({ data, setRefetch, theme }) {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      {/* <ScrollView> */}
      <View style={{ ...styles.tabTitles, borderColor: theme?.name == 'Light' ? '#3D50DF' : theme?.colors?.text }}>
        <TouchableOpacity onPress={() => { setSelectedTab(0) }}
          style={{
            borderBottomWidth: selectedTab == 0 ? 5 : null,
            borderColor: selectedTab == 0 ? theme?.name == 'Light' ? '#3D50DF' : theme?.colors?.text : null,
            width: '60%',
            // borderBottomLeftRadius: 10,
            // borderBottomRightRadius: 10,
          }}
        >
          <Text
            style={{
              ...styles.title,
              color:
                selectedTab == 0 ?
                  theme?.name == 'Light' ? '#3D50DF' : theme?.colors?.text
                  : theme?.colors?.text,
            }}
          >Signer Status</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setSelectedTab(1) }}
          style={{
            borderBottomWidth: selectedTab == 1 ? 5 : null,
            borderColor: selectedTab == 1 ? theme?.name == 'Light' ? '#3D50DF' : theme?.colors?.text : null,
            width: '60%',
            // borderBottomLeftRadius: 10,
            // borderBottomRightRadius: 10,
          }}
        >
          <Text
            style={{
              ...styles.title,
              // color: selectedTab == 1 ? '#3D50DF' : 'black',
              color:
                selectedTab == 1 ?
                  theme?.name == 'Light' ? '#3D50DF' : theme?.colors?.text
                  : theme?.colors?.text,
            }}
          >History</Text>
        </TouchableOpacity>
      </View>

      {
        selectedTab == 0 ?
          <DocDetailsSignerStatus data={data} setRefetch={setRefetch} theme={theme}></DocDetailsSignerStatus>
          :
          <DocDetailsHistory data={data} setRefetch={setRefetch} theme={theme}></DocDetailsHistory>
      }
      {/* </ScrollView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: globalStyle.statusBarColor,
  },
  tabTitles: {
    flexDirection: 'row',
    justifyContent: 'center',
    // justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 60,
    marginHorizontal: 20,
    borderBottomWidth: 0.4,
  },
  title: {
    fontSize: 16,
    paddingBottom: 7,
    textAlign: 'center',
  },
});