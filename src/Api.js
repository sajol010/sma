const LOCAL = 'http://192.168.0.118:8000'; ///'http://192.168.0.166:8000'; //'https://devapi.varanin.com';
const STAGING = 'https://sush-app.prolificlogic.com'; //'https://tour-app.prolificlogic.com'; //
const PROD = 'https://admin.shush.biz';
const BASE_URL =  PROD; // STAGING;// 'http://192.168.0.166:8000'; //'https://devapi.varanin.com';
const API_VERSION = '/api/v1/';
const URL = BASE_URL + API_VERSION;

const API_URLS = {
  URL: URL,
  IMAGE_URL: BASE_URL,
  FILE_URL: BASE_URL,
  LOGIN: URL + 'login',
  LOGOUT: URL + 'logout',
  DELETE_ACCOUNT: URL + 'account-deletion',
  SOCIAL_LOGIN: URL + 'social-login',
  REGISTER: URL + 'register',
  SENT_REQUEST_FOR_OTP: URL + 'register-send-otp',
  PROFILE_: 'my-profile',
  PROFILE: URL + 'my-profile',
  UPDATE_PROFILE: URL + 'update-profile',
  CREATE_EVENT: URL + 'my-events',
  MY_CREATED_EVENT: URL + 'my-events',
  MY_JOINED_EVENT: URL + 'my-joined-events',
  JOIN_IN_A_EVENT: URL + 'my-events/join',
  COUNTRY_LIST: URL + 'country-list',
  STATE_LIST: URL + 'states', //'state-list', //states
  ADDRESS_AUTO_SUGG_: 'address-auto-completion-with-post-grid',
  ADDRESS_AUTO_SUGG: URL + 'address-auto-completion-with-post-grid',
  VERIFY_ADDRESS_: 'address-verify-with-post-grid',
  VERIFY_ADDRESS: URL + 'address-verify-with-post-grid',
  NDA_SAMPLE_LIST: URL + 'nda-samples',
  NDA_SAMPLE_LIST_: 'nda-samples',
  NDA_LIST: URL + 'nda',
  PROFILE_UPDATE_: 'my-profile-update',
  PROFILE_UPDATE: URL + 'my-profile-update',
  PRICING_PLAN: URL + 'pricing-plans',
  GET_SETTING: URL + 'setting',
  SAVE_SETTING: URL + 'setting-update',
  RESET_PASS: URL + 'reset-password',
  GET_OTP: URL + 'forgot-password-code-send',
  FORGOT_PASS: URL + 'forgot-password',
  USER_SEARCH: URL + 'user',
  ARCHIVE_LIST: URL + 'nda-archived-list',
  NDA_CREATE: URL + 'nda',
  NDA_SIGNED: URL + 'nda-update-after-signed',
  NDA_ARCHIVE: URL + 'nda-archived-status',
  NOTIFICATION: URL + 'notifications',
  NOTIFICATION_READ: URL + 'notification-read',
  NDA_CANCEL: URL + 'nda-canceled-status',
  UPDATE_DEVICE_TOKEN_: 'device-token-update',
  UPDATE_DEVICE_TOKEN: URL + 'device-token-update',
  SUBSCRIPTION: URL + 'subscription',
  REDEEM: URL + 'redeem',
  MY_SUBSCRIPTION: URL + 'my-subscription',
  FORGOT_PASS_VERIFY_OTP: URL+'forgot-password-verify-otp',
  TERM_AND_CONDITION: 'https://app.termly.io/document/terms-of-service/6d062e8d-77a7-4eff-8cb5-ea4ab6223aa9', // 'https://shushprivacyapp.com/terms-conditions/',  //'https://sush-app.prolificlogic.com/api/v1/terms-and-conditions',
};

module.exports = API_URLS;

