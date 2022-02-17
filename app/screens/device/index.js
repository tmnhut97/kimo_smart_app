import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Alert,
    View, Text, BackHandler,
    Animated, StyleSheet, Dimensions, RefreshControl, ScrollView, Image, TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import {useDispatch, useSelector} from 'react-redux';
import ItemDevice from './ItemDevice';
import MenuBarDevice from './MenuBarDevice';
import {useNavigation} from '@react-navigation/native';
import {getDevLogin } from '../../Socket';
import {NeuButton} from '../NeuView';
import {setDeviceIdCurrent} from '../../redux/reducer/deviceReducer';
import DragSortableView from '../DragSortableView';
import {setToast} from '../../redux/reducer/toastReducer';
import {
    getItemLocalStore,
    removeAccents,
    setItemLocalStore,
    removeItemLocalStore,
} from '../../mFun';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {NoDevices} from '../../assets/imageSVG';
import VoiceControl from "../VoiceControl";
const {width} = Dimensions.get('screen');

const Device = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
    const scrollRef = useRef(null);
    const [showBar, setShowBar] = useState(false);
    const devices = useSelector(state => state.devices.list);
    const numDevShared = useSelector(state => state.devices.shared.length);
    const userId = useSelector(state => state.userIdCurrent)
    const backAction = () => {
        Alert.alert(LG.exitApp, LG.doYouWantToExitApp, [
            {
                text: LG.cancel,
                onPress: () => null,
                style: 'cancel',
            },
            {
                text: LG.exitApp, onPress: () => { BackHandler.exitApp() },
            },
        ]);
        return true;
    };

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', backAction);
        return () =>
            BackHandler.removeEventListener('hardwareBackPress', backAction);
    }, []);
    const [data, setData] = useState([0]);
    const loadDevices = (devices) => {
        try {
            let list = devices
            getItemLocalStore('index_item_' + userId).then( (indexItem) => {
                if (indexItem) {
                    indexItem.forEach((item) => {
                        const index = list.findIndex(({id}) => id === item.id);
                        if (index < 0) {
                            return;
                        }
                        const temp = [...list];
                        const b = temp[item.index];
                        temp[item.index] = temp[index];
                        temp[index] = b;
                        list = temp;
                    });
                }
                const temp = list.filter((e) => e)
                setData(temp);
                return setItemLocalStore('index_item_' + userId, temp.map(({id}, index) => ({id, index})))
            });
        } catch (e) {
            console.log(e)
            removeItemLocalStore('index_item_' + userId).then(r => setData(devices))
        }
    };
    useEffect(() => {
        if (devices.length) {
            return loadDevices(devices)
        } else {
            setData([]);
        }
    }, [devices]);
    const [name, setName] = useState('');
    useEffect( () => {
        getItemLocalStore('user').then((user) => {
            if (!user) return ;
            const t = user.fullname.split(' ')
            setName(t[t.length-1])
        }).catch( (e) => console.log(e));

    }, [])

    const onRefreshControl = useCallback(() => devices.forEach(({id, type}) => {
        getDevLogin(id, type);
    }), [devices]);
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [isEditState, setIsEditState] = useState(false);
    const onSelectedDragStart = () => {
        if (!isEditState) {
            setIsEditState(true);
        }
    };

    const numDevice = data.length;
    const dWidth = (width > 500 && (width) / 3 - 5 || (width) / 2 - 10)
    return (
        <Animated.View style={[styles.body, {flex: 1}]}>
            <View style={[styles.frame_top]}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 15,
                }}>
                    <TouchableOpacity
                        // onPress={() => navigation.navigate('Profile')}
                        style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                        <Image style={{height: 40, width: 40}} source={require('../../assets/Avatar.png')}/>
                        <Text style={{marginLeft:12, color: theme.color, fontSize: 16, fontWeight: '700'}}>{LG.hello}, {LG.nameLanguage ==="VN" ? name : removeAccents(name)} !</Text>
                    </TouchableOpacity>
                    <View style={styles.menu_bar}>
                        {
                            !data.length <= 0 &&
                            <NeuButton
                                animatedDisabled={true}
                                onPress={() => {
                                    navigation.navigate('AddDevice');
                                }}
                                color={theme.newButton}
                                width={40} height={40}
                                borderRadius={6}
                            >
                                <Icon name={'plus'} size={20} color={theme.color}/>
                            </NeuButton>
                        }
                        <NeuButton
                            animatedDisabled={true}
                            style={{marginLeft:20}}
                            onPress={() => setShowBar(!showBar)}
                            color={theme.newButton}
                            width={40} height={40}
                            borderRadius={6}
                        >
                            <Icon name={'bars'} size={20} color={theme.color}/>
                        </NeuButton>
                    </View>
                </View>
                <Text style={styles.title}>{LG.listDevice}</Text>
                <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: "center"}}>
                    <Text style={styles.number_device}>{LG.amount}: {numDevice}</Text>
                    {   numDevShared>0 &&
                        <TouchableOpacity
                            onPress={ () => navigation.navigate('ListSharedDevice')}
                        >
                            <Text style={styles.number_device}>{LG.youAreShared}: {numDevShared} {LG.device.toLowerCase()}</Text>
                        </TouchableOpacity>
                    }
                </View>
            </View>
            {showBar && <MenuBarDevice close={() => setShowBar(false)}/>}
            <ScrollView
                ref={(r) => scrollRef.current = r}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    !isEditState ?
                        <RefreshControl refreshing={false} onRefresh={onRefreshControl}/> : null
                }
                scrollEnabled={scrollEnabled}
                style={{flex: 1}}
            >

                {
                    data.length <= 0 ?
                        <View style={{marginTop: 100, alignItems: 'center'}}>
                            <View style={{marginLeft: 25}}>
                                {NoDevices}
                            </View>
                            <Text style={{marginVertical: 30, fontSize: 18, color: theme.color}}>{LG.noDevice}</Text>
                            <NeuButton
                                onPress={() => navigation.navigate('AddDevice')}
                                color={theme.newButton}
                                width={150} height={50}
                                style={{marginBottom: 10}}
                                borderRadius={6}
                            >
                                <View
                                    style={{flexDirection: 'row', alignItems: 'center'}}
                                >
                                    <FontAwesome5Icon name={'plus'} size={25} color={theme.color}/>
                                    <Text
                                        style={{marginLeft: 10, fontSize: 16, color: theme.color}}>{LG.addDevice}</Text>
                                </View>
                            </NeuButton>
                        </View>
                        :
                        <DragSortableView
                            setScrollList={ (value) => scrollRef.current.scrollTo({ y: value, animated: false })}
                            setScrollEnabled={ (s) => setScrollEnabled(s)}
                            dataSource={data}
                            parentWidth={(width)}
                            childrenWidth={dWidth}
                            childrenHeight={170}
                            marginChildrenTop={10}
                            marginChildrenBottom={10}
                            onDragStart={onSelectedDragStart}
                            onDragEnd={() => setScrollEnabled(true)}
                            onDataChange={ async (data) => {
                                const indexItem = data.map(({id}, index) => ({id, index}));
                                setItemLocalStore('index_item_' + userId, indexItem).then(() => setData(data));
                                setIsEditState(false);
                            }}
                            keyExtractor={(item, index) => index.toString()}
                            onClickItem={(data, item, index) => {
                                const id = item.id;
                                const CONNECTING = 'login';
                                const DISCONNECTED = 'nologin';
                                const status = (item.status === 'logout' || !item.status) ? DISCONNECTED : CONNECTING;
                                const type = item.type === 'DOORCAM' && 'DOORCAM' || 'ACC';
                                if (!id) {
                                    return dispatch(setToast({show: 'WARNING', data: LG.unknownDevice}));
                                }

                                dispatch(setDeviceIdCurrent(id));
                                if (status === CONNECTING) {
                                    setIsEditState(false)
                                    if (type === 'DOORCAM') {
                                        return navigation.navigate('DoorCamera');
                                    }
                                    if (type === 'ACC') {
                                        return navigation.navigate('ControlAir');
                                    }
                                    dispatch(setToast({show: 'WARNING', data: LG.receivedDevice}));
                                }
                                dispatch(setToast({show: 'WARNING', data: LG.noConnectWithThisDevice}));
                            }}
                            renderItem={(item, index) => {
                                return <ItemDevice LG={LG} data={item} isEditState={isEditState}/>;
                            }}
                        />
                }
            </ScrollView>
            {
                isEditState &&
                <View style={{ position: "absolute", bottom: 40, alignSelf: "center", }}>
                    <NeuButton
                        onPress={() => setIsEditState(false)}
                        color={theme.newButton}
                        width={120} height={40}
                        borderRadius={6}
                    >
                        <Text style={{color:'red'}}>{ LG.cancel }</Text>
                    </NeuButton>
                </View>
            }
            { !isEditState && <VoiceControl/>}
        </Animated.View>
    );
};

