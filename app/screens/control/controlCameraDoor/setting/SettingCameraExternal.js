import React, {useEffect, useRef, useState} from 'react';
import {
    Text,
    View,
    StyleSheet,
    Animated,
    Dimensions,
    BackHandler,
    TouchableOpacity, ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native'
import useAnimatedCallback from '../../../../animated/useAnimatedCallback';
import {NeuButton, NeuView} from '../../../NeuView';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import {useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import {
    getItemLocalStore,
    setItemLocalStore,
} from "../../../../mFun";
const actionsCamExternal = {
    up: "/cgi-bin/user/Serial.cgi?action=write&device=MASTER&channel=1&data=07 D0 01 55 4B EF FF 5F 00 23",
    left: "/cgi-bin/user/Serial.cgi?action=write&device=MASTER&channel=1&data=07 D0 01 55 4B BF FF 2F 00 23",
    right: "/cgi-bin/user/Serial.cgi?action=write&device=MASTER&channel=1&data=07 D0 01 55 4B 7F FF EF 00 23",
    down: "/cgi-bin/user/Serial.cgi?action=write&device=MASTER&channel=1&data=07 D0 01 55 4B DF FF 4F 00 23",
    snapshot: "/cgi-bin/guest/Video.cgi?media=jpeg",
    view: "/cgi-bin/guest/Video.cgi?media=MJPEG",
}
import CheckBox from "@react-native-community/checkbox";
import Kohana from '../../../InputCustom/Kohana';
const {width} = Dimensions.get('screen')

const SettingCameraExternal = () => {
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) => state.themes.theme)
    const devId = useSelector(state => state.devices.idCurrent)
    const styles = style(theme)
    const navigation = useNavigation()
    const ani = useAnimatedCallback({value:width, listTo:[0, width], duration:250})
    const left = ani.value
    const [aniStart, aniStop] = ani.animates
    const nextInput = useRef();
    const Out = () => {
        aniStop.start(() => navigation.navigate('DoorCamera'))
        return true
    }
    useEffect(() => {
        aniStart.start()
        BackHandler.addEventListener('hardwareBackPress', Out)
        return () => BackHandler.removeEventListener('hardwareBackPress', Out)
    },[])

    const [data, setData ] = useState({
        port: "",
        user: "",
        pass: "",
        use: false,
        scrips: actionsCamExternal,
    })
    const save = () => {
        setItemLocalStore('camera_external_' + devId, { ...data }).then( () => { navigation.goBack() })
    }
    useEffect( () => {
        getItemLocalStore('camera_external_' + devId).then( (e) => {
            if (!e) return;
            else {
                const { port, user, pass, use, scrips} = e
                setData({port, user, pass, use, scrips})
            }
        })
    }, [])
    return (
        <Animated.View style={[styles.frameSettingWifiDoor, {left}]}>
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
            <ScrollView style={{ marginTop: 80}}>
            <View style={styles.content}>
                <View style={styles.groupTitle}>
                    <Text style={styles.title}>{LG.setCameraExternal}</Text>
                </View>
                <NeuButton
                    active={true}
                    style={{marginTop: 20}}
                    color={theme.newButton}
                    width={width - 60} height={48}
                    borderRadius={15}
                >
                    <Kohana
                        ref={(ref) => nextInput.current = ref}
                        style={styles.ip}
                        label={"Port*"}
                        iconClass={MaterialCommunityIcons}
                        iconName={'vector-polyline-edit'}
                        iconColor={theme.iconInput}
                        inputPadding={16}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        inputStyle={{color: theme.color}}
                        returnKeyType={'done'}
                        keyboardType={"numeric"}
                        onChangeText={port => setData({...data, ...{ port }})}
                        value={data.port}
                    />
                </NeuButton>

                <NeuButton
                    active={true}
                    style={{marginTop: 20}}
                    color={theme.newButton}
                    width={width - 60} height={48}
                    borderRadius={15}
                >
                    <Kohana
                        ref={(ref) => nextInput.current = ref}
                        style={styles.ip}
                        label={LG.account + "*"}
                        iconClass={MaterialCommunityIcons}
                        iconName={'account'}
                        iconColor={theme.iconInput}
                        inputPadding={16}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        inputStyle={{color: theme.color}}
                        returnKeyType={'done'}
                        onChangeText={user => setData({...data, ...{ user }})}
                        value={data.user}
                    />
                </NeuButton>
                <NeuButton
                    active={true}
                    style={{marginTop: 20}}
                    color={theme.newButton}
                    width={width - 60} height={48}
                    borderRadius={15}
                >
                    <Kohana
                        ref={(ref) => nextInput.current = ref}
                        style={styles.ip}
                        label={LG.password + "*"}
                        iconClass={MaterialCommunityIcons}
                        iconName={'key'}
                        iconColor={theme.iconInput}
                        inputPadding={16}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        inputStyle={{color: theme.color}}
                        returnKeyType={'done'}
                        onChangeText={pass => setData({...data, ...{ pass }})}
                        value={data.pass}
                    />
                </NeuButton>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.color, marginTop: 20}}>
                    {LG.setting} scrips:
                </Text>
                <NeuButton
                    active={true}
                    style={{marginTop: 20}}
                    color={theme.newButton}
                    width={width - 60} height={48}
                    borderRadius={15}
                >
                    <Kohana
                        ref={(ref) => nextInput.current = ref}
                        style={styles.ip}
                        label={"View"}
                        iconClass={MaterialCommunityIcons}
                        iconName={'eye'}
                        iconColor={theme.iconInput}
                        inputPadding={16}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        inputStyle={{color: theme.color}}
                        returnKeyType={'done'}
                        onChangeText={view => {
                            let scrips = data.scrips
                            scrips.view = view
                            setData({...data, ...{ scrips }})
                        }}
                        value={data.scrips.view}
                    />
                </NeuButton>

                <NeuButton
                    active={true}
                    style={{marginTop: 20}}
                    color={theme.newButton}
                    width={width - 60} height={48}
                    borderRadius={15}
                >
                    <Kohana
                        ref={(ref) => nextInput.current = ref}
                        style={styles.ip}
                        label={"Snapshot"}
                        iconClass={MaterialCommunityIcons}
                        iconName={'camera'}
                        iconColor={theme.iconInput}
                        inputPadding={16}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        inputStyle={{color: theme.color}}
                        returnKeyType={'done'}
                        onChangeText={snapshot => {
                            let scrips = data.scrips
                            scrips.snapshot = snapshot
                            setData({...data, ...{ scrips }})
                        }}
                        value={data.scrips.snapshot}
                    />
                </NeuButton>
                <NeuButton
                    active={true}
                    style={{marginTop: 20}}
                    color={theme.newButton}
                    width={width - 60} height={48}
                    borderRadius={15}
                >
                    <Kohana
                        ref={(ref) => nextInput.current = ref}
                        style={styles.ip}
                        label={"up"}
                        iconClass={MaterialCommunityIcons}
                        iconName={'arrow-up'}
                        iconColor={theme.iconInput}
                        inputPadding={16}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        inputStyle={{color: theme.color}}
                        returnKeyType={'done'}
                        onChangeText={up => {
                            let scrips = data.scrips
                            scrips.up = up
                            setData({...data, ...{ scrips }})
                        }}
                        value={data.scrips.up}
                    />
                </NeuButton>
                <NeuButton
                    active={true}
                    style={{marginTop: 20}}
                    color={theme.newButton}
                    width={width - 60} height={48}
                    borderRadius={15}
                >
                    <Kohana
                        ref={(ref) => nextInput.current = ref}
                        style={styles.ip}
                        label={"down"}
                        iconClass={MaterialCommunityIcons}
                        iconName={'arrow-down'}
                        iconColor={theme.iconInput}
                        inputPadding={16}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        inputStyle={{color: theme.color}}
                        returnKeyType={'done'}
                        onChangeText={down => {
                            let scrips = data.scrips
                            scrips.down = down
                            setData({...data, ...{ scrips }})
                        }}
                        value={data.scrips.down}
                    />
                </NeuButton>
                <NeuButton
                    active={true}
                    style={{marginTop: 20}}
                    color={theme.newButton}
                    width={width - 60} height={48}
                    borderRadius={15}
                >
                    <Kohana
                        ref={(ref) => nextInput.current = ref}
                        style={styles.ip}
                        label={"left"}
                        iconClass={MaterialCommunityIcons}
                        iconName={'arrow-left'}
                        iconColor={theme.iconInput}
                        inputPadding={16}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        inputStyle={{color: theme.color}}
                        returnKeyType={'done'}
                        onChangeText={left => {
                            let scrips = data.scrips
                            scrips.left = left
                            setData({...data, ...{ scrips }})
                        }}
                        value={data.scrips.left}
                    />
                </NeuButton>
                <NeuButton
                    active={true}
                    style={{marginTop: 20}}
                    color={theme.newButton}
                    width={width - 60} height={48}
                    borderRadius={15}
                >
                    <Kohana
                        ref={(ref) => nextInput.current = ref}
                        style={styles.ip}
                        label={"right"}
                        iconClass={MaterialCommunityIcons}
                        iconName={'arrow-right'}
                        iconColor={theme.iconInput}
                        inputPadding={16}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        inputStyle={{color: theme.color}}
                        returnKeyType={'done'}
                        onChangeText={right => {
                            let scrips = data.scrips
                            scrips.right = right
                            setData({...data, ...{ scrips }})
                        }}
                        value={data.scrips.right}
                    />
                </NeuButton>

                <View style={{ flexDirection: "row", justifyContent: "flex-start", marginTop: 15, width, paddingHorizontal: 30, alignItems: 'center'}}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.color}}>{LG.useCameraExternal} </Text>
                    <TouchableOpacity
                        onPress={ () => setData({...data, ...{ use: !data.use }})}
                    >
                        <CheckBox
                            disabled={true}
                            value={data.use}
                            tintColors={{true: '#F15927', false: theme.color}}
                        />
                    </TouchableOpacity>
                </View>
                <NeuButton
                    onPress={save}
                    style={{marginTop:30, marginBottom: 10}}
                    color={theme.newButton}
                    width={width - 60} height={48}
                    borderRadius={30}
                >
                    <Text style={{color: theme.color, fontSize:18, fontWeight: 'bold', textAlign: 'center'}}>{LG.save}</Text>
                </NeuButton>
            </View>
            </ScrollView>
        </Animated.View>
    )
}
const style = (setTheme) => {
    const {color, backgroundColor, newButton} = setTheme
    return StyleSheet.create({
        frameSettingWifiDoor: {
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
export default SettingCameraExternal
