import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    ActivityIndicator,
    BackHandler, Dimensions,
    Animated, Alert
} from 'react-native';
import {getFile, fileSave, wsListenerMessage, wsRemoveListenerMessage, emitDeleteDev} from '../../Socket';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import Icons from 'react-native-vector-icons/dist/FontAwesome';
import { deleteFileFs, isJsonString, readFileFs, WriteFileFs} from '../../mFun';
import {NeuButton} from '../NeuView';
import useAnimatedCallback from '../../animated/useAnimatedCallback';
import {setToast} from "../../redux/reducer/toastReducer";
const FILE_NAME = "config.json"
const {width} = Dimensions.get('screen')
const Config = () => {
    const dispatch = useDispatch()
    const LG = useSelector((state) => state.languages.language)
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
    const devId = useSelector(state => state.devices.idCurrent)
    const [data, setData ] = useState(null)
    const [entryPass, setEntryPass] = useState(true)
    const save = () => {
        const filename = "configdevid" + devId + ".json"
        deleteFileFs(filename).then(r => {
            WriteFileFs(filename, data )
                .then( () => {
                    fileSave(devId, FILE_NAME, data )
                    navigation.goBack()
                })
                .catch( e => console.log("error"))
        }).catch( (e) => {
            console.log(e)
        })
    }
    const lisSaveFileConfig = (evt) => {
        if (!isJsonString(evt.data)) return;
        const { cmd, devid, userid, type, res, fname, ftype, data:info, msg } = JSON.parse(evt.data)
        if (
            cmd==="res" &&
            res==='fget' &&
            devid===devId &&
            // userid===userId &&
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
            // userid===userId &&
            type==="ACC" &&
            msg==='OK'
        ){
            dispatch(setToast({ show: "SUCCESS", data:LG.success}))
            navigation.navigate("Device")
        }
    }
    const deleteDevice = () => {
        Alert.alert(
            data.name,
            "Bạn có muốn xóa thiết bị này ?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xóa",
                    onPress: () => emitDeleteDev(devId)
                }
            ],
            {cancelable: false}
        );
    }
    useEffect( () => {
        const filename = "configdevid" + devId + ".json"
        readFileFs(filename).then(r => {
            if (!r) return getFile(devId, FILE_NAME)
            const { winame, wipass, sera, wspa, httpa, serb, wspb, httpb } = r
            if (!winame || !wipass || !sera ||
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
    const [ ir, setIr ] = useState(null)
    useEffect( () => {
        const fileNameSave = "irdevid" + devId + ".json"
        readFileFs(fileNameSave).then(r => {
            if (!r) return ;
            setIr(r)
        })
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
    const devModel = ir ? ir.supplier + '-' + ir.model : LG.chooseTheDeviceType
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
                <Text style={styles.title}>{LG.setting}</Text>
                <NeuButton
                    onPress={save}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'check'} size={20} color={theme.color}/>
                </NeuButton>
            </View>
            <ScrollView>
                <KeyboardAvoidingView
                    behavior='padding'
                    style={{flex: 1}}>
                    <View style={styles.container}>
                        <View style={styles.group_wifi}>
                            <View style={styles.wp}>
                                <Text style={styles.txtLeft}>name</Text>
                                <TextInput
                                    style={styles.ip_wifi_host}
                                    textAlign={'right'}
                                    value={data.name}
                                    onChangeText={name => setData({...data, ...{ name }})}
                                    color={'#ababab'}
                                />
                            </View>
                            <View style={styles.wp}>
                                <Text style={styles.txtLeft}>Wifi Host</Text>
                                <TextInput
                                    style={styles.ip_wifi_host}
                                    onChangeText={winame => setData({...data, ...{ winame }})}
                                    value={data.winame}
                                    textAlign={'right'}
                                    placeholder={"Nhập ..."}
                                    placeholderTextColor={"#ababab"}
                                    returnKeyType={"next"}
                                />
                            </View>
                            <View style={styles.wp}>
                                <Text style={styles.txtLeft}>Wifi Pass</Text>
                                <TextInput
                                    style={styles.ip_wifi_pass}
                                    onChangeText={wipass => setData({...data, ...{ wipass }})}
                                    value={data.wipass}
                                    textAlign={'right'}
                                    placeholder={"Nhập ..."}
                                    placeholderTextColor={"#ababab"}
                                    returnKeyType={"next"}
                                    secureTextEntry={entryPass}
                                    editable={!entryPass}
                                />
                                <TouchableOpacity onPress={() => setEntryPass(!entryPass)}
                                                  style={styles.icon_pass}
                                >
                                    {
                                        entryPass ?
                                            <Icons name={'eye'} size={20} color={theme.color} />
                                            :
                                            <Icons name={'eye-slash'} size={20} color={theme.color} />
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                       <Text style={{ paddingLeft:20, fontSize:16, paddingBottom:5, color:'#787878'}}>Server A</Text>
                       <View style={styles.group_serverA}>
                           <View style={styles.wp}>
                               <Text style={styles.txtLeft}>Địa chỉ IP</Text>
                               <TextInput
                                   style={styles.ip_ip}
                                   onChangeText={sera => setData({...data, ...{ sera }})}
                                   value={data.sera}
                                   textAlign={'right'}
                                   keyboardType={"default"}
                                   placeholder={"255.255.0.0"}
                                   placeholderTextColor={"#ababab"}
                                   returnKeyType={"next"}
                               />
                           </View>
                           <View style={styles.wp}>
                               <Text style={styles.txtLeft}>Port</Text>
                               <TextInput
                                   style={styles.ip_port}
                                   onChangeText={wspa => setData({...data, ...{ wspa }})}
                                   value={data.wspa.toString()}
                                   textAlign={'right'}
                                   keyboardType={"numeric"}
                                   placeholder={"192.168.1.1"}
                                   placeholderTextColor={"#ababab"}
                                   returnKeyType={"next"}
                               />
                           </View>
                       </View>

                        <Text style={{ paddingLeft:20, fontSize:16, paddingBottom:5, color:'#787878'}}>Server B</Text>
                        <View style={styles.group_serverB}>
                            <View style={styles.wp}>
                                <Text style={styles.txtLeft}>Địa chỉ IP</Text>
                                <TextInput
                                    style={styles.ip_ip}
                                    onChangeText={serb => setData({...data, ...{ serb }})}
                                    value={data.serb}
                                    textAlign={'right'}
                                    keyboardType={"default"}
                                    placeholder={"192.168.1.1"}
                                    placeholderTextColor={"#ababab"}
                                    returnKeyType={"next"}
                                />
                            </View>
                            <View style={styles.wp}>
                                <Text style={styles.txtLeft}>Port</Text>
                                <TextInput
                                    style={styles.ip_port}
                                    onChangeText={wspb => setData({...data, ...{ wspb }})}
                                    value={data.wspb.toString()}
                                    textAlign={'right'}
                                    keyboardType={"numeric"}
                                    placeholder={"0.0.0.0"}
                                    placeholderTextColor={"#ababab"}
                                    returnKeyType={"done"}
                                />
                            </View>
                        </View>
                        <View style={styles.group_serverB}>
                            <View style={styles.wp}>
                                <Text style={styles.txtLeft}>HTTP A</Text>
                                <TextInput
                                    style={styles.ip_port}
                                    onChangeText={httpa => setData({...data, ...{ httpa }})}
                                    value={data.httpa.toString()}
                                    textAlign={'right'}
                                    keyboardType={"numeric"}
                                    placeholder={"0.0.0.0"}
                                    placeholderTextColor={"#ababab"}
                                    returnKeyType={"next"}
                                />
                            </View>
                            <View style={styles.wp}>
                                <Text style={styles.txtLeft}>HTTP B</Text>
                                <TextInput
                                    style={styles.ip_port}
                                    onChangeText={httpb => setData({...data, ...{ httpb }})}
                                    value={data.httpb.toString()}
                                    textAlign={'right'}
                                    keyboardType={"numeric"}
                                    placeholder={"0.0.0.0"}
                                    placeholderTextColor={"#ababab"}
                                    returnKeyType={"next"}
                                />
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </Animated.View>
    )
}

const style = (setTheme) => {
    const {color, backgroundColor, input, button} = setTheme
    return StyleSheet.create({
        body: {
            flex: 1,
            backgroundColor,
            paddingVertical: 20
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: 50,
            paddingHorizontal: 15,
            alignItems: 'center',
            marginBottom: 20,
        },
        style_back: {
            height: 40,
            width: 40,
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#eaf3fa',
        },
        back: {
            height: 56,
            color,
            fontSize: 25,
            fontWeight: 'bold',
            marginVertical: 15,
            paddingVertical: 5,
            textAlign: 'center',
            textAlignVertical: 'center',
        },
        title: {
            color,
            fontSize: 25,
            fontWeight: 'bold',
        },
        container: {
            paddingVertical: 25,
        },
        group_wifi: {
            marginBottom: 20,
            backgroundColor:input,
            paddingLeft: 20,
            borderTopWidth: 0.5,
            borderBottomWidth: 0.5,
        },
        txtLeft:{
            position: 'absolute',
            color,
        },
        ip_wifi_host: {
            height:50,
            width: '100%',
            borderColor: '#ababab',
            borderBottomWidth: 0.5,
            color,
            paddingHorizontal: 20,
        },
        ip_wifi_pass: {
            height:50,
            width: '100%',
            borderColor: '#ababab',
            color,
            paddingHorizontal: 50,
        },
        icon_pass:{
            position:'absolute',
            top:12,
            right:15
        },

        group_serverA: {
            marginBottom: 20,
            backgroundColor: input,
            paddingLeft: 20,
            borderTopWidth: 0.5,
            borderBottomWidth: 0.5,
        },

        group_serverB: {
            marginBottom: 20,
            backgroundColor: input,
            paddingLeft: 20,
            borderTopWidth: 0.5,
            borderBottomWidth: 0.5,
        },

        wp: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        ip_ip: {
            height:50,
            width: '100%',
            borderColor: '#ababab',
            borderBottomWidth: 0.5,
            color,
            paddingHorizontal: 20,
        },

        ip_port: {
            height:50,
            width: '100%',
            borderColor: '#ababab',
            color,
            paddingHorizontal: 20,
        },
    })
}
export default Config
