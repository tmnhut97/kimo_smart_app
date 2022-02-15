import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    BackHandler,
    Animated,
    FlatList,
    Alert, LayoutAnimation
} from "react-native";
import Icons from "react-native-vector-icons/dist/FontAwesome";
import {useNavigation} from "@react-navigation/native";
import {useDispatch, useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import useAnimatedCallback from "../../../../animated/useAnimatedCallback";
import {NeuButton, NeuView} from "../../../NeuView";
import {setToast} from "../../../../redux/reducer/toastReducer";
import {
    emitAddDevToUser,
    emitDeleteDev,
    emitShareDevToUser,
    wsListenerMessage,
    wsRemoveListenerMessage
} from "../../../../Socket";
import {isJsonString} from "../../../../mFun";
import IconMaterialCommunity from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/dist/FontAwesome5";
import Kohana from '../../../InputCustom/Kohana';
const ShareDeviceWithEmail = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation()
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) =>  state.themes.theme)
    const styles = style(theme)
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
    const devId = useSelector(state => state.devices.idCurrent)
    const userId = useSelector(state => state.userIdCurrent)
    useEffect(() => {
        animStart.start();
    }, []);
    const Out = () => {
        animStop.start(() => navigation.goBack())
        return true
    }
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', Out);
        return () =>
            BackHandler.removeEventListener('hardwareBackPress', Out);
    }, []);
    const [showOTP, setShowOTP] = useState(true)
    const [email, setEmail] = useState('');

    const [ shared, setShared ] = useState([])
    const lisShareDev = (evt) => {
        if (!isJsonString(evt.data)) return;
        const { cmd, res, msg, typeshare, userid ,ctrls} = JSON.parse(evt.data)
        if (
            cmd === "res" && res === "sharedevtouser" &&
            typeshare === "share" && userid===userId
        ) {
            if (msg === "OK") {
                dispatch(setToast({show: "SUCCESS", data: LG.success}))
                navigation.goBack()
            }
            if (msg === "DEV_UNKNOW") dispatch(setToast({show: "ERROR", data: LG.validate.DEV_UNKNOW}))
            if (msg === "USER_UNKNOWN") dispatch(setToast({show: "ERROR", data: LG.validate.USER_UNKNOWN}))
            if (msg === "ERROR") dispatch(setToast({show: "ERROR", data: LG.validate.errorOccurred}))
        }
        if (
            cmd === "res" && res === "sharedevtouser"
            && typeshare === "get" && msg === "OK"
        ) {
            if (ctrls) setShared(ctrls)
        }
        if (
            cmd === "res" && res === "deletedev" && msg === "OK"
        ) {
            emitShareDevToUser(null, devId, null, 'get')
        }

    }
    const submit = () => {
        if (!email.length) return dispatch(setToast({ show: "ERROR", data: LG.validate.email }))
        emitShareDevToUser(email, devId, 'share', 'share')
    }

    const deleteCtrl = (item) => {
        Alert.alert(
            LG.delete,
            LG.doYouWantToRemoveUserFromTheDevice,
            [
                {
                    text: LG.cancel,
                    style: "cancel"
                },
                {   text: LG.oke,
                    onPress: () => {
                        emitDeleteDev(item.devid, item.user._id)
                    }}
            ],
            { cancelable: false }
        );
    }
    useEffect( () => {
        emitShareDevToUser(null, devId, null, 'get')
        wsListenerMessage(lisShareDev)
        return () => {
            wsRemoveListenerMessage(lisShareDev)
        }
    }, [])

    return (
        <Animated.View style={[styles.body, {left}]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    if (!showOTP) return setShowOTP(true)
                    Out()
                }}>
                    <NeuView
                        customLightShadow={'#FFFFFF'}
                        customDarkShadow={'#e3e3e3'}
                        color={theme.itemDevice.backgroundItem}
                        width={45} height={45} borderRadius={25}>
                        <Icons name="arrow-left" size={15} color={theme.color}/>
                    </NeuView>
                </TouchableOpacity>
            </View>
            <View style={styles.frame_content}>
                <NeuButton
                    active={true}
                    style={{marginTop: 30}}
                    color={theme.newButton}
                    width={width - 60} height={55}
                    borderRadius={15}
                >
                    <Kohana
                        style={styles.ip}
                        label={LG.emailOrPhone}
                        iconClass={MaterialCommunityIcons}
                        iconName={'email'}
                        iconColor={theme.iconInput}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        inputStyle={{color: theme.color}}
                        keyboardType={'email-address'}
                        value={email}
                        onChangeText={email => setEmail(email)}
                    />
                </NeuButton>
                <View style={styles.groupActionOTP}>
                    <NeuButton
                        onPress={ submit }
                        color={theme.newButton}
                        width={width - 60} height={60}
                        borderRadius={30}
                    >
                        <Text style={{color:theme.color, fontSize:20, fontWeight:'700'}}>
                            {LG.shareNow}
                        </Text>
                    </NeuButton>
                </View>
            </View>
            <View style={styles.groupTitleDoor}>
                <View style={styles.symbolItem}/>
                <Text style={styles.titleControlDoor}>{LG.shared}</Text>
            </View>
            <View style={{ flex: 1, paddingVertical: 10}}>
                <FlatList
                    data={shared}
                    renderItem={ ({ item }) => {
                        const { role, user } = item
                        const textRole = role === 'admin' && "Admin" ||
                                         role === 'use' && LG.use ||
                                         role === 'share' && LG.shading || ""
                        return (
                            <NeuView
                                animatedDisabled={true}
                                customLightShadow={'#FFFFFF'}
                                customDarkShadow={'#E3E3E3'}
                                borderRadius={10}
                                width={width}
                                height={60}
                                color={theme.itemDevice.backgroundItem}
                                style={{ paddingVertical: 10}}
                            >
                                <View
                                    style={{
                                        height: '100%',
                                        width,backgroundColor: theme.backgroundColor,marginTop: 10,
                                        paddingVertical: 5, paddingHorizontal: 20,
                                        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                                    }}
                                    >
                                    <View style={{ justifyContent: "space-between"}}>
                                        {user.email &&
                                            <View style={{ flexDirection: "row", }}>
                                                <IconMaterialCommunity name={'email'} color={theme.color} size={20}/>
                                                <Text style={{ fontWeight: '700', marginLeft: 10, color: theme.color }}>
                                                    { user.email}
                                                </Text>
                                            </View>
                                        }
                                        {
                                            user.phone &&
                                            <View style={{ flexDirection: "row", marginTop: 5}}>
                                                <IconMaterialCommunity name={'phone'} color={theme.color} size={20}/>
                                                <Text style={{ fontWeight: '700', marginLeft: 10, color: theme.color }}>
                                                    { user.phone }
                                                </Text>
                                            </View>
                                        }
                                        {
                                            user.username &&
                                            <View style={{ flexDirection: "row"}}>
                                                <IconMaterialCommunity name={'account'} color={theme.color} size={20}/>
                                                <Text style={{ fontWeight: '700', marginLeft: 10, color: theme.color }}>
                                                    { user.username }
                                                </Text>
                                            </View>
                                        }
                                    </View>
                                    <Text style={{
                                        marginHorizontal: 20,
                                        backgroundColor: theme.button,
                                        color: theme.color,
                                        padding: 5, borderRadius: 8
                                    }}>{textRole}</Text>
                                    <TouchableOpacity
                                        onPress={() => deleteCtrl(item)}
                                    >
                                        <Icon name={'trash'} size={20} color={'red'}/>
                                    </TouchableOpacity>
                                </View>
                            </NeuView>
                        )
                    }}
                    keyExtractor={(item, index) => index.toString()}
                />

            </View>
        </Animated.View>
    )
}
const width = Dimensions.get('window').width;
const style = (setTheme) => {
    const {color, backgroundColor, button, input, newButton} = setTheme
    return StyleSheet.create({
        groupTitleDoor: {
            paddingHorizontal: 15,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 50,
        },
        symbolItem: {
            borderTopLeftRadius: 3,
            borderBottomLeftRadius: 3,
            height: 30,
            width: 6,
            backgroundColor: color,
            marginRight: 10,
        },
        titleControlDoor: {
            fontWeight: 'bold',
            fontSize: 22,
            color,
        },
        txtLogin: {
            color,
            fontWeight: '700',
            fontSize: 20,
            alignSelf: 'center',
            textAlignVertical: 'center',
        },
        body: {
            flex: 1,
            backgroundColor,
        },
        rectangle: {
            position: 'absolute',
            height: '40%',
            width: 120,
            backgroundColor: '#FFF'
        },
        header: {
            paddingHorizontal: 25,
            paddingVertical: 20
        },
        style_back: {
            height: 40,
            width: 40,
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
        },
        frame_content: {
            paddingHorizontal: 30,
            // marginTop: '30%',
            width: width - 60,
            color,
            alignSelf: 'center',
            alignItems: 'center',
            borderRadius: 10,
        },
        title_forget_pass: {
            fontSize: 30,
            color,
            fontWeight: 'bold'
        },
        icon_input: {
            position: 'absolute',
            top: 35,
            left: 15
        },
        group_txtInput: {
            flexDirection: 'row',
        },
        phone_user: {
            width: '100%',
            borderBottomWidth: 0.5,
            borderColor: '#8F95AB',
            borderRadius: 10,
            paddingLeft: 60,
            color: "#000",
            fontSize: 20,
            marginTop: 30,
            textAlignVertical: 'center',
        },
        get_otp: {
            marginTop: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
        get_otp_txt: {
            fontWeight: 'bold',
            fontSize: 20,
            color
        },
        underlineStyleBase: {
            width: 40,
            height: 45,
            fontSize: 20,
            borderRadius: 0,
            borderWidth: 0,
            borderBottomWidth: 3,
            color: '#000'
        },

        underlineStyleHighLighted: {
            borderColor: "green",
        },
        ip: {
            backgroundColor: newButton,
            width: '100%',
            borderRadius: 15,
        },
        groupActionOTP:{
            marginTop: 25,
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
        }
    })
}
export default ShareDeviceWithEmail
