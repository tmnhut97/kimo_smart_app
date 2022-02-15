import {useRef, useEffect} from 'react'
import {Animated,Easing} from 'react-native'
const useAnimatedCallback = ({ value, listTo, easing=Easing.linear, duration=500 }) => {
    const valueDefault = useRef(new Animated.Value(value)).current;
    const animates = listTo.map( e => {
        return Animated.timing(valueDefault, {
            toValue: e,
            duration,
            easing,
            useNativeDriver:false
        })
    })
    useEffect( () => {
        return () => {
            if (animates.length) { animates.forEach( (e) => { if (e) e.stop()}) }
        };
    },[])
    return { value: valueDefault, animates}
}

export default useAnimatedCallback
