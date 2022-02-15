import React, {useEffect, useState} from "react";
import {Dimensions, Image, Text, TouchableOpacity, View} from "react-native";
import voice from "../assets/json/voice.json";
import Animation from "lottie-react-native";
import Voice, {
    SpeechRecognizedEvent,
    SpeechResultsEvent,
} from "@react-native-voice/voice";
import {getItemLocalStore, isJsonString, removeAccents} from "../mFun";
import {useDispatch, useSelector} from "react-redux";
import { sendControl, wsListenerMessage, wsRemoveListenerMessage} from "../Socket";
import {useNavigation} from "@react-navigation/native";
import {setDeviceIdCurrent} from "../redux/reducer/deviceReducer";

const { width } = Dimensions.get("screen")
const VoiceControl = () => {
    const dispatch = useDispatch()
    const [ voidSetups, setVoidSetups ] = useState([])
    const theme = useSelector((state) => state.themes.theme);
    const LG = useSelector((state) => state.languages.language)
    const userId = useSelector(state => state.userIdCurrent);
    const navigation = useNavigation()
    const [ result, setResult ] = useState([])
    const [ status, setStatus ] = useState(null)
    const [ text, setText ] = useState('')
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
        console.log(result)
        const nresult = result.map( e => removeAccents(e).toUpperCase())
        const temp = voidSetups.find( (e) => nresult.includes(removeAccents(e.txt).toUpperCase()))
        if (!temp) return setText(LG.couldNotFindThisCommand)
        const { devid, action, type} = temp.data
        sendControl(devid, action, type)
        const lisVoice = async (evt) => {
            if (!isJsonString(evt.data)) return;
            const { cmd, devid:rdevid, status, type } = JSON.parse(evt.data)
            if (
                cmd==='status' && devid===rdevid
            ) {
                if (status === "ON") setText(LG.openAirConditioner + ' ' + LG.success)
                if (status === "OFF") setText(LG.closeAirConditioner + ' ' + LG.success)
                if (status === "CLOSE") setText(LG.closeDoor+ ' ' + LG.success)
                if (status === "OPEN") setText(LG.openDoor+ ' ' + LG.success)
                if (status === "STOP") setText(LG.stop+ ' ' + LG.success)
                dispatch(setDeviceIdCurrent(rdevid));
                if (type === 'ACC') navigation.navigate('ControlAir');
                if (type === 'DOORCAM') navigation.navigate('DoorCamera');
                // await startVoice();
                wsRemoveListenerMessage(lisVoice)
            }

        }
        wsListenerMessage(lisVoice)
    }
    useEffect( () => {
        if (!result.length) return;
        actionResult(result).then( () => {
            setResult([])
            setStatus(null)
        })
    }, [result])
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus',  async () => {
            Voice.onSpeechRecognized = (e: SpeechRecognizedEvent) => {
                console.log('onSpeechRecognized: ', e);
            }
            Voice.onSpeechResults = (e: SpeechResultsEvent) => setResult(e.value)
            Voice.onSpeechPartialResults =  (e: SpeechResultsEvent) => {
                setText(e.value[0])
            };
            Voice.onSpeechEnd =(e: any) => {
                setStatus(null)
            };
            getItemLocalStore('voice_setup' + userId).then(async (e) => {
                await startVoice()
                if (!e || !e.length) return setVoidSetups([]);
                setVoidSetups(e)
            })
        });

        return () => {
            Voice.destroy().then(() => Voice.removeAllListeners());
            unsubscribe();
        }
    }, [navigation])
    useEffect( () => {
        let t
        if (text.length) {
            t = setTimeout( () => {
                setText('')
                clearTimeout(t)
            }, 3000)
        }

        return () => {
            if (t) clearTimeout(t)
        }
    }, [text])
    return (
        <View style={{
            position: "absolute", bottom: 0, width, height: 100, justifyContent: "flex-end", alignItems: "center",
            paddingBottom: 30
        }}>
            <View style={{ paddingBottom: 20}}>
                <Text style={{ color: theme.color}}>
                    {text}
                </Text>
            </View>
            <TouchableOpacity
                onPress={() => {
                    if (status === 'start') {
                        return stopVoice()
                    } else return startVoice()
                }}
            >
            { status === 'start' ?
                <View style={{ width: 120, height: 60}}>
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
                    source={require('../assets/images/micro.jpg')}
                />
            }
            </TouchableOpacity>
        </View>
    )
}

export default VoiceControl
