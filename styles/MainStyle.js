//main styling
import { StyleSheet } from 'react-native';

module.exports = StyleSheet.create({
  colorPrimary: '#2463eb', // '#023b94',
  colorAccent: '#2463eb', //
  colorWhite: 'white',
  toolBarColor: 'transparent',
  // toolBarColor: '#FFFFFF',
  toolBarAndroid: '#333333',
  bottomBarColor: '#FFFFFF',
  statusBarColor: 'white',

  topPadding: 40,
  bottomPadding: 20,

  backgroundColor: 'white', //'#eeeef0',
  opacity: 0.95,
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
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    height: 200,
    width: 150,
    margin: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 0,
  },
  container: {
    width: 60,
    height: 45,
  },
  title: {
    fontSize: 15,
    fontWeight: 'normal',
    flex: 1,
    marginTop: 20,
    marginBottom: 0,
  },
  description: {
    fontSize: 16,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    top: 5,
    padding: 15,
    borderRadius: 10,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    paddingLeft: 20, // add left padding here
  },
  line: {
    borderBottomColor: '#c0c0c0',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    lightGrayBackground: this.backgroundColor,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // '#FF5236',
  },
  //Tab Style
  tab: {
    headerTitleAlign: 'left',
    headerStyle: {
      backgroundColor: 'white',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  },
  //Bottom Tab Bar style
  navigationOptionIos: {
    headerShown: false,
    lazyLoad: false,
    tabBarShowLabel: false,
    unmountOnBlur: true, //remove all data after screen goes
    tabBarActiveTintColor: 'white',
    backgroundColor: 'blue',
    tabBarStyle: {
      position: 'absolute',
      bottom: 0, //8,
      left: -4,
      right: -4,
      // '#808090'
      opacity: 100,
      elevation: 0,
      //shadowColor: '#5bc4ff',
      //borderRadius: 32,
      backgroundColor: '#3D50DF',
      borderTopRightRadius: 16,
      borderTopLeftRadius: 16,
      height: 90, //useBottomTabBarHeight,
    },

    // tabBarBackground: () => (
    //   // <BlurView
    //   //   blurType="xlight"
    //   //   blurAmount={15}
    //   //   style={{
    //   //     position: 'absolute',

    //   //     top: 0,
    //   //     left: 8,
    //   //     bottom: 0,
    //   //     right: 8,
    //   //     opacity: 10,
    //   //   }}
    //   // />
    // ),
  },

  navigationOptionAndroid: {
    headerShown: false, //TurboModuleRegistry,
    lazyLoad: false,
    tabBarShowLabel: false,
    unmountOnBlur: true,
    safeAreaInsets: {
      bottom: 0,
    },
    tabBarActiveTintColor: 'white',
    // tabBarStyle: {
    //   position: 'absolute',

    //   bottom: 0,
    //   left: 8,
    //   right: 8,
    //   // '#808090'
    //   opacity: 100,
    //   elevation: 0,
    //   //shadowColor: '#5bc4ff',
    //   //borderRadius: 32,
    //   //borderTopRightRadius: 16,
    //   //height: 50, //useBottomTabBarHeight,
    // },
    tabBarStyle: {
      position: 'absolute',
      bottom: 0, //8,
      left: 0,
      right: 0,
      // '#808090'
      opacity: 100,
      elevation: 0,
      //shadowColor: '#5bc4ff',
      //borderRadius: 32,
      // backgroundColor: 'black',// '#3D50DF'

      // borderTopWidth: 3,
      // borderBottomWidth: .01,
      // borderWidth: 3,
      // borderRightWidth:3,
      // borderLeftWidth:3,
      // borderColor: 'silver',
      // borderBottomColor: 'red',

      borderTopRightRadius: 20, //16,
      borderTopLeftRadius: 20, //16,
      height: 70, //useBottomTabBarHeight,
    },

    // tabBarBackground: () => (
    //   <BlurView
    //     blurType='thinMaterialDarkLight'
    //     blurAmount={30}
    //     style={StyleSheet.absoluteFill}
    //   />
    // ),
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  logoTitle: {
    flexDirection: 'row',
    paddingLeft: 16,
  },
  logoTitleTxt: {
    paddingLeft: 32,
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
});
