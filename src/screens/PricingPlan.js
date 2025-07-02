import { useNavigation } from '@react-navigation/native';
import { React, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  Linking,
  AppState
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
//import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import {
  getProducts,
  initConnection,
  requestPurchase,
  getAvailablePurchases,
  purchaseErrorListener,
  purchaseUpdatedListener,
  validateReceiptIos,
  validateReceiptAndroid,
  acknowledgePurchaseAndroid,
  finishTransaction,
  setup,
  PurchaseStateAndroid,
  getPurchaseHistory,
  transactionListener,
  inAppPurchaseUpdatedEvent,
  buyPromotedProductIOS,
  presentCodeRedemptionSheetIOS,
  getPromotedProductIOS,
  deepLinkToSubscriptionsIos,
  clearProductsIOS,
  getPendingPurchasesIOS
} from 'react-native-iap';

//Variables
//Class
import Url from '../Api.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Component
import CustomButton from '../components/global/ButtonComponent.js';
// import Button from '../components/global/ButtonComponent.js';

// Styles
import globalStyle from '../../styles/MainStyle.js';
import Token from '../class/TokenManager';
import NoData from '../components/global/NoData';
import { useTheme } from '../../styles/ThemeProvider';
import AvailableNDACount from '../components/global/AvailableNDACount';
import ModalPoup from '../components/global/ModalPoupComponent.js';
import symbolicateStackTrace from 'react-native/Libraries/Core/Devtools/symbolicateStackTrace';
import AsyncStorageManager from '../class/AsyncStorageManager.js';
import CONSTANTS from '../Constants.js';
import { copyStringIntoBuffer } from 'pdf-lib';
import LogoHeader from '../components/global/LogoHeader.js';
import Utils from '../class/Utils.js';

