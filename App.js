import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import { CardStyleInterpolators, createNativeStackNavigator } from '@react-navigation/stack';
import React, { memo, useEffect, } from 'react';
import { Platform, Text, View, useColorScheme, Animated, StatusBar } from 'react-native';
import Toast from 'react-native-toast-message'
//Class

//Assets
import AccountGraySvg from './assets/bottom_tab_account_gray.svg';
import SettingsGraySvg from './assets/bottom_tab_settings_gray.svg';
import HomeGraySvg from './assets/bottom_tab_home_gray.svg';
import ListGraySvg from './assets/bottom_tab_inbox_gray.svg';
import toastConfig from './src/components/global/NotificationConfig.js';
//Screens
//import CreateEvent from './src/screens/CreateEvent.js';
import HomeScreen from './src/screens/Home.js';
import MyAccount from './src/screens/MyAccount.js';
import MyProfile from './src/screens/Profile.js';
import Inbox from './src/screens/Inbox.js';
import Settings from './src/screens/Settings.js';

import NdaOtpVerify from './src/screens/NdaOtpVerify';

import DocumentList from './src/screens/DocumentList.js';
import DocumentSign from './src/screens/DocumentSign';
import SignIn from './src/screens/SignIn.js';
import SignUp from './src/screens/SignUp.js';
import SplashScreen from './src/screens/SplashScreen.js';

//Components
import TabBarIcon from './src/components/global/TabBarIconComp.js';
//Screens files
import ChooseAgreement from './src/screens/ChooseAgreement';
import ChooseTemplates from './src/screens/ChooseTemplates';
import CreateNdaAcceptance from './src/screens/CreateNdaAcceptance';
import CreateNdaPartyList from './src/screens/CreateNdaPartyList';
import CreateNdaReceiverInfo from './src/screens/CreateNdaReceiverInfo';

//import DocumentStatus from './src/screens/DocumentStatus';
import PricingPlan from './src/screens/PricingPlan';
import styles from './styles/MainStyle.js';
import CreateNdaPartyCustomize from './src/screens/CreateNdaPartyCustomize';
import CreateNdaSigning from './src/screens/CreateNdaSigning';
import ArchiveList from './src/screens/ArchiveList';
import NdaPdfPreView from './src/screens/NdaPdfPreview';

//Styles
import { ThemeProvider, useTheme } from './styles/ThemeProvider';
import GlobalStyle from './styles/MainStyle.js';
import CreateNdaSuccess from './src/screens/CreateNdaSuccess';
import ThemeComponent from './src/screens/ThemeComponent';
import BackgroundProvider from './src/components/global/BackgroundProvider';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const FadeInView = (props, { navigation }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  useFocusEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    return () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }).start();
    };
  });

  return (
    <Animated.View // Special animatable View
      style={{
        flex: 1,
        opacity: fadeAnim, // Bind opacity to animated value
      }}>
      {props.children}
    </Animated.View>
  );
};

const FadeHomeScreen = (props, { navigation }) => (
  <FadeInView>
    <HomeTab {...props} />
  </FadeInView>
);

const FadeDocumentList = (props, { navigation }) => (
  <FadeInView>
    <DocumentList {...props} />
  </FadeInView>
);

function HomeTab({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent',
        },
        animation: 'none',
      }}>
      <Stack.Screen name="home" component={HomeScreen} />
      <Stack.Screen
        name="document_list"
        screenOptions={{ headerShown: true }}
        component={FadeDocumentList}
      />
      <Stack.Screen
        name="document_sign"
        screenOptions={{ headerShown: true }}
        component={DocumentSign}
      />
      {/* Duplicate fix in account */}
      {/* <Stack.Screen
        name="pricing-plan-home"
        screenOptions={{ headerShown: true }}
        //listeners={resetTabStacksOnBlur}
        component={PricingPlan}
      /> */}
      <Stack.Screen
        name="my_profile_home"
        screenOptions={{ headerShown: true }}
        component={MyProfile}
      />
    </Stack.Navigator>
  );
}

const FadeSettingsTab = (props, { navigation }) => (
  <FadeInView>
    <SettingsTab {...props} />
  </FadeInView>
);

const FadeThemeComponent = (props, { navigation }) => (
  <FadeInView>
    <ThemeComponent {...props} />
  </FadeInView>
);

function SettingsTab({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent',
        },
        animation: 'none',
        //animation: 'slide_from_right',

      }}>
      <Stack.Screen name="settings" component={Settings} />
      {/* <Stack.Screen
        name="archive_list"
        screenOptions={{ headerShown: true }}
        component={ArchiveList}
      /> */}
      <Stack.Screen
        name="select_theme"
        screenOptions={{ headerShown: true }}
        component={FadeThemeComponent}
      />
    </Stack.Navigator>
  );
}
const FadeAccountTab = (props, { navigation }) => (
  <FadeInView>
    <AccountTab {...props} />
  </FadeInView>
);

const FadeMyProfile = (props, { navigation }) => (
  <FadeInView>
    <MyProfile {...props} />
  </FadeInView>
);

