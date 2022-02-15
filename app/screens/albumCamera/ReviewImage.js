import React, {useEffect, useState} from "react";
import {
    Dimensions,
    Text,
    View,
    StyleSheet,
    Animated,
    TouchableOpacity, Alert, ActivityIndicator, FlatList, BackHandler, Platform, Share,
} from 'react-native';
import {useNavigation} from '@react-navigation/native'
import Icon from "react-native-vector-icons/dist/FontAwesome5";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import {openChooserWithOptions} from "react-native-send-intent";
import {ALBUM, parseDate} from "../../mFun";
import {useSelector} from 'react-redux';
import useAnimatedCallback from '../../animated/useAnimatedCallback';

const {width, height} = Dimensions.get('screen')
const ReviewImage = ({route}) => {
    const navigation = useNavigation();
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) => state.themes.theme)
    const styles = style(theme)
    const { path } = route.params
    const [ list ,setList ] = useState([])
    const [ indexInit ,setIndexInit ] = useState(0)
    useEffect( () => {
        ALBUM.getImagesAlbum().then((images) => {
            const d = images.sort( (a, b) =>(a.mtime) <= (b.mtime))
            setList(d)
            const findIndex = d.findIndex( (e) => e.path === path)
            if (findIndex >= 0 ) setIndexInit(findIndex)
        })
    },[])
    return (
        <Animated.View style={[styles.frameReviewImage]}>
            {
                !list.length ?
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
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={{fontFamily: 'Digital-7', fontSize: 20, marginTop: 30, color: 'blue'}}>Trở
                                về</Text>
                        </TouchableOpacity>
                    </View> :
                    <FlatList
                        showsHorizontalScrollIndicator={false}
                        data={list}
                        renderItem={ ({item}) => <ItemReview data={item}/>}
                        keyExtractor={(item, index) => index.toString()}
                        initialScrollIndex={indexInit}
                        horizontal={true}
                        pagingEnabled={true}
                    />
            }
        </Animated.View>
    )
}
const ItemReview = ({data}) => {
    const navigation = useNavigation();
    const LG = useSelector(state => state.languages.language)
    const theme = useSelector((state) => state.themes.theme)
    const styles = style(theme)
    const {name, path} = data
    const [src, setSrc] = useState(null)
    const [dateTimeString, setDateTimeString] = useState({ dateString: '',timeString: ''})
    useEffect(() => {
        ALBUM.readImage(path).then((e) => setSrc('data:image/jpg;base64,' + e))
        const { day, month, year, h, m, s } = parseDate( new Date(data.mtime))
        const dateString = `${LG.date} ${day}/${month}/${year}`
        const timeString = `${h} ${LG.hours} ${m} ${LG.minute} ${s}`
        setDateTimeString({...{dateString, timeString}})
    }, [])
    const shareImage = () => {
        try {
            if (Platform.OS === 'android') {
                openChooserWithOptions({imageUrl: data.path, type: "image/jpg"}, "Chia sẽ ảnh");
            }
            if (Platform.OS === 'ios') {
                return Share.share({ url: data.path })
            }
        } catch (e) {
            console.log(e)
        }
    }
    const delImage = () => {
        Alert.alert(
            data.name,
            LG.areYouSureDelete,
            [
                {
                    text: LG.cancel,
                    style: "cancel"
                },
                {
                    text: LG.oke,
                    onPress: () => {
                        ALBUM.deleteImage(path).then(() => navigation.goBack())
                    }
                }
            ],
            {cancelable: false}
        );
    }
    const aniActionBottom = useAnimatedCallback({value:0, listTo:[0, -60], duration:300})
    const bottom = aniActionBottom.value;
    const [aniActionBottomStart, aniActionBottomStop] = aniActionBottom.animates
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
    useEffect(() => {
        animStart.start()
        setTimeout(() => {
            aniActionBottomStop.start()
            aniActionHeaderStop.start()
        }, 2000)
    },[])
    const aniActionHeader = useAnimatedCallback({value:0, listTo:[0, -60], duration:300})
    const top = aniActionHeader.value;
    const [aniActionHeaderStart, aniActionHeaderStop] = aniActionHeader.animates
    const Ani = () => {
        if(bottom._value === 0){
            aniActionBottomStop.start()
            aniActionHeaderStop.start()
        }
        else {
            aniActionBottomStart.start()
            aniActionHeaderStart.start()
        }
    }
    const Out = () =>{
        animStop.start(() => navigation.goBack())
        return true
    }
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', Out);
        return () => BackHandler.removeEventListener('hardwareBackPress', Out);
    }, []);
    return (
        <Animated.View style={{ flex: 1, justifyContent: "center",left }}>
            <View style={styles.opacity}/>
            <Animated.View style={[styles.header, {top}]}>
                <TouchableOpacity
                    onPress={Out}
                >
                    <Icon name="arrow-left" size={25} color={theme.color}/>
                </TouchableOpacity>
                <View style={{marginLeft: 30}}>
                    <Text style={{color:theme.color}}>{name}</Text>
                    <View style={{ flexDirection: 'row'}}>
                        <Text style={{color:theme.color}}>{dateTimeString.timeString} </Text>
                        <Text style={{color:theme.color}}>{dateTimeString.dateString} </Text>
                    </View>
                </View>
            </Animated.View>
            <TouchableOpacity activeOpacity={1} onPress={Ani}>
                <Animated.Image
                    resizeMode={'contain'}
                    style={[styles.image]}
                    defaultSource={require('../../assets/images/logo.png')}
                    source={{uri: src}}
                />
            </TouchableOpacity>
            <Animated.View style={[styles.footer, {bottom}]}>
                <TouchableOpacity
                    onPress={delImage}
                >
                    <FontAwesome5Icon name={'trash'} size={25} color={'red'}/>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={shareImage}
                >
                    <FontAwesome5Icon name={'share'} size={25} color={"#0d71ec"}/>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    )
}
const style = (setTheme) => {
    const {color, backgroundColor, input, button} = setTheme
    return StyleSheet.create({
        frameReviewImage: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor,
        },
        header: {
            borderBottomWidth: 0.5,
            borderColor: '#c4c4c4',
            backgroundColor,
            top: 0,
            width,
            position: 'absolute',
            paddingVertical: 10,
            paddingHorizontal: 30,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        opacity: {
            position: 'absolute',
            height,
            width,
        },
        image: {
            width,
            height: width,
        },
        footer: {
            position: 'absolute',
            flexDirection: 'row',
            borderTopWidth: 0.5,
            borderColor: '#c4c4c4',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            height: 60,
            width,
            backgroundColor:button
        }
    })
}

export default ReviewImage
