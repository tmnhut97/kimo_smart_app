import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    Dimensions,
    StyleSheet,
    Animated,
    BackHandler,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {setNameDev} from '../../../Socket';
import {useSelector} from 'react-redux';
import {NeuButton} from '../../NeuView';
import useAnimatedCallback from '../../../animated/useAnimatedCallback';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Kohana from '../../InputCustom/Kohana';

const {width} = Dimensions.get('screen');
const SetNameAir = () => {
    const navigation = useNavigation();
    const devId = useSelector(state => state.devices.idCurrent);
    const devCurrent = useSelector(state => state.devices.list.find(({id}) => id === devId));
    const [name, setName] = useState('');
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
    useEffect(() => {
        const {name} = devCurrent;
        if (name) {
            setName(name);
        }
        animStart.start();
    }, [devCurrent]);
    const Out = () => {
        animStop.start(() => navigation.goBack());
        return true;
    };
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', Out);
        return () =>
            BackHandler.removeEventListener('hardwareBackPress', Out);
    }, []);
    const actionChangeName = () => {
        navigation.goBack();
        setNameDev(devId, name);
    };
    return (
        <Animated.View style={[styles.frameSetName, {left}]}>
            <View style={styles.header}>
                <NeuButton
                    onPress={Out}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
            </View>
            <View style={{flex: 1, justifyContent: 'center', paddingHorizontal: 30}}>
                <View style={styles.groupTitle}>
                    <Text style={styles.title}>{LG.changeName}</Text>
                </View>
                <NeuButton
                    active={true}
                    style={{marginBottom: 30}}
                    color={theme.newButton}
                    width={width - 60} height={55}
                    borderRadius={15}
                >
                    <Kohana
                        style={styles.ip}
                        label={'Nhập tên thay đổi'}
                        iconClass={MaterialCommunityIcons}
                        iconName={'file-edit'}
                        iconColor={theme.iconInput}
                        inputPadding={16}
                        labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
                        useNativeDriver
                        value={name}
                        inputStyle={{color: theme.color}}
                        onChangeText={text => setName(text)}
                    />
                </NeuButton>
                <NeuButton
                    onPress={actionChangeName}
                    color={theme.newButton}
                    width={width - 60} height={55}
                    borderRadius={30}
                >
                    <Text style={{color: theme.color, fontSize: 16, fontWeight: '700'}}>{LG.confirm}</Text>
                </NeuButton>
            </View>
        </Animated.View>
    );
};
const style = (setTheme) => {
    const {color, backgroundColor, newButton} = setTheme;
    return StyleSheet.create({
        frameSetName: {
            backgroundColor,
            flex: 1,
        },
        header: {
            flexDirection: 'row',
            paddingTop: 25,
            paddingBottom: 10,
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom: 5,
        },
        groupTitle: {
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 30,
        },
        title: {
            color,
            fontSize: 30,
        },
        ip: {
            backgroundColor: newButton,
            width: '100%',
            borderRadius: 15,
        },
    });
};


export default SetNameAir
