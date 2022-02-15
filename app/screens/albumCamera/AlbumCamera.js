import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {
    ActivityIndicator,
    Dimensions, RefreshControl, ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Animated, BackHandler, Platform, Share
} from "react-native";
import {NeuButton, } from '../NeuView';
import Icon from "react-native-vector-icons/dist/FontAwesome5";
import {useNavigation} from "@react-navigation/native";
import {ALBUM, parseDate} from "../../mFun";
import ItemImage from "./ItemImage";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import {openChooserWithMultipleOptions} from "react-native-send-intent";
import CheckBox from "@react-native-community/checkbox";
import useAnimatedCallback from "../../animated/useAnimatedCallback";
import {useSelector} from 'react-redux';

const {width, height} = Dimensions.get('screen');

const AlbumCamera = () => {
    const navigation = useNavigation();
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) => state.themes.theme)
    const styles = style(theme)
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
    useEffect(() => {
        animStart.start();
    }, []);
    const Out = () => {
        animStop.start(() => navigation.navigate("DoorCamera"))
        return true
    }
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', Out);
        return () =>
            BackHandler.removeEventListener('hardwareBackPress', Out);
    }, []);
    const refreshControl = useRef( null );
    const [data, setData] = useState([])
    const getAllImages = () => {
        ALBUM.getImagesAlbum().then((images) => {
            const d = images.reduce( (current, next ) => {
                const { mtime } = next
                const { day, month, year } = parseDate( new Date(mtime))
                if (!current.length) return [{ title:`${day}/${month}/${year}`, data: [ next ] }]
                const timString = `${day}/${month}/${year}`
                let temp = [...current]
                const findIndex = current.findIndex( (e) => e.title === timString)
                if (findIndex < 0) temp = [...temp, { title:`${day}/${month}/${year}`, data: [ next ] }]
                else temp[findIndex].data = [ ...temp[findIndex].data, ...[next]]
                return temp
            }, []).sort( (a, b) => {
                const [daya, montha, yeara ] = a.title.split('/')
                const [dayb, monthb, yearb ] = b.title.split('/')
                return (new Date(yeara, montha, daya)) <= (new Date(yearb, monthb, dayb))
            })
            setData([...d])
        })
        refreshControl.current = false
        setSelects({ mode: false, list: []})
    }
    const delImages = async () => {
        await selects.list.forEach( (p) => ALBUM.deleteImage(p) )
        getAllImages()
    }
    const shareImages = () => {
        if (Platform.OS === 'android') {
            const d = selects.list.map((e) => ({subject: "File subject", imageUrl: e, type:'image/jpg'}))
            openChooserWithMultipleOptions( d, LG.shareTo);
        }
    }
    useEffect(() => {
        return navigation.addListener('focus',  getAllImages );
    }, [navigation])
    const [selects, setSelects ] = useState({ mode: false, list: []})
    const renderItemAlbum = useCallback( (data) => {
        if (!data) return (
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
                <Text style={{fontFamily: 'Digital-7', fontSize: 20, margin: 15}}>{LG.LG.pleaseWait} ...</Text>
            </View>
        )
        return data.map((e, index) =>
            <ItemAlbum
                key={index} item={e}
                selects={selects}
                setSelects={ (s) => setSelects({...s}) }
            />
        )
    }, [data, selects])
    return (
        <Animated.View style={[styles.frameAlbumCamera, {left}]}>
            <View style={styles.header}>
                <NeuButton
                    onPress={Out}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
                <Text style={styles.title_control}>{LG.photograph}</Text>
                <View>
                    {
                        selects.mode ?
                            <NeuButton
                                onPress={ () => setSelects({ mode: false, list: []}) }
                                color={theme.newButton}
                                width={45} height={45}
                                borderRadius={22.5}
                            >
                                <Text style={{ color: theme.color}}> Hủy </Text>
                            </NeuButton> :
                            <View style={{ width: 45}}/>
                    }
                </View>
            </View>
            <ScrollView
                refreshControl={ <RefreshControl refreshing={refreshControl.current} onRefresh={getAllImages} /> }
                showsVerticalScrollIndicator={false}
                style={{height: height - 60, marginTop: 30}}>
                { renderItemAlbum(data)}
            </ScrollView>
            {
                selects.mode &&
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={delImages}
                    >
                        <FontAwesome5Icon name={'trash'} size={25} color={'red'}/>
                    </TouchableOpacity>
                    {
                        Platform.OS === 'android' &&
                        <TouchableOpacity
                            onPress={shareImages}
                        >
                            <FontAwesome5Icon name={'share'} size={25} color={"#0d71ec"}/>
                        </TouchableOpacity>
                    }
                </View>
            }
        </Animated.View>
    )
}
const ItemAlbum = ({item, selects, setSelects }) => {
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) => state.themes.theme)
    const { title, data } = item
    const checkAllDay = (v) => {
        const paths = data.map(({path}) => path)
        if (v) {
            const list =  [...selects.list.filter( (p) => !paths.includes(p)), ...paths]
            setSelects({ ...selects, ...{list} })
        } else {
            setSelects({...selects, ...{list: [...selects.list.filter((p) => !paths.includes(p))]}})
        }

    }
    return useMemo( () => {
        const paths = data.map(({path}) => path)
        const check = paths.every( (e) => selects.list.includes(e))
        return (
            <View>
                <View style={{
                    width: '100%', paddingHorizontal: 10,
                    flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginVertical: 10
                }}>
                    {
                        selects.mode &&
                        <TouchableOpacity
                            style={{ zIndex: 10}}
                            onPress={ () => checkAllDay(!check)}
                        >
                            <CheckBox
                                disabled={true}
                                value={check}
                                tintColors={{true: '#F15927', false: '#ababab'}}
                                style={{ zIndex: 10, alignSelf: 'flex-end'}}
                            />
                        </TouchableOpacity>
                    }
                    <Text style={{ color: theme.color, fontSize: 16}}>{LG.date + ' ' + title}</Text>
                </View>
                <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                    { data.sort( (a, b) => {
                        return (a.mtime) <= (b.mtime)
                    }).map((item, index) => (
                        <ItemImage
                            theme={theme}
                            key={index} item={item}
                            selects={selects}
                            setSelects={setSelects}
                        />
                    )) }
                </View>
            </View>
        )
    }, [item, selects])
}
const style = (setTheme) => {
    const {color, backgroundColor, button, input} = setTheme
    return StyleSheet.create({
        frameAlbumCamera:{
            flex: 1,
            backgroundColor,
        },
        header: {
            paddingHorizontal: 25,
            paddingTop: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        title_control: {
            textAlign: 'center',
            fontSize: 30,
            color,
            fontWeight: 'bold',
        },
        footer: {
            flexDirection: 'row',
            borderTopWidth:0.5,
            borderColor:'#c4c4c4',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            height: 60,
            width,
            backgroundColor: '#FFF'
        }
    });
}

export default AlbumCamera

