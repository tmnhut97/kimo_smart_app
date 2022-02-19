import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    ScrollView,
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Dimensions,
    Platform,
    Animated,
    Easing, ActivityIndicator, AppState, Image, BackHandler, StatusBar,
    NativeModules,
    Vibration, Share
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {NeuButton} from '../../NeuView';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import WebView from 'react-native-webview';
import {
    getDevLogin, getExIp,
    wsControlCamera,
    wsControlDoor,
    wsListenerMessage,
    wsRemoveListenerMessage
} from '../../../Socket';
import {ALBUM, Base64, calculateImageSize, getItemLocalStore, isJsonString, setItemLocalStore} from '../../../mFun';
import {check, PERMISSIONS, request} from 'react-native-permissions';
import useAnimatedCallback from '../../../animated/useAnimatedCallback';
import Setting from './setting/Setting';
import {setToast} from '../../../redux/reducer/toastReducer';
import {openChooserWithOptions} from 'react-native-send-intent';
import Animation from 'lottie-react-native';
import doordown from '../../../assets/json/doordown.json';
import {setListDevice} from "../../../redux/reducer/deviceReducer";
import Orientation from 'react-native-orientation-locker';
const FullScreenMM = NativeModules.FullScreen
const {width, height} = Dimensions.get('screen');
function merged(chunks) {
    let length = 0;
    chunks.forEach(item => {
        length += item.length;
    });
    let mergedArray = new Uint8Array(length);
    let offset = 0;
    chunks.forEach(item => {
        mergedArray.set(item, offset);
        offset += item.length;
    });
    return mergedArray;
}
const actionsCamExternal = {
    up: "/cgi-bin/user/Serial.cgi?action=write&device=MASTER&channel=1&data=07 D0 01 55 4B EF FF 5F 00 23",
    left: "/cgi-bin/user/Serial.cgi?action=write&device=MASTER&channel=1&data=07 D0 01 55 4B BF FF 2F 00 23",
    right: "/cgi-bin/user/Serial.cgi?action=write&device=MASTER&channel=1&data=07 D0 01 55 4B 7F FF EF 00 23",
    down: "/cgi-bin/user/Serial.cgi?action=write&device=MASTER&channel=1&data=07 D0 01 55 4B DF FF 4F 00 23",
    snapshot: "/cgi-bin/guest/Video.cgi?media=jpeg",
    view: "/cgi-bin/guest/Video.cgi?media=MJPEG",
}
const DoorCamera = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const userId = useSelector(state => state.userIdCurrent)
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
    const [disabled, setDisabled] = useState(false);
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
    useEffect(() => {
        animStart.start();
    }, []);
    const [camExternal, setCameExternal ] = useState({ use: false, scrips: actionsCamExternal });
    const [setting, setSetting] = useState(false);
    const [src, setSrc] = useState(null);
    const [fullScreen, setFullScreen] = useState(false);
    const [actionCamera, setActionCamera] = useState(false);
    const [imageSave, setImageSave] = useState(null);
    const [actionDoor, setActionDoor] = useState(null);
    const [actionCam, setActionCam] = useState('startcam');
    const aniRotateCameraCurrent = useRef(null);
    const tOutActionCamera = useRef(null);
    const rotateCamera = useRef(new Animated.Value(0)).current;
    const aniRotateCamera = (value) => {
        aniRotateCameraCurrent.current = Animated.timing(rotateCamera, {
            toValue: (value),
            duration: 0,
            easing: Easing.linear,
            useNativeDriver: false,
        });
        return aniRotateCameraCurrent.current.start();
    };
    const Out = () => {
        if(fullScreen) {
            if(Platform.OS !== 'android') FullScreenMM.disable();
            navigation.setOptions({headerShown: true});
            StatusBar.setHidden(false);
            Orientation.lockToPortrait();
            setFullScreen(!fullScreen);
        }else {
            setDisabled(true);
            animStop.start(() => navigation.navigate('Device'));
        }
        return true;
    };
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', Out);
        return () => BackHandler.removeEventListener('hardwareBackPress', Out);
    }, [fullScreen]);
    const rotateCameraView = (d) => {
        const rotateCameraId = 'rotateCamera_' + devCurrent.id;
        if (d === 'left') {
            const v = rotateCamera._value + 90;
            aniRotateCamera(v);
            return setItemLocalStore(rotateCameraId, v);
        }
        if (d === 'right') {
            const v = rotateCamera._value - 90;
            aniRotateCamera(v);
            return setItemLocalStore(rotateCameraId, v);
        }
    };
    const ActionCam = () => {
        if (actionCam === 'startcam') {
            setActionCam('stopcam');
        }
        if (actionCam === 'stopcam') {
            setActionCam('startcam');
        }
    };
    const devCurrent = useSelector(state => {
        const { list, idCurrent} = state.devices;
        const f = list.find(({id}) => id === idCurrent);
        if (!f) return navigation.navigate('Device')
        return f
    });
    const _handleAppStateChange = (nextAppState) => {
        if (
            ['inactive', 'background'].includes(nextAppState)
        ) {
            if (actionCam === 'startcam') {
                setActionCam('stopcam');
                setImageSave(null);
            }
        } else {
            navigation.navigate('DoorCamera');
        }
    };
    useEffect(() => wsControlCamera(devCurrent.id, actionCam), [actionCam]);
    useEffect(() => {
        if (actionCamera) {
            tOutActionCamera.current = setTimeout(() => {
                clearTimeout(tOutActionCamera.current);
                setActionCamera(false);
            }, 5000);
        } else {
            clearTimeout(tOutActionCamera.current);
        }

        return () => {
            if (tOutActionCamera.current) {
                clearTimeout(tOutActionCamera.current);
            }
        };
    }, [actionCamera]);
    useEffect(() => {
        const rotateCameraId = 'rotateCamera_' + devCurrent.id;
        getItemLocalStore(rotateCameraId).then((e) => {
            if (!e) {
                return;
            }
            aniRotateCamera(e);
        });
        AppState.addEventListener('change', _handleAppStateChange);
        return () => {
            wsControlCamera(devCurrent.id, 'stopcam');
            AppState.removeEventListener('change', _handleAppStateChange);
            if (aniRotateCameraCurrent.current) {
                aniRotateCameraCurrent.current.stop();
            }
        };
    }, []);

    const imgChunks = useRef([]);
    const lisCallBack = useCallback(
        (evt) => {
            let data = evt.data;
            let uri = null;
            let headerUri = 'data:image/jpg;base64,';
            const imgData = new Uint8Array(data);

            if (imgData[1] !== devCurrent.id) return ;
            if (imgData[0] === 0xF0) {
                const imgTemp = imgData.slice(10);
                let imgJpeg = Base64.btoa(String.fromCharCode.apply(null, imgTemp));
                uri = headerUri + imgJpeg;
            } else if (imgData[0] === 0xF1 || imgData[0] === 0xF2) {
                imgChunks.current.push(imgData.slice(10));
            } else if (imgData[0] === 0xF3) {
                imgChunks.current.push(imgData.slice(10));
                uri = headerUri + Base64.btoa(String.fromCharCode.apply(null, merged(imgChunks.current)));
                imgChunks.current = [];
            }
            if (!uri) return ;
            if (!src) {
                return setSrc(uri);
            }
            if (Math.abs(calculateImageSize(uri) - calculateImageSize(src)) > 1) {
                return setSrc(uri);
            }

            if (!isJsonString(evt.data)) return;
            const { cmd, res, userid: uid, devids, msg} = JSON.parse(evt.data)
            if (cmd === 'res' && res === 'deletedev' && userId === uid && msg === 'OK') {
                dispatch(setListDevice(devids));
                if (devids && devids.length) {
                    devids.forEach(({id, type}) => {
                        getDevLogin(id, type);
                    });
                }
                navigation.navigate('Device');
            }
        },
        [camExternal],
    );

    useEffect( () => {
        if (camExternal.use) return ;
        const lis = (evt) => lisCallBack(evt);
        wsListenerMessage(lis);
        return () => {
            wsRemoveListenerMessage(lis);
        }
    }, [camExternal])
    const checkPermissions = async () => {
        const res = await check(
            Platform.select({
                android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
                ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
            }),
        );
        if (res === 'granted') {
            return res;
        }
        return await request(
            Platform.select({
                android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
                ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
            }),
        );
    };
    const timeString = () => {
        const date = new Date();
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        const h = ('0' + date.getHours()).slice(-2);
        const m = ('0' + (date.getMinutes() + 1)).slice(-2);
        const s = ('0' + (date.getSeconds() + 1)).slice(-2);
        return `${day}_${month}_${year}__${h}_${m}_${s}`;
    };
    const actionTakeImage = () => {
        wsControlCamera(devCurrent.id, 'takepic');
        checkPermissions().then((e) => {
            if (e === 'granted') {
                const fileName = timeString() + '.jpg';
                ALBUM.saveImage(fileName, src).then((path) => {
                    setImageSave({src: {uri: src}, fileName, path});
                });
            }
        });
    };
    const actionTakeImageCamExternal = async () => {
        try {
            const per = await checkPermissions()
            if (per !== "granted") return;
            let { ip, port, user, pass, scrips } = camExternal
            if (camExternal.myCam) ip = "115.78.5.184"
            const path = `http://${ip}:${port}/`
            const res = await fetch(path + scrips.snapshot,{headers: { Authorization:`Basic ${Base64.btoa(`${user}:${pass}`)}`}})
            const blob = await res.blob()
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function() {
                const image_data = reader.result.split('base64,')[1];
                let headerUri = 'data:image/jpg;base64,';
                const imageBase64 = headerUri + image_data
                const fileName = timeString() + '.jpg';
                ALBUM.saveImage(fileName, imageBase64).then((path) => {
                    setImageSave({src: {uri: imageBase64}, fileName, path});
                });
            }
        } catch (e) {
            console.log(e)
        }
    }
    const FullScreen = () => {
        if(!fullScreen) {
            if(Platform.OS === 'android') FullScreenMM.enable();
            navigation.setOptions({headerShown: false});
            StatusBar.setHidden(true);
            Orientation.lockToLandscapeLeft();
            setFullScreen(!fullScreen);
        }else {
            if(Platform.OS === 'android') FullScreenMM.disable();
            navigation.setOptions({headerShown: true});
            StatusBar.setHidden(false);
            Orientation.lockToPortrait();
            setFullScreen(!fullScreen);
        }
        return true
    };
    const checkPermissionsRead = async () => {
        const res = await check(
            Platform.select({
                android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
                ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
            }),
        );
        if (res === 'granted') {
            return res;
        }
        return await request(
            Platform.select({
                android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
                ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
            }),
        );
    };
    const goToAlbumCamera = () => {
        checkPermissionsRead().then((e) => {
            if (e === 'granted') {
                navigation.navigate('AlbumCamera');
                wsControlCamera(devCurrent.id, 'stopcam');
            } else {
                dispatch(setToast({show: 'ERROR', data: LG.pleaseAllowTheAppToReadImageFilesFromMemory}));
            }
        });
    };
    // Next, interpolate beginning and end values (in this case 0 and 1)
    const rotateCameraValue = rotateCamera.interpolate({
        inputRange: [0, 90, 180, 360],
        outputRange: ['0deg', '90deg', '180deg', '360deg'],
    });

    useEffect( () => {
        if (!devCurrent) return;
        const lisIp = (evt) => {
            if (!isJsonString(evt.data)) return;
            const { cmd, res, devid, exip } = JSON.parse(evt.data)
            if (cmd === 'res' && res === 'getexip' && devid===devCurrent.id) {
                if (exip) {
                    getItemLocalStore('camera_external_' + devCurrent.id).then( (e) => {
                        if (!e) { setCameExternal({ use: false })}
                        else {
                            const ip = exip.split(':').pop()
                            const { port, user, pass, use, scrips } = e
                            setCameExternal({ip, port, user, pass, use, scrips})
                        }
                    })
                }
            }
        }
        const unsubscribe = navigation.addListener('focus', () => {
            getExIp(devCurrent.id)
            wsListenerMessage(lisIp)
            return () => wsRemoveListenerMessage(lisIp)
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation, devCurrent])
    const controlDoor = (action) => {
        wsControlDoor(devCurrent.id, action);
        Vibration.vibrate(5);
        if (action === 'open') {
            return setActionDoor('open');
        }
        if (action === 'pause') {
            return setActionDoor('pause');
        }
        if (action === 'close') {
            return setActionDoor('close');
        }
    };
    const controlCamExternal = (action) => {
        let { ip, port, user, pass, scrips } = camExternal
        if (camExternal.myCam) ip = "115.78.5.184"
        const path = `http://${ip}:${port}/`
        fetch(path + scrips[action],
            {headers: { Authorization:`Basic ${Base64.btoa(`${user}:${pass}`)}`}})
            .then(r => console.log("ok"))
    }
    const useDoor = (devCurrent.role.split('_').includes('door') || ['admin', 'use'].includes(devCurrent.role))
    return (
        <Animated.View style={[styles.frameDoorCamera, {left}]}>
            <ReviewImageSave
                imageSave={imageSave}
                goToAlbumCamera={goToAlbumCamera}
                close={() => setImageSave(null)}
            />
            {!fullScreen &&
            <View style={styles.header}>
                <NeuButton
                    animatedDisabled={true}
                    disabled={disabled}
                    onPress={Out}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
                <Text style={styles.titleControl}>
                    {devCurrent.name }
                </Text>

                <NeuButton
                    animatedDisabled={true}
                    onPress={() => setSetting(true)}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'cog'} size={20} color={theme.color}/>
                </NeuButton>
            </View>
            }
            <ScrollView style={{ flex: 1 }}>
                <View>
                    {
                        camExternal.use ?
                            <View
                                activeOpacity={0.9}
                                style={!fullScreen ? styles.frameActionCamera : styles.fullScreen}
                            >
                                {
                                    camExternal.myCam ?
                                        <WebView
                                            containerStyle={{ padding: 0, margin:0}}
                                            source={{ uri: `http://admin:admin@115.78.5.184:8899${camExternal.scrips.view}` }}
                                            headers={{ Authorization: `Basic ${Base64.btoa(`admin:admin`)}`}}
                                        /> :
                                        <ShowCamExternal camExternal={camExternal}/>
                                }
                            </View> :
                            <TouchableOpacity
                                onPress={() => {
                                    if (tOutActionCamera.current) clearTimeout(tOutActionCamera.current);
                                    setActionCamera(!actionCamera);
                                }}
                                activeOpacity={0.9}
                                style={!fullScreen ? styles.frameActionCameraESP : styles.fullScreenESP}
                            >
                                <ItemRSSI devCurrent={devCurrent} theme={theme} LG={LG}/>
                                <Animated.View
                                    style={{
                                        width: '100%',
                                        flex: 1,
                                        transform: [{rotate: rotateCameraValue}],
                                    }}
                                >
                                    <ShowCamera src={src} setting={setting}/>
                                </Animated.View>
                            </TouchableOpacity>
                    }
                    {
                        actionCamera &&
                        <View style={styles.actionCamera}>
                            <View style={styles.groupAction}>
                                <TouchableOpacity onPress={() => rotateCameraView('right')}>
                                    <Icon name={'redo'} size={22} color={'#FFF'} style={styles.transform180}/>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => rotateCameraView('left')}>
                                    <Icon name={'redo'} size={22} color={'#FFF'}/>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.groupAction}>
                                <TouchableOpacity onPress={() => ActionCam()}>
                                    <Icon name={actionCam === 'startcam' ? 'stop' : 'play'} size={22} color={'#FFF'}/>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => FullScreen() }>
                                    <Icon name={'expand'} size={22} color={'#FFF'}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                </View>
                {!fullScreen &&
                    <View style={styles.frameActionDoor}>
                        <View style={styles.groupTitleDoor}>
                            <View style={styles.symbolItem}/>
                            <Text style={styles.titleControlDoor}>{LG.doorController}</Text>
                        </View>
                        <View style={[styles.actionDoor, { justifyContent: "space-around"}]}>
                            <NeuButton
                                animatedDisabled={true}
                                onPress={() => {
                                    if (camExternal.use) return actionTakeImageCamExternal()
                                    else actionTakeImage()
                                }}
                                color={theme.newButton}
                                width={45} height={45}
                                borderRadius={15}
                            >
                                <Icon name={'camera'} size={20} color={theme.color}/>
                            </NeuButton>
                            <NeuButton
                                style={{ opacity: useDoor ? 1:0.4}}
                                animatedDisabled={true}
                                onPress={() => {
                                    if (!useDoor) return ;
                                    controlDoor('open')
                                }}
                                color={theme.newButton}
                                width={45} height={45}
                                borderRadius={15}
                            >
                                {
                                    actionDoor === 'open' ?
                                        <View style={{width: '80%', height: '80%', transform: [{rotate: '-180deg'}]}}>
                                            <Animation
                                                loop
                                                autoPlay
                                                source={doordown}
                                            />
                                        </View>
                                        :
                                        <Icon name={'angle-double-up'} size={20} color={theme.color}/>
                                }
                             </NeuButton>
                            <NeuButton
                                style={{ opacity: useDoor ? 1:0.4}}
                                animatedDisabled={true}
                                onPress={() => {
                                    if (!useDoor) return ;
                                    controlDoor('pause')
                                }}
                                color={theme.newButton}
                                width={45} height={45}
                                borderRadius={15}
                            >
                                <Icon name={actionDoor !== 'pause' ? 'stop' : 'play'} size={20} color={theme.color}/>
                            </NeuButton>
                            <NeuButton
                                style={{ opacity: useDoor ? 1:0.4}}
                                animatedDisabled={true}
                                onPress={() => {
                                    if (!useDoor) return ;
                                    controlDoor('close')
                                }}
                                color={theme.newButton}
                                width={45} height={45}
                                borderRadius={15}
                            >
                                {
                                    actionDoor === 'close' ?
                                        <View style={{width: '80%', height: '80%'}}>
                                            <Animation
                                                loop
                                                autoPlay
                                                source={doordown}
                                            />
                                        </View>
                                        :
                                        <Icon name={'angle-double-down'} size={20} color={theme.color}/>
                                }
                            </NeuButton>
                            <NeuButton
                                animatedDisabled={true}
                                onPress={() => goToAlbumCamera()}
                                color={theme.newButton}
                                width={45} height={45}
                                borderRadius={15}
                            >
                                <Icon name={'images'} size={20} color={theme.color}/>
                            </NeuButton>
                        </View>
                        { camExternal.use &&
                        <>
                            <TouchableOpacity
                                activeOpacity={1}
                                onLongPress={ () => {
                                    setCameExternal({ ...camExternal, ...{ myCam: !camExternal.myCam }})
                                }}
                                delayLongPress={3000}
                                style={styles.groupTitleDoor}>
                                <View style={styles.symbolItem}/>
                                <Text style={styles.titleControlDoor}>{LG.cameraController}</Text>
                            </TouchableOpacity>
                            <View style={[styles.actionDoor, { justifyContent: "space-around"}]}>
                                <NeuButton
                                    onPress={ () => controlCamExternal('up') }
                                    animatedDisabled={true}
                                    color={theme.newButton}
                                    width={45} height={45}
                                    borderRadius={15}
                                >
                                    <Icon name={'arrow-up'} size={20} color={theme.color}/>
                                </NeuButton>
                                <NeuButton
                                    onPress={ () => controlCamExternal('down') }
                                    animatedDisabled={true}
                                    color={theme.newButton}
                                    width={45} height={45}
                                    borderRadius={15}
                                >
                                    <Icon name={'arrow-down'} size={20} color={theme.color}/>
                                </NeuButton>
                                <NeuButton
                                    onPress={ () => controlCamExternal('left') }
                                    style={{ opacity: useDoor ? 1:0.4}}
                                    animatedDisabled={true}
                                    color={theme.newButton}
                                    width={45} height={45}
                                    borderRadius={15}
                                >
                                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                                </NeuButton>
                                <NeuButton
                                    onPress={ () => controlCamExternal('right') }
                                    animatedDisabled={true}
                                    color={theme.newButton}
                                    width={45} height={45}
                                    borderRadius={15}
                                >
                                    <Icon name={'arrow-right'} size={20} color={theme.color}/>
                                </NeuButton>
                            </View>
                        </>
                        }
                    </View>
                }
            </ScrollView>
            {setting && <Setting close={() => setSetting(false)}/>}
        </Animated.View>
    );
};

