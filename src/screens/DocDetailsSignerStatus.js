import { React, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import globalStyle from '../../styles/MainStyle.js';
//SVG
import CheckTik from '../../assets/checkTik.svg';
import UserFill from '../../assets/userFill.svg';
import Url from '../Api.js';
import { useNavigation } from '@react-navigation/native';
import ButtonComponentSmall from '../components/global/ButtonComponentSmall.js';
import GradientBackground from '../components/global/GradientBackground.js';
import ModalPopupConfirmation from '../components/global/ModalPopupConfirmation.js';
import ModalPoup from '../components/global/ModalPoupComponent.js';


export default function DocDetailsSignerStatus({ navigation, data, setRefetch, theme }) {
  const navi = useNavigation();

  console.log('data==>', data?.status);
  const [isLoading, setIsLoading] = useState(false);

  const [visible, setVisible] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);

  const [modalShow, setModalShow] = useState(false);

  const cancelNda = async () => {
    console.log('data?.id', data?.id);
    setIsLoading(true);
    setBtnLoad(true);
    var api = Url.NDA_CANCEL;
    await fetch(api, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data?.token}`,
      },
      body: JSON.stringify({
        id: data?.id,
      }),
    })
      .then(response => response.json())
      .then(responseJson => {
        try {
          var a = JSON.stringify(responseJson);
          var json = JSON.parse(a);
          if (responseJson.status === 200) {
            // var data = json.data;
            setRefetch(true);
            setIsLoading(false);
            setBtnLoad(false);
            // console.log("data==>", json);
            // Alert.alert('Success', json?.message);
            console.log('Status ==> ok');
          } else {
            console.log('Error: ' + JSON.stringify(json));
            // Alert.alert('Success', json?.message);
            setIsLoading(false);
            setBtnLoad(false);
            setModalShow(true);
          }
        } catch (error) {
          console.warn(error);
          console.log(error);
          setIsLoading(false);
          setBtnLoad(false);
        }
      })
      .catch(error => {
        console.warn(error);
        setIsLoading(false);
        setBtnLoad(false);
      });
  };

  return (
    // <SafeAreaView style={styles.container}>
    <ScrollView>
      <ModalPopupConfirmation
        visible={visible}
        title={'Cancel NDA'}
        msg={'Are you sure you want to cancel this NDA ?'}
        okText={'Ok'}
        cancelText={'Close'}
        isLoading={btnLoad}
        onPressOk={cancelNda}
        theme={theme}
        onPressClose={() => {
          setVisible(false);
        }}
      />

      <ModalPoup
        theme={theme}
        visible={modalShow}
        title={'NDA cancellation failed'}
        source={ require('../../assets/sign_in_animation.json')}
        btnTxt={'Ok'}
        onPressOk={() => setModalShow(false)}
        onPressClose={() => setModalShow(false)}
      />

      <View style={{ padding: 24, marginBottom: '30%' }}>
        <Text style={{ ...styles.title, color: theme?.name == 'Light' ? '#2E476E' : theme?.colors?.text }}>Receiver</Text>

        {/* Receiver info */}
        <View
          style={{ ...styles.receiver, marginRight: data?.status == 'pending' && data?.userId != data?.sender_id ? 10 : 0 }}
        >
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.iconDiv}>
              <UserFill style={styles.icon} />
            </View>
            <View style={{ marginStart: 10, width: '55%' }}>
              <Text
                style={{ ...styles.userName, color: theme?.name == 'Light' ? '#2E476E' : theme?.colors?.text }}
              >
                {data?.receiver_name}
              </Text>
              <Text
                style={{
                  ...styles.userEmail,
                  color: theme?.name == 'Light' ? '#2E476E' : 'white',
                }}
              >
                {data?.receiver_email}
              </Text>
            </View>
          </View>

          <View style={styles.statusDiv}>
            {/* Status */}
            {theme?.name != 'Light' ?
              <GradientBackground
                title={data?.status}
                color={theme?.name != 'Light' ? 'black' : 'white'}
                isLoading={false}
                colors={theme?.name != 'Light' ? theme?.colors?.statusGradient : null}
              />
              :
              <View
                style={
                  theme?.name == 'Light' ?
                    data?.status == 'completed'
                      ? styles.statusSuccess
                      : data?.status == 'canceled'
                        ? styles.statusCancel
                        : styles.statusPending
                    : { ...styles.statusSuccess, backgroundColor: theme?.colors?.text }
                }>
                <Text style={{ ...styles.status, color: theme?.name == 'Light' ? 'white' : 'black' }}>{data?.status}</Text>
              </View>
            }

            {/* Action */}
            {(data?.status == 'pending' || data?.status == 'draft') && (
              <>
                {
                  isLoading ?
                    <ActivityIndicator color={'white'}
                      style={
                        data?.status == 'pending' && data?.userId != data?.sender_id ? styles.statusNormal
                          : data?.userId == data?.sender_id && data?.status == 'pending' ? styles.statusCancel
                            : styles.statusPending
                      }
                    />
                    :
                    <View style={styles.buttonContainer}>
                      <ButtonComponentSmall
                        title={
                          data?.status == 'pending' && data?.userId != data?.sender_id ? 'Sign & Send'
                            : data?.userId == data?.sender_id && data?.status == 'pending' ? 'Cancel'
                              : data?.status == 'draft' ? 'Edit'
                                : ''
                        }
                        color={theme?.colors?.btnText}
                        colors={theme?.colors?.colors}
                        bordered={true}
                        borderWidth={theme?.name == 'Light' ? 0 : 3}
                        borderColor={theme?.colors?.borderColor}
                        borderColors={theme?.colors?.borderColors}
                        shadow={theme?.name == 'Light'}

                        onPress={() => {
                          data?.userId == data?.sender_id && data?.status == 'pending' ? setVisible(true)
                            : data?.status == 'draft' ?
                              navi.navigate('choose_templates', {
                                id: data?.id,
                                name: data?.nda_name,
                                link: data?.file_url,
                                data: data,
                              },)
                              : navi.navigate('nda_pdf_preview', {
                                id: data?.id,
                                name: data?.nda_name,
                                link: data?.file_url,
                                data: data,
                              });
                        }}
                      />
                    </View>
                }
              </>
            )}
          </View>
        </View>

        {data?.status == 'completed' && (
          <View style={styles.completeDiv}>
            {/* <CheckTik /> */}
            {theme?.nda?.complete}
            <Text style={{ ...styles.complete, color: theme?.name == 'Light' ? '#2E476E' : theme?.colors?.text }}>Completed</Text>
          </View>
        )}
      </View>
    </ScrollView >
    // </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: 'center',
    alignContent: 'stretch',
  },
  container: {
    flex: 1,
    backgroundColor: globalStyle.statusBarColor,
  },
  statusDiv: {
    flexDirection: 'column',
    // gap: 10,
    rowGap: 10,
  },
  receiver: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconDiv: {
    backgroundColor: '#F0F0F0',
    height: 40,
    width: 40,
    borderRadius: 50,
  },
  icon: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  userName: {
    // color: '#2E476E',
    fontSize: 15,
    fontWeight: 400,
  },
  userEmail: {
    // color: '#2E476E',
    fontSize: 10,
    fontWeight: 300,
  },
  completeDiv: {
    marginTop: 50,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  complete: {
    // color: '#2E476E',
    fontSize: 24,
    fontWeight: 700,
  },
  statusSuccess: {
    backgroundColor: '#2BA24C',
    // minWidth: 95,
    paddingHorizontal: 10,
    borderRadius: 30,
    height: 35,
    fontSize: 12,
    lineHeight: 25,
  },
  statusPending: {
    backgroundColor: '#6e81a0',
    // minWidth: 95,
    paddingHorizontal: 10,
    borderRadius: 30,
    height: 35,
    fontSize: 12,
    lineHeight: 25,
  },
  statusCancel: {
    // backgroundColor: '#EB5757',
    // minWidth: 95,
    paddingHorizontal: 10,
    borderRadius: 30,
    height: 35,
    fontSize: 12,
    lineHeight: 25,
  },
  statusNormal: {
    backgroundColor: '#3D50DF',
    // minWidth: 95,
    paddingHorizontal: 10,
    borderRadius: 30,
    height: 35,
    fontSize: 12,
    lineHeight: 25,
  },
  status: {
    // color: 'white',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    textTransform: 'capitalize',
  },
  title: {
    // color: '#2E476E',
    fontSize: 15,
    fontWeight: 300,
    textTransform: 'uppercase',
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
});
