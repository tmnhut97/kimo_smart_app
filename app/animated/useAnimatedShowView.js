import useAnimatedCallback from "./useAnimatedCallback";
import {Easing} from "react-native";
import {useEffect} from "react";
import {useNavigation} from "@react-navigation/native";

const useAnimatedShowView = (random=200, easing=Easing.linear, duration=400) => {
    const navigation = useNavigation()
    function getRndInteger(min, max) {
        return 0
        // return Math.floor(Math.random() * (max - min)) + min;
    }
    const aniLeft = useAnimatedCallback({ value: getRndInteger(-random, random), listTo: [0, getRndInteger(-random, random)],easing, duration})
    const leftValue = aniLeft.value
    const [ lShow, lHide ] = aniLeft.animates
    const aniTop = useAnimatedCallback({ value: getRndInteger(-random, random), listTo: [0, getRndInteger(-random, random)],easing, duration})
    const topValue = aniTop.value
    const [ tShow, tHide ] = aniTop.animates
    useEffect(() => {
        lShow.start();
        tShow.start();
        return () => {
            lHide.start();
            tHide.start();
        };
    }, [navigation]);
    const settingAni = {
        left: leftValue,
        top: topValue,
    }

    return settingAni
}

export default useAnimatedShowView
