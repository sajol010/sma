import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Neomorph } from 'react-native-neomorph-shadows';
import { Dropdown } from 'react-native-element-dropdown';

//import AntDesign from '@expo/vector-icons/AntDesign';

const { width } = Dimensions.get('window');

const StateDropdownComponent = ({
  data,
  placeholderTitle,
  onSelectItem,
  icon,
  onChangeSelect,
  placeholderTextColor = null,
  options = [],
  showSearch = true,
  divideWidthBy = 1.09,
  height = 55,
  selectedValue = null,
  placeholderColor,
  borderColor = '#B1C5D5',
  backgroundColor = 'white',
  borderWidth = 0.5,
  darkShadowColor = '#9eb5c7',
  lightShadowColor = null,
  shadowOffset = { width: 0, height: 0 },
  inputColor = 'black',
}) => {
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const handleSelectPress = (id, item) => {
    // Pass the parameter to the callback function
    console.log('Id: ' + JSON.stringify(item));
    onSelectItem(id, item);
  };

  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'blue' }]}>
          Dropdown label
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* {renderLabel()} */}
      <Neomorph
        inner // <- enable inner shadow
        useArt // <- set this prop to use non-native shadow on ios
        //swapShadows
        darkShadowColor={darkShadowColor} //"#B1C5D5" //"#FF3333" // <- set this
        // darkShadowColor="#9eb5c7" //"#B1C5D5" //"#FF3333" // <- set this
        lightShadowColor={lightShadowColor} // <- this
        // lightShadowColor="#B1C5D5" // <- this
        style={{
          ...styles.containerBg,
          width: width / divideWidthBy,
          height: height,

          borderColor: borderColor,
          backgroundColor: backgroundColor,
          borderWidth: borderWidth,
          shadowOffset: shadowOffset,
        }}>
        <Dropdown
          style={[
            { ...styles.dropdown, height: height, width: width / divideWidthBy, },
            // isFocus && { borderColor: globalStyle.colorAccent },
          ]}
          selectedTextStyle={{
            ...styles.selectedTextStyle,
            color: inputColor || 'gray',
          }}
          itemTextStyle={{ color: inputColor, fontSize: 12 }}
          activeColor='gray'
          //itemTextStyle={styles.itemTextStyle}
          inputSearchStyle={{
            ...styles.inputSearchStyle,
            color: inputColor || 'gray',
          }}
          iconStyle={styles.iconStyle}
          borderRadius={50}
          borderColor={{ color: inputColor }}
          containerStyle={{ backgroundColor: backgroundColor }}
          data={data}
          search={showSearch}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? placeholderTitle : '...'}
          placeholderStyle={{
            ...styles.placeholderStyle,
            color: placeholderColor || 'gray',
          }}
          searchPlaceholder="Search..."
          value={selectedValue}
          // value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setValue(item.value);
            console.log('Item: ' + JSON.stringify(item));
            handleSelectPress(item.value, item);
            setIsFocus(false);
          }}
          // renderLeftIcon={() => (
          //   <AntDesign
          //     style={styles.icon}
          //     color={isFocus ? 'blue' : 'black'}
          //     name="Safety"
          //     size={20}
          //   />
          // )}
        />
      </Neomorph>
    </View>
  );
};

export default StateDropdownComponent;

const styles = StyleSheet.create({
  //TODO need to fix rotation screen also
  container: {
    //backgroundColor: 'white',
    padding: 0,
  },
  containerBg: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowColor: 'white',
    shadowRadius: 5,
    borderRadius: 50, //20,
    backgroundColor: 'white',
    borderColor: '#B1C5D5',
    alignContent: 'center',
    paddingRight: 1,
    justifyContent: 'center',
    // width: width / divideWidthBy,
    // height: 55,
  },
  itemTextStyle: { color: 'black', fontSize: 12 }, //Need to add theme color
  dropdown: {
    // height: 55,
    marginTop: 0,
    marginBottom: 0,
    borderColor: '#d7d7d7',
    borderWidth: 0,
    borderRadius: 50, //20,
    paddingHorizontal: 10,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 12,
    color: 'gray',
  },
  placeholderStyle: {
    fontSize: 12,
    color: 'gray',
  },
  selectedTextStyle: {
    fontSize: 12,
    //color: 'gray',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 12, //16,
    borderRadius: 32,
    color: 'gray',
  },
});
