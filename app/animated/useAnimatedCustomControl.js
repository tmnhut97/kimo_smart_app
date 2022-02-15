import {useRef, useEffect} from 'react'
import {Animated,Easing} from 'react-native'
const useAnimatedCustomControl = ({ from, to, easing=Easing.linear, duration=500 }) => {
    const valueDefault = useRef(new Animated.Value(0)).current;
    const animated =  animated.timing(valueDefault, {
        toValue: 1, duration, easing,
        useNativeDriver:false
    })
    useEffect( () => {
        // animated.start();
        return () => { if(animated) { animated.stop(); }};
    },[])
    const value = valueDefault.interpolate({
        inputRange: [0, 1],
        outputRange: [from, to]
    })
    return { value, animated }
}

export default useAnimatedCustomControl
