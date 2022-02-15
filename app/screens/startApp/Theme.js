import React, {useEffect} from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    BackHandler,
    ScrollView, FlatList, Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setTheme} from '../../redux/reducer/themeReducer';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from '@react-navigation/native';
import {getItemLocalStore, setItemLocalStore} from '../../mFun';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import {NeuButton} from '../NeuView';
import useAnimatedCallback from '../../animated/useAnimatedCallback';

const {width, height} = Dimensions.get('screen');
import Default from '../../assets/images/default.jpg';
import Dark from '../../assets/images/dark.jpg';
import Light from '../../assets/images/light.jpg';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

const data = {
    light: [
        Light,
        Light,
    ],
    dark: [
        Dark,
        Dark,
    ],
    default: [
        Default,
        Default,
    ],
};
const Theme = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
    useEffect(() => {
        animStart.start(() => {
            getItemLocalStore('theme').then((e) => {
                if (!e || !['light', 'dark'].includes(e)) {
                    return dispatch(setTheme('default'));
                }
                dispatch(setTheme(e));
            });
        });
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
    const listTheme = [
        {key:'default', backgroundColor:'#EDF3F8', name:'themeDefault'},
        {key:'light', backgroundColor:'#ffffff', name:'themeLight'},
        {key:'dark', backgroundColor:'#000', name:'themeDark'},
    ]
    const styles = style(theme);
    const Item = (item) => {
        return (
            <View
                style={{
                    borderWidth: 0.5,
                    overflow: 'hidden',
                    borderRadius: 5,
                    marginLeft: 15,
                    borderColor: '#044543',
                }}
            >
                <Image
                    resizeMode={'cover'}
                    style={{
                        height: 2340/4.6,
                        width: 1080/4.6,
                    }}
                    source={item.item}
                />
            </View>
        );
    };
    return (
        <Animated.View style={[styles.frameTheme, {left}]}>
            <View style={styles.header}>
                <NeuButton
                    animatedDisabled={true}
                    onPress={Out}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
            </View>
            <View>
                <Text style={{marginLeft: 15, marginBottom: 15, color: theme.color, fontSize: 24, fontWeight:'700'}}>{LG.preview}</Text>
                <FlatList
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    data={data[theme.name]}
                    renderItem={({item}) => <Item item={item}/>}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
            <View style={styles.chooseThem}>
                <Text style={styles.title}>{LG.chooseATheme}</Text>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={styles.frameItemTheme}>
                    {listTheme.map((e, i) => {
                        const {key, backgroundColor, name} = e
                        return (
                            <View key={i} style={styles.itemTheme}>
                                <TouchableOpacity
                                    onPress={() => setItemLocalStore('theme', key).then(() => {dispatch(setTheme(key))})}
                                    style={[styles.chooseItemTheme, {backgroundColor,}]}
                                >
                                    { theme.name === key ?
                                        <View style={styles.frameCheck}>
                                            <FontAwesome5 name="check-circle" size={25} color={'green'}/>
                                        </View> :
                                        <View style={styles.frameCheck}>
                                            <FontAwesome5Icon name={'circle'} size={25} color={'gray'} />
                                        </View>
                                    }
                                </TouchableOpacity>
                                <Text style={styles.txtItemTheme}>{LG[name]}</Text>
                            </View>
                        )
                    })}
                </ScrollView>
            </View>
        </Animated.View>
    );
};
const style = (setTheme) => {
    const {color, backgroundColor, button} = setTheme;
    return StyleSheet.create({
        frameTheme: {
            flex: 1,
            backgroundColor,
            paddingHorizontal: 15,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
            justifyContent: 'flex-start',
            height: 70,
            width,
        },
        chooseThem: {
            position: 'absolute',
            bottom: 0,
            paddingHorizontal: 10,
            backgroundColor: button,
        },
        title: {
            fontSize: 16,
            fontWeight: '600',
            marginTop: 10,
            paddingHorizontal: 10,
            color,
        },
        frameItemTheme: {
            width,
            height: 100,
            flexDirection: 'column',
            flexWrap: 'wrap',
        },
        itemTheme: {
            height: 100,
            width: 100,
            marginLeft: 10,
        },
        chooseItemTheme: {
            borderWidth: 0.5,
            marginVertical: 10,
            backgroundColor: '#FFF',
            height: 50,
            borderRadius: 4,
            borderColor: '#044543',
        },
        frameCheck: {
            position: 'absolute',
            top: 10,
            right: 10,
            width: 25,
            height: 25,
            borderRadius: 12.5,
        },
        txtItemTheme: {
            fontWeight: 'bold',
            color,
            textAlign: 'center',
        },
        nextSetUp: {
            position: 'absolute',
            bottom: 40,
            right: 40,
            paddingVertical: 15,
            paddingHorizontal: 35,
            borderRadius: 5,
            backgroundColor: button,
        },
    });
};
export default Theme;
