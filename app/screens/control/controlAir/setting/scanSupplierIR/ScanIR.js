import React, {useEffect, useRef, useState} from "react";
import {
    Text,
    View,
    StyleSheet,
    Dimensions,
    PanResponder,
    Animated,
    Easing,
    TouchableOpacity,
    Alert
} from "react-native";
import useAnimatedCallback from "../../../../../animated/useAnimatedCallback";
import {NeuButton, NeuView} from '../../../../NeuView';
import { emitSendIr, fileSave} from "../../../../../Socket";
import {useDispatch, useSelector} from "react-redux";
import {setToast} from "../../../../../redux/reducer/toastReducer";
const {width, height} = Dimensions.get('screen')
const ScanIR = ({close, irScan, theme, LG}) => {
    const dispatch = useDispatch()
    const { supplier, irs} = irScan
    const styles = style(theme)
    const ani = useAnimatedCallback({value: -620, listTo: [0, -620], duration: 300});
    const bottom = ani.value;
    const [animStart, animStop] = ani.animates;
    const [scan, setScan ] = useState(false)
    const [indexScan, setIndexScan] = useState(-1)
    const [irSave, setIrSave] = useState(null)
    const devId = useSelector(state => state.devices.idCurrent)
    useEffect(() => {
        animStart.start();
    }, []);
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, {dx, dy}) => (-1 < dx < 1 && -1 < dx < 1),
            onPanResponderMove: (evt, gestureState) => {
                const {dy} = gestureState;
                if (dy >= 0) {
                    Animated.timing(bottom, {
                        toValue: -dy,
                        duration: 0,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }).start();
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                const {dy} = gestureState;
                if (dy >= 60) {
                    animStop.start(close);
                } else {
                    Animated.timing(bottom, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }).start();
                }
            },
        }),
    ).current;
    const Close = () => {
        animStop.start(close);
        return true;
    };
    const startScan = () => {
        setScan(true)

    }
    const stopScan = () => {
        setScan(false)
    }

    const saveDev = () => {
        if (!irSave) { dispatch(setToast({ show: "ERROR", data: LG.validate.errorOccurred })) }
        const fname = 'irdata.bin'
        const info = irSave
        fileSave(devId, fname, info, 'ACC', 'b' )
        dispatch(setToast({ show: "SUCCESS", data: LG.success}))
        Close()
    }
    useEffect(() => {
        let id = null;
        if (scan) {
            setIrSave(null)
            let t = -1
            id = setInterval(() => {
                t += 1
                if (t > irs.length-1) {
                    clearInterval(id)
                    setIndexScan(-1)
                    return dispatch(setToast({show:'WARNING', data: LG.yourDeviceCannotBeFound }))
                }
                setIndexScan(t)
                emitSendIr(devId, irs[t].filename)
            }, 1000);
        } else {
            if (indexScan>=0) setIrSave(irs[indexScan].ir)
            clearInterval(id)
            setIndexScan(-1)
        }
        return () => { if (id) clearInterval(id)}
    }, [scan]);
    useEffect( () => {
        if (irSave) {
            Alert.alert(LG.confirm, LG.doesTheAirConditionerRespond, [
                {
                    text: LG.no,
                    onPress: () => {},
                    style: 'cancel',
                },
                {
                    text: LG.yes, onPress: saveDev,
                },
            ]);
        }
    }, [irSave])
    return (
        <>
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => Close()}
                style={styles.opacity}
            />
            <Animated.View style={[styles.frameModalModeAir, {bottom}]}>
                <View style={styles.contentModal}>
                    <View
                        {...panResponder.panHandlers}
                        style={[{paddingVertical: 10, paddingBottom:15, width: '100%', justifyContent:'center', flexDirection:'row', backgroundColor: 'transparent'}]}>
                        <NeuButton
                            animatedDisabled={true}
                            active={true}
                            color={theme.newButton}
                            width={70} height={5}
                            borderRadius={20}
                        />
                    </View>
                    <Text style={{color:theme.color, fontSize: 24, alignSelf:'center'}}>
                        { supplier } {indexScan+1}/{ irs.length}
                    </Text>
                    <TouchableOpacity
                        onPressIn={startScan}
                        onPressOut={stopScan}
                    >
                        <NeuView
                            customLightShadow={'#FFFFFF'}
                            customDarkShadow={'#E3E3E3'}
                            borderRadius={50}
                            width={100}
                            height={100}
                            color={theme.itemDevice.backgroundItem}
                            style={{
                                width: 100,
                                height: 100,
                                paddingHorizontal: 20,
                                alignSelf: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#1F2C58',
                                marginVertical: 20,
                                borderRadius: 50,
                            }}
                        >
                            <Text style={{color: theme.color, fontWeight:'bold', textAlign: 'center', fontSize: 18}}>
                                { LG.start }
                            </Text>
                        </NeuView>
                    </TouchableOpacity>
                    <Text style={{color:theme.color, fontSize: 12, alignSelf:'center', textAlign: "center"}}>
                        { LG.noteScanIR }
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => animStop.start(close)}
                    style={styles.frameClose}
                >
                    <Text style={{fontSize: 20, fontWeight: '700', color: '#0499E6'}}>{LG.cancel}</Text>
                </TouchableOpacity>
            </Animated.View>
        </>
    )
}

const style = (theme) => {
    const {backgroundColor, button} = theme
    return StyleSheet.create({
        frameModalModeAir: {
            position: 'absolute',
            maxHeight: 620,
            width: width - 20,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            marginHorizontal: 10,
            zIndex: 100,
            marginBottom: 15,
        },
        opacity: {
            width,
            height,
            backgroundColor: '#000',
            position: 'absolute',
            opacity: 0.6,
            zIndex: 2,
        },
        contentModal: {
            borderWidth:5,
            borderColor:button,
            backgroundColor,
            borderRadius: 10,
            paddingVertical: 15,
        },
        option: {
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingVertical: 20,
        },
        frameClose: {
            backgroundColor,
            marginTop: 10,
            paddingVertical: 15,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
        },
    })
}

export default ScanIR
