import React, {useEffect} from 'react';

import {StyleSheet, Text, View, Animated, Easing, Dimensions} from 'react-native';
import useAnimatedCallback from "../../animated/useAnimatedCallback";
const {width} = Dimensions.get("screen")
const ToastConnectionBar= ({data, close, type}) => {
    const aniToast = useAnimatedCallback({value:  -25, listTo: [0, -25], easing: Easing.in(Easing.bounce),  duration: 0});
    const top = aniToast.value;
    const [goToast, ToastClose] = aniToast.animates;
    useEffect(() => {
        goToast.start();
        let timeOut =null
        if (type === 'connected') {
            timeOut = setTimeout( () => ToastClose.start(close), 3000)
        }

        return () => { if (timeOut) clearTimeout(timeOut) }
    }, []);
    return(
        <Animated.View style={[styles.toast, {top: top}]}>
            <View style={styles.frameToast}>
                <View style={styles.contentToast}>
                    <Text style={styles.title}>{data}</Text>
                </View>
            </View>
        </Animated.View>
    )
}


const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        top: 0,
    },
    closeToast: {
        position: 'absolute',
        right: 15,
    },
    frameToast: {
        backgroundColor: 'green',
        width,
        paddingHorizontal: 15,
    },
    contentToast: {
        flexDirection: 'row',
        justifyContent:'center',
        alignItems:'center',
        height:25,
    },
    title:{
        color:'#FFF',
        fontSize:12,
    }
});
export default ToastConnectionBar
