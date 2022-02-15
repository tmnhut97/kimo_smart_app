import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, Animated, Dimensions, TouchableOpacity, View, Keyboard} from 'react-native';
import Login from './login';
import {useDispatch, useSelector} from 'react-redux';
import {Logo} from '../../assets/imageSVG';
import {NeuButton} from '../NeuView';
import {getItemLocalStore, getVersion, isJsonString, setItemLocalStore} from '../../mFun';
import {setLanguage} from '../../redux/reducer/languageReducer';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation} from '@react-navigation/native'
import {setTheme} from "../../redux/reducer/themeReducer";
import {closeSocket, initSocket, wsListenerMessage, wsRemoveListenerMessage} from "../../Socket";
import {setToast} from "../../redux/reducer/toastReducer";
const {width, height} = Dimensions.get('screen')
const Welcome = () => {
    const navigation = useNavigation()
    const dispatch = useDispatch();
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
    const [showSettingPage, setShowSettingPage] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus',  async () => {
            closeSocket();
            const theme = await getItemLocalStore('theme')
            dispatch(setTheme(theme ? theme : 'default'));
            const language = await getItemLocalStore('language')
            dispatch(setLanguage(language ? language : 'vietnamese'));

            const user = await getItemLocalStore('user')
            if (!user) return setUser(null);
            setUser(user)
        });
        return unsubscribe;
    }, [navigation])

    useEffect( () => {
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
                    await setItemLocalStore('user', { userid, account: user.account, pass: user.pass, fullname: user.fullname }).then(() => {
                        navigation.navigate('Device');
                        wsRemoveListenerMessage(lis);
                    });
                }
            }
        };
        const login = () => {
            Keyboard.dismiss();
            initWs(user.account, user.password);
        }
        const initWs = (account, pass) => {
            initSocket(account, pass, navigation, dispatch, LG).then( () => wsListenerMessage(lis));
        };
        if (user) {
            login();
            setLoading(true)
        }else {
            setLoading(true)
            setTimeout( () => setLoading(false), 1000)
        }
    }, [user])
    if (loading) return <></>
    return (
        <>
            <Animated.View style={[styles.frameWelcome ]}>
                <TouchableOpacity
                    onPress={() => {
                        const nLang = LG.nameLanguage === 'EN' ? 'vietnamese' : 'english'
                        setItemLocalStore('language', nLang).then(() => dispatch(setLanguage(nLang)) );
                    }}
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: 25,
                        height:48,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <FontAwesome5Icon name={'globe'} size={25} color={theme.color}/>
                    <Text style={{color: theme.color, marginLeft: 10}}>
                        {LG.nameLanguage === 'VN' ? 'English' : 'Tiếng Việt'}
                    </Text>
                </TouchableOpacity>
                {Logo}
                <View style={{marginTop:30}}>
                    <NeuButton
                        animatedDisabled={true}
                        onPress={() => navigation.navigate('Login')}
                        color={theme.newButton}
                        width={width-100} height={55}
                        borderRadius={10}
                    >
                        <Text style={{color: theme.color, fontSize:18, fontWeight: 'bold', textAlign: 'center'}}>{LG.logIn}</Text>
                    </NeuButton>
                </View>
                <View style={{marginTop:30}}>
                    <NeuButton
                        animatedDisabled={true}
                        onPress={() => navigation.navigate('Register')}
                        color={theme.newButton}
                        width={width-100} height={55}
                        borderRadius={10}
                    >
                        <Text style={{color: theme.color, fontSize:18, fontWeight: 'bold', textAlign: 'center'}}>{LG.register}</Text>
                    </NeuButton>
                </View>
                {
                    showSettingPage &&
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            right: 25,
                            bottom: 20,
                        }}
                        onPress={() => navigation.navigate('SettingServer')}>
                        <FontAwesome5Icon name={'cog'} size={25} color={'gray'}/>
                    </TouchableOpacity>
                }
                <TouchableOpacity
                    activeOpacity={0.9}
                    delayLongPress={5000}
                    onLongPress={(() => setShowSettingPage(true))}
                    style={{
                        position: 'absolute',
                        left: 25,
                        bottom: 25,
                    }}>
                    <Text style={[styles.txtVersion, {color: theme.color}]}>{LG.version}: { getVersion.appVersion }</Text>
                </TouchableOpacity>
            </Animated.View>
        </>
    )
}


const style = (setTheme) => {
    const {backgroundColor,} = setTheme;
    return StyleSheet.create({
        frameWelcome:{
            flex: 1,
            paddingHorizontal: 25,
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 30,
            backgroundColor,
        },
    })
}

export default Welcome