const ItemRSSI = ({devCurrent}) => {
    const rssi = devCurrent.rssi;
    if (!rssi) return <></>
    return (
        <View style={{position:'absolute', top:15, left:15, zIndex:1, opacity:0.5}}>
            <Text style={{color: 'green'}}>{rssi + ' dBm'}</Text>
        </View>
    );
};

const ShowCamExternal = ({camExternal}) => {
    const [ path, setPath ] = useState(null)
    const { ip, port, user, pass, scrips } = camExternal
    useEffect( () => {
        const p = `http://${user}:${pass}@${ip}:${port}${scrips.view}`
        setPath(p)
    }, [camExternal])
    return (
        <>
            <WebView
                containerStyle={{ padding: 0, margin:0}}
                source={{ uri: path }}
                headers={{Authorization: `Basic ${Base64.btoa(`${user}:${pass}`)}`}}
            />
        </>
    )
}

const ShowCamera = ({src, setting}) => {
    const [source, setSource] = useState(null);
    useEffect(() => {
        if (setting) return;
        if (src) {
            setSource(src);
        }
    }, [src,setting]);
    if (!source) {
        return (
            <Animated.View
                style={{
                    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                <ActivityIndicator size="large" color="#00ff00"/>
            </Animated.View>
        );
    }
    return (
        <WebView
            containerStyle={{ padding: 0, margin:0}}
            originWhitelist={['*']}
            contentMode={'mobile'}
            pullToRefreshEnabled={true}
            source={{html: '<body style="margin: 0 !important;padding: 0 !important;"><embed type="image/jpg" style="object-fit:cover;background-color: #353A40" width="100%" height="100%" src="' + source + '" /></body>'}}
        />
    );
};

const ReviewImageSave = ({imageSave, close, goToAlbumCamera}) => {
    if (!imageSave) {
        return <></>;
    }
    const {path, src, fileName} = imageSave;
    const aniBottom = useAnimatedCallback({value: -60, listTo: [40, -60], duration: 400, easing: Easing.bounce});
    const bottom = aniBottom.value;
    const [aniShow, aniHide] = aniBottom.animates;
    const shareImage = () => {
        try {
            if (Platform.OS === 'android') {
                openChooserWithOptions({imageUrl: path, type: "image/jpg"}, "Chia sẽ ảnh");
            }
            if (Platform.OS === 'ios') {
                return Share.share({ url: path })
            }
        } catch (e) {
            console.log(e)
        }
    }
    useEffect(() => {
        aniShow.start();
        const tu = setTimeout(() => {
            aniHide.start(close);
        }, 5000);
        return () => {
            aniHide.start(close);
            clearTimeout(tu);
        };
    }, []);

    return (
        <Animated.View style={{
            position: 'absolute', zIndex: 3,
            bottom: bottom,
        }}>
            <TouchableOpacity
                onPress={goToAlbumCamera}
                style={{
                    flex: 1,
                    width: width - 40, height: 60,
                    marginHorizontal: 20, borderRadius: 20, paddingHorizontal: 15,
                    flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',
                    backgroundColor: '#FFF',
                }}
            >
                <Image
                    source={src} resizeMode={'center'}
                    style={{width: 50, height: 50, borderRadius: 25, marginRight: 20}}
                />
                <Text style={{width: '50%'}}>
                    {fileName}
                </Text>
                <TouchableOpacity
                    onPress={shareImage}
                    style={{position: 'absolute', width: 80, right: 20}}
                >
                    <Text style={{color: 'blue', alignSelf: 'flex-end'}}> Chia sẻ </Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

const style = (setTheme) => {
    const {color, backgroundColor} = setTheme;
    return (
        StyleSheet.create({
            frameDoorCamera: {
                backgroundColor,
                flex: 1,
            },
            header: {
                paddingHorizontal: 20,
                paddingVertical: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            },
            titleControl: {
                flex: 1,
                textAlign: 'center',
                textAlignVertical: 'center',
                fontSize: 20,
                color,
                fontWeight: 'bold',
            },
            frameActionCamera: {
                width,
                height: width-50,
                backgroundColor: '#353A40',
                paddingVertical: '10%'
            },
            fullScreen: {
                position: 'relative',
                width: height,
                height: width ,
                backgroundColor: '#353A40',
            },
            frameActionCameraESP: {
                width,
                height: width,
                backgroundColor: '#353A40',
            },
            fullScreenESP: {
                position: 'relative',
                width: height,
                height: width ,
                backgroundColor: '#353A40',
            },
            frameActionDoor: {
                paddingHorizontal: 20,
                height: 250,
            },
            actionCamera: {
                position: 'absolute',
                bottom: 0,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 56,
                backgroundColor: 'transparent',
                paddingHorizontal: 20,
            },
            groupAction: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: 80,
            },
            groupTitleDoor: {
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 20,
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
            actionDoor: {
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingTop: 20,
                paddingBottom: 10,
            },
            transform180: {transform: [{matrix: [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]}]},
        })
    );
};

export default DoorCamera;