const FadePricingPlan = (props, { navigation }) => (
  <FadeInView>
    <PricingPlan {...props} />
  </FadeInView>
);

function AccountTab({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent',
        },
        animation: 'none',
        //animation: 'slide_from_right',
      }}>
      <Stack.Screen name="profile" component={MyAccount} />
      <Stack.Screen
        name="archive_list"
        screenOptions={{ headerShown: true }}
        component={ArchiveList}
      />
      <Stack.Screen
        name="pricing-plan"
        screenOptions={{ headerShown: true }}
        //listeners={resetTabStacksOnBlur}
        component={FadePricingPlan}
      />
      <Stack.Screen
        name="my_profile"
        screenOptions={{ headerShown: true }}
        component={FadeMyProfile}
      />
    </Stack.Navigator>
  );
}

const FadeInboxTab = (props, { navigation }) => (
  <FadeInView>
    <InboxTab {...props} />
  </FadeInView>
);

function InboxTab({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent',
        },
        animation: 'none',
      }}>
      <Stack.Screen name="inbox" component={Inbox} />

      <Stack.Screen
        name="my_profile_inbox"
        screenOptions={{ headerShown: true }}
        component={MyProfile}
      />

    </Stack.Navigator>
  );
}

const LogoTitle = ({ title, icon }) => {
  return (
    <View>
      <View style={styles.logoTitle}>
        {icon}
        <Text style={styles.logoTitleTxt}>{title}</Text>
      </View>
    </View>
  );
};
const HomeHeaderTitle = memo(props => (
  <LogoTitle title={'Home'} icon={HomeGraySvg} {...props} />
));

const HomeTabBarIcon = ({ focused, tabBarLabel }) => {
  const { theme } = useTheme();
  return (
    <TabBarIcon
      isFocused={focused}
      icon={theme?.nav?.home}
      level={'Home'}
    />
  );
};

const InboxHeaderTitle = memo(props => (
  <LogoTitle title={'Inbox'} icon={<ListGraySvg />} {...props} />
));

const InboxTabBarIcon = ({ focused, tabBarLabel }) => {
  const { theme } = useTheme();

  return (
    <TabBarIcon isFocused={focused} icon={theme?.nav?.inbox} level={'Inbox'} />
  );
};

const SettingsHeaderTitle = memo(props => (
  <LogoTitle title={'Settings'} icon={<SettingsGraySvg />} {...props} />
));
const SettingsTabBar = ({ focused, tabBarLabel }) => {
  const { theme } = useTheme();
  return (
    <TabBarIcon
      isFocused={focused}
      icon={theme?.nav?.settings}
      level={'Settings'}
    />
  );
};

const MyAccountHeaderTitle = memo(props => (
  <LogoTitle title={'Account'} icon={<AccountGraySvg />} {...props} />
));
const MyAccountTabBar = ({ focused, tabBarLabel }) => {
  const { theme } = useTheme();
  return (
    <TabBarIcon
      isFocused={focused}
      icon={theme?.nav?.account}
      level={'Account'}
    />
  );
};

const FadeSignIn = (props, { navigation }) => (
  <FadeInView>
    <SignIn {...props} />
  </FadeInView>
);
const FadeSignUp = (props, { navigation }) => (
  <FadeInView>
    <SignUp {...props} />
  </FadeInView>
);

const FadeMyTabs = (props, { navigation }) => (
  <FadeInView>
    <MyTabs />
  </FadeInView>
);

function MyTabs() {
  const { dark, theme, unread } = useTheme();
  useEffect(() => {

  }, [unread])

  return (
    <Tab.Navigator
      sceneContainerStyle={{
        backgroundColor: 'transparent',
      }}
      screenOptions={
        Platform.OS === 'ios'
          ? {
            ...GlobalStyle.navigationOptionIos,
            tabBarStyle: {
              ...GlobalStyle.navigationOptionIos.tabBarStyle,
              backgroundColor: theme?.nav?.bg,
              // borderColor: theme?.nav?.borderColor,
              // borderWidth: 0.01,
              // borderTopWidth: 4,
              borderTopEndRadius: 25,
              borderTopStartRadius: 25,
              borderStartColor: theme?.nav?.borderColor,
              borderEndColor: theme?.nav?.borderColor,
              borderTopWidth: 4,
              borderLeftWidth: 4,
              borderRightWidth: 4,
              borderTopColor: theme?.nav.borderColor,
              // borderBottomWidth: .01,

            },

            unmountOnBlur: true,
          }
          : {
            ...GlobalStyle.navigationOptionAndroid,
            tabBarStyle: {
              ...GlobalStyle.navigationOptionAndroid.tabBarStyle,
              backgroundColor: theme?.nav?.bg,
              borderColor: theme?.nav?.borderColor,
              borderWidth: 0.01,
              borderTopWidth: 4,
              // borderBottomWidth: .01,
            },

            unmountOnBlur: true,
          }
      }
      initialRouteName="Feed">
      <Tab.Screen
        name="tab_home" //Heading
        options={{
          headerTitle: HomeHeaderTitle,
          //props => <LogoTitle {...props}/>,
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },

          tabBarLabel: 'Home',
          tabBarIcon: HomeTabBarIcon,
        }}
        component={FadeHomeScreen}//{HomeTab}
      />
      <Tab.Screen
        name="tab_inbox"
        component={FadeInboxTab}
        options={{
          headerTitle: InboxHeaderTitle,
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarLabel: 'Inbox', //'Updates',
          tabBarBadge: unread < 1 ? null : unread > 50 ? '50+' : unread,
          tabBarIcon: InboxTabBarIcon,
        }}
      />
      <Tab.Screen
        name="tab_settings"
        component={FadeSettingsTab}//{SettingsTab}
        options={{
          headerTitle: SettingsHeaderTitle,
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },

          tabBarLabel: 'Settings', //'Updates',
          tabBarIcon: SettingsTabBar,
        }}
      />
      <Tab.Screen
        name="tab_account"
        options={{
          headerTitle: MyAccountHeaderTitle,
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },

          tabBarLabel: 'Account', // 'Profile',
          tabBarIcon: MyAccountTabBar,
        }}
        component={FadeAccountTab}//{AccountTab}
      />
    </Tab.Navigator>
  );
}


