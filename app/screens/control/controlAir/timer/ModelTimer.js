import React, {useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
    PanResponder,
    Easing,
    BackHandler,
    FlatList,
} from 'react-native';
import useAnimatedCallback from '../../../../animated/useAnimatedCallback';
import {useDispatch, useSelector} from 'react-redux';
import { emitTimer, wsListenerMessage, wsRemoveListenerMessage} from '../../../../Socket';
import {isJsonString, parseDate} from '../../../../mFun';
import {setToast} from '../../../../redux/reducer/toastReducer';
import {NeuButton} from '../../../NeuView';
const {width, height} = Dimensions.get('screen');
const ModelTimer = ({close, status, timer}) => {
    const dispatch = useDispatch();
    const devId = useSelector(state => state.devices.idCurrent);
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
    const ani = useAnimatedCallback({value: -510, listTo: [0, -510], duration: 200});
    const bottom = ani.value;
    const [animStart, animStop] = ani.animates;
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
    useEffect(() => {
        animStart.start();
        BackHandler.addEventListener('hardwareBackPress', Close);
        return () => BackHandler.removeEventListener('hardwareBackPress', Close);
    }, []);

    const [ time, setTime ] = useState(0)
    const minusTime = (m) => {
        const temp = 60000*m
        if (time-temp < 300000) return;
        setTime(time-temp)
    }
    const plusTime = (m) => {
        const temp = 60000*m
        if (time+1800000 >= 3600000*24) return;
        setTime(time+temp)
    }
    const timeDisplay = () => {
        const h = time/3600000
        const m = time%3600000
        if (h < 1) return m/60000 + "'"
        if (m < 1) return parseInt(h) + 'h'
        return ('0' + parseInt(h)).slice(-2) + 'h' + m/60000 + "'"
    }

    const lisTimer = (evt) => {
        if (!isJsonString(evt.data)) return;
        const { cmd, res, msg, typetimer, devid, devtype } = JSON.parse(evt.data)
        if (
            cmd === 'res' && res === 'timerdev' && typetimer === 'set' &&
            devid === devId && devtype === 'ACC' && msg === "OK"
        ) {
            close();
            dispatch(setToast({ show: "SUCCESS", data: LG.success }))
        }
    }
    const submit = () => {
        if (time <= 0) return;
        if (status==="ON") {
            emitTimer(devId, 'set', { active: true, action: 'poff', time })
        } else emitTimer(devId, 'set', { active: true, action: 'pon', time })
        wsListenerMessage(lisTimer)
    }

    const cancelTimer = () => {
        emitTimer(devId, 'set', { active: false })
    }
    useEffect( () => {
        if (!timer.active) return setTime(1800000)
        return () => wsRemoveListenerMessage(lisTimer)
    }, [timer])
    return (
        <>
            <TouchableOpacity activeOpacity={0.6}  onPress={() => Close()} style={styles.opacity} />
            <Animated.View style={[styles.frameSetting, {bottom}]}>
                <View {...panResponder.panHandlers} style={styles.contentModal}>
                    <View style={styles.moveDown}>
                        <NeuButton
                            animatedDisabled={true}
                            active={true}
                            color={theme.newButton}
                            width={70} height={5}
                            borderRadius={20}
                        />
                    </View>
                    <View>
                        <Text style={styles.titleSetTime}>
                            {
                                !timer.active && LG.setTheTime ||
                                (
                                    parseDate(new Date((new Date()).getTime() + timer.time)).timeString + "', " +
                                    (timer.action==='pon' ? LG.theAirConditionerWillTurnOn.toLowerCase() : LG.theAirConditionerWillTurnOff.toLowerCase())
                                )
                            }
                        </Text>
                    </View>
                    {
                        !(timer.active && time <= 0) ?
                            <View style={{ paddingVertical: 20, }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 20}}>
                                    <View style={{justifyContent: "center", alignItems: "center",width: 60, height: 60 }}>
                                        <FlatList
                                            data={[1, 5, 10]}
                                            showsVerticalScrollIndicator={false}
                                            initialScrollIndex={1}
                                            pagingEnabled={true}
                                            renderItem={({ item }) => {
                                                return (
                                                    <NeuButton
                                                        onPress={() => minusTime(item)}
                                                        color={theme.newButton}
                                                        width={40} height={40}
                                                        borderRadius={22.5}
                                                        style={{ margin: 10}}
                                                    >
                                                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                                            <Text style={{ fontSize: 15,color:theme.color}}>- {item}</Text>
                                                        </View>
                                                    </NeuButton>
                                                )
                                            }}
                                            keyExtractor={(item, index) => index.toString()}
                                        />
                                    </View>
                                    <NeuButton
                                        onPress={() => minusTime(30)}
                                        color={theme.newButton}
                                        width={50} height={40}
                                        borderRadius={22.5}
                                    >
                                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                            <Text style={{ fontSize: 15,color:theme.color}}>- 30</Text>
                                        </View>
                                    </NeuButton>
                                    <Text style={{ fontSize: 30, fontWeight: "bold", color:theme.color}}>
                                        {timeDisplay()}
                                    </Text>
                                    <NeuButton
                                        onPress={() => plusTime(30)}
                                        color={theme.newButton}
                                        width={50} height={40}
                                        borderRadius={22.5}
                                    >
                                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                            <Text style={{ fontSize: 15,color:theme.color}}>+ 30</Text>
                                        </View>
                                    </NeuButton>
                                    <View style={{justifyContent: "center", alignItems: "center",width: 60, height: 60 }}>
                                        <FlatList
                                            data={[1, 5, 10]}
                                            showsVerticalScrollIndicator={false}
                                            initialScrollIndex={1}
                                            pagingEnabled={true}
                                            renderItem={({ item }) => {
                                                return (
                                                    <NeuButton
                                                        onPress={() => plusTime(item)}
                                                        color={theme.newButton}
                                                        width={40} height={40}
                                                        borderRadius={22.5}
                                                        style={{ margin: 10}}
                                                    >
                                                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                                            <Text style={{ fontSize: 15,color:theme.color}}>+ {item}</Text>
                                                        </View>
                                                    </NeuButton>
                                                )
                                            }}
                                            keyExtractor={(item, index) => index.toString()}
                                        />
                                    </View>
                                </View>
                                <NeuButton
                                    onPress={ submit }
                                    style={{ marginTop: 25, marginHorizontal: 25}}
                                    color={theme.newButton}
                                    width={width - 80} height={55}
                                    borderRadius={30}
                                >
                                    <Text style={{ color: theme.color}}
                                    >
                                        {
                                            status==="ON" ? LG.theAirConditionerWillTurnOff + ": " + parseDate(new Date((new Date()).getTime() + time)).timeString +"' ?" :
                                                LG.theAirConditionerWillTurnOn + ": " + parseDate(new Date((new Date()).getTime() + time)).timeString + "' ?"

                                        }
                                    </Text>
                                </NeuButton>
                            </View>
                            :
                            <View style={styles.groupSetTime}>
                                <NeuButton
                                    onPress={ () => {
                                        if (!timer.active) return;
                                        const d = time !== 0 ? 0 : 1800000
                                        setTime(d)
                                    }}
                                    color={theme.newButton}
                                    width={90} height={50}
                                    borderRadius={25}
                                >
                                    <Text style={{ textAlign: "center", color: theme.color }}>
                                        { LG.setAgain }
                                    </Text>
                                </NeuButton>
                                <NeuButton
                                    onPress={ cancelTimer }
                                    color={theme.newButton}
                                    width={90} height={50}
                                    borderRadius={25}
                                    style={{ marginLeft: 20}}
                                >
                                    <Text style={{ textAlign: "center", color: theme.color }}>
                                        { LG.cancel } { LG.timer.toLowerCase() }
                                    </Text>
                                </NeuButton>
                            </View>
                    }
                </View>
            </Animated.View>
        </>
    );
};

