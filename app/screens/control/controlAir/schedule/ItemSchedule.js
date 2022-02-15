import React from 'react';
import {
    Switch,
    Text,
    TouchableOpacity,
    Animated,
    StyleSheet,
    Alert,
    LayoutAnimation,
} from 'react-native';
import {setToast} from "../../../../redux/reducer/toastReducer";
import {useDispatch, useSelector} from 'react-redux';
import useAnimatedShowView from "../../../../animated/useAnimatedShowView";
const ItemSchedule = ({item, index, section, setData , setAction}) => {
    const dispatch = useDispatch()
    const LG = useSelector(state => state.languages.language)
    const theme = useSelector((state) => state.themes.theme)
    const styles = style(theme)
    const toggleSwitch = () => {
        const temp = section
        if (item.on) {
            temp.data[index] = {...temp.data[index], on: !item.on}
            return setData(temp)
        }
        const [ onH0, onM0 ] = item.alon.split(':')
        const [ offH0, offM0 ] = item.aloff.split(':')
        const t00 = parseInt(onH0*60) + parseInt(onM0)
        const t01 = parseInt(offH0*60) + parseInt(offM0)
        const validate = temp.data.filter(({on})=>on).filter( (e) => {
            const [ onH, onM ] = e.alon.split(':')
            const [ offH, offM ] = e.aloff.split(':')
            const t10 = parseInt(onH*60) + parseInt(onM)
            const t11 = parseInt(offH*60) + parseInt(offM)
            return ( !((t10 <= t00 && t11 <= t00 ) || ( t10 >= t01 && t11 >= t01 )) )
        })
        if (validate.length) return dispatch(setToast({show:'WARNING', data: LG.timeOverlaps}))
        else {
            temp.data[index] = {...temp.data[index], on: !item.on}
            setData(temp)
        }
    }
    const removeItem = () => {
        Alert.alert(
            LG.delete,
            LG.doYouWantToDeleteSchedule,
            [
                {
                    text: LG.cancel,
                    style: "cancel"
                },
                {   text: LG.oke,
                    onPress: () => {
                        const temp = section
                        temp.data = temp.data.filter( (e, i) => i!==index)
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setData(temp)
                    }}
            ],
            { cancelable: false }
        );
    }
    let {aloff, alon, temp, on} = item;
    const settingAni = useAnimatedShowView()

    return (
        <Animated.View style={[settingAni]}>
            <TouchableOpacity
                style={styles.frameItem}
                onLongPress={removeItem}
            >
                <TouchableOpacity
                    style={{ alignItems: "center"}}
                    onPress={ () => setAction({ type: 'edit', typeChange: 'alon', data: item, index, section})}
                >
                    <Text style={{color:theme.color}}>AIR ON</Text>
                    <Text style={styles.txtTime}> {alon} </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ alignItems: "center"}}
                    onPress={ () => setAction({ type: 'edit', typeChange: 'aloff', data: item, index, section})}
                >
                    <Text style={{color:theme.color}}>AIR OFF</Text>
                    <Text style={styles.txtTime}> {aloff}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ alignItems: "center"}}
                    onPress={ () => setAction({ type: 'edit', typeChange: 'temp', data: item, index, section})}
                >
                    <Text style={styles.txtTime}> {temp}
                        <Text style={{fontFamily: 'arial', fontSize: 14}}>°C</Text>
                    </Text>
                </TouchableOpacity>
                <Switch
                    trackColor={{false: "#767577", true: "#81b0ff" }}
                    thumbColor={on ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={on}
                />
            </TouchableOpacity>
        </Animated.View>
    );
};

const style = (setTheme) => {
    const {button} = setTheme
    const {txtTime} = setTheme.schedule
    return StyleSheet.create({
        frameItem: {
            marginHorizontal: 15,
            borderRadius: 5,
            backgroundColor:button,
            marginBottom: 5,
            paddingVertical: 20,
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent:'space-between',
            alignItems:'center'
        },
        txtTime: {
            fontFamily: 'Digital-7',
            color: txtTime,
            fontSize: 30,
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
    })
}
export default ItemSchedule
