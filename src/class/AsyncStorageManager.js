import AsyncStorage from '@react-native-async-storage/async-storage';
import CONSTANTS from '../Constants';
class AsyncStorageManager {
  constructor() {
    // Initialize the utility with any necessary configuration or state
    this.someValue = 42;
  }

  static storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
      console.log(key + ' saved successfully to async storage');
      // console.log('key: ' + key + ', value: ' + value + ' saved successfully ');
    } catch (error) {
      console.warn('Error saving value, Error:==>', error);
      // console.warn('Error saving value, key:', key, value, error);
    }
  };

  //Token get
  static getData = async key => {
    try {
      const token = await AsyncStorage.getItem(key);
      if (token !== null) {
        // Token is retrieved successfully
        console.log('Async data retrieved successful');
        // console.log('Async data retrieved:', token);
        return token;
      } else {
        // Token does not exist in storage
        console.log('Async data does not exist in storage.');
        return null;
      }
    } catch (error) {
      console.warn('Async data Error retrieving :', error);
      return null;
    }
  };

  static removeItemValue = async key => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (exception) {
      return false;
    }
  };

  //Settings
  // IS_BIO_REQUIRED: 'is_bio_required',
  // IS_BIO_EANBLED: 'is_bio_login_enabled',
  // USER_TOKEN: 'user_token',

  //SignIn

  static removeAllItemValue = async () => {
    console.log('Async remove:  ');
    try {
      const keys = [
        CONSTANTS.PROFILE_STATUS,
        CONSTANTS.USER_EMAIL,
        CONSTANTS.SIGN_IN_METHOD,
        CONSTANTS.SETTING,
        CONSTANTS.DATE_FORMAT,
        // CONSTANTS.LOGIN_METHOD,
        // CONSTANTS.LOGIN_PASS,
        CONSTANTS.TIME_FORMAT,
        
        CONSTANTS.CURRENT_THEME_NAME,
        CONSTANTS.CURRENT_THEME,

        CONSTANTS.UNREAD_COUNT,
        CONSTANTS.IS_DEVICE_TOKEN_UPLOAD,

        //Profile
        CONSTANTS.PROFILE.NAME,
        CONSTANTS.PROFILE.EMAIL,
        CONSTANTS.PROFILE.PHONE,

        CONSTANTS.PROFILE.SEARCH_ADDRESS,
        CONSTANTS.PROFILE.FORMATED_ADDRESS,
        CONSTANTS.PROFILE.AVATER,

        CONSTANTS.PROFILE.CITY,
        CONSTANTS.PROFILE.STATE_ID,
        CONSTANTS.PROFILE.POSTAL_CODE,
        CONSTANTS.PROFILE.COUNTRY_CODE,
      ];
      await AsyncStorage.multiRemove(keys, err => {
        console.log('Async remove all:  ' + keys);
      });
      return true;
    } catch (exception) {
      return false;
    }
  };


  static removeAcountDeleteValues = async () => {
    console.log('Async remove:  ');
    try {
      const keys = [
        CONSTANTS.PROFILE_STATUS,
        CONSTANTS.USER_EMAIL,
        CONSTANTS.SIGN_IN_METHOD,
        CONSTANTS.SETTING,
        CONSTANTS.DATE_FORMAT,

        CONSTANTS.USER_ID,
        CONSTANTS.IS_BIO_EANBLED,
        CONSTANTS.USER_TOKEN,
        CONSTANTS.BIO_ENABLED_EMAIL,

        //Remember Password
        CONSTANTS.LOGIN_METHOD,
        CONSTANTS.LOGIN_PASS,

        CONSTANTS.TIME_FORMAT,
        CONSTANTS.CURRENT_THEME_NAME,
        CONSTANTS.CURRENT_THEME,

        CONSTANTS.UNREAD_COUNT,
        CONSTANTS.IS_DEVICE_TOKEN_UPLOAD,

        //Profile

        CONSTANTS.PROFILE.NAME,
        CONSTANTS.PROFILE.EMAIL,
        CONSTANTS.PROFILE.PHONE,

        CONSTANTS.PROFILE.SEARCH_ADDRESS,
        CONSTANTS.PROFILE.FORMATED_ADDRESS,
        CONSTANTS.PROFILE.AVATER,

        CONSTANTS.PROFILE.CITY,
        CONSTANTS.PROFILE.STATE_ID,
        CONSTANTS.PROFILE.POSTAL_CODE,
        CONSTANTS.PROFILE.COUNTRY_CODE,
      ];
      await AsyncStorage.multiRemove(keys, err => {
        console.log('Async remove all:  ' + keys);
      });
      return true;
    } catch (exception) {
      return false;
    }
  };
}
export default AsyncStorageManager;
