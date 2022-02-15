import {useRef, useEffect} from 'react'
import {Animated,Easing} from 'react-native'
const useAnimatedCustom = ({ from, to, easing=Easing.linear, duration=500 }) => {
    const valueDefault = useRef(new Animated.Value(0)).current;
    const ani =  Animated.timing(valueDefault, {
        toValue: 1, duration, easing,
        useNativeDriver:false
    })
    useEffect( () => {
        ani.start();
        return () => { if(ani) { ani.stop(); }};
    },[])
    return valueDefault.interpolate({
        inputRange: [0, 1],
        outputRange: [from, to]
    })
}

export default useAnimatedCustom
