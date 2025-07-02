import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, AppState } from 'react-native'

export default function Timer({ onTimeout, timerActive, theme, time }) {
    const [displayTime, setDisplayTime] = useState();

    var timeInSec = time; // timeInSeconds

    var referenceTime = Math.floor(new Date().getTime() / 1000 + timeInSec);

    // console.log('time in seconds ===>', timeInSeconds)

    useEffect(() => {
        console.log('timerActive =>', timerActive)
    }, [timerActive])

    useEffect(() => {
        if (timerActive) {
            var timerInterval = setInterval(() => {

                let minutes = Math.floor(timeInSec / 60);
                let seconds = timeInSec % 60;

                // Structuring the display time
                if (seconds < 10) {
                    setDisplayTime(`0${minutes}:0${seconds}`);
                    // console.log(`0${minutes}:0${seconds}`)
                } else {
                    setDisplayTime(`0${minutes}:${seconds}`);
                    // console.log(`0${minutes}:${seconds}`)
                }

                // console.log('time: ' + timeInSec);
                if (timeInSec <= 0) {
                    clearInterval(timerInterval)
                    onTimeout()
                }
                var currentTime = Math.floor(new Date().getTime() / 1000);
                timeInSec = Math.floor(referenceTime - currentTime);

                // console.log('Referance ===>', referenceTime);
                // console.log('Current time ===>', currentTime);
                // console.log('Time in sec ===>', timeInSec);

            }, 1000)
        }

        return () => {
            // console.log('removing timer ...')
            clearInterval(timerInterval)
            // onTimeout()
        }

    }, [timerActive]);

    return (
        <View style={styles.timerC}>
            <Text style={{
                ...styles.timerText,
                color: theme?.colors?.textContrast,
                fontFamily: theme?.font.body.fontFamily,
                fontWeight: theme?.font.body.fontWeight,
                fontSize: 14,
            }}>{displayTime}</Text>
        </View>
    )
}

export const styles = StyleSheet.create({
    timerC: {
        height: 'auto',
        width: 'auto',
    },
    timerText: {
    
        //fontSize: 13,
       // fontWeight: '900',
    }
})