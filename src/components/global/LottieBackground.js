import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React, { useRef } from 'react';
import {
    StyleSheet
} from 'react-native';


const LottieBackground = ({ file }) => {
    const animation = useRef(null);

    // Function to start or resume the Lottie animation
    const startAnimation = () => {
        if (animation.current) {
            animation.current.play();
        }
    };

    // Function to pause or stop the Lottie animation
    const pauseAnimation = () => {
        if (animation.current) {
            animation.current.reset();
        }
    };

    // Use useFocusEffect to handle focus events
    useFocusEffect(
        React.useCallback(() => {
            // Start the animation when the component gains focus
            startAnimation();

            // Return cleanup function to pause or stop animation when losing focus
            return () => {
                pauseAnimation();
            };
        }, [])
    );

    return (
        <LottieView
            autoPlay
            ref={animation}
            style={styles.animation}
            source={file}
            // source={require('../../../assets/bg/demoLottie.json')}
            loop
            resizeMode='cover'
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    animation: {
        ...StyleSheet.absoluteFillObject,
        // zIndex: 100,
        // height: 100,
        // backgroundColor: 'black',

        // width: '100%',
        // position: 'absolute',
        // top: 0,
        // left: 0,
        // right: 0,
        // bottom: 0,
    },
});

export default LottieBackground;
