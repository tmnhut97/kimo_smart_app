import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    Dimensions,
    StyleSheet,
    Animated,
    BackHandler, Image, FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from "react-redux";
import Icon from "react-native-vector-icons/dist/FontAwesome5";
import Voice, {SpeechRecognizedEvent, SpeechResultsEvent} from "@react-native-voice/voice";
import Animation from "lottie-react-native";
import MaterialCommunityIcons from "react-native-vector-icons/dist/MaterialCommunityIcons";
import useAnimatedCallback from "../../../../animated/useAnimatedCallback";
import {getItemLocalStore, removeAccents, setItemLocalStore} from "../../../../mFun";
import {sendControl} from "../../../../Socket";
import {setToast} from "../../../../redux/reducer/toastReducer";
import {NeuButton, NeuView} from "../../../NeuView";
import voiceImg from '../../../../assets/images/micro.jpg'
import voice from '../../../../assets/json/voice.json'
import Kohana from '../../../InputCustom/Kohana';
const {width, height} = Dimensions.get('screen');
const VoiceSetupDoorCam = () => {
    const dispatch = useDispatch()
    const navigation = useNavigation();
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const userId = useSelector(state => state.userIdCurrent);
    const devId = useSelector(state => state.devices.idCurrent);
    const dev = useSelector(state => state.devices.list.find(({id}) => id === devId));
    const [animStart, animStop] = ani.animates;
    const [ result, setResult ] = useState([])
    const [ status, setStatus ] = useState(null)
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
    useEffect( () => {
        Voice.onSpeechRecognized = (e: SpeechRecognizedEvent) => {
            console.log('onSpeechRecognized: ', e);
        }
        Voice.onSpeechResults = (e: SpeechResultsEvent) => setResult(e.value)
        Voice.onSpeechEnd =(e: any) => {
            console.log('onSpeechEnd: ', e);
            setStatus(null)
        };

        return () => {
            Voice.stop()
            Voice.destroy().then(Voice.removeAllListeners);
        }
    }, [])
    const startVoice = async () => {
        try {
            await Voice.start('vi-VN');
            setStatus('start')
        } catch (e) {
            console.error(e);
        }
    }
    const stopVoice = async () => {
        try {
            await Voice.stop();
            setStatus(null)
        } catch (e) {
            console.error(e);
        }
    }
    const actionResult = async (result) => {
        const voicesSetup = await getItemLocalStore('voice_setup' + userId)
        if (!voicesSetup || !voicesSetup.length) return dispatch(setToast({ show: "WARNING", data: LG.thisCommandNotFound}));
        const nresult = result.map( e => removeAccents(e).toUpperCase())
        const temp = voicesSetup.find( (e) => nresult.includes(removeAccents(e.txt).toUpperCase()))
        if (!temp) return dispatch(setToast({ show: "WARNING", data: LG.thisCommandNotFound}));
        const { devid, action, type} = temp.data
        sendControl(devid, action, type)
    }
    useEffect( () => {
        if (!result.length) return;
        actionResult(result).then( () => {
            setResult([])
        })
    }, [result])

    return (
        <>
            <Animated.View style={[styles.frameSetName, {left}]}>
                <View style={styles.header}>
                    <NeuButton
                        onPress={Out}
                        color={theme.newButton}
                        width={45} height={45}
                        borderRadius={22.5}
                    >
                        <Icon name={'arrow-left'} size={20} color={theme.color}/>
                    </NeuButton>
                    <Text style={{ color: theme.color, fontSize: 24, fontWeight: "bold"}}>{ dev.name }</Text>
                    <View >
                        <NeuButton
                            onPress={ () => {
                                if (status === 'start') {
                                    return stopVoice()
                                } else return startVoice()
                            }}
                            color={theme.newButton}
                            width={45} height={45}
                            borderRadius={22.5}
                        >{ status === 'start' ?
                            <View style={{ width: 40, height: 40}}>
                                <Animation
                                    loop
                                    autoPlay={true}
                                    source={voice}
                                />
                            </View> :
                            <Image
                                style={{
                                    borderRadius: 25,
                                    width: 40,
                                    height: 40,
                                }}
                                source={voiceImg}
                            />
                        }
                        </NeuButton>
                    </View>
                </View>
                <View style={{flex: 1, paddingHorizontal: 15}}>
                    <View style={styles.groupTitleDoor}>
                        <View style={styles.symbolItem}/>
                        <Text style={styles.titleControlDoor}>{LG.status}</Text>
                    </View>
                    <View style={{ marginTop: 15, paddingLeft: 15}}>
                        <Text style={{ color: theme.color}}>{LG.door}: {dev.status}</Text>
                    </View>
                    <View style={styles.groupTitleDoor}>
                        <View style={styles.symbolItem}/>
                        <Text style={styles.titleControlDoor}>{LG.setUpYourVoice}</Text>
                    </View>
                    <View style={{ flex: 1, paddingVertical: 10}}>
                        <FlatList
                            data={['open','pause', 'close']}
                            renderItem={ ({ item }) => <ItemSetup
                                dev={dev}
                                item={item} theme={theme} LG={LG}
                            /> }
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                </View>
            </Animated.View>
        </>
    );
};

