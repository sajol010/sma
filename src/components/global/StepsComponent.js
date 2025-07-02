import React from 'react';
import { View, Text } from 'react-native';

const StepsComponent = ({
  steps = ['Create', 'Invite', 'Assign'],
  active = 1,
  textFont = 12,
  theme = null
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 25,
      }}>
      {steps?.map((item, index) => (
        <View
          key={item + index}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            // paddingBottom: 70,
          }}>
          {/* Circle */}
          <View>
            <View
              style={{
                borderRadius: 50,
                borderWidth: 1,
                borderColor: theme?.name == 'Light' ? index + 1 <= active ? '#3D50DF' : 'gray' : index + 1 <= active ? theme?.colors?.switch : 'white',
                // borderColor: index + 1 <= active ? '#3D50DF' : 'gray',
                height: 25,
                width: 25,
                padding: 1.5,
                // paddingBottom: 20,
                // marginBottom: 20,
              }}>
              <View
                style={{
                  backgroundColor: index + 1 <= active ? theme?.name == 'Light' ? '#3D50DF' : theme?.colors?.switch : 'transparent',
                    // index + 1 <= active ? '#3D50DF' : 'transparent',
                  height: 20,
                  width: 20,
                  borderRadius: 50,
                  // padding: 2,
                  // borderWidth: 1
                }}
              />
              <Text
                style={{
                  width: 50,
                  height: 50,
                  textAlign: 'center',
                  alignSelf: 'center',
                  marginTop: 5,
                  color: theme?.name == 'Light' ? '#2e476e' : 'white',
                  // color: '#2E476E',
                  fontSize: textFont,
                  // marginBottom: 20,
                  // flex: 1,
                }}>
                {item}
              </Text>
            </View>
          </View>

          {/* Line */}
          {index != steps?.length - 1 && (
            <View
              style={{
                // borderColor: index + 1 < active ? '#3D50DF' : 'gray',
                // borderBottomWidth: index + 1 < active ? 2 : 1,
                // borderWidth: 0,

                // borderWidth: index + 1 < active ? 2 : 1,
                // borderTopWidth: 0,
                // borderLeftWidth: 0,
                // borderRightWidth: 0,

                // borderStyle: 'dotted',

                marginBottom: 50,
                // width: 50,
                // width: 300 / steps.length,

                marginTop: 'auto',
                marginBottom: 'auto',
                // marginRight: 5,
                // marginLeft: 5,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  // marginTop: 'auto',
                  // marginBottom: 'auto',
                  color: theme?.name == 'Light' ? index + 1 < active ? '#3D50DF' : 'gray' : index + 1 < active ? theme?.colors?.switch : 'white',
                  // color: index + 1 < active ? '#3D50DF' : 'gray',
                  fontWeight: index + 1 < active ? 800 : 400,
                  paddingHorizontal: 5,
                  flex: 1,
                  letterSpacing: 1,
                }}>
                {index + 1 < active ? '.................' : '.................'}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default StepsComponent;