const style = (setTheme) => {
    const {color, backgroundColor} = setTheme;
    return StyleSheet.create({
        body: {
            backgroundColor,
        },
        frame_top: {
            textAlignVertical: 'bottom',
            paddingHorizontal: 20,
            paddingTop: 30,
            fontSize: 30,
            fontWeight: '700',
            color,
            marginBottom: 10,
        },
        title: {
            marginTop:10,
            fontSize: 25,
            fontWeight: '700',
            color,
        },
        number_device: {
            paddingTop: 10,
            fontSize: 13,
            fontWeight: 'bold',
            color,
        },
        frame_list_devices: {
            flexWrap: 'wrap',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width,
            paddingTop: 10,
            paddingHorizontal: 20,
            height: '100%',
        },
        footer: {
            justifyContent: 'space-between',
            position: 'absolute',
            width,
            height: 50,
            bottom: 20,
        },
        frame_bar_device: {
            alignItems: 'center',
            justifyContent: 'center',
            height: 40,
            backgroundColor: '#EDF3F8',
            borderRadius: 5,
        },
        menu_bar: {
            flexDirection:'row',
            justifyContent:'space-between'
        },
        add_device: {
            position: 'absolute',
            right: 20,
            bottom: 15,
        },

        pagination: {
            flexDirection: 'row',
            paddingLeft: 10,
        },
        item_pagination: {
            width: 20,
            height: 20,
            backgroundColor: '#EDF3F8',
            marginLeft: 10,
        },
        active_pagination: {
            width: 20,
            height: 20,
            backgroundColor: 'orange',
            marginLeft: 10,
        },
    });
};
export default Device;
