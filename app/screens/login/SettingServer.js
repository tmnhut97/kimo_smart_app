import React, {useEffect, useState} from 'react';
import {TouchableOpacity, View, StyleSheet, Text, BackHandler, Animated, Dimensions, Keyboard} from "react-native";
import {getCertFs, getItemLocalStore, setItemLocalStore} from '../../mFun';
import {NeuButton} from '../NeuView';
import {useNavigation} from "@react-navigation/native";
import useAnimatedCallback from "../../animated/useAnimatedCallback";
import {setToast} from "../../redux/reducer/toastReducer";
import {useDispatch, useSelector} from 'react-redux';
import CheckBox from "@react-native-community/checkbox";
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import Kohana from '../InputCustom/Kohana';
const {width} = Dimensions.get("screen")
const SettingServer = () => {
    const dispatch = useDispatch();
    const LG = useSelector(state => state.languages.language)
    const theme = useSelector((state) => state.themes.theme)
    const styles = style(theme)
    const navigation = useNavigation()
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
    const [ip, setIp ] = useState('kimovn.com')
    const [port, setPort ] = useState('53101')
    const [wss, setWss ] = useState(false)
    const setServer = () => {
        Keyboard.dismiss()
        const dataSet = { ip, port, wss }
        setItemLocalStore("server", dataSet).then( ()=> {
            dispatch(setToast({ show: "SUCCESS", data: LG.success}))
            navigation.goBack()
        })
    }
    useEffect( () => {
        getItemLocalStore("server").then( (server) => {
            if (server) {
                const { ip, port, wss } = server
                setIp(ip)
                setPort(port)
                setWss(wss || false)
            }
        })
    }, [])
    return (
        <Animated.View style={[styles.body, {left}]}>
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
            <View style={{justifyContent:'center', flex:1, paddingHorizontal: 20, width: '100%'}}>
                <View style={{flexDirection: 'row'}}>
                    <Kohana
                        style={styles.ip}
                        label={'Nhập ip server'}
                        iconClass={MaterialCommunityIcons}
                        iconName={'vector-polyline-edit'}
                        iconColor={'#B7C8CE'}
                        inputPadding={16}
                        labelStyle={{color: '#B7C8CE'}}
                        useNativeDriver
                        value={ip}
                        inputStyle={{color:theme.color}}
                        onChangeText={ip => setIp(ip)}
                        keyboardType={'default'}
                    />
                </View>
                <View style={{flexDirection: 'row', marginTop: 30}}>
                    <Kohana
                        style={styles.ip}
                        label={'Nhập ip server'}
                        iconClass={MaterialCommunityIcons}
                        iconName={'vector-polyline-edit'}
                        iconColor={'#B7C8CE'}
                        inputPadding={16}
                        labelStyle={{color: '#B7C8CE'}}
                        useNativeDriver
                        value={port}
                        inputStyle={{color:theme.color}}
                        onChangeText={port => {
                            setPort(port)
                            if (port.length >= 4) Keyboard.dismiss()
                        }}
                        keyboardType={'numeric'}
                    />
                </View>
                <View style={{flexDirection: 'row', marginTop: 30, alignItems: "center"}}>
                    <CheckBox
                        disabled={false}
                        value={wss}
                        onValueChange={(newValue) => setWss(newValue)}
                        tintColors={{true: '#F15927', false: theme.color}}
                    />
                    <Text style={styles.txtWss}>wss</Text>
                </View>
                <TouchableOpacity
                    onPress={ async () => {
                        Keyboard.dismiss()
                        let h = 'ws://'
                        if (wss) h = 'wss://'
                        const ca = await getCertFs('test.crt')
                        // const wsTest = new WebSocket(h + ip + ':'+port+'/', [], {ca});
                        const wsTest = new WebSocket(h + ip + ':'+port+'/');

                        wsTest.onopen = function (evt) {
                            if (wsTest != null) wsTest.close();
                            return dispatch(setToast({ show: "SUCCESS", data: LG.successfulConnection})) };
                        wsTest.onerror = (evt) => {
                            console.log(evt)
                            return dispatch(setToast({ show: "ERROR", data: LG.connectionFailedCheckAgain}))};

                    }}
                    style={styles.button}
                >
                    <Text style={styles.txtButton}>{LG.try}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={ () => setServer()}
                    style={styles.button}
                >
                    <Text style={styles.txtButton}
                    >
                        {LG.save}
                    </Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}
const style = (setTheme) => {
    const {color, backgroundColor, input, button} = setTheme
    return StyleSheet.create({
        body: {
            flex: 1,
            backgroundColor,
        },
        ip: {
            backgroundColor:input,
            marginTop: 0,
            width: '100%',
            borderRadius: 5,
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
            backgroundColor: '#eaf3fa',
        },
        txtWss:{
            color,
        },
        button:{
            marginTop:40,
            width: '100%',
            paddingHorizontal: 40,
            backgroundColor:button,
            borderRadius: 5,
            paddingVertical: 10,
        },
        txtButton:{
            color,
            fontWeight: '700',
            fontSize: 24,
            alignSelf: 'center',
            textAlignVertical: 'center'
        }
    })
}
export default SettingServer
