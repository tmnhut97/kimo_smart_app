import {useRef, useEffect} from 'react'
import {Animated,Easing} from 'react-native'
const useAnimatedLoopCustom = ({ from, to, easing=Easing.linear, duration=1000}) => {
    const valueDefault = useRef(new Animated.Value(0)).current;
    const ani = Animated.loop(
        Animated.sequence([
            Animated.timing(valueDefault, {
                toValue: 1, duration, easing, useNativeDriver:false
            }),
            Animated.timing(valueDefault, {
                toValue: 0, duration: duration*2, easing, useNativeDriver:false
            })
        ])
    )
    useEffect( () => {
        ani.start();
        return () => { if(ani) ani.stop() };
    })
    return valueDefault.interpolate({
        inputRange: [0, 1],
        outputRange: [from, to]
    })
}

export default useAnimatedLoopCustom
