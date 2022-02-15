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
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import {NeuButton} from '../NeuView';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import useAnimatedCallback from '../../animated/useAnimatedCallback';
import ModelChooseDevicesShare from './ModelChooseDevicesShare';
import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import {isJsonString, parseDate} from '../../mFun';
import {emitRegister, wsListenerMessage, wsRemoveListenerMessage} from '../../Socket';
import {setToast} from '../../redux/reducer/toastReducer';
import {Door, IconAir} from '../../assets/imageSVG';
import Kohana from '../InputCustom/Kohana';

const {width} = Dimensions.get('screen');

const ShareDevice = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const userId = useSelector(state => state.userIdCurrent);
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;

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
    const styles = style(theme);
    const [showModelChooseDevice, setShowModelChooseDevice] = useState(false);
    const [devicesShare, setDevicesShare] = useState([]);
    const [email, setEmail] = useState('');
    const [modeStart, setModeStart] = useState(null);
    const [modeEnd, setModeEnd] = useState(null);
    const [dateStart, setDateStart] = useState(new Date());
    const [dateEnd, setDateEnd] = useState(null);
    const devices = useSelector(state => state.devices.list);

    const editAccountShare = () => {
        const d = {
            email,
            devids: devicesShare.map(({id}) => id),
            parent: userId,
            startuse: dateStart,
            enduse: dateEnd,
        };
        emitRegister(d);
    };
    const lis = (evt) => {
        if (!isJsonString(evt.data)) {
            return;
        }
        const {cmd, res, msg, type} = JSON.parse(evt.data);
        if (cmd === 'res' && res === 'reguser') {
            if (msg === 'OK') {
                dispatch(setToast({show: 'SUCCESS', data: LG.success}));
                navigation.goBack();
            }
            if (msg === 'ERROR') {
                if (type === 'fullname') {
                    dispatch(setToast({show: 'ERROR', data: LG.validate.fullname}));
                }
                if (type === 'username') {
                    dispatch(setToast({show: 'ERROR', data:  LG.validate.username}));
                }
                if (type === 'pass') {
                    dispatch(setToast({show: 'ERROR', data: LG.validate.pass}));
                }
                if (type === 'email') {
                    dispatch(setToast({show: 'ERROR', data: LG.validate.email}));
                }
                if (type === 'email_exits') {
                    dispatch(setToast({show: 'ERROR', data:LG.validate.email_exits}));
                }
                if (type === 'username_exits') {
                    dispatch(setToast({show: 'ERROR',data:LG.validate.username_exits}));
                }
                if (type === 'phone') {
                    dispatch(setToast({show: 'ERROR',data:LG.validate.phone}));
                }
            }

        }
    };
    useEffect(() => {
        wsListenerMessage(lis);
        return () => wsRemoveListenerMessage(lis);
    }, []);
    const DevicesSelected = () =>
        devicesShare.map((item, i) => {
            const {name, type} = item;
            return (
                <View
                    key={i}
                    style={{
                    alignItems: 'center',
                    borderRadius: 10,
                    marginRight: 10,
                    marginVertical:15,
                    justifyContent: 'center',
                    height: 100, width: 120, backgroundColor: theme.button,
                }}>
                    {type === 'ACC' ? IconAir : Door}
                    <Text style={{color:theme.color, fontSize:12, marginTop:5}}>{name}</Text>
                </View>
            );
        });
    return (
        <Animated.View style={[styles.frameTheme, {left}]}>
            <View style={styles.header}>
                <View style={{height:48, width:48}}>
                    <NeuButton
                        onPress={Out}
                        color={theme.newButton}
                        width={45} height={45}
                        borderRadius={22.5}
                    >
                        <Icon name={'arrow-left'} size={20} color={theme.color}/>
                    </NeuButton>
                </View>
                <Text style={{ fontSize: 24, color: theme.color, fontWeight: 'bold' }}>{LG.shareDevice}</Text>
                <View style={{width: 48}}/>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{paddingHorizontal: 20, width: '100%'}}>
                    <NeuButton
                        active={true}
                        style={{marginTop: 30}}
                        color={theme.newButton}
                        width={width - 60} height={55}
                        borderRadius={15}
                    >
                        <Kohana
                            style={styles.ip}
                            label={LG.email}
                            iconClass={MaterialCommunityIcons}
                            iconName={'gmail'}
                            iconColor={theme.iconInput}
                            inputPadding={16}
                            labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                            useNativeDriver
                            inputStyle={{color: theme.color}}
                            value={email}
                            onChangeText={email => setEmail(email)}
                        />
                    </NeuButton>
                    <NeuButton
                        onPress={() => {
                            if (!devices.length) {
                                return dispatch(setToast({show: 'WARNING',   data: LG.youDontHaveADeviceToShare}));
                            }
                            setShowModelChooseDevice(true);
                        }}
                        style={{marginVertical: 20}}
                        color={theme.newButton}
                        width={width - 60} height={60}
                        borderRadius={15}
                    >
                        <Text style={{color:theme.color}}>{!devicesShare.length ? LG.chooseDevicesShare : LG.selectTheDeviceAgain}</Text>
                    </NeuButton>
                    {devicesShare.length ?
                        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                            <Text style={{color:theme.color}}>{LG.listDevice}</Text>
                            <Text style={{color:theme.color}}>{LG.amount}: {devicesShare.length}</Text>
                        </View>
                        : <></>
                    }
                    <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    >
                        <DevicesSelected/>
                    </ScrollView>
                    <View style={{width: width - 70, padding: 10, borderRadius:10, backgroundColor: theme.button}}>
                        <TouchableOpacity
                            onPress={() => {
                                const d = dateStart !== null ? null : new Date();
                                setDateStart(d);
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: '50%',
                                justifyContent: 'flex-start',
                            }}>
                            <CheckBox
                                disabled={true}
                                value={dateStart !== null}
                                tintColors={{true: '#F15927', false: theme.color}}
                            />
                            <Text style={{fontWeight: '700', fontSize: 14, width: width, textAlign: 'left',color:theme.color}}>
                                {LG.setSharedStartTime}
                            </Text>
                        </TouchableOpacity>
                        {
                            dateStart !== null &&
                            <View style={{
                                flexDirection: 'row',
                                width: width - 100,
                                marginTop: 15,
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        width: '50%',
                                        justifyContent: 'center',
                                    }}
                                    onPress={() => setModeStart('date')}>
                                    <Text style={{
                                        fontSize: 12,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        padding: 10,
                                        color:theme.color
                                    }}>{parseDate(dateStart).dateString}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        width: '50%',
                                        justifyContent: 'center',
                                    }}
                                    onPress={() => setModeStart('time')}>
                                    <Text style={{
                                        fontSize: 12,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        padding: 10,
                                        color:theme.color
                                    }}>{parseDate(dateStart).timeString}</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        {modeStart !== null && (
                            <DateTimePicker
                                testID="dateTimePickerStart"
                                value={dateStart}
                                mode={modeStart}
                                display={'spinner'}
                                is24Hour={true}
                                minimumDate={new Date()}
                                onChange={(event, selectedDate) => {
                                    const currentDate = selectedDate || dateStart;
                                    setModeStart(null);
                                    setDateStart(currentDate);
                                }}
                            />
                        )}
                    </View>
                    <View style={{marginTop: 20, width: width - 70,borderRadius:10,  padding: 10, backgroundColor: theme.button}}>
                        <TouchableOpacity
                            onPress={() => {
                                const d = dateEnd !== null ? null : new Date();
                                setDateEnd(d);
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: '50%',
                                justifyContent: 'flex-start',
                            }}>
                            <CheckBox
                                disabled={true}
                                value={dateEnd !== null}
                                tintColors={{true: '#F15927', false: theme.color}}
                            />
                            <Text style={{fontWeight: '700',color:theme.color, fontSize: 14, width: width, textAlign: 'left'}}>
                                {LG.setSharedEndTime}
                            </Text>
                        </TouchableOpacity>
                        {
                            dateEnd !== null &&
                            <View style={{
                                flexDirection: 'row',
                                width: width - 100,
                                marginTop: 15,
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        width: '50%',
                                        justifyContent: 'center',
                                    }}
                                    onPress={() => setModeEnd('date')}>
                                    <Text style={{
                                        fontSize: 12,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        padding: 10,
                                        color:theme.color
                                    }}>{parseDate(dateEnd).dateString}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        width: '50%',
                                        justifyContent: 'center',
                                    }}
                                    onPress={() => setModeEnd('time')}>
                                    <Text style={{
                                        fontSize: 12,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        padding: 10,
                                        color:theme.color
                                    }}>{parseDate(dateEnd).timeString}</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        {modeEnd !== null && (
                            <DateTimePicker
                                testID="dateTimePickerStart"
                                value={dateEnd}
                                mode={modeEnd}
                                display={'spinner'}
                                is24Hour={true}
                                minimumDate={new Date()}
                                onChange={(event, selectedDate) => {
                                    const currentDate = selectedDate || dateEnd;
                                    setModeEnd(null);
                                    setDateEnd(currentDate);
                                }}
                            />
                        )}
                    </View>
                    <NeuButton
                        style={styles.bttShare}
                        onPress={editAccountShare}
                        color={theme.newButton}
                        width={width - 60} height={60}
                        borderRadius={30}
                    >
                        <Text style={styles.txtLogin}>{LG.share}</Text>
                    </NeuButton>
                </View>
            </ScrollView>
            {showModelChooseDevice &&
                <ModelChooseDevicesShare
                    close={() => setShowModelChooseDevice(false)}
                    theme={theme}
                    LG={LG}
                    selected={devicesShare}
                    setSelected={(d) => setDevicesShare(d)}
                    devices={devices}
                />
            }
        </Animated.View>
    );
};

const style = (setTheme) => {
    const {color, backgroundColor, newButton} = setTheme;
    return StyleSheet.create({
        frameTheme: {
            flex:1,
            backgroundColor,
            paddingHorizontal: 15,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
            justifyContent: 'space-between',
            height: 70,
            width,
        },
        bttShare: {
            marginTop: 25,
            marginBottom:10
        },
        txtLogin: {
            color,
            fontWeight: '700',
            fontSize: 20,
            alignSelf: 'center',
            textAlignVertical: 'center',
        },
        ip: {
            backgroundColor: newButton,
            width: '100%',
            borderRadius: 15,
        },
    });
};
export default ShareDevice;
