import React, {useEffect} from 'react';
import {Text, View, StyleSheet, TouchableOpacity, Animated, BackHandler, Dimensions} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {setLanguage} from '../../redux/reducer/languageReducer';
import {useNavigation} from '@react-navigation/native';
import {setItemLocalStore} from '../../mFun';
import {NeuButton} from '../NeuView';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import useAnimatedCallback from '../../animated/useAnimatedCallback';
const {width} = Dimensions.get('screen')
const Language = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.themes.theme)
    const LG = useSelector((state) => state.languages.language);
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
    useEffect(() => {
        animStart.start();
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
    const styles = style(theme)
    return (
        <Animated.View style={[styles.frameLanguage, {left}]}>
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
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <Text style={{color:theme.color, marginBottom:15}}>{LG.selectLanguage}</Text>
                <TouchableOpacity
                    onPress={() => {
                        setItemLocalStore('language', 'vietnamese').then(() => {
                            dispatch(setLanguage('vietnamese'));
                        });
                    }}
                    style={styles.chooseLanguage}>
                    <Text style={{color:theme.color}}>{LG.nameLanguage === 'VN' ? 'Tiếng việt' : 'Tiếng việt'}</Text>
                    {LG.nameLanguage === 'VN' ?
                        <View style={styles.frameCheck}>
                            <FontAwesome5 name="check-circle" size={25} color={'green'}/>
                        </View> :
                        <Text style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            borderWidth: 3,
                            borderColor: 'gray',
                            width: 25,
                            height: 25,
                            borderRadius: 12.5,
                            overflow: 'hidden',
                        }}/>
                    }
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        setItemLocalStore('language', 'english').then(() => {
                            dispatch(setLanguage('english'));
                        });
                    }}
                    style={styles.chooseLanguage}>
                    <Text style={{color:theme.color}}>{LG.nameLanguage === 'VN' ? 'English' : 'English'}</Text>
                    {LG.nameLanguage === 'EN' ?
                        <View style={styles.frameCheck}>
                            <FontAwesome5 name="check-circle" size={25} color={'green'}/>
                        </View> :
                        <Text style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            borderWidth: 3,
                            borderColor: 'gray',
                            width: 25,
                            height: 25,
                            borderRadius: 12.5,
                            overflow: 'hidden',
                        }}/>
                    }
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};
const style = (setTheme) => {
    const {backgroundColor,button} = setTheme
    return StyleSheet.create({
        frameLanguage: {
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
        bttChooseLanguage: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FFF',
            width: '100%',
            paddingVertical: 15,
            paddingHorizontal: 25,
            borderRadius: 5,
        },
        nextSetUp: {
            position: 'absolute',
            bottom: 40,
            right: 40,
            paddingVertical: 10,
            paddingHorizontal: 25,
            borderRadius: 15,
            backgroundColor: '#0499f6',
        },
        chooseLanguage: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 50,
            paddingHorizontal: 10,
            backgroundColor: button,
            width: 200,
            marginBottom: 10,
            borderRadius: 10,
        },
        frameCheck: {
            position: 'absolute',
            top: 10,
            right: 10,
            width: 25,
            height: 25,
            borderRadius: 12.5,
        },
    });
}
export default Language;
