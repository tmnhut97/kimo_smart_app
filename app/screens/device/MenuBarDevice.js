import React, {useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Alert,
    Dimensions,
    PanResponder,
    Easing, BackHandler,
} from 'react-native';
import {getItemLocalStore, removeItemLocalStore, setItemLocalStore} from '../../mFun';
import {useNavigation} from '@react-navigation/native';
import {closeSocket} from '../../Socket';
import useAnimatedCallback from '../../animated/useAnimatedCallback';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {NeuButton} from '../NeuView';
const {width} = Dimensions.get('screen');
const MenuBarDevice = ({close}) => {
    const navigation = useNavigation();
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) => state.themes.theme)
    const isUserShare = useSelector((state) => state.isUserShare)
    const styles = style(theme)
    const ani = useAnimatedCallback({value: -510, listTo: [0, -510], duration: 200});
    const bottom = ani.value;
    const [animStart, animStop] = ani.animates;
    const userId = useSelector(state => state.userIdCurrent)

    useEffect(() => {
        animStart.start();
    }, []);
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
        BackHandler.addEventListener('hardwareBackPress', Close)
        return () => BackHandler.removeEventListener('hardwareBackPress', Close)
    },[])
    const logOut = () => {
        Alert.alert(LG.logOut, LG.doYouWantToLogOut, [
            {
                text: LG.cancel,
                onPress: () => null,
                style: 'cancel',
            },
            {
                text: LG.logOut, onPress: () => {
                    removeItemLocalStore('user').then(() => {
                        navigation.navigate('Welcome')
                        closeSocket();
                    })
                },
            },
        ]);
        return true;
    };
    const [fingerprint, setFingerprint] = useState(false);
    const activeFingerprint = async () => {
        const {account, pass} = await getItemLocalStore('user' )
        const opp = fingerprint ? {
            title: LG.fingerprintUnlock,
            msg: LG.haveYouCanceledAFingerprintForThisAccountToLogInWithFingerprints,
            onPress: () => {removeItemLocalStore('fingerprint_' + userId).then(() => setFingerprint(false) );}
        } : {
            title: LG.fingerprintUnlock,
            msg: LG.useYourFingerprintLoginForTheCurrentAccount,
            onPress: () => {setItemLocalStore('fingerprint_' + userId, { account, pass}).then(() => setFingerprint(true) ); }
        }
        Alert.alert(
            opp.title, opp.msg,
            [
                { text: LG.cancel, onPress: () => {}, style: 'cancel'},
                { text: LG.oke, onPress: opp.onPress },
            ],
            {cancelable: false},
        );
    };
    const checkFingerprint = async () => {
        const fingerprint = await getItemLocalStore('fingerprint_' + userId)
        if (fingerprint) return true
        return false
    }
    useEffect(() => {
        checkFingerprint().then( (e) => setFingerprint(e));
    }, []);
    return (
        <>
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => Close()}
                style={styles.opacity}
            />
            <Animated.View style={[styles.frame_bars, {bottom}]}>
                <View  {...panResponder.panHandlers} style={styles.contentModal}>
                    <View
                          style={[{paddingTop: 10, paddingBottom:15, width: '100%', justifyContent:'center', flexDirection:'row', backgroundColor: 'transparent'}]}>
                        <NeuButton
                            animatedDisabled={true}
                            active={true}
                            color={theme.newButton}
                            width={70} height={5}
                            borderRadius={20}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={ () => navigation.navigate('Language')}
                    >
                        <View style={[styles.option]}>
                            <View style={{width:30, alignItems:'center'}}>
                                <FontAwesome5Icon name={'globe'} size={25} color={theme.color} />
                            </View>
                            <Text style={[styles.textOption, {color: theme.color }]}>{LG.language}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={ () => navigation.navigate('Theme')}
                    >
                        <View style={[styles.option]}>
                            <View style={{width:30, alignItems:'center'}}>
                                <FontAwesome5Icon name={'brush'} size={25} color={theme.color} />
                            </View>
                            <Text style={[styles.textOption, {color: theme.color }]}>{LG.theme}</Text>
                        </View>
                    </TouchableOpacity>
                    {/*<TouchableOpacity*/}
                    {/*    onPress={() => activeFingerprint()}*/}
                    {/*>*/}
                    {/*    <View style={[styles.option]}>*/}
                    {/*        <View style={{width:30, alignItems:'center'}}>*/}
                    {/*            <MaterialCommunityIcons name={'fingerprint'} size={25} color={theme.color} />*/}
                    {/*        </View>*/}
                    {/*        <Text style={[styles.textOption, {color: theme.color }]}>{LG.fingerprintUnlock}</Text>*/}
                    {/*        <Text style={{position:'absolute', right:15, color:fingerprint ? 'red' : 'gray'}}>{fingerprint ? LG.active : ''}</Text>*/}
                    {/*    </View>*/}
                    {/*</TouchableOpacity>*/}
                    {
                        !isUserShare &&
                        <TouchableOpacity
                            onPress={ () => navigation.navigate('ListShareDevice')}
                        >
                            <View style={[styles.option]}>
                                <View style={{width:30, alignItems:'center'}}>
                                    <FontAwesome5Icon name={'share-alt'} size={25} color={theme.color} />
                                </View>
                                <Text style={[styles.textOption, {color: theme.color }]}>{LG.accountsShare}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                    {
                        !isUserShare &&
                        <TouchableOpacity
                            onPress={ () => navigation.navigate('AddDeviceWithCode')}
                        >
                            <View style={[styles.option]}>
                                <View style={{width:30, alignItems:'center'}}>
                                    <FontAwesome5Icon name={'plus'} size={25} color={theme.color} />
                                </View>
                                <Text style={[styles.textOption, {color: theme.color }]}>{LG.addDeviceWithCode}</Text>
                            </View>
                        </TouchableOpacity>
                    }

                    {/*<TouchableOpacity*/}
                    {/*    onPress={ () => navigation.navigate('BackgroundControl')}*/}
                    {/*>*/}
                    {/*    <View style={[styles.option]}>*/}
                    {/*        <View style={{width:30, alignItems:'center'}}>*/}
                    {/*            <FontAwesome5Icon name={'wifi'} size={25} color={theme.color} />*/}
                    {/*        </View>*/}
                    {/*        <Text style={[styles.textOption, {color: theme.color }]}>{LG.connectWifi}</Text>*/}
                    {/*    </View>*/}
                    {/*</TouchableOpacity>*/}
                    {/*<TouchableOpacity*/}
                    {/*    onPress={ () => navigation.navigate('BackgroundLocation')}*/}
                    {/*>*/}
                    {/*    <View style={[styles.option]}>*/}
                    {/*        <View style={{width:30, alignItems:'center'}}>*/}
                    {/*            <FontAwesome5Icon name={'map-marker'} size={25} color={theme.color} />*/}
                    {/*        </View>*/}
                    {/*        <Text style={[styles.textOption, {color: theme.color }]}>{LG.location}</Text>*/}
                    {/*    </View>*/}
                    {/*</TouchableOpacity>*/}
                    <TouchableOpacity
                        onPress={logOut}
                    >
                        <View style={[styles.option]}>
                            <View style={{width:30, alignItems:'center'}}>
                                <FontAwesome5Icon name={'sign-out-alt'} style={{ transform: [{ rotate: "180deg" }]}} size={25} color={theme.color} />
                            </View>
                            <Text style={[styles.textOption, {color:  theme.color}]}>{LG.logOut}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                {/*<TouchableOpacity*/}
                {/*    onPress={() => animStop.start(close)}*/}
                {/*    style={styles.frameClose}*/}
                {/*>*/}
                {/*    <Text style={{fontSize: 20, fontWeight: '700', color: '#0499E6'}}>{LG.cancel}</Text>*/}
                {/*</TouchableOpacity>*/}
            </Animated.View>
        </>
    );
};

const style = (setTheme) => {
    const {backgroundColor,button} = setTheme
    return StyleSheet.create({
        frame_bars: {
            position: 'absolute',
            maxHeight: 620,
            width: width - 30,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            margin: 15,
            zIndex: 100,
        },
        contentModal: {
            borderWidth:5,
            borderColor:button,
            backgroundColor,
            borderRadius: 10,
            paddingVertical: 15,
        },
        option: {
            marginTop: 10,
            flexDirection:'row',
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
        opacity: {
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            position: 'absolute',
            opacity: 0.6,
            zIndex: 2,
        },
        frameClose: {
            backgroundColor,
            marginTop: 10,
            paddingVertical: 15,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
        },
    });
}
export default MenuBarDevice;
