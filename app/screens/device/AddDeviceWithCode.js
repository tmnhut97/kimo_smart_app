import React, {useEffect, useState} from "react";
import {
    View, Text, BackHandler, Animated, StyleSheet, Dimensions
} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {useDispatch, useSelector} from "react-redux";
import useAnimatedCallback from "../../animated/useAnimatedCallback";
import {NeuButton} from "../NeuView";
import Icon from "react-native-vector-icons/dist/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/dist/MaterialCommunityIcons";
import {emitAddDevToUser, wsListenerMessage, wsRemoveListenerMessage} from "../../Socket";
import {getItemLocalStore, isJsonString} from "../../mFun";
import {setToast} from "../../redux/reducer/toastReducer";
import Kohana from '../InputCustom/Kohana';
const { width } = Dimensions.get("screen")
const AddDeviceWithCode = () => {
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) => state.themes.theme)
    const userId = useSelector(state => state.userIdCurrent)
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
    const [ code, setCode ] = useState('')
    const actionChangeName = () => {
        getItemLocalStore('user').then( (user) => {
            if (user) {
                const { account } = user
                emitAddDevToUser(account, code, 'admin' )
            }
        })
    }
    const lisDevs = (evt) => {
        if (!isJsonString(evt.data)) return;
        const { cmd, res, msg, userid:uid} = JSON.parse(evt.data)
        if (cmd==='res' && ['adddev'].includes(res)  && userId===uid) {
            if (msg==="OK") return navigation.navigate('Device')
            if (msg==="DEV_UNKNOW") return dispatch(setToast({ show: 'ERROR', data: LG.validate.DEV_UNKNOWN}))
        }
    }
    useEffect( () => {
        wsListenerMessage(lisDevs)
        return () => wsRemoveListenerMessage(lisDevs)
    }, [])
    return (
        <Animated.View style={[styles.frameSetName, {left}]} >
            <View style={styles.header}>
                <NeuButton
                    onPress={Out}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
                <Text style={styles.title_control}>{LG.addDevice}</Text>
                <NeuButton
                    onPress={actionChangeName}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'check'} size={20} color={theme.color}/>
                </NeuButton>
            </View>
            <View style={{width: '100%', paddingHorizontal: 10, alignItems:'center', marginTop: 40  }}>
                <NeuButton
                    active={true}
                    style={{marginTop: 20}}
                    color={theme.newButton}
                    width={width - 40} height={55}
                    borderRadius={15}
                >
                    <Kohana
                        style={styles.ip}
                        label={LG.enterCodeDevice}
                        iconClass={MaterialCommunityIcons}
                        iconName={'file-edit'}
                        iconColor={theme.iconInput}
                        inputPadding={16}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        value={code}
                        inputStyle={{color:theme.color}}
                        onChangeText={text => setCode(text)}
                    />
                </NeuButton>
            </View>
        </Animated.View>
    )
}

const style = (setTheme) => {
    const {color, backgroundColor, newButton} = setTheme
    return StyleSheet.create({
        frameSetName:{
            backgroundColor,
            flex: 1,
        },
        header: {
            flexDirection: 'row',
            paddingTop: 25,
            paddingBottom: 10,
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom:5,
        },
        title_control: {
            fontSize: 30,
            color,
            fontWeight: 'bold'
        },
        style_cog: {
            height: 40,
            width: 40,
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#eaf3fa',
        },
        groupInput: {
            flexDirection:'row',
            marginTop: 15,
            width: '100%',
        },
        ip: {
            backgroundColor: newButton,
            width: '100%',
            borderRadius: 15,
        },
    })
}
export default AddDeviceWithCode
