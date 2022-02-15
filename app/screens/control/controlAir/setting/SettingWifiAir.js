import React, {useEffect, useRef, useState} from 'react';
import {
    Text,
    View,
    StyleSheet,
    Animated,
    Dimensions,
    BackHandler,
    Keyboard,
    ActivityIndicator, TouchableOpacity
} from 'react-native';
import {useNavigation} from '@react-navigation/native'
import useAnimatedCallback from '../../../../animated/useAnimatedCallback';
import {NeuButton} from '../../../NeuView';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import {useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import {deleteFileFs, isJsonString, readFileFs, WriteFileFs} from "../../../../mFun";
import {setToast} from "../../../../redux/reducer/toastReducer";
import {fileSave, getFile, wsListenerMessage, wsRemoveListenerMessage} from "../../../../Socket";
import Icons from "react-native-vector-icons/dist/FontAwesome";
import Kohana from '../../../InputCustom/Kohana';
const {width} = Dimensions.get('screen')
const FILE_NAME = "config.json"
const SettingWifiAir = () => {
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) => state.themes.theme)
    const styles = style(theme)
    const navigation = useNavigation()
    const ani = useAnimatedCallback({value:width, listTo:[0, width], duration:250})
    const left = ani.value
    const [aniStart, aniStop] = ani.animates
    const nextInput = useRef();
    const Out = () => {
        aniStop.start(() => navigation.navigate('ControlAir'))
        return true
    }
    useEffect(() => {
        aniStart.start()
        BackHandler.addEventListener('hardwareBackPress', Out)
        return () => BackHandler.removeEventListener('hardwareBackPress', Out)
    },[])

    const devId = useSelector(state => state.devices.idCurrent)
    const [data, setData ] = useState(null)
    const [entryPass, setEntryPass] = useState(true)

    const save = () => {
        Keyboard.dismiss();
        const filename = "configdevid" + devId + ".json"
        deleteFileFs(filename).then(() => {
            WriteFileFs(filename, data )
                .then( () => {
                    fileSave(devId, FILE_NAME, data )
                    navigation.goBack()
                })
                .catch( () => console.log("error"))
        }).catch( (e) => {
            console.log(e)
        })
    }
    const lisSaveFileConfig = (evt) => {
        if (!isJsonString(evt.data)) return;
        const { cmd, devid, type, res, fname, ftype, data:info, msg } = JSON.parse(evt.data)   //userid
        if (
            cmd==="res" &&
            res==='fget' &&
            devid===devId &&
            type==="ACC" &&
            fname===FILE_NAME &&
            ftype==='t' &&
            msg==='OK'
        ){
            if (!info) return ;
            let d = info
            if (typeof info === 'string') d = JSON.parse(info)
            setData({... d})
        }
        if (
            cmd==="res" &&
            res==='fsave' &&
            devid===devId &&
            type==="ACC" &&
            msg==='OK'
        ){
            dispatch(setToast({ show: "SUCCESS", data:LG.success}))
            navigation.navigate("Device")
        }
    }
    useEffect( () => {
        const filename = "configdevid" + devId + ".json"
        readFileFs(filename).then(r => {
            if (!r) return getFile(devId, FILE_NAME)
            const { winame, wipass, sera, wspa, httpa, serb, wspb, httpb } = r
            if (         !winame || !wipass || !sera ||
                !wspa || !httpa || !serb || !wspb || !httpb){
                deleteFileFs('filename').then( () => getFile(devId, FILE_NAME))
            }
            setData(r)
        })
        wsListenerMessage(lisSaveFileConfig)
        return () => {
            wsRemoveListenerMessage(lisSaveFileConfig)
        }
    }, [])

    if (!data) return (
        <View style={{ position:'absolute', width: '100%', height: "100%", backgroundColor: '#EDF3F8', opacity:0.7, justifyContent:'center', alignItems:'center', zIndex:100}}>
            <ActivityIndicator size="large" color="blue" />
            <Text style={{ fontFamily: 'Digital-7', fontSize: 20, margin: 15 }}>{LG.pleaseWait} ...</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Device')}>
                <Text style={{ fontFamily: 'Digital-7', fontSize: 20, marginTop: 30, color: 'blue' }}>{LG.cancel}</Text>
            </TouchableOpacity>
        </View>
    )
    return (
        <Animated.View style={[styles.frameSettingWifiAir, {left}]}>
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
            <View style={styles.content}>
                <View style={styles.groupTitle}>
                    <Text style={styles.title}>{LG.wifiSetting}</Text>
                </View>
                <NeuButton
                    active={true}
                    style={{marginTop: 20}}
                    color={theme.newButton}
                    width={width - 60} height={55}
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
                        inputStyle={{color: theme.color}}
                        returnKeyType={'next'}
                        blurOnSubmit={false}
                        onSubmitEditing={() => nextInput.current.focus()}
                        onChangeText={winame => setData({...data, ...{ winame }})}
                        value={data.winame}
                    />
                </NeuButton>
                <NeuButton
                    active={true}
                    style={{marginTop: 20}}
                    color={theme.newButton}
                    width={width - 60} height={55}
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
                        inputStyle={{color: theme.color}}
                        returnKeyType={'done'}
                        secureTextEntry={entryPass}
                        onChangeText={wipass => setData({...data, ...{ wipass }})}
                        value={data.wipass}
                    />
                    <TouchableOpacity onPress={() => setEntryPass(!entryPass)}
                                      style={{position: "absolute", right: 30}}
                    >
                        {
                            entryPass ?
                                <Icons name={'eye'} size={20} color={theme.color} />
                                :
                                <Icons name={'eye-slash'} size={20} color={theme.color} />
                        }
                    </TouchableOpacity>
                </NeuButton>
                <NeuButton
                    onPress={save}
                    style={{marginTop:30}}
                    color={theme.newButton}
                    width={width - 60} height={55}
                    borderRadius={30}
                >
                    <Text style={{color: theme.color, fontSize:18, fontWeight: 'bold', textAlign: 'center'}}>{LG.save}</Text>
                </NeuButton>
            </View>
        </Animated.View>
    )
}
const style = (setTheme) => {
    const {color, backgroundColor, newButton} = setTheme
    return StyleSheet.create({
        frameSettingWifiAir: {
            flex: 1,
            backgroundColor,
            paddingVertical: 20
        },
        header: {
            position:'absolute',
            left:25,
            top:30,
        },
        groupTitle: {
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 30,
        },
        title: {
            color,
            fontSize: 30,
        },
        content:{
            flex:1,
            justifyContent:'center',
            paddingHorizontal: 30,
        },
        ip: {
            backgroundColor: newButton,
            width: '100%',
            borderRadius: 15,
        },
    })
}
export default SettingWifiAir
