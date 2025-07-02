import LottieView from 'lottie-react-native'
import { React, useRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../../../styles/ThemeProvider'
import { DIM } from '../../../styles/Dimensions'

const NoData = () => {
  const { theme } = useTheme()

  return (
    <View style={styles.textDiv}>
      <Text style={[styles.text, { color: theme?.colors?.text }]}>
        No data available
      </Text>
    </View>

    // <LottieView
    //     autoPlay
    //     ref={animation}
    //     style={styles.animation}
    //     source={require('../../../assets/noData.json')}
    //     loop
    // />
  )
}

const styles = StyleSheet.create({
  textDiv: {
    height: DIM.height * .5,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'green',
    width: '100%',
    // height: 540,
  },
  text: {
    fontSize: 17,
    alignSelf: 'center',
    // marginBottom: '68%',
  },
})

export default NoData
