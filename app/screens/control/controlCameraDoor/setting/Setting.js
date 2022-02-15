import React, {useEffect, useRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
    PanResponder,
    Easing, BackHandler, Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import useAnimatedCallback from '../../../../animated/useAnimatedCallback';
import {useDispatch, useSelector} from 'react-redux';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {emitDeleteDev} from '../../../../Socket';
import {setToast} from '../../../../redux/reducer/toastReducer';
import {NeuButton} from '../../../NeuView';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const {width, height} = Dimensions.get('screen');
const Setting = ({close}) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const devId = useSelector(state => state.devices.idCurrent);
    const userId = useSelector(state => state.userIdCurrent);
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
    const ani = useAnimatedCallback({value: -600, listTo: [0, -600], duration: 400});
    const bottom = ani.value;
    const [animStart, animStop] = ani.animates;
    const isUserShare = useSelector((state) => state.isUserShare);

    const devCurrent = useSelector(state => {
        const {list, idCurrent} = state.devices;
        return list.find(({id}) => id === idCurrent);
    });
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, {dx, dy}) => (-1 < dx < 1 && -1 < dx < 1),
            onPanResponderMove: (evt, gestureState) => {
                const {dy} = gestureState;
                if (dy >= 0) {
                    Animated.timing(bottom, {
                        toValue: -dy,
                        duration: 0,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }).start();
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                const {dy} = gestureState;
                if (dy >= 60) {
                    animStop.start(close);
                } else {
                    Animated.timing(bottom, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }).start();
                }
            },
        }),
    ).current;
    const Close = () => {
        animStop.start(close);
        return true;
    };
    useEffect(() => {
        animStart.start();
        BackHandler.addEventListener('hardwareBackPress', Close);
        return () => BackHandler.removeEventListener('hardwareBackPress', Close);
    }, []);

    const deleteDevice = () => {
        if (isUserShare) {
            return dispatch(setToast({show: 'WARNING', data: LG.msgNotForYou}));
        }
        Alert.alert(
            LG.deleteDevice,
            LG.doYouWantToDeleteThisDevice,
            [
                {
                    text: LG.cancel,
                    style: 'cancel',
                },
                {
                    text: LG.oke,
                    onPress: () => {
                        emitDeleteDev(devId)
                    },
                },
            ],
            {cancelable: false},
        );
    };
    return (
        <>
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => Close()}
                style={styles.opacity}
            />
            <Animated.View style={[styles.frameSetting, {bottom}]}>
                <View {...panResponder.panHandlers} style={styles.contentModal}>
                    <View
                        style={[{
                            paddingTop: 10,
                            paddingBottom: 15,
                            width: '100%',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            backgroundColor: 'transparent',
                        }]}>
                        <NeuButton
                            animatedDisabled={true}
                            active={true}
                            color={theme.newButton}
                            width={70} height={5}
                            borderRadius={20}
                        />
                    </View>
                    {/*<TouchableOpacity*/}
                    {/*    onPress={() => navigation.navigate('SettingWifiDoor')}*/}
                    {/*>*/}
                    {/*    <View style={[styles.option]}>*/}
                    {/*        <View style={{width: 30, alignItems: 'center'}}>*/}
                    {/*            <FontAwesome5Icon name={'wifi'} size={25} color={theme.color}/>*/}
                    {/*        </View>*/}
                    {/*        <Text style={[styles.textOption, {color: theme.color}]}>Setting Wi-Fi</Text>*/}
                    {/*    </View>*/}
                    {/*</TouchableOpacity>*/}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('SettingCameraExternal')}
                    >
                        <View style={[styles.option]}>
                            <View style={{width: 30, alignItems: 'center'}}>
                                <FontAwesome5Icon name={'camera'} size={25} color={theme.color}/>
                            </View>
                            <Text style={[styles.textOption, {color: theme.color}]}>{LG.setCameraExternal}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('SetNameDoorCamera', {nameDevice: ''})}
                    >
                        <View style={[styles.option]}>
                            <View style={{width: 30, alignItems: 'center'}}>
                                <FontAwesome5Icon name={'edit'} size={25} color={theme.color}/>
                            </View>
                            <Text style={[styles.textOption, {color: theme.color}]}>{ LG.changeName }</Text>
                        </View>
                    </TouchableOpacity>
                    {
                        devCurrent.role === "admin" &&
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ShareDeviceWithEmailCD')}
                        >
                            <View style={[styles.option]}>
                                <View style={{width: 30, alignItems: 'center'}}>
                                    <FontAwesome5Icon name={'share-alt'} size={25} color={theme.color}/>
                                </View>
                                <Text style={[styles.textOption, {color: theme.color}]}>{LG.shareDevice}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                    <TouchableOpacity
                        onPress={() => navigation.navigate('VoiceSetupDoorCam')}
                    >
                        <View style={[styles.option]}>
                            <View style={{width: 30, alignItems: 'center'}}>
                                <MaterialIcons name={'record-voice-over'} size={25} color={theme.color}/>
                            </View>
                            <Text style={[styles.textOption, {color: theme.color}]}>{LG.VoiceControl}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={deleteDevice}
                    >
                        <View style={[styles.option]}>
                            <View style={{width: 30, alignItems: 'center'}}>
                                <FontAwesome5Icon name={'trash'} size={25} color={'red'}/>
                            </View>
                            <Text style={[styles.textOption, {color: theme.color}]}>{LG.deleteDevice}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </>
    );
};

const style = (setTheme) => {
    const {backgroundColor, button} = setTheme;
    return StyleSheet.create({
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
        contentModal: {
            borderWidth: 5,
            borderColor: button,
            backgroundColor,
            borderRadius: 10,
            paddingVertical: 15,
        },
        option: {
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
        },
        icon_option: {
            marginBottom: 15,
        },
        textOption: {
            marginLeft:20,
            fontWeight: '500',
            fontSize: 16,
            paddingVertical: 15,
        },
        textSignOut: {
            fontWeight: '500',
            width: '100%',
            fontSize: 20,
            textAlign: 'center',
            paddingVertical: 15,
        },
        opacity: {
            width: '100%',
            height,
            backgroundColor: '#000',
            position: 'absolute',
            opacity: 0.6,
            zIndex: 5,
        },
        frameClose: {
            backgroundColor,
            marginTop: 10,
            paddingVertical: 15,
            paddingHorizontal: 30,
            alignItems: 'center',
            borderRadius: 10,
        },
    });
}
export default Setting;
