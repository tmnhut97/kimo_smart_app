import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, SafeAreaView, Easing, Text, Animated, Platform} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import {NavigationContainer} from '@react-navigation/native';
import {Provider, useSelector} from 'react-redux';
import store from './redux/store';
import NetInfo from '@react-native-community/netinfo';
import ToastCustom from './screens/ToastCustom';
import {closeSocket, server, ws} from './Socket';
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import Router from './Router';
import useAnimatedCallback from './animated/useAnimatedCallback';
import BackgroundService from "./BackgroundService";
import {check, PERMISSIONS, request} from "react-native-permissions";
const {width, height} = Dimensions.get('screen');
const App = () => {
    useEffect(() => {
        Orientation.lockToPortrait();
        return () => {
            closeSocket();
        };
    }, []);
    return (
        <Provider store={store}>
            <NavigationContainer theme={{colors: {background: 'transparent'}}}>
                <SafeAreaView
                    forceInset={{horizontal: 'never'}}
                    style={[{backgroundColor: 'transparent', flex: 1}]}>
                    <Router/>
                    <ToastCustom/>
                    <Network/>
                </SafeAreaView>
            </NavigationContainer>
        </Provider>
    );
};

const Network = () => {
    const LG = useSelector((state) => state.languages.language)
    const [isInternetReachable, setIsInternetReachable] = useState('connecting');
    const ani = useAnimatedCallback({
        value: (height / 2 + 20),
        listTo: [(height / 2 + 20), 0],
        duration: 1000,
        easing: Easing.bounce,
    });
    const bottom = ani.value;
    const [aniStart, aniStop] = ani.animates;
    useEffect(() => {
        aniStart.start()
        setTimeout(() => {
            aniStop.start();
        }, 2000);
    }, []);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (!state.isConnected || !state.isInternetReachable) {
                setIsInternetReachable('noConnect');
            }else {
                if (ws) {
                    ws.close();
                }
                setIsInternetReachable('connecting');
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);

    if (isInternetReachable === 'connecting')  return <></>;
    return (
        <Animated.View style={{
            position: 'absolute',
            width,
            height: 40,
            bottom,
            backgroundColor: '#353A40',
            opacity: 0.8,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',

        }}>
            <IconMaterialCommunity name="wifi-off" size={25} color="#FFF"/>
            <Text style={{fontSize: 13, marginVertical: 20, marginHorizontal: 10, color: '#FFF'}}>
                {LG.noInternetConnectionAvailable}
            </Text>
        </Animated.View>
    );
};
export default App;
