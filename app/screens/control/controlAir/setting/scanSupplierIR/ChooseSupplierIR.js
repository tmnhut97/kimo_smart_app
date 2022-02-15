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
import {clearString, isJsonString} from "../../../../../mFun";
import {useSelector} from "react-redux";
import {getIrSup, wsListenerMessage, wsRemoveListenerMessage} from "../../../../../Socket";
import {useNavigation} from "@react-navigation/native";
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import ScanIR from "./ScanIR";
import LoadingData from '../../../../LoadingData';
const {width, height} = Dimensions.get('screen')
const ChooseSupplierIR = () => {
    const navigation = useNavigation()
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) => state.themes.theme)
    const styles = style(theme)
    const userId = useSelector(state => state.userIdCurrent)

    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
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
    const [irScan, setIrScan ] = useState(null)

    const [irUnknow, setIrUnknow ] = useState([])


    const lisIR = (evt) => {
        if (!isJsonString(evt.data)) return;
        const { cmd, res, msg, data:d, userid } = JSON.parse(evt.data)
        if (cmd === 'res' && res === "getirsup" &&
            msg === "OK" && userid === userId
        ) {
            if (d && d.length ) {
                setData(d)
                const irunknow = d.filter( ({ supplier }) => ( supplier.toUpperCase().startsWith("CHUNGHOP") || supplier.toUpperCase().startsWith("OTHER") ))
                setIrUnknow(irunknow.map( ({irs}) => irs).flat())
                animStart.start()
            }
        }

    }
    useEffect(() => {
        getIrSup()
        wsListenerMessage(lisIR)
        return () => wsRemoveListenerMessage(lisIR)
    }, []);
    useEffect( () => {
        if (!data.length) return setDataDisplay([])
        if (search.length) {
            setDataDisplay( data.filter( (e) => clearString(e.supplier).includes(clearString(search))))
        } else setDataDisplay(data)
    }, [search, data])
    if (!data.length) return (
        <LoadingData/>
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
                            setIrScan={ (e) => {
                                if ( e.supplier.toUpperCase().startsWith("CHUNGHOP") || e.supplier.toUpperCase().startsWith("OTHER") ) return setIrScan(e)
                                const nirs = [ ...e.irs, ...irUnknow]
                                setIrScan({...e, ...{ irs: nirs}})
                            }}
                        />
                    }
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
            {   irScan!==null &&
                <ScanIR close={() => setIrScan(null)} irScan={irScan} theme={theme} LG={LG} />
            }
        </Animated.View>
    )
}

const ItemSupplier = ({ item, setIrScan }) => {
    const theme = useSelector((state) => state.themes.theme)
    const styles = style(theme)
    const { supplier } = item
    return (
        <TouchableOpacity
            onPress={ () => setIrScan(item)}
            style={{
            marginBottom:10,
            backgroundColor:theme.button,
            borderRadius:5,
            width: width/2 -20 ,
            padding: 10,
            alignItems: "center",
        }}>
            <View
                style={[styles.itemSupplier, { flexDirection: "row", justifyContent: "space-between"}]}
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
            flex: 1,
            backgroundColor,
            paddingVertical: 20,
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
            zIndex:-1,
            position: 'absolute',
            width,
            color,
            fontSize: 22,
            textAlign:'center',
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
            flexDirection: 'row',
            alignItems: 'center',
        }
    })
}
export default ChooseSupplierIR
