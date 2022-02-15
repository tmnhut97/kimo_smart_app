import React, {useEffect, useMemo} from 'react';
import {StyleSheet, Text, View, Dimensions, Animated, TouchableOpacity, Alert} from 'react-native';
import {NeuButton, NeuView} from "../NeuView";
import {Door, IconAir, IconCamera} from "../../assets/imageSVG";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {useSelector} from 'react-redux';
import useAnimatedCallback from "../../animated/useAnimatedCallback";
import Icon from "react-native-vector-icons/dist/FontAwesome";
import {emitDeleteDev} from "../../Socket";
const { width } = Dimensions.get('window');
const CONNECTING = 'login'
const DISCONNECTED = 'nologin'


const style = (status) => {
    return StyleSheet.create({
        content_item_air:{
            paddingHorizontal:10,
            paddingVertical:10,
            borderRadius:5,
            opacity: status === CONNECTING ? 1 : 0.7 ,
            justifyContent:'space-between',
            alignItems:'center'
        },
        frame_img_device:{
            padding:5,
            borderRadius: 25
        },
        name_module:{
            marginTop:7,
            fontWeight: '700',
            fontSize: 18
        },
        status:{
            fontSize: 13,
            color:'#C4C4C4',
            paddingVertical: 5
        },

    })
}

const ItemDevice = ({data, LG, isEditState }) => {
    const theme = useSelector((state) =>  state.themes.theme)
    const ani = useAnimatedCallback({value: 0, listTo: [0, -5, 5], duration: 600});
    const left = ani.value
    const [ left0, left1, left2 ] = ani.animates
    const deleteDevice = (devId) => {
        Alert.alert(
            LG.deleteDevice,
            LG.deleteDeviceQuestion,
            [
                {
                    text: LG.cancel,
                    style: 'cancel',
                },
                {
                    text: LG.oke,
                    onPress: () => emitDeleteDev(devId),
                },
            ],
            {cancelable: false},
        );
    };
    useEffect( () => {
        let interval = null
        if ( isEditState ) {
            interval = setInterval( () => {
                left1.start( () => left2.start())
            }, 1200)
        }else left0.start()

        return () => {
            if (interval) { clearInterval(interval); interval=null}
        }
    }, [isEditState])
    return useMemo(() => {
        if (!data) return <View/>
        const id = data.id
        const name = data.name
        const troom = data.troom ? (data.troom.toFixed(1))+'°C' : ''
        const status = (data.status==='logout' || !data.status) ? DISCONNECTED : CONNECTING
        const type = data.type==="DOORCAM" && "DOORCAM" || "ACC"
        const styles = style(status)
        const dWidth = width > 500 ? width/3 - 30 : width/2 - 30
        let labelStatus =
            status === CONNECTING ?
            LG.availability
            : LG.unavailable
        if (type === "ACC") {
            labelStatus = data.status === "ON" && LG.openAirConditioner ||
                            data.status === "OFF" && LG.closeAirConditioner || LG.unavailable
        }
        return(
            <>
                <NeuView
                    animatedDisabled={true}
                    customLightShadow={'#FFFFFF'}
                    customDarkShadow={'#E3E3E3'}
                    borderRadius={10}
                    width={dWidth}
                    height={170}
                    color={theme.itemDevice.backgroundItem}
                    style={{ marginLeft: 20}}
                >
                    { isEditState && status===DISCONNECTED &&
                    <View style={{ position: "absolute", right: 10, top: 10, zIndex: 10}}>
                        <NeuButton
                            onPress={() => deleteDevice(id)}
                            color={theme.newButton}
                            width={30} height={30}
                            borderRadius={6}
                        >
                            <Icon name={'trash'} size={15} color={'red'}/>
                        </NeuButton>
                    </View>
                    }
                    <Animated.View
                        style={[styles.content_item_air, { left}]}
                    >
                        <View style={{
                            marginLeft:5,
                            width:60,
                            height:60,
                            flexDirection:'row',
                            justifyContent:'center',
                            alignSelf:'center',
                            alignItems:'center',
                        }}>
                            {
                                type === 'DOORCAM' && Door ||
                                type === 'CAMERA' && IconCamera || IconAir
                            }
                        </View>
                        <Text
                            numberOfLines={1}
                            style={[styles.name_module, {color: status === CONNECTING ? theme.color : "#a4a8c4"}]}
                        > {name ? name : LG.noName} </Text>
                        <Text style={[styles.status, {color: status === CONNECTING ? "green" : "#a4a8c4"}]} >
                        { labelStatus }
                        </Text>
                        <Text>
                            <FontAwesome style={{top:5}} name={'circle'} size={15} color={status=== CONNECTING ? 'green' : 'gray'} />
                            <Text style={{color:theme.color}}>  { troom }</Text>
                        </Text>
                        <TouchableOpacity>

                        </TouchableOpacity>
                    </Animated.View>
                </NeuView>
            </>
        )
    }, [LG, data, theme])
}

export default ItemDevice