export default function PricingPlan(navigation) {
  const { theme } = useTheme();
  //const tabBarHeight = useBottomTabBarHeight();
  const navi = useNavigation();
  const [data, setData] = useState({});
  const [subscriptionInfo, setSubscriptionInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null); //No need

  const [btnLoad, setBtnLoad] = useState(false);

  //Need to replace in backend
  let iOSPlanId = {};
  iOSPlanId['shush.nda.p.15'] = { id: 1, amount: 9.99 };
  iOSPlanId['shush.nda.p.30'] = { id: 2, amount: 18.99 };
  iOSPlanId['shush.nda.p.100'] = { id: 3, amount: 49.99 };

  let androidPlanId = {};
  androidPlanId['shush_nda_p_15'] = { id: 1, amount: 9.99 };
  androidPlanId['shush_nda_p_30'] = { id: 2, amount: 18.99 };
  androidPlanId['shush_nda_p_100'] = { id: 3, amount: 49.99 };

  const handlePress = () => {
    navi.goBack();
    console.log('Button pressed!');
  };

  useEffect(() => {

    console.log('Pricing Plan UseEffect');
    const asyncFunc = async () => {
      let userToken = await Token.getToken();
      if (userToken) {

        getPricing();

        getSubscriptionInfo(userToken);
      } else {
        console.log('Token not found');
        return false;
      }
    };

    asyncFunc();

    // In up purchase Code
    setInappPurchase()

    const startPurchaseListener = purchaseUpdatedListener(async (purchase) => {

      Utils.setAutoLockPause(true);
      //Update background time

      // Handle purchase updates here
      console.log("Purchased: " + JSON.stringify(purchase))
      processPurchase(purchase, true)
    });

    const startPurchaseErrorListener = purchaseErrorListener((error) => {
      Utils.setAutoLockPause(true);

      //Update background time

      console.log("Purchase Error Listener: " + JSON.stringify(error));

      //{"message":"Payment is Cancelled.","debugMessage":"","code":"E_USER_CANCELLED","responseCode":1}
      switch (error.code) {
        case 'E_USER_CANCELLED':
          console.log("Purchase Cancled");
          break;
        case 'E_ALREADY_OWNED':
          console.log("Already purchased");
          getPurchasedPlan();
          break
        case 'E_IAP_NOT_AVAILABLE':
          console.log("E_IAP_NOT_AVAILABLE");

          break
        default:
          console.log("Purchase error listener: " + error.code);
      }
    });

    // const transListener = transactionListener(async (transac) => {
    //   //Update background time
    //   // Handle purchase updates here
    //   console.log("TransactionListener: " + JSON.stringify(transac))

    // });

    // const purcUpdateListener = purchaseUpdatedListener(async (transac) => {
    //   //Update background time
    //   // Handle purchase updates here
    //   console.log("PurchaseUpdatedListener: " + JSON.stringify(transac));

    // });

    const appStateListener = AppState.addEventListener(
      'change',
      async nextAppState => {
        console.log('Next AppState is: ', nextAppState);

        switch (nextAppState) {
          case 'active':

            console.log("Pricing Plan - App active");
            setInappPurchase();

            break;
          case 'inactive':

            console.log("Pricing Plan - Went inactive");
            break;
          case 'background':

            console.log("Pricing Plan - Went background");
            break;
          default:

            console.log("Pricing Plan - Unknown Active state");
        }
        //setAppState(nextAppState);
      },
    );

    return () => {
      startPurchaseListener.remove()
      startPurchaseErrorListener.remove();
      appStateListener?.remove();

      //transListener.remove();
      //purcUpdateListener.remove();
    };

  }, []);

  const processPurchase = async (purchase, isRedeem = false) => {

    if (Platform.OS === 'android') {
      if (purchase.purchaseStateAndroid === PurchaseStateAndroid.PURCHASED) {
        // Grant access, unlock features, etc. based on productID
        const productID = purchase.productId;
        console.log('Purchased ProductId: ' + productID);
        updatePurchasedProductToServer(purchase, isRedeem);
      } else if (purchase.purchaseStateAndroid === PurchaseStateAndroid.PENDING) {
        // Handle acknowledged purchases (e.g., subscriptions)
        const productID = purchase.productId;
        console.log("Purchased: status PENDING")
        // ...your app logic here...
      } else if (purchase.purchaseStateAndroid === PurchaseStateAndroid.UNSPECIFIED_STATE) {
        // Handle other purchase states (e.g., restored, refunded)
        // ...logging or debugging...
        console.log("Purchased: status UNSPECIFIED")
      } else {
        console.log("Purchased: status undefine")
      }
    } else if (Platform.OS === "ios") {
      console.log("Ios Purchase: " + JSON.stringify(purchase));
      // console.log("Plan Item: " + JSON.stringify(data));
      updatePurchasedProductToServer(purchase, isRedeem);
    }
  }

  const validateAndroidReceipt = async (purchase) => {
    console.log("Android Transaction Validate: ");
    await finishTransaction({ purchase: purchase, isConsumable: true }).then(result => {
      console.log('Finish transaction: ' + JSON.stringify(result));
    }).catch(result => {
      console.log('Finish transaction: error: ' + result);
    })
  }

  const validateIOSReceiptData = async (receiptBody, test, purchase) => {
    await validateReceiptIos({
      receiptBody,
      test
    }).then(async result => {
      console.log("Transaction Validate: " + JSON.stringify(result));

      await finishTransaction({ purchase: purchase, isConsumable: true })

    }).catch(error => {
      console.log("Transaction Validate: " + error);
    });
  }

  const setInappPurchase = async () => {
    //storekit2Mode();
    setup({ storekitMode: 'STOREKIT1_MODE' })// See above for available options
    await initConnection().then(async (value) => {

      // console.log("Purchase History: " + JSON.stringify(purchaseHistry));
      // let availabePurchase = await getAvailablePurchases({
      //   alsoPublishToEventListener: false,
      //   automaticallyFinishRestoredTransactions: false,
      //   onlyIncludeActiveItems: true,
      // });
      // console.log('getAvailablePurchases', JSON.stringify(availabePurchase))


      // processPurchase(availabePurchase)

      getPurchasedPlan();

    }).catch((error) => {
      Toast.show({
        type: 'warning',
        text1: 'In-app purchase error',
        text2: error,
        onPress: () => {
          //closeToast();
        }
      })

    })

    // let purchaseHistry = getPurchaseHistory({
    //   alsoPublishToEventListener: false,
    //   automaticallyFinishRestoredTransactions: true,
    //   onlyIncludeActiveItems: false,
    // })

    // let pendingPurchase = getPendingPurchasesIOS()
    // console.log('getPendingPurchases', JSON.stringify(pendingPurchase))

  }

  const getPricingAnsSendToServer = async (purchase = null, isRedeem) => {
    getPricing(purchase, isRedeem);

  }
  const getPricing = async (purchase = null, isRedeem = false) => {

    let token = await Token.getToken();

    if (!token) {
      console.log('Token not found')
      return
    }
    setIsLoading(true);

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setIsLoading(false);
      return
    }

    var api = Url.PRICING_PLAN;
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
            var priceInfo = json.data;
            setIsLoading(false);

            setData(priceInfo);
            // console.log("first", priceInfo);
            console.log('Status ==> ok ==> getPricing: ' + JSON.stringify(priceInfo));

            if (purchase) {
              const { planId, planPrice } = getPlanDetails(priceInfo, purchase);
              purchasePostToServer(purchase, planId, planPrice, isRedeem);
            }
          } else {
            console.log('Pricing plan list error: ' + JSON.stringify(json));
            setIsLoading(false);
          }
        } catch (error) {
          console.warn(error);
          console.log(error);
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.warn(error);
        setIsLoading(false);

        Utils.netConnectionFaild();
      });
  };

  const getSubscriptionInfo = async token => {
    setBtnLoad(true);

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setBtnLoad(false);
      return
    }

    var api = Url.MY_SUBSCRIPTION;
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
            var info = json.data;
            setBtnLoad(false);
            setSubscriptionInfo(info);
            console.log('Status ==> ok ==> getSubscriptionInfo');
          } else {
            console.log('Error: ' + JSON.stringify(json));
            setBtnLoad(false);
          }
        } catch (error) {
          console.warn(error);
          console.log(error);
          setBtnLoad(false);
        }
      })
      .catch(error => {
        console.warn(error);
        setBtnLoad(false);

        Utils.netConnectionFaild();
      });
  };

  const getProducDetails = async (sku) => {
    console.log('get Product: ' + sku);
    setIsLoading(true);

    try {
      getProducts({
        skus: [sku],
        andDangerouslyFinishTransactionAutomaticallyIOS: true,
      }).then(() => {
        console.log('Get Products ');
        purchase(sku);
      }).catch(() => {
        console.log('Get Products error ');
        setIsLoading(false);
      })

    } catch (err) {
      console.log("Get Product err: " + err.code + " ---", err.message);
      //setPlanItem(null);
    }
  }

  const getPurchasedPlan = async () => {
    try {
      getAvailablePurchases().then(async (purchases) => {
        console.log("Available: " + JSON.stringify(purchases));

        purchases.forEach(async (purchase, index) => {
          processPurchase(purchase, true); //available 
        });
      })
    } catch (err) {
      console.warn(err.code, err.message);
    }
  }

  const purchase = async (sku) => {
    console.log('purchase sku: ' + sku);

    if (Platform.OS === 'android') {
      try {
        requestPurchase({
          skus: [sku],
          andDangerouslyFinishTransactionAutomaticallyIOS: true,
        }).then(() => {
          console.log('Perchase in store successfully');
          setIsLoading(false);
        }).catch(error => {
          console.log('Purchase in store Error' + error);
          setIsLoading(false);
        })
      } catch (err) {
        console.warn(err.code + "---", err.message);
        setIsLoading(false);
      }
    } else if (Platform.OS === 'ios') {

      try {
        requestPurchase({
          sku: sku,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        }).then(() => {
          console.log('Perchase in store successfully');
          setIsLoading(false);
        }).catch(error => {
          console.log('Purchase in store Error' + error);
          setIsLoading(false);
        })

      } catch (err) {
        console.warn(err.code + "---", err.message);
        setIsLoading(false);
      }
    }
  };

  const purchaseRequestToStore = async item => {

    Utils.setAutoLockPause(true);

    const androidProductIdSku = item.sku_android;
    const iosProductIdSku = item.sku_ios;

    try {

      if (Platform.OS === 'android') {
        getProducDetails(androidProductIdSku);

      } else if (Platform.OS === 'ios') {
        getProducDetails(iosProductIdSku);//'iosProductIdSku'
      } else {
        console.log('Platform not either android or ios');
      }
    } catch (err) {
      console.log("purchaseRequestToStore()" + err);
      Utils.setAutoLockPause(false);
    }
  }

  const updatePurchasedProductToServer_ = async (purchase) => {

    setIsLoading(true);

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setIsLoading(false);
      return
    }

    let trxId = purchase?.transactionId;
    if (purchase?.transactionId) {
      trxId = purchase?.transactionId;
    } else {

      let purchaseToken = purchase?.purchaseToken;
      let subStringPToken = purchaseToken ? purchaseToken.substr(0, 20) : 'p';
      trxId = `Redeem.${subStringPToken}.time.${purchase?.transactionDate}`;
    }

    var formDataN = new FormData();
    if (Platform.OS === 'android') {

      formDataN.append('pricing_id', androidPlanId[purchase?.productId].id);
      formDataN.append('payment_method', 'google_pay');
      formDataN.append('amount', androidPlanId[purchase?.productId].amount);
      formDataN.append('product_id', purchase?.productId);
      formDataN.append('txn_id', trxId);
      formDataN.append('trx_receipt', purchase?.transactionReceipt);
      formDataN.append('trx_date', purchase?.transactionDate);
      formDataN.append('payment_details', "Purchase");
      formDataN.append('purchase_token', purchase?.purchaseToken);
      formDataN.append('signature_android', purchase?.signatureAndroid);
      formDataN.append('validate', 0);
      formDataN.append('acknowledge', 0);
      formDataN.append('response', JSON.stringify(purchase));

      //console.log("formDataN", formDataN);
    } else if (Platform.OS === 'ios') {

      formDataN.append('pricing_id', iOSPlanId[purchase?.productId].id);
      formDataN.append('payment_method', 'apple_pay');
      formDataN.append('amount', iOSPlanId[purchase?.productId].amount);
      formDataN.append('product_id', purchase?.productId);
      formDataN.append('txn_id', purchase?.transactionId);
      formDataN.append('trx_receipt', purchase?.transactionReceipt);
      formDataN.append('trx_date', purchase?.transactionDate);
      formDataN.append('payment_details', "Purchase");
      formDataN.append('purchase_token', '');
      formDataN.append('signature_android', '');
      formDataN.append('validate', 0);
      formDataN.append('acknowledge', 0);
      formDataN.append('response', JSON.stringify(purchase));

      //console.log("formDataN", formDataN);
    }

    // Fetch product information from the app store

    let userToken = await Token.getToken();

    var api = Url.SUBSCRIPTION;
    await fetch(api, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userToken}`,
      },
      body: formDataN,
    })
      .then(response => response.json())
      .then(responseJson => {
        try {
          var a = JSON.stringify(responseJson);
          var json = JSON.parse(a);
          if (responseJson.status === 200) {
            setIsLoading(false);
            getSubscriptionInfo(userToken);

            console.log('Status ==> ok ==> buySubscription');

            if (Platform.OS === 'android') {
              validateAndroidReceipt(purchase);
            } else if (Platform.OS === 'ios') {
              const receiptBody = {
                'receipt-data': purchase.transactionReceipt,
                password: 'add', // app shared secret, can be found in App Store Connect
              };
              //validateIOSReceiptData(receiptBody, true, purchase);
              validateIOSReceiptData(receiptBody, CONSTANTS.IS_IOS_IN_APP_PURCHASE_TEST, purchase)
            }

          } else {
            console.log('Error: ' + JSON.stringify(json));
            setIsLoading(false);
          }

        } catch (error) {
          console.warn(error);
          console.log(error);
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.warn(error);
        setIsLoading(false);

        Utils.netConnectionFaild();
      });
  };

  const updatePurchasedProductToServer = async (purchase, isRedeem) => {

    setIsLoading(true);

    let isConected = await Utils.isNetConnected()
    console.log("Is net connected: " + isConected);
    if (!isConected) {
      Utils.netConnectionFaild();
      setIsLoading(false);
      return
    }

    if (data && data?.length > 0) {

      const { planId, planPrice } = getPlanDetails(data, purchase);
      purchasePostToServer(purchase, planId, planPrice, isRedeem);

    } else {
      console.log('Pricing data Empty');
      getPricingAnsSendToServer(purchase, isRedeem);
    }

    //setIsLoading(false);
  };

  function getPlanDetails(data, purchase) {
    let planId = null;
    let planPrice = null;

    if (!data || !purchase) {
      console.warn('Missing required data or purchase object');
      return { planId, planPrice }; // Return empty object if data or purchase is missing
    }

    data.forEach((item, index) => {
      console.log('Item:', JSON.stringify(item));

      const platformSku = Platform.OS === 'android' ? item.sku_android : item.sku_ios;

      if (platformSku === purchase?.productId) {
        console.log('Plan Id:', item?.id);
        console.log('Plan Price:', item?.price);
        planId = item?.id;
        planPrice = item?.price;
        return; // Early exit once plan details are found
      }
    });

    return { planId, planPrice };
  }

  const purchasePostToServer = async (purchase, plandId, amount, isRedeem) => {
    let trxId = purchase?.transactionId;
    if (purchase?.transactionId) {
      trxId = purchase?.transactionId;
    } else {
      let purchaseToken = purchase?.purchaseToken;
      let subStringPToken = purchaseToken ? purchaseToken.substr(0, 20) : 'p';
      trxId = `Redeem.${subStringPToken}.time.${purchase?.transactionDate}`;
    }

    var formDataN = new FormData();
    if (Platform.OS === 'android') {

      formDataN.append('pricing_id', plandId);
      formDataN.append('payment_method', 'google_pay');
      formDataN.append('amount', amount);
      formDataN.append('product_id', purchase?.productId);
      formDataN.append('txn_id', trxId);
      formDataN.append('trx_receipt', purchase?.transactionReceipt);
      formDataN.append('trx_date', purchase?.transactionDate);
      formDataN.append('payment_details', isRedeem ? 'redeem' : 'Purchase');
      formDataN.append('purchase_token', purchase?.purchaseToken);
      formDataN.append('signature_android', purchase?.signatureAndroid);
      formDataN.append('validate', 0);
      formDataN.append('acknowledge', 0);
      formDataN.append('response', JSON.stringify(purchase));

      //console.log("formDataN", formDataN);
    } else if (Platform.OS === 'ios') {

      formDataN.append('pricing_id', plandId);
      formDataN.append('payment_method', 'apple_pay');
      formDataN.append('amount', amount);
      formDataN.append('product_id', purchase?.productId);
      formDataN.append('txn_id', purchase?.transactionId);
      formDataN.append('trx_receipt', purchase?.transactionReceipt);
      formDataN.append('trx_date', purchase?.transactionDate);
      formDataN.append('payment_details', isRedeem ? 'redeem' : 'Purchase');
      formDataN.append('purchase_token', '');
      formDataN.append('signature_android', '');
      formDataN.append('validate', 0);
      formDataN.append('acknowledge', 0);
      formDataN.append('response', JSON.stringify(purchase));

      console.log("formDataN", formDataN);
    }

    // Fetch product information from the app store

    let userToken = await Token.getToken();

    var api = Url.SUBSCRIPTION;
    await fetch(api, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userToken}`,
      },
      body: formDataN,
    })
      .then(response => response.json())
      .then(responseJson => {
        try {
          var a = JSON.stringify(responseJson);
          var json = JSON.parse(a);
          if (responseJson.status === 200) {
            setIsLoading(false);
            getSubscriptionInfo(userToken);

            console.log('Status ==> ok ==> buySubscription');

            if (Platform.OS === 'android') {
              validateAndroidReceipt(purchase);
            } else if (Platform.OS === 'ios') {
              const receiptBody = {
                'receipt-data': purchase.transactionReceipt,
                password: 'add', // app shared secret, can be found in App Store Connect
              };
              //validateIOSReceiptData(receiptBody, true, purchase);
              validateIOSReceiptData(receiptBody, CONSTANTS.IS_IOS_IN_APP_PURCHASE_TEST, purchase)
            }

          } else {
            console.log('Error: ' + JSON.stringify(json));
            setIsLoading(false);
          }

        } catch (error) {
          console.warn(error);
          console.log(error);
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.warn(error);
        setIsLoading(false);

        Utils.netConnectionFaild();
      });
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <SafeAreaView style={[styles.container, { paddingBottom: 70 }]}>
        {/* //, tabBarHeight */}
        <LogoHeader />
        {isLoading ? (
          <ActivityIndicator
            color={
              theme?.name != 'Light'
                ? theme?.colors?.text
                : globalStyle.colorAccent
            }
            style={{
              marginTop: 'auto',
              marginBottom: 'auto',
              height: 540,
            }}
          />
        ) : data && data?.length < 1 ? (
          <NoData />
        ) : (
          <ScrollView // Category List
            horizontal={false}
            // style={styles.categoryListContainer}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingBottom: 70,
            }}
            showsHorizontalScrollIndicator={true}>
            <View style={{ marginTop: 30 }}>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  left: 30,
                  zIndex: 100
                }}
                accessibilityLabel='back'
                onPress={handlePress}>
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 48,
                  width: 48,
                }}>
                  {theme?.header?.backIcon}
                </View>

              </TouchableOpacity>
            </View>

            <View style={{ alignSelf: 'center', marginVertical: 20 }}>
              <AvailableNDACount
                text={subscriptionInfo?.nda_limit || 0}
                isLoading={btnLoad}
                borderColor={theme?.textInput?.borderColor}
                backgroundColor={theme?.textInput?.backgroundColor}
                borderWidth={theme?.textInput?.borderWidth}
                darkShadowColor={theme?.textInput?.darkShadowColor}
                lightShadowColor={theme?.textInput?.lightShadowColor}
                shadowOffset={theme?.textInput?.shadowOffset}
                inputColor={theme?.textInput?.inputColor}
              />
            </View>

            <View style={styles.listDiv}>
              {data &&
                data?.length > 0 &&
                data.map((item, index) => {
                  return (
                    <View style={styles.buttonContainer} key={index}>
                      <CustomButton
                        title={item?.title}
                        onPress={() => {
                          purchaseRequestToStore(item);
                        }}
                        color={theme?.colors?.btnText}
                        colors={theme?.colors?.colors}
                        bordered={true}
                        borderWidth={theme?.name == 'Light' ? 0 : 3}
                        borderColors={theme?.colors?.borderColors}
                        borderColor={theme?.colors?.borderColor}
                        shadow={theme?.name == 'Light'}
                      />
                    </View>
                  );
                })}

              {true && // for test
                (
                  <View style={styles.buttonContainer}>
                    <CustomButton
                      title={'Redeem Code'}
                      onPress={async () => {

                        // if (Platform.OS === 'ios') {
                        //   const purchase = {
                        //     "productId": "shush.nda.p.100",
                        //     "transactionId": "520001688454532",
                        //     "transactionDate": 1714387681000,
                        //     "transactionReceipt": "NIIUWQYddddddJ"
                        //   }

                        //   updatePurchasedProductToServer(purchase);
                        // } else if(Platform.OS === 'android') {

                        //   const purchase = {
                        //     "developerPayloadAndroid": "",
                        //     "packageNameAndroid": "biz.shush.android",
                        //     "purchaseStateAndroid": 1,
                        //     "obfuscatedProfileIdAndroid": "",
                        //     "autoRenewingAndroid": false,
                        //     "isAcknowledgedAndroid": false,
                        //     "signatureAndroid": "mRRF0aIWW7so+n2BMl5x3wpHIoXDyTpdkzMS4S3H+NPcpieGM/vFi4bn61kR/FtmR9ZCdhEQnmnFPq/lcREsXk3j/ADQe7cf3vYNFI6R58OvrWgYQslOS4O51+hD9P9PN75sScDgqYLZ6wfPjxaAckIgiQxEZl+chypvSQBc95YH+qXMFKvgnfV20fuVMDF0NxSiRf3TZ3j8Zkz+gthpCZj5kio4MEPpw9MPXfP9oNE7Yqm8aL+pxxCQEkch46H5JSy25g/hp5UyLzvlMONTZH4w2CVZ90E80ig7SKeLWhpj6CBveLDVL2eaerBclVk0wK4NIsrNhCm9BXorWchhdQ==",
                        //     "dataAndroid": "{\"orderId\":\"GPA.3348-3075-9491-89583\",\"packageName\":\"biz.shush.android\",\"productId\":\"shush_nda_p_15\",\"purchaseTime\":1713950722089,\"purchaseState\":0,\"purchaseToken\":\"focndehfbglepcbfjmkienli.AO-J1Owl5o7hXNW8BdYB_3n28TItqsGiMNc6qIdWFWs6FVEyQUGLEQjlOf_ugLR3nKisBg9JJekc2KGss9dn-mdH93iW3Cmg4Q\",\"quantity\":1,\"acknowledged\":false}",
                        //     "obfuscatedAccountIdAndroid": "",
                        //     "productId": "shush_nda_p_15",
                        //     "transactionReceipt": "{\"orderId\":\"GPA.3348-3075-9491-89583\",\"packageName\":\"biz.shush.android\",\"productId\":\"shush_nda_p_15\",\"purchaseTime\":1713950722089,\"purchaseState\":0,\"purchaseToken\":\"focndehfbglepcbfjmkienli.AO-J1Owl5o7hXNW8BdYB_3n28TItqsGiMNc6qIdWFWs6FVEyQUGLEQjlOf_ugLR3nKisBg9JJekc2KGss9dn-mdH93iW3Cmg4Q\",\"quantity\":1,\"acknowledged\":false}",
                        //     "transactionId": "GPA.3338-3075-9491-89583",
                        //     "transactionDate": 1713950722089,
                        //     "purchaseToken": "focndehfbglepcbfjmkienli.AO-J1Owl5o7hXNW8BdYB_3n28TItqsGiMNc6qIdWFWs6FVEyQUGLEQjlOf_ugLR3nKisBg9JJekc2KGss9dn-mdH93iW3Cmg4Q",
                        //     "productIds": [
                        //       "shush_nda_p_15"
                        //     ]
                        //   }
                        //   updatePurchasedProductToServer(purchase);
                        // }

                        // return;
                        // Real redeem

                        Utils.setAutoLockPause(true);
                        if (Platform.OS === 'ios') {
                          //let promotedProduct = getPendingPurchasesIOS(); // deepLinkToSubscriptionsIos()
                          //console.log('Pending Purchase: '+ JSON.stringify(promotedProduct));
                          //getPurchasedPlan();

                          await presentCodeRedemptionSheetIOS();
                        } else if (Platform.OS === 'android') {
                          //getPurchasedPlan();
                          Linking.openURL(
                            'https://play.google.com/redeem?code='
                          );

                        }
                        console.log("Product Promoted");

                      }}
                      color={theme?.colors?.btnText}
                      colors={theme?.colors?.colors}
                      bordered={true}
                      borderWidth={theme?.name == 'Light' ? 0 : 3}
                      borderColors={theme?.colors?.borderColors}
                      borderColor={theme?.colors?.borderColor}
                      shadow={theme?.name == 'Light'}
                    />
                  </View>
                )}
            </View>

            {/* <ThemeSelectorForTest /> */}
          </ScrollView>
        )}

        {/* <ModalPoup
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
        /> */}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  container: {
    flex: 1,
    //paddingTop: globalStyle.topPadding,
    // backgroundColor: globalStyle.statusBarColor,
  },
  top: { zIndex: 1, backgroundColor: '#2E476E', marginTop: 0 },
  icon: {
    height: 30,
    width: 30,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 6,
    height: 117,
    width: 97,
    margin: 10,
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 500,
    textAlign: 'center',
  },
  // title: {
  //   marginVertical: 30,
  //   fontSize: 20,
  //   fontWeight: 500,
  //   // color: '#2E476E',
  //   textAlign: 'center',
  // },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  listText: {
    fontSize: 14,
    // color: '#2E476E',
    fontWeight: 400,
    marginStart: 15,
    width: 210,
    lineHeight: 23,
  },
  listDiv: {
    // marginBottom: 40,
    bottom: 0,
  },
  btnDiv: {
    marginBottom: 50,
    paddingHorizontal: 35,
  },
});
