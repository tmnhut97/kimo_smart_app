import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity, Keyboard, Dimensions,
    Animated,
} from 'react-native';
import {initSocket, wsRemoveListenerMessage, wsListenerMessage, closeSocket, ws} from '../../Socket';
import {
    convertToPx,
    getCertFs,
    getItemLocalStore,
    isJsonString, removeItemLocalStore,
    setItemLocalStore,
} from '../../mFun';
import Icons from 'react-native-vector-icons/dist/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {setToast} from '../../redux/reducer/toastReducer';
import {setTheme} from '../../redux/reducer/themeReducer';
import {setLanguage} from '../../redux/reducer/languageReducer';
import {NeuButton} from '../NeuView';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import useAnimatedCallback from '../../animated/useAnimatedCallback';
import Kohana from '../InputCustom/Kohana';

const {width} = Dimensions.get('screen');
const Login = (props) => {
    const {navigation} = props;
    const dispatch = useDispatch();
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 250});
    const left = ani.value;
    const [aniStart] = ani.animates;
    useEffect(() => {
        aniStart.start();
    }, []);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [entryPass, setEntryPass] = useState(true);
    const [ca, setCa] = useState('');
    const lis = async (evt) => {
        if (!isJsonString(evt.data)) {
            return;
        }
        const {cmd, res, msg, fullname, userid } = JSON.parse(evt.data);
        if (cmd === 'res' && res === 'login') {
            if (msg === 'ERROR') {
                return dispatch(setToast({show: 'ERROR', data: LG.userNameOrPasswordWrong}));
            }
            if (msg === 'OK') {
                await setItemLocalStore('user', {userid, account: userName, pass: password, fullname}).then(() => {
                    navigation.navigate('Device');
                    setUserName('')
                    setPassword('')
                    wsRemoveListenerMessage(lis);
                });
            }
        }
    };
    const initWs = (account, pass) => {
        initSocket(account, pass, navigation, dispatch, LG).then( () => wsListenerMessage(lis));
    };
    const login = () => {
        Keyboard.dismiss();
        if (!userName.length) {
            return dispatch(setToast({show: 'WARNING', data: LG.usernameCannotBeEmpty}));
        }
        if (!password.length) {
            return dispatch(setToast({show: 'WARNING', data: LG.passwordCannotBeEmpty}));
        }

        initWs(userName, password);
    };
    const [loadTheme, setLoadTheme] = useState(false);
    const [loadLanguage, setLoadLanguage] = useState(false);
    useEffect(() => {
        closeSocket();
        getCertFs('test.crt').then(e => (e && setCa(e)));
        getItemLocalStore('theme').then((e) => {
            setLoadTheme(true);
            dispatch(setTheme(e ? e : 'default'));
        });
        getItemLocalStore('language').then((e) => {
            setLoadLanguage(true);
            dispatch(setLanguage(e ? e : 'vietnamese'));
        });
    }, []);
    if (!loadTheme || !loadLanguage) {
        return <></>;
    }
    return (
        <Animated.View style={[styles.frameLogin, {left}]}>
            <View style={{position: 'absolute', top: 0, paddingTop:40, left: 20, width, height:100, backgroundColor:theme.backgroundColor, zIndex:1}}>
                <NeuButton
                    onPress={() => removeItemLocalStore('user').then( () => navigation.navigate('Welcome')) }
                    color={theme.newButton}
                    width={48} height={48}
                    borderRadius={24}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
            </View>
            <View style={styles.body}>
                <Text style={styles.txtTitleLogin}>{LG.logIn}</Text>
                <Text style={styles.txtRemind}>{LG.pleaseFillInTheLoginInformation}</Text>
                <NeuButton
                    active={true}
                    style={{marginTop: 30}}
                    color={theme.newButton}
                    width={width - 60} height={55}
                    borderRadius={15}
                >
                    <Kohana
                        selectionColor={theme.iconInput}
                        autoCompleteType={'username'}
                        style={styles.ip}
                        label={LG.emailOrPhone}
                        iconClass={MaterialCommunityIcons}
                        iconName={'account'}
                        iconColor={theme.iconInput}
                        inputPadding={16}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        value={userName}
                        inputStyle={{color: theme.color}}
                        onChangeText={userName => setUserName(userName)}
                        placeholder={LG.input + LG.emailOrPhone}
                        placeholderTextColor={'transparent'}
                        returnKeyType={"next"}
                        keyboardType={'email-address'}
                    />
                </NeuButton>
                <NeuButton
                    active={true}
                    style={{marginTop: 30}}
                    color={theme.newButton}
                    width={width - 60} height={55}
                    borderRadius={15}
                >
                    <Kohana
                        selectionColor={theme.iconInput}
                        autoCompleteType={'password'}
                        style={styles.ip}
                        label={LG.password}
                        iconClass={MaterialCommunityIcons}
                        iconName={'lock'}
                        iconColor={theme.iconInput}
                        inputPadding={16}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        secureTextEntry={entryPass}
                        value={password}
                        inputStyle={{color: theme.color}}
                        onChangeText={userName => setPassword(userName)}
                        placeholder={LG.input + LG.password}
                        placeholderTextColor={'transparent'}
                    />
                    <TouchableOpacity onPress={() => setEntryPass(!entryPass)} style={styles.iconPass}>
                        <Icons name={entryPass ? 'eye' : 'eye-slash'} size={20} color={theme.color}/>
                    </TouchableOpacity>
                </NeuButton>
                <View style={styles.groupActionLogin}>
                    <NeuButton
                        onPress={() => login()}
                        color={theme.newButton}
                        width={width - 60} height={60}
                        borderRadius={30}
                    >
                        <Text style={styles.txtLogin}>{LG.logIn}</Text>
                    </NeuButton>
                </View>
            </View>
            <TouchableOpacity style={{height:48, marginTop: 35,justifyContent:'center', alignItems:'center'}} onPress={() => navigation.navigate('Forget')}>
                <Text style={styles.forgot_pass}>{LG.forgetPassword}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};
