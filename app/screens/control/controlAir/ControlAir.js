import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    Easing,
    Vibration,
    BackHandler,
    Dimensions,
    StyleSheet,
    PixelRatio, Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import Iconss from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Icons from 'react-native-vector-icons/dist/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {emitTimer, getDevLogin, sendControl, server, wsListenerMessage, wsRemoveListenerMessage} from '../../../Socket';
import {useNavigation} from '@react-navigation/native';
import Animation from 'lottie-react-native';
import snow from '../../../assets/json/snow.json';
import snow1 from '../../../assets/json/snow1.json';
import dry from '../../../assets/json/dry.json';
import wind1 from '../../../assets/json/wind1.json';
import {NeuButton, NeuView} from '../../NeuView';
import useAnimatedCallback from '../../../animated/useAnimatedCallback';
import {setToast} from '../../../redux/reducer/toastReducer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Setting from './setting/Setting';
import ModelTimer from './timer/ModelTimer';
import {isJsonString, parseDate} from '../../../mFun';
import {setListDevice} from '../../../redux/reducer/deviceReducer';
import LoadingData from '../../LoadingData';
import Svg, {Path} from 'react-native-svg';
import BackgroundService from "../../../BackgroundService";
import {check, PERMISSIONS, request} from "react-native-permissions";
import NetInfo from "@react-native-community/netinfo";
const {width} = Dimensions.get('screen');
const arrColorTemp = {
    16: '#62b9f3',
    17: '#71B3DE',
    18: '#83ADC3',
    19: '#92A7AC',
    20: '#A3A294',
    21: '#B49C7B',
    22: '#C59663',
    23: '#D88F47',
    24: '#E68A32',
    25: '#F4851D',
    26: '#F48312',
    27: '#DE871A',
    28: '#C48B24',
    29: '#A78F30',
    30: '#929238',
    31: '#7B9641',
    32: '#5B9B4D',
    33: '#479E55',
    34: '#32A15D',
    35: '#1DA466',
};
const AC_MODE = {
    COOL: 'COOL',
    DRY: 'DRY',
    FAN1: 'FAN1',
    FAN2: 'FAN2',
    FAN3: 'FAN3',
};
const USER_MODE = {
    AUTO: 'AUTO',
    MANUAL: 'MANUAL',
};
const RS = PixelRatio.getPixelSizeForLayoutSize(width);
const ControlAir = () => {
    const dispatch = useDispatch();
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
    useEffect(() => {
        animStart.start();
    }, []);
    const Out = () => {
        animStop.start(() => navigation.navigate('Device'));
        return true;
    };
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', Out);
        return () =>
            BackHandler.removeEventListener('hardwareBackPress', Out);
    }, []);
    const navigation = useNavigation();
    const devId = useSelector(state => state.devices.idCurrent);
    const userId = useSelector(state => state.userIdCurrent);
    const devCurrent = useSelector(state => {
        const f = state.devices.list.find(({id}) => id === devId)
        if (!f) return navigation.navigate('Device')
        return f
    });
    const [data, setData] = useState(null);
    const [showBar, setShowBar] = useState(false);
    const nameAcMode = useCallback(() => {
        const mode = data.acmode;
        const modes = Object.values(AC_MODE);
        if (!mode || !modes.includes(mode)) {
            return 'refresh';
        }
        if (mode === AC_MODE.COOL) {
            return {icon: 'snowflake', title: LG.coolingMode, wind: dry};
        }
        if (mode === AC_MODE.DRY) {
            return {icon: 'water-outline', title: LG.reduceHumidity, wind: dry};
        }
        if (mode === AC_MODE.FAN1) {
            return {icon: 'fan-speed-1', title: '1', wind: wind1};
        }
        if (mode === AC_MODE.FAN2) {
            return {icon: 'fan-speed-2', title: '2', wind: wind1};
        }
        if (mode === AC_MODE.FAN3) {
            return {icon: 'fan-speed-3', title: '3', wind: wind1};
        }
    }, [data]);
    const actionPower = useCallback(() => {
        data.usermode === USER_MODE.AUTO && actionUserMode();
        Vibration.vibrate(10);
        if (data.status === 'OFF') {
            return sendControl(devId, 'pon');
        } else {
            return sendControl(devId, 'poff');
        }
    }, [data]);
    const actionInc = useCallback(() => {
        if (data.acmode !== AC_MODE.COOL) {
            return dispatch(setToast({
                show: 'WARNING',
                data: LG.youAreInFanMode + ' ' + nameAcMode().title,
            }));
        }
        if (data.usermode !== USER_MODE.MANUAL) {
            return dispatch(setToast({
                show: 'WARNING',
                data: LG.youNeedToSwitchBackToMode + 'MANUAL',
            }));
        }
        if (data.tctrl >= 30 || data.tctrl <= 14) {
            return;
        }
        Vibration.vibrate(10);
        sendControl(devId, 'inc');
    }, [data]);
    const actionDec = useCallback(() => {
        if (data.acmode !== AC_MODE.COOL) {
            return dispatch(setToast({
                show: 'WARNING',
                data: LG.youAreInMode + nameAcMode().title,
            }));
        }
        if (data.usermode !== USER_MODE.MANUAL) {
            return dispatch(setToast({
                show: 'WARNING',
                data: LG.youNeedToSwitchBackToMode + 'MANUAL',
            }));
        }
        if (data.tctrl <= 16) {
            return;
        }
        Vibration.vibrate(10);
        sendControl(devId, 'dec');
    }, [data]);
    const actionUserMode = useCallback(() => {
        sendControl(devId, 'usermode');
        Vibration.vibrate(10);
    }, [data]);
    const actionAcMode = useCallback(() => {
        if (data.usermode !== USER_MODE.MANUAL) {
            return dispatch(setToast({show: 'WARNING',data: LG.youAreInMode + " "  +'AUTO'}));
        }
        Vibration.vibrate(10);
        sendControl(devId, 'acmode');
    }, [data]);

    const actionPir = () => {
        sendControl(devId, 'pirmode');
        Vibration.vibrate(10);
    }
    const valueWHDefault = useRef(new Animated.Value(0)).current;
    const animatedActionOff = Animated.timing(valueWHDefault, {
        toValue: 1, duration: 300, easing: Easing.linear,
        useNativeDriver: false,
    });
    const animatedActionOn = Animated.timing(valueWHDefault, {
        toValue: 0, duration: 300, easing: Easing.linear,
        useNativeDriver: false,
    });

    const valueWH = valueWHDefault.interpolate({
        inputRange: [0, 1],
        outputRange: [RS > 480 ? 340 : 300, RS > 480 ? 170 : 150],
    });

    useEffect(() => {
        if (!devCurrent) { return }
        const {troom, tctrl, name, acmode, usermode, rssi, status, role, pirmode} = devCurrent;
        if (status && status === 'ON') {
            animatedActionOn.start();
        } else {
            animatedActionOff.start();
        }
        const temp = {};
        if (role) { (temp.role = role);}
        if (rssi) {  (temp.rssi = rssi);}
        if (name) { (temp.name = name);}
        if (tctrl) { temp.tctrl = tctrl;}
        if (acmode) { temp.acmode = acmode; }
        if (troom) { temp.troom = troom;}
        if (status) { temp.status = status; }
        if (usermode) { temp.usermode = usermode;}
        temp.pirmode = (pirmode && pirmode===1) ? 1 : 0
        const n = {...data, ...temp};
        setData({...n});
        return () => {
            if (animatedActionOff) {
                animatedActionOff.stop();
            }
            if (animatedActionOn) {
                animatedActionOn.stop();
            }
        };
    }, [devCurrent]);

    const [timer, setTimer] = useState({active: false});
    useEffect(() => {
        emitTimer(devId, 'get');
        const lisTimer = (evt) => {
            if (!isJsonString(evt.data)) {  return;}
            const {cmd, res, typetimer, devid, devtype, timer: rtimer, userid: uid, devids, msg} = JSON.parse(evt.data);
            if (
                cmd === 'res' && res === 'timerdev' && typetimer === 'get' &&
                devid === devId && devtype === 'ACC'
            ) {
                if (rtimer) {
                    setTimer(rtimer);
                }
            }
            if (cmd === 'res' && res === 'deletedev' && userId === uid && msg === 'OK') {
                dispatch(setListDevice(devids));
                if (devids && devids.length) {
                    devids.forEach(({id, type}) => {
                        getDevLogin(id, type);
                    });
                }
                navigation.navigate('Device');
            }
        };
        wsListenerMessage(lisTimer);
        return () => wsRemoveListenerMessage(lisTimer);
    }, []);
    const EDisplay = useCallback(() => {
        if (data.status === "logout") return (
            <Text style={{color: 'red', fontSize: 12, textAlign: 'center'}}>
                {LG.unavailable}
            </Text>
        )
        if (data.status === 'OFF') {
            return (
                <TouchableOpacity onPress={actionPower}>
                    <View style={{alignItems: 'center', justifyContent: "center", height: '100%'}}>
                        <Icons name={'power'} size={55} color={'red'} style={{marginHorizontal: 10, paddingBottom: 10}}/>
                        <Text style={{color: theme.color, fontSize: 16, position: "absolute", bottom: 10}}>
                            {data.usermode === USER_MODE.AUTO ? USER_MODE.AUTO : USER_MODE.MANUAL}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }
        return (
            <>
                {(data.acmode === AC_MODE.DRY) ?
                    <Icons style={{position: 'absolute', top: 4}} name={nameAcMode().icon} size={35} color="blue"/> :
                    <Iconss style={{position: 'absolute', top: 4}} name={nameAcMode().icon} size={35} color="blue"/>
                }
                <TouchableOpacity
                    style={styles.display_user_mode}
                    onPress={() => actionUserMode()}
                >
                    <Text style={{color: 'red', fontSize: 25, textAlign: 'center'}}>
                        {data.usermode === USER_MODE.AUTO ? USER_MODE.AUTO : USER_MODE.MANUAL}
                    </Text>
                </TouchableOpacity>
                {(data.acmode === AC_MODE.COOL) ?
                    <Text
                        style={styles.display_temp_txt}
                    >
                        {data.tctrl < 16 ? 'off' : data.tctrl}
                        {data.tctrl >= 16 && <Text style={styles.display_temp_unit}>°C</Text>}
                    </Text> :
                    <Text
                        style={[styles.display_temp_txt, {fontSize: 24}]}
                    >
                        {data.acmode}
                    </Text>

                }
            </>
        );
    }, [data]);
    if (!data) return <LoadingData/>
    const ItemRSSI = () => {
        let icon;
        if (data.rssi < -75) {
            icon = {name: 'signal-cellular-1', color: 'green'};
        } else if (data.rssi < -40) {
            icon = {name: 'signal-cellular-2', color: 'green'};
        } else {
            icon = {name: 'signal-cellular-3', color: 'green'};
        }
        return (
            <View style={styles.frameRSSI}>
                <MaterialCommunityIcons name={icon.name} size={25} color={icon.color}/>
                <Text style={{color: theme.color, marginLeft: 5}}>{data.rssi + ' dBm'}</Text>
            </View>
        );
    };
    return (
        <Animated.View style={[styles.body, {left}]}>
            <View style={styles.header}>
                <NeuButton
                    onPress={Out}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
                <Text style={styles.title_control}>
                    {data.name}
                </Text>

                <NeuButton
                    onPress={() => setShowBar(true)}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'cog'} size={20} color={theme.color}/>
                </NeuButton>
            </View>
            <View style={styles.display_content}>
                <ItemRSSI/>
                {(data.acmode === 'COOL') &&
                <>
                    <Animation
                        style={styles.anim_snow}
                        loop autoPlay
                        source={snow}
                    />
                    <Animation
                        loop autoPlay
                        style={styles.anim_snow1}
                        source={snow1}
                    />
                </>
                }
                <NeuView
                    customLightShadow={'#FFFFFF'}
                    customDarkShadow={'#e3e3e3'}
                    borderRadius={RS > 480 ? 170 : 150}
                    width={RS > 480 ? 340 : 300}
                    height={RS > 480 ? 340 : 300}
                    color={theme.controlAir.displayWP}
                    style={styles.display_wp}>
                    <Animated.View style={[styles.display_wp1, {height: valueWH, width: valueWH}]}>
                        <Animated.View style={[styles.line_space1, {height: valueWH}]}/>
                        <Animated.View style={[styles.line_space2, {height: valueWH}]}/>
                        <TouchableOpacity style={styles.wp_action_inc} onPress={() => actionInc()}>
                            <View style={styles.style_temp}>
                                <Icon name="plus" size={30} color={(data.usermode === USER_MODE.MANUAL && data.acmode === AC_MODE.COOL && data.tctrl < 30) ? theme.color : 'gray'}/>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.wp_action_dec} onPress={actionDec}>
                            <View style={styles.style_temp}>
                                <Icon name="minus" size={30} color={(data.usermode === USER_MODE.MANUAL && data.acmode === AC_MODE.COOL && data.tctrl > 16) ? theme.color : 'gray'}/>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.wp_action_mode} onPress={actionAcMode}>
                            <View style={styles.frame_button_custom}>
                                <Text style={{ color: (data.usermode === USER_MODE.MANUAL) ? 'green' : '#c4c4c4', fontSize: 22, fontWeight: '700'}}>MODE</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.wp_action_power} onPress={actionPower}>
                            <View style={styles.frame_button_custom}>
                                <Icon name={'power-off'} size={30} color={data.status === 'OFF' ? 'gray' : '#db1313'}/>
                            </View>
                        </TouchableOpacity>
                        <View style={[styles.border_c1, {backgroundColor: data.tctrl ? arrColorTemp[data.tctrl] : '#0cd0cd'}]}>
                            <View style={styles.border_c2}>
                                <View style={styles.border_c3}>
                                    <View style={styles.border_c4}>
                                        {EDisplay()}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </NeuView>
            </View>
            <View style={{ paddingHorizontal: 20, paddingBottom:10, flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end'}}>
                <Svg width={141} height={110} viewBox="0 0 141 110" fill="none" >
                    <Path
                        d="M68.951 28.537L24.023 65.826v40.245c0 1.042.41 2.041 1.142 2.778A3.883 3.883 0 0027.922 110l27.307-.071a3.885 3.885 0 002.745-1.158A3.944 3.944 0 0059.109 106V82.497c0-1.042.41-2.041 1.142-2.778a3.884 3.884 0 012.757-1.151h15.596c1.034 0 2.026.414 2.757 1.15a3.944 3.944 0 011.142 2.779v23.486a3.952 3.952 0 001.138 2.786 3.877 3.877 0 002.761 1.155L113.7 110a3.883 3.883 0 002.757-1.151 3.945 3.945 0 001.142-2.778V65.799l-44.92-37.262a2.957 2.957 0 00-3.728 0zm70.97 25.345L119.548 36.96V2.947a2.96 2.96 0 00-.856-2.084A2.914 2.914 0 00116.624 0h-13.646c-.776 0-1.52.31-2.068.863a2.956 2.956 0 00-.857 2.084v17.83L78.236 2.69A11.642 11.642 0 0070.803.003c-2.711 0-5.338.95-7.432 2.686L1.686 53.882a2.942 2.942 0 00-1.048 1.993 2.968 2.968 0 00.658 2.157l6.214 7.612a2.93 2.93 0 001.978 1.061 2.904 2.904 0 002.143-.66l57.32-47.576a2.957 2.957 0 013.729 0l57.323 47.575a2.91 2.91 0 004.118-.393l6.214-7.612a2.955 2.955 0 00.65-2.166 2.95 2.95 0 00-1.064-1.991z"
                        fill={arrColorTemp[parseInt(data.troom)]}
                    />
                    <Path fill={arrColorTemp[parseInt(data.troom)]} d="M53.6937 68.5715H87.9315V110.0001H53.6937z" />
                    <View style={{position:'absolute', left:40, top:65, flexDirection: "row" }}>
                        <Text style={{fontSize:34, fontFamily: 'Digital-7', color: "#FFF",}}>
                            {(data.troom).toFixed(1)}
                        </Text>
                        <Text style={{color: "#FFF", fontSize: 18}}>°C</Text>
                    </View>
                </Svg>
                <View style={{flexDirection:'row', justifyContent:'space-around', flexGrow:1}}>
                    <NeuButton
                        onPress={actionPir}
                        color={theme.newButton}
                        width={140} height={48}
                        borderRadius={15}
                        backgroundColor={theme.backgroundColor}
                    >
                        <View style={{
                            opacity: data.pirmode ? 1 : 0.3,
                            flexDirection: "row", justifyContent: "space-evenly", alignItems: "center",
                        }}>
                            <View>
                                <Svg width={33} height={30} viewBox="0 0 33 30" fill="none" >
                                    <Path
                                        d="M9.718 13.66c.948 0 1.716-.828 1.716-1.848s-.768-1.847-1.716-1.847c-.947 0-1.715.827-1.715 1.847s.768 1.848 1.715 1.848zm-5.656 8.523l-.529 1.328h-2.39C.512 23.51 0 24.062 0 24.742s.512 1.232 1.143 1.232h2.768c.687 0 1.307-.44 1.576-1.12l.314-.79-.382-.242c-.618-.393-1.074-.976-1.357-1.64zm9.658-3.598h-1.573l-.931-2.05c-.447-.982-1.267-1.701-2.207-1.96l-2.54-.813c-1.011-.262-2.064-.021-2.889.66l-1.417 1.17c-.501.414-.596 1.186-.211 1.726.384.54 1.101.641 1.602.228l1.419-1.17c.274-.227.623-.308.902-.237l.526.169-1.339 3.363c-.45 1.134-.047 2.463.94 3.09l3.036 1.931-.981 3.376c-.189.649.147 1.34.749 1.543.114.038.229.057.342.057.486 0 .937-.338 1.09-.864l1.131-3.89c.211-.799-.103-1.657-.773-2.092L8.408 21.43l1.119-3.013.724 1.595c.286.629.89 1.035 1.54 1.035h1.93c.63 0 1.143-.552 1.143-1.232 0-.68-.513-1.231-1.144-1.231z"
                                        fill="#1F2C58"
                                    />
                                    <Path d="M25.432 3.16h5.876" stroke="#1F2C58" />
                                    <Path
                                        d="M26.21 8.518L25 1h6.654l-1.21 7.518H26.21z"
                                        stroke="#1F2C58"
                                        strokeLinejoin="round"
                                    />
                                    <Path
                                        d="M28.411 14.36c-2.889 2.521-7.35 2.136-9.963-.86-2.614-2.996-2.391-7.468.498-9.988"
                                        stroke={data.pirmode ? "red" : "gray"}
                                    />
                                    <Path
                                        d="M27 12.843c-2.024 1.766-5.148 1.498-6.977-.599-1.83-2.096-1.671-5.228.353-6.994"
                                        stroke={data.pirmode ? "red" : "gray"}
                                    />
                                    <Path
                                        d="M25.71 11.542c-1.218 1.063-3.12.875-4.249-.419-1.129-1.293-1.056-3.203.161-4.266"
                                        stroke={data.pirmode ? "red" : "gray"}
                                    />
                                </Svg>
                            </View>
                            <Text style={{
                                fontSize: 12, marginLeft: 10,
                                color: data.pirmode ? "blue" : theme.color
                            }}>{ LG.move }</Text>
                        </View>
                    </NeuButton>
                </View>
            </View>
            {showBar && <Setting close={() => setShowBar(false)}/>}
        </Animated.View>
    );
};
const style = (setTheme) => {
    const {color, backgroundColor, button} = setTheme;
    return StyleSheet.create({
        body: {
            flex: 1,
            backgroundColor,
            paddingVertical: 20,
        },
        header: {
            zIndex: 5,
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: 60,
            paddingHorizontal: 15,
            alignItems: 'center',
        },
        display_content: {
            width: '100%',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
        },
        title_setting: {
            flexDirection: 'row',
            width: 70,
            justifyContent: 'space-between',
        },
        anim_snow: {
            top: -50,
            position: 'absolute',
            width: '120%',
            height: '100%',
            justifyContent: 'center',
        },
        anim_snow1: {
            top: 100,
            position: 'absolute',
            width: '120%',
            height: '100%',
            justifyContent: 'center',
        },
        display_wp: {
            shadowRadius: 10,
            borderRadius: RS > 480 ? 170 : 150,
            justifyContent: 'center',
            alignItems: 'center',
        },
        display_user_mode: {
            width: '100%',
            height: '50%',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: '#A2A7A3',
            paddingVertical: 15,
        },
        display_temp_txt: {
            borderColor: '#A2A7A3',
            fontSize: 35,
            fontFamily: 'Digital-7',
            position: 'absolute',
            bottom: 8,
        },
        display_temp_unit: {
            fontFamily: 'arial',
            fontSize: 14,
        },
        display_anim: {
            position: 'absolute',
            width: '100%',
            height: '80%',
            justifyContent: 'center',
        },
        display_wp1: {
            shadowRadius: 10,
            borderRadius: RS > 480 ? 170 : 150,
            backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
        },
        line_space1: {
            position: 'absolute',
            backgroundColor: '#1F2C58',
            width: 1,
            transform: [{rotate: '45deg'}],
        },
        line_space2: {
            position: 'absolute',
            backgroundColor: '#1F2C58',
            width: 1,
            transform: [{rotate: '-45deg'}],
        },
        wp_action_inc: {position: 'absolute', right: 10},
        wp_action_dec: {position: 'absolute', left: 10},
        wp_action_mode: {position: 'absolute', top: 10},
        wp_action_power: {position: 'absolute', bottom: 10},
        border_c1: {
            borderRadius: RS > 480 ? 200 : 90,
            overflow: 'hidden',
            width: RS > 480 ? 200 : 180,
            height: RS > 480 ? 200 : 180,
            justifyContent: 'center',
            alignItems: 'center',
        },
        border_c2: {
            shadowRadius: 1,
            borderRadius: RS > 480 ? 90 : 80,
            backgroundColor: '#e3ecf6',
            width: RS > 480 ? 180 : 160,
            height: RS > 480 ? 180 : 160,
            justifyContent: 'center',
            alignItems: 'center',
        },
        border_c3: {
            borderWidth: 3,
            borderColor: '#A2A7A3',
            shadowRadius: 7,
            borderRadius: RS > 480 ? 80 : 70,
            backgroundColor: '#b5c4a9',
            width: RS > 480 ? 160 : 140,
            height: RS > 480 ? 160 : 140,
        },
        border_c4: {
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            paddingVertical: 11,
            paddingHorizontal: 6,
        },
        frameClock:{
            position:'absolute',
            top:0,
            zIndex:2,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            padding: 20,
            alignItems: 'center',
        },
        txtNotificationTimer: {
            paddingHorizontal: 20,
            backgroundColor: button,
            fontSize: 13,
            fontWeight: '700',
            textAlign: 'center',
            paddingVertical: 5,
            borderRadius: 5,
            color: color,
        },
        wp_bottom: {
            position: 'relative',
            bottom: 0,
            width: '100%',
        },
        title_control: {
            fontSize: 30,
            color,
            fontWeight: 'bold',
        },
        style_cog: {
            height: 40,
            width: 40,
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#eaf3fa',
        },
        profile: {
            marginTop: 20,
            paddingHorizontal: 15,
        },
        name_control: {
            fontSize: 24,
            color: '#31456a',
            fontWeight: 'bold',
        },
        user_name: {
            paddingTop: 10,
            fontSize: 13,
            color: '#31456a',
            fontWeight: 'bold',
        },
        frame_display: {
            borderRadius: (width - 80) / 2,
            width: width - 80,
            marginHorizontal: 35,
            height: width - 80,
            padding: 10,
            backgroundColor: '#e3ecf6',
            marginVertical: 20,
        },
        time: {
            fontFamily: 'Digital-7',
            fontSize: 150,
            textAlign: 'center',
            borderBottomWidth: 1,
            borderColor: '#a6a8a5',
            paddingVertical: 30,
        },
        frame_action: {
            width,
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            flexDirection: 'row',
        },
        frame_button_custom: {
            height: 60,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
        },
        control_temp: {
            flexDirection: 'column',
            width: 70,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
        },
        style_temp: {
            height: 60,
            width: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
        bar_menu: {
            position: 'absolute',
            right: 20,
            bottom: 0,
            zIndex: 3,
        },
        frame_item_menu: {
            position: 'absolute',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: width - 120,
            right: 90,
            bottom: 0,
        },
        style_bars: {
            height: 50,
            width: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#eaf3fa',
        },
        frameRSSI:{
            position:'absolute',
            top:15,
            left:25,
            opacity:0.5,
            zIndex:4,
            alignItems: 'center',
            flexDirection: 'row'
        }
    });
};
export default ControlAir;
