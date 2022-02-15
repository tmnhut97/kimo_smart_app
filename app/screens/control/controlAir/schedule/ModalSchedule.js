import React, {useEffect, useRef, useState} from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    PanResponder,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';
import useAnimatedCallback from '../../../../animated/useAnimatedCallback';
import {useDispatch, useSelector} from 'react-redux';
import {TimePicker, WheelPicker} from "@taoqf/react-native-wheel-picker";
import {setToast} from "../../../../redux/reducer/toastReducer";
import {NeuButton} from '../../../NeuView';
const {width, height} = Dimensions.get('screen')


const dayTitleVN = {
    mo: 'Thứ 2',
    tu: 'Thứ 3',
    we: 'Thứ 4',
    th: 'Thứ 5',
    fr: 'Thứ 6',
    sa: 'Thứ 7',
    su: 'Chủ nhật'
}
const dayTitleEN = {
    mo: 'Monday',
    tu: 'Tuesday',
    we: 'Wednesday',
    th: 'Thursday',
    fr: 'Friday',
    sa: 'Saturday',
    su: 'Sunday'
}
const ModalSchedule = ({close, action, setData, LG}) => {
    const dispatch = useDispatch()
    const temps = [...(new Array(20)).keys()].map(t => (t+16).toString() + ' °C')
    const hours = [...(new Array(24)).keys()].map(h => (('0' + h).slice(-2)) + ' ' + LG.hours)
    const minutes = [...(new Array(60)).keys()].map(m => (('0' + m).slice(-2)) + ' ' + LG.minute)
    const theme = useSelector((state) => state.themes.theme)
    const styles = style(theme)
    const [ item, setItem ] = useState({
        alon: { h: 0, m: 0 },
        aloff: { h: 0, m: 0 },
        temp: 16
    })
    const [typeChange, setTypeChange ] = useState(null)
    const [itemSelect, setItemSelect ] = useState({
        h: 0,
        m: 0,
        t: 0
    })
    const [titleModal, setTitleModal ] = useState(LG.add)
    const aniBottom = useAnimatedCallback({value: -600, listTo: [0, -600], duration: 400});
    const bottom = aniBottom.value;
    const [aniShow, aniHide] = aniBottom.animates;
    const aniHeightSelect = useAnimatedCallback({value: 0, listTo: [240, 0], duration: 400});
    const heightSelect = aniHeightSelect.value;
    const [aniShowSelect, aniHideSelect] = aniHeightSelect.animates;
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
                    aniHide.start(close);
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
    useEffect(() => { aniShow.start(); }, []);
    const convertItem = (item) => {
        const { alon, aloff, temp } = item
        return {
            alon: ('0' + alon.h).slice(-2) +':'+ ('0' + alon.m).slice(-2),
            aloff: ('0' + aloff.h).slice(-2) +':'+ ('0' + aloff.m).slice(-2),
            temp: temp
        }
    }
    const submit = () => {
        const { alon, aloff } = item
        const t00 = alon.h*60 + alon.m
        const t01 = aloff.h*60 + aloff.m
        if (t01 <= t00) return dispatch(setToast({ show: "WARNING", data:LG.openTimeMustBeLessThanTimeOff}))
        if (action.type === 'add') {
            const temp = {...action.data}
            temp.data = [...temp.data, ...[convertItem(item)]]
            setData(temp)
            aniHide.start(() => close())
        }
        if (action.type === 'edit') {
            const { index, section } = action
            const temp = {...section }
            temp.data[index] = convertItem(item)
            setData(temp)
            dispatch(setToast({ show: "SUCCESS", data:LG.success}))
            aniHide.start(() => close())
        }

    }
    const showSelect = (t) => { setTypeChange(t)  }
    const onItemSelected = (type, i) => {
        const temp = itemSelect
        temp[type] = i
        if (typeChange === 'temp') return setItem({...item, ...{[typeChange]: i+16} });
        setItemSelect({ ...temp})
        setItem({...item, ...{[typeChange]: {h: itemSelect.h, m: itemSelect.m}} })
    }
    useEffect( () => {
        if (!typeChange) return aniHideSelect.start()
        aniShowSelect.start()
        if (typeChange === "temp") return setItemSelect({ ...itemSelect, ...{t:item.temp-16 }})
        else setItemSelect({...itemSelect,... item[typeChange] })
    }, [typeChange])

    useEffect( () => {
        if (!action) return ;
        if (action.type === 'edit') {
            setTypeChange(action.typeChange)
            const { aloff, alon, temp } = action.data
            const [onH, onM ] = alon.split(':')
            const [offH, offM ] = aloff.split(':')
            setItem({
                alon: { h: parseInt(onH), m: parseInt(onM) },
                aloff: { h: parseInt(offH), m: parseInt(offM) },
                temp: temp
            })
            setTitleModal(LG.edit)
        }

        if (action.type === 'add') {
            setTitleModal(LG.addTheScheduleFor + (LG.nameLanguage === 'VN' ? dayTitleVN[action.data.title] : dayTitleEN[action.data.title]))
        }
    }, [action])
    const { alon, aloff, temp } = item
    return (
        <>
            <TouchableOpacity activeOpacity={0.6} onPress={() => aniHide.start(close)} style={styles.opacity}/>
            <Animated.View style={[styles.frameModel, {bottom}]}>
                <View style={styles.contentModal}>
                    <View  {...panResponder.panHandlers}>
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
                        <View style={{flexDirection: 'row',alignItems:'center', justifyContent: 'space-between', paddingVertical:15}}>
                            <Text style={styles.titleModel}>
                                {titleModal}
                            </Text>
                        </View>
                    </View>
                    <View style={{borderBottomWidth:1, borderColor:'#c4c4c4'}}>
                        <View>
                            <View style={styles.frameItem}>
                                <TouchableOpacity
                                    onPress={ () => showSelect('alon')}
                                >
                                    <Text style={[{ fontSize: 20, color: theme.color}]}>AIR ON</Text>
                                    <Text style={[styles.txtTime, { color: typeChange==='alon'?'blue':theme.color}]}> {`${alon.h}:${alon.m}`} </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={ () => showSelect('aloff')}
                                >
                                    <Text style={[{ fontSize: 20, color: theme.color}]}>AIR OFF</Text>
                                    <Text style={[styles.txtTime, { color: typeChange==='aloff'?'blue':theme.color}]}> {`${aloff.h}:${aloff.m}`} </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={ () => showSelect('temp')}
                                >
                                    <Text style={[{ fontSize: 20, color: theme.color}]}>{LG.temperature}</Text>
                                    <Text style={[styles.txtTime, { color: typeChange==='temp'?'blue':theme.color}]}> {temp}
                                        <Text style={{fontFamily: 'arial', fontSize: 14}}>°C</Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Animated.View style={{ flexDirection: "row", justifyContent: "space-around", height: heightSelect}}>
                                {
                                    ['alon', "aloff"].includes(typeChange) &&
                                    <View style={{flexDirection:'row', justifyContent:'center'}}>
                                        <View style={{width: 150,height: 220, justifyContent:'center',alignItems:'center', flexDirection:'row'}}>
                                            <WheelPicker
                                                data={hours}
                                                selectedItem={itemSelect.h}
                                                itemTextColor={theme.color}
                                                selectedItemTextColor={theme.schedule.txtTime}
                                                itemTextFontFamily={'Digital-7'}
                                                selectedItemTextFontFamily={'Digital-7'}
                                                backgroundColor={theme.backgroundColor}
                                                itemTextSize={25}
                                                selectedItemTextSize={30}
                                                isCyclic={true}
                                                hideIndicator={true}
                                                style={{
                                                    height: 220,
                                                    width:'100%',
                                                }}
                                                onItemSelected={(i) => {
                                                    onItemSelected('h', i);
                                                }}
                                            />
                                        </View>
                                        <View style={{width: 150,height: 220, alignItems:'center', justifyContent:'center', flexDirection:'row'}}>
                                            <WheelPicker
                                                data={minutes}
                                                selectedItem={itemSelect.m}
                                                itemTextColor={theme.color}
                                                itemTextFontFamily={'Digital-7'}
                                                selectedItemTextFontFamily={'Digital-7'}
                                                selectedItemTextColor={theme.schedule.txtTime}
                                                backgroundColor={theme.backgroundColor}
                                                itemTextSize={25}
                                                selectedItemTextSize={30}
                                                isCyclic={true}
                                                hideIndicator={false}
                                                style={{
                                                    width:180,
                                                    height: 220,
                                                }}
                                                onItemSelected={(i) => {
                                                    onItemSelected('m', i);
                                                }}
                                            />
                                        </View>
                                    </View>
                                }
                                {
                                    typeChange === 'temp' &&
                                        <View style={{ width: 120,height: 220, alignItems:'center', justifyContent:'center', flexDirection:'row'}}>
                                            <WheelPicker
                                                data={temps}
                                                selectedItem={itemSelect.t}
                                                itemTextColor={theme.color}
                                                itemTextFontFamily={'Digital-7'}
                                                selectedItemTextFontFamily={'Digital-7'}
                                                selectedItemTextColor={theme.schedule.txtTime}
                                                backgroundColor={theme.backgroundColor}
                                                itemTextSize={25}
                                                selectedItemTextSize={30}
                                                isCyclic={true}
                                                hideIndicator={false}
                                                style={{
                                                    alignItems: "center", justifyContent: "center",
                                                    width:60,
                                                    height: 220,
                                                }}
                                                onItemSelected={(i) => {
                                                    onItemSelected('t', i);
                                                }}
                                            />
                                        </View>
                                }
                            </Animated.View>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={submit}
                        style={{
                            paddingVertical: 15,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 10
                        }}
                    >
                        <Text style={{fontSize: 20, fontWeight: '700', color: 'red'}}>{LG.save}</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </>
    );
};
const style = (setTheme) => {
    const {color, backgroundColor, button} = setTheme
    return StyleSheet.create({
        frameModel:{
            position: 'absolute',
            maxHeight: 600,
            width: width - 20,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            marginHorizontal: 10,
            zIndex: 100,
            marginVertical: 10,
        },
        opacity: {
            backgroundColor: '#000',
            position: 'absolute',
            width,
            height,
            opacity: 0.6,
            zIndex: 1,
        },
        contentModal:{
            borderWidth:5,
            borderColor:button,
            backgroundColor,
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingTop: 15,
        },
        frameClose: {
            backgroundColor:button,
            marginVertical: 10,
            paddingVertical: 15,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
        },
        frameItem: {
            marginHorizontal: 10,
            borderRadius:15,
            padding:5,
            backgroundColor:button,
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent:'space-between',
            alignItems:'center',
            marginBottom: 20
        },
        txtTime: {
            fontFamily: 'Digital-7',
            color,
            fontSize: 30,
        },
        titleModel:{
            fontSize: 22,
            color,
            marginVertical: 5,
            marginLeft:10,
            borderColor: "#000"
        },
        actionItem: {
            position: 'absolute',
            right: 10,
            height: 70,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            backgroundColor: '#FFF',
            zIndex: 2,
        },
    });
}
export default ModalSchedule;