const ItemSetup = ({ item, LG, theme, dev }) => {
    const dispatch = useDispatch()
    const userId = useSelector(state => state.userIdCurrent);
    const [ edit, setEdit ] = useState(false)
    const [ data, setData ] = useState({ txt: LG.unavailable, data: { devid: dev.id, type: dev.type, action: item } })

    useEffect( () => {
        getItemLocalStore('voice_setup' + userId).then( (e) => {
            if (!e || !e.length) return ;
            const t = e.find( (e) => {
                const { devid, action, type } = e.data
                return (
                    dev.id === devid &&
                    dev.type === type &&
                    action === item
                )
            })
            if (t) return setData(t)
        })
    }, [])
    const [ txt, setTxt ] = useState('')
    const setup = async () => {
        const d = { txt, data: { devid: dev.id, type: dev.type, action: item }}
        const voidSetups = await getItemLocalStore('voice_setup' + userId)
        let temp = []
        if (!voidSetups || !voidSetups.length) temp = [d];
        else {
            const checkEx = voidSetups.find( e => ( removeAccents(e.txt).toUpperCase() === removeAccents(txt).toUpperCase()))
            if (checkEx) return dispatch(setToast({ show: "ERROR", data: LG.thisOrderHasBeenDuplicated}))
            const t = voidSetups.findIndex( (e) => {
                const { devid, action, type } = e.data
                return (
                    dev.id === devid &&
                    dev.type === type &&
                    action === item
                )
            })
            if (t < 0) temp = [...voidSetups, ...[d]]
            else {
                let m = voidSetups
                m[t] = d
                temp = m
            }
        }
        setItemLocalStore('voice_setup' + userId, temp).then( () => {
            setEdit(false)
            setData(d)
        })
    }

    let action = { icon: 'angle-double-up', txt: ''}
    if (data.data.action === 'close') action = { icon: 'angle-double-down', txt: LG.closeDoor}
    if (data.data.action === 'open') action = { icon: 'angle-double-up', txt: LG.openDoor}
    if (data.data.action === 'pause') action = { icon: 'pause', txt: LG.stop}
    return (
        <>
            <NeuView
                animatedDisabled={true}
                customLightShadow={'#FFFFFF'}
                customDarkShadow={'#E3E3E3'}
                borderRadius={10}
                width={width-30}
                height={60}
                color={theme.itemDevice.backgroundItem}
                style={{ paddingVertical: 10}}
            >
                <View
                    style={{
                        width: width-30,backgroundColor: theme.backgroundColor,marginTop: 10,
                        paddingVertical: 5, paddingHorizontal: 20,
                        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                    }}
                >
                    <View style={{ justifyContent: "space-between"}}>
                        <View style={{ flexDirection: "row", }}>
                            <Icon name={action.icon} color={theme.color} size={20}/>
                            <Text style={{ fontWeight: '700', marginLeft: 10, color: theme.color }}>
                                { action.txt}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", marginTop: 10}}>
                            <MaterialCommunityIcons name={'account-voice'} color={theme.color} size={20}/>
                            <Text style={{ fontWeight: '700', marginLeft: 10, color: theme.color }}>
                                { data.txt}
                            </Text>
                        </View>
                    </View>
                    {   edit ?
                        <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center"}}>
                            <NeuButton
                                onPress={setup}
                                color={theme.newButton}
                                width={30} height={30}
                                borderRadius={22.5}
                                style={{ marginRight: 20}}
                            >
                                <Icon name={'check'} color={theme.color} size={20}/>
                            </NeuButton>
                            <NeuButton
                                onPress={() => setEdit(false)}
                                color={theme.newButton}
                                width={30} height={30}
                                borderRadius={22.5}
                            >
                                <Icon name={'times'} color={theme.color} size={20}/>
                            </NeuButton>
                        </View> :
                        <NeuButton
                            onPress={() => setEdit(true)}
                            color={theme.newButton}
                            width={30} height={30}
                            borderRadius={22.5}
                        >
                            <Icon name={'edit'} color={theme.color} size={20}/>
                        </NeuButton>
                    }
                </View>
            </NeuView>
            {
                edit &&
                <View style={{ padding: 15 }}>
                    <NeuButton
                        active={true}
                        color={theme.newButton}
                        width={width - 60} height={55}
                        borderRadius={15}
                    >
                        <Kohana
                            style={{
                                backgroundColor: theme.newButton,
                                width: '100%',
                                borderRadius: 15,
                            }}
                            label={"Nhập lệnh"}
                            iconClass={MaterialCommunityIcons}
                            iconName={'account-voice'}
                            iconColor={theme.iconInput}
                            labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                            useNativeDriver
                            inputStyle={{color: theme.color}}
                            value={txt}
                            onChangeText={txt => setTxt(txt)}
                        />
                    </NeuButton>
                </View>
            }
        </>
    )
}

const style = (setTheme) => {
    const {color, backgroundColor, newButton, button} = setTheme;
    return StyleSheet.create({ groupTitleDoor: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop:30
        },
        symbolItem: {
            borderTopLeftRadius: 3,
            borderBottomLeftRadius: 3,
            height: 30,
            width: 6,
            backgroundColor: color,
            marginRight: 10,
        },
        titleControlDoor: {
            fontWeight: 'bold',
            fontSize: 22,
            color,
        },
        opacity: {
            width: '100%',
            height,
            backgroundColor: '#000',
            position: 'absolute',
            opacity: 0.6,
            zIndex: 5,
        },
        frameSetting: {
            position: 'absolute',
            maxHeight: 620,
            width: width - 20,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            marginHorizontal: 10,
            zIndex: 100,
            marginBottom: 15,
        },
        moveDown:{
            paddingTop: 10,
            paddingBottom: 15,
            width: '100%',
            justifyContent: 'center',
            flexDirection: 'row',
            backgroundColor: 'transparent',
        },
        contentModal: {
            borderWidth: 5,
            borderColor: button,
            backgroundColor,
            maxHeight:350,
            borderRadius: 10,
            paddingVertical: 15,
        },
        frameSetName: {
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
            marginBottom: 5,
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
        ip: {
            backgroundColor: newButton,
            width: '100%',
            borderRadius: 15,
        },
    });
};


export default VoiceSetupDoorCam
