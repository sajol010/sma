import { React } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TabBarIcon = ({ isFocused, icon, level }) => (
  <View style={({
    opacity: isFocused ? 100 : 0.5, justifyContent: 'center',
    alignContent: 'center', flexDirection: 'column', height: 50, width: 50
  })}>
    <View style={styles.icon}>{icon}</View>
    <Text
      minimumFontScale={0.5}
      adjustsFontSizeToFit={true}
      numberOfLines={1}
      style={styles.level}>{level}</Text>
  </View>
);
//[styles.tab],
export default TabBarIcon;
const styles = StyleSheet.create({
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 0,
    borderRadius: 0,

  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',

  },
  level: {
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    fontFamily: 'Poppins-Regular', //Hard code font
    fontSize: 10,
  },
});
