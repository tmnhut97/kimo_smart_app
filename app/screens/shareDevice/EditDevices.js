import React, {useEffect, useState} from 'react';
import {
    Text,
    View,
    StyleSheet,
    Dimensions,
    Animated,
    BackHandler, FlatList, TouchableOpacity,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import {NeuButton} from '../NeuView';
import useAnimatedCallback from '../../animated/useAnimatedCallback';
import {
    emitAddDevToUser,
    emitDeleteDev,
    wsListenerMessage,
    wsRemoveListenerMessage,
} from '../../Socket';
import {isJsonString} from '../../mFun';
import {NoDevices} from '../../assets/imageSVG';

const {width, height} = Dimensions.get('screen');

const EditDevices = ({route}) => {
    const LG = useSelector((state) =>  state.languages.language)
    const {item} = route.params;
    const navigation = useNavigation();
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
    const [devs, setDevs] = useState([]);
    const [devsNoShare, setDevsNoShare] = useState([]);

    useEffect(() => {
        if (item) {
            setDevs(item.devs);
        }
    }, [item]);
    const devices = useSelector(state => state.devices.list);
    useEffect(() => {
        if (devs) {
            const d = devices.filter(({id}) => !devs.map(({id}) => id).includes(id));
            setDevsNoShare([...d]);
        }
    }, [devs]);
    const lisDevs = (evt) => {
        if (!isJsonString(evt.data)) {
            return;
        }
        const {cmd, res, msg, userid: uid, devids} = JSON.parse(evt.data);
        if (cmd === 'res' && ['deletedev', 'adddev'].includes(res) && item._id === uid && msg === 'OK') {
            setDevs(devids);
        }
    };
    useEffect(() => {
        wsListenerMessage(lisDevs);
        return () => wsRemoveListenerMessage(lisDevs);
    }, [item]);
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
            </View>
            <Text style={{
                marginLeft: 15,
                fontSize: 18,
                color: theme.color,
                fontWeight: 'bold',
            }}>
                {LG.account}: {item.fullname.substr(2)}
            </Text>
            <Text style={{color: theme.color, padding: 15, fontSize: 16, fontWeight: '600'}}>
                {LG.listOfSharedDevices}
            </Text>
            <View style={{maxHeight: 300}}>
                <FlatList
                    ListEmptyComponent={ListEmptyComponent}
                    data={devs}
                    renderItem={({item: itemdev}) =>
                        <ItemDeviceShare item={itemdev} theme={theme} userid={item._id}/>
                    }
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>

            <Text style={{color: theme.color, padding: 15, fontSize: 16, fontWeight: '600'}}>
                {LG.listOfUnsharedDevices}
            </Text>
            <View style={{flex: 1}}>
                <FlatList
                    ListEmptyComponent={ListEmptyComponent}
                    data={devsNoShare}
                    renderItem={({item: itemdev}) =>
                        <ItemDeviceNoShare item={itemdev} theme={theme} username={item.username}/>
                    }
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </Animated.View>
    );
};


const ItemDeviceNoShare = ({item, username, theme}) => {
    const {id, name} = item;
    const addDev = () => {
        emitAddDevToUser(username, id, 'use');
    };
    return (
        <NeuButton
            style={{marginTop: 10, marginBottom: 10}}
            color={theme.newButton}
            width={width - 40} height={60}
            borderRadius={22.5}
        >
            <View style={{width: '100%', paddingHorizontal: 25, flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: theme.color}}>
                    {name}
                </Text>
                <TouchableOpacity onPress={addDev}>
                    <Icon name={'plus'} size={20} color={'blue'}/>
                </TouchableOpacity>
            </View>
        </NeuButton>
    );
};
const ItemDeviceShare = ({item, userid, theme}) => {
    const {id, name} = item;
    const deleteDev = () => {
        emitDeleteDev(id, userid);
    };
    return (
        <NeuButton
            style={{marginTop: 10, marginBottom: 10}}
            color={theme.newButton}
            width={width - 40} height={60}
            borderRadius={22.5}
        >
            <View style={{width: '100%', paddingHorizontal: 25, flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: theme.color}}>
                    {name}
                </Text>
                <TouchableOpacity
                    onPress={deleteDev}
                >
                    <Icon name={'trash'} size={20} color={'blue'}/>
                </TouchableOpacity>
            </View>
        </NeuButton>
    );
};

const ListEmptyComponent = () => {
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    return (
        <View style={{width: '100%', marginTop: 20, justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
                style={{justifyContent: 'center', alignItems: 'center'}}>
                {NoDevices}
                <Text style={{marginVertical: 30, fontSize: 18, color: theme.color}}>{LG.noDevice}</Text>
            </TouchableOpacity>
        </View>
    );
};


const style = (setTheme) => {
    const {color, backgroundColor, button} = setTheme;
    return StyleSheet.create({
        frameTheme: {
            width,
            height,
            backgroundColor,
            paddingHorizontal: 15,
            position: 'absolute',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
            justifyContent: 'space-between',
            height: 70,
            width: width - 30,
        },
        bttLogin: {
            marginTop: 25,
            width: '100%',
            paddingHorizontal: 40,
            backgroundColor: button,
            borderRadius: 10,
            paddingVertical: 16,
        },
        txtLogin: {
            color,
            fontWeight: '700',
            fontSize: 20,
            alignSelf: 'center',
            textAlignVertical: 'center',
        },
    });
};
export default EditDevices;
