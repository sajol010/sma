import React from 'react'
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native'
import { DIM } from '../../../styles/Dimensions'

import { useTheme } from '../../../styles/ThemeProvider.js';
import FastImage from 'react-native-fast-image'
import CONSTANTS from '../../Constants';

export default function LogoHeader({ extraStyles }) {
    const { theme } = useTheme()

    const goldLogoWebp = require('../../../assets/gold/ShushGoldLogo.webp')
    const roseGoldLogoWebp = require('../../../assets/roseGold/ShushRoseGoldLogo.webp')
    const silverLogoWebp = require('../../../assets/honey/ShushSilverLogo.webp')
    const defultLogoWebp = require('../../../assets/honey/ShushDefultLogo.webp')

    const { height, width, scale, fontScale } = useWindowDimensions();

    // const returnLogo = () => {
    //     if (theme.name === 'Gold') {
    //         return <ShushGoldLogo />;
    //     } else if (theme.name === 'RoseGold') {
    //         return <ShushRoseGoldLogo />;
    //     } else {
    //         return <ShushSilverLogo />;
    //     }
    // }

    const returnLogoPng = () => {

        if (theme.name === 'Gold') {
            return (
                <FastImage
                    source={goldLogoWebp}
                    resizeMode='contain'
                    style={{
                        // backgroundColor: 'red'
                        height: 82,
                        width: 240,
                    }}
                />
            )
        } else if (theme.name === 'RoseGold') {
            return (
                <FastImage
                    source={roseGoldLogoWebp}
                    resizeMode='contain'
                    style={{
                        // backgroundColor: 'red'
                        height: 82,
                        width: 240,
                    }}
                />
            )
        } else if (theme.name === 'Elegant') {

            if (theme.ui === CONSTANTS.UI.DEFAULT) {
                return (<FastImage
                    source={defultLogoWebp}
                    resizeMode='contain'
                    style={{
                        // backgroundColor: 'red'
                        height: 82,
                        width: 240,
                    }}

                />
                )

            } else {
                return (

                    <FastImage
                        source={silverLogoWebp}
                        resizeMode='contain'
                        style={{
                            // backgroundColor: 'red'
                            height: 82,
                            width: 240,
                        }}
                    />
                )
            }

        }
    }

    return (
        <View style={{...styles.logoHeader, extraStyles, height: height * .15, paddingTop: height * .18,}}>
            {/* {returnLogo()} */}
            {returnLogoPng()}
        </View>
    )
}

const styles = StyleSheet.create({
    logoHeader: {
        //height: DIM.height * .15,
        width:  '100%',//DIM.width,
        //backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'flex-end',
        //paddingTop: DIM.height * .18,
        // paddingRight: DIM.width * .1,
    }
})