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
    FlatList, BackHandler,
} from 'react-native';
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import useAnimatedCallback from "../../animated/useAnimatedCallback";
import {NeuButton} from '../NeuView';
const {width, height} = Dimensions.get('screen')
const ModelChooseDevicesShare = ({close, theme, LG, selected, setSelected, devices}) => {
    const styles = style(theme)
    const ani = useAnimatedCallback({value: -620, listTo: [0, -620], duration: 300});
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
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', Close)
        return () => BackHandler.removeEventListener('hardwareBackPress', Close)
    }, [])
    return (
        <>
            <TouchableOpacity
                onPress={() => Close()}
                style={styles.opacity}
            />
            <Animated.View style={[styles.frameModalModeAir, {bottom}]}>
                <View {...panResponder.panHandlers} style={styles.contentModal}>
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
                    <Text style={{marginTop:20, paddingHorizontal:15, textAlign:'center', fontSize:16, color:theme.color}}>
                        {LG.titleModelChooseDeviceShare}
                    </Text>
                    <View style={{maxHeight:300, marginVertical:15}}>
                        <FlatList
                            data={devices}
                            renderItem={({item}) =>
                                <ItemModel
                                    theme={theme}
                                    item={item}
                                    selected={selected}
                                    setSelected={setSelected}
                                />
                            }
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                </View>
                <TouchableOpacity onPress={() => animStop.start(close)} style={styles.frameClose}>
                    <Text style={{fontSize: 20, fontWeight: '700', color: '#0499E6'}}>{LG.done}</Text>
                </TouchableOpacity>
            </Animated.View>
        </>
    )
}

const ItemModel = ({ item, theme, selected, setSelected }) => {
    const { id, name } = item
    const [check, setCheck ] = useState(false)
    const selectDevice = () => {
        if ( check ) {
            setSelected(selected.filter( e => e.id !== id))
        } else {
            const n = [...selected, ...[item]]
            setSelected(n)
        }
    }
    useEffect( () => {
        if (!selected.length) return setCheck(false)
        const c = selected.findIndex(e => e.id === id) >= 0
        setCheck(c)
    }, [selected])
    return (
        <TouchableOpacity
            onPress={selectDevice}
            style={{
                paddingHorizontal: 30,
                height: 60, flexDirection: "row",
                justifyContent: 'space-between', alignItems: "center"
            }}
        >
            <Text style={{color:theme.color, fontSize: 18}}>{name}</Text>
            {
                check ?
                    <FontAwesome name={'check-circle'} size={25} color={'green'} />
                    :
                    <FontAwesome5Icon name={'circle'} size={25} color={'gray'} />
            }
        </TouchableOpacity>
    )
}

const style = (theme) => {
    const { backgroundColor, button } = theme
    return StyleSheet.create({
        frameModalModeAir: {
            position: 'absolute',
            maxHeight: 620,
            width: width - 30,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            margin: 15,
            zIndex: 100,
        },
        opacity: {
            width,
            height,
            backgroundColor: '#000',
            position: 'absolute',
            opacity: 0.3,
            zIndex: 2,
        },
        contentModal: {
            borderWidth:5,
            borderColor:button,
            backgroundColor,
            borderRadius: 10,
            paddingTop: 15,
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

export default ModelChooseDevicesShare
