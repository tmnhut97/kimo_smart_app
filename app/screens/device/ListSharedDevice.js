import React, {useEffect} from "react";
import {Animated, BackHandler, Dimensions, FlatList, StyleSheet, Text, View} from "react-native";
import {NeuButton, NeuView} from "../NeuView";
import Icon from "react-native-vector-icons/dist/FontAwesome5";
import {useNavigation} from "@react-navigation/native";
import {useDispatch, useSelector} from "react-redux";
import useAnimatedCallback from "../../animated/useAnimatedCallback";
import {Door, IconAir, IconCamera, NoDevices} from "../../assets/imageSVG";
import {emitShareDevToUser, getDevLogin, wsListenerMessage, wsRemoveListenerMessage} from "../../Socket";
import {isJsonString} from "../../mFun";
import {setListDevice} from "../../redux/reducer/deviceReducer";
import {setToast} from "../../redux/reducer/toastReducer";

const { width} = Dimensions.get('screen')
const ListSharedDevice = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const userId = useSelector(state => state.userIdCurrent)
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
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
    const shared = useSelector( (state) => state.devices.shared )

    const lis = (evt) => {
        if (!isJsonString(evt.data)) return;
        const { cmd, res, msg, typeshare, userid, devids} = JSON.parse(evt.data)
        if (
            cmd === "res" && res === "sharedevtouser" && userid===userId
        ) {
            if (msg === "OK" && ["no_accept", "accept"].includes(typeshare)) {
                if (devids) {
                    if (devids.length) {
                        dispatch(setListDevice([...devids]));
                        devids.forEach(({id, type}) => { getDevLogin(id, type) })
                    } else dispatch(setListDevice([]));
                }
            }
            if (msg === "DEV_UNKNOW") dispatch(setToast({show: "ERROR", data: LG.validate.DEV_UNKNOW}))
            if (msg === "USER_UNKNOWN") dispatch(setToast({show: "ERROR", data: LG.validate.USER_UNKNOWN}))
            if (msg === "ERROR") dispatch(setToast({show: "ERROR", data: LG.validate.errorOccurred}))
        }
    }
    useEffect( () => {
        wsListenerMessage(lis)
        return () => wsRemoveListenerMessage(lis)
    }, [])
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
                    fontWeight: 'bold'}}>{LG.youAreShared}</Text>
                <View style={{width:45}}/>
            </View>
            <View style={{ flex: 1}}>
                <FlatList
                    ListEmptyComponent={
                        <View style={{width: '100%', paddingTop: '30%', justifyContent: 'center', alignItems: 'center'}}>
                            <View style={{marginLeft: 25}}>
                                {NoDevices}
                            </View>
                            <Text style={{marginVertical: 30, fontSize: 18, color: theme.color}}>{LG.noDevice}</Text>
                        </View>
                    }
                    data={shared}
                    renderItem={({item}) =>
                        <ItemSharedDevice item={item} theme={theme} LG={LG}/>
                    }
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </Animated.View>
    )
}


const ItemSharedDevice = ({ item }) => {
    const theme = useSelector((state) =>  state.themes.theme)
    const LG = useSelector((state) => state.languages.language);
    const { name, type, id, role } = item
    const submit = (accept) => {
        const r = role.replace('share', 'use')
        if (accept) { emitShareDevToUser(null, id, r, 'accept') }
        else emitShareDevToUser(null, id, r, 'no_accept')
    }

    return (
        <NeuView
            active={true}
            style={{margin: 15, alignSelf: 'center'}}
            color={theme.newButton}
            width={width - 60}
            height={80}
            borderRadius={5}
        >
            <View style={{
                width: '100%',
                flexDirection: "row", justifyContent: 'space-between', alignItems: "center"
            }}>
                <View style={{
                    width: 60, height: 60,
                    margin: 15, justifyContent: "center", alignItems: "center"
                }}>
                    {
                        type === 'DOORCAM' && Door ||
                        type === 'CAMERA' && IconCamera || IconAir
                    }

                </View>
                <View style={{ justifyContent: "center", alignItems: "center", paddingHorizontal: 30}}>
                    <Text
                        style={{ fontSize: 12, fontWeight: "bold"}}
                        numberOfLines={1}
                    > {LG.DoYouWantToUseTheDevice} { name } ?</Text>
                    <View style={{marginTop: 10, marginHorizontal: 15, flexDirection: "row"}}>
                        <NeuButton
                            onPress={() => submit(true)}
                            color={theme.newButton}
                            width={60} height={30}
                            borderRadius={6}
                            style={{ marginRight: 15}}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                                <Icon name={'check'} size={15} color={'green'}/>
                            </View>
                        </NeuButton>
                        <NeuButton
                            onPress={() => submit(false)}
                            color={theme.newButton}
                            width={60} height={30}
                            borderRadius={6}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                                <Icon name={'times'} size={15} color={'red'}/>
                            </View>
                        </NeuButton>
                    </View>
                </View>
            </View>
        </NeuView>
    )
}

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

export  default ListSharedDevice