const FadeCreateNdaReceiverInfo = (props, { navigation }) => (
  <FadeInView>
    <CreateNdaReceiverInfo   {...props} />
  </FadeInView>
);

const FadeCreateNdaSigning = (props, { navigation }) => (
  <FadeInView>
    <CreateNdaSigning  {...props} />
  </FadeInView>
);

const FadeCreateNdaSuccess = (props, { navigation }) => (
  <FadeInView>
    <CreateNdaSuccess  {...props} />
  </FadeInView>
);

const FadeNdaPdfPreView = (props, { navigation }) => (
  <FadeInView>
    <NdaPdfPreView {...props} />
  </FadeInView>
);

const FadeNdaOtpVerify = (props, { navigation }) => (
  <FadeInView>
    <NdaOtpVerify {...props} />
  </FadeInView>
);

export default function App() {

  return (
    <ThemeProvider>
      {/* <StatusBar
        translucent
        animated={true}
        backgroundColor={'transparent'}
        barStyle={'light-content'}
      /> */}
      <NavigationContainer>
        <BackgroundProvider>

          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: 'transparent',
              },
              animation: 'none', //'slide_from_right',
            }}>
            <Stack.Screen name="splash" component={SplashScreen} />
            <Stack.Screen name="sign_in" component={FadeSignIn} options={{ animation: 'none' }} />
            <Stack.Screen name="sign_up" component={FadeSignUp} options={{ animation: 'none' }} />
            {/* If want to move out side of home tab */}
            <Stack.Screen name="tab" component={FadeMyTabs} options={{ gestureEnabled: false, animation: 'none' /*'slide_from_left'*/, }} />

            <Stack.Screen
              name="create_nda_receiver_info"
              screenOptions={{ headerShown: true }}
              component={FadeCreateNdaReceiverInfo}
              options={{ animation: 'none' }}
            />

            <Stack.Screen
              name="create_nda_signing"
              screenOptions={{ headerShown: true }}
              component={FadeCreateNdaSigning}
              options={{ animation: 'none' }}
            />
            <Stack.Screen
              name="pricing-plan-home"
              screenOptions={{ headerShown: true }}
              //listeners={resetTabStacksOnBlur}
              component={PricingPlan}
            />
            <Stack.Screen
              name="create_nda_signing_success"
              screenOptions={{ headerShown: true }}
              component={FadeCreateNdaSuccess}
              options={{ animation: 'none' }}
            />
            <Stack.Screen
              name="nda_pdf_preview"
              screenOptions={{ headerShown: true }}
              component={FadeNdaPdfPreView}
              options={{ animation: 'none' }}
            />

            <Stack.Screen
              name="nda_otp_verify"
              screenOptions={{ headerShown: true }}
              component={FadeNdaOtpVerify}
              options={{ animation: 'none' }}
            />

            {/* Unused Screens */}
            <Stack.Screen
              name="choose-agreement"
              screenOptions={{ headerShown: true }}
              component={ChooseAgreement}
              options={{ animation: 'none' }}
            />
            <Stack.Screen
              name="choose_templates"
              screenOptions={{ headerShown: true }}
              component={ChooseTemplates}
              options={{ animation: 'none' }}
            />
            <Stack.Screen
              name="create_nda_acceptance"
              screenOptions={{ headerShown: true }}
              component={CreateNdaAcceptance}
              options={{ animation: 'none' }}
            />
            <Stack.Screen
              name="create_nda_party_list"
              screenOptions={{ headerShown: true }}
              component={CreateNdaPartyList}
            />
            <Stack.Screen
              name="create_nda_party_customize"
              screenOptions={{ headerShown: true }}
              component={CreateNdaPartyCustomize}
            />

          </Stack.Navigator>
        </BackgroundProvider>
      </NavigationContainer>
    </ThemeProvider>
  );
}
