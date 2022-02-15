import React, {useEffect, useState} from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    BackHandler,
    ScrollView,
    Keyboard,
    Alert
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import {NeuButton} from '../NeuView';
import MaterialCommunityIcons from "react-native-vector-icons/dist/MaterialCommunityIcons";
import useAnimatedCallback from "../../animated/useAnimatedCallback";
import CheckBox from "@react-native-community/checkbox";
import {isJsonString, parseDate} from "../../mFun";
import {emitDeleteUser, emitEditAccount, wsListenerMessage, wsRemoveListenerMessage} from "../../Socket";
import {setToast} from "../../redux/reducer/toastReducer";
import Kohana from '../InputCustom/Kohana';
const {width, height} = Dimensions.get('screen');

const ViewShareDevice = ({ route }) => {
    const { item } = route.params
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) => state.themes.theme);
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;

    useEffect( () => { animStart.start(); }, [])
    const Out = () => {
        animStop.start(()=> navigation.goBack())
        return true
    }
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', Out);
        return () =>
            BackHandler.removeEventListener('hardwareBackPress', Out);
    }, []);
    const styles = style(theme);
    const [showModelChooseDevice, setShowModelChooseDevice] = useState(false)
    const [ devicesShare, setDevicesShare ] = useState([])
    const [ email, setEmail ] = useState('')
    const [ dateStart, setDateStart ] = useState(new Date())
    const [ dateEnd, setDateEnd ] = useState(null)
    const devices = useSelector(state => state.devices.list);

    const deleteUser = () => {
        Alert.alert(
            LG.USER_DELETED,
            LG.youDontWantToSeeThisAccountAnymore,
            [
                {
                    text: LG.cancel,
                    style: "cancel"
                },
                {
                    text: LG.oke,
                    onPress: () => emitDeleteUser( item._id)
                }
            ],
            {cancelable: false}
        );
    }
    const editAccountShare = () => {
        Alert.alert(
            LG.recoverAccount,
            LG.youWantToRecoverThisAccount,
            [
                {
                    text: LG.cancel,
                    style: "cancel"
                },
                {
                    text: LG.oke,
                    onPress: () => emitEditAccount( { id: item._id,status: 'active'})
                    // onPress: () => emitDeleteUser( item._id)
                }
            ],
            {cancelable: false}
        );
    }
    const lis = (evt) => {
        if (!isJsonString(evt.data)) return;
        const { cmd, res, msg, userid:uid, info } = JSON.parse(evt.data)
        if (cmd === 'res' && res === 'edituser') {
            if (msg === "OK") {
                dispatch(setToast({show:'SUCCESS', data:LG.success}))
                navigation.goBack()
            }
            if (msg==="ERROR") {
                dispatch(setToast({show:'ERROR', data:LG.errorOccurred}))
            }
        }
        if (cmd === 'res' && res === 'deleteuser') {
            if (msg === "OK") {
                navigation.goBack()
            }
            if (msg==="ERROR") {
                dispatch(setToast({show:'ERROR', data:LG.errorOccurred}))
            }
        }
    }
    useEffect( () => {
        wsListenerMessage(lis)
        return () => wsRemoveListenerMessage(lis)
    }, [])

    useEffect( () => {
        if (item) {
            const { startuse, enduse, fullname, devs } = item
            if (fullname) setEmail(fullname.substr(2))
            if (startuse) setDateStart(new Date(startuse))
            if (enduse) setDateEnd(new Date(enduse))
            if (devs) setDevicesShare(devs)
        }
    }, [item])
    const deviceSelectedName = devicesShare.map(({name}) => name).join(', ') || ''
    return (
        <Animated.View style={[styles.frameTheme, {left}]}>
            <View style={styles.header}>
                <NeuButton
                    onPress={Out}
                    color={theme.newButton}
                    width={40} height={40}
                    borderRadius={22.5}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
                <Text style={{
                    fontSize: 24,
                    color: theme.color,
                    fontWeight: 'bold'
                }}>
                    {LG.sharingInformation}
                </Text>
                <View style={{ width: 45}}/>
            </View>
            <View style={{ flex: 1}}>
                <ScrollView>
                    <View style={{paddingHorizontal: 20, width: '100%'}}>
                        <NeuButton
                            active={true}
                            style={{marginTop: 30}}
                            color={theme.newButton}
                            width={width - 60} height={60}
                            borderRadius={15}
                        >
                            <Kohana
                                style={styles.ip}
                                label={LG.email}
                                iconClass={MaterialCommunityIcons}
                                iconName={'email'}
                                iconColor={theme.iconInput}
                                inputPadding={16}
                                labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                                useNativeDriver
                                inputStyle={{color:theme.color}}
                                value={email}
                                editable={true}
                                onFocus={() => Keyboard.dismiss()}
                            />
                        </NeuButton>
                        <NeuButton
                            onPress={ () => {
                                if (!devices.length) return dispatch(setToast({ show: 'WARNING', data: LG.youDontHaveADeviceToShare}))
                                setShowModelChooseDevice(true)
                            }}
                            active={true}
                            style={{marginTop: 30}}
                            color={theme.newButton}
                            width={width - 60} height={60}
                            borderRadius={15}
                        >
                            <Kohana
                                editable={true}
                                style={styles.ip}
                                label={LG.chooseDevicesShare}
                                iconClass={MaterialCommunityIcons}
                                iconName={'tablet'}
                                iconColor={theme.iconInput}
                                inputPadding={16}
                                labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                                useNativeDriver
                                multiline={true}
                                inputStyle={{color:theme.color}}
                                value={deviceSelectedName}
                                onFocus={() => Keyboard.dismiss()}
                            />
                        </NeuButton>
                        <View style={{ marginTop: 30, width: width - 70,padding: 10,borderRadius:5 , backgroundColor: theme.button }}>
                            <TouchableOpacity
                                onPress={ () => {
                                    const d = dateStart !== null ? null : new Date()
                                }}
                                style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "flex-start"}}>
                                <CheckBox
                                    disabled={true}
                                    value={dateStart!==null}
                                    tintColors={{true: '#F15927', false: theme.color}}
                                />
                                <Text style={{ fontWeight: '700',color:theme.color, fontSize: 14, width: width, textAlign: 'left', }}>{LG.setSharedStartTime}</Text>
                            </TouchableOpacity>
                            {
                                dateStart !==null &&
                                <View style={{flexDirection: 'row',width: width -100, marginTop: 15, justifyContent:"space-between", alignItems: "center"}}>
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "center"}}
                                    >
                                        <Text style={{ fontSize: 12,color:theme.color,  borderRadius: 10, borderWidth: 1, padding: 10}}>{parseDate(dateStart).dateString}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "center"}}
                                    >
                                        <Text style={{ fontSize: 12,color:theme.color,  borderRadius: 10, borderWidth: 1, padding: 10}}>{parseDate(dateStart).timeString}</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>
                        <View style={{ marginTop: 30, width: width - 70,padding: 10,borderRadius:5 , backgroundColor: theme.button }}>
                            <TouchableOpacity
                                style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "flex-start"}}>
                                <CheckBox
                                    disabled={true}
                                    value={dateEnd!==null}
                                    tintColors={{true: '#F15927', false: theme.color}}
                                />
                                <Text style={{ fontWeight: '700',color:theme.color,  fontSize: 14, width: width, textAlign: 'left', }}> {LG.setSharedEndTime}</Text>
                            </TouchableOpacity>
                            {
                                dateEnd !==null &&
                                <View style={{flexDirection: 'row',width: width -100, marginTop: 15, justifyContent:"space-between", alignItems: "center"}}>
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "center"}}
                                    >
                                        <Text style={{ fontSize: 12, color:theme.color, borderRadius: 10, borderWidth: 1, padding: 10}}>{parseDate(dateEnd).dateString}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "center"}}
                                    >
                                        <Text style={{ fontSize: 12, color:theme.color, borderRadius: 10, borderWidth: 1, padding: 10}}>{parseDate(dateEnd).timeString}</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>

                        <NeuButton
                            style={styles.bttLogin}
                            onPress={editAccountShare}
                            color={theme.newButton}
                            width={width - 60} height={60}
                            borderRadius={30}
                        >
                            <Text style={styles.txtLogin}>
                                { LG.recoverAccount}
                            </Text>
                        </NeuButton>
                        <NeuButton
                            style={styles.bttLogin}
                            onPress={deleteUser}
                            color={theme.newButton}
                            width={width - 60} height={60}
                            borderRadius={30}
                        >
                            <Text style={[styles.txtLogin, {color: 'red'}]}>
                                {LG.permanentlyDelete}
                            </Text>
                        </NeuButton>
                        <Text style={{ textAlign: "center", marginTop: 5, color: 'red'}}>
                            { LG.noteViewShareDevice}
                        </Text>
                    </View>
                </ScrollView>
            </View>

        </Animated.View>
    );
};

const style = (setTheme) => {
    const {color, backgroundColor, newButton} = setTheme;
    return StyleSheet.create({
        frameTheme: {
            width,
            height,
            backgroundColor,
            paddingHorizontal: 15,
            position: 'absolute'
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
            justifyContent: 'space-between',
            height: 70,
            width,
        },
        bttLogin: {
            marginTop: 25,
        },
        txtLogin: {
            color,
            fontWeight: '700',
            fontSize: 20,
            alignSelf: 'center',
            textAlignVertical: 'center'
        },
        ip: {
            backgroundColor: newButton,
            width: '100%',
            borderRadius: 15,
        },
    });
};
export default ViewShareDevice;
