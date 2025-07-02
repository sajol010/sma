import { Alert } from 'react-native';
import prompt from 'react-native-prompt-android';
import Moment from 'moment';
import Toast from 'react-native-toast-message';
import { fetch, refresh } from '@react-native-community/netinfo';
import CONSTANTS from '../Constants';

class Utils {

  constructor() {
  
    // Initialize the utility with any necessary configuration or state
    this.someValue = 42;
    this.showOnce = false;
    this.showOnceNetworkState =  CONSTANTS.NET_CONNECTION_STATUS.NEVER_SHOW;

    this.prevBgTime = 0;

    this.isAutoLockPause = false;
    //this. = useNetInfo().isConnected;

  }

  static getNetworkStateShowOnce = async () => {
    return this.showOnceNetworkState === undefined ? CONSTANTS.NET_CONNECTION_STATUS.NEVER_SHOW : this.showOnceNetworkState;
  };

  static setNetworkStateShowOnce = value => {
    this.showOnceNetworkState = value;
  };


  static getProfileUpdateShowOnce = async () => {
    return this.showOnce === undefined ? false : this.showOnce;
  };


  static setProfileUpdateShowOnce = value => {
    this.showOnce = value;
  };

  static getPrevBgTime = async () => {
    return this.prevBgTime === undefined ? 0 : this.prevBgTime;
  };

  static setPrevBgTime = value => {
    this.prevBgTime = value;
  };

  static getAutoLockPause = async () => {
    return this.isAutoLockPause === undefined ? false : this.isAutoLockPause;
  };

  static setAutoLockPause = value => {
    this.isAutoLockPause = value;
  };



  static netConnectionFaild = () => {
    Toast.show({
      type: 'warning',
      text1: 'Offline',
      text2: 'Unable to connect. \nPlease check your internet connection',
      //visibilityTime: 120000,
    })
  }

  static isNetConnected = async () => {

    let isConnected = false;
    await refresh()
    await fetch().then(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      isConnected = state.isConnected;
      //return state.isConnected;
    });

    return isConnected;
  }


  static showToast = (type, title, body, receivedData) => {
    Toast.show({
      type: type,
      text1: title,
      text2: body,
      onPress: () => {
        console.log('Press notification');
        this.closeToast();
        try {
          const data = receivedData;
          //const senderId = data.sender_id;
          const ndaId = data.n_d_a_id;
          const ndaName = data.nda_name;
          console.log('Nda Name: ' + ndaName + 'NDA Id: ' + ndaId);
          //openNdaPage(ndaId, ndaName);
        } catch (e) {
          console.log('Quite to open app by notification error: ' + e);
        }
      },
    });
  };

  static closeToast = () => {
    Toast.hide();
  };

  static showDialogWithButton = (title, msg, onPressOk) =>
    Alert.alert(title, msg, [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'OK', onPress: onPressOk }, // () => console.log('OK Pressed')},
    ]);

  static showAlertDialog = (title, msg) => {
    Toast.show({
      type: 'warning',
      text1: title,
      text2: msg,
    })
  }

  static showInputTextDialog = (title, msg, onPressOk) => {
    prompt(
      title,
      msg,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: onPressOk, //password => console.log('OK Pressed, password: ' + password),
        },
      ],
      {
        type: 'plain-text',
        cancelable: true,
        defaultValue: '',
        placeholder: 'Enter otp',
      },
    );
  };

  // Define methods for your utility
  doSomething() {
    return 'I am doing something!';
  }

  doAnotherThing(parameter) {
    return `I am doing another thing with ${parameter}!`;
  }

  // You can also define static methods that don't require an instance
  static staticMethod() {
    return 'I am a static method!';
  }

  static getDateFormat(date, dateformat = 'dd/mm/yyyy', timeFormat = '12-hour') {

    var formattedDate = Moment(date).format(dateformat == 'mm/dd/yyyy' ? 'MM/DD/YYYY' : 'DD/MM/YYYY');
    var formattedTime = Moment(date).format(timeFormat == '24-hour' ? 'HH:mm' : 'hh:mm a');

    // console.log("formattedDate==>", formattedDate);
    // console.log("formattedTime==>", formattedTime);
    // console.log("date and time ==>", formattedDate + ' ' + formattedTime);

    // let currentDate = new Date(date);
    // let day = currentDate.getDate();
    // let month = currentDate.getMonth() + 1;
    // let year = currentDate.getFullYear();
    // let am_pm = currentDate.toLocaleTimeString();

    // let format_Date = dateformat == 'mm/dd/yyyy' ? month + '/' + day + '/' + year + ' ' + am_pm : day + '/' + month + '/' + year + ' ' + am_pm

    return formattedDate + ' ' + formattedTime;
    // return format_Date;
  }

  static getOnlyDate(date, dateformat = 'DD MMM YYYY') {
    var formattedDate = Moment(date).format(dateformat? dateformat : 'DD-MMM-YYYY');
    return formattedDate;
  }

  static getOnlyTime(date, timeFormat = '12-hour') {
    var formattedTime = Moment(date).format(timeFormat == '24-hour' ? 'HH:mm' : 'hh:mm a');
    return formattedTime;
  }
}

export default Utils;