const style = (setTheme) => {
    const {color, backgroundColor, button, input, newButton} = setTheme;
    return StyleSheet.create({
        forgot_pass: {
            color,
            fontWeight: '600',
            textAlign: 'center',
            textDecorationLine: 'underline',
        },
        frameLogin: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor,
        },
        body: {
            paddingHorizontal: 30,
            width: '100%',
        },
        txtTitleLogin: {
            textTransform: 'uppercase',
            fontSize: 25,
            color,
            fontWeight: '700',
        },
        txtRemind: {
            color,
            marginVertical: 15,
        },
        imgLogo: {
            width: 140,
            height: 140,
        },
        groupInput: {
            flexDirection: 'row',
            width: '100%',
        },
        iconPass: {
            position: 'absolute',
            top: 0,
            right: 0,
            width:55,
            height:55,
            justifyContent:'center',
            alignItems:'center',
        },
        ip: {
            backgroundColor: newButton,
            width: '100%',
            borderRadius: 15,
        },
        frameRemember: {
            flexDirection: 'row',
            alignItems: 'center',
        },

        rememberPassword: {
            color,
        },
        groupActionLogin: {
            marginTop: 30,
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
        },
        bttLogin: {
            flexGrow: 1,
            paddingHorizontal: 40,
            backgroundColor: button,
            borderRadius: 5,
            paddingVertical: convertToPx(6),
        },
        txtLogin: {
            color,
            fontWeight: '700',
            fontSize: 20,
            alignSelf: 'center',
            textAlignVertical: 'center',
        },
        chooseRegister: {
            paddingHorizontal: 5,
            paddingVertical: 20,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 15,
        },
        txtFooter: {
            color: 'blue',
            fontSize: 16,
            textDecorationLine: 'underline',
        },
        txtVersion: {
            color,
        },
    });
};
export default Login;
