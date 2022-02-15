import React, {useEffect} from 'react';

import {Easing ,Text, TouchableOpacity, Animated, View, StyleSheet} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import useAnimatedCallback from "../../animated/useAnimatedCallback";
import {useSelector} from 'react-redux';
const ToastWarning = ({data, close}) => {
    const aniToast = useAnimatedCallback({value: -300, listTo: [10, -300], easing: Easing.in(Easing.bounce), duration: 500});
    const rightToast = aniToast.value;
    const [goToast, ToastClose] = aniToast.animates;
    const LG = useSelector((state) => state.languages.language)
    useEffect(() => {
        goToast.start();
        const timeOut = setTimeout( () => ToastClose.start(close), 5000)
        return () => { if (timeOut) clearTimeout(timeOut) }
    }, []);
    return (
        <Animated.View style={[styles.toast, {right: rightToast}]}>
            <View style={styles.frameToast}>
                <FontAwesome name={'warning'} size={40} color={'#9E5F00'}/>
                <View style={styles.contentToast}>
                    <Text style={styles.title}>{LG.warning}</Text>
                    <Text>{data}</Text>
                </View>
                <TouchableOpacity
                    style={styles.closeToast}
                    onPress={() => {
                        ToastClose.start(close);
                    }}
                >
                    <FontAwesome5Icon name={'times'} size={25} color={'#9E5F00'}/>
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}
const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        bottom: 120,
    },
    closeToast: {
        position: 'absolute',
        right: 15,
        top: 0,
        height:48,
        width: 48,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems:'center'
    },
    frameToast: {
        borderLeftColor: '#FFB74D',
        backgroundColor: '#FFF1DB',
        borderLeftWidth: 4,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems:'center',
        paddingHorizontal: 15,
        paddingVertical: 14,
        width: 300,
        borderRadius: 10,
        borderTopWidth: 2,
        borderTopColor: '#FFF',
        borderBottomWidth: 2,
        borderBottomColor: '#C1C2C4',
    },
    contentToast: {
        paddingLeft: 10,
        marginRight: 35,
    },
    title: {
        color: '#393939',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
export default ToastWarning
