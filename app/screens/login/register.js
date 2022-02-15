import React, {useEffect, useRef, useState} from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    Text,
    BackHandler,
    Animated,
    Dimensions,
    ScrollView,
} from 'react-native';
import {NeuButton} from '../NeuView';
import useAnimatedCallback from '../../animated/useAnimatedCallback';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import {setToast} from '../../redux/reducer/toastReducer';
import { isJsonString} from '../../mFun';
import {server} from "../../Socket";
import Kohana from '../InputCustom/Kohana';
const {width} = Dimensions.get('screen');
const initData = {
    firstname: '',
    lastname: '',
    email: '',
    pass: '',
    phone: '',
};
const Register = () => {
    const wsRegister = useRef(null)
    const tOut = useRef(null)
    const navigation = useNavigation();
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
        animStop.start(() => navigation.goBack());
        return true;
    };
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', Out);
        return () =>
            BackHandler.removeEventListener('hardwareBackPress', Out);
    }, []);
    const rePassRef = useRef(null);
    const [data, setData] = useState(initData);
    const [rePass, setRePass] = useState('');
    const [ verified, setVerified ] = useState(false)
    const [ verifyCode, setVerifyCode ] = useState('')
    const [ codeConfirm, setCodeConfirm ] = useState('')
    const registerAccount = () => {
        if (rePass !== data.pass) {
            return dispatch(setToast({
                show: 'ERROR',
                data: LG.confirmYourPasswordDoesntMatchTheOneAbove,
            }));
        }
        if (data.firstname.length < 2) return  dispatch(setToast({show:'ERROR', data:LG.fullMiddleNameMustBeCharacters}))
        if (!data.lastname.length) return  dispatch(setToast({show:'ERROR', data:LG.confirmYourPasswordDoesntMatchTheOneAbove}))
        if (parseInt(codeConfirm) !== parseInt(verifyCode)) return  dispatch(setToast({show:'ERROR', data:LG.authenticationCodeIsIncorrect}))
        const cmdSend = {
            fullname: data.firstname +' '+ data.lastname,
            pass: data.pass,
            email: data.email,
            phone: data.phone,
        }
        cmdSend.cmd = 'reguser';
        cmdSend.type = 'CLIENT';
        if (!wsRegister.current || wsRegister.current.readyState !== 1) {
            dispatch(setToast({show:'ERROR', data: LG.validate.errorOccurred}))
            return setVerified(false)
        }
        return wsRegister.current.send(JSON.stringify(cmdSend));
    };

    const getVerifyCode = async () => {
        const { ip, port, wss, ca} = await server()
        let h = 'ws://'
        if (wss) h = 'wss://'
        const url = `${h}${ip}:${port}`
        // wsRegister.current = new WebSocket(url, [], { ca });
        wsRegister.current = new WebSocket(url);
        wsRegister.current.onopen = function () {
            try {
                const cmdSend = {};
                cmdSend.cmd = 'getverifycode';
                cmdSend.email = data.email;
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
            const { cmd, res, code, msg, type } = JSON.parse(evt.data)
            if (cmd === 'res' && res === 'getverifycode') {
                if (msg === "OK" && code) {
                    setCodeConfirm(code)
                    setVerified(true)
                    tOut.current = setTimeout( () => {
                        wsRegister.current.close()
                        setVerified(false);
                        dispatch(setToast({ show: "ERROR", data: LG.registerExpired }))
                        if (tOut.current) clearTimeout(tOut.current)
                    }, 240000)
                }
                if (msg === "ERROR") {
                    if (type==="email_exits") dispatch(setToast({ show: "ERROR", data: LG.validate.email_exits }))
                    if (type==="email") dispatch(setToast({ show: "ERROR", data: LG.validate.email }))
                }
            }
            if (cmd === 'res' && res === 'reguser') {
                if (msg === "OK") {
                    dispatch(setToast({show:'SUCCESS', data:LG.accountRegistrationIsSuccessful}))
                    if (wsRegister.current) wsRegister.current.close();
                    if (tOut.current) clearTimeout(tOut.current)
                    navigation.navigate("Login")
                }
                if (msg==="ERROR") {
                    if (type === 'fullname') dispatch(setToast({show:'ERROR', data: LG.validate.fullname}))
                    if (type === 'username') dispatch(setToast({show:'ERROR', data: LG.validate.username}))
                    if (type === 'pass') dispatch(setToast({show:'ERROR', data: LG.validate.pass}))
                    if (type === 'email') dispatch(setToast({show:'ERROR', data:LG.validate.email}))
                    if (type === 'email_exits') dispatch(setToast({show:'ERROR', data:LG.validate.email_exits }))
                    if (type === 'phone_exits') dispatch(setToast({show:'ERROR', data:LG.validate.phone_exits }))
                    if (type === 'username_exits') dispatch(setToast({show:'ERROR', data:LG.validate.username_exits }))
                    if (type === 'phone') dispatch(setToast({show:'ERROR',  data:LG.validate.phone }))
                }
            }
        }
    }
    useEffect( () => {
        if (!verified && wsRegister.current) {
            wsRegister.current.close(); wsRegister.current=null;
            if (tOut.current) clearTimeout(tOut.current)
        }
    }, [verified])
    return (
        <Animated.View style={[styles.body, {left}]}>
            <View style={styles.header}>
                <NeuButton
                    onPress={() => {
                        if (verified) return setVerified(false)
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
                <View style={{paddingHorizontal: 20, paddingBottom: 15, width: '100%'}}>
                    <Text style={{
                        marginVertical: 10,
                        textTransform: 'uppercase',
                        fontSize: 25,
                        color: theme.color,
                        fontWeight: '700',
                    }}>{LG.register}</Text>
                    {   !verified ?
                        <>
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
                                    label={LG.email}
                                    iconClass={MaterialCommunityIcons}
                                    iconName={'email'}
                                    iconColor={theme.iconInput}
                                    inputPadding={16}
                                    labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                                    useNativeDriver
                                    inputStyle={{color: theme.color,}}
                                    value={data.email}
                                    onChangeText={email => setData({...data, ...{email}})}
                                    returnKeyType={'next'}
                                    placeholder={LG.input + LG.email}
                                    placeholderTextColor={'transparent'}
                                />
                            </NeuButton>
                            <NeuButton
                                style={{marginTop: 25}}
                                onPress={getVerifyCode}
                                color={theme.newButton}
                                width={width - 40} height={55}
                                borderRadius={30}
                            >
                                <Text style={styles.txtLogin}
                                >
                                    {LG.getVerifyCode}
                                </Text>
                            </NeuButton>
                            <Text style={{ color: theme.color, paddingTop: 40, fontSize:13, textAlign: 'justify', lineHeight:20}}>
                                { LG.noteGetVerifyCode}
                            </Text>
                        </>:
                        <>
                            <NeuButton
                                active={true}
                                style={{marginTop: 20, opacity: 0.4}}
                                color={theme.newButton}
                                width={width - 40} height={55}
                                borderRadius={15}
                            >
                                <Kohana
                                    selectionColor={theme.iconInput}
                                    editable={false}
                                    style={styles.ip}
                                    label={LG.email}
                                    iconClass={MaterialCommunityIcons}
                                    iconName={'email'}
                                    iconColor={theme.iconInput}
                                    inputPadding={16}
                                    labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                                    useNativeDriver
                                    inputStyle={{color: theme.color}}
                                    value={data.email}
                                    onChangeText={email => setData({...data, ...{email}})}
                                    returnKeyType={'next'}
                                    placeholder={LG.input + LG.email}
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
                                    label={LG.verifyCode}
                                    iconClass={MaterialCommunityIcons}
                                    iconName={'code-equal'}
                                    iconColor={'#B7C8CE'}
                                    inputPadding={16}
                                    labelStyle={{color: '#B7C8CE'}}
                                    useNativeDriver
                                    inputStyle={{color: theme.color}}
                                    keyboardType={'phone-pad'}
                                    value={verifyCode.toString()}
                                    onChangeText={verifyCode => setVerifyCode(verifyCode)}
                                    placeholder={LG.input + LG.verifyCode}
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
                                    label={LG.numberPhone + ' ex: 09xx, 01xx'}
                                    iconClass={MaterialCommunityIcons}
                                    iconName={'phone'}
                                    iconColor={'#B7C8CE'}
                                    inputPadding={16}
                                    labelStyle={{color: '#B7C8CE'}}
                                    useNativeDriver
                                    inputStyle={{color: theme.color}}
                                    keyboardType={'phone-pad'}
                                    value={data.phone}
                                    onChangeText={phone => {
                                        if (phone.length===1) return setData({...data, ...{phone: '0'}})
                                        if (phone.startsWith(0)) {
                                            setData({...data, ...{phone}})
                                        } else {
                                            setData({...data, ...{phone: '0' + phone}})
                                        }
                                    }}
                                    placeholder={LG.input + LG.numberPhone + ' ex: 09xx, 01xx'}
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
                                    label={LG.firstName}
                                    iconClass={MaterialCommunityIcons}
                                    iconName={'feather'}
                                    iconColor={'#B7C8CE'}
                                    inputPadding={16}
                                    labelStyle={{color: '#B7C8CE'}}
                                    useNativeDriver
                                    inputStyle={{color: theme.color}}
                                    value={data.firstname}
                                    onChangeText={firstname => setData({...data, ...{firstname}})}
                                    returnKeyType={'next'}
                                    keyboardAppearance={'light'}
                                    placeholder={LG.input + LG.firstName}
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
                                    label={LG.lastName}
                                    iconClass={MaterialCommunityIcons}
                                    iconName={'feather'}
                                    iconColor={'#B7C8CE'}
                                    inputPadding={16}
                                    labelStyle={{color: '#B7C8CE'}}
                                    useNativeDriver
                                    inputStyle={{color: theme.color}}
                                    value={data.lastname}
                                    onChangeText={lastname => setData({...data, ...{lastname}})}
                                    returnKeyType={'next'}
                                    keyboardAppearance={'light'}
                                    placeholder={LG.input + LG.lastName}
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
                                    label={LG.password}
                                    iconClass={MaterialCommunityIcons}
                                    iconName={'lock'}
                                    iconColor={'#B7C8CE'}
                                    inputPadding={16}
                                    labelStyle={{color: '#B7C8CE'}}
                                    useNativeDriver
                                    inputStyle={{color: theme.color}}
                                    value={data.pass}
                                    onChangeText={pass => setData({...data, ...{pass}})}
                                    placeholder={LG.input + LG.password}
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
                                    ref={rePassRef}
                                    style={styles.ip}
                                    label={LG.rePassword}
                                    iconClass={MaterialCommunityIcons}
                                    iconName={'lock'}
                                    iconColor={'#B7C8CE'}
                                    inputPadding={16}
                                    labelStyle={{color: '#B7C8CE'}}
                                    useNativeDriver
                                    inputStyle={{color: theme.color}}
                                    value={rePass}
                                    onChangeText={rePass => setRePass(rePass)}
                                    placeholder={LG.input + LG.rePassword}
                                    placeholderTextColor={'transparent'}
                                />
                            </NeuButton>
                            <NeuButton
                                style={{marginTop: 25}}
                                onPress={registerAccount}
                                color={theme.newButton}
                                width={width - 40} height={55}
                                borderRadius={30}
                            >
                                <Text style={styles.txtLogin}
                                >
                                    {LG.register}
                                </Text>
                            </NeuButton>
                            <Text style={{ color: theme.color, padding: 20, textAlign: "center" }}>
                                { LG.noteRegister }
                            </Text>
                        </>
                    }
                </View>
            </ScrollView>
        </Animated.View>
    );
};
const style = (setTheme) => {
    const {color, backgroundColor, button, newButton} = setTheme;
    return StyleSheet.create({
        body: {
            flex: 1,
            backgroundColor,
        },
        ip: {
            backgroundColor: newButton,
            width: '100%',
            borderRadius: 15,
        },
        header: {
            paddingHorizontal: 25,
            paddingVertical: 20,
            width,
        },
        style_back: {
            height: 40,
            width: 40,
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#eaf3fa',
        },
        bttLogin: {
            marginTop: 25,
            width: '100%',
            paddingHorizontal: 40,
            backgroundColor: button,
            borderRadius: 10,
            paddingVertical: 16,
        },
        txtLogin: {
            color,
            fontWeight: '700',
            fontSize: 20,
            alignSelf: 'center',
            textAlignVertical: 'center',
        },
    });
};
export default Register;
