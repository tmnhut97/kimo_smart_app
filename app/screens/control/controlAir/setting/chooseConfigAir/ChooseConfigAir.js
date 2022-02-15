import React, {useEffect, useState} from "react";
import {
    Text,
    View,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    Animated,
    BackHandler,
    TextInput, ActivityIndicator
} from "react-native";
import {NeuButton } from '../../../../NeuView';
import useAnimatedCallback from "../../../../../animated/useAnimatedCallback";
import {clearString, deleteFileFs, isJsonString, readFileFs, WriteFileFs} from "../../../../../mFun";
import {useSelector} from "react-redux";
import DATA_IR from '../../../../../datair'
import {fileSave, getIrSup, wsListenerMessage, wsRemoveListenerMessage} from "../../../../../Socket";
import {useNavigation} from "@react-navigation/native";
import {setToast} from "../../../../../redux/reducer/toastReducer";
import ModalModelAir from "./ModelModelAir";
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
const {width, height} = Dimensions.get('screen')
const ChooseIRAir = () => {
    const navigation = useNavigation()
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) => state.themes.theme)
    const styles = style(theme)
    const userId = useSelector(state => state.userIdCurrent)
    const devId = useSelector(state => state.devices.idCurrent)
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
    // const [ ir, setIr ] = useState(null)
    // useEffect(() => {
    //     const temp = DATA_IR.reduce( (current, next) => {
    //         const {supplier, model, ir } = next
    //         if (!current.length) return [ { supplier, data: [{model, ir}] }]
    //         let temp = [...current]
    //         const findIndex = current.findIndex( (e) => e.supplier === supplier)
    //         if (findIndex < 0) temp = [...temp, { supplier, data: [{model, ir} ] }]
    //         else temp[findIndex].data = [ ...temp[findIndex].data, ...[{model, ir}]]
    //         return temp
    //     }, []).sort( (a, b) => a.supplier >= b.supplier)
    //     setData(temp)
    //     animStart.start();
    // }, []);
    // const [irUnknow, setIrUnknow ] = useState([])
    const lisIR = (evt) => {
        if (!isJsonString(evt.data)) return;
        const { cmd, res, msg, data:d, userid } = JSON.parse(evt.data)
        if (cmd === 'res' && res === "getirsup" &&
            msg === "OK" && userid === userId
        ) {
            if (d && d.length ) {
                setData(d)
                animStart.start()
            }
        }

    }
    useEffect(() => {
        getIrSup()
        wsListenerMessage(lisIR)
        return () => wsRemoveListenerMessage(lisIR)
    }, []);
    const Out = () => {
        animStop.start(() => navigation.goBack())
        return true
    }
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', Out);
        return () =>
            BackHandler.removeEventListener('hardwareBackPress', Out);
    }, []);
    const [dataDisplay, setDataDisplay ] = useState([])

    const [search, setSearch] = React.useState('');
    const [data, setData] = useState([])
    const [itemCurrent, setItemCurrent] = useState(null)
    // const saveDev = () => {
    //     if (!ir) {
    //         dispatch(setToast({ show: "ERROR", data:"Có lỗi xảy ra !"}))
    //         return navigation.goBack()
    //     }
    //     const fname = 'irdata.bin'
    //     const info = ir.data.data
    //     const fileNameSave = "irdevid" + devId + ".json"
    //     deleteFileFs(fileNameSave).then(r => {
    //         WriteFileFs(fileNameSave, ir )
    //             .then( () => {
    //                 fileSave(devId, fname, info, 'ACC', 'b' )
    //             })
    //             .catch( e => console.log("error"))
    //     }).catch( (e) => { console.log(e) })
    // }
    // useEffect( () => {
    //     const fileNameSave = "irdevid" + devId + ".json"
    //     readFileFs(fileNameSave).then(r => {
    //         if (!r) return ;
    //         setIr(r)
    //     })
    // }, [])
    useEffect( () => {
        if (!data.length) return setDataDisplay([])
        if (search.length) {
            setDataDisplay( data.filter( (e) => clearString(e.supplier).includes(clearString(search))))
        } else setDataDisplay(data)
    }, [search, data])
    if (!data.length) return (
        <View style={{
            position: 'absolute',
            width: '100%',
            height: "100%",
            backgroundColor: '#edf3f8',
            opacity: 0.7,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100
        }}>
            <ActivityIndicator size="large" color="blue"/>
            <Text style={{fontFamily: 'Digital-7', fontSize: 20, margin: 15}}>{LG.pleaseWait} ...</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Device')}>
                <Text style={{fontFamily: 'Digital-7', fontSize: 20, marginTop: 30, color: 'blue'}}>{LG.cancel}</Text>
            </TouchableOpacity>
        </View>
    )
    return (
        <Animated.View style={[styles.frameChooseAir, {left}]}>
            <View style={styles.header}>
                <NeuButton
                    onPress={Out}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
                <Text style={styles.title}>{LG.chooseTheAirConditioner}</Text>
                <NeuButton
                    // onPress={saveDev}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'check'} size={20} color={theme.color}/>
                </NeuButton>
            </View>
            <View style={{marginHorizontal: 15}}>
                <TextInput
                    style={{backgroundColor:theme.input, color:theme.color, borderRadius: 5, paddingHorizontal: 15, height: 45, borderColor: 'gray'}}
                    onChangeText={text => setSearch(text)}
                    value={search}
                    placeholder={LG.searchForBrandOrModel}
                    placeholderTextColor={theme.color}
                />
            </View>
            <View style={{padding: 15, flex: 1}}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={{justifyContent:'space-between'}}
                    data={dataDisplay}
                    numColumns={2}
                    renderItem={({item}) =>
                        <ItemSupplier
                            item={item}
                            setItemCurrent={(e) => setItemCurrent(e)}
                        />
                    }
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
            <ModalModelAir
                LG={LG}
                theme={theme}
                itemCurrent={itemCurrent}
                close={() => setItemCurrent(null) }
            />
        </Animated.View>
    )
}

const ItemSupplier = ({ item ,setItemCurrent, ir}) => {
    const theme = useSelector((state) => state.themes.theme)
    const styles = style(theme)
    const { supplier } = item
    return (
        <TouchableOpacity
            onPress={() => {
                setItemCurrent(item)
            }}
            style={{
                marginBottom:10,
                backgroundColor:theme.button,
                borderRadius:5,
                width: width/2 -20 ,
                padding: 10,
                alignItems: "center",
            }}
        >
            <View
                style={[styles.itemSupplier, { justifyContent: "center"}]}
            >
                <Text style={{color:theme.color}}>{supplier}</Text>
            </View>
        </TouchableOpacity>
    )
}
const style = (setTheme) => {
    const {color, backgroundColor, input, button} = setTheme
    return StyleSheet.create({
        frameChooseAir: {
            height,
            width,
            position:'absolute',
            top:0,
            backgroundColor,
            paddingVertical: 20
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: 50,
            paddingHorizontal: 15,
            alignItems: 'center',
            marginBottom: 20,
        },
        style_back: {
            height: 40,
            width: 40,
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#eaf3fa',
        },
        title: {
            color,
            fontSize: 22,
            fontWeight: 'bold',
        },
        itemPopularSupplier: {
            marginTop: 10,
            height: 40,
            width: width / 3 - 30,
            borderWidth: 0.5,
            borderColor: '#757575',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 15,
        },
        itemSupplier: {
            height: 50,
            alignItems: 'center',
        }
    })
}
export default ChooseIRAir
