import React, {useEffect, useState} from 'react';

import {StyleSheet, View, Text, Animated, Dimensions, TouchableOpacity, Keyboard, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import useAnimatedCallback from '../../animated/useAnimatedCallback';
import {useDispatch, useSelector} from 'react-redux';
import {NeuButton} from '../NeuView';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import {
    convertToPx,
    getItemLocalStore,
    isJsonString, removeAccents,
    removeItemLocalStore, setItemLocalStore,
} from '../../mFun';
import Icons from 'react-native-vector-icons/dist/FontAwesome';
import TouchID from 'react-native-touch-id';
import {setToast} from '../../redux/reducer/toastReducer';
import {initSocket, wsListenerMessage, wsRemoveListenerMessage} from '../../Socket';
import VoiceControl from "../VoiceControl";
import Kohana from '../InputCustom/Kohana';
// import VoiceControl from "../VoiceControl";
const {width} = Dimensions.get('screen');
const LoginHasAccount = ({ userLogin, setUserLogin }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 250});
    const left = ani.value;
    const [aniStart, aniStop] = ani.animates;
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [entryPass, setEntryPass] = useState(true);
    const fingerprintScannerSuccess = async () => {
        const fingerprint = await getItemLocalStore('fingerprint_' + userLogin.userid)
        if (!fingerprint) return dispatch(setToast({show: 'WARNING', data: LG.youHaveNotEnabledFingerprintLogin}));
        const {account, pass} = fingerprint;
        if (account && pass) initWs(account, pass);
        setPassword('')
    };

    const actionFingerprint = () => {
        TouchID.isSupported({
            unifiedErrors: false,
            passcodeFallback: false,
        })
            .then(biometryType => {
                // Success code
                if (biometryType === 'FaceID') {
                    TouchID.authenticate().then(fingerprintScannerSuccess)
                    .catch(error => {
                        setPassword('')
                    });
                } else {
                    TouchID.authenticate('', {
                        title: LG.signInWithYourFingerprint,
                        imageColor: 'green',
                        imageErrorColor: '#ff0000',
                        sensorDescription: LG.pleaseScanYourFingerprintToLoginTheApplication,
                        cancelText: LG.cancel,
                    })
                        .then(fingerprintScannerSuccess)
                        .catch(() => {
                            console.log('Authentication Failed');
                            setPassword('')
                        });
                }
            })
            .catch(error => {
                console.log(error);
            });
    };
    const lis = async (evt) => {
        if (!isJsonString(evt.data)) {
            return;
        }
        const {cmd, res, msg, fullname, userid} = JSON.parse(evt.data);
        if (cmd === 'res' && res === 'login') {
            if (msg === 'ERROR') {
                return dispatch(setToast({show: 'ERROR', data: LG.userNameOrPasswordWrong}));
            }
            if (msg === 'OK') {
                await setItemLocalStore('user', { userid, account: userLogin.account, pass: password, fullname }).then(() => {
                    navigation.navigate('Device');
                    wsRemoveListenerMessage(lis);
                });
                setUserLogin(null)
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
        initWs(userLogin.account, password);
    };
    useEffect(() => {
        aniStart.start();
        return () => aniStop.start()
    }, []);
    const [name, setName] = useState('');
    useEffect(() => {
        if (!userLogin) return;
        if (userLogin.account) setUserName(userLogin.account)
        if (userLogin.pass) setPassword(userLogin.pass)
        if (userLogin.fullname) {
            const t = userLogin.fullname.split(' ')
            setName(t[t.length-1])
        }
        checkFingerprint()
    }, [userLogin]);

    const checkFingerprint = async () => {
        if (!userLogin ) return;
        const fingerprint = await getItemLocalStore('fingerprint_' + userLogin.userid)
        if (fingerprint) {
            actionFingerprint();
        }
    }
    return (
        <Animated.View style={[styles.frameLoginHasAccount ]}>
            <View style={{position: 'absolute', top: 40, left: 20}}>
                <NeuButton
                    animatedDisabled={true}
                    onPress={() =>{
                        Alert.alert(
                            LG.logOutYourAccount,
                            LG.youWantToExitThisAccount,
                            [
                                {
                                    text: LG.cancel,
                                    style: "cancel"
                                },
                                {
                                    text: LG.oke,
                                    onPress: () => removeItemLocalStore('user').then(() => navigation.navigate('Login'))
                                }
                            ],
                            {cancelable: false}
                        );
                    }}
                    color={theme.newButton}
                    width={48} height={48}
                    borderRadius={24}
                >
                    <Icon name={'sign-out-alt'} style={{transform: [{rotate: '180deg'}]}} size={20}
                          color={theme.color}/>
                </NeuButton>
            </View>
            <View>
                <Text style={{fontSize: 20, textAlign: 'center', color:theme.color}}>{LG.sayHello}</Text>
                <Text style={{marginTop: 15, fontSize: 30, textAlign: 'center',color:theme.color}}>{LG.nameLanguage === "VN" ? name : removeAccents(name)}</Text>
                <NeuButton
                    animatedDisabled={true}
                    active={true}
                    style={{marginTop: 30}}
                    color={theme.newButton}
                    width={width - 60} height={55}
                    borderRadius={15}
                >
                    <Kohana
                        selectionColor={theme.iconInput}
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
                    />
                    <TouchableOpacity onPress={() => setEntryPass(!entryPass)} style={styles.iconPass}>
                        <Icons name={entryPass ? 'eye' : 'eye-slash'} size={20} color={theme.color}/>
                    </TouchableOpacity>
                </NeuButton>
                <View style={styles.groupActionLogin}>
                    <NeuButton
                        animatedDisabled={true}
                        onPress={() => login()}
                        color={theme.newButton}
                        width={width - 60} height={60}
                        borderRadius={30}
                    >
                        <Text style={styles.txtLogin}>{LG.logIn}</Text>
                    </NeuButton>
                </View>
                <View>
                    <TouchableOpacity onPress={() => actionFingerprint()} style={styles.fingerprint}>
                        <MaterialCommunityIcons name={'fingerprint'} size={40} color={'green'}/>
                        <Text style={{marginLeft: 20,color:theme.color}}>{LG.signInWithYourFingerprint}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Forget')}>
                    <Text style={styles.forgot_pass}>{LG.forgetPassword}</Text>
                </TouchableOpacity>
            </View>
            <VoiceControl />
        </Animated.View>
    );
};

const style = (setTheme) => {
    const {color, backgroundColor,newButton} = setTheme;
    return StyleSheet.create({
        frameLoginHasAccount: {
            flex: 1,
            paddingHorizontal: 30,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor,
        },
        iconPass: {
            position: 'absolute',
            top: 0,
            right: 0,
            width:55,
            height:55,
            zIndex:2,
            justifyContent:'center',
            alignItems:'center',
        },
        ip: {
            backgroundColor: newButton,
            width: '100%',
            borderRadius: 15,
        },
        groupActionLogin: {
            marginTop: 25,
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
        },
        txtLogin: {
            color,
            fontWeight: '700',
            fontSize: 20,
            alignSelf: 'center',
            textAlignVertical: 'center',
        },
        fingerprint: {
            marginTop: 25,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 15,
            borderRadius: 10,
        },
        forgot_pass: {
            marginTop: 25,
            color,
            fontWeight: '600',
            textAlign: 'right',
            textDecorationLine: 'underline',
        },
    });
};
export default LoginHasAccount;
