import React, {useEffect, useState} from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    BackHandler,
    FlatList
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import {NeuButton} from '../NeuView';
import useAnimatedCallback from '../../animated/useAnimatedCallback';
import {
    emitGetAccountsShare,
    wsListenerMessage,
    wsRemoveListenerMessage,
} from '../../Socket';
import {isJsonString} from '../../mFun';
import {setToast} from '../../redux/reducer/toastReducer';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
const {width} = Dimensions.get('screen');
const ListShareDevice = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const userId = useSelector(state => state.userIdCurrent);
    const theme = useSelector((state) => state.themes.theme);
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
    const LG = useSelector((state) => state.languages.language);
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

    const [data, setData] = useState([]);
    const lis = (evt) => {
        if (!isJsonString(evt.data)) {
            return;
        }
        const {cmd, res, msg, userid: uid, info} = JSON.parse(evt.data);
        if (cmd === 'res' && res === 'getaccshare' && msg === 'OK' && uid === userId) {
            setData(info);
        }

        if (cmd === 'res' && res === 'deleteuser') {
            if (msg === 'OK') {
                dispatch(setToast({show: 'SUCCESS', data: LG.deletedSuccessfully}));
                emitGetAccountsShare();
            }
            if (msg === 'ERROR') {
                if (type === 'fullname') {
                    dispatch(setToast({show: 'ERROR', data: LG.fullNameMustBeFromCharacters}));
                }
            }

        }
    };
    useEffect(() => {
        wsListenerMessage(lis);
        return () => wsRemoveListenerMessage(lis);
    }, []);

    useEffect(() => {
        return navigation.addListener('focus', emitGetAccountsShare);
    }, [navigation]);
    const styles = style(theme);
    return (
        <Animated.View style={[styles.frameTheme, {left}]}>
            <View style={styles.header}>
                <NeuButton
                    onPress={Out}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
                <Text style={{fontSize: 24,
                    color: theme.color,
                    fontWeight: 'bold'}}>{LG.accountsShare}</Text>
                {data.length ?
                    <NeuButton
                        onPress={() => navigation.navigate('ShareDevice')}
                        color={theme.newButton}
                        width={45} height={45}
                        borderRadius={22.5}
                    >
                        <Icon name={'plus'} size={20} color={theme.color}/>
                    </NeuButton>
                    :
                    <View style={{width:45}}/>
                }
            </View>
            <FlatList
                style={{marginTop:10}}
                ListEmptyComponent={
                    <View style={{width: '100%', paddingTop: '30%', justifyContent: 'center', alignItems: 'center'}}>
                        <View style={{justifyContent: 'center', alignItems: 'center'}}>
                            <FontAwesome5Icon name={'user-circle'} size={120} color={theme.color}/>
                            <Text  style={{color:theme.color, marginVertical:30}}>
                                {LG.noAccountYet}
                            </Text>
                            <NeuButton
                                onPress={() => navigation.navigate('ShareDevice')}
                                color={theme.newButton}
                                width={150} height={50}
                                style={{marginBottom: 10}}
                                borderRadius={6}
                            >
                                <View
                                    style={{ flexDirection: 'row',  alignItems: 'center',}}
                                >
                                    <FontAwesome5Icon name={'plus'} size={25} color={theme.color}/>
                                </View>
                            </NeuButton>
                        </View>
                    </View>
                }
                data={data}
                renderItem={({item}) =>
                    <ItemAccount item={item} theme={theme}/>
                }
                keyExtractor={(item, index) => index.toString()}
            />
        </Animated.View>
    );
};
const ItemAccount = ({item, theme}) => {
    const LG = useSelector((state) => state.languages.language)
    const navigation = useNavigation();
    const {fullname, status, devs} = item;
    return (
        <NeuButton
            onPress={() => {
                if(status === 'deleted') return navigation.navigate('ViewShareDevice', {item})
                navigation.navigate('EditShareInfo', {item})
            }}
            style={{marginTop: 10, marginLeft: 10, marginBottom: 10}}
            color={theme.newButton}
            width={width - 50}
            height={90}
            borderRadius={15}
        >
            <View style={{width: '100%', padding: 15, height: '100%'}}>
                <Text style={{color:theme.color}}>{LG.account}</Text>
                <Text style={{color:theme.color}}>
                    {fullname.substr(2)}
                </Text>
                <View style={{position: 'absolute', top: 10, right: 10, fontSize: 12}}>
                    {
                        status === 'deleted' && <Text style={{color: 'gray'}}>{LG.accountDeleted}</Text> ||
                        status === 'disabled' && <Text style={{color: 'gray'}}>{LG.accountLock}</Text> ||
                        status === 'active' && <Text style={{color: 'green'}}>{LG.active}</Text> || ''
                    }
                </View>
                <View>
                    <Text style={{color:theme.color}} >{LG.device}: {devs.length}</Text>
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: -10,
                            paddingRight: 20, borderRadius: 8,
                            flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
                        }}
                    >
                        {status !== 'deleted' &&
                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditDevices', {item})}
                            >
                                <Icon name={'tablet'} size={25} color={'blue'}/>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>
        </NeuButton>
    );
};

const style = (setTheme) => {
    const {backgroundColor} = setTheme;
    return StyleSheet.create({
        frameTheme: {
            flex: 1,
            backgroundColor,
            paddingHorizontal: 15,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            justifyContent: 'space-between',
            height: 70,
            width: width - 30,
        },
    });
};
export default ListShareDevice;
