import React, {useEffect, useState} from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    BackHandler,
    ScrollView,
    Alert
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import {NeuButton} from '../NeuView';
import useAnimatedCallback from "../../animated/useAnimatedCallback";
import CheckBox from "@react-native-community/checkbox";
import DateTimePicker from '@react-native-community/datetimepicker';
import {isJsonString, parseDate} from "../../mFun";
import {
    emitEditAccount,
    emitGetAccountsShare,
    wsListenerMessage,
    wsRemoveListenerMessage
} from "../../Socket";
import {setToast} from "../../redux/reducer/toastReducer";
const {width, height} = Dimensions.get('screen');


const EditShareInfo = ({ route }) => {
    const { item } = route.params
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) => state.themes.theme);
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
    useEffect( () => { animStart.start(); }, [])
    const Out = () => {
        animStop.start(()=> navigation.goBack())
        return true
    }
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', Out);
        return () =>
            BackHandler.removeEventListener('hardwareBackPress', Out);
    }, []);
    const styles = style(theme);
    const [ modeStart, setModeStart ] = useState(null)
    const [ modeEnd, setModeEnd ] = useState(null)
    const [ dateStart, setDateStart ] = useState(new Date())
    const [ dateEnd, setDateEnd ] = useState(null)
    const [ status, setStatus ] = useState(null)

    const deleteUser = () => {
        Alert.alert(
            LG.delete,
            LG.doYouWantToDeleteThisAccount,
            [
                {
                    text: LG.cancel,
                    style: "cancel"
                },
                {
                    text: LG.oke,
                    onPress: () => emitEditAccount( { id: item._id,status: 'deleted'})
                    // onPress: () => emitDeleteUser( item._id)
                }
            ],
            {cancelable: false}
        );
    }
    const updateShare = () => {
        const d = {
            id: item._id,
            startuse: dateStart,
            enduse: dateEnd,
            status: status,
        }
        emitEditAccount(d)
    }
    const lis = (evt) => {
        if (!isJsonString(evt.data)) return;
        const { cmd, res, msg, userid:uid, info } = JSON.parse(evt.data)
        if (cmd === 'res' && res === 'edituser') {
            if (msg === "OK") {
                dispatch(setToast({show:'SUCCESS', data:LG.success}))
                navigation.goBack()
            }
            if (msg==="ERROR") {
                if (type === 'fullname') dispatch(setToast({show:'ERROR', data:LG.validate.fullname}))
            }

        }
    }
    useEffect( () => {
        emitGetAccountsShare()
        wsListenerMessage(lis)
        return () => wsRemoveListenerMessage(lis)
    }, [])
    useEffect( () => {
        if (item) {
            const { startuse, enduse, status } = item
            if (startuse) setDateStart(new Date(startuse))
            if (enduse) setDateEnd(new Date(enduse))
            if (status) setStatus(status)
        }
    }, [item])
    return (
        <Animated.View style={[styles.frameTheme, {left}]}>
            <View style={styles.header}>
                <NeuButton
                    onPress={Out}
                    color={theme.newButton}
                    width={40} height={40}
                    borderRadius={22.5}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
                <Text style={{
                    fontSize: 24,
                    color: theme.color,
                    fontWeight: 'bold'
                }}>
                    {LG.sharingInformation}
                </Text>
                <NeuButton
                    onPress={deleteUser}
                    color={theme.newButton}
                    width={40} height={40}
                    borderRadius={22.5}
                >
                    <Icon name={'trash'} size={20} color={'red'}/>
                </NeuButton>
                <TouchableOpacity
                    onPress={deleteUser}
                >
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1}}>
                <ScrollView>
                    <View style={{paddingHorizontal: 20, width: '100%'}}>
                        <View style={{ marginTop: 30, width: width - 70,padding: 10,borderRadius:5 , backgroundColor: theme.button }}>
                            <TouchableOpacity
                                onPress={ () => {
                                    const d = dateStart !== null ? null : new Date()
                                    setDateStart(d)
                                }}
                                style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "flex-start"}}>
                                <CheckBox
                                    disabled={true}
                                    value={dateStart!==null}
                                    tintColors={{true: '#F15927', false: theme.color}}
                                />
                                <Text style={{ fontWeight: '700',color:theme.color, fontSize: 14, width: width, textAlign: 'left', }}>{LG.setSharedStartTime}</Text>
                            </TouchableOpacity>
                            {
                                dateStart !==null &&
                                <View style={{flexDirection: 'row',width: width -100, marginTop: 15, justifyContent:"space-between", alignItems: "center"}}>
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "center"}}
                                        onPress={ () => setModeStart('date')}>
                                        <Text style={{ color:theme.color, fontSize: 12, borderRadius: 10, borderWidth: 1, padding: 10}}>{parseDate(dateStart).dateString}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "center"}}
                                        onPress={ () => setModeStart('time')}>
                                        <Text style={{ color:theme.color, fontSize: 12, borderRadius: 10, borderWidth: 1, padding: 10}}>{parseDate(dateStart).timeString}</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            { modeStart !== null && (
                                <DateTimePicker
                                    testID="dateTimePickerStart"
                                    value={dateStart}
                                    mode={modeStart}
                                    display={'spinner'}
                                    is24Hour={true}
                                    minimumDate={new Date()}
                                    onChange={(event, selectedDate) => {
                                        const currentDate = selectedDate || dateStart;
                                        setDateStart(currentDate);
                                        setModeStart(null)
                                    }}
                                />
                            )}
                        </View>
                        <View style={{ marginTop: 30, width: width - 70,padding: 10,borderRadius:5 ,backgroundColor: theme.button }}>
                            <TouchableOpacity
                                onPress={ () => {
                                    const d = dateEnd !== null ? null : new Date()
                                    setDateEnd(d)
                                }}
                                style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "flex-start"}}>
                                <CheckBox
                                    disabled={true}
                                    value={dateEnd!==null}
                                    tintColors={{true: '#F15927', false: theme.color}}
                                />
                                <Text style={{ fontWeight: '700', color:theme.color,fontSize: 14, width: width, textAlign: 'left', }}>{LG.setSharedEndTime}</Text>
                            </TouchableOpacity>
                            {
                                dateEnd !==null &&
                                <View style={{flexDirection: 'row',width: width -100, marginTop: 15, justifyContent:"space-between", alignItems: "center"}}>
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "center"}}
                                        onPress={ () => setModeEnd('date')}>
                                        <Text style={{ color:theme.color,fontSize: 12, borderRadius: 10, borderWidth: 1, padding: 10}}>{parseDate(dateEnd).dateString}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "center"}}
                                        onPress={ () => setModeEnd('time')}>
                                        <Text style={{ color:theme.color, fontSize: 12, borderRadius: 10, borderWidth: 1, padding: 10}}>{parseDate(dateEnd).timeString}</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            { modeEnd !== null && (
                                <DateTimePicker
                                    testID="dateTimePickerStart"
                                    value={dateEnd}
                                    mode={modeEnd}
                                    display={'spinner'}
                                    is24Hour={true}
                                    minimumDate={new Date()}
                                    onChange={(event, selectedDate) => {
                                        const currentDate = selectedDate || dateEnd;
                                        setDateEnd(currentDate);
                                        setModeEnd(null)
                                    }}
                                />
                            )}
                        </View>
                        <View style={{ marginTop: 15, backgroundColor: theme.button , padding: 10, borderRadius:5,}}>
                            <View style={{flexDirection: 'row',width: width -100,borderRadius:5, justifyContent:"space-between", alignItems: "center"}}>
                                <TouchableOpacity
                                    onPress={ () => setStatus('active')}
                                    style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "center"}}>
                                    <CheckBox
                                        disabled={true}
                                        value={status==='active'}
                                        tintColors={{true: '#F15927', false: theme.color}}
                                        // onValueChange={(newValue) => setRemember(newValue)}
                                        // style={styles.checkRemember}
                                    />
                                    <Text style={{color:theme.color}}>
                                        {LG.active}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={ () => {
                                        setStatus('disabled')
                                    }}
                                    style={{ flexDirection: "row", alignItems: "center", width: '50%', justifyContent: "center"}}>
                                    <CheckBox
                                        disabled={true}
                                        value={status==='disabled'}
                                        // onValueChange={(newValue) => setRemember(newValue)}
                                        tintColors={{true: '#F15927', false: theme.color}}
                                        // style={styles.checkRemember}
                                    />
                                    <Text style={{color:theme.color}}>
                                        {LG.lock}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <NeuButton
                            style={styles.bttLogin}
                            onPress={updateShare}
                            color={theme.newButton}
                            width={width - 60} height={60}
                            borderRadius={30}
                        >
                            <Text style={styles.txtLogin}>
                                {LG.update}
                            </Text>
                        </NeuButton>
                        <Text style={{ textAlign: "center", marginTop: 15, color: 'red', paddingHorizontal: 10}}>
                            { LG.noteEditShareInfo}
                        </Text>
                    </View>
                </ScrollView>
            </View>

        </Animated.View>
    );
};

const style = (setTheme) => {
    const {color, backgroundColor} = setTheme;
    return StyleSheet.create({
        frameTheme: {
            width,
            height,
            backgroundColor,
            paddingHorizontal: 15,
            position: 'absolute'
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
            justifyContent: 'space-between',
            height: 70,
            width,
        },
        bttLogin: {
            marginTop: 25,
        },
        txtLogin: {
            color,
            fontWeight: '700',
            fontSize: 20,
            alignSelf: 'center',
            textAlignVertical: 'center'
        },
    });
};
export default EditShareInfo;