const style = (setTheme) => {
    const {backgroundColor, button, color} = setTheme;
    return StyleSheet.create({
        frameSetting: {
            position: 'absolute',
            maxHeight: 620,
            width: width - 20,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            marginHorizontal: 10,
            zIndex: 100,
            marginBottom: 15,
        },
        contentModal: {
            borderWidth: 5,
            borderColor: button,
            backgroundColor,
            maxHeight:350,
            borderRadius: 10,
            paddingVertical: 15,
        },
        moveDown:{
            paddingTop: 10,
            paddingBottom: 15,
            width: '100%',
            justifyContent: 'center',
            flexDirection: 'row',
            backgroundColor: 'transparent',
        },
        titleSetTime:{
            fontSize: 20,
            textAlign: "center",
            marginTop: 10,
            color,
        },
        groupSetTime:{
            flexDirection: "row",
            minHeight: 200,
            width: '100%',
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 20
        },
        option: {
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
        },
        icon_option: {
            marginBottom: 15,
        },
        textOption: {
            marginLeft:20,
            fontWeight: '500',
            fontSize: 16,
            paddingVertical: 15,
        },
        textSignOut: {
            fontWeight: '500',
            width: '100%',
            fontSize: 20,
            textAlign: 'center',
            paddingVertical: 15,
        },
        opacity: {
            width: '100%',
            height,
            backgroundColor: '#000',
            position: 'absolute',
            opacity: 0.6,
            zIndex: 5,
        },
        frameClose: {
            backgroundColor,
            marginTop: 10,
            paddingVertical: 15,
            paddingHorizontal: 30,
            alignItems: 'center',
            borderRadius: 10,
        },
    });
}
export default ModelTimer;
