import scanWifi from '../../assets/json/scanwifi.json';
import Animation from 'lottie-react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
    Animated,
    BackHandler,
    Dimensions,
    Keyboard,
    Platform, ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {NeuButton} from '../NeuView';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import useAnimatedCallback from '../../animated/useAnimatedCallback';
import {check, PERMISSIONS, request} from 'react-native-permissions';
import {
    closeSocket,
    reConnectSocket,
} from '../../Socket';
import WifiManager from 'react-native-wifi-reborn';
import {setToast} from '../../redux/reducer/toastReducer';
import { getItemLocalStore} from '../../mFun';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import {Door, IconAir} from '../../assets/imageSVG';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Kohana from '../InputCustom/Kohana';
const {width, height} = Dimensions.get('screen');
const listTypeDevice = [
    {name: 'airConditioner', SSID: 'KM-ACC-SETUP', PASSWORD: ''},
    {name: 'doorAndCamera', SSID: 'KM-DOORCAM-SETUP', PASSWORD: ''},
];
const AddDevice = () => {
    const dispatch = useDispatch();
    const isUserShare = useSelector((state) => state.isUserShare)
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
    const navigation = useNavigation();
    const nextInput = useRef();
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
    useEffect(() => {
        if (isUserShare) {
            dispatch(setToast({ show: 'WARNING', data: LG.sorryThisFunctionIsNotForYou}))
            return navigation.goBack();
        }
        animStart.start();
    }, []);
    const Out = () => {
        animStop.start(() => navigation.goBack());
        return true;
    };
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', Out);
        return () =>
            BackHandler.removeEventListener('hardwareBackPress', Out);
    }, []);
    const [typeDevice, setTypeDevice] = useState(listTypeDevice[0]);
    const [wifihost, setWifihost] = useState('');
    const [wifipass, setWifiPass] = useState('');
    const checkPermissions = async () => {
        const res = await check(
            Platform.select({
                android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
            }),
        );
        if (res === 'granted') {
            return res;
        }
        return await request(
            Platform.select({
                android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
            }),
        );
    };
    const [connectedModule, setConnectedModule] = useState(false);
    const timeOut = useRef(null);
    const setWifi = (wifihost, wifipass) => {
        if (!wifipass.length && !wifihost.length) {
            return dispatch(setToast({
                show: 'WARNING',
                data: LG.pleaseEnterTheFullNameAndYourWiFiPassword,
            }));
        }
        checkPermissions().then(async (r) => {
            if (r === 'granted') {
                if (timeOut.current) {
                    clearTimeout(timeOut.current);
                    timeOut.current = null;
                }
                closeSocket();
                setConnectedModule(true);
                const {SSID, PASSWORD} = typeDevice;
                await WifiManager.setEnabled(true);
                await WifiManager.isRemoveWifiNetwork(SSID);
                await WifiManager.disconnect();
                WifiManager.connectToProtectedSSID(SSID, PASSWORD, false).then(
                    () => {
                        const urlSocketModule = 'ws://192.168.4.1:9753';
                        const wsModule = new WebSocket(urlSocketModule);
                        let status = false;
                        let devIdAdd = null;
                        wsModule.addEventListener('open', function () { });
                        wsModule.addEventListener('message', function (evt) {
                            console.log(evt);
                            const {devid} = JSON.parse(evt.data);
                           if(devid) {
                               devIdAdd = devid;
                               getItemLocalStore('user').then((user) => {
                                   if (user) {
                                       const {account} = user;
                                       status = true;
                                       const cmdSend = {};
                                       cmdSend.cmd = 'setwifi';
                                       cmdSend.wifihost = wifihost;
                                       cmdSend.wifipass = wifipass;
                                       cmdSend.user = account;
                                       if (wsModule.readyState !== 1) {
                                           return console.log(wsModule.readyState);
                                       }
                                       wsModule.send(JSON.stringify(cmdSend));
                                       wsModule.close();
                                   }
                               });
                           }
                        });
                        wsModule.addEventListener('close', function () {
                            if (status) {
                                reConnectSocket(LG, devIdAdd);
                                dispatch(setToast({
                                    show: 'SUCCESS',
                                    data: LG.successfulSetupSubmissionConnectToYourWifi,
                                }));
                            } else {
                                dispatch(setToast({
                                    show: 'ERROR',
                                    data: LG.sendSetupFailed,
                                }));
                            }
                        });
                    }, () => {
                        timeOut.current = setTimeout(() => setWifi(wifihost, wifipass), 3000);
                    },
                );
            } else {
                dispatch(setToast({  show: 'WARNING',  data: LG.youHaveNotGivenLocationAccessToThisAppYet }));
                navigation.navigate('Device');
            }
        });
    };
    useEffect(() => {
        return () => {
            if (timeOut.current) {
                clearTimeout(timeOut.current);
                timeOut.current = null;
            }
            setConnectedModule(false);
            reConnectSocket(LG);
        };
    }, [LG]);
    return (
        <Animated.View
            style={[styles.body, {left}]}>
            {
                connectedModule &&
                <ConnectingModule
                    LG={LG}
                    theme={theme}
                    cancel={() => {
                        setConnectedModule(false);
                        if (timeOut.current) {
                            clearTimeout(timeOut.current);
                            timeOut.current = null;
                        }
                    }}
                />
            }
            <View style={styles.header}>
                <NeuButton
                    onPress={Out}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
            </View>
            <ScrollView
                showsVerticalScrollIndicator={true}
                style={{paddingHorizontal: 30}}>
                <View style={styles.groupTitle}>
                    <Text style={styles.titleAddDevice}>{LG.addDevice}</Text>
                </View>
                <Text style={styles.title}>{LG.chooseTheDeviceType}</Text>
                <View style={{marginTop: 10, flexDirection:'row', justifyContent:'space-between'}}>
                    {
                        listTypeDevice.map((item, i) => {
                            return (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => setTypeDevice(item)}
                                >
                                    <View style={styles.option}>
                                        {item.name === 'airConditioner' ? IconAir : Door}
                                        {typeDevice.name === item.name ?
                                            <FontAwesome5Icon style={{position: 'absolute', right: 10, top: 10}}
                                                              name={'check-circle'} size={25} color={'green'}/>
                                            :
                                            <FontAwesome5Icon style={{position: 'absolute', right: 10, top: 10}}
                                                              name={'circle'} size={25} color={'gray'}/>
                                        }

                                        <Text style={{
                                            marginTop: 5,
                                            color: theme.color,
                                            textAlign: 'center',
                                        }}>{LG[item.name]}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                </View>
                <View>
                    <Text style={styles.title}>{LG.wifiSetting}</Text>
                    <View style={{width , paddingHorizontal:5}}>
                        <NeuButton
                            active={true}
                            style={{marginTop: 20}}
                            color={theme.newButton}
                            width={width - 70} height={55}
                            borderRadius={15}
                        >
                            <Kohana
                                style={styles.ip}
                                label={LG.wifiName}
                                iconClass={MaterialCommunityIcons}
                                iconName={'wifi'}
                                iconColor={theme.iconInput}
                                inputPadding={16}
                                labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                                useNativeDriver
                                value={wifihost}
                                inputStyle={{color: theme.color}}
                                onChangeText={text => setWifihost(text)}
                                returnKeyType={'next'}
                                blurOnSubmit={false}
                                onSubmitEditing={() => nextInput.current.focus()}
                            />
                        </NeuButton>
                        <NeuButton
                            active={true}
                            style={{marginTop: 20}}
                            color={theme.newButton}
                            width={width - 70} height={55}
                            borderRadius={15}
                        >
                            <Kohana
                                ref={(ref) => nextInput.current = ref}
                                style={styles.ip}
                                label={LG.enterTheWifiPassword}
                                iconClass={MaterialCommunityIcons}
                                iconName={'key'}
                                iconColor={theme.iconInput}
                                inputPadding={16}
                                labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                                useNativeDriver
                                value={wifipass}
                                inputStyle={{color: theme.color}}
                                onChangeText={text => setWifiPass(text)}
                                returnKeyType={'done'}
                            />
                        </NeuButton>
                    </View>
                    <View style={{
                        marginVertical: 20,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginHorizontal: 30,
                    }}>
                        <FontAwesome5Icon name={'exclamation-triangle'} color={'#e34b23'} size={30}/>
                        <Text style={{
                            marginLeft: 15,
                            color: theme.color,
                            fontSize: 12,
                            lineHeight: 18,
                        }}>{LG.pleaseEnterYourCorrectHomeWiFiInformationToConnectWithOurDevice}</Text>
                    </View>
                    <NeuButton
                        onPress={() => {
                            Keyboard.dismiss();
                            setWifi(wifihost, wifipass);
                        }}
                        style={{margin:10 }}
                        color={theme.newButton}
                        width={width-80} height={60}
                        borderRadius={30}
                    >
                        <Text style={{color: theme.color, fontWeight: 'bold', textAlign: 'center'}}>{LG.scanTheDevice}</Text>
                    </NeuButton>
                </View>
            </ScrollView>
        </Animated.View>
    );
};

const ConnectingModule = ({cancel, theme, LG}) => {
    return (
        <View style={{
            width: width,
            height: height,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 20,
            position: 'absolute',
            backgroundColor: theme.backgroundColor,
            zIndex: 10,
        }}>
            <Animation
                loop autoPlay
                style={{alignSelf: 'center', width: width, height: 200}}
                source={scanWifi}
            />
            <Text style={{marginTop: 15, color: theme.color}}>{LG.searchDevice}</Text>
            <TouchableOpacity
                style={{marginVertical: 20}}
                onPress={cancel}
            >
                <Text style={{color: theme.color, fontSize: 18}}>{LG.cancel}</Text>
            </TouchableOpacity>
        </View>
    );
};
const style = (setTheme) => {
    const {color, backgroundColor, button, newButton} = setTheme;
    return StyleSheet.create({
        frameClose: {
            backgroundColor,
            marginVertical: 10,
            paddingVertical: 15,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
        },
        frame_bars: {
            position: 'absolute',
            maxHeight: 620,
            width: width - 20,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            marginHorizontal: 10,
            zIndex: 100,
            marginVertical: 10,
        },
        contentModal: {
            backgroundColor,
            borderRadius: 10,
            paddingTop: 15,
            paddingHorizontal: 10,
        },
        body: {
            flex: 1,
            backgroundColor,
        },
        header: {
            paddingHorizontal: 25,
            paddingTop: 20,
            flexDirection: 'row',
        },
        groupTitle: {
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 20,
            marginVertical: 30,
        },
        titleAddDevice: {
            color,
            fontSize: 30,
        },
        title: {
            textTransform: 'uppercase',
            marginTop: 15,
            fontSize: 13,
            color,
            fontWeight: 'bold',
        },
        chooseDevice: {
            borderTopWidth: 0.5,
            borderBottomWidth: 0.5,
            marginVertical: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 10,
            backgroundColor: button,
        },
        groupInput: {
            flexDirection: 'row',
            marginTop: 15,
            width: '100%',
        },
        iconPass: {
            position: 'absolute',
            top: 15,
            right: 15,
        },
        ip: {
            backgroundColor: newButton,
            width: '100%',
            borderRadius: 15
        },
        option: {
            borderRadius: 5,
            backgroundColor: button,
            width: width / 2 - 40,
            height: 120,
            justifyContent: 'center',
            padding: 20,
            alignItems: 'center',
        },
    });
};
export default AddDevice;
