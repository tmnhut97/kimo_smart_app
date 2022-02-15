import React, {useEffect, useRef, useState} from "react";
import {
    Text,
    View,
    StyleSheet,
    Dimensions,
    PanResponder,
    Animated,
    Easing,
    TouchableOpacity,
    FlatList
} from "react-native";
import useAnimatedCallback from "../../../../../animated/useAnimatedCallback";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {emitSendIr, fileSave} from "../../../../../Socket";
import {useDispatch, useSelector} from "react-redux";
import {setToast} from "../../../../../redux/reducer/toastReducer";
import {NeuButton} from "../../../../NeuView";
const {width, height} = Dimensions.get('screen')
const ModalModelAir = ({close, itemCurrent, theme, LG}) => {
    const styles = style(theme)
    if (!itemCurrent) return <></>
    const { supplier, irs } = itemCurrent
    const ani = useAnimatedCallback({value: -620, listTo: [15, -620], duration: 300});
    const bottom = ani.value;
    const [animStart, animStop] = ani.animates;
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

    return (
        <>
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => Close()}
                style={styles.opacity}
            />
            <Animated.View style={[styles.frameModalModeAir, {bottom}]}>
                <View style={styles.contentModal}>
                    <View {...panResponder.panHandlers}
                          style={[{paddingHorizontal: 15, height: 40, width: '100%', backgroundColor: 'transparent'}]}>
                        <View style={{
                            width: 60,
                            height: 7,
                            borderRadius: 5,
                            backgroundColor: '#c4c4c4',
                            alignSelf: 'center',
                        }}/>
                    </View>
                    <Text style={{textAlign:'center', fontSize:16, color:theme.color}}> {LG.supplier} {supplier} </Text>
                    <FlatList
                        data={irs}
                        renderItem={({item}) =>
                            <ItemModel
                                item={item}
                                theme={theme}
                                Close={Close}
                                LG={LG}
                            />}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                <TouchableOpacity
                    onPress={() => animStop.start(close)}
                    style={styles.frameClose}
                >
                    <Text style={{fontSize: 20, fontWeight: '700', color: '#0499E6'}}>{LG.cancel}</Text>
                </TouchableOpacity>
            </Animated.View>
        </>
    )
}

const ItemModel = ({ item, theme, Close, LG }) => {
    const dispatch = useDispatch()
    const devId = useSelector(state => state.devices.idCurrent);
    const model = item.filename.split('.')[0].split('_')[1]
    const test = () => { emitSendIr(devId, item.filename)}


    const saveDev = () => {
        if (!item.ir) { dispatch(setToast({ show: "ERROR", data: LG.validate.errorOccurred })) }
        const fname = 'irdata.bin'
        const info = item.ir
        fileSave(devId, fname, info, 'ACC', 'b' )
        dispatch(setToast({ show: "SUCCESS", data: LG.success}))
        Close()
    }
    return (
        <View
            style={{
                marginTop: 10, marginHorizontal:25, height: 50, flexDirection: "row", justifyContent: 'space-between', alignItems: "center"}}
        >
            <Text style={{fontSize:16, color:theme.color}}>Model:  {model}</Text>
            <View style={{ flexDirection: "row"}}>
                <NeuButton
                    onPress={saveDev}
                    color={theme.newButton}
                    width={100} height={30}
                    borderRadius={15}
                    backgroundColor={theme.backgroundColor}
                >
                    <Text style={{fontSize:16, color:theme.color, padding: 10 }}>{LG.use}</Text>
                </NeuButton>
                <NeuButton
                    onPress={test}
                    color={theme.newButton}
                    width={80} height={30}
                    borderRadius={15}
                    backgroundColor={theme.backgroundColor}
                    style={{marginLeft: 15 }}
                >
                    <Text style={{fontSize:16, color:theme.color, borderRadius: 8, }}>{LG.test}</Text>
                </NeuButton>
                <TouchableOpacity
                    onPress={test}
                >
                </TouchableOpacity>
            </View>
        </View>
    )
}
const style = (theme) => {
    const {color, backgroundColor, button, input} = theme
    return StyleSheet.create({
        frameModalModeAir: {
            position: 'absolute',
            maxHeight: 620,
            width: width - 20,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            marginHorizontal: 10,
            zIndex: 100,
            marginVertical: 10,
        },
        opacity: {
            width,
            height,
            backgroundColor: '#000',
            position: 'absolute',
            opacity: 0.6,
            zIndex: 2,
        },
        contentModal: {
            backgroundColor,
            borderRadius: 10,
            paddingVertical: 15,
            maxHeight:400,
        },
        option: {
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingVertical: 20,
        },
        frameClose: {
            backgroundColor,
            marginVertical: 10,
            paddingVertical: 15,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
        },
    })
}

export default ModalModelAir
