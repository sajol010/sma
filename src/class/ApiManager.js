import API_URLS from '../Api';
import Token from './TokenManager';
import CONSTANTS from '../Constants';

const fetchWithTimeout = async (resource, options = {}, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  //Net connection check
  // let isConected = await Utils.isNetConnected()
  // console.log("Is net connected: " + isConected);
  // if (!isConected) {
  //   Utils.netConnectionFaild();
  //   return
  // }
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });

  //console.log('Api response: '+ JSON.stringify(response))
  clearTimeout(id);
  return response;
};

export const request = async (endpoint, method, body = null, headers = null) => {

  console.log('ApiManager Network Request end: ' + endpoint)
  const url = `${API_URLS.URL}${endpoint}`;
  console.log('ApiManager Network Request url: ' + url)
  const token = await Token.getToken();
  console.log('ApiManager Token:  ' + token);

  if (!token) {
    throw new Error('Token is empty: ' + token);
  }

  console.log('Header: ' + JSON.stringify(headers))
  let options = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Bearer ${token} notice the Bearer before your token
    },
    body: body ? JSON.stringify(body) : null,
  };

  if (headers != null) {
    options = {
      method,
      headers: headers,
      body: body ? body : null,
    };
  }

  if (method === 'GET') {
    delete options.body; // GET requests don't have a body
  }

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetchWithTimeout(url, options);

      // if (response.status === 200) {
      //   resolve(JSON.parse(xhr.responseText)); // Resolve with parsed JSON data
      // } else {
      //   reject(new Error(`Failed to fetch data: ${xhr.statusText}`)); // Reject with error message
      // 

      if (response.ok) {
        const status = response.status;
        console.log('Status Code==' + status);

        const json = await response.json();

        switch (status) {
          case CONSTANTS.HTTP_STATUS_CODE.OK:
            resolve(json);
            break;

          case CONSTANTS.HTTP_STATUS_CODE.BAD_REQUEST |
            CONSTANTS.HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR |
            CONSTANTS.HTTP_STATUS_CODE.UNAUTHORIZED |
            CONSTANTS.HTTP_STATUS_CODE.NOT_FOUND |
            CONSTANTS.HTTP_STATUS_CODE.GATEWAY_TIMEOUT |
            CONSTANTS.HTTP_STATUS_CODE.FORBIDDEN:
            reject(new Error(json.message || 'API Error status: ' + status));
            break;

          default:
            console.log('Status Code' + status);
            reject(new Error(json.message || 'API Error' + status));
        }
      } else {
        console.log('Status Code-: ' + response.status);
        switch (response.status) {
          case CONSTANTS.HTTP_STATUS_CODE.UNAUTHORIZED:
            reject(response.status);
            break;
          default:
            console.log('Status Code' + response.status);
            reject(new Error('API Error==+: ' + response.status));
        }
      }
    } catch (error) {
      console.log('API call error:==' + error);
      reject(new Error(error));
      //Utils.netConnectionFaild();
    }
  })
};

export const get = (endpoint, headers = null) => request(endpoint, 'GET', null, headers);
export const post = (endpoint, body, headers = null) => request(endpoint, 'POST', body, headers);
export const put = (endpoint, body, headers = null) => request(endpoint, 'PUT', body, headers);
export const del = (endpoint, headers = null) => request(endpoint, 'DELETE', null, headers);