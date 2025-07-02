import { React } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

//Style
import GradientBackground from './GradientBackground.js';

export default function DocumentTabItemComponent({ onPress, title, isSelected, theme }) {
  // const [searchKeyword, setSearchKeyWord] = useState('');
  // const handleSearchPress = () => {
  //   // Pass the parameter to the callback function
  //   onSearchPress(searchKeyword);
  // };
  const navi = useNavigation();

  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity onPress={onPress}>
        {theme?.name != 'Light' ?
          <GradientBackground
            title={title}
            color={isSelected ? 'black' : 'white'}
            isLoading={false}
            colors={isSelected ? theme?.colors?.statusGradient : ['#70757a00', '#70757a00', '#70757a00']}
            textBold={true}
          />
          :
          <View
            style={
              isSelected
                ? {
                  ...styles.buttonContainerSelected,
                  backgroundColor: theme?.name == 'Light' ? '#3d50df' : theme?.colors?.text
                }
                : {
                  ...styles.buttonContainerUnselected,
                  backgroundColor: 'transparent'
                }
            }>
            <Text
              style={
                isSelected
                  ? {
                    ...styles.buttonSelectedText,
                    color: theme?.name == 'Light' ? 'white' : 'black'
                  }
                  : {
                    ...styles.buttonUnselectedText,
                    color: theme?.name == 'Light' ? 'black' : theme?.colors?.text
                  }
              }>
              {title}
            </Text>
          </View>
        }
      </TouchableOpacity>
    </View>
  );
}

var styles = StyleSheet.create({
  mainContainer: {
    paddingTop: 8,
    paddingLeft: 4,
    paddingRight: 4,
    paddingBottom: 8,
  },
  buttonContainerSelected: {
    // justifyContent: 'center',
    // alignContent: 'stretch',
    // backgroundColor: '#3d50df',
    // width: 100,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  buttonContainerUnselected: {
    // justifyContent: 'center',
    // alignContent: 'stretch',
    // backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
  },
  button: {
    backgroundColor: '#3d50df',
    borderRadius: 20,
    padding: 8,
  },
  buttonSelectedText: {
    // color: 'white',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    fontWeight: 600,
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
  },
  buttonUnselectedText: {
    // color: '#2e476e',
    justifyContent: 'center',
    alignContent: 'center',
    fontFamily: 'Poppins-Regular', //Semi Bold
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'center',
  },
});
