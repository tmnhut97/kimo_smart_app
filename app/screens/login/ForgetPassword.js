import React, {useState, useEffect, useRef} from 'react'
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, BackHandler, Animated, ScrollView} from 'react-native';
import Icons from "react-native-vector-icons/dist/FontAwesome";
import {NeuButton, NeuView} from '../NeuView';
import useAnimatedCallback from "../../animated/useAnimatedCallback";
import {useNavigation} from "@react-navigation/native";
import {useDispatch, useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import {getCertFs, getItemLocalStore, isJsonString} from '../../mFun';
import {setToast} from "../../redux/reducer/toastReducer";
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import {server} from '../../Socket';
import Kohana from '../InputCustom/Kohana';
const initData = {
    email: '', pass: ''
}
const ForgetPW = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation()
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) =>  state.themes.theme)
    const styles = style(theme)
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
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
    const wsRegister = useRef(null)
    const tOut = useRef(null)
    const [data, setData] = useState(initData);
    const [rePass, setRePass] = useState('');
    const [ verifyCode, setVerifyCode ] = useState('')
    const [ codeConfirm, setCodeConfirm ] = useState('')
    const [ name, setName ] = useState('')
    const getVerifyCode = async () => {
        const { ip, port, wss, ca} = await server()
        let h = 'ws://'
        if (wss) h = 'wss://'
        const url = `${h}${ip}:${port}`
        // wsRegister.current = new WebSocket(url, [], { ca });
        wsRegister.current = new WebSocket(url );
        wsRegister.current.onopen = function () {
            try {
                const cmdSend = {};
                cmdSend.cmd = 'getverifycode';
                cmdSend.email = data.email;
                cmdSend.forgetPass = true;
                cmdSend.type = 'CLIENT';
                wsRegister.current.send(JSON.stringify(cmdSend));
            } catch (e) {
                console.log(e)
            }
        };
        wsRegister.current.onclose = function () {
            console.log('wsRegister close')
        }
        wsRegister.current.onmessage = async (evt) => {
            if (!isJsonString(evt.data)) return;
            const { cmd, res, code, msg, type, fullname } = JSON.parse(evt.data)
            if (cmd === 'res' && res === 'getverifycode') {
                if (msg === "OK" && code) {
                    if (fullname) setName(fullname)
                    setCodeConfirm(code)
                    setShowOTP(false)
                    tOut.current = setTimeout( () => {
                        wsRegister.current.close()
                        setShowOTP(true)
                        dispatch(setToast({ show: "ERROR", data: LG.registerExpired }))
                        if (tOut.current) clearTimeout(tOut.current)
                    }, 240000)
                }
                if (msg === "ERROR") {
                    if (type==="email_exits") dispatch(setToast({ show: "ERROR", data: LG.validate.email_exits }))
                    if (type==="email") dispatch(setToast({ show: "ERROR", data: LG.validate.email }))
                    if (type==="email_unknow") dispatch(setToast({ show: "ERROR", data: LG.validate.email_unknow }))
                }
            }
            if (cmd === 'res' && res === 'forgetpass') {
                if (msg === "OK") {
                    dispatch(setToast({show:'SUCCESS', data: LG.newPasswordCreated}))
                    if (wsRegister.current) wsRegister.current.close();
                    if (tOut.current) clearTimeout(tOut.current)
                    navigation.navigate("Login")
                }
                if (msg==="ERROR") {
                    if (type === 'pass') dispatch(setToast({show:'ERROR', data: LG.validate.pass}))
                    if (type === 'email_unknow') dispatch(setToast({show:'ERROR', data: LG.validate.email_unknow}))
                }
            }
        }
    }
    const forgetPass = () => {
        if (rePass !== data.pass) {
            return dispatch(setToast({
                show: 'ERROR',
                data: LG.confirmYourPasswordDoesntMatchTheOneAbove,
            }));
        }
        if (parseInt(codeConfirm) !== parseInt(verifyCode)) return  dispatch(setToast({show:'ERROR', data:LG.authenticationCodeIsIncorrect}))
        const cmdSend = {
            newpass: data.pass,
            email: data.email,
        }
        cmdSend.cmd = 'forgetpass';
        cmdSend.type = 'CLIENT';
        if (!wsRegister.current || wsRegister.current.readyState !== 1) {
            dispatch(setToast({show:'ERROR', data: LG.validate.errorOccurred}))
            return setShowOTP(true)
        }
        return wsRegister.current.send(JSON.stringify(cmdSend));
    }
    useEffect( () => {
        if (showOTP && wsRegister.current) {
            wsRegister.current.close(); wsRegister.current=null;
            if (tOut.current) clearTimeout(tOut.current)
        }
    }, [showOTP])
    return (
        <Animated.View style={[styles.body, {left}]}>
            <View style={styles.header}>
                <NeuButton
                    onPress={() => {
                        if (!showOTP) return setShowOTP(true)
                        Out()
                    }}
                    color={theme.newButton}
                    width={48} height={48}
                    borderRadius={24}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
            </View>
            <ScrollView>
                {showOTP ?
                    <View style={styles.frame_content}>
                        <Text style={styles.title_forget_pass}>{LG.reissuePassword}</Text>
                        <NeuButton
                            active={true}
                            style={{marginTop: 30}}
                            color={theme.newButton}
                            width={width - 60} height={55}
                            borderRadius={15}
                        >
                            <Kohana
                                selectionColor={theme.iconInput}
                                style={styles.ip}
                                label={LG.email}
                                iconClass={MaterialCommunityIcons}
                                iconName={'email'}
                                inputPadding={16}
                                iconColor={theme.iconInput}
                                labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                                useNativeDriver
                                inputStyle={{color: theme.color}}
                                keyboardType={'email-address'}
                                value={data.email}
                                onChangeText={email => setData({...data, ...{email}})}
                                placeholder={LG.input +LG.email}
                                placeholderTextColor={'transparent'}
                            />
                        </NeuButton>
                        <View style={styles.groupActionOTP}>
                            <NeuButton
                                onPress={getVerifyCode}
                                color={theme.newButton}
                                width={width - 60} height={60}
                                borderRadius={30}
                            >
                                <Text style={{color:theme.color, fontSize:20, fontWeight:'700'}}>{LG.getVerifyCode}</Text>
                            </NeuButton>
                        </View>
                    </View>
                    :
                    <View style={styles.frame_content}>
                        <Text style={{fontSize: 20, textAlign: 'center', color:theme.color}}>{LG.sayHello}</Text>
                        <Text style={{marginTop: 15, fontSize: 30, textAlign: 'center',color:theme.color}}>{name}</Text>
                        <NeuButton
                            active={true}
                            style={{marginTop: 20}}
                            color={theme.newButton}
                            width={width - 40} height={55}
                            borderRadius={15}
                        >
                            <Kohana
                                selectionColor={theme.iconInput}
                                style={styles.ip}
                                label={LG.verifyCode}
                                iconClass={MaterialCommunityIcons}
                                iconName={'code-equal'}
                                iconColor={theme.iconInput}
                                inputPadding={16}
                                labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                                useNativeDriver
                                inputStyle={{color: theme.color}}
                                keyboardType={'phone-pad'}
                                value={verifyCode.toString()}
                                onChangeText={verifyCode => setVerifyCode(verifyCode)}
                                placeholder={LG.input +LG.verifyCode}
                                placeholderTextColor={'transparent'}
                            />
                        </NeuButton>
                        <NeuButton
                            active={true}
                            style={{marginTop: 20}}
                            color={theme.newButton}
                            width={width - 40} height={55}
                            borderRadius={15}
                        >
                            <Kohana
                                selectionColor={theme.iconInput}
                                style={styles.ip}
                                label={LG.newPassword}
                                iconClass={MaterialCommunityIcons}
                                iconName={'lock'}
                                iconColor={theme.iconInput}
                                inputPadding={16}
                                labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                                useNativeDriver
                                inputStyle={{color: theme.color}}
                                value={data.pass}
                                onChangeText={pass => setData({...data, ...{pass}})}
                                placeholder={LG.input +LG.newPassword}
                                placeholderTextColor={'transparent'}
                            />
                        </NeuButton>
                        <NeuButton
                            active={true}
                            style={{marginTop: 20}}
                            color={theme.newButton}
                            width={width - 40} height={55}
                            borderRadius={15}
                        >
                            <Kohana
                                selectionColor={theme.iconInput}
                                style={styles.ip}
                                label={LG.rePassword}
                                iconClass={MaterialCommunityIcons}
                                iconName={'lock'}
                                iconColor={theme.iconInput}
                                inputPadding={16}
                                labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                                useNativeDriver
                                inputStyle={{color: theme.color}}
                                value={rePass}
                                onChangeText={rePass => setRePass(rePass)}
                                placeholder={LG.input +LG.rePassword}
                                placeholderTextColor={'transparent'}
                            />
                        </NeuButton>

                        <NeuButton
                            onPress={ forgetPass }
                            style={{marginTop: 25}}
                            // onPress={registerAccount}
                            color={theme.newButton}
                            width={width - 40} height={55}
                            borderRadius={30}
                        >
                            <Text style={styles.txtLogin}
                            >
                                {LG.confirm}
                            </Text>
                        </NeuButton>
                    </View>
                }
            </ScrollView>
        </Animated.View>
    )
}
const width = Dimensions.get('window').width;
const style = (setTheme) => {
    const {color, backgroundColor, newButton} = setTheme
    return StyleSheet.create({
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
            marginTop:20,
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
            paddingVertical: 10,
            marginTop: '30%',
            width: width - 60,
            color,
            alignSelf: 'center',
            alignItems: 'center',
            borderRadius: 10,
        },
        title_forget_pass: {
            fontSize: 24,
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
export default ForgetPW
